import { useAuth, useClerk } from "@clerk/react";
import { useLocation } from "wouter";
import {
  useListGames,
  useListProducts,
  useCreateCheckoutSession,
} from "@workspace/api-client-react";
import { GameCard } from "@/components/game-card";
import { STATIC_GAMES } from "@/lib/static-games";
import { Footer } from "@/components/layout/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2 } from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

/* ─────────────────────────────────────────────────────────────────────────── */

function PricingSection() {
  const { data: products, isLoading } = useListProducts();
  const createCheckout = useCreateCheckoutSession();
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const [, setLocation] = useLocation();

  const monthly = products?.find((p) => p.interval === "month");
  const annual = products?.find((p) => p.interval === "year");

  const handleFree = () => {
    if (!isSignedIn) {
      openSignIn({ forceRedirectUrl: "/#games", signUpForceRedirectUrl: "/#games" });
      return;
    }
    setLocation("/games/1");
  };

  const handleSubscribe = (priceId: string | undefined, interval: string | undefined) => {
    if (!priceId) return;
    if (!isSignedIn) {
      openSignIn({ forceRedirectUrl: "/pricing", signUpForceRedirectUrl: "/pricing" });
      return;
    }
    createCheckout.mutate(
      { data: { priceId, interval } },
      { onSuccess: (d) => { window.location.href = d.url; } },
    );
  };

  const features = [
    "Acces la toate cele 10 jocuri",
    "Fără reclame niciodată",
    "Jocuri noi lunar",
    "Funcționează pe orice dispozitiv",
  ];

  return (
    <section id="pricing" className="py-16 md:py-24 bg-[#F0F4F8]">
      <div className="max-w-[1100px] mx-auto px-6 md:px-10">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-[#1F2937] mb-3">
            Alege planul tău
          </h2>
          <p className="text-[#4B5563] text-lg max-w-xl mx-auto">
            Începe gratuit, fără obligații.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 items-center">

          {/* FREE */}
          <div className="bg-white rounded-2xl border-2 border-[#22C55E] overflow-hidden shadow-[0px_8px_30px_rgba(34,197,94,.12)]">
            <div className="bg-gradient-to-r from-[#15803D] to-[#22C55E] px-6 py-5 text-center">
              <span className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-black px-3 py-1 rounded-lg mb-2">
                🎉 FĂRĂ CARD
              </span>
              <h3 className="text-lg font-black text-white">7 Zile Gratuit</h3>
              <p className="text-white/75 text-xs mt-1">Fără nicio obligație</p>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="text-center">
                <span className="text-5xl font-black text-[#1F2937]">0</span>
                <span className="text-xl font-black text-[#1F2937] ml-1">Lei</span>
                <p className="text-xs text-[#9CA3AF] mt-1">7 zile · fără card</p>
              </div>
              <ul className="space-y-2.5">
                {["Acces la toate jocurile", "Fără reclame", "Fără card bancar", "Accesul expiră după 7 zile"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#374151]">
                    <CheckCircle2 className="h-4 w-4 text-[#22C55E] shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={handleFree}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#15803D] to-[#22C55E] text-white font-black text-sm shadow-[0px_6px_18px_rgba(34,197,94,.35)] hover:shadow-[0px_10px_25px_rgba(34,197,94,.50)] transition-all"
              >
                Începe gratuit →
              </button>
            </div>
          </div>

          {/* ANNUAL – featured */}
          <div
            className="relative bg-white rounded-2xl overflow-hidden md:-translate-y-4 shadow-[0px_20px_60px_-10px_rgba(255,107,0,.25)]"
            style={{ outline: "2px solid #FF6B00" }}
          >
            <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF9A3C] px-6 py-5 relative overflow-hidden">
              <div className="pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full bg-white/10" />
              <span className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-black px-3 py-1 rounded-lg mb-2">
                ⭐ CEL MAI BUN · -25%
              </span>
              <h3 className="text-lg font-black text-white">Abonament Anual</h3>
              <p className="text-white/75 text-xs mt-1">Cel mai mic preț / lună</p>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <div className="flex items-end gap-1">
                  {isLoading ? <Skeleton className="h-12 w-24 rounded-lg" /> : (
                    <>
                      <span className="text-5xl font-black text-[#1F2937]">
                        {annual ? Math.round(annual.amount / 100) : 603}
                      </span>
                      <div className="mb-1">
                        <span className="text-xl font-black text-[#1F2937]">Lei</span>
                        <p className="text-xs text-[#9CA3AF]">/ an</p>
                      </div>
                    </>
                  )}
                </div>
                <p className="text-xs text-[#9CA3AF]">
                  <span className="line-through">804 Lei</span>{" "}
                  <span className="font-bold text-[#FF6B00]">economisești 25%</span>
                </p>
                <p className="text-xs font-semibold text-[#22C55E] mt-1">✓ Include 7 zile gratuite</p>
              </div>
              <ul className="space-y-2.5">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#374151]">
                    <CheckCircle2 className="h-4 w-4 text-[#FF6B00] shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => handleSubscribe(annual?.priceId, annual?.interval ?? "year")}
                disabled={createCheckout.isPending || (!isLoading && !annual)}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF9A3C] text-white font-black text-sm shadow-[0px_8px_25px_rgba(255,107,0,.45)] hover:shadow-[0px_14px_35px_rgba(255,107,0,.60)] transition-all disabled:opacity-60"
              >
                {createCheckout.isPending ? "Se procesează..." : "Abonează-te anual →"}
              </button>
            </div>
          </div>

          {/* MONTHLY */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-[0px_8px_30px_rgba(0,0,0,.07)]">
            <div className="bg-gradient-to-r from-[#0A4D68] to-[#2C5F7A] px-6 py-5">
              <h3 className="text-lg font-black text-white">Abonament Lunar</h3>
              <p className="text-white/70 text-xs mt-1">Flexibil, fără angajament pe termen lung</p>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                {isLoading ? <Skeleton className="h-12 w-24 rounded-lg" /> : (
                  <div className="flex items-end gap-1">
                    <span className="text-5xl font-black text-[#1F2937]">
                      {monthly ? Math.round(monthly.amount / 100) : 67}
                    </span>
                    <div className="mb-1">
                      <span className="text-xl font-black text-[#1F2937]">Lei</span>
                      <p className="text-xs text-[#9CA3AF]">/ lună</p>
                    </div>
                  </div>
                )}
                <p className="text-xs font-semibold text-[#22C55E] mt-1">✓ Include 7 zile gratuite</p>
              </div>
              <ul className="space-y-2.5">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#374151]">
                    <CheckCircle2 className="h-4 w-4 text-[#2C5F7A] shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => handleSubscribe(monthly?.priceId, monthly?.interval ?? "month")}
                disabled={createCheckout.isPending || (!isLoading && !monthly)}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#0A4D68] to-[#2C5F7A] text-white font-black text-sm shadow-[0px_6px_20px_rgba(10,77,104,.35)] hover:shadow-[0px_10px_28px_rgba(10,77,104,.50)] transition-all disabled:opacity-60"
              >
                {createCheckout.isPending ? "Se procesează..." : "Abonează-te lunar →"}
              </button>
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex flex-wrap justify-center gap-5 bg-white rounded-2xl border border-[#E5E7EB] px-8 py-4 shadow-[0px_4px_15px_rgba(0,0,0,.05)]">
            {[
              { icon: "🛡️", text: "Fără reclame" },
              { icon: "👶", text: "100% sigur pentru copii" },
              { icon: "🔒", text: "Plată securizată prin Stripe" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2">
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-semibold text-[#374151]">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */

const FAQ_ITEMS = [
  {
    q: "Este nevoie de card pentru perioada de probă?",
    a: "Nu, nu îți cerem datele cardului bancar pentru a începe cele 7 zile gratuite. Vrem să te convingi de valoarea platformei înainte de a plăti.",
  },
  {
    q: "Pe ce dispozitive funcționează Corcodușa?",
    a: "Pe orice dispozitiv cu browser: tablete iPad sau Android, telefoane și calculatoare. Fără instalare, direct în browser.",
  },
  {
    q: "Pot juca mai mulți copii pe același cont?",
    a: "Da! Un abonament permite accesul simultan pe mai multe dispozitive în cadrul aceleiași familii.",
  },
  {
    q: "Sunt jocurile potrivite vârstei copilului meu?",
    a: "Fiecare joc afișează intervalul de vârstă recomandat (3–6 ani, 5–9 ani etc.) și a fost conceput cu pedagogi pentru acea grupă.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────── */

export default function Home() {
  const { data: apiGames } = useListGames({});
  // Fall back to static games when API is unreachable or returns empty (unseeded DB).
  // `?? STATIC_GAMES` won't work — [] is not null/undefined.
  const allGames = (apiGames && apiGames.length > 0) ? apiGames : STATIC_GAMES;
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();

  function handleCTA() {
    if (!isSignedIn) {
      openSignIn({ signUpForceRedirectUrl: "/#games", forceRedirectUrl: "/#games" });
      return;
    }
    document.getElementById("games")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="flex min-h-screen flex-col">

      {/* ══════════════════════════════════════════════════
          HERO — "JOACĂ ȘI ÎNVATĂ"
      ══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1565C0] via-[#0D47A1] to-[#0A3D8A] min-h-[92vh] flex flex-col items-center justify-center text-center px-6 py-16">

        {/* Sky blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-[#FFD700]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-[#00BCD4]/15 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 left-1/4 h-[200px] w-[200px] rounded-full bg-white/5 blur-2xl" />

        {/* Decorative dots */}
        <div className="pointer-events-none absolute top-16 left-10 h-3 w-3 rounded-full bg-[#FFD700]/60" />
        <div className="pointer-events-none absolute top-24 right-16 h-2 w-2 rounded-full bg-white/40" />
        <div className="pointer-events-none absolute bottom-32 left-20 h-2 w-2 rounded-full bg-[#FFD700]/50" />
        <div className="pointer-events-none absolute bottom-20 right-24 h-3 w-3 rounded-full bg-white/30" />

        <div className="relative z-10 flex flex-col items-center gap-5 max-w-3xl mx-auto">

          {/* Hero character */}
          <img
            src="/CorcodusaPLay-Photoroom.png"
            alt="Corcodușa"
            className="h-56 w-56 md:h-72 md:w-72 object-contain drop-shadow-[0_12px_40px_rgba(0,0,0,.40)]"
          />

          {/* Title logo — H2 size, directly under character */}
          <img
            src="/title.logo.games.corcodusa.ro.png"
            alt="games.corcodusa.ro"
            className="h-8 md:h-9 object-contain brightness-0 invert opacity-85 -mt-2"
          />

          {/* Main heading */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-none tracking-tight">
            <span
              className="text-[#FFD700]"
              style={{ textShadow: "0 4px 0 rgba(0,0,0,.30), 0 8px 30px rgba(0,0,0,.20)" }}
            >
              JOACĂ
            </span>
            <span className="text-white mx-3 md:mx-4" style={{ textShadow: "0 4px 0 rgba(0,0,0,.25)" }}>
              ȘI
            </span>
            <span
              className="text-[#FFD700]"
              style={{ textShadow: "0 4px 0 rgba(0,0,0,.30), 0 8px 30px rgba(0,0,0,.20)" }}
            >
              ÎNVAȚĂ
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-white/75 text-lg md:text-xl max-w-md leading-relaxed">
            10 jocuri educaționale sigure pentru copii între 3 și 8 ani.
            Fără reclame, 100% distractiv.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
            <button
              type="button"
              onClick={handleCTA}
              className="h-14 px-8 rounded-2xl bg-[#FFD700] text-[#1A1A1A] font-black text-lg shadow-[0px_8px_25px_rgba(255,215,0,.50)] hover:shadow-[0px_14px_35px_rgba(255,215,0,.65)] hover:bg-[#FFC800] transition-all duration-300"
            >
              ▶ Joacă gratuit 7 zile
            </button>
            <a
              href="#pricing"
              className="h-14 px-8 rounded-2xl bg-white/15 border border-white/25 text-white font-bold text-base hover:bg-white/25 transition-all duration-300 flex items-center"
            >
              Vezi abonamentele
            </a>
          </div>

          {/* Trust pill */}
          <div className="flex items-center gap-3 bg-white/10 border border-white/15 px-5 py-2.5 rounded-xl text-sm text-white/80 font-medium">
            <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
            Fără card bancar pentru 7 zile gratuite
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40 animate-bounce">
          <span className="text-xs font-medium">Scroll</span>
          <span className="text-lg">↓</span>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          GAMES GRID
      ══════════════════════════════════════════════════ */}
      <section
        id="games"
        className="relative py-14 md:py-20 bg-gradient-to-b from-[#0A3D8A] via-[#083580] to-[#0A2E6E]"
      >
        {/* Subtle separator glow */}
        <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FFD700]/30 to-transparent" />

        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          {/* Section label */}
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white/80 text-sm font-bold px-4 py-2 rounded-xl mb-4">
              🎮 Toate jocurile
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Alege jocul preferat
            </h2>
          </div>

          {/* Grid — 2 cols mobile / 3 tablet / 5 desktop = 2 rows for all 10 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
            {allGames
              .slice()
              .sort((a, b) => a.id - b.id)
              .map((game) => <GameCard key={game.id} game={game} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          PRICING
      ══════════════════════════════════════════════════ */}
      <PricingSection />

      {/* ══════════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════════ */}
      <section id="faq" className="py-16 md:py-20 bg-white">
        <div className="max-w-2xl mx-auto px-6 md:px-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-[#1F2937]">
              Întrebări frecvente
            </h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-6 data-[state=open]:bg-white data-[state=open]:shadow-[0px_8px_25px_rgba(0,0,0,.08)] transition-all"
              >
                <AccordionTrigger className="font-bold text-base text-[#1F2937] hover:no-underline py-5 hover:text-[#FF6B00]">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-[#4B5563] text-base pb-5 leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════ */}
      <Footer />
    </div>
  );
}
