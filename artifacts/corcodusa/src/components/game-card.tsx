import { Link } from "wouter";
import { Game } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { categoryEmoji, categoryGradient } from "@/lib/category-colors";

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Link href={`/games/${game.id}`}>
      <Card className="group overflow-hidden rounded-3xl border-2 border-border/50 bg-card hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full flex flex-col">
        {/* Vivid category-colored accent bar */}
        <div className={`h-2 w-full bg-gradient-to-r ${categoryGradient(game.category)}`} />
        <div className="relative">
          <AspectRatio ratio={4/3}>
            <img
              src={game.imageUrl || "/images/game-puzzle.png"}
              alt={game.title}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
          </AspectRatio>
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {game.isNew && (
              <Badge className="bg-accent text-accent-foreground hover:bg-accent/90 border-none font-bold rounded-full px-3 py-1 shadow-sm">
                ✨ Nou!
              </Badge>
            )}
            {game.requiresSubscription && (
              <Badge variant="secondary" className="font-bold rounded-full px-3 py-1 shadow-sm">
                Premium
              </Badge>
            )}
          </div>
        </div>
        <CardContent className="p-5 flex-grow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {categoryEmoji(game.category)} {game.category}
            </span>
            <Badge variant="outline" className="text-xs rounded-full font-semibold">
              {game.ageMin}-{game.ageMax} ani
            </Badge>
          </div>
          <h3 className="font-display text-xl font-bold mb-2 text-card-foreground group-hover:text-primary transition-colors">
            {game.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {game.description}
          </p>
        </CardContent>
        <CardFooter className="p-5 pt-0 mt-auto">
          <div className={`w-full rounded-xl py-3 text-center font-bold text-white bg-gradient-to-r ${categoryGradient(game.category)} shadow-md transition-transform group-hover:scale-[1.02]`}>
            Joacă acum 🚀
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
