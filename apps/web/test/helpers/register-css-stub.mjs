/**
 * Test-runner support: `node --test` (via tsx) cannot load CSS. This registers
 * a loader hook that turns any *.css import into a JS module whose default
 * export maps every class name to itself (`styles.root === "root"`), so
 * component tests get deterministic class names without a bundler.
 *
 * Wired into `test:unit` via `--import`.
 */
import { register } from "node:module";

register("./css-module-stub-loader.mjs", import.meta.url);
