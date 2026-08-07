import type { ZodIssue, ZodType } from "zod";
import type { FieldError, FieldErrors, FieldValues, Resolver } from "react-hook-form";
import { toIdentityFields } from "./identity.js";

/**
 * Form-to-contract resolver (D9 + its design sub-point + technical note).
 *
 * The screens show three fields — name, a single "identity" (phone-or-email),
 * password — but the ONLY validation rules live in the contract's Zod schema
 * (AC7): no hand-rolled per-field validators. This resolver is the mapping
 * glue D9's single-field design sub-point requires: it converts `identity`
 * into `{ phone }` or `{ email }` (never both, D9 technical note) before
 * handing the body to the contract schema, then maps any resulting
 * phone/email issue back onto `identity` so the one visible field shows the
 * error.
 *
 * `@hookform/resolvers`'s zodResolver cannot do this mapping — it validates
 * form values as-is against the schema — so this file is the derivation
 * D9's own single-field requirement forces, not a hand-rolled alternative to
 * it: the schema itself (imported unmodified) still owns every rule.
 *
 * Error messages are never Zod's English string (D9): callers translate
 * `error.message`, which is an i18n key selected by field name + Zod issue
 * code via `errorKeyFor`.
 */

export interface AuthFormValues extends FieldValues {
  name?: string;
  identity: string;
  password: string;
  /**
   * Form-level fallback for an issue on a path no visible field owns
   * (review defect 3). NOT named "root": react-hook-form's own
   * `handleSubmit` unconditionally deletes `errors.root` immediately
   * before deciding whether the submission is valid (verified against
   * react-hook-form 7.84's source — `ve(u.errors,"root")` runs, then
   * `K(u.errors)` decides valid/invalid), so a resolver that reports its
   * fallback under `root` has that error erased by the very call that
   * would render it and the submission is treated as successful. Any
   * other field name survives; `formError` is chosen to read clearly next
   * to the existing `submitError` state in signup.tsx/login.tsx.
   */
  formError?: string;
}

/**
 * The only names an error can render under (the fields this form's
 * AuthTextFields actually read `formState.errors.<x>` for, plus
 * `formError` for the form-level alert — see the AuthFormValues doc comment
 * for why not "root"). Named as a union rather than `keyof AuthFormValues`
 * so `mapFieldName`'s return type states the real constraint — review
 * defect 3's cast (`field as keyof AuthFormValues`) asserted this same set
 * without the compiler ever checking it, which is exactly what let an
 * uncovered path through unnoticed.
 */
type RenderableAuthField = "name" | "identity" | "password" | "formError";

/** Fields not present on the schema's own field set. */
const IDENTITY_ALIASES = new Set(["phone", "email"]);

const RENDERABLE_FIELDS = new Set<string>(["name", "identity", "password"]);

/**
 * i18n key selection (D9: "keyed by issue code, not by Zod's English
 * strings"). One key per (field, code) pair actually produced by the
 * contract schemas — signup's password min(8), login's password min(1),
 * name required, and the identity refine/format checks.
 */
const errorKeyFor = (field: RenderableAuthField, issue: ZodIssue): string => {
  if (field === "name") {
    return "auth.errorName";
  }
  if (field === "identity") {
    if (issue.code === "invalid_string") {
      return "auth.errorContactInvalid";
    }
    return "auth.errorContact";
  }
  if (field === "password") {
    return issue.code === "too_small" && issue.minimum === 1
      ? "auth.errorPasswordRequired"
      : "auth.errorPassword";
  }
  return "auth.errorGeneric";
};

/**
 * Review defect 3: any schema field name used to pass through unchanged
 * (`return first`), including ones no AuthTextField reads — an error there
 * rendered nowhere: the user pressed submit, nothing happened, no message
 * anywhere. Every path that is not one of this form's three visible fields
 * now collapses to "formError", which signup.tsx/login.tsx render in the
 * existing form-level alert (same slot submitError uses; not "root" — see
 * the AuthFormValues doc comment above).
 */
const mapFieldName = (path: (string | number)[]): RenderableAuthField => {
  const first = path[0];
  if (typeof first === "string" && IDENTITY_ALIASES.has(first)) {
    return "identity";
  }
  if (typeof first === "string" && RENDERABLE_FIELDS.has(first)) {
    return first as RenderableAuthField;
  }
  return "formError";
};

/** Values merged into the mapped body that are not form fields (currently
 * only `language`, sourced from the active i18n locale). */
export interface AuthFormResolverExtra {
  language?: string;
}

/**
 * @param schema One of `contract.signup.body` / `contract.login.body`
 *   (D9: imported unmodified, never redefined).
 * @param extra See {@link AuthFormResolverExtra}.
 */
export const createAuthFormResolver = <TBody extends FieldValues>(
  schema: ZodType<unknown>,
  extra: AuthFormResolverExtra,
): Resolver<AuthFormValues, unknown, TBody> => {
  return async (values: AuthFormValues) => {
    const body = {
      ...(values.name === undefined ? {} : { name: values.name }),
      ...toIdentityFields(values.identity),
      password: values.password,
      ...extra,
    };

    const parsed = await schema.safeParseAsync(body);
    if (parsed.success) {
      return { values: parsed.data as TBody, errors: {} };
    }

    const errors: FieldErrors<AuthFormValues> = {};
    for (const issue of parsed.error.issues) {
      const field = mapFieldName(issue.path);
      // First issue per field wins — matches @hookform/resolvers' own
      // zodResolver behaviour (one FieldError per path). No cast: `field` is
      // RenderableAuthField, one of the four keys FieldErrors<AuthFormValues>
      // actually declares (name/identity/password/root), so this assignment
      // is checked, not asserted.
      const fieldError: FieldError = { type: issue.code, message: errorKeyFor(field, issue) };
      errors[field] ??= fieldError;
    }
    return { values: {}, errors };
  };
};
