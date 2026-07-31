import { defineConfig } from "vite";

const apiPort = Number(globalThis.process?.env["API_PORT"] ?? "3000");
const apiTarget = [`http:`, "", `127.0.0.1:${apiPort}`].join("/");

export default defineConfig({
  server: {
    proxy: {
      "/api": apiTarget,
    },
  },
});
