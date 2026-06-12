import type { Metadata } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";
import HeaderUserMenu from "@/components/HeaderUserMenu";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nihongo — 日本語",
  description: "A small space for studying Japanese.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Serif+JP:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6">
          <header className="flex items-center justify-between border-b border-border py-6">
            <Link href="/" className="flex items-baseline gap-3">
              <span className="jp text-2xl tracking-wide">日本語</span>
              <span className="text-sm uppercase tracking-[0.25em] text-muted">
                Nihongo
              </span>
            </Link>
            <nav className="flex items-center gap-5 text-sm text-muted">
              <Link href="/" className="hover:text-ink">
                Modules
              </Link>
              <Link href="/admin" className="hover:text-ink">
                Admin
              </Link>
              <HeaderUserMenu />
            </nav>
          </header>
          <main className="flex-1 py-10">{children}</main>
          <footer className="border-t border-border py-6 text-xs text-muted">
            <span className="jp mr-2">頑張って</span> — keep going.
          </footer>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
