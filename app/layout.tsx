import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Review Queue",
  description: "Verification and audit review interface (sample data)",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans">
        <nav className="flex gap-4 border-b border-slate-200 bg-white px-6 py-3 text-sm">
          <Link href="/" className="font-semibold text-slate-900">Review Queue</Link>
          <Link href="/history" className="text-slate-600 hover:text-slate-900">Sign-off history</Link>
          <span className="ml-auto text-xs text-slate-400">Sample data · no backend storage</span>
        </nav>
        {children}
      </body>
    </html>
  );
}
