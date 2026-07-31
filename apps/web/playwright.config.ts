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
    {
      command: "pnpm --dir ../.. run dev:api",
      url: `${apiBaseUrl}/health/ready`,
      reuseExistingServer,
      timeout: 120_000,
    },
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
