import { useParams, Link } from "wouter";
import { useGetGame } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play } from "lucide-react";
import { getGetGameQueryKey } from "@workspace/api-client-react";

export default function GameDetail() {
  const { id } = useParams();
  const gameId = id ? parseInt(id, 10) : 0;
  
  const { data: game, isLoading } = useGetGame(gameId, {
    query: {
      enabled: !!gameId,
      queryKey: getGetGameQueryKey(gameId)
    }
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
        <Link href="/games" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Înapoi la jocuri
        </Link>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <Skeleton className="aspect-video w-full rounded-3xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-14 w-48 rounded-full" />
            </div>
          </div>
        ) : game ? (
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div className="relative overflow-hidden rounded-3xl border-4 border-border/50 shadow-2xl">
              <img 
                src={game.imageUrl || "/images/game-puzzle.png"} 
                alt={game.title}
                className="w-full h-full object-cover aspect-video"
              />
              {game.isNew && (
                <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground border-none font-bold rounded-full px-4 py-1.5 shadow-md">
                  Nou!
                </Badge>
              )}
            </div>
            
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="outline" className="uppercase tracking-wider font-bold">
                  {game.category}
                </Badge>
                <Badge variant="secondary" className="font-bold">
                  {game.ageMin}-{game.ageMax} ani
                </Badge>
              </div>
              
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                {game.title}
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {game.description}
              </p>
              
              {game.gameUrl ? (
                <Button size="lg" className="w-fit text-lg px-8 h-14 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                  <Play className="mr-2 h-5 w-5 fill-current" />
                  Joacă acum
                </Button>
              ) : (
                <div className="p-4 bg-secondary/10 text-secondary-foreground rounded-2xl border border-secondary/20">
                  <p className="font-medium text-center">Acest joc nu este disponibil momentan.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Jocul nu a fost găsit</h2>
            <Link href="/games">
              <Button variant="outline" className="rounded-full">Vezi alte jocuri</Button>
            </Link>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
