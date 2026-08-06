/**
 * Joins CSS Module class lookups. Lookups are typed `string | undefined`
 * (noUncheckedIndexedAccess), and the lint rules forbid both non-null
 * assertions and interpolating possibly-undefined values — this helper is
 * the one blessed place where the undefined case is handled.
 */
export function joinClassNames(...names: readonly (string | undefined)[]): string {
  return names.filter((name) => name !== undefined).join(" ");
}
