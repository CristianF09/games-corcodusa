import { useUser } from "@clerk/react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetUserSubscription, useCreateCustomerPortal, useGetCurrentUser } from "@workspace/api-client-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { CheckCircle2, XCircle } from "lucide-react";

export default function Dashboard() {
  const { user: clerkUser } = useUser();
  const { data: dbUser, isLoading: isLoadingDbUser } = useGetCurrentUser();
  const { data: subscription, isLoading: isLoadingSub } = useGetUserSubscription();
  const createPortal = useCreateCustomerPortal();

  const handleManageSubscription = () => {
    createPortal.mutate(
      undefined,
      { onSuccess: (data) => { window.location.href = data.url; } },
    );
  };

  const isLoading = isLoadingSub || isLoadingDbUser;

  return (
    <div className="flex min-h-screen flex-col bg-[#F0F4F8]">
      <Navbar />

      <main className="flex-1">
        {/* Gradient header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0A4D68] to-[#2C5F7A]">
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#FF6B00]/20 blur-2xl" />
          <div className="max-w-[1152px] mx-auto px-10 py-10">
            <h1 className="text-4xl font-black text-white">Contul meu</h1>
            <p className="text-white/60 text-base mt-1">Gestionează abonamentul și preferințele tale</p>
          </div>
        </div>

        <div className="max-w-[1152px] mx-auto px-10 py-10">
          <div className="grid md:grid-cols-3 gap-8">

            {/* Profile card */}
            <div className="md:col-span-1">
              <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,.08)] p-7 text-center flex flex-col items-center gap-4">
                {/* Avatar with orange ring */}
                <div className="relative">
                  <div className="h-24 w-24 rounded-full overflow-hidden ring-4 ring-[#FF6B00]/20 ring-offset-2">
                    {clerkUser?.imageUrl ? (
                      <img src={clerkUser.imageUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-[#FF6B00] to-[#FF9A3C] flex items-center justify-center text-white font-black text-2xl">
                        {clerkUser?.firstName?.[0] || clerkUser?.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-black text-[#1F2937]">
                    {clerkUser?.firstName} {clerkUser?.lastName}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{clerkUser?.primaryEmailAddress?.emailAddress}</p>
                </div>

                {isLoadingSub ? (
                  <Skeleton className="h-8 w-36 rounded-xl" />
                ) : subscription?.isActive ? (
                  <span className="inline-flex items-center gap-1.5 bg-[rgba(37,184,56,0.10)] text-[#16A34A] text-sm font-bold px-4 py-1.5 rounded-xl border border-[#25B838]/30">
                    <CheckCircle2 className="h-4 w-4" /> Abonament Activ
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-[#F3F4F6] text-[#6B7280] text-sm font-bold px-4 py-1.5 rounded-xl border border-[#E5E7EB]">
                    <XCircle className="h-4 w-4" /> Fără abonament
                  </span>
                )}
              </div>
            </div>

            {/* Subscription details + CTA */}
            <div className="md:col-span-2 flex flex-col gap-6">
              {/* Subscription card */}
              <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,.08)] p-8">
                <h2 className="text-xl font-black text-[#1F2937] mb-6">Detalii abonament</h2>

                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl">
                      <div>
                        <p className="font-bold text-[#1F2937]">Tip abonament</p>
                        <p className="text-sm text-muted-foreground capitalize mt-0.5">
                          {dbUser?.subscriptionTier === "free" ? "Gratuit" : dbUser?.subscriptionTier || subscription?.tier || "—"}
                        </p>
                      </div>
                      <span className={[
                        "text-sm font-bold px-3 py-1.5 rounded-xl border",
                        subscription?.isActive
                          ? "bg-[rgba(37,184,56,0.10)] text-[#16A34A] border-[#25B838]/30"
                          : "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]",
                      ].join(" ")}>
                        {subscription?.isActive ? "Activ" : "Inactiv"}
                      </span>
                    </div>

                    {dbUser?.trialDaysLeft !== undefined && dbUser.trialDaysLeft > 0 && (
                      <div className="p-4 bg-[rgba(255,215,0,0.08)] border border-[#FFD700]/30 rounded-xl">
                        <p className="font-black text-[#1F2937] flex items-center gap-2">
                          <span className="text-lg">⏳</span> Perioadă de probă
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Mai ai <strong className="text-[#1F2937]">{dbUser.trialDaysLeft} zile</strong> din perioada de probă gratuită.
                        </p>
                      </div>
                    )}

                    {subscription?.expiresAt && (
                      <div className="p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl">
                        <p className="text-sm font-bold text-muted-foreground mb-1">Următoarea facturare / Expirare</p>
                        <p className="font-black text-[#1F2937]">
                          {format(new Date(subscription.expiresAt), "d MMMM yyyy", { locale: ro })}
                        </p>
                      </div>
                    )}

                    <div className="pt-2">
                      {subscription?.stripePriceId ? (
                        <button
                          onClick={handleManageSubscription}
                          disabled={createPortal.isPending}
                          className="h-12 px-6 rounded-xl bg-gradient-to-r from-[#0A4D68] to-[#2C5F7A] text-white font-black text-base shadow-[0px_6px_20px_rgba(10,77,104,.30)] hover:shadow-[0px_10px_28px_rgba(10,77,104,.45)] hover:from-[#083D52] hover:to-[#255570] transition-all duration-300 disabled:opacity-60"
                        >
                          {createPortal.isPending ? "Se încarcă..." : "Gestionează abonamentul →"}
                        </button>
                      ) : (
                        <Link href="/pricing">
                          <button className="h-12 px-6 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF9A3C] text-white font-black text-base shadow-[0px_6px_20px_rgba(255,107,0,.35)] hover:shadow-[0px_10px_28px_rgba(255,107,0,.50)] hover:from-[#E55A00] hover:to-[#E58A2C] transition-all duration-300">
                            Alege un abonament →
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Games CTA */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#0A4D68] via-[#0F6080] to-[#0C5C48] rounded-2xl p-8 text-center text-white shadow-[0px_10px_30px_rgba(10,77,104,.25)]">
                <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-[#FF6B00]/20 blur-2xl" />
                <div className="relative">
                  <h3 className="text-2xl font-black mb-2">Gata de joacă? 🎮</h3>
                  <p className="text-white/70 mb-6 max-w-md mx-auto">
                    Descoperă noile jocuri educaționale pe care le-am pregătit pentru copilul tău.
                  </p>
                  <Link href="/games">
                    <button className="h-[52px] px-8 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF9A3C] text-white font-black text-base shadow-[0px_8px_20px_rgba(255,107,0,.45)] hover:shadow-[0px_12px_28px_rgba(255,107,0,.60)] hover:from-[#E55A00] hover:to-[#E58A2C] transition-all duration-300">
                      Mergi la jocuri →
                    </button>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
