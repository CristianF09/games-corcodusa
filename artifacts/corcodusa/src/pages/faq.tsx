import { Link } from "wouter";
import { LegalPage } from "@/components/legal/legal-page";
import { COMPANY } from "@/lib/company-info";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "Cum activez perioada gratuită de 7 zile?",
    a: (
      <>
        Simplu: creezi un cont gratuit. Perioada de probă de 7 zile se activează automat la
        înregistrare, fără card bancar, și îți oferă acces complet la toate jocurile.
      </>
    ),
  },
  {
    q: "Pot avea mai multe conturi?",
    a: (
      <>
        Nu. Este permis un singur cont per utilizator. Conturile multiple create pentru a
        beneficia repetat de perioada gratuită pot fi suspendate.
      </>
    ),
  },
  {
    q: "Pot împărți contul cu altcineva?",
    a: (
      <>
        Nu. Contul este personal și netransmisibil. Îl poți folosi însă pe orice dispozitiv al
        familiei tale (telefon, tabletă, laptop).
      </>
    ),
  },
  {
    q: "Ce se întâmplă după cele 7 zile gratuite?",
    a: (
      <>
        Accesul la jocuri se oprește automat — nu ești taxat și nu ți se cere nimic. Dacă vrei să
        continui, alegi <strong>accesul lunar</strong> sau <strong>accesul anual</strong> din
        pagina <Link href="/pricing" className="text-[#FF6B00] font-semibold hover:underline">Abonamente</Link>.
      </>
    ),
  },
  {
    q: "Se reînnoiește automat accesul plătit?",
    a: (
      <>
        <strong>Nu.</strong> Plata este unică — nu reținem datele cardului și nu efectuăm nicio
        taxare ulterioară. La expirare, accesul premium se oprește automat.
      </>
    ),
  },
  {
    q: "Cum cumpăr din nou după ce expiră accesul?",
    a: (
      <>
        Intri în contul tău, mergi la pagina{" "}
        <Link href="/pricing" className="text-[#FF6B00] font-semibold hover:underline">Abonamente</Link>{" "}
        și alegi din nou varianta dorită (lunar sau anual). Accesul se activează imediat după plată.
      </>
    ),
  },
  {
    q: "Cu ce pot plăti?",
    a: (
      <>
        Cu card bancar Visa sau Mastercard, procesat securizat prin Stripe. Detalii în{" "}
        <Link href="/metode-de-plata" className="text-[#FF6B00] font-semibold hover:underline">
          Metode de Plată
        </Link>.
      </>
    ),
  },
  {
    q: "Pot primi banii înapoi?",
    a: (
      <>
        Da, în situații precum dublă plată sau erori tehnice — vezi{" "}
        <Link href="/politica-de-retur" className="text-[#FF6B00] font-semibold hover:underline">
          Politica de Retur și Rambursare
        </Link>.
      </>
    ),
  },
  {
    q: "Pe ce dispozitive funcționează jocurile?",
    a: (
      <>
        Pe orice dispozitiv cu browser modern: telefon, tabletă, laptop sau desktop. Nu este
        nevoie de nicio instalare.
      </>
    ),
  },
];

export default function Faq() {
  return (
    <LegalPage
      title="Întrebări frecvente"
      subtitle={`Răspunsuri rapide despre ${COMPANY.site}`}
    >
      <Accordion type="single" collapsible className="w-full">
        {FAQS.map((f, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-left text-base font-bold text-[#1F2937]">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-[#374151] leading-relaxed">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="border-t border-[#E5E7EB] pt-5 text-sm text-[#4B5563]">
        Nu ți-am răspuns la întrebare? Scrie-ne la{" "}
        <a href={`mailto:${COMPANY.email}`} className="text-[#FF6B00] font-semibold hover:underline">
          {COMPANY.email}
        </a>
      </div>
    </LegalPage>
  );
}
