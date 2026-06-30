import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2.5">
      <h2 className="text-lg font-black text-[#1F2937]">{title}</h2>
      <div className="text-sm text-[#374151] leading-relaxed space-y-2.5">{children}</div>
    </section>
  );
}

export default function PoliticaDeConfidentialitate() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F0F4F8]">
      <Navbar />

      <main className="flex-1">
        {/* Gradient header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0A4D68] to-[#2C5F7A]">
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#FF6B00]/20 blur-2xl" />
          <div className="max-w-[1152px] mx-auto px-10 py-10">
            <h1 className="text-4xl font-black text-white">Politica de Confidențialitate</h1>
            <p className="text-white/60 text-base mt-1">
              Cum protejăm și gestionăm datele tale personale pe games.corcodusa.ro
            </p>
          </div>
        </div>

        <div className="max-w-[860px] mx-auto px-6 md:px-10 py-12">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,.08)] p-8 space-y-8">

            <p className="text-[#4B5563] text-base leading-relaxed">
              La <strong className="text-[#1F2937]">Corcodușa.ro</strong> respectăm confidențialitatea
              vizitatorilor și clienților noștri. Această politică explică ce date colectăm pe{" "}
              <strong className="text-[#1F2937]">games.corcodusa.ro</strong>, cum le folosim și ce drepturi
              ai conform legislației în vigoare (Regulamentul (UE) 2016/679 — GDPR).
            </p>

            <Section title="Ce date colectăm">
              <p>Colectăm doar datele necesare pentru crearea contului, acordarea accesului la jocuri și emiterea documentelor fiscale:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>nume și prenume</li>
                <li>adresă de e-mail</li>
                <li>date de facturare (adresă, dacă este cerută de legislația fiscală)</li>
                <li>
                  date de plată — procesate securizat direct de <strong className="text-[#1F2937]">Stripe</strong>;
                  Corcodusa.ro nu stochează niciodată informații despre cardul tău bancar
                </li>
              </ul>
            </Section>

            <Section title="Cum colectăm datele">
              <ul className="list-disc pl-5 space-y-1">
                <li>direct, prin formularul de creare a contului și prin formularul de plată la achiziționarea unui plan;</li>
                <li>automat, prin cookie-uri esențiale pentru funcționarea site-ului și pentru autentificare.</li>
              </ul>
            </Section>

            <Section title="Scopurile prelucrării">
              <p>Datele tale sunt folosite exclusiv pentru:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>crearea și administrarea contului tău;</li>
                <li>procesarea plăților și acordarea accesului la jocurile educaționale achiziționate;</li>
                <li>emiterea documentelor fiscale;</li>
                <li>comunicări legate strict de contul sau comanda ta (confirmare plată, acces la jocuri, eventuale probleme tehnice).</li>
              </ul>
              <p>Nu folosim datele tale pentru campanii promoționale sau publicitate personalizată, decât dacă te-ai abonat explicit la newsletter.</p>
            </Section>

            <Section title="Durata de stocare">
              <ul className="list-disc pl-5 space-y-1">
                <li>Datele fiscale sunt păstrate conform obligațiilor legale din Codul Fiscal (minimum 10 ani).</li>
                <li>Datele contului tău sunt păstrate cât timp contul este activ, sau până la solicitarea ștergerii acestuia.</li>
              </ul>
            </Section>

            <Section title="Divulgarea și transferul datelor">
              <p>Datele tale nu sunt vândute și nu sunt divulgate către terți, cu excepția:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>procesatorului de plăți <strong className="text-[#1F2937]">Stripe</strong>;</li>
                <li>autorităților fiscale, dacă este cazul, conform legii.</li>
              </ul>
              <p>
                Detalii despre metoda de plată acceptată găsești în pagina{" "}
                <Link href="/metode-de-plata" className="text-[#FF6B00] font-semibold hover:underline">
                  Metode de Plată
                </Link>
                .
              </p>
            </Section>

            <Section title="Securitatea datelor">
              <p>Corcodusa.ro utilizează măsuri tehnice și organizatorice adecvate pentru a asigura protecția datelor tale personale.</p>
            </Section>

            <Section title="Drepturile tale conform GDPR">
              <ul className="list-disc pl-5 space-y-1">
                <li>dreptul de acces și informare;</li>
                <li>dreptul de rectificare sau ștergere a datelor;</li>
                <li>dreptul de opoziție și restricționare a prelucrării;</li>
                <li>dreptul la portabilitatea datelor;</li>
                <li>dreptul de a depune plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP).</li>
              </ul>
            </Section>

            <Section title="Cookie-uri">
              <p>
                games.corcodusa.ro folosește cookie-uri strict necesare pentru funcționarea site-ului și
                pentru autentificare. Nu utilizăm cookie-uri de marketing fără acordul tău explicit.
              </p>
            </Section>

            <div className="border-t border-[#E5E7EB] pt-5 text-sm text-[#4B5563]">
              Pentru orice întrebare legată de datele tale personale sau pentru exercitarea drepturilor de
              mai sus, ne poți contacta oricând la{" "}
              <a href="mailto:contact@corcodusa.ro" className="text-[#FF6B00] font-semibold hover:underline">
                contact@corcodusa.ro
              </a>
              .
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
