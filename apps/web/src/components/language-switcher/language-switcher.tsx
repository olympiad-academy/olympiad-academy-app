import type { ReactElement } from "react";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { useTranslation } from "react-i18next";
import { LanguageSchema } from "@olympiad-academy-app/api-client";
import { SUPPORTED_LOCALES } from "../../i18n/index.js";
import styles from "./language-switcher.module.css";

/**
 * Segmented language control (OLY-39 S4, decisions D1 + D3).
 *
 * The design of record (D11-A1 snapshot, App.tsx LangSwitcher) renders a
 * segmented button group showing short locale codes — not a dropdown — so the
 * Radix primitive is ToggleGroup (roving tabindex, single selection), which
 * the plan's S4 wording ("Radix Select") predates. The locale list comes from
 * the contract via SUPPORTED_LOCALES; a new contract locale appears here with
 * no code change. Visible labels are the codes per design; accessible names
 * are the full translated language names (languageSwitcher.* keys).
 */
export function LanguageSwitcher(): ReactElement {
  const { t, i18n } = useTranslation();

  const handleChange = (value: string): void => {
    // ToggleGroup fires with "" when the active segment is clicked again —
    // single-selection groups must not unselect, and unknown values must not
    // reach i18next.
    const parsed = LanguageSchema.safeParse(value);
    if (parsed.success && parsed.data !== i18n.language) {
      void i18n.changeLanguage(parsed.data);
    }
  };

  return (
    <ToggleGroup.Root
      type="single"
      value={i18n.language}
      onValueChange={handleChange}
      aria-label={t("languageSwitcher.label")}
      className={styles["root"]}
    >
      {SUPPORTED_LOCALES.map((locale) => (
        <ToggleGroup.Item
          key={locale}
          value={locale}
          aria-label={t(`languageSwitcher.${locale}`)}
          className={styles["item"]}
        >
          {locale.toUpperCase()}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
