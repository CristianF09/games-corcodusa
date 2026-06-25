import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useGetFeaturedGames, useGetPlatformStats, useListGameCategories } from "@workspace/api-client-react";
import { GameCard } from "@/components/game-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PlayCircle, Shield, Brain } from "lucide-react";
import { categoryGradient } from "@/lib/category-colors";

export default function Home() {
  const { data: featuredGames, isLoading: isLoadingFeatured } = useGetFeaturedGames();
  const { data: categories, isLoading: isLoadingCategories } = useListGameCategories();
  const { data: stats } = useGetPlatformStats();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">

        {/* ── Hero ──────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0A4D68] via-[#0F6080] to-[#0C5C48]">
          {/* Ambient blobs */}
          <div className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-[#FF6B00]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-[400px] w-[400px] rounded-full bg-[#FFD700]/10 blur-3xl" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-white/3 blur-3xl" />

          {/* Decorative rings */}
          <div className="pointer-events-none absolute top-12 left-8 h-28 w-28 rounded-full border-2 border-white/10" />
          <div className="pointer-events-none absolute bottom-20 right-12 h-20 w-20 rounded-full bg-[#FF6B00]/15" />
          <div className="pointer-events-none absolute top-1/3 right-1/4 h-10 w-10 rounded-full border border-[#FFD700]/25" />

          <div className="relative max-w-[1152px] mx-auto px-10 py-24 md:py-32 lg:py-44 text-center">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-sm font-bold px-4 py-1.5 rounded-xl mb-8 border border-white/10">
              <span className="h-2 w-2 rounded-full bg-[#FFD700] animate-pulse" />
              Cel mai iubit loc de joacă educațional
            </span>

            {/* Headline */}
            <h1 className="text-white font-black leading-tight mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
              Învățarea devine o{" "}
              <span className="relative">
                <span className="text-[#FFD700]">joacă de copii</span>
                <span className="pointer-events-none absolute -bottom-1 left-0 right-0 h-1 bg-[#FFD700]/40 rounded-full blur-sm" />
              </span>
            </h1>

            {/* Subheading */}
            <p className="mx-auto max-w-2xl text-white/75 text-lg md:text-xl leading-relaxed mb-10">
              Jocuri sigure, captivante și educative pentru copiii între 3 și 8 ani.
              Fără reclame, fără achiziții ascunse — doar explorare și distracție.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up">
                <button className="h-[60px] px-8 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF9A3C] text-white font-black text-lg shadow-[0px_8px_25px_rgba(255,107,0,.50)] hover:shadow-[0px_14px_35px_rgba(255,107,0,.65)] hover:from-[#E55A00] hover:to-[#E58A2C] transition-all duration-300">
                  Începe cele 7 zile gratuite
                </button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="secondary">
                  Vezi abonamentele
                </Button>
              </Link>
            </div>

            {/* Stats strip */}
            {stats && (
              <div className="mt-16 inline-flex items-center gap-8 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-8 py-5">
                {[
                  { value: `${stats.totalGames}+`, label: "Jocuri Edu" },
                  { value: `${stats.totalCategories}`, label: "Categorii" },
                  { value: `${stats.totalUsers}+`, label: "Familii Fericite" },
                  { value: `${stats.newGamesThisMonth}`, label: "Jocuri Noi" },
                ].map((s, i) => (
                  <div key={s.label} className="flex flex-col items-center gap-1">
                    {i > 0 && <div className="hidden sm:block absolute h-8 w-px bg-white/20" />}
                    <span className="text-3xl font-black text-white">{s.value}</span>
                    <span className="text-xs font-semibold text-white/55 uppercase tracking-wider">{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Categories ────────────────────────────────────── */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-[1152px] mx-auto px-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-[48px] font-black text-[#1F2937] mb-4 leading-tight">
                Ce vrei să explorezi azi?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                Peste 50 de activități care dezvoltă creativitatea, logica și vocabularul.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {isLoadingCategories
                ? Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-36 rounded-2xl" />
                  ))
                : categories?.slice(0, 4).map((category) => (
                    <Link key={category.name} href="/games">
                      <div className="group bg-white border border-[#E5E7EB] rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 shadow-[0px_4px_15px_rgba(0,0,0,.06)] hover:shadow-[0px_12px_30px_rgba(0,0,0,.12)] hover:-translate-y-1 hover:border-[#FF6B00]/30">
                        <div className={`mx-auto mb-4 h-14 w-14 rounded-xl bg-gradient-to-br ${categoryGradient(category.name)} flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                          {category.emoji}
                        </div>
                        <h3 className="font-bold text-[#1F2937] text-base">{category.label}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{category.count} jocuri</p>
                      </div>
                    </Link>
                  ))}
            </div>
          </div>
        </section>

        {/* ── Featured Games ─────────────────────────────────── */}
        <section className="py-16 md:py-24 bg-[#F0F4F8]">
          <div className="max-w-[1152px] mx-auto px-10">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
              <div>
                <h2 className="text-3xl md:text-[48px] font-black text-[#1F2937] mb-3 leading-tight">
                  Recomandate pentru tine
                </h2>
                <p className="text-muted-foreground text-lg">Cele mai populare jocuri din această săptămână.</p>
              </div>
              <Link href="/games">
                <Button variant="ghost">
                  Vezi toate jocurile →
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {isLoadingFeatured
                ? Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-[380px] rounded-2xl" />
                  ))
                : featuredGames?.slice(0, 3).map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
            </div>
          </div>
        </section>

        {/* ── Features ───────────────────────────────────────── */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-[1152px] mx-auto px-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-[48px] font-black text-[#1F2937] mb-4 leading-tight">
                Un spațiu sigur pentru creștere
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                Construit cu pedagogi, iubit de copii, de încredere pentru părinți.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Shield className="h-8 w-8" />,
                  colorBg: "bg-gradient-to-br from-[#FF6B00]/10 to-[#FF6B00]/5",
                  colorIcon: "text-[#FF6B00]",
                  accent: "#FF6B00",
                  title: "100% Sigur",
                  body: "Fără reclame, fără linkuri externe, fără achiziții în aplicație. Copilul tău explorează într-un mediu protejat.",
                },
                {
                  icon: <Brain className="h-8 w-8" />,
                  colorBg: "bg-gradient-to-br from-[#0A4D68]/10 to-[#0A4D68]/5",
                  colorIcon: "text-[#2C5F7A]",
                  accent: "#2C5F7A",
                  title: "Aprobat de Pedagogi",
                  body: "Fiecare joc este conceput pentru a dezvolta abilități cognitive specifice grupei de vârstă 3-8 ani.",
                },
                {
                  icon: <PlayCircle className="h-8 w-8" />,
                  colorBg: "bg-gradient-to-br from-[#FFD700]/20 to-[#FFD700]/5",
                  colorIcon: "text-[#B8860B]",
                  accent: "#FFD700",
                  title: "Distracție Garantată",
                  body: "Animații fermecătoare, personaje prietenoase și recompense pozitive care încurajează progresul.",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="bg-white border border-[#E5E7EB] rounded-2xl p-7 flex flex-col gap-4 shadow-[0px_4px_20px_rgba(0,0,0,.06)] hover:shadow-[0px_10px_30px_rgba(0,0,0,.10)] hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className={`h-14 w-14 rounded-xl ${f.colorBg} ${f.colorIcon} flex items-center justify-center`}>
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-black text-[#1F2937]">{f.title}</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Section ────────────────────────────────────── */}
        <section className="relative overflow-hidden py-20 md:py-32 bg-gradient-to-br from-[#0A4D68] via-[#0F6080] to-[#0C5C48]">
          <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[#FF6B00]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-[#FFD700]/10 blur-3xl" />

          <div className="relative max-w-[1152px] mx-auto px-10 text-center">
            <h2 className="text-4xl md:text-[52px] font-black text-white mb-6 leading-tight">
              Începeți aventura{" "}
              <span className="text-[#FFD700]">astăzi</span>
            </h2>
            <p className="text-white/75 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Testează platforma gratuit timp de 7 zile. Fără obligații, anulezi oricând cu un singur click.
            </p>
            <Link href="/sign-up">
              <button className="h-[60px] px-10 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF9A3C] text-white font-black text-lg shadow-[0px_10px_30px_rgba(255,107,0,.50)] hover:shadow-[0px_16px_40px_rgba(255,107,0,.65)] hover:from-[#E55A00] hover:to-[#E58A2C] transition-all duration-300">
                Creează cont gratuit →
              </button>
            </Link>
            <p className="mt-6 text-sm text-white/45">Nu este necesar cardul bancar pentru perioada de probă.</p>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────── */}
        <section className="py-16 md:py-24 bg-[#F0F4F8]">
          <div className="max-w-[1152px] mx-auto px-10">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-[48px] font-black text-[#1F2937] mb-4 leading-tight">
                  Întrebări frecvente
                </h2>
              </div>

              <Accordion type="single" collapsible className="w-full space-y-3">
                {[
                  {
                    q: "Este nevoie de card pentru perioada de probă?",
                    a: "Nu, nu îți cerem datele cardului bancar pentru a începe cele 7 zile gratuite. Vrem să te convingi de valoarea platformei înainte de a plăti.",
                  },
                  {
                    q: "Pe ce dispozitive funcționează Corcodușa?",
                    a: "Platforma este optimizată pentru orice dispozitiv: tablete (iPad, Android), telefoane mobile și calculatoare, funcționând direct în browser fără a necesita instalare.",
                  },
                  {
                    q: "Pot juca mai mulți copii pe același cont?",
                    a: "Da! Un abonament Corcodușa permite accesul simultan pe mai multe dispozitive în cadrul aceleiași familii.",
                  },
                  {
                    q: "Ce se întâmplă dacă anulez abonamentul?",
                    a: "Poți anula oricând din contul tău cu un singur click. Vei avea acces în continuare până la finalul perioadei deja plătite, după care nu vei mai fi tarifat.",
                  },
                ].map((item, i) => (
                  <AccordionItem
                    key={i}
                    value={`item-${i}`}
                    className="bg-white border border-[#E5E7EB] rounded-2xl px-6 shadow-[0px_2px_10px_rgba(0,0,0,.05)] data-[state=open]:shadow-[0px_8px_25px_rgba(0,0,0,.09)] transition-all"
                  >
                    <AccordionTrigger className="font-bold text-base text-[#1F2937] hover:no-underline py-5 hover:text-primary">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base pb-5 leading-relaxed">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
