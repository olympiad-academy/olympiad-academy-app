import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const apiPort = Number(globalThis.process?.env["API_PORT"] ?? "3000");
const apiTarget = [`http:`, "", `127.0.0.1:${apiPort}`].join("/");

export default defineConfig({
  // Without this plugin JSX still compiles (esbuild honours "jsx": "react-jsx"
  // from tsconfig), but React Fast Refresh does not run: every edit reloads the
  // page and drops component state. That is the difference between usable and
  // painful when building out screens.
  plugins: [react()],
  resolve: {
    alias: [
      // "@/x" -> "src/x", mirroring tsconfig paths. Regex find so scoped
      // packages (@olympiad-academy-app/*, @fontsource-variable/*) are
      // untouched — a plain "@" prefix alias would swallow them.
      {
        find: /^@\//,
        replacement: fileURLToPath(new URL("./src/", import.meta.url)),
      },
    ],
  },
  server: {
    proxy: {
      "/api": apiTarget,
    },
  },
});
