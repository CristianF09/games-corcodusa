import { useState } from "react";
import { Link } from "wouter";
import { readConsent, writeConsent } from "@/lib/consent";

/** Banner de consimțământ pentru cookie-uri. Afișat până la prima alegere. */
export function CookieConsent() {
  const [visible, setVisible] = useState(() => readConsent() === null);

  if (!visible) return null;

  function decide(optional: boolean) {
    writeConsent({ functional: optional, analytics: optional });
    setVisible(false);
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Consimțământ pentru cookie-uri"
      className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-xl rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0px_8px_30px_rgba(0,0,0,.18)] md:inset-x-auto md:right-6 md:bottom-6 md:mx-0"
    >
      <p className="text-sm leading-relaxed text-[#1F2937]">
        Folosim cookie-uri esențiale pentru autentificare și funcționarea platformei. Cu acordul
        tău, putem folosi și cookie-uri funcționale și de analiză. Detalii în{" "}
        <Link href="/politica-cookie" className="font-semibold text-[#FF6B00] hover:underline">
          Politica Cookie
        </Link>
        .
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        {/* Refuzul are aceeași pondere vizuală ca acceptul (cerință GDPR / ePrivacy). */}
        <button
          type="button"
          onClick={() => decide(false)}
          className="flex-1 rounded-xl border-2 border-[#0A4D68] bg-white px-4 py-2.5 text-sm font-bold text-[#0A4D68] transition-colors hover:bg-[#0A4D68]/5"
        >
          Doar esențiale
        </button>
        <button
          type="button"
          onClick={() => decide(true)}
          className="flex-1 rounded-xl bg-[#FF6B00] px-4 py-2.5 text-sm font-bold text-white shadow transition-colors hover:bg-[#E65F00]"
        >
          Acceptă toate
        </button>
      </div>
    </div>
  );
}
