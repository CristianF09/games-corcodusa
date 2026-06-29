import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth, useClerk } from "@clerk/react";
import { Game } from "@workspace/api-client-react";
import { gameTileStyle } from "@/lib/game-tile-style";

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const [, setLocation] = useLocation();
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const style = gameTileStyle(game.id);
  const [imgFailed, setImgFailed] = useState(false);

  function handlePlay(e: React.MouseEvent) {
    e.stopPropagation();
    if (!isSignedIn) {
      openSignIn({
        forceRedirectUrl: `/games/${game.id}`,
        signUpForceRedirectUrl: "/pricing",
      });
      return;
    }
    setLocation(`/games/${game.id}`);
  }

  return (
    <div
      className={`group relative bg-gradient-to-b ${style.gradient} rounded-3xl overflow-hidden cursor-pointer flex flex-col h-full min-h-[260px] transition-all duration-300 shadow-[0px_8px_25px_-4px_rgba(0,0,0,.35)] hover:shadow-[0px_20px_45px_-8px_rgba(0,0,0,.45)] hover:-translate-y-2`}
      role="button"
      tabIndex={0}
      onClick={handlePlay}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePlay(e as unknown as React.MouseEvent); }}
    >
      {/* Inner top shine */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-white/35 rounded-t-3xl" />
      {/* Hover darkening overlay */}
      <div className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-3xl" />

      {/* ── Badges row ── */}
      <div className="relative flex items-start justify-between px-3 pt-3 z-10">
        <div className="flex flex-col gap-1">
          {game.isNew && (
            <span className="inline-flex items-center gap-1 bg-[#FFD700] text-[#1F2937] text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">
              ✨ NOU
            </span>
          )}
          {game.requiresSubscription && (
            <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
              👑 PREMIUM
            </span>
          )}
        </div>
        <span className="bg-black/20 backdrop-blur-sm text-[10px] font-bold text-white/90 px-2 py-0.5 rounded-md">
          {game.ageMin}–{game.ageMax} ani
        </span>
      </div>

      {/* ── Game image (center) ── */}
      <div className="relative flex-1 flex items-center justify-center py-2 z-10 px-4">
        {style.imagePath && !imgFailed ? (
          <img
            src={style.imagePath}
            alt={game.title}
            className="h-[96px] w-[96px] object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,.40)] transition-transform duration-300 group-hover:scale-110 select-none rounded-xl"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : style.isTextVisual ? (
          <span className="text-[2.6rem] leading-none font-black text-white tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,.35)] transition-transform duration-300 group-hover:scale-110 select-none">
            {style.visual}
          </span>
        ) : (
          <span className="text-6xl drop-shadow-[0_4px_12px_rgba(0,0,0,.30)] transition-transform duration-300 group-hover:scale-110 select-none leading-none">
            {style.visual}
          </span>
        )}
      </div>

      {/* ── Game title ── */}
      <div className="relative px-3 pb-1 z-10 text-center">
        <p className="text-white font-black text-xs leading-tight line-clamp-2 drop-shadow-[0_1px_3px_rgba(0,0,0,.40)]">
          {game.title}
        </p>
      </div>

      {/* ── "Joacă" button ── */}
      <div className="relative px-4 pb-4 pt-2 z-10">
        <button
          type="button"
          onClick={handlePlay}
          className="w-full h-11 rounded-2xl bg-white/95 text-[#1F2937] font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(0,0,0,.20)] transition-all duration-300 group-hover:bg-white group-hover:shadow-[0_6px_20px_rgba(0,0,0,.30)] group-hover:scale-[1.02]"
        >
          <span className="text-base">▶</span> Joacă acum
        </button>
      </div>
    </div>
  );
}
