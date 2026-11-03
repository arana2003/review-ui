"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { type HistoryEntry, clearHistory, loadHistory } from "@/lib/signoff-store";

export default function HistoryPage() {
  // Load after mount: localStorage isn't available during server rendering.
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);

  useEffect(() => {
    setEntries(loadHistory());
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Sign-off history</h1>
          <p className="text-sm text-slate-500">Kept in this browser only.</p>
        </div>
        <div className="flex gap-3 text-sm">
          <Link href="/" className="text-indigo-700 hover:underline">Queue</Link>
          {entries && entries.length > 0 && (
            <button
              type="button"
              onClick={() => {
                clearHistory();
                setEntries([]);
              }}
              className="text-rose-700 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      {entries === null ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-slate-500">No sign-offs yet. Open a document from the queue to record one.</p>
      ) : (
        <ul className="space-y-2">
          {entries.map((e, i) => (
            <li
              key={`${e.at}-${i}`}
              className="rounded border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {e.documentId} · {e.action}
                </span>
                <span className={e.ok ? "text-emerald-700" : "text-rose-700"}>
                  {e.ok ? "recorded" : "failed"}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                {new Date(e.at).toLocaleString()} · {e.detail}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
