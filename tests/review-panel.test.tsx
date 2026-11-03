import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ReviewPanel, { buildPayload } from "@/components/ReviewPanel";
import { DOCUMENTS } from "@/lib/sample-data";
import { loadHistory } from "@/lib/signoff-store";

const doc = DOCUMENTS[0];

describe("buildPayload", () => {
  it("sends masked claim text when airlock is on", () => {
    const payload = buildPayload(doc, "Approved", true);
    expect(payload.airlockOn).toBe(true);
    expect(JSON.stringify(payload)).not.toContain("Jordan Example");
    expect(payload.documentId).toBe("PKT-0001");
  });

  it("sends unmasked text when airlock is off", () => {
    const payload = buildPayload(doc, "Approved", false);
    expect(payload.airlockOn).toBe(false);
    expect(payload.claims.map((c) => c.text)).toEqual(doc.claims.map((c) => c.text));
  });
});

describe("ReviewPanel", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("masks PII in the source by default and unmasks when the toggle is switched off", () => {
    const { container } = render(<ReviewPanel doc={doc} />);
    expect(container.textContent).toContain("[REDACTED]");
    expect(container.textContent).not.toContain("Jordan Example");

    fireEvent.click(screen.getByRole("switch", { name: "Airlock masking" }));
    expect(container.textContent).toContain("Jordan Example");
    expect(screen.getByText("Operator view: unmasked")).toBeTruthy();
  });

  it("sends the sign-off to /api/submit, shows the result, and records history", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ remainingRequests: 4 }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<ReviewPanel doc={doc} />);
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    expect(screen.getByText("Sending Approved…")).toBeTruthy();
    await waitFor(() =>
      expect(screen.getByText(/Approved: recorded by the gateway \(4 requests left/)).toBeTruthy()
    );

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/submit");
    expect(JSON.parse(init.body as string).action).toBe("Approved");

    const history = loadHistory();
    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({ documentId: "PKT-0001", action: "Approved", ok: true });
  });

  it("shows a rate-limit error and records the failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ error: "Too many requests." }), { status: 429 }))
    );

    render(<ReviewPanel doc={doc} />);
    fireEvent.click(screen.getByRole("button", { name: "Request re-filing" }));

    await waitFor(() =>
      expect(screen.getByText(/Request re-filing failed \(HTTP 429\): Too many requests\. Wait 10 seconds/)).toBeTruthy()
    );
    expect(loadHistory()[0]).toMatchObject({ ok: false, action: "Request re-filing" });
  });

  it("shows a network error when the review service is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("network down"); }));

    render(<ReviewPanel doc={doc} />);
    fireEvent.click(screen.getByRole("button", { name: "Flag for manual audit" }));

    await waitFor(() =>
      expect(screen.getByText("Flagged for manual audit failed: could not reach the review service.")).toBeTruthy()
    );
  });
});
