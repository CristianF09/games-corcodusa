import { useUser } from "@clerk/react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetUserSubscription, useCreateCustomerPortal, useGetCurrentUser } from "@workspace/api-client-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

export default function Dashboard() {
  const { user: clerkUser } = useUser();
  const { data: dbUser, isLoading: isLoadingDbUser } = useGetCurrentUser();
  const { data: subscription, isLoading: isLoadingSub } = useGetUserSubscription();
  const createPortal = useCreateCustomerPortal();

  const handleManageSubscription = () => {
    createPortal.mutate({}, {
      onSuccess: (data) => {
        window.location.href = data.url;
      }
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8 md:py-12">
        <h1 className="font-display text-4xl font-bold mb-8">Contul meu</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <Card className="rounded-3xl border-2 shadow-sm overflow-hidden">
              <CardContent className="p-6 text-center flex flex-col items-center">
                <div className="h-24 w-24 rounded-full overflow-hidden mb-4 border-4 border-primary/20">
                  {clerkUser?.imageUrl ? (
                    <img src={clerkUser.imageUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                      {clerkUser?.firstName?.[0] || clerkUser?.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <h2 className="font-display text-2xl font-bold">
                  {clerkUser?.firstName} {clerkUser?.lastName}
                </h2>
                <p className="text-muted-foreground mb-4">{clerkUser?.primaryEmailAddress?.emailAddress}</p>
                
                {isLoadingSub ? (
                  <Skeleton className="h-8 w-32 rounded-full" />
                ) : subscription?.isActive ? (
                  <Badge className="bg-secondary text-secondary-foreground font-bold px-3 py-1 rounded-full border-none">
                    Abonament Activ
                  </Badge>
                ) : (
                  <Badge variant="outline" className="font-bold px-3 py-1 rounded-full">
                    Fără abonament activ
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2 space-y-6">
            <Card className="rounded-3xl border-2 shadow-sm">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Detalii abonament</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {isLoadingSub || isLoadingDbUser ? (
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-6 w-1/3" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                      <div>
                        <p className="font-semibold text-foreground">Tip abonament</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {dbUser?.subscriptionTier === 'free' ? 'Gratuit' : dbUser?.subscriptionTier || subscription?.tier}
                        </p>
                      </div>
                      <Badge variant={subscription?.isActive ? "default" : "secondary"}>
                        {subscription?.isActive ? "Activ" : "Inactiv"}
                      </Badge>
                    </div>

                    {dbUser?.trialDaysLeft !== undefined && dbUser.trialDaysLeft > 0 && (
                      <div className="p-4 bg-accent/10 border border-accent/20 rounded-2xl">
                        <p className="font-bold text-accent-foreground">Perioadă de probă</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Mai ai {dbUser.trialDaysLeft} zile din perioada de probă gratuită.
                        </p>
                      </div>
                    )}

                    {subscription?.expiresAt && (
                      <div>
                        <p className="font-semibold text-sm text-muted-foreground mb-1">Următoarea facturare / Expirare</p>
                        <p>{format(new Date(subscription.expiresAt), "d MMMM yyyy", { locale: ro })}</p>
                      </div>
                    )}

                    <div className="pt-4 flex gap-4">
                      {subscription?.stripePriceId ? (
                         <Button 
                           onClick={handleManageSubscription} 
                           disabled={createPortal.isPending}
                           className="rounded-full font-bold"
                         >
                           {createPortal.isPending ? "Se încarcă..." : "Gestionează abonamentul"}
                         </Button>
                      ) : (
                        <Link href="/pricing">
                          <Button className="rounded-full font-bold">
                            Alege un abonament
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-2 shadow-sm bg-primary/5 border-primary/20">
              <CardContent className="p-8 text-center flex flex-col items-center">
                <h3 className="font-display text-2xl font-bold mb-2">Gata de joacă?</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Descoperă noile jocuri educaționale pe care le-am pregătit pentru copilul tău.
                </p>
                <Link href="/games">
                  <Button size="lg" className="rounded-full font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                    Mergi la jocuri
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
