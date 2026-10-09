// Datele juridice ale companiei — folosite pe toate paginile legale
// (Termeni și Condiții, GDPR, Cookie, Retur, Contact) și în footer.
//
// Sursa: datele de pe corcodusa.ro (pagina „Despre noi" și „Termeni și Condiții",
// verificate 2026-10-09). Dacă se schimbă, actualizează și
// artifacts/api-server-py/app/config.py (COMPANY_* — apar pe factura PDF).

export const COMPANY = {
  /** Denumirea legală completă a firmei */
  legalName: "Corcodusa",
  /** Cod Unic de Înregistrare */
  cui: "55147026",
  /** Număr de înregistrare la Registrul Comerțului */
  regCom: "F2026034422005",
  /** Adresa sediului social */
  address: "Bulevardul Bucureștii Noi, Nr. 136, Et. P, Ap. 5, Sectorul 1, București",
  /** Regim TVA */
  vatStatus: "Neplătitor de TVA (art. 310 din Codul Fiscal)",
  /** Email de contact general */
  email: "contact@corcodusa.ro",
  /** Email dedicat solicitărilor GDPR */
  gdprEmail: "contact@corcodusa.ro",
  /** Domeniul platformei */
  site: "games.corcodusa.ro",
} as const;
