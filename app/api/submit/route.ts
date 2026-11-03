import { NextRequest, NextResponse } from "next/server";

// Forwards a sign-off to the gateway's /api/ingest. Runs on the server so the
// API key never reaches the browser and the browser never makes a cross-origin call.
export async function POST(req: NextRequest) {
  const gatewayUrl = process.env.GATEWAY_URL;
  const apiKey = process.env.GATEWAY_API_KEY;

  if (!gatewayUrl || !apiKey) {
    return NextResponse.json(
      { error: "Gateway is not configured (set GATEWAY_URL and GATEWAY_API_KEY)." },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${gatewayUrl}/api/ingest`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { error: "Gateway is unreachable. Is it running?" },
      { status: 502 }
    );
  }

  const data = await upstream.json().catch(() => ({}));
  const headers: Record<string, string> = {};
  const retryAfter = upstream.headers.get("Retry-After");
  if (retryAfter) headers["Retry-After"] = retryAfter;

  return NextResponse.json(
    {
      error: upstream.ok ? undefined : (data as { error?: string }).error ?? "Gateway error",
      remainingRequests: (data as { remainingRequests?: number }).remainingRequests,
    },
    { status: upstream.status, headers }
  );
}
