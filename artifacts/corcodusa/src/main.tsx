import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import { ErrorBoundary } from "./components/error-boundary";
import "./index.css";

// Without this, every API request stays relative to wherever this bundle is
// served from (e.g. Firebase Hosting), which has no backend behind it — see
// the ErrorBoundary/custom-fetch HTML-guard above for what that looked like
// in production. Point requests at the real backend instead.
setBaseUrl(import.meta.env.VITE_API_URL ?? null);

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
