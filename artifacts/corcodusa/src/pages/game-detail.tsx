import { useParams, Link } from "wouter";
import { useGetGame } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { getGetGameQueryKey } from "@workspace/api-client-react";
import { GAME_COMPONENTS } from "@/games";
import { categoryEmoji, categoryGradient } from "@/lib/category-colors";

export default function GameDetail() {
  const { id } = useParams();
  const gameId = id ? parseInt(id, 10) : 0;

  const { data: game, isLoading } = useGetGame(gameId, {
    query: {
      enabled: !!gameId,
      queryKey: getGetGameQueryKey(gameId),
    },
  });

  const GameComponent = gameId ? GAME_COMPONENTS[gameId] : null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
        <Link
          href="/games"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Înapoi la jocuri
        </Link>

        {isLoading ? (
          <div className="space-y-6">
            <div className="flex gap-4 items-center">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-[500px] w-full rounded-3xl" />
          </div>
        ) : game ? (
          <div className="space-y-6">
            {/* Game header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                {categoryEmoji(game.category)} {game.title}
              </h1>
              <div className="flex gap-2">
                <Badge variant="outline" className="uppercase tracking-wider font-bold text-xs">
                  {game.category}
                </Badge>
                <Badge variant="secondary" className="font-bold text-xs">
                  {game.ageMin}–{game.ageMax} ani
                </Badge>
                {game.isNew && (
                  <Badge className="bg-accent text-accent-foreground border-none font-bold text-xs rounded-full">
                    Nou!
                  </Badge>
                )}
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed max-w-2xl">{game.description}</p>

            {/* Game area */}
            {GameComponent ? (
              <div className="bg-gradient-to-br from-background to-muted/30 rounded-3xl border-2 border-border shadow-xl overflow-hidden">
                <div className={`bg-gradient-to-r ${categoryGradient(game.category)} px-6 py-4 flex items-center gap-3`}>
                  <span className="text-2xl">{categoryEmoji(game.category)}</span>
                  <span className="font-display text-lg font-bold text-white drop-shadow-sm">
                    {game.title}
                  </span>
                </div>
                <div className="p-4 md:p-8">
                  <GameComponent />
                </div>
              </div>
            ) : (
              <div className="p-8 bg-muted/30 text-muted-foreground rounded-3xl border-2 border-dashed border-border text-center text-lg font-medium">
                🚧 Jocul este în curs de dezvoltare.
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Jocul nu a fost găsit</h2>
            <Link href="/games">
              <button className="px-6 py-2 rounded-full border border-border hover:bg-muted transition-colors font-medium">
                Vezi alte jocuri
              </button>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
