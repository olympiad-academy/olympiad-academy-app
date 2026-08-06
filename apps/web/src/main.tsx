// Self-hosted rather than loaded from the Google Fonts CDN as the design of
// record does: no third-party request in the critical path, and the demo renders
// correctly offline.
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/nunito";
// Custom properties first, then the rules that consume them.
import "@olympiad-academy-app/ui/tokens.css";
import "./styles/base.css";

import { createRoot } from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import { App } from "./app/app.js";
import { createBrowserI18n } from "./i18n/index.js";
import { initBrowserTheme } from "./theme/index.js";

// The inline snippet in index.html has already set data-theme before first
// paint; this re-applies it so the attribute is right even if that snippet is
// ever removed (D12).
initBrowserTheme();

const rootElement = document.getElementById("root");
if (rootElement === null) {
  throw new Error("Root element #root not found");
}

// i18n init is async (stored-locale resolution), so the first render waits for
// it — every screen below the provider can rely on t()/useTranslation (D1).
async function bootstrap(container: HTMLElement): Promise<void> {
  const i18n = await createBrowserI18n();
  createRoot(container).render(
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>,
  );
}

void bootstrap(rootElement);
