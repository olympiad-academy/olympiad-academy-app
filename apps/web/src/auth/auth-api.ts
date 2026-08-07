import type { z } from "zod";
import type { contract } from "@olympiad-academy-app/api-client";

/**
 * The AuthApi seam (decisions D5 + D6).
 *
 * One narrow interface with two implementations — HttpAuthApi (real backend)
 * and MockAuthApi (in-memory, demo path) — selected by the VITE_API_MOCK flag.
 * Screens depend only on this file; flipping the flag never touches screen
 * code.
 *
 * Request body types are inferred from the contract schemas (AC7: no
 * frontend-owned copies of contract rules). `z.input` rather than `z.infer`
 * because these describe what the caller sends: `language` has a server-side
 * default and may be omitted, and the identity refine accepts either field.
 */
export type SignupBody = z.input<typeof contract.signup.body>;
export type LoginBody = z.input<typeof contract.login.body>;

/**
 * One field-level problem reported by the API boundary (the backend parses
 * request bodies with the contract schema and returns the Zod issues on 400;
 * the mock mirrors that). `code` is the Zod issue code so UI copy can be an
 * i18n key per code (D9), never the raw English message.
 */
export interface AuthFieldIssue {
  path: (string | number)[];
  code: string;
  message: string;
}

/**
 * Frontend-defined result taxonomy (D6). The contract declares only the 200
 * response for signup/login; the error variants mirror the implemented
 * backend behaviour (409 duplicate / 401 invalid / 400 validation) plus
 * transport failure. Contract error schemas are an open follow-up to the
 * backend owner — when they land, only HttpAuthApi's mapping changes.
 */
export type AuthResult =
  | { ok: true; user_id: string; token: string }
  | { ok: false; error: "duplicate_account" | "invalid_credentials" | "network" }
  | { ok: false; error: "validation"; fieldIssues: AuthFieldIssue[] };

export interface AuthApi {
  signup(body: SignupBody): Promise<AuthResult>;
  login(body: LoginBody): Promise<AuthResult>;
}
