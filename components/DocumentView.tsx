"use client";

import Link from "next/link";
import ReviewPanel from "@/components/ReviewPanel";
import { findDocument } from "@/lib/sample-data";

export default function DocumentView({ id }: { id: string }) {
  const doc = findDocument(id);

  if (!doc) {
    return (
      <main className="p-6">
        <p className="text-sm text-slate-600">
          No sample document with id {id}.{" "}
          <Link href="/" className="text-indigo-700 underline">Back to the queue</Link>
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <Link href="/" className="text-sm text-indigo-700 hover:underline">← Queue</Link>
        <h1 className="mt-1 text-lg font-semibold">{doc.title}</h1>
        <p className="text-sm text-slate-500">{doc.id}</p>
      </header>
      <ReviewPanel doc={doc} />
    </main>
  );
}
