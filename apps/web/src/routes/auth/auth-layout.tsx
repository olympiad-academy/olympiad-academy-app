import type { ReactElement, ReactNode } from "react";
import { AuthNav } from "@/components/auth-nav/auth-nav.js";
import styles from "./auth-layout.module.css";

/**
 * Shared shell for the real signup/login screens (design of record,
 * AuthScreen: back-nav header + a centred narrow column). Distinct from
 * StubLayout (routes/stubs/) even though the markup is similar: that one
 * is D2/D8 routing-skeleton scaffolding for screens that do not exist yet,
 * this one is the permanent home for screens that do.
 */
export interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps): ReactElement => {
  return (
    <div className={styles["page"]}>
      <AuthNav />
      <div className={styles["body"]}>
        <div className={styles["column"]}>{children}</div>
      </div>
    </div>
  );
};
