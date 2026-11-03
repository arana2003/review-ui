import { describe, expect, it } from "vitest";
import { DOCUMENTS, documentStatus, findDocument, redact } from "@/lib/sample-data";

describe("redact (airlock masking)", () => {
  it("masks names and account numbers when airlock is on", () => {
    const text = "Applicant Jordan Example, Acct ending 4417, and Casey Sample, 9012.";
    expect(redact(text, true)).toBe("Applicant [REDACTED], Acct ending [REDACTED], and [REDACTED], [REDACTED].");
  });

  it("leaves text unchanged when airlock is off", () => {
    const text = "Applicant Jordan Example, Acct ending 4417.";
    expect(redact(text, false)).toBe(text);
  });
});

describe("documentStatus", () => {
  it("reports Needs attention when any check fails", () => {
    expect(documentStatus(findDocument("PKT-0003")!)).toBe("Needs attention");
  });

  it("reports Flagged when a check is flagged but none fail", () => {
    expect(documentStatus(findDocument("PKT-0002")!)).toBe("Flagged");
  });

  it("reports Ready when every check passes", () => {
    const ready = { ...DOCUMENTS[1], checks: DOCUMENTS[1].checks.map((c) => ({ ...c, status: "pass" as const })) };
    expect(documentStatus(ready)).toBe("Ready");
  });
});

describe("findDocument", () => {
  it("finds a document by id and returns undefined for an unknown id", () => {
    expect(findDocument("PKT-0001")?.title).toMatch(/Annual disclosure/);
    expect(findDocument("PKT-9999")).toBeUndefined();
  });
});
