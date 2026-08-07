import type { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES } from "@/constants/routes.js";
import { browserAuthSession } from "@/auth/auth-session.js";
import styles from "./logout-button.module.css";

/**
 * Logout (plan S6, D7/D8): clears the session and replaces history with the
 * landing route — matching the design of record's ProfileScreen action
 * (`onLogout`). `replace: true` so a logged-out user hitting Back does not
 * land back on a screen ProtectedRoutes is about to bounce them out of.
 */
export const LogoutButton = (): ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    browserAuthSession.clear();
    void navigate(ROUTES.HOME, { replace: true });
  };

  return (
    <button type="button" onClick={handleLogout} className={styles["button"]}>
      {t("stubs.profileLogout")}
    </button>
  );
};
