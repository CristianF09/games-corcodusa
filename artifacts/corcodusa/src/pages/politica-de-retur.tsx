import { Link } from "wouter";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import { COMPANY } from "@/lib/company-info";

export default function PoliticaDeRetur() {
  return (
    <LegalPage
      title="Politica de Retur și Rambursare"
      subtitle="Condițiile de rambursare pentru conținutul digital de pe platformă"
    >
      <LegalSection title="Natura serviciului: conținut digital">
        <p>
          Accesul la jocurile de pe <strong>{COMPANY.site}</strong> este un serviciu de{" "}
          <strong>furnizare de conținut digital</strong>, activat imediat după confirmarea plății.
        </p>
        <div className="bg-[rgba(255,215,0,0.08)] border border-[#FFD700]/40 rounded-xl p-4">
          <p className="font-semibold text-[#1F2937]">
            Prin activarea imediată a accesului la conținutul digital, utilizatorul își exprimă
            acordul expres privind începerea executării serviciului și ia act că își poate pierde
            dreptul legal de retragere, conform prevederilor aplicabile privind furnizarea de
            conținut digital (OUG 34/2014).
          </p>
        </div>
      </LegalSection>

      <LegalSection title="Situații în care acordăm rambursare">
        <p>Acordăm rambursare integrală în următoarele situații:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Dublă plată</strong> — aceeași achiziție a fost taxată de două ori;</li>
          <li><strong>Eroare tehnică</strong> — plata a fost procesată, dar accesul nu s-a activat;</li>
          <li>
            <strong>Imposibilitatea accesării platformei</strong> — o problemă tehnică de partea
            noastră, nerezolvată într-un termen rezonabil, care te împiedică să folosești serviciul.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Situații în care NU acordăm rambursare">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Utilizatorul s-a răzgândit <strong>după ce a folosit serviciul</strong> (accesul a fost
            activat și jocurile au fost utilizate).
          </li>
        </ul>
        <p>
          Reamintim că accesul plătit este o <strong>plată unică, fără reînnoire automată</strong> —
          nu există riscul unor taxări viitoare nedorite. Poți testa gratuit platforma 7 zile
          înainte de orice plată.
        </p>
      </LegalSection>

      <LegalSection title="Cum soliciți o rambursare">
        <p>
          Trimite un email la{" "}
          <a href={`mailto:${COMPANY.email}`} className="text-[#FF6B00] font-semibold hover:underline">
            {COMPANY.email}
          </a>{" "}
          cu adresa de email a contului și data plății. Analizăm fiecare solicitare în cel mult{" "}
          <strong>14 zile</strong>, iar rambursările aprobate se efectuează prin Stripe, pe cardul
          folosit la plată.
        </p>
      </LegalSection>

      <div className="border-t border-[#E5E7EB] pt-5 text-sm text-[#4B5563]">
        Detalii despre plăți în{" "}
        <Link href="/metode-de-plata" className="text-[#FF6B00] font-semibold hover:underline">
          Metode de Plată
        </Link>
        .
      </div>
    </LegalPage>
  );
}
