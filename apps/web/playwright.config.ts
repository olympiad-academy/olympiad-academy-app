import { defineConfig, devices } from "@playwright/test";

const webPort = Number(globalThis.process?.env["WEB_PORT"] ?? "5173");
const apiPort = Number(globalThis.process?.env["API_PORT"] ?? "3000");
const webBaseUrl = [`http:`, "", `127.0.0.1:${webPort}`].join("/");
const apiBaseUrl = [`http:`, "", `127.0.0.1:${apiPort}`].join("/");
const reuseExistingServer = globalThis.process?.env["CI"] !== "true";

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: webBaseUrl,
  },
  webServer: [
    // The API server is only started when a spec actually needs it
    // (E2E_API=1). OLY-39's specs are frontend-only, and requiring a live
    // Postgres for a language-switcher proof would make the suite fragile
    // for no gain. Specs that hit the API must say so in their file header.
    ...(globalThis.process?.env["E2E_API"] === "1"
      ? [
          {
            command: "pnpm --dir ../.. run dev:api",
            url: `${apiBaseUrl}/health/ready`,
            reuseExistingServer,
            timeout: 120_000,
          },
        ]
      : []),
    {
      command: "pnpm --dir ../.. run dev:web",
      url: webBaseUrl,
      reuseExistingServer,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: "chromium",
      use: devices["Desktop Chrome"],
    },
  ],
});
