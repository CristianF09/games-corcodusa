import { useState } from "react";
import { useListGames, useListGameCategories } from "@workspace/api-client-react";
import { STATIC_GAMES } from "@/lib/static-games";
import { CATEGORY_EMOJIS } from "@/lib/category-colors";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { GameCard } from "@/components/game-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

// Rendered immediately so category buttons never wait on the API.
const STATIC_CATEGORIES = [
  { name: "matematica", label: "Matematică" },
  { name: "litere", label: "Litere" },
  { name: "culori", label: "Culori" },
  { name: "natura", label: "Natură" },
  { name: "muzica", label: "Muzică" },
  { name: "memorie", label: "Memorie" },
  { name: "creativitate", label: "Creativitate" },
  { name: "logica", label: "Logică" },
].map((c) => ({ ...c, emoji: CATEGORY_EMOJIS[c.name] }));

export default function Games() {
  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: apiCategories } = useListGameCategories();
  // Fetch the full list once; category filtering happens client-side so
  // switching categories is instant instead of a network round-trip per click.
  const { data: apiGames, isLoading: isLoadingGames } = useListGames({});
  const categories = (apiCategories && apiCategories.length > 0) ? apiCategories : STATIC_CATEGORIES;
  // Fall back to static games when API is unreachable or returns empty (unseeded DB)
  const baseGames = (apiGames && apiGames.length > 0) ? apiGames : STATIC_GAMES;

  const filteredGames = baseGames.filter(
    (g) =>
      (!activeCategory || g.category === activeCategory) &&
      (!searchQuery ||
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#F0F4F8]">
      <Navbar />

      <main className="flex-1">
        {/* Gradient page header — logo + "Joacă și Învață" app-style banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0A4D68] via-[#0F6080] to-[#0C5C48]">
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#FF6B00]/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-[#FFD700]/10 blur-2xl" />

          <div className="relative max-w-[1152px] mx-auto px-10 py-12 md:py-16 flex flex-col items-center text-center gap-5">
            <img src="/logo-icon.png" alt="Corcodușa" className="h-20 w-20 object-contain drop-shadow-lg" />
            <div>
              <p className="text-white/60 text-sm font-bold tracking-wide mb-1">games.corcodusa.ro</p>
              <h1 className="text-4xl md:text-5xl font-black text-white">
                Joacă și <span className="text-[#FFD700]">Învață</span>
              </h1>
              <p className="text-white/70 text-lg mt-2">Găsește activitatea perfectă pentru copilul tău.</p>
            </div>

            {/* Search */}
            <div className="relative w-full max-w-md mt-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4B5563]" />
              <input
                type="text"
                placeholder="Caută jocuri..."
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-white/20 bg-white text-[#1F2937] text-base placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF6B00] focus:ring-[3px] focus:ring-[#FF6B00]/15 transition-all shadow-[0px_2px_8px_rgba(0,0,0,.10)]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="max-w-[1152px] mx-auto px-10 py-8 md:py-12">
          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveCategory(undefined)}
              className={[
                "h-10 px-4 text-sm font-bold rounded-xl transition-all border",
                activeCategory === undefined
                  ? "bg-gradient-to-r from-[#FF6B00] to-[#FF9A3C] text-white border-transparent shadow-[0px_4px_15px_rgba(255,107,0,.35)]"
                  : "bg-white text-[#374151] border-[#E5E7EB] hover:border-[#FF6B00] hover:text-[#FF6B00] shadow-[0px_2px_8px_rgba(0,0,0,.05)]",
              ].join(" ")}
            >
              Toate jocurile
            </button>

            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setActiveCategory(category.name)}
                className={[
                  "h-10 px-4 text-sm font-bold rounded-xl transition-all border",
                  activeCategory === category.name
                    ? "bg-gradient-to-r from-[#FF6B00] to-[#FF9A3C] text-white border-transparent shadow-[0px_4px_15px_rgba(255,107,0,.35)]"
                    : "bg-white text-[#374151] border-[#E5E7EB] hover:border-[#FF6B00] hover:text-[#FF6B00] shadow-[0px_2px_8px_rgba(0,0,0,.05)]",
                ].join(" ")}
              >
                {category.emoji} {category.label}
              </button>
            ))}
          </div>

          {/* Game grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
            {isLoadingGames ? (
              Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-[240px] rounded-3xl" />
              ))
            ) : filteredGames && filteredGames.length > 0 ? (
              filteredGames.map((game) => <GameCard key={game.id} game={game} />)
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-black text-[#1F2937] mb-2">Nu am găsit jocuri</h3>
                <p className="text-muted-foreground mb-6">Încearcă alte filtre sau alt termen de căutare.</p>
                <button
                  onClick={() => { setActiveCategory(undefined); setSearchQuery(""); }}
                  className="h-11 px-6 text-base font-bold rounded-xl border-2 border-[#E5E7EB] text-[#374151] hover:border-[#FF6B00] hover:text-[#FF6B00] transition-all"
                >
                  Resetează filtrele
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
