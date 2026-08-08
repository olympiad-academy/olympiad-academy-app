import "./helpers/dom.js";
import { describe, it } from "node:test";
import type { ReactElement } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach } from "node:test";
import { useForm } from "react-hook-form";
import { I18nextProvider } from "react-i18next";
import { z } from "zod";
import { createI18n } from "@/i18n/index.js";
import { createAuthFormResolver, type AuthFormValues } from "@/auth/auth-form-resolver.js";

/**
 * Review defect 3, form half: proves the render pattern signup.tsx and
 * login.tsx both use — `formState.errors.formError?.message` inside the
 * existing `formError` alert block — actually surfaces a form-level
 * resolver error to the user, instead of it rendering nowhere.
 *
 * The field is deliberately NOT named "root": react-hook-form's own
 * `handleSubmit` unconditionally deletes `errors.root` immediately before
 * deciding whether the submission is valid (verified directly against
 * react-hook-form 7.84.0's bundled source — `ve(u.errors,"root")` runs,
 * then `K(u.errors)` branches valid/invalid), so a resolver reporting its
 * fallback under `root` has that error erased by the very call that would
 * render it, and the submission is silently treated as SUCCESSFUL. This
 * was caught while writing this proof, not by the review report — the
 * first version of this fix rendered `errors.root` and passed every
 * resolver-level unit test while still doing nothing in an actual
 * `<form onSubmit={handleSubmit(...)}>`.
 *
 * Not reachable through the real contract schemas today (`language` is
 * constrained to `LanguageSchema` and always valid, so no current issue
 * path lands on `formError`): the harness below uses a schema built for
 * this test, matching auth-form-resolver.test.ts's own harness for the
 * same reason — an insurance test for a currently-unreachable path. It is
 * a minimal stand-in for SignupRoute/LoginRoute using the identical
 * resolver + `useForm`/`handleSubmit` + render pattern (the real routes
 * cannot have their contract schema swapped for a test schema without
 * inventing a frontend-owned validation rule, which AC7 forbids), so it
 * proves the mechanism both real routes share, including the
 * `handleSubmit` behaviour above that a resolver-only test cannot see.
 */

const schemaWithAFormLevelIssue = z
  .object({ name: z.string(), email: z.string(), password: z.string() })
  .refine(() => false, { message: "unreachable today", path: [] });

const TestForm = (): ReactElement => {
  const { register, handleSubmit, formState } = useForm<
    AuthFormValues,
    unknown,
    { name: string; email: string; password: string }
  >({
    resolver: createAuthFormResolver(schemaWithAFormLevelIssue, {}),
  });

  return (
    <form onSubmit={handleSubmit(() => undefined)}>
      <input {...register("name")} />
      <input {...register("identity")} />
      <input {...register("password")} />
      {/* The exact block from signup.tsx/login.tsx. */}
      {formState.errors.formError?.message !== undefined ? (
        <p role="alert">{formState.errors.formError.message}</p>
      ) : null}
      <button type="submit">submit</button>
    </form>
  );
};

const renderTestForm = async (): Promise<void> => {
  const i18n = await createI18n({
    storage: { getItem: () => null, setItem: () => undefined },
  });
  render(
    <I18nextProvider i18n={i18n}>
      <TestForm />
    </I18nextProvider>,
  );
};

afterEach(() => cleanup());

describe("form-level error rendering (review defect 3, form half)", () => {
  it("a resolver error on an unrenderable path surfaces as a form-level alert, not silently", async () => {
    await renderTestForm();
    // Fill every field validly first so the name/identity/password checks
    // all pass and the schema-level refine (path: []) is the only issue —
    // otherwise an earlier, field-level error masks the form-level one.
    // All three inputs are plain <input> (no type="password"), so all three
    // are "textbox"; order matches registration order.
    const textboxes = screen.getAllByRole("textbox");
    fireEvent.input(textboxes[0] as HTMLElement, { target: { value: "Aziza" } });
    fireEvent.input(textboxes[1] as HTMLElement, { target: { value: "aziza@example.com" } });
    fireEvent.input(textboxes[2] as HTMLElement, { target: { value: "longenough8" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "submit" }));
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });
    screen.getByRole("alert");
  });
});
