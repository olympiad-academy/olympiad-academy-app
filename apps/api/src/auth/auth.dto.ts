import type { contract } from "@olympiad-academy-app/contracts";
import type { z } from "zod";

/**
 * Request/response shapes are derived from the shared ts-rest contract
 * (packages/contracts) rather than re-declared by hand — the runtime already
 * validates against these schemas, so deriving the types keeps the code
 * lockstep by construction (DL-17 / schema lockstep philosophy).
 */

export type SignupDto = z.infer<typeof contract.signup.body>;
export type LoginDto = z.infer<typeof contract.login.body>;
export type AuthResult = z.infer<(typeof contract.signup.responses)[200]>;
