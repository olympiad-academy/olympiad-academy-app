import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import styles from "./auth-shared.module.css";

/**
 * Form-level message under the fields, shared by signup and login.
 *
 * Both screens raise two of these — one for a resolver error that belongs to
 * no visible field (`errors.formError`, review defect 3) and one for a failed
 * submit (`submitError`) — which was four identical JSX blocks across the two
 * files. The value is always an i18n key, never a ready string: the resolver
 * stores keys so a language switch re-renders the message (D9).
 */
export interface AuthFormAlertProps {
  /** i18n key, or null/undefined when there is nothing to say. */
  messageKey?: string | null | undefined;
}

export const AuthFormAlert = ({ messageKey }: AuthFormAlertProps): ReactElement | null => {
  const { t } = useTranslation();

  if (messageKey === null || messageKey === undefined) {
    return null;
  }

  return (
    <p className={styles["formError"]} role="alert">
      {t(messageKey)}
    </p>
  );
};
