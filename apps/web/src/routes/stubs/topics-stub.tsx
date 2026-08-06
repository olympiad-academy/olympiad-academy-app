import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { TopicChip } from "@/components/topic-chip/topic-chip.js";
import { LANDING_TOPICS } from "@/routes/landing/landing-content.js";
import { StubLayout } from "./stub-layout.js";
import styles from "./stubs.module.css";

/**
 * `/topics` placeholder (D8): the redirect target after auth must exist, so
 * the stub renders the design-of-record topics as accent chips — in the
 * spirit of the Topic List design without building the real screen, which
 * is a separate future task.
 */
export const TopicsStubRoute = (): ReactElement => {
  const { t } = useTranslation();
  return (
    <StubLayout>
      <div className={styles["topicsCard"]}>
        <h1 className={styles["title"]}>{t("stubs.topicsTitle")}</h1>
        <p className={styles["note"]}>{t("stubs.topicsNote")}</p>
        <div className={styles["topicsGrid"]}>
          {LANDING_TOPICS.map((topic) => (
            <TopicChip
              key={topic.id}
              accent={topic.accent}
              label={t(`landing.topics.${topic.id}`)}
            />
          ))}
        </div>
      </div>
    </StubLayout>
  );
};
