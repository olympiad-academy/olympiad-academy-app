import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { StubLayout } from "./stub-layout.js";
import styles from "./stubs.module.css";

/**
 * `/profile` placeholder (D2 routing skeleton): the profile page exists in
 * the design of record (avatar in the post-auth header), so its route is
 * reserved now; the real screen is a separate future task.
 */
export const ProfileStubRoute = (): ReactElement => {
  const { t } = useTranslation();
  return (
    <StubLayout>
      <div className={styles["card"]}>
        <h1 className={styles["title"]}>{t("stubs.profileTitle")}</h1>
        <p className={styles["note"]}>{t("stubs.profileNote")}</p>
      </div>
    </StubLayout>
  );
};
