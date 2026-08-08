import type { ReactElement, ReactNode } from "react";
import * as Label from "@radix-ui/react-label";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import styles from "./auth-text-field.module.css";

export interface AuthTextFieldProps {
  id: string;
  label: string;
  type?: "text" | "password";
  autoComplete?: string;
  placeholder?: string;
  hint?: string;
  error?: FieldError | undefined;
  registration: UseFormRegisterReturn;
  /** Advisory content under the input (currently the password strength
   * meter). Rendered inside `.field`, after the hint and before the error,
   * so the error stays the last thing under the field. */
  footer?: ReactNode;
}

/**
 * One labelled input + hint + error, shared by signup and login (D3: split
 * screens into per-section components). Error text is translated here from
 * the i18n key auth-form-resolver.ts attaches to `error.message` (D9) —
 * callers never see Zod's raw string.
 *
 * Label-in-Name (WCAG 2.5.3): Radix Label's htmlFor/id pairing makes the
 * visible label part of the input's accessible name.
 */
export const AuthTextField = ({
  id,
  label,
  type = "text",
  autoComplete,
  placeholder,
  hint,
  error,
  registration,
  footer,
}: AuthTextFieldProps): ReactElement => {
  const { t } = useTranslation();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  return (
    <div className={styles["field"]}>
      <Label.Root htmlFor={id} className={styles["label"]}>
        {label}
      </Label.Root>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={error !== undefined}
        aria-describedby={
          clsx(hint !== undefined && hintId, error !== undefined && errorId) || undefined
        }
        className={styles["input"]}
        {...registration}
      />
      {hint !== undefined ? (
        <p id={hintId} className={styles["hint"]}>
          {hint}
        </p>
      ) : null}
      {footer}
      {error !== undefined ? (
        <p id={errorId} className={styles["error"]} role="alert">
          {t(error.message ?? "auth.errorGeneric")}
        </p>
      ) : null}
    </div>
  );
};
