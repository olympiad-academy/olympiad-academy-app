import { contract, createApiClient } from "@olympiad-academy-app/api-client";
import type { AuthApi, AuthFieldIssue, AuthResult, LoginBody, SignupBody } from "./auth-api.js";
import type { AuthSession } from "./auth-session.js";

/**
 * AuthApi over the real backend (D5/D6): the ts-rest client from api-client
 * (AC7 — the contract reaches the UI only through that package) plus one
 * status→AuthResult mapping.
 *
 * The contract declares only the 200 responses, so ts-rest types every
 * non-200 as `unknown`; the mapping below mirrors the *implemented* backend
 * (409 duplicate / 401 invalid / 400 with Zod issues, verified against
 * auth.controller.ts and its Swagger annotations). D6 prescribes exactly
 * this until contract error schemas land (open backend follow-up) — when
 * they do, this file is the only place that changes.
 */

/**
 * NestJS BadRequestException(zodError.errors) serializes the issue list into
 * `message`. Parsed structurally rather than trusted: anything that does not
 * look like a Zod issue is dropped, and the result is then just "validation
 * failed, no field detail".
 */
const parseFieldIssues = (body: unknown): AuthFieldIssue[] => {
  if (typeof body !== "object" || body === null || !("message" in body)) {
    return [];
  }
  const { message } = body;
  if (!Array.isArray(message)) {
    return [];
  }
  const issues: AuthFieldIssue[] = [];
  for (const entry of message) {
    if (typeof entry !== "object" || entry === null) {
      continue;
    }
    const candidate = entry as { path?: unknown; code?: unknown; message?: unknown };
    if (
      Array.isArray(candidate.path) &&
      typeof candidate.code === "string" &&
      typeof candidate.message === "string"
    ) {
      issues.push({
        path: candidate.path.filter(
          (segment): segment is string | number =>
            typeof segment === "string" || typeof segment === "number",
        ),
        code: candidate.code,
        message: candidate.message,
      });
    }
  }
  return issues;
};

export const mapAuthHttpResponse = (status: number, body: unknown): AuthResult => {
  if (status === 200) {
    // The backend owns the 200 shape via the same contract; parsing it here
    // means a malformed success can never plant a garbage token.
    const parsed = contract.signup.responses[200].safeParse(body);
    if (parsed.success) {
      return { ok: true, user_id: parsed.data.user_id, token: parsed.data.token };
    }
    return { ok: false, error: "network" };
  }
  if (status === 409) {
    return { ok: false, error: "duplicate_account" };
  }
  if (status === 401) {
    return { ok: false, error: "invalid_credentials" };
  }
  if (status === 400) {
    return { ok: false, error: "validation", fieldIssues: parseFieldIssues(body) };
  }
  // 5xx and anything unanticipated: retryable, not attributable to a field.
  return { ok: false, error: "network" };
};

/**
 * Every thrown transport failure (DNS, refused connection, aborted fetch)
 * collapses to the retryable `network` variant — the thrown value carries
 * nothing a student can act on, so it is intentionally not inspected.
 */
export const mapAuthTransportError = (): AuthResult => {
  return { ok: false, error: "network" };
};

export interface HttpAuthApiOptions {
  baseUrl: string;
  session: AuthSession;
}

/**
 * The Vite dev proxy forwards /api/* to the API process (vite.config.ts
 * strips the prefix — the backend has no global prefix, its routes are
 * /auth/signup etc.).
 */
export const HTTP_AUTH_API_BASE_URL = "/api";

export const createHttpAuthApi = ({ baseUrl, session }: HttpAuthApiOptions): AuthApi => {
  const client = createApiClient(baseUrl);

  // Signup/login themselves need no token, but every authenticated call
  // after them goes through the same client shape — the Bearer header reads
  // the session lazily per call so a token stored a moment ago is used
  // without rebuilding the client (D7).
  const authHeaders = (): { authorization?: string } => {
    const token = session.getToken();
    return token === null ? {} : { authorization: `Bearer ${token}` };
  };

  const signup = async (body: SignupBody): Promise<AuthResult> => {
    try {
      const response = await client.signup({ body, extraHeaders: authHeaders() });
      return mapAuthHttpResponse(response.status, response.body);
    } catch {
      return mapAuthTransportError();
    }
  };

  const login = async (body: LoginBody): Promise<AuthResult> => {
    try {
      const response = await client.login({ body, extraHeaders: authHeaders() });
      return mapAuthHttpResponse(response.status, response.body);
    } catch {
      return mapAuthTransportError();
    }
  };

  return { signup, login };
};
