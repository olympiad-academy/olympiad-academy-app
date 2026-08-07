import type { ReactElement } from "react";
import { clsx } from "clsx";
import type { Feature } from "../landing-content.js";
import shared from "./landing-shared.module.css";

/** A card in a SectionCards grid: a Feature, optionally numbered (flow). */
export type SectionCard = Feature & { readonly stepNumber?: string };

interface SectionCardsProps {
  readonly kicker: string;
  readonly cards: readonly SectionCard[];
  /** Numbered cards (the «How it works» flow) use the compact icon size. */
  readonly numbered?: boolean;
}

/**
 * Shared «kicker + card grid» section — the design repeats this block for
 * «How it works» and «Why Olympiad Academy», differing only in the optional
 * step number and icon size. One component, no copy-pasted markup.
 */
export const SectionCards = ({ kicker, cards, numbered }: SectionCardsProps): ReactElement => {
  return (
    <section className={shared["section"]}>
      <div className={shared["sectionInner"]}>
        <div className={shared["sectionKicker"]}>{kicker}</div>
        <div className={shared["cardsGrid"]}>
          {cards.map((card) => (
            <div key={card.title} className={shared["card"]}>
              {card.stepNumber !== undefined ? (
                <div className={shared["cardNumber"]}>{card.stepNumber}</div>
              ) : null}
              <div
                className={clsx(shared["cardIcon"], numbered === true && shared["cardIconCompact"])}
              >
                {card.icon}
              </div>
              <div className={shared["cardTitle"]}>{card.title}</div>
              <p className={shared["cardDesc"]}>{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
