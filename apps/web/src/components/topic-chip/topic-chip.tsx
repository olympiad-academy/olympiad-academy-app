import type { CSSProperties, ReactElement } from "react";
import styles from "./topic-chip.module.css";

/**
 * Topic accent chip (landing hero + /topics stub). The accent is a runtime
 * value from topicAccentTokens (packages/ui owns the palette); per D12 it is
 * applied inline as --topic-accent and the tint derives via color-mix() in
 * the CSS module. The single cast lives here so call sites stay clean.
 */
export function TopicChip({ accent, label }: { accent: string; label: string }): ReactElement {
  return (
    <span className={styles["chip"]} style={{ "--topic-accent": accent } as CSSProperties}>
      {label}
    </span>
  );
}
