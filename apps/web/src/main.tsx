// Self-hosted rather than loaded from the Google Fonts CDN as the design of
// record does: no third-party request in the critical path, and the demo renders
// correctly offline.
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/nunito";
// Custom properties first, then the rules that consume them.
import "@olympiad-academy-app/ui/tokens.css";
import "./styles/base.css";

import { createRoot } from "react-dom/client";
import { App } from "./app/app.js";
import { initBrowserTheme } from "./theme/index.js";

// The inline snippet in index.html has already set data-theme before first
// paint; this re-applies it so the attribute is right even if that snippet is
// ever removed (D12).
initBrowserTheme();

const rootElement = document.getElementById("root");
if (rootElement === null) {
  throw new Error("Root element #root not found");
}
createRoot(rootElement).render(<App />);
