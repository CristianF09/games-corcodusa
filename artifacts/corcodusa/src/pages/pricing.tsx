import { useListProducts, useCreateCheckoutSession } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@clerk/react";
import { useLocation } from "wouter";

export default function Pricing() {
  const { data: products, isLoading } = useListProducts();
  const createCheckout = useCreateCheckoutSession();
  const { isSignedIn } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubscribe = (priceId: string, trialDays?: number) => {
    if (!isSignedIn) {
      setLocation("/sign-up");
      return;
    }

    createCheckout.mutate({
      data: { priceId, trialDays }
    }, {
      onSuccess: (data) => {
        window.location.href = data.url;
      }
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Investește în educația copilului tău
          </h1>
          <p className="text-xl text-muted-foreground">
            Alege planul potrivit pentru familia ta. Fără reclame, 100% sigur și educativ.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Trial Package (Always shown as option 1 per requirements) */}
          <Card className="rounded-3xl border-2 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2 bg-secondary" />
            <CardHeader className="pt-8">
              <CardTitle className="font-display text-3xl font-bold">Acces Gratuit 7 Zile</CardTitle>
              <p className="text-muted-foreground mt-2">Testează platforma, fără obligații.</p>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-8">
                <span className="text-5xl font-bold">0 RON</span>
                <span className="text-muted-foreground font-medium ml-2">/ primele 7 zile</span>
              </div>
              
              <ul className="space-y-4">
                {[
                  "Acces nelimitat la toate jocurile",
                  "Fără reclame",
                  "Jocuri noi adăugate lunar",
                  "Funcționează pe orice dispozitiv",
                  "Poți anula oricând cu un click"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-secondary shrink-0" />
                    <span className="font-medium text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pb-8">
              {isLoading ? (
                <Skeleton className="h-14 w-full rounded-full" />
              ) : products?.[0] ? (
                <Button 
                  size="lg" 
                  className="w-full h-14 rounded-full font-bold text-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-xl"
                  onClick={() => handleSubscribe(products[0].priceId, 7)}
                  disabled={createCheckout.isPending}
                >
                  {createCheckout.isPending ? "Se procesează..." : "Începe gratuit"}
                </Button>
              ) : null}
            </CardFooter>
          </Card>

          {/* Paid Packages from API */}
          {isLoading ? (
            <Skeleton className="h-full rounded-3xl" />
          ) : products?.map((product) => (
            <Card key={product.id} className="rounded-3xl border-2 border-primary shadow-xl flex flex-col relative overflow-hidden transform md:-translate-y-4 bg-primary/5">
              {product.isPopular && (
                <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground border-none font-bold rounded-full px-4 py-1.5">
                  Recomandat
                </Badge>
              )}
              <div className="absolute top-0 inset-x-0 h-2 bg-primary" />
              <CardHeader className="pt-8">
                <CardTitle className="font-display text-3xl font-bold">{product.name}</CardTitle>
                <p className="text-muted-foreground mt-2">{product.description}</p>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-8">
                  <span className="text-5xl font-bold">{product.amount} {product.currency}</span>
                  <span className="text-muted-foreground font-medium ml-2">/ {product.interval === 'month' ? 'lună' : product.interval === 'year' ? 'an' : 'perioadă'}</span>
                </div>
                
                <ul className="space-y-4">
                  {[
                    "Tot ce este inclus în perioada gratuită",
                    "Acces la colecția completă de jocuri",
                    "Suport prioritar pentru părinți",
                    "Acces de pe multiple dispozitive simultan"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                      <span className="font-medium text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pb-8">
                <Button 
                  size="lg" 
                  className="w-full h-14 rounded-full font-bold text-lg shadow-xl"
                  onClick={() => handleSubscribe(product.priceId)}
                  disabled={createCheckout.isPending}
                >
                  {createCheckout.isPending ? "Se procesează..." : "Alege Acces Complet"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
