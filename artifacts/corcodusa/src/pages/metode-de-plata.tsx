import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ShieldCheck, CreditCard, Lock, FileText } from "lucide-react";

export default function MetodeDePlata() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F0F4F8]">
      <Navbar />

      <main className="flex-1">
        {/* Gradient header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0A4D68] to-[#2C5F7A]">
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#FF6B00]/20 blur-2xl" />
          <div className="max-w-[1152px] mx-auto px-10 py-10">
            <h1 className="text-4xl font-black text-white">Metode de Plată</h1>
            <p className="text-white/60 text-base mt-1">
              Cum poți plăti accesul la jocurile educaționale de pe games.corcodusa.ro
            </p>
          </div>
        </div>

        <div className="max-w-[860px] mx-auto px-6 md:px-10 py-12">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,.08)] p-8 space-y-10">

            <p className="text-[#4B5563] text-base leading-relaxed">
              Produsele de pe <strong className="text-[#1F2937]">games.corcodusa.ro</strong> (accesul la
              jocurile educaționale) pot fi achiziționate printr-o singură metodă de plată, descrisă mai jos.
            </p>

            {/* Card payment */}
            <section className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="h-9 w-9 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center">
                  <CreditCard className="h-4.5 w-4.5 text-[#FF6B00]" />
                </span>
                <h2 className="text-lg font-black text-[#1F2937]">Plată cu cardul bancar</h2>
              </div>
              <ul className="space-y-2.5 text-sm text-[#374151] pl-1">
                <li>
                  Plata se efectuează <strong className="text-[#1F2937]">online</strong>, în condiții de
                  siguranță deplină, folosind un card emis sub sigla <strong>VISA</strong> (Classic sau
                  Electron) sau <strong>MASTERCARD</strong> (inclusiv Maestro).
                </li>
                <li>Nu percepem niciun comision suplimentar pentru tranzacție.</li>
                <li>
                  Procesarea plăților este realizată integral de platforma securizată{" "}
                  <strong className="text-[#1F2937]">Stripe.com</strong>.
                </li>
                <li>
                  Toate plățile se efectuează în <strong>LEI (RON)</strong>, la cursul de schimb stabilit de
                  banca emitentă a cardului. Tranzacția va apărea pe extrasul dvs. de cont sub denumirea{" "}
                  <strong className="text-[#1F2937]">CORCODUSA.RO</strong>.
                </li>
              </ul>
              <div className="flex items-start gap-2.5 bg-[rgba(37,184,56,0.08)] border border-[#25B838]/25 rounded-xl p-4">
                <Lock className="h-4 w-4 text-[#16A34A] mt-0.5 shrink-0" />
                <p className="text-sm text-[#15803D] font-medium">
                  Datele cardului tău NU sunt stocate pe serverele Corcodușa.ro. Acestea sunt transmise
                  criptat, direct către banca procesatoare, printr-o conexiune securizată administrată de
                  Stripe.
                </p>
              </div>
            </section>

            {/* What you get */}
            <section className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="h-9 w-9 rounded-xl bg-[#0A4D68]/10 flex items-center justify-center">
                  <ShieldCheck className="h-4.5 w-4.5 text-[#0A4D68]" />
                </span>
                <h2 className="text-lg font-black text-[#1F2937]">Ce primești după plată</h2>
              </div>
              <ul className="space-y-2.5 text-sm text-[#374151] pl-1">
                <li>Accesul premium la toate cele 10 jocuri se activează automat, imediat după confirmarea plății.</li>
                <li>
                  Planul <strong className="text-[#1F2937]">lunar</strong> îți oferă 30 de zile de acces,
                  iar planul <strong className="text-[#1F2937]">anual</strong> îți oferă 365 de zile de acces
                  — fiecare este o <strong>plată unică</strong>, nu un abonament recurent: nu reținem datele
                  cardului pentru taxări viitoare și nu se efectuează nicio reînnoire automată.
                </li>
                <li>
                  Dacă dorești să continui după expirarea perioadei, alegi din nou planul potrivit din{" "}
                  <Link href="/pricing" className="text-[#FF6B00] font-semibold hover:underline">
                    pagina de Abonamente
                  </Link>
                  .
                </li>
              </ul>
            </section>

            {/* Data needed */}
            <section className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="h-9 w-9 rounded-xl bg-[#0A4D68]/10 flex items-center justify-center">
                  <FileText className="h-4.5 w-4.5 text-[#0A4D68]" />
                </span>
                <h2 className="text-lg font-black text-[#1F2937]">Date necesare la finalizarea plății</h2>
              </div>
              <p className="text-sm text-[#374151]">
                Pentru a finaliza o comandă pe games.corcodusa.ro, este necesar să furnizezi următoarele date:
              </p>
              <ul className="space-y-1.5 text-sm text-[#374151] list-disc pl-5">
                <li>nume și prenume</li>
                <li>adresă de e-mail</li>
                <li>adresă de facturare (doar dacă legislația fiscală o cere)</li>
                <li>date firmă (CUI, adresă) — doar pentru persoane juridice</li>
              </ul>
              <p className="text-sm font-semibold text-[#16A34A]">
                ⚠️ Nu solicităm CNP pentru persoane fizice.
              </p>
              <p className="text-sm text-[#4B5563] leading-relaxed">
                Prin finalizarea comenzii, îți exprimi acordul pentru colectarea și prelucrarea acestor date
                exclusiv în scopul procesării plății și emiterii documentelor fiscale, conform legislației în
                vigoare (GDPR). Detalii complete în{" "}
                <Link href="/politica-de-confidentialitate" className="text-[#FF6B00] font-semibold hover:underline">
                  Politica de Confidențialitate
                </Link>
                .
              </p>
            </section>

            <div className="border-t border-[#E5E7EB] pt-5 text-sm text-[#4B5563]">
              Întrebări despre o plată?{" "}
              <a href="mailto:contact@corcodusa.ro" className="text-[#FF6B00] font-semibold hover:underline">
                contact@corcodusa.ro
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
