import { Link } from "wouter";
import { Game } from "@workspace/api-client-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { categoryEmoji, categoryGradient } from "@/lib/category-colors";

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Link href={`/games/${game.id}`}>
      <div className="group relative bg-white rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full transition-all duration-300 shadow-[0px_4px_20px_rgba(0,0,0,.08)] hover:shadow-[0px_20px_45px_-8px_rgba(0,0,0,.22)] hover:-translate-y-1.5">

        {/* Thumbnail */}
        <div className="relative overflow-hidden">
          <AspectRatio ratio={4 / 3}>
            <img
              src={game.imageUrl || "/images/game-puzzle.png"}
              alt={game.title}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
          </AspectRatio>

          {/* Category accent bar */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${categoryGradient(game.category)}`} />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges top-left */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {game.isNew && (
              <span className="inline-flex items-center gap-1 bg-[#FFD700] text-[#1F2937] text-xs font-black px-2.5 py-1 rounded-lg shadow-sm">
                ✨ Nou
              </span>
            )}
            {game.requiresSubscription && (
              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#0A4D68] to-[#2C5F7A] text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                👑 Premium
              </span>
            )}
          </div>

          {/* Age badge top-right */}
          <div className="absolute top-3 right-3">
            <span className="bg-white/90 backdrop-blur-sm text-xs font-bold text-[#1F2937] px-2 py-1 rounded-lg shadow-sm">
              {game.ageMin}–{game.ageMax} ani
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {categoryEmoji(game.category)} {game.category}
          </span>

          <h3 className="text-base font-black text-[#1F2937] group-hover:text-primary transition-colors leading-snug">
            {game.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed flex-1">
            {game.description}
          </p>

          {/* CTA */}
          <div className="mt-3">
            <div className="w-full h-10 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF9A3C] text-white font-black text-sm flex items-center justify-center gap-2 shadow-[0px_4px_15px_rgba(255,107,0,.30)] group-hover:shadow-[0px_8px_22px_rgba(255,107,0,.45)] group-hover:from-[#E55A00] group-hover:to-[#E58A2C] transition-all duration-300">
              Joacă acum →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
