import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Autorevio - Reviews. Connect. Grow. | AI Review Management Platform",
  description:
    "Turn happy customers into loyal promoters with Autorevio AI. Automated Google reviews, QR-based feedback, auto-replies, and online reputation management.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-slate-900 antialiased font-['Inter',system-ui,sans-serif]">{children}</body>
    </html>
  );
}
