import { Suspense, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useAuth, useClerk } from "@clerk/react";
import { useGetGame, useGetUserSubscription, getGetUserSubscriptionQueryKey } from "@workspace/api-client-react";
import { STATIC_GAMES } from "@/lib/static-games";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Lock } from "lucide-react";
import { getGetGameQueryKey } from "@workspace/api-client-react";
import { GAME_COMPONENTS } from "@/games";
import { categoryEmoji, categoryGradient } from "@/lib/category-colors";

export default function GameDetail() {
  const { id } = useParams();
  const gameId = id ? parseInt(id, 10) : 0;

  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { openSignIn } = useClerk();

  const { data: apiGame, isLoading } = useGetGame(gameId, {
    query: {
      enabled: !!gameId,
      queryKey: getGetGameQueryKey(gameId),
    },
  });
  const game = apiGame ?? STATIC_GAMES.find((g) => g.id === gameId);

  // Skip subscription check entirely when the bypass flag is active so we
  // never show a loading skeleton just for the subscription query.
  const bypassSubscription = import.meta.env.VITE_BYPASS_SUBSCRIPTION === "true";
  const { data: subscription, isLoading: isLoadingSub } = useGetUserSubscription({
    query: { enabled: !!isSignedIn && !bypassSubscription, queryKey: getGetUserSubscriptionQueryKey() },
  });
  const hasAccess =
    bypassSubscription ||
    !!subscription?.isActive ||
    (subscription?.trialDaysLeft ?? 0) > 0;

  const GameComponent = gameId ? GAME_COMPONENTS[gameId] : null;

  useEffect(() => {
    if (isAuthLoaded && !isSignedIn) {
      openSignIn({
        forceRedirectUrl: `/games/${gameId}`,
        signUpForceRedirectUrl: `/games/${gameId}`,
      });
    }
  }, [isAuthLoaded, isSignedIn, gameId, openSignIn]);

  return (
    <div className="flex min-h-screen flex-col bg-[#F0F4F8]">
      <Navbar />

      <main className="flex-1">
        {/* ── Header ──────────────────────────────────────────── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0A4D68] to-[#2C5F7A]">
          <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-[#FF6B00]/20 blur-2xl" />
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-7">
            <Link
              href="/games"
              className="inline-flex items-center text-sm font-bold text-white/70 hover:text-white transition-colors mb-5 gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Înapoi la jocuri
            </Link>

            {isLoading && !game ? (
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

        {/* ── Game content ─────────────────────────────────────── */}
        <div className="max-w-[1400px] mx-auto px-2 md:px-4 py-3 md:py-5">
          {!isAuthLoaded || !isSignedIn ? (
            <div className="p-16 bg-white rounded-2xl border-2 border-dashed border-[#E5E7EB] text-center">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-xl font-black text-[#1F2937] mb-2">Conectează-te pentru a juca</h3>
              <p className="text-base text-muted-foreground">Finalizează autentificarea în fereastra apărută.</p>
            </div>
          ) : isLoading && !game ? (
            /* Only show skeleton when we have no static fallback either */
            <div className="space-y-4">
              <Skeleton className="h-5 w-2/3 rounded-lg" />
              <Skeleton className="h-[520px] w-full rounded-2xl" />
            </div>
          ) : game ? (
            <div className="space-y-4">
              {game.description && (
                <p className="text-muted-foreground text-base leading-relaxed max-w-2xl px-1">
                  {game.description}
                </p>
              )}

              {/* Subscription gate */}
              {!hasAccess && !isLoadingSub ? (
                <div className="relative overflow-hidden bg-gradient-to-br from-[#0A4D68] via-[#0F6080] to-[#0C5C48] rounded-2xl p-10 md:p-14 text-center text-white shadow-[0px_10px_30px_rgba(10,77,104,.25)]">
                  <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-[#FF6B00]/20 blur-2xl" />
                  <div className="relative">
                    <Lock className="h-10 w-10 mx-auto mb-4 text-[#FFD700]" />
                    <h3 className="text-2xl font-black mb-2">Deblochează acest joc</h3>
                    <p className="text-white/70 mb-6 max-w-md mx-auto">
                      Alege un abonament și începe cu 7 zile gratuite ca să joci {game.title} și toate celelalte jocuri.
                    </p>
                    <Link href="/pricing">
                      <button className="h-[52px] px-8 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF9A3C] text-white font-black text-base shadow-[0px_8px_20px_rgba(255,107,0,.45)] hover:shadow-[0px_12px_28px_rgba(255,107,0,.60)] hover:from-[#E55A00] hover:to-[#E58A2C] transition-all duration-300">
                        Vezi abonamentele →
                      </button>
                    </Link>
                  </div>
                </div>
              ) : GameComponent ? (
                /* ── Game card — wide, minimal padding ────────── */
                <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-[0px_8px_30px_rgba(0,0,0,.08)]">
                  {/* Coloured category header strip */}
                  <div className={`bg-gradient-to-r ${categoryGradient(game.category)} px-5 py-3.5 flex items-center gap-3`}>
                    <span className="text-2xl">{categoryEmoji(game.category)}</span>
                    <span className="text-lg font-black text-white drop-shadow-sm">{game.title}</span>
                  </div>

                  {/* Game component — Suspense catches the lazy chunk download */}
                  <Suspense
                    fallback={
                      <div className="flex flex-col items-center justify-center min-h-[420px] gap-4 text-[#4B5563]">
                        <span className="text-6xl animate-bounce">{categoryEmoji(game.category)}</span>
                        <span className="text-sm font-semibold animate-pulse">Se încarcă jocul…</span>
                      </div>
                    }
                  >
                    {/* CSS zoom enlarges every game uniformly on larger screens;
                        pointer math stays correct because games read positions
                        relative to getBoundingClientRect(). */}
                    <div className="p-2 md:p-4 lg:p-5 md:[zoom:1.2] xl:[zoom:1.35]">
                      <GameComponent />
                    </div>
                  </Suspense>
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
