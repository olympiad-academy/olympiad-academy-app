import type { CSSProperties, ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { LANDING_TOPICS } from "@/routes/landing/landing-content.js";
import { StubLayout } from "./stub-layout.js";
import styles from "./stubs.module.css";

/**
 * `/topics` placeholder (D8): the redirect target after auth must exist, so
 * the stub renders the design-of-record topics as accent cards — in the
 * spirit of the Topic List design without building the real screen, which
 * is a separate future task.
 */
export function TopicsStubRoute(): ReactElement {
  const { t } = useTranslation();
  return (
    <StubLayout>
      <div className={styles["topicsCard"]}>
        <h1 className={styles["title"]}>{t("stubs.topicsTitle")}</h1>
        <p className={styles["note"]}>{t("stubs.topicsNote")}</p>
        <div className={styles["topicsGrid"]}>
          {LANDING_TOPICS.map((topic) => (
            <div
              key={topic.id}
              className={styles["topicCard"]}
              style={{ "--topic-accent": topic.accent } as CSSProperties}
            >
              {t(`landing.topics.${topic.key}`)}
            </div>
          ))}
        </div>
      </div>
    </StubLayout>
  );
}
