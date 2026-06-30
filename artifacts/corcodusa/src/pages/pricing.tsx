import { useListProducts, useCreateCheckoutSession } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2 } from "lucide-react";
import { useAuth, useClerk } from "@clerk/react";
import { useLocation } from "wouter";

export default function Pricing() {
  const { data: products, isLoading } = useListProducts();
  const createCheckout = useCreateCheckoutSession();
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const [, setLocation] = useLocation();

  const monthlyProduct = products?.find((p) => p.interval === "month");
  const annualProduct = products?.find((p) => p.interval === "year");

  const handleSubscribe = (priceId: string | undefined, interval: string | undefined) => {
    if (!priceId) return;
    if (!isSignedIn) {
      openSignIn({ forceRedirectUrl: "/pricing", signUpForceRedirectUrl: "/pricing" });
      return;
    }
    createCheckout.mutate(
      { data: { priceId, interval } },
      { onSuccess: (data) => { window.location.href = data.url; } },
    );
  };

  const handleFreeStart = () => {
    if (!isSignedIn) {
      openSignIn({ forceRedirectUrl: "/games", signUpForceRedirectUrl: "/games" });
      return;
    }
    setLocation("/games");
  };

  const features = [
    "Acces nelimitat la toate cele 10 jocuri",
    "Fără reclame, niciodată",
    "Jocuri noi adăugate lunar",
    "Funcționează pe orice dispozitiv",
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#F0F4F8]">
      <Navbar />

      <main className="flex-1">
        {/* ── Header ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0A4D68] via-[#0F6080] to-[#0C5C48] py-20 md:py-28 text-center px-10">
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#FF6B00]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-[#FFD700]/10 blur-3xl" />

          <div className="relative">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
              Alege planul{" "}
              <span className="text-[#FFD700]">potrivit</span>{" "}
              pentru familia ta
            </h1>
            <p className="text-white/75 text-xl max-w-2xl mx-auto">
              Începe gratuit 7 zile, fără nicio obligație.
            </p>
          </div>
        </div>

        {/* ── Plan cards ── */}
        <div className="max-w-[1152px] mx-auto px-6 md:px-10 py-16 md:py-24">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-center">

            {/* ── FREE TRIAL card ── */}
            <div className="bg-white rounded-2xl border-2 border-[#22C55E] shadow-[0px_8px_30px_rgba(34,197,94,.15)] flex flex-col overflow-hidden">
              <div className="bg-gradient-to-r from-[#15803D] to-[#22C55E] px-6 py-5 text-center">
                <span className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-black px-3 py-1 rounded-lg mb-2">
                  🎉 FĂRĂ CARD
                </span>
                <h2 className="text-xl font-black text-white">7 Zile Gratuit</h2>
                <p className="text-white/80 text-sm mt-1">Fără nicio obligație.</p>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-6 text-center">
                  <span className="text-6xl font-black text-[#1F2937]">0</span>
                  <div className="inline-block ml-1 mb-1">
                    <span className="text-2xl font-black text-[#1F2937]">Lei</span>
                    <p className="text-sm text-muted-foreground">7 zile</p>
                  </div>
                </div>

                <ul className="space-y-3 flex-1 mb-8">
                  {[
                    "Acces la toate cele 10 jocuri",
                    "Fără reclame",
                    "Fără card bancar",
                    "Anulare automată după 7 zile",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-[#22C55E] shrink-0 mt-0.5" />
                      <span className="text-sm text-[#374151]">{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={handleFreeStart}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#15803D] to-[#22C55E] text-white font-black text-sm shadow-[0px_6px_18px_rgba(34,197,94,.35)] hover:shadow-[0px_10px_25px_rgba(34,197,94,.50)] transition-all duration-300"
                >
                  Începe gratuit →
                </button>
              </div>
            </div>

            {/* ── ANNUAL card — featured ── */}
            <div className="relative bg-white rounded-2xl overflow-hidden md:-translate-y-4 shadow-[0px_20px_60px_-10px_rgba(255,107,0,.28),0px_10px_25px_-8px_rgba(0,0,0,.14)]"
              style={{ outline: "2px solid #FF6B00" }}>
              <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF9A3C] px-6 py-5 relative overflow-hidden">
                <div className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10" />
                <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-black px-3 py-1 rounded-lg mb-2">
                  ⭐ CEL MAI BUN · -25%
                </span>
                <h2 className="text-xl font-black text-white">Abonament Anual</h2>
                <p className="text-white/80 text-sm mt-1">Cel mai mic preț pe lună.</p>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-1 flex items-end gap-2">
                  {isLoading ? (
                    <Skeleton className="h-14 w-32 rounded-lg" />
                  ) : (
                    <>
                      <span className="text-6xl font-black text-[#1F2937]">
                        {annualProduct ? Math.round(annualProduct.amount / 100) : 603}
                      </span>
                      <div className="mb-2">
                        <span className="text-2xl font-black text-[#1F2937]">Lei</span>
                        <p className="text-sm text-muted-foreground">/ an</p>
                      </div>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  <span className="line-through">804 Lei</span>{" "}
                  <span className="font-bold text-[#FF6B00]">economisești 25%</span>
                </p>
                <p className="text-sm font-semibold text-[#22C55E] mb-5">
                  ✓ Include 7 zile gratuite
                </p>

                <ul className="space-y-3 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-[#FF6B00] shrink-0 mt-0.5" />
                      <span className="text-sm text-[#374151]">{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  <button
                    type="button"
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF9A3C] text-white font-black text-sm shadow-[0px_8px_25px_rgba(255,107,0,.45)] hover:shadow-[0px_14px_35px_rgba(255,107,0,.60)] hover:from-[#E55A00] hover:to-[#E58A2C] transition-all duration-300 disabled:opacity-60"
                    onClick={() => handleSubscribe(annualProduct?.priceId, annualProduct?.interval ?? "year")}
                    disabled={createCheckout.isPending || (!isLoading && !annualProduct)}
                  >
                    {createCheckout.isPending ? "Se procesează..." : "Abonează-te anual →"}
                  </button>
                </div>
              </div>
            </div>

            {/* ── MONTHLY card ── */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0px_8px_30px_rgba(0,0,0,.08)] flex flex-col overflow-hidden">
              <div className="bg-gradient-to-r from-[#0A4D68] to-[#2C5F7A] px-6 py-5">
                <h2 className="text-xl font-black text-white">Abonament Lunar</h2>
                <p className="text-white/70 text-sm mt-1">Flexibil, fără angajament pe termen lung.</p>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-2 flex items-end gap-2">
                  {isLoading ? (
                    <Skeleton className="h-14 w-32 rounded-lg" />
                  ) : (
                    <>
                      <span className="text-6xl font-black text-[#1F2937]">
                        {monthlyProduct ? Math.round(monthlyProduct.amount / 100) : 67}
                      </span>
                      <div className="mb-2">
                        <span className="text-2xl font-black text-[#1F2937]">Lei</span>
                        <p className="text-sm text-muted-foreground">/ lună</p>
                      </div>
                    </>
                  )}
                </div>
                <p className="text-sm font-semibold text-[#22C55E] mb-5">
                  ✓ Include 7 zile gratuite
                </p>

                <ul className="space-y-3 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-[#2C5F7A] shrink-0 mt-0.5" />
                      <span className="text-sm text-[#374151]">{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  <button
                    type="button"
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-[#0A4D68] to-[#2C5F7A] text-white font-black text-sm shadow-[0px_6px_20px_rgba(10,77,104,.35)] hover:shadow-[0px_10px_28px_rgba(10,77,104,.50)] hover:from-[#083D52] hover:to-[#255570] transition-all duration-300 disabled:opacity-60"
                    onClick={() => handleSubscribe(monthlyProduct?.priceId, monthlyProduct?.interval ?? "month")}
                    disabled={createCheckout.isPending || (!isLoading && !monthlyProduct)}
                  >
                    {createCheckout.isPending ? "Se procesează..." : "Abonează-te lunar →"}
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* ── Reassurance strip ── */}
          <div className="mt-14 flex justify-center">
            <div className="inline-flex flex-wrap justify-center gap-6 bg-white rounded-2xl border border-[#E5E7EB] px-8 py-5 shadow-[0px_4px_15px_rgba(0,0,0,.06)]">
              {[
                { icon: "🛡️", text: "Fără reclame" },
                { icon: "👶", text: "100% sigur pentru copii" },
                { icon: "🔒", text: "Plată securizată prin Stripe" },
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   