import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import type { ChatMessage, Feature } from "../landing-content.js";
import shared from "./landing-shared.module.css";
import styles from "./landing-tutor.module.css";

/** AI-tutor section: pitch + feature list on the left, chat mock on the right. */
export const LandingTutor = ({
  tutorFeatures,
  chat,
}: {
  tutorFeatures: readonly Feature[];
  chat: readonly ChatMessage[];
}): ReactElement => {
  const { t } = useTranslation();
  return (
    <section className={shared["section"]}>
      <div className={styles["grid"]}>
        <div>
          <div className={styles["badge"]}>✦ {t("landing.aiTutorKicker")}</div>
          <h2 className={styles["title"]}>{t("landing.aiTutorTitle")}</h2>
          <p className={styles["desc"]}>{t("landing.aiTutorDesc")}</p>
          <div className={styles["features"]}>
            {tutorFeatures.map((feature) => (
              <div key={feature.title} className={styles["feature"]}>
                <div className={styles["featureIcon"]}>{feature.icon}</div>
                <div>
                  <div className={styles["featureTitle"]}>{feature.title}</div>
                  <p className={shared["cardDesc"]}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <ChatMock chat={chat} />
      </div>
    </section>
  );
};

const ChatMock = ({ chat }: { chat: readonly ChatMessage[] }): ReactElement => {
  const { t } = useTranslation();
  return (
    <div className={styles["chat"]}>
      <div className={styles["chatHeader"]}>
        <div className={styles["chatAvatar"]}>✦</div>
        <span className={styles["chatTitle"]}>{t("landing.aiTutorKicker")}</span>
        <span className={styles["chatTag"]}>{t("landing.chatTag")}</span>
      </div>
      <div className={styles["chatMessages"]}>
        {chat.map((message, index) => (
          <div
            key={index}
            className={message.from === "student" ? styles["rowStudent"] : styles["rowTutor"]}
          >
            <div
              className={
                message.from === "student" ? styles["messageStudent"] : styles["messageTutor"]
              }
            >
              {message.text}
            </div>
          </div>
        ))}
        <div className={styles["rowTutor"]}>
          <div className={styles["typing"]}>
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className={styles["typingDot"]}
                style={{ animationDelay: `${String(dot * 0.18)}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
