import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useCurrentUser, loginPath } from "@/lib/auth";

import Home from "@/pages/home";
import Games from "@/pages/games";
import GameDetail from "@/pages/game-detail";
import Dashboard from "@/pages/dashboard";
import Pricing from "@/pages/pricing";
import Autentificare from "@/pages/autentificare";
import ContNou from "@/pages/cont-nou";
import ResetareParola from "@/pages/resetare-parola";
import ResetareParolaNoua from "@/pages/resetare-parola-noua";
import MetodeDePlata from "@/pages/metode-de-plata";
import PoliticaDeConfidentialitate from "@/pages/politica-de-confidentialitate";
import TermeniSiConditii from "@/pages/termeni-si-conditii";
import PoliticaCookie from "@/pages/politica-cookie";
import PoliticaDeRetur from "@/pages/politica-de-retur";
import Faq from "@/pages/faq";
import DespreNoi from "@/pages/despre-noi";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function HomeRedirect() {
  // Single-page layout: everyone sees the home page.
  // Signed-in users play games directly from the grid on the home page.
  return <Home />;
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isSignedIn, isLoading } = useCurrentUser();
  const [location] = useLocation();

  if (isLoading) {
    return <div className="min-h-screen bg-[#F0F4F8]" />;
  }
  if (!isSignedIn) {
    return <Redirect to={loginPath(location)} />;
  }
  return <Component />;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/autentificare" component={Autentificare} />
      <Route path="/cont-nou" component={ContNou} />
      <Route path="/resetare-parola" component={ResetareParola} />
      <Route path="/resetare-parola-noua" component={ResetareParolaNoua} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/metode-de-plata" component={MetodeDePlata} />
      <Route path="/politica-de-confidentialitate" component={PoliticaDeConfidentialitate} />
      <Route path="/termeni-si-conditii" component={TermeniSiConditii} />
      <Route path="/politica-cookie" component={PoliticaCookie} />
      <Route path="/politica-de-retur" component={PoliticaDeRetur} />
      <Route path="/faq" component={Faq} />
      <Route path="/despre-noi" component={DespreNoi} />

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
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={basePath}>
          <AppRoutes />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
