/**
 * Registers a happy-dom browser environment for component unit tests.
 * Import this module FIRST in any test file that renders React — the
 * registration must happen before @testing-library/react touches `document`.
 */
import { GlobalRegistrator } from "@happy-dom/global-registrator";

if (typeof globalThis.document === "undefined") {
  GlobalRegistrator.register();
}

// Tells React that test renders happen inside act()-aware runners; without it
// every state update logs a warning.
interface ReactActEnvironmentGlobal {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
}
(globalThis as unknown as ReactActEnvironmentGlobal)["IS_REACT_ACT_ENVIRONMENT"] = true;
