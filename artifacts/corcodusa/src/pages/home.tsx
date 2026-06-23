import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useGetFeaturedGames, useGetPlatformStats, useListGameCategories, useGetNewGames } from "@workspace/api-client-react";
import { GameCard } from "@/components/game-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { PlayCircle, Shield, Brain, Sparkles, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { categoryGradient } from "@/lib/category-colors";

export default function Home() {
  const { data: featuredGames, isLoading: isLoadingFeatured } = useGetFeaturedGames();
  const { data: newGames, isLoading: isLoadingNew } = useGetNewGames();
  const { data: categories, isLoading: isLoadingCategories } = useListGameCategories();
  const { data: stats } = useGetPlatformStats();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-24 md:pb-32 lg:pt-32 lg:pb-40">
          <div className="absolute inset-0 z-0 bg-[url('/images/hero.png')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/50 to-background" />
          
          <div className="container relative z-10 mx-auto px-4 md:px-6 text-center max-w-4xl">
            <Badge className="mb-6 rounded-full px-4 py-1.5 text-sm font-medium bg-accent/20 text-accent-foreground border-none">
              <Sparkles className="mr-2 h-4 w-4 inline-block text-accent" />
              Cel mai iubit loc de joacă educațional
            </Badge>
            <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl mb-6 text-foreground">
              Învățarea devine o <span className="text-primary">joacă de copii</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed font-medium">
              Jocuri sigure, captivante și educative pentru copiii între 3 și 8 ani. 
              Fără reclame, fără achiziții ascunse, doar explorare și distracție.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 h-14 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                  Începe cele 7 zile gratuite
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 h-14 rounded-full font-bold bg-background/50 backdrop-blur-sm border-2">
                  Vezi abonamentele
                </Button>
              </Link>
            </div>
            
            {stats && (
              <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto opacity-80">
                <div className="flex flex-col items-center">
                  <span className="font-display text-3xl font-bold text-primary">{stats.totalGames}+</span>
                  <span className="text-sm font-medium">Jocuri Edu</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-display text-3xl font-bold text-secondary">{stats.totalCategories}</span>
                  <span className="text-sm font-medium">Categorii</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-display text-3xl font-bold text-accent">{stats.totalUsers}+</span>
                  <span className="text-sm font-medium">Familii Fericite</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-display text-3xl font-bold text-destructive">{stats.newGamesThisMonth}</span>
                  <span className="text-sm font-medium">Jocuri Noi Luna Asta</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 md:py-24 bg-card relative z-20 rounded-t-[3rem] -mt-8 shadow-sm">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">Ce vrei să explorezi azi?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Peste 50 de activități care dezvoltă creativitatea, logica și vocabularul.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {isLoadingCategories ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-3xl" />
                ))
              ) : categories?.slice(0, 4).map((category) => (
                <Card key={category.name} className="bg-background border-2 border-border/50 hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 rounded-3xl text-center group cursor-pointer overflow-hidden">
                  <div className={`h-1.5 w-full bg-gradient-to-r ${categoryGradient(category.name)}`} />
                  <CardContent className="p-6 md:p-8 flex flex-col items-center gap-4">
                    <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${categoryGradient(category.name)} flex items-center justify-center text-3xl md:text-4xl shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                      {category.emoji}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-xl">{category.label}</h3>
                      <p className="text-sm text-muted-foreground">{category.count} jocuri</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Games */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
              <div>
                <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">Recomandate pentru tine</h2>
                <p className="text-muted-foreground text-lg">Cele mai populare jocuri din această săptămână.</p>
              </div>
              <Link href="/sign-up">
                <Button variant="ghost" className="font-bold text-primary hover:text-primary hover:bg-primary/10 rounded-full">
                  Vezi toate jocurile &rarr;
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {isLoadingFeatured ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-[400px] rounded-3xl" />
                ))
              ) : featuredGames?.slice(0, 3).map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        </section>

        {/* Features / How it works */}
        <section className="py-16 md:py-24 bg-secondary/5 rounded-3xl mx-4 md:mx-6 my-12">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">Un spațiu sigur pentru creștere</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Construit cu pedagogi, iubit de copii, de încredere pentru părinți.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <Shield className="h-10 w-10" />
                </div>
                <h3 className="font-display text-2xl font-bold">100% Sigur</h3>
                <p className="text-muted-foreground">Fără reclame, fără linkuri externe, fără achiziții în aplicație. Copilul tău explorează într-un mediu protejat.</p>
              </div>
              <div className="flex flex-col items-center text-center gap-4">
                <div className="h-20 w-20 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-2">
                  <Brain className="h-10 w-10" />
                </div>
                <h3 className="font-display text-2xl font-bold">Aprobat de Pedagogi</h3>
                <p className="text-muted-foreground">Fiecare joc este conceput pentru a dezvolta abilități cognitive specifice grupei de vârstă 3-8 ani.</p>
              </div>
              <div className="flex flex-col items-center text-center gap-4">
                <div className="h-20 w-20 rounded-full bg-accent/20 flex items-center justify-center text-accent-foreground mb-2">
                  <PlayCircle className="h-10 w-10" />
                </div>
                <h3 className="font-display text-2xl font-bold">Distracție Garantată</h3>
                <p className="text-muted-foreground">Animații fermecătoare, personaje prietenoase și recompense pozitive care încurajează progresul.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing CTA */}
        <section className="py-20 md:py-32 bg-primary text-primary-foreground text-center px-4">
          <div className="container mx-auto max-w-3xl">
            <h2 className="font-display text-4xl md:text-6xl font-bold mb-6 text-white">Începeți aventura astăzi</h2>
            <p className="text-primary-foreground/90 text-xl mb-10 max-w-2xl mx-auto">
              Testează platforma gratuit timp de 7 zile. Fără obligații, anulezi oricând cu un singur click.
            </p>
            <Link href="/sign-up">
              <Button size="lg" className="text-lg px-10 h-16 rounded-full font-bold bg-white text-primary hover:bg-white/90 shadow-2xl hover:shadow-xl transition-all hover:-translate-y-1">
                Creează cont gratuit
              </Button>
            </Link>
            <p className="mt-6 text-sm text-primary-foreground/80 opacity-80">Nu este necesar cardul bancar pentru perioada de probă.</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Întrebări frecvente</h2>
            </div>
            
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="item-1" className="border rounded-2xl px-6 bg-card data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-bold text-lg hover:no-underline py-6">Este nevoie de card pentru perioada de probă?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base pb-6">
                  Nu, nu îți cerem datele cardului bancar pentru a începe cele 7 zile gratuite. Vrem să te convingi de valoarea platformei înainte de a plăti.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border rounded-2xl px-6 bg-card data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-bold text-lg hover:no-underline py-6">Pe ce dispozitive funcționează Corcodușa?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base pb-6">
                  Platforma este optimizată pentru orice dispozitiv: tablete (iPad, Android), telefoane mobile și calculatoare (laptop, PC), funcționând direct în browser fără a necesita instalare.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border rounded-2xl px-6 bg-card data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-bold text-lg hover:no-underline py-6">Pot juca mai mulți copii pe același cont?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base pb-6">
                  Da! Un abonament Corcodușa permite accesul simultan pe mai multe dispozitive în cadrul aceleiași familii.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="border rounded-2xl px-6 bg-card data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-bold text-lg hover:no-underline py-6">Ce se întâmplă dacă anulez abonamentul?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base pb-6">
                  Poți anula oricând din contul tău cu un singur click. Vei avea acces în continuare până la finalul perioadei deja plătite, după care nu vei mai fi tarifat.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
