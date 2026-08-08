/**
 * Id generation for MockAuthApi (review defect 1). `crypto.randomUUID()`
 * throws outside a secure context — `localhost` is secure, a LAN address
 * (`http://192.168.x.x:5173`, the address a phone uses against
 * `vite --host 0.0.0.0`) is not. `createMockAuthApi()` runs at module scope
 * (browser-auth-api.ts, pulled in by every screen through app.tsx), so an
 * uncaught throw there fails app bootstrap itself — a white screen with no
 * message, not a broken signup form.
 *
 * This is a mock: uniqueness within one browser session is all that is
 * required, never cryptographic strength — so a non-crypto fallback is
 * exactly as fit for purpose as the primary path.
 */

/** The one method this module needs from the global `Crypto` interface. */
export type MockIdCrypto = Pick<Crypto, "randomUUID">;

let fallbackCounter = 0;

/** Unique for the lifetime of the page — never meant to leave the session. */
const generateFallbackId = (): string => {
  fallbackCounter += 1;
  return `mock-id-${Date.now().toString(36)}-${fallbackCounter.toString(36)}`;
};

/**
 * @param cryptoSource Defaults to the global `crypto`; a fake is injected in
 *   tests to exercise both branches without needing an actual insecure
 *   context. `undefined` and "has `randomUUID` but it throws" both fall
 *   back — the latter is the real browser behaviour outside a secure
 *   context, not a hypothetical.
 */
export const generateMockId = (cryptoSource: MockIdCrypto | undefined): string => {
  if (cryptoSource === undefined) {
    return generateFallbackId();
  }
  try {
    return cryptoSource.randomUUID();
  } catch {
    return generateFallbackId();
  }
};

/** Browser entry point: the real global `crypto`, guarded the same way. */
export const nextMockId = (): string => {
  return generateMockId(typeof crypto === "undefined" ? undefined : crypto);
};
