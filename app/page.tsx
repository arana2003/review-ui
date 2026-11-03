"use client";

import { useMemo, useState } from "react";

// Sample data only. Not client records.
const SAMPLE_DOCUMENT = {
  id: "PKT-0001",
  title: "Sample disclosure packet (synthetic)",
  pages: [
    {
      n: 1,
      text: "Applicant Jordan Example, Acct ending 4417, submits the attached disclosure for the 2026 reporting period.",
    },
    {
      n: 2,
      text: "Revenue recognized under ASC 606 totals $1.2M. Risk factors are attached as Exhibit B and reviewed annually.",
    },
    {
      n: 3,
      text: "Board attestation pending. Jurisdiction: California. Contact: [REDACTED] for further questions.",
    },
  ],
};

type ClaimStatus = "pass" | "flag" | "fail";

const SAMPLE_CLAIMS: {
  id: string;
  text: string;
  page: number;
  span: string;
  confidence: number;
}[] = [
  {
    id: "c1",
    text: "Revenue recognized under ASC 606 totals $1.2M",
    page: 2,
    span: "Revenue recognized under ASC 606 totals $1.2M",
    confidence: 0.94,
  },
  {
    id: "c2",
    text: "Risk factors attached as Exhibit B",
    page: 2,
    span: "Risk factors are attached as Exhibit B",
    confidence: 0.88,
  },
  {
    id: "c3",
    text: "Board attestation status",
    page: 3,
    span: "Board attestation pending",
    confidence: 0.61,
  },
];

const SAMPLE_CHECKS: {
  id: string;
  label: string;
  status: ClaimStatus;
  note: string;
}[] = [
  {
    id: "k1",
    label: "Entity cross-check",
    status: "pass",
    note: "Applicant name matches intake record.",
  },
  {
    id: "k2",
    label: "Jurisdictional compliance",
    status: "pass",
    note: "California ruleset applied.",
  },
  {
    id: "k3",
    label: "Missing disclosure",
    status: "flag",
    note: "Board attestation pending; needs operator review.",
  },
  {
    id: "k4",
    label: "Exhibit reference",
    status: "pass",
    note: "Exhibit B referenced and present.",
  },
];

const STATUS_STYLE: Record<ClaimStatus, string> = {
  pass: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
  flag: "bg-amber-100 text-amber-900 ring-amber-600/30",
  fail: "bg-rose-100 text-rose-800 ring-rose-600/20",
};

const PII_PATTERN = /Jordan Example|4417/g;

function highlight(text: string, span: string | null) {
  if (!span) return [text];
  const idx = text.indexOf(span);
  if (idx === -1) return [text];
  return [
    text.slice(0, idx),
    <mark key="h" className="rounded bg-yellow-200 px-0.5">
      {span}
    </mark>,
    text.slice(idx + span.length),
  ];
}

