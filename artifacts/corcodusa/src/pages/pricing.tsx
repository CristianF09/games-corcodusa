import { useListProducts, useCreateCheckoutSession } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
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
    createCheckout.mutate(
      { data: { priceId, trialDays } },
      { onSuccess: (data) => { window.location.href = data.url; } },
    );
  };

  const features = {
    trial: [
      "Acces nelimitat la toate jocurile",
      "Fără reclame",
      "Jocuri noi adăugate lunar",
      "Funcționează pe orice dispozitiv",
      "Poți anula oricând cu un click",
    ],
    paid: [
      "Tot ce este inclus în perioada gratuită",
      "Acces la colecția completă de jocuri",
      "Suport prioritar pentru părinți",
      "Acces de pe multiple dispozitive simultan",
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F0F4F8]">
      <Navbar />

      <main className="flex-1">
        {/* Header with gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0A4D68] via-[#0F6080] to-[#0C5C48] py-20 md:py-28 text-center px-10">
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#FF6B00]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-[#FFD700]/10 blur-3xl" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 bg-white/15 text-white text-sm font-bold px-4 py-1.5 rounded-xl mb-6">
              <span className="h-2 w-2 rounded-full bg-[#FFD700]" />
              7 zile gratuite, fără card bancar
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
              Investește în{" "}
              <span className="text-[#FFD700]">educația</span>{" "}
              copilului tău
            </h1>
            <p className="text-white/75 text-xl max-w-2xl mx-auto">
              Alege planul potrivit pentru familia ta. Fără reclame, 100% sigur și educativ.
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="max-w-[1152px] mx-auto px-10 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">

            {/* Trial card */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0px_8px_30px_rgba(0,0,0,.08)] flex flex-col overflow-hidden">
              {/* Teal accent header */}
              <div className="bg-gradient-to-r from-[#0A4D68] to-[#2C5F7A] px-8 py-5">
                <h2 className="text-xl font-black text-white">Acces Gratuit 7 Zile</h2>
                <p className="text-white/70 text-sm mt-1">Testează platforma, fără obligații.</p>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                {/* Price */}
                <div className="mb-8 flex items-end gap-2">
                  <span className="text-6xl font-black text-[#1F2937]">0</span>
                  <div className="mb-2">
                    <span className="text-2xl font-black text-[#1F2937]">RON</span>
                    <p className="text-sm text-muted-foreground">primele 7 zile</p>
                  </div>
                </div>

                <ul className="space-y-3.5 flex-1">
                  {features.trial.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-[#2C5F7A] shrink-0 mt-0.5" />
                      <span className="text-base text-[#374151]">{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  {isLoading ? (
                    <Skeleton className="h-14 w-full rounded-xl" />
                  ) : products?.[0] ? (
                    <button
                      className="w-full h-14 rounded-xl bg-gradient-to-r from-[#0A4D68] to-[#2C5F7A] text-white font-black text-base shadow-[0px_6px_20px_rgba(10,77,104,.35)] hover:shadow-[0px_10px_28px_rgba(10,77,104,.50)] hover:from-[#083D52] hover:to-[#255570] transition-all duration-300 disabled:opacity-60"
                      onClick={() => handleSubscribe(products[0].priceId, 7)}
                      disabled={createCheckout.isPending}
                    >
                      {createCheckout.isPending ? "Se procesează..." : "Începe gratuit →"}
                    </button>
                  ) : null}

                  <p className="text-center text-xs text-muted-foreground mt-3">
                    Nu este necesar cardul bancar
                  </p>
                </div>
              </div>
            </div>

            {/* Paid card — featured */}
            {isLoading ? (
              <Skeleton className="h-full rounded-2xl min-h-[520px]" />
            ) : (
              products?.map((product) => (
                <div
                  key={product.id}
                  className="relative bg-white rounded-2xl overflow-hidden md:-translate-y-5 shadow-[0px_20px_60px_-10px_rgba(255,107,0,.28),0px_10px_25px_-8px_rgba(0,0,0,.14)]"
                  style={{ outline: '2px solid #FF6B00', outlineOffset: '0px' }}
                >
                  {/* Orange gradient header */}
                  <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF9A3C] px-8 py-5 relative overflow-hidden">
                    <div className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10" />
                    {product.isPopular && (
                      <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-black px-3 py-1 rounded-lg mb-2">
                        ⭐ CEL MAI POPULAR
                      </span>
                    )}
                    <h2 className="text-xl font-black text-white">{product.name}</h2>
                    <p className="text-white/80 text-sm mt-1">{product.description}</p>
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    {/* Price */}
                    <div className="mb-8 flex items-end gap-2">
                      <span className="text-6xl font-black text-[#1F2937]">{product.amount}</span>
                      <div className="mb-2">
                        <span className="text-2xl font-black text-[#1F2937]">{product.currency}</span>
                        <p className="text-sm text-muted-foreground">
                          / {product.interval === "month" ? "lună" : product.interval === "year" ? "an" : "perioadă"}
                        </p>
                      </div>
                    </div>

                    <ul className="space-y-3.5 flex-1">
                      {features.paid.map((f) => (
                        <li key={f} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-[#FF6B00] shrink-0 mt-0.5" />
                          <span className="text-base text-[#374151]">{f}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-8">
                      <button
                        className="w-full h-14 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF9A3C] text-white font-black text-base shadow-[0px_8px_25px_rgba(255,107,0,.45)] hover:shadow-[0px_14px_35px_rgba(255,107,0,.60)] hover:from-[#E55A00] hover:to-[#E58A2C] transition-all duration-300 disabled:opacity-60"
                        onClick={() => handleSubscribe(product.priceId)}
                        disabled={createCheckout.isPending}
                      >
                        {createCheckout.isPending ? "Se procesează..." : "Alege Acces Complet →"}
                      </button>

                      {/* Trust indicators */}
                      <div className="flex items-center justify-center gap-3 mt-4">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          🔒 Plată securizată
                        </span>
                        <span className="text-muted-foreground text-xs">·</span>
                        <span className="text-xs text-muted-foreground">
                          Anulare gratuită
                        </span>
                        <span className="text-muted-foreground text-xs">·</span>
                        <span className="text-xs text-muted-foreground">
                          Stripe
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom reassurance */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-8 bg-white rounded-2xl border border-[#E5E7EB] px-8 py-5 shadow-[0px_4px_15px_rgba(0,0,0,.06)]">
              {[
                { icon: "🛡️", text: "Fără reclame" },
                { icon: "👶", text: "100% sigur pentru copii" },
                { icon: "💳", text: "Fără card la trial" },
                { icon: "✅", text: "Anulare cu un click" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-semibold text-[#374151]">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
