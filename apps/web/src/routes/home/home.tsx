import type { ReactElement } from "react";
import { SystemStatusRoute } from "../system-status/system-status.js";

export function HomeRoute(): ReactElement {
  return (
    <main>
      <h1>olympiad-academy-app — Web</h1>
      <SystemStatusRoute />
    </main>
  );
}
