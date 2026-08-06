import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { StubLayout } from "./stub-layout.js";
import styles from "./stubs.module.css";

/**
 * `/signup` and `/login` placeholders (D2: the routes exist from OLY-39 so
 * the landing CTAs and e2e have real targets; the forms arrive in OLY-40).
 */
export function AuthStubRoute({ kind }: { kind: "signup" | "login" }): ReactElement {
  const { t } = useTranslation();
  return (
    <StubLayout>
      <div className={styles["card"]}>
        <h1 className={styles["title"]}>
          {kind === "signup" ? t("stubs.signupTitle") : t("stubs.loginTitle")}
        </h1>
        <p className={styles["note"]}>{t("stubs.authNote")}</p>
      </div>
    </StubLayout>
  );
}
