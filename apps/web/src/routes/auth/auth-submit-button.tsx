import type { ReactElement } from "react";
import styles from "./auth-submit-button.module.css";

export interface AuthSubmitButtonProps {
  label: string;
  isSubmitting: boolean;
}

/** The full-width gradient CTA shared by signup and login (design of record). */
export const AuthSubmitButton = ({ label, isSubmitting }: AuthSubmitButtonProps): ReactElement => {
  return (
    <button type="submit" className={styles["button"]} disabled={isSubmitting}>
      {label} →
    </button>
  );
};
