/**
 * Acces liber la jocuri DOAR în `vite dev` (localhost), pentru testare.
 *
 * `import.meta.env.DEV` este false în `vite build`, deci în producție
 * login-ul și abonamentul rămân active, indiferent de variabilele de mediu.
 */
export const DEV_OPEN_GAMES = import.meta.env.DEV;
