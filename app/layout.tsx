import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Review Queue",
  description: "Verification and audit review interface (sample data)",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
