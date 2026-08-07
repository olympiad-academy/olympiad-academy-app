/**
 * ESM loader hook: stubs CSS imports for the unit-test runner. Only ever
 * registered by register-css-stub.mjs in tests; Vite handles CSS itself in
 * dev/build.
 */
export async function load(url, context, nextLoad) {
  if (url.endsWith(".css")) {
    return {
      format: "module",
      source: "export default new Proxy({}, { get: (_target, prop) => String(prop) });",
      shortCircuit: true,
    };
  }
  return nextLoad(url, context);
}
