import { Link } from "wouter";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import { COMPANY } from "@/lib/company-info";

export default function DespreNoi() {
  return (
    <LegalPage
      title="Despre Games Corcodușa"
      subtitle="Cine suntem și de ce facem jocuri pentru copii"
    >
      <LegalSection title="Misiunea noastră">
        <p>
          <strong>{COMPANY.site}</strong> este o platformă românească de jocuri educaționale
          pentru copii cu vârste între 3 și 10 ani. Credem că cei mici învață cel mai bine prin
          joacă — de aceea fiecare joc combină distracția cu exersarea unor abilități reale:
          numărat, citit, logică, memorie, creativitate și muzică.
        </p>
      </LegalSection>

      <LegalSection title="Ce ne diferențiază">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Fără reclame, niciodată</strong> — un mediu sigur pentru copii;</li>
          <li><strong>100% în limba română</strong> — conținut creat pentru copiii din România;</li>
          <li><strong>Fără instalare</strong> — jocurile rulează direct în browser, pe orice dispozitiv;</li>
          <li><strong>Plată unică, fără abonamente recurente</strong> — nu taxăm automat pe nimeni;</li>
          <li><strong>Jocuri noi adăugate constant</strong>.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Date de contact">
        <p>
          {COMPANY.legalName} · CUI {COMPANY.cui} · {COMPANY.regCom}
        </p>
        <p>
          Email:{" "}
          <a href={`mailto:${COMPANY.email}`} className="text-[#FF6B00] font-semibold hover:underline">
            {COMPANY.email}
          </a>{" "}
          · Telefon: {COMPANY.phone}
        </p>
      </LegalSection>

      <div className="border-t border-[#E5E7EB] pt-5 text-sm text-[#4B5563]">
        Vrei să testezi platforma?{" "}
        <Link href="/pricing" className="text-[#FF6B00] font-semibold hover:underline">
          Începe cu 7 zile gratuite →
        </Link>
      </div>
    </LegalPage>
  );
}
