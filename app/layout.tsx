import type { Metadata } from "next";
import Link from "next/link";
import { Plus_Jakarta_Sans, Noto_Serif_JP } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import HeaderUserMenu from "@/components/HeaderUserMenu";
import MobileNav from "@/components/MobileNav";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const jp = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jp",
  display: "swap",
});

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
    <html lang="en" className={`${sans.variable} ${jp.variable}`}>
      <body className="font-sans">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-5 sm:px-6">
          <header className="flex items-center justify-between py-5 sm:py-6">
            <Link
              href="/"
              className="flex items-center gap-3 transition hover:opacity-80"
            >
              <span
                aria-hidden
                className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-white"
              >
                <span className="jp text-base leading-none">日</span>
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-bold tracking-tight text-ink">
                  Nihongo
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted">
                  日本語
                </span>
              </span>
            </Link>
            {/* Desktop nav — Admin moved into the My Profile dropdown. */}
            <nav className="hidden items-center gap-2 text-sm sm:flex">
              <Link
                href="/"
                className="rounded-full px-3 py-1.5 font-medium text-muted transition hover:bg-soft hover:text-primary"
              >
                Modules
              </Link>
              <Link
                href="/reviews"
                className="rounded-full px-3 py-1.5 font-medium text-muted transition hover:bg-soft hover:text-primary"
              >
                My Reviews
              </Link>
              <HeaderUserMenu />
            </nav>

            {/* Mobile hamburger + slide-in panel */}
            <div className="sm:hidden">
              <MobileNav />
            </div>
          </header>
          <main className="flex-1 py-6 sm:py-10">{children}</main>
          <footer className="mt-12 border-t border-border py-6 text-xs text-muted">
            <span className="jp mr-2 text-primary">頑張って</span> — keep going.
          </footer>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
