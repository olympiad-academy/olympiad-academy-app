import assert from "node:assert/strict";
import test from "node:test";
import { App } from "../src/app/app.js";

test("web app exports a renderable app component", () => {
  assert.equal(typeof App, "function");
});
