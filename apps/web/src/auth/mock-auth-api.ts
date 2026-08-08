import { contract } from "@olympiad-academy-app/api-client";
import type { ZodError } from "zod";
import type { AuthApi, AuthFieldIssue, AuthResult, LoginBody, SignupBody } from "./auth-api.js";
import { nextMockId } from "./mock-id.js";

/**
 * In-memory AuthApi for dev/demo/E2E (D5). No persistence on purpose: a
 * reload starts clean, which keeps the demo and the e2e specs deterministic.
 *
 * The mock mirrors the real boundary, not just the happy path: bodies are
 * parsed with the SAME contract schemas the backend controller uses
 * (auth.controller.ts calls contract.signup.body.parse), and the scenario
 * set covers every D6 variant — success, duplicate account, invalid
 * credentials, and a simulated network failure (reserved contact below).
 * Unit tests validate these fixtures against the contract schemas (AC5), so
 * the mock cannot drift from the contract silently.
 *
 * Bodies are checked with `safeParse` rather than `parse` in a try/catch:
 * recognising a failure by `error instanceof ZodError` would depend on the
 * mock and `packages/contracts` resolving to the same zod instance. They do
 * today (one entry in the lockfile), but if they ever did not, the
 * `instanceof` would be false, the mock would rethrow instead of returning
 * `{ error: "validation" }`, and the submit would reject unhandled — a
 * failure mode the AC5 drift guard cannot see. `safeParse` is immune: the
 * failure arrives as a value, not as a thrown class.
 */

/**
 * Pre-registered account, so the login screen has something to log into on a
 * fresh load and signup has a guaranteed duplicate to collide with.
 */
export const MOCK_SEEDED_ACCOUNT = Object.freeze({
  name: "Alisher",
  email: "alisher@example.com",
  password: "olympiad8",
} as const);

/**
 * Reserved identity that simulates a transport failure (D5 scenario list;
 * consumed by OLY-42's retry flow). Chosen to be a valid email so the form
 * layer lets it through to the seam.
 */
export const MOCK_NETWORK_FAILURE_CONTACT = "offline@example.com";

interface MockAccount {
  userId: string;
  name: string;
  phone: string | null;
  email: string | null;
  password: string;
}

const toFieldIssues = (error: ZodError): AuthFieldIssue[] => {
  return error.issues.map((issue) => ({
    path: issue.path,
    code: issue.code,
    message: issue.message,
  }));
};

/** Same normalization the backend applies (auth.service.ts). */
const normalizeEmail = (email: string | null | undefined): string | null => {
  return email == null ? null : email.trim().toLowerCase();
};

const normalizePhone = (phone: string | null | undefined): string | null => {
  return phone == null ? null : phone.trim();
};

const createToken = (): string => `mock-token-${nextMockId()}`;

export const createMockAuthApi = (): AuthApi => {
  const accounts: MockAccount[] = [
    {
      userId: nextMockId(),
      name: MOCK_SEEDED_ACCOUNT.name,
      phone: null,
      email: MOCK_SEEDED_ACCOUNT.email,
      password: MOCK_SEEDED_ACCOUNT.password,
    },
  ];

  const findAccount = (phone: string | null, email: string | null): MockAccount | undefined => {
    return accounts.find(
      (account) =>
        (phone !== null && account.phone === phone) || (email !== null && account.email === email),
    );
  };

  const signup = (body: SignupBody): Promise<AuthResult> => {
    const result = contract.signup.body.safeParse(body);
    if (!result.success) {
      return Promise.resolve({
        ok: false,
        error: "validation",
        fieldIssues: toFieldIssues(result.error),
      });
    }
    const parsed = result.data;

    const phone = normalizePhone(parsed.phone);
    const email = normalizeEmail(parsed.email);
    if (phone === MOCK_NETWORK_FAILURE_CONTACT || email === MOCK_NETWORK_FAILURE_CONTACT) {
      return Promise.resolve({ ok: false, error: "network" });
    }
    if (findAccount(phone, email) !== undefined) {
      return Promise.resolve({ ok: false, error: "duplicate_account" });
    }

    const account: MockAccount = {
      userId: nextMockId(),
      name: parsed.name,
      phone,
      email,
      password: parsed.password,
    };
    accounts.push(account);
    return Promise.resolve({ ok: true, user_id: account.userId, token: createToken() });
  };

  const login = (body: LoginBody): Promise<AuthResult> => {
    const result = contract.login.body.safeParse(body);
    if (!result.success) {
      return Promise.resolve({
        ok: false,
        error: "validation",
        fieldIssues: toFieldIssues(result.error),
      });
    }
    const parsed = result.data;

    const phone = normalizePhone(parsed.phone);
    const email = normalizeEmail(parsed.email);
    if (phone === MOCK_NETWORK_FAILURE_CONTACT || email === MOCK_NETWORK_FAILURE_CONTACT) {
      return Promise.resolve({ ok: false, error: "network" });
    }

    const account = findAccount(phone, email);
    // account?.password is undefined for a missing account, which never
    // equals a real (non-empty, contract-validated) password string.
    if (account?.password !== parsed.password) {
      return Promise.resolve({ ok: false, error: "invalid_credentials" });
    }
    return Promise.resolve({ ok: true, user_id: account.userId, token: createToken() });
  };

  return { signup, login };
};
