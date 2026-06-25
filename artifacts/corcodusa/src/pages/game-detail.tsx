import { useParams, Link } from "wouter";
import { useGetGame } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Skeleton } from "@/components/ui/skeleton";
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
    <div className="flex min-h-screen flex-col bg-[#F0F4F8]">
      <Navbar />

      <main className="flex-1">
        {/* Back + game header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0A4D68] to-[#2C5F7A]">
          <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-[#FF6B00]/20 blur-2xl" />
          <div className="max-w-[1152px] mx-auto px-6 md:px-10 py-8">
            <Link
              href="/games"
              className="inline-flex items-center text-sm font-bold text-white/70 hover:text-white transition-colors mb-6 gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Înapoi la jocuri
            </Link>

            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-9 w-64 bg-white/20" />
                <Skeleton className="h-5 w-48 bg-white/10" />
              </div>
            ) : game ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-black text-white">
                  {categoryEmoji(game.category)} {game.title}
                </h1>
                <div className="flex gap-2 flex-wrap">
                  <span className="inline-flex items-center bg-white/15 text-white text-xs font-bold px-3 py-1 rounded-lg uppercase tracking-wider">
                    {game.category}
                  </span>
                  <span className="inline-flex items-center bg-white/15 text-white text-xs font-bold px-3 py-1 rounded-lg">
                    {game.ageMin}–{game.ageMax} ani
                  </span>
                  {game.isNew && (
                    <span className="inline-flex items-center bg-[#FFD700] text-[#1F2937] text-xs font-black px-3 py-1 rounded-lg">
                      ✨ Nou
                    </span>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-[1152px] mx-auto px-6 md:px-10 py-8">
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-5 w-2/3 rounded-lg" />
              <Skeleton className="h-[500px] w-full rounded-2xl" />
            </div>
          ) : game ? (
            <div className="space-y-6">
              {game.description && (
                <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                  {game.description}
                </p>
              )}

              {/* Game area */}
              {GameComponent ? (
                <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-[0px_8px_30px_rgba(0,0,0,.08)]">
                  <div className={`bg-gradient-to-r ${categoryGradient(game.category)} px-6 py-4 flex items-center gap-3`}>
                    <span className="text-2xl">{categoryEmoji(game.category)}</span>
                    <span className="text-lg font-black text-white drop-shadow-sm">
                      {game.title}
                    </span>
                  </div>
                  <div className="p-4 md:p-8">
                    <GameComponent />
                  </div>
                </div>
              ) : (
                <div className="p-12 bg-white text-muted-foreground rounded-2xl border-2 border-dashed border-[#E5E7EB] text-center">
                  <div className="text-5xl mb-4">🚧</div>
                  <h3 className="text-xl font-black text-[#1F2937] mb-2">Jocul este în curs de dezvoltare</h3>
                  <p className="text-base">Revino curând pentru a-l juca!</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🎮</div>
              <h2 className="text-2xl font-black text-[#1F2937] mb-3">Jocul nu a fost găsit</h2>
              <p className="text-muted-foreground mb-6">Încearcă să accesezi alt joc din lista noastră.</p>
              <Link href="/games">
                <button className="h-11 px-6 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF9A3C] text-white font-black shadow-[0px_6px_18px_rgba(255,107,0,.35)] hover:shadow-[0px_10px_25px_rgba(255,107,0,.50)] transition-all">
                  Vezi alte jocuri
                </button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
