import Link from "next/link";
import { DOCUMENTS, documentStatus } from "@/lib/sample-data";

const BADGE = {
  "Needs attention": "bg-rose-100 text-rose-800 ring-rose-600/20",
  Flagged: "bg-amber-100 text-amber-900 ring-amber-600/30",
  Ready: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
} as const;

export default function QueuePage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <h1 className="mb-1 text-lg font-semibold">Review queue</h1>
      <p className="mb-4 text-sm text-slate-500">Sample documents only.</p>
      <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {DOCUMENTS.map((doc) => {
          const status = documentStatus(doc);
          return (
            <li key={doc.id}>
              <Link
                href={`/documents/${doc.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
              >
                <div>
                  <div className="font-medium">{doc.title}</div>
                  <div className="text-xs text-slate-500">
                    {doc.id} · {doc.claims.length} claims · {doc.checks.length} checks
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${BADGE[status]}`}>
                  {status}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
