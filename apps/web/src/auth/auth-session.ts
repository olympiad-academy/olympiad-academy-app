import type { PreferenceStorage } from "../preferences/preference-storage.js";

/**
 * Auth token persistence (D7): localStorage-backed, one key, get/set/clear.
 *
 * localStorage rather than memory so the session survives a reload (a demo
 * that logs you out on refresh looks broken); the XSS exposure of
 * localStorage tokens is a recorded, accepted limitation of the mock-era MVP
 * with an httpOnly-cookie follow-up owned by the backend (D7).
 *
 * The storage seam extends the shared PreferenceStorage shape with
 * `removeItem`: unlike locale/theme, a session must be *removable* — logout
 * deletes the key rather than writing a sentinel value.
 */
export interface AuthSessionStorage extends PreferenceStorage {
  removeItem(key: string): void;
}

export const AUTH_TOKEN_STORAGE_KEY = "oa.authToken";

export interface AuthSession {
  getToken(): string | null;
  setToken(token: string): void;
  clear(): void;
  hasSession(): boolean;
}

export const createAuthSession = (storage: AuthSessionStorage): AuthSession => {
  const getToken = (): string | null => {
    const stored = storage.getItem(AUTH_TOKEN_STORAGE_KEY);
    // An empty string is not a session: it would still fail every API call
    // yet flip every hasSession() gate — normalize it away at the seam.
    return stored === null || stored === "" ? null : stored;
  };

  return {
    getToken,
    setToken: (token: string): void => {
      storage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    },
    clear: (): void => {
      storage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    },
    hasSession: (): boolean => getToken() !== null,
  };
};

/** Browser singleton: the one instance the app and HttpAuthApi share. */
export const browserAuthSession: AuthSession =
  typeof window === "undefined"
    ? createAuthSession({
        getItem: () => null,
        setItem: () => undefined,
        removeItem: () => undefined,
      })
    : createAuthSession(window.localStorage);
