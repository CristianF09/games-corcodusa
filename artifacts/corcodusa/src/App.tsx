import {
  ClerkProvider,
  SignIn,
  SignUp,
  Show,
  useUser,
  useAuth,
  useClerk,
  useSession,
} from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUpsertUser, setAuthTokenGetter } from "@workspace/api-client-react";

import Home from "@/pages/home";
import Games from "@/pages/games";
import GameDetail from "@/pages/game-detail";
import Dashboard from "@/pages/dashboard";
import Pricing from "@/pages/pricing";
import NotFound from "@/pages/not-found";
import { roLocalization } from "@/lib/clerk-ro";

const queryClient = new QueryClient();

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/og-image.png`,
  },
  variables: {
    colorPrimary: "#FF6B00",
    colorForeground: "#1F2937",
    colorMutedForeground: "#4B5563",
    colorDanger: "#DC2626",
    colorBackground: "#FFFFFF",
    colorInput: "#FFFFFF",
    colorInputForeground: "#1F2937",
    colorNeutral: "#E5E7EB",
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    borderRadius: "12px",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white/95 backdrop-blur-xl rounded-2xl w-[440px] max-w-full overflow-hidden border border-white/20 shadow-[0px_25px_50px_-12px_rgba(0,0,0,.35)]",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    logoBox: "pt-6 pb-2",
    logoImage: "h-16 w-auto object-contain mx-auto",
    headerTitle: "font-bold text-2xl text-[#1F2937]",
    headerSubtitle: "text-[#4B5563]",
    socialButtonsBlockButtonText: "font-semibold text-[#1F2937]",
    formFieldLabel: "font-bold text-[#1F2937]",
    footerActionLink: "font-bold text-[#FF6B00] hover:text-[#E55A00] transition-colors",
    footerActionText: "text-[#4B5563]",
    dividerText: "text-[#4B5563]",
    identityPreviewEditButton: "text-[#FF6B00]",
    formFieldSuccessText: "text-[#2C5F7A]",
    alertText: "font-bold",
    formButtonPrimary: "font-bold bg-gradient-to-r from-[#FF6B00] to-[#FF9A3C] shadow-[0px_8px_20px_-3px_rgba(255,107,0,.45)] hover:shadow-[0px_12px_25px_-3px_rgba(255,107,0,.55)] hover:from-[#E55A00] hover:to-[#E58A2C] transition-all rounded-xl",
    formFieldInput: "rounded-xl focus:border-[#FF6B00] focus:ring-[#FF6B00]/10",
  },
};

function AuthPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center px-4 py-12 overflow-hidden">
      {/* Gradient background: deep teal → teal-green */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A4D68] via-[#0F6080] to-[#0C5C48]" />

      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-[#FF6B00]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#FFD700]/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full bg-white/5 blur-2xl" />

      {/* Decorative rings */}
      <div className="pointer-events-none absolute top-16 left-10 h-24 w-24 rounded-full border-2 border-white/10" />
      <div className="pointer-events-none absolute top-20 left-14 h-14 w-14 rounded-full border border-white/8" />
      <div className="pointer-events-none absolute bottom-24 right-12 h-16 w-16 rounded-full bg-[#FF6B00]/15" />
      <div className="pointer-events-none absolute bottom-20 right-20 h-8 w-8 rounded-full border border-[#FFD700]/25" />

      <div className="relative z-10 w-full max-w-[440px] animate-in fade-in zoom-in duration-500">
        {/* Logo icon + brand name above Clerk card */}
        <div className="text-center mb-7">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img
              src="/logo-icon.png"
              alt="Corcodusa"
              className="h-14 w-14 object-contain drop-shadow-[0_4px_16px_rgba(255,107,0,.55)]"
            />
            <span className="text-3xl font-black text-white leading-none">
              Corcodușa<span className="text-[#FFD700]">.ro</span>
            </span>
          </div>
          <p className="text-white/50 text-sm font-medium tracking-wide">
            Platforma educațională pentru copii
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}

function SignInPage() {
  return (
    <AuthPageShell>
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </AuthPageShell>
  );
}

function SignUpPage() {
  return (
    <AuthPageShell>
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </AuthPageShell>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

// Sync user with backend
function UserSync() {
  const { user } = useUser();
  const { isLoaded, isSignedIn } = useAuth();
  const upsertUser = useUpsertUser();
  const syncedRef = useRef(false);

  useEffect(() => {
    if (isLoaded && isSignedIn && user && !syncedRef.current) {
      syncedRef.current = true;
      upsertUser.mutate({
        data: {
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress ?? "",
          firstName: user.firstName,
          lastName: user.lastName,
          avatarUrl: user.imageUrl,
        }
      });
    }
  }, [isLoaded, isSignedIn, user, upsertUser]);

  return null;
}

// Wire the Clerk session JWT as Bearer token on every API call so the
// FastAPI backend can verify the user identity via require_auth.
function ClerkAuthTokenSync() {
  const { session } = useSession();

  useEffect(() => {
    if (session) {
      setAuthTokenGetter(() => session.getToken());
    } else {
      setAuthTokenGetter(null);
    }
  }, [session]);

  return null;
}

function HomeRedirect() {
  // Single-page layout: everyone sees the home page.
  // Signed-in users play games directly from the grid on the home page.
  return <Home />;
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  // Auth disabled for testing — all routes are freely accessible
  return <Component />;
  /*
  return (
    <>
      <Show when="signed-in">
        <Component />
      </Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  );
  */
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={roLocalization}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <ClerkAuthTokenSync />
        <UserSync />
        <Switch>
          <Route path="/" component={HomeRedirect} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          <Route path="/pricing" component={Pricing} />

          <Route path="/games">
            {() => <ProtectedRoute component={Games} />}
          </Route>
          <Route path="/games/:id">
            {() => <ProtectedRoute component={GameDetail} />}
          </Route>
          <Route path="/dashboard">
            {() => <ProtectedRoute component={Dashboard} />}
          </Route>

          <Route component={NotFound} />
        </Switch>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={basePath}>
        <ClerkProviderWithRoutes />
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
