import { useState } from "react";
import { useListGames, useListGameCategories } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { GameCard } from "@/components/game-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Games() {
  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: categories, isLoading: isLoadingCategories } = useListGameCategories();
  const { data: games, isLoading: isLoadingGames } = useListGames({
    category: activeCategory,
  });

  const filteredGames = games?.filter(g => 
    !searchQuery || g.title.toLowerCase().includes(searchQuery.toLowerCase()) || g.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
          <div>
            <h1 className="font-display text-4xl font-bold mb-2">Toate Jocurile</h1>
            <p className="text-muted-foreground">Găsește activitatea perfectă pentru copilul tău.</p>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Caută jocuri..." 
              className="pl-10 rounded-full bg-card"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button 
            variant={activeCategory === undefined ? "default" : "outline"} 
            className="rounded-full font-bold"
            onClick={() => setActiveCategory(undefined)}
          >
            Toate jocurile
          </Button>
          
          {isLoadingCategories ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-full" />
            ))
          ) : (
            categories?.map(category => (
              <Button
                key={category.name}
                variant={activeCategory === category.name ? "default" : "outline"}
                className="rounded-full font-bold"
                onClick={() => setActiveCategory(category.name)}
              >
                {category.emoji} {category.label}
              </Button>
            ))
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoadingGames ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-[350px] rounded-3xl" />
            ))
          ) : filteredGames && filteredGames.length > 0 ? (
            filteredGames.map(game => (
              <GameCard key={game.id} game={game} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-2">Nu am găsit jocuri</h3>
              <p className="text-muted-foreground">Încearcă alte filtre sau alt termen de căutare.</p>
              <Button 
                variant="outline" 
                className="mt-6 rounded-full"
                onClick={() => { setActiveCategory(undefined); setSearchQuery(""); }}
              >
                Resetează filtrele
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
