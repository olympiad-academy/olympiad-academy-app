import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import test from "node:test";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../src/app.module.js";
import { bootstrap } from "../src/main.js";

test("api exposes bootstrap and AppModule", () => {
  assert.equal(typeof bootstrap, "function");
  assert.equal(typeof AppModule, "function");
});

test("api health and readiness routes resolve through Nest DI in the tsx dev runtime", async () => {
  const app = await NestFactory.create(AppModule, { logger: false });
  await app.listen(0);

  try {
    const address = app.getHttpServer().address() as AddressInfo;
    const health = await fetch(`http://127.0.0.1:${address.port}/health`);
    const readiness = await fetch(`http://127.0.0.1:${address.port}/health/ready`);

    assert.equal(health.status, 200);
    const healthBody = (await health.json()) as { status: string; contractRouteCount: number };
    assert.equal(healthBody.status, "ok");
    // Proves apps/api can resolve @olympiad-academy-app/contracts at runtime, not just typecheck.
    assert.ok(healthBody.contractRouteCount > 0);
    assert.equal(readiness.status, 200);
    assert.deepEqual(await readiness.json(), { status: "ready" });
  } finally {
    await app.close();
  }
});
