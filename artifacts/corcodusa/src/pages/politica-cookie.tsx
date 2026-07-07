import { Link } from "wouter";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import { COMPANY } from "@/lib/company-info";

export default function PoliticaCookie() {
  return (
    <LegalPage
      title="Politica Cookie"
      subtitle={`Ce cookie-uri folosește ${COMPANY.site} și de ce`}
    >
      <LegalSection title="Ce sunt cookie-urile?">
        <p>
          Cookie-urile sunt fișiere text de mici dimensiuni, stocate de browser pe dispozitivul
          tău, care permit platformei să funcționeze corect și să-și amintească anumite informații
          între vizite (de exemplu, faptul că ești autentificat).
        </p>
      </LegalSection>

      <LegalSection title="Cookie-uri esențiale">
        <p>
          Sunt strict necesare pentru funcționarea platformei și <strong>nu necesită
          consimțământ</strong>, conform legislației:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Cookie-uri de autentificare</strong> — setate de furnizorul nostru de
            autentificare (Clerk) pentru a menține sesiunea contului tău activă și securizată.
          </li>
          <li>
            <strong>Cookie-uri de sesiune</strong> — rețin starea navigării pe durata vizitei.
          </li>
          <li>
            <strong>Cookie-uri de plată</strong> — setate de procesatorul de plăți Stripe la
            finalizarea unei plăți, pentru securitatea și prevenirea fraudei tranzacției.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Cookie-uri funcționale">
        <p>
          Rețin preferințele tale (de exemplu, setări de sunet în jocuri) pentru o experiență mai
          bună. Acestea nu colectează date în scopuri publicitare.
        </p>
      </LegalSection>

      <LegalSection title="Cookie-uri de analiză (analytics)">
        <p>
          În prezent, platforma <strong>nu folosește cookie-uri de analiză sau publicitate</strong>.
          Dacă vom introduce instrumente de analiză în viitor, această pagină va fi actualizată,
          iar consimțământul tău va fi solicitat printr-un banner de cookie-uri înainte de
          activarea lor.
        </p>
      </LegalSection>

      <LegalSection title="Cum poți controla cookie-urile">
        <p>
          Poți șterge sau bloca cookie-urile din setările browserului tău. Reține însă că blocarea
          cookie-urilor esențiale va împiedica autentificarea și utilizarea platformei.
        </p>
      </LegalSection>

      <div className="border-t border-[#E5E7EB] pt-5 text-sm text-[#4B5563]">
        Mai multe despre datele tale în{" "}
        <Link href="/politica-de-confidentialitate" className="text-[#FF6B00] font-semibold hover:underline">
          Politica de Confidențialitate
        </Link>
        . Întrebări:{" "}
        <a href={`mailto:${COMPANY.gdprEmail}`} className="text-[#FF6B00] font-semibold hover:underline">
          {COMPANY.gdprEmail}
        </a>
      </div>
    </LegalPage>
  );
}
