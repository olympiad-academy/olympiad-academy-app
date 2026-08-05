// Writes `tokens.css` next to this file from the token objects.
// Run: pnpm --filter @olympiad-academy-app/ui run gen:tokens
//
// Lives under src/ rather than in a scripts/ directory on purpose: only src/ is
// in this package's tsconfig `include`, so this is where the generator gets the
// same strict type checking as the tokens it renders. It is not re-exported from
// index.ts, so it is invisible to consumers of the package.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { formatTokensCss, TOKENS_CSS_PATH } from "./css.js";

const target = fileURLToPath(new URL(TOKENS_CSS_PATH, import.meta.url));
writeFileSync(target, await formatTokensCss(), "utf8");
process.stdout.write(`wrote ${target}\n`);