export default function ReviewPage() {
  const [activeClaim, setActiveClaim] = useState<string | null>("c3");
  const [airlockOn, setAirlockOn] = useState(true);
  const [log, setLog] = useState<string[]>([]);
  const [decision, setDecision] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const activeSpan = useMemo(
    () => SAMPLE_CLAIMS.find((c) => c.id === activeClaim)?.span ?? null,
    [activeClaim]
  );

  const activePage = SAMPLE_CLAIMS.find((c) => c.id === activeClaim)?.page;

  function redact(text: string) {
    return airlockOn ? text.replace(PII_PATTERN, "[REDACTED]") : text;
  }

  async function act(action: string) {
    if (submitting) return;
    setSubmitting(true);
    setResult(null);
    setDecision(action);
    const time = new Date().toLocaleTimeString();

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          documentId: SAMPLE_DOCUMENT.id,
          action,
          airlockOn,
          // Send the same masked text the operator sees.
          claims: SAMPLE_CLAIMS.map((c) => ({
            id: c.id,
            text: redact(c.text),
            confidence: c.confidence,
          })),
          checks: SAMPLE_CHECKS.map((k) => ({ id: k.id, status: k.status })),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        remainingRequests?: number;
      };

      if (res.ok) {
        setResult({
          ok: true,
          text: `${action}: recorded by the gateway (${data.remainingRequests ?? 0} requests left in this window).`,
        });
        setLog((prev) => [`${time}  ${action}  recorded (${SAMPLE_DOCUMENT.id})`, ...prev]);
      } else {
        const retry = res.status === 429 ? " Wait 10 seconds, then try again." : "";
        setResult({
          ok: false,
          text: `${action} failed (HTTP ${res.status}): ${data.error ?? "unknown error"}${retry}`,
        });
        setLog((prev) => [
          `${time}  ${action}  FAILED ${res.status} (${SAMPLE_DOCUMENT.id})`,
          ...prev,
        ]);
      }
    } catch {
      setResult({ ok: false, text: `${action} failed: could not reach the review service.` });
      setLog((prev) => [`${time}  ${action}  FAILED network (${SAMPLE_DOCUMENT.id})`, ...prev]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">Review Queue</h1>
          <p className="text-sm text-slate-500">
            {SAMPLE_DOCUMENT.title} · {SAMPLE_DOCUMENT.id}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-slate-600">Airlock masking</span>
          <button
            type="button"
            role="switch"
            aria-checked={airlockOn}
            onClick={() => setAirlockOn((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              airlockOn ? "bg-emerald-600" : "bg-slate-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                airlockOn ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
          <span
            className={`text-xs font-medium ${
              airlockOn ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {airlockOn ? "PII redacted" : "Operator view: unmasked"}
          </span>
        </label>
      </header>

      <div className="grid gap-4 p-6 lg:grid-cols-2">
        {/* Left: source document with highlighted span */}
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Source document
          </h2>
          <div className="space-y-4">
            {SAMPLE_DOCUMENT.pages.map((p) => (
              <div
                key={p.n}
                className={`rounded border p-3 text-sm leading-relaxed ${
                  activePage === p.n
                    ? "border-indigo-300 bg-indigo-50/40"
                    : "border-slate-200"
                }`}
              >
                <div className="mb-1 text-xs text-slate-400">Page {p.n}</div>
                <p>
                  {highlight(
                    redact(p.text),
                    activePage === p.n && activeSpan ? redact(activeSpan) : null
                  )}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Right: claims, checks, sign-off */}
        <section className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Extracted claims
            </h2>
            <ul className="space-y-2">
              {SAMPLE_CLAIMS.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setActiveClaim(c.id)}
                    className={`flex w-full items-center justify-between rounded border px-3 py-2 text-left text-sm transition ${
                      activeClaim === c.id
                        ? "border-indigo-400 bg-indigo-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span>{redact(c.text)}</span>
                    <span className="ml-3 shrink-0 tabular-nums text-xs text-slate-500">
                      {Math.round(c.confidence * 100)}%
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Verification checks
            </h2>
            <ul className="space-y-2">
              {SAMPLE_CHECKS.map((k) => (
                <li
                  key={k.id}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <div>
                    <div className="font-medium">{k.label}</div>
                    <div className="text-slate-500">{k.note}</div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLE[k.status]}`}
                  >
                    {k.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Sign-off
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => act("Approved")}
                disabled={submitting}
                className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => act("Request re-filing")}
                disabled={submitting}
                className="rounded border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
              >
                Request re-filing
              </button>
              <button
                onClick={() => act("Flagged for manual audit")}
                disabled={submitting}
                className="rounded border border-amber-400 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-50"
              >
                Flag for manual audit
              </button>
            </div>
            {submitting && (
              <p role="status" className="mt-3 text-sm text-slate-500">
                Sending {decision}…
              </p>
            )}
            {!submitting && result && (
              <p
                role="status"
                className={`mt-3 text-sm ${result.ok ? "text-emerald-700" : "text-rose-700"}`}
              >
                {result.text}
              </p>
            )}
            <ol className="mt-4 space-y-1 font-mono text-xs text-slate-600">
              {log.length === 0 ? (
                <li className="text-slate-400">No actions logged yet.</li>
              ) : (
                log.map((entry, i) => <li key={i}>{entry}</li>)
              )}
            </ol>
          </div>
        </section>
      </div>
    </main>
  );
}
