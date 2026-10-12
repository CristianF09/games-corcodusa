/**
 * Stocarea alegerii de cookie-uri din bannerul de consimțământ.
 *
 * Cookie-urile esențiale (autentificare, sesiune, plată) nu cer consimțământ
 * și sunt mereu active. Categoriile opționale sunt:
 *  - functional: preferințe care îmbunătățesc experiența
 *  - analytics:  măsurători de utilizare (momentan nu există niciun script de analiză)
 *
 * Orice script opțional trebuie încărcat doar dacă `hasConsent(categorie)` e true.
 */

export const CONSENT_KEY = "corcodusa-cookie-consent";
const CONSENT_VERSION = 1;

export type ConsentCategory = "functional" | "analytics";

export interface ConsentChoice {
  functional: boolean;
  analytics: boolean;
}

interface StoredConsent extends ConsentChoice {
  version: number;
  decidedAt: string;
}

export function readConsent(): StoredConsent | null {
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    return parsed.version === CONSENT_VERSION ? parsed : null;
  } catch {
    // localStorage poate fi blocat (mod privat, setări browser): tratăm ca „nicio alegere".
    return null;
  }
}

export function writeConsent(choice: ConsentChoice): void {
  try {
    const stored: StoredConsent = {
      ...choice,
      version: CONSENT_VERSION,
      decidedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(stored));
  } catch {
    // Dacă nu putem salva, bannerul va reapărea la următoarea vizită — nu blocăm site-ul.
  }
}

export function hasConsent(category: ConsentCategory): boolean {
  return readConsent()?.[category] === true;
}
