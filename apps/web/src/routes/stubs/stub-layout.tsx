import type { ReactElement, ReactNode } from "react";
import { AuthNav } from "@/components/auth-nav/auth-nav.js";
import styles from "./stubs.module.css";

/**
 * Shared shell for the routing-skeleton stubs (D2/D8): the auth-style nav
 * from the design of record (back link + preference controls, which every
 * screen carries) and a centred placeholder body. The real screens replace
 * the stubs without touching the routes (OLY-40 auth, a future task for
 * Topic List).
 */
export function StubLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <div className={styles["page"]}>
      <AuthNav />
      <div className={styles["body"]}>{children}</div>
    </div>
  );
}
