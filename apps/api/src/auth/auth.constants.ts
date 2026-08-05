export const SALT_ROUNDS = 10;

export const JWT_EXPIRY = "7d";

/**
 * Pilot serves Grade 5 (MVP doc §4.1/§4.2). `users.grade` is NOT NULL but
 * the signup contract does not collect `grade` (§14 Screen 1) — D10 follow-up.
 * Default until the contract gains a grade field. Revisit that ticket before
 * extending the product past grade 5.
 */
export const DEFAULT_GRADE = 5;

/**
 * Prisma error code for `@unique` constraint violations (users.phone / users.email).
 */
export const PRISMA_UNIQUE_CONSTRAINT_CODE = "P2002";

export const DUPLICATE_ACCOUNT_MESSAGE = "An account with this phone or email already exists";

export const INVALID_CREDENTIALS_MESSAGE = "Invalid credentials";
