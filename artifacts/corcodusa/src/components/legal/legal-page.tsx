import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

/** Shared shell for legal pages — same gradient header + white card layout
    as pages/metode-de-plata.tsx so the whole legal suite looks uniform. */
export function LegalPage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
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

        <div className="max-w-[860px] mx-auto px-6 md:px-10 py-12">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,.08)] p-8 space-y-10">
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/** Numbered/titled section inside a LegalPage card. */
export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-black text-[#1F2937]">{title}</h2>
      <div className="space-y-2.5 text-sm text-[#374151] leading-relaxed">{children}</div>
    </section>
  );
}
