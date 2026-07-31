import { register } from "node:module";
import { URL } from "node:url";

register(new URL("./mobile-test-loader.js", import.meta.url));
