import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import type { PasswordStrength } from "@/auth/password-strength.js";
import styles from "./password-strength-meter.module.css";

/**
 * Advisory strength meter under the signup password field.
 *
 * Advisory is the whole point: it never blocks submission and it is not
 * wired into validation in any way — what a password must satisfy is
 * `contract.signup.body`'s rule alone (AC7/D9). It exists because clearing
 * the contract's min(8) does not make a password good, and saying so is UX
 * the frontend legitimately owns.
 *
 * Announced via aria-live="polite" rather than role="alert": the verdict
 * changes on almost every keystroke, and an assertive region would
 * interrupt a screen-reader user continuously while they type. Polite
 * queues the final value once typing pauses. It is deliberately NOT added
 * to the input's aria-describedby for the same reason — describedby is
 * re-announced wholesale on refocus.
 */
const STRENGTH_LABEL_KEYS: Record<PasswordStrength, string> = {
  weak: "auth.passwordStrengthWeak",
  fair: "auth.passwordStrengthFair",
  strong: "auth.passwordStrengthStrong",
};

const SEGMENT_COUNT = 3;
const FILLED_SEGMENTS: Record<PasswordStrength, number> = { weak: 1, fair: 2, strong: 3 };

/** Separate class sets: a filled bar segment is coloured by background, the
 * verdict word by text colour. Sharing one class gave the word a swatch. */
const SEGMENT_CLASS: Record<PasswordStrength, string> = {
  weak: "segmentWeak",
  fair: "segmentFair",
  strong: "segmentStrong",
};

const TEXT_CLASS: Record<PasswordStrength, string> = {
  weak: "textWeak",
  fair: "textFair",
  strong: "textStrong",
};

export const PasswordStrengthMeter = ({
  strength,
}: {
  strength: PasswordStrength | null;
}): ReactElement | null => {
  const { t } = useTranslation();

  // Nothing typed yet: render no meter at all rather than announcing "weak"
  // at a student who has not started.
  if (strength === null) {
    return null;
  }

  const filled = FILLED_SEGMENTS[strength];

  return (
    <div className={styles["meter"]}>
      {/* The bar is decorative: the same verdict is in the text below, so a
          screen reader would otherwise hear it twice. */}
      <div className={styles["track"]} aria-hidden="true">
        {Array.from({ length: SEGMENT_COUNT }, (_unused, index) => (
          <span
            key={index}
            className={clsx(styles["segment"], index < filled && styles[SEGMENT_CLASS[strength]])}
          />
        ))}
      </div>
      <p className={styles["verdict"]} aria-live="polite">
        {t("auth.passwordStrength")}{" "}
        <span className={styles[TEXT_CLASS[strength]]}>{t(STRENGTH_LABEL_KEYS[strength])}</span>
      </p>
    </div>
  );
};
