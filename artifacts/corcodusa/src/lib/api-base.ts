// Same base URL the generated API client points at (see main.tsx's
// setBaseUrl call) — exported separately for the handful of call sites
// that need a plain fetch() instead of a generated hook (e.g. the contact
// form, which posts to /api/contact, a route not in the generated client).
export const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
