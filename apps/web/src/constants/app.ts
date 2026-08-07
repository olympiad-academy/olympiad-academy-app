/**
 * The product name as it is rendered, in every locale.
 *
 * Deliberately NOT an i18n key: the design of record keeps the brand in Latin
 * script even inside translated copy («Почему Olympiad Academy?»,
 * «Nima uchun Olympiad Academy?» — snapshot i18n.ts `featuresTitle`), so
 * translating it would contradict the copy rendered next to it. A constant
 * rather than three literals so a rename is one edit, matching the `ROUTES`
 * pattern in ./routes.ts.
 */
export const APP_NAME = "Olympiad Academy";
