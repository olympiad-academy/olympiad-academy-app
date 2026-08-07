import type { AuthApi } from "./auth-api.js";
import { resolveAuthApiMode, type AuthApiModeEnv } from "./auth-api-mode.js";
import { browserAuthSession } from "./auth-session.js";
import { createHttpAuthApi, HTTP_AUTH_API_BASE_URL } from "./http-auth-api.js";
import { createMockAuthApi } from "./mock-auth-api.js";

/**
 * The one AuthApi instance screens use (D5): mock or HTTP per VITE_API_MOCK.
 *
 * A singleton on purpose — MockAuthApi holds its accounts in memory, so two
 * screens constructing their own instances would not see each other's
 * signups (sign up on /signup, fail to log in on /login).
 *
 * import.meta.env only exists under Vite; unit tests (tsx --test) import
 * this module too, so the read is typed as possibly-undefined and the
 * decision delegated to resolveAuthApiMode, which treats "no env" as mock.
 */
const viteEnv = (import.meta as { env?: AuthApiModeEnv }).env;

export const browserAuthApi: AuthApi =
  resolveAuthApiMode(viteEnv) === "mock"
    ? createMockAuthApi()
    : createHttpAuthApi({ baseUrl: HTTP_AUTH_API_BASE_URL, session: browserAuthSession });
