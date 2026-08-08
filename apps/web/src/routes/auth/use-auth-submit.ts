import { useState } from "react";
import type { FormEvent } from "react";
import type { FieldValues, UseFormHandleSubmit } from "react-hook-form";
import type { AuthResult } from "@/auth/auth-api.js";
import type { AuthFormValues } from "@/auth/auth-form-resolver.js";

/**
 * The submit half both auth screens share: run the request, store nothing on
 * failure but surface a message, and hand the success to the caller.
 *
 * Extracted because signup and login carried a byte-identical
 * `submitHandler`/`onSubmit` pair — react-hook-form's `handleSubmit` returns
 * a promise-returning handler, which `<form onSubmit>` may not be given
 * directly under `no-misused-promises`, so both files wrapped it the same
 * way. One copy, and the wrapping rationale lives in one place.
 */
export interface UseAuthSubmitOptions<TBody extends FieldValues> {
  handleSubmit: UseFormHandleSubmit<AuthFormValues, TBody>;
  /** Performs the request. Returning a failed AuthResult raises the alert. */
  submit: (body: TBody) => Promise<AuthResult>;
  /** Called only on success, with the result that carries the token. */
  onSuccess: (result: Extract<AuthResult, { ok: true }>) => void;
}

export interface UseAuthSubmitResult {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  /** i18n key for the form-level alert, or null when the last attempt was
   * clean. OLY-42 owns the per-variant UI; until then any failure maps to
   * one message so the form never fails silently. */
  submitErrorKey: string | null;
}

export const useAuthSubmit = <TBody extends FieldValues>({
  handleSubmit,
  submit,
  onSuccess,
}: UseAuthSubmitOptions<TBody>): UseAuthSubmitResult => {
  const [submitErrorKey, setSubmitErrorKey] = useState<string | null>(null);

  const run = async (body: TBody): Promise<void> => {
    setSubmitErrorKey(null);
    const result = await submit(body);
    if (result.ok) {
      onSuccess(result);
      return;
    }
    setSubmitErrorKey("auth.errorGeneric");
  };

  const submitHandler = handleSubmit((body): void => {
    void run(body);
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    void submitHandler(event);
  };

  return { onSubmit, submitErrorKey };
};
