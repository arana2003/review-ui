// Sample documents only. All names, accounts, and figures are synthetic.

export type CheckStatus = "pass" | "flag" | "fail";

export type Check = {
  id: string;
  label: string;
  status: CheckStatus;
  note: string;
};

export type Claim = {
  id: string;
  text: string;
  page: number;
  span: string;
  confidence: number;
};

export type Page = { n: number; text: string };

export type Doc = {
  id: string;
  title: string;
  pages: Page[];
  claims: Claim[];
  checks: Check[];
};

export const DOCUMENTS: Doc[] = [
  {
    id: "PKT-0001",
    title: "Annual disclosure (synthetic)",
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
    claims: [
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
    ],
    checks: [
      { id: "k1", label: "Entity cross-check", status: "pass", note: "Applicant name matches intake record." },
      { id: "k2", label: "Jurisdictional compliance", status: "pass", note: "California ruleset applied." },
      { id: "k3", label: "Missing disclosure", status: "flag", note: "Board attestation pending; needs operator review." },
      { id: "k4", label: "Exhibit reference", status: "pass", note: "Exhibit B referenced and present." },
    ],
  },
  {
    id: "PKT-0002",
    title: "Quarterly filing (synthetic)",
    pages: [
      { n: 1, text: "Entity Sample Holdings files its quarterly report for the period ending June 30." },
      { n: 2, text: "Net income is reported at $340K. Segment disclosures appear in Note 7." },
    ],
    claims: [
      {
        id: "c1",
        text: "Net income reported at $340K",
        page: 2,
        span: "Net income is reported at $340K",
        confidence: 0.91,
      },
      {
        id: "c2",
        text: "Segment disclosures in Note 7",
        page: 2,
        span: "Segment disclosures appear in Note 7",
        confidence: 0.85,
      },
    ],
    checks: [
      { id: "k1", label: "Entity cross-check", status: "pass", note: "Entity name matches intake record." },
      { id: "k2", label: "Jurisdictional compliance", status: "flag", note: "New York filing rules need a second reviewer." },
      { id: "k3", label: "Missing disclosure", status: "pass", note: "All required sections present." },
    ],
  },
  {
    id: "PKT-0003",
    title: "Board attestation (synthetic)",
    pages: [
      { n: 1, text: "Filer Casey Sample, Acct ending 9012, submits a board attestation from the Oregon office." },
      { n: 2, text: "Signature block left blank. Effective date to be confirmed by counsel." },
    ],
    claims: [
      {
        id: "c1",
        text: "Board attestation submitted",
        page: 1,
        span: "submits a board attestation",
        confidence: 0.7,
      },
    ],
    checks: [
      { id: "k1", label: "Entity cross-check", status: "pass", note: "Filer matches intake record." },
      { id: "k2", label: "Missing disclosure", status: "fail", note: "Board signature not found." },
    ],
  },
];

export function findDocument(id: string): Doc | undefined {
  return DOCUMENTS.find((d) => d.id === id);
}

// Names and account numbers that the airlock masks in the review view.
export const PII_PATTERN = /Jordan Example|Casey Sample|4417|9012/g;

export function redact(text: string, airlockOn: boolean): string {
  return airlockOn ? text.replace(PII_PATTERN, "[REDACTED]") : text;
}

// Queue status: fail beats flag, flag beats pass.
export function documentStatus(doc: Doc): "Needs attention" | "Flagged" | "Ready" {
  if (doc.checks.some((c) => c.status === "fail")) return "Needs attention";
  if (doc.checks.some((c) => c.status === "flag")) return "Flagged";
  return "Ready";
}
