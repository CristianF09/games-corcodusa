import { useEffect } from "react";
import { useLocation } from "wouter";

export const SITE_URL = "https://games.corcodusa.ro";

interface PageMeta {
  title: string;
  description: string;
}

/**
 * Metadatele pentru paginile PUBLICE. Orice rută care nu e aici este
 * marcată `noindex` (pagini protejate de login, 404, pagini de autentificare).
 * Pentru pagini noi publice, adaugă o intrare aici și în public/sitemap.xml.
 */
export const PUBLIC_PAGE_META: Record<string, PageMeta> = {
  "/": {
    title: "Corcodușa — Jocuri educaționale pentru copii 3–8 ani",
    description: "Jocuri educaționale pentru copii cu vârste între 3 și 8 ani: numere, litere, forme, modele și logică. Fără reclame, fără achiziții ascunse.",
  },
  "/pricing": {
    title: "Abonamente — Corcodușa",
    description: "Abonament lunar sau anual pentru toate jocurile educaționale Corcodușa. Începe cu 7 zile gratuite, fără card bancar.",
  },
  "/faq": {
    title: "Întrebări frecvente — Corcodușa",
    description: "Răspunsuri la întrebările frecvente despre perioada gratuită, abonamente, conturi și accesul la jocuri.",
  },
  "/despre-noi": {
    title: "Despre noi — Corcodușa",
    description: "Află cine suntem și de ce am creat Corcodușa: jocuri educaționale sigure pentru copii.",
  },
  "/metode-de-plata": {
    title: "Metode de plată — Corcodușa",
    description: "Metodele de plată acceptate pe Corcodușa și cum se activează accesul premium după plată.",
  },
  "/politica-de-confidentialitate": {
    title: "Politica de confidențialitate — Corcodușa",
    description: "Cum colectăm, folosim și protejăm datele personale ale utilizatorilor Corcodușa, conform GDPR.",
  },
  "/termeni-si-conditii": {
    title: "Termeni și condiții — Corcodușa",
    description: "Termenii și condițiile de utilizare a platformei de jocuri educaționale Corcodușa.",
  },
  "/politica-cookie": {
    title: "Politica cookie — Corcodușa",
    description: "Ce cookie-uri și date locale folosește Corcodușa și cum le poți controla.",
  },
  "/politica-de-retur": {
    title: "Politica de retur — Corcodușa",
    description: "Condițiile de retur și rambursare pentru abonamentele Corcodușa.",
  },
};

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
}

/**
 * Setează titlul, descrierea, robots, canonical și Open Graph pentru ruta curentă.
 * Aplicația e o SPA: valorile sunt actualizate la fiecare navigare, deci le văd
 * crawlerele care randează JavaScript.
 */
export function SeoHead() {
  const [path] = useLocation();

  useEffect(() => {
    const meta = PUBLIC_PAGE_META[path];
    const indexable = Boolean(meta);
    const title = meta?.title ?? "Corcodușa — Jocuri educaționale";
    const description = meta?.description ?? "Jocuri educaționale pentru copii — Corcodușa.";
    const url = `${SITE_URL}${path}`;

    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", indexable ? "index, follow" : "noindex, nofollow");
    upsertCanonical(url);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", url);
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
  }, [path]);

  return null;
}
