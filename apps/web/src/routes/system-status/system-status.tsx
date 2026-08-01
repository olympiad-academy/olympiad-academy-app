import type { ReactElement } from "react";
import { createApiClient } from "@olympiad-academy-app/api-client";

// Proves apps/web can consume @olympiad-academy-app/api-client (which itself
// re-exports @olympiad-academy-app/contracts) end to end (OLY-8 DoD). Real
// data fetching against these routes is wired up in later tickets.
const apiClient = createApiClient("/api");

export function SystemStatusRoute(): ReactElement {
  return (
    <section aria-label="System status">
      system status slot — {Object.keys(apiClient).length} contract routes wired
    </section>
  );
}
