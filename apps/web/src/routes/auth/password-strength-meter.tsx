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
/**
 * Everything that varies with the verdict, in one place. Four parallel
 * `Record<PasswordStrength, …>` lookups travelled together and had to be
 * kept in step by hand; one entry per verdict makes adding a band a single
 * edit and an incomplete one a type error.
 *
 * `segmentClass` and `textClass` stay separate fields on purpose: a filled
 * bar segment takes the colour as a background, the verdict word as text
 * colour, and one shared class put a highlighter swatch behind the word.
 */
interface StrengthPresentation {
  labelKey: string;
  filledSegments: number;
  segmentClass: string;
  textClass: string;
}

const SEGMENT_COUNT = 3;

const PRESENTATION: Record<PasswordStrength, StrengthPresentation> = {
  weak: {
    labelKey: "auth.passwordStrengthWeak",
    filledSegments: 1,
    segmentClass: "segmentWeak",
    textClass: "textWeak",
  },
  fair: {
    labelKey: "auth.passwordStrengthFair",
    filledSegments: 2,
    segmentClass: "segmentFair",
    textClass: "textFair",
  },
  strong: {
    labelKey: "auth.passwordStrengthStrong",
    filledSegments: 3,
    segmentClass: "segmentStrong",
    textClass: "textStrong",
  },
};

export interface PasswordStrengthMeterProps {
  strength: PasswordStrength | null;
}

export const PasswordStrengthMeter = ({
  strength,
}: PasswordStrengthMeterProps): ReactElement | null => {
  const { t } = useTranslation();

  // Nothing typed yet: render no meter at all rather than announcing "weak"
  // at a student who has not started.
  if (strength === null) {
    return null;
  }

  const presentation = PRESENTATION[strength];

  return (
    <div className={styles["meter"]}>
      {/* The bar is decorative: the same verdict is in the text below, so a
          screen reader would otherwise hear it twice. */}
      <div className={styles["track"]} aria-hidden="true">
        {Array.from({ length: SEGMENT_COUNT }, (_unused, index) => (
          <span
            key={index}
            className={clsx(
              styles["segment"],
              index < presentation.filledSegments && styles[presentation.segmentClass],
            )}
          />
        ))}
      </div>
      <p className={styles["verdict"]} aria-live="polite">
        {t("auth.passwordStrength")}{" "}
        <span className={styles[presentation.textClass]}>{t(presentation.labelKey)}</span>
      </p>
    </div>
  );
};
