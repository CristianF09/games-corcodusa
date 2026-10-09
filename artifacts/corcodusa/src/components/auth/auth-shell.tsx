import type { ReactNode } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

/** Layout comun pentru paginile de cont (login, înregistrare, resetare). */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F0F4F8]">
      <Navbar />

      <main className="flex-1">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0A4D68] to-[#2C5F7A]">
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#FF6B00]/20 blur-2xl" />
          <div className="max-w-[1152px] mx-auto px-10 py-10">
            <h1 className="text-4xl font-black text-white">{title}</h1>
            <p className="text-white/60 text-base mt-1">{subtitle}</p>
          </div>
        </div>

        <div className="max-w-[460px] mx-auto px-6 py-12">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,.08)] p-8 space-y-6">
            {children}
          </div>
          {footer && <div className="mt-6 text-center text-sm text-[#4B5563] space-y-2">{footer}</div>}
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-[#4B5563] hover:text-[#FF6B00] transition-colors">
              ← Înapoi la pagina principală
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
      {message}
    </p>
  );
}

/** Adresa de întoarcere după login (?next=...), doar căi locale. */
export function getNextPath(fallback: string): string {
  const next = new URLSearchParams(window.location.search).get("next");
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return fallback;
}
