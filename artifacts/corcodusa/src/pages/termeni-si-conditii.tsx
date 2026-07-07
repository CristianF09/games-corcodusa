import { Link } from "wouter";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import { COMPANY } from "@/lib/company-info";

export default function TermeniSiConditii() {
  return (
    <LegalPage
      title="Termeni și Condiții"
      subtitle={`Condițiile de utilizare a platformei ${COMPANY.site}`}
    >
      <LegalSection title="1. Datele companiei">
        <p>
          Platforma <strong>{COMPANY.site}</strong> este operată de{" "}
          <strong>{COMPANY.legalName}</strong>, cu următoarele date de identificare:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>CUI: <strong>{COMPANY.cui}</strong></li>
          <li>Nr. Registrul Comerțului: <strong>{COMPANY.regCom}</strong></li>
          <li>Sediul social: {COMPANY.address}</li>
          <li>Email: <a href={`mailto:${COMPANY.email}`} className="text-[#FF6B00] font-semibold hover:underline">{COMPANY.email}</a></li>
          <li>Telefon: {COMPANY.phone}</li>
        </ul>
        <p>
          Utilizarea platformei implică acceptarea integrală a acestor Termeni și Condiții.
        </p>
      </LegalSection>

      <LegalSection title="2. Descrierea serviciului">
        <p>
          <strong>{COMPANY.site}</strong> este o platformă online care oferă acces la jocuri
          educaționale destinate copiilor cu vârste între 3 și 10 ani. Jocurile sunt accesibile
          direct din browser, pe orice dispozitiv, fără instalare și fără reclame.
        </p>
      </LegalSection>

      <LegalSection title="3. Crearea contului">
        <ul className="list-disc pl-5 space-y-1">
          <li>La crearea contului, utilizatorul trebuie să furnizeze date reale și corecte.</li>
          <li>Păstrarea confidențialității parolei este responsabilitatea utilizatorului.</li>
          <li>Este permis un singur cont per utilizator.</li>
          <li>
            Contul trebuie creat de un adult (părinte sau tutore legal) — vezi secțiunea
            „Protecția copiilor".
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Accesul plătit (acces lunar și acces anual)">
        <p>Platforma oferă:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>7 zile gratuite</strong> — perioadă de probă, o singură dată per cont;</li>
          <li><strong>Acces lunar</strong> — 30 de zile de acces complet, plată unică;</li>
          <li><strong>Acces anual</strong> — 365 de zile de acces complet, plată unică.</li>
        </ul>
        <p>
          Fiecare variantă oferă <strong>acces complet la toate jocurile</strong> pe durata
          perioadei de valabilitate. La finalul perioadei, accesul premium{" "}
          <strong>expiră automat</strong>.
        </p>
        <div className="bg-[rgba(255,215,0,0.08)] border border-[#FFD700]/40 rounded-xl p-4">
          <p className="font-semibold text-[#1F2937]">
            Important: accesul plătit NU se reînnoiește automat. Nu reținem datele cardului și nu
            efectuăm nicio taxare ulterioară. După expirare, utilizatorul poate achiziționa manual
            un nou acces lunar sau anual din pagina{" "}
            <Link href="/pricing" className="text-[#FF6B00] hover:underline">Abonamente</Link>.
          </p>
        </div>
      </LegalSection>

      <LegalSection title="5. Perioada gratuită">
        <p>
          Fiecare utilizator beneficiază <strong>o singură dată</strong> de perioada gratuită de
          7 zile, la crearea contului. Perioada gratuită oferă acces complet la toate jocurile și
          nu necesită card bancar.
        </p>
        <p>
          Furnizorul își rezervă dreptul de a limita utilizarea perioadei gratuite în cazul
          identificării unor tentative de fraudă (de exemplu, conturi multiple create de aceeași
          persoană pentru a beneficia repetat de perioada gratuită).
        </p>
      </LegalSection>

      <LegalSection title="6. Plata">
        <p>
          Plata se efectuează online, cu card bancar <strong>Visa</strong> sau{" "}
          <strong>Mastercard</strong>. Plata este procesată securizat prin{" "}
          <strong>Stripe</strong> — datele cardului nu ajung și nu sunt stocate pe serverele
          noastre. Detalii complete în pagina{" "}
          <Link href="/metode-de-plata" className="text-[#FF6B00] font-semibold hover:underline">
            Metode de Plată
          </Link>.
        </p>
      </LegalSection>

      <LegalSection title="7. Accesul la serviciu">
        <p>
          După confirmarea plății, accesul premium se activează <strong>imediat și automat</strong>,
          fără nicio acțiune suplimentară din partea utilizatorului.
        </p>
      </LegalSection>

      <LegalSection title="8. Drepturi de autor">
        <p>
          Toate elementele platformei — jocurile, imaginile, animațiile, sunetele și textele —
          aparțin {COMPANY.legalName} și sunt protejate de legislația privind drepturile de autor.
        </p>
        <p>Este strict interzisă:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>copierea totală sau parțială a conținutului;</li>
          <li>distribuirea către terți;</li>
          <li>revânzarea sau sublicențierea sub orice formă.</li>
        </ul>
      </LegalSection>

      <LegalSection title="9. Licența de utilizare">
        <p>
          Prin achiziționarea accesului, utilizatorul primește o licență{" "}
          <strong>personală, netransmisibilă și neexclusivă</strong> de a utiliza jocurile în scop
          personal, necomercial, pe durata perioadei de acces. Licența nu transferă niciun drept de
          proprietate intelectuală asupra conținutului.
        </p>
      </LegalSection>

      <LegalSection title="10. Protecția copiilor">
        <ul className="list-disc pl-5 space-y-1">
          <li>Platforma este destinată copiilor, însă <strong>contul este creat și administrat de un adult</strong> (părinte sau tutore legal).</li>
          <li>Părintele este responsabil de supravegherea utilizării platformei de către copil.</li>
          <li>Platforma nu conține reclame și nu comunică direct cu copiii.</li>
        </ul>
      </LegalSection>

      <LegalSection title="11. Politica anti-abuz">
        <p>Sunt interzise:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>utilizarea de roboți sau scripturi automate;</li>
          <li>extragerea automată de conținut (scraping);</li>
          <li>decompilarea sau ingineria inversă (reverse engineering) a platformei;</li>
          <li>partajarea contului cu alte persoane.</li>
        </ul>
      </LegalSection>

      <LegalSection title="12. Suspendarea contului">
        <p>Furnizorul poate suspenda sau închide un cont în următoarele situații:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>fraudă sau tentativă de fraudă (inclusiv la plată sau la perioada gratuită);</li>
          <li>distribuirea contului către terți;</li>
          <li>atacuri asupra platformei sau încălcarea politicii anti-abuz.</li>
        </ul>
      </LegalSection>

      <LegalSection title="13. Securitate">
        <ul className="list-disc pl-5 space-y-1">
          <li>Parolele sunt stocate criptat, prin furnizorul de autentificare.</li>
          <li>Întreaga comunicare cu platforma se face prin conexiune securizată HTTPS.</li>
          <li>Plățile sunt procesate exclusiv de Stripe — nu stocăm date de card.</li>
        </ul>
      </LegalSection>

      <LegalSection title="14. Limitarea răspunderii și disponibilitatea serviciului">
        <p>
          Platforma este furnizată „ca atare". Deși depunem toate eforturile pentru o funcționare
          optimă, nu garantăm:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>funcționarea neîntreruptă, 100% din timp;</li>
          <li>lipsa totală a întreruperilor sau erorilor tehnice.</li>
        </ul>
        <p>
          Pot exista perioade de mentenanță planificată sau întreruperi neprevăzute. Vom depune
          eforturi rezonabile pentru remedierea rapidă a oricărei probleme.
        </p>
      </LegalSection>

      <LegalSection title="15. Încetarea accesului">
        <p>
          La expirarea perioadei de acces plătit, accesul Premium încetează automat. Contul rămâne
          activ, dar fără acces la conținutul Premium, până la achiziționarea unui nou acces.
        </p>
      </LegalSection>

      <LegalSection title="16. Modificarea termenilor">
        <p>
          Furnizorul poate modifica acești Termeni și Condiții oricând. Versiunea actualizată se
          publică pe această pagină, iar continuarea utilizării platformei reprezintă acceptarea
          noilor termeni.
        </p>
      </LegalSection>

      <LegalSection title="17. Legea aplicabilă">
        <p>
          Acești termeni sunt guvernați de <strong>legea română</strong>. Eventualele litigii se
          soluționează pe cale amiabilă sau, în caz contrar, de instanțele competente din România.
        </p>
      </LegalSection>

      <div className="border-t border-[#E5E7EB] pt-5 text-sm text-[#4B5563]">
        Întrebări despre acești termeni?{" "}
        <a href={`mailto:${COMPANY.email}`} className="text-[#FF6B00] font-semibold hover:underline">
          {COMPANY.email}
        </a>
      </div>
    </LegalPage>
  );
}
