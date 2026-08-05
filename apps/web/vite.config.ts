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
  server: {
    proxy: {
      "/api": apiTarget,
    },
  },
});
