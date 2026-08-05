import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import test from "node:test";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../src/app.module.js";

const JWT_RE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

function authUrl(base: string, path: string) {
  return `http://127.0.0.1:${base}${path}`;
}

test(
  "POST /auth/signup returns { user_id, token } with 200 status",
  { skip: !process.env["DATABASE_URL"] ? "DATABASE_URL not set (no DB available)" : false },
  async () => {
    const app = await NestFactory.create(AppModule, { logger: false });
    await app.listen(0);

    try {
      const port = String((app.getHttpServer().address() as AddressInfo).port);
      const ts = Date.now();

      const res = await fetch(authUrl(port, "/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Integration User ${ts}`,
          password: "password123",
          language: "uz",
          phone: `+998${String(ts).slice(-9)}`,
          email: null,
        }),
      });

      assert.equal(res.status, 200);
      const body = (await res.json()) as { user_id: string; token: string };
      assert.match(body.user_id, /^[0-9a-f-]{36}$/i);
      assert.match(body.token, JWT_RE);
    } finally {
      await app.close();
    }
  },
);

test(
  "POST /auth/signup with duplicate phone returns 409",
  { skip: !process.env["DATABASE_URL"] ? "DATABASE_URL not set" : false },
  async () => {
    const app = await NestFactory.create(AppModule, { logger: false });
    await app.listen(0);

    try {
      const port = String((app.getHttpServer().address() as AddressInfo).port);
      const ts = Date.now();
      const phone = `+998${String(ts).slice(-9)}`;

      await fetch(authUrl(port, "/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `First ${ts}`,
          password: "password123",
          language: "uz",
          phone,
          email: null,
        }),
      });

      const res = await fetch(authUrl(port, "/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Second ${ts}`,
          password: "password456",
          language: "uz",
          phone,
          email: null,
        }),
      });

      assert.equal(res.status, 409);
    } finally {
      await app.close();
    }
  },
);

test(
  "POST /auth/login with correct credentials returns { user_id, token } with 200",
  { skip: !process.env["DATABASE_URL"] ? "DATABASE_URL not set" : false },
  async () => {
    const app = await NestFactory.create(AppModule, { logger: false });
    await app.listen(0);

    try {
      const port = String((app.getHttpServer().address() as AddressInfo).port);
      const ts = Date.now();
      const phone = `+998${String(ts).slice(-9)}`;
      const password = "loginTest!23";

      await fetch(authUrl(port, "/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Login ${ts}`,
          password,
          language: "uz",
          phone,
          email: null,
        }),
      });

      const res = await fetch(authUrl(port, "/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          phone,
          email: null,
        }),
      });

      assert.equal(res.status, 200);
      const body = (await res.json()) as { user_id: string; token: string };
      assert.match(body.user_id, /^[0-9a-f-]{36}$/i);
      assert.match(body.token, JWT_RE);
    } finally {
      await app.close();
    }
  },
);

test(
  "POST /auth/login with wrong password returns 401",
  { skip: !process.env["DATABASE_URL"] ? "DATABASE_URL not set" : false },
  async () => {
    const app = await NestFactory.create(AppModule, { logger: false });
    await app.listen(0);

    try {
      const port = String((app.getHttpServer().address() as AddressInfo).port);
      const ts = Date.now();
      const phone = `+998${String(ts).slice(-9)}`;

      await fetch(authUrl(port, "/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `WrongPw ${ts}`,
          password: "correctPass1",
          language: "uz",
          phone,
          email: null,
        }),
      });

      const res = await fetch(authUrl(port, "/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: "wrongPass2@",
          phone,
          email: null,
        }),
      });

      assert.equal(res.status, 401);
    } finally {
      await app.close();
    }
  },
);

test(
  "POST /auth/signup with neither phone nor email returns 400",
  { skip: !process.env["DATABASE_URL"] ? "DATABASE_URL not set" : false },
  async () => {
    const app = await NestFactory.create(AppModule, { logger: false });
    await app.listen(0);

    try {
      const port = String((app.getHttpServer().address() as AddressInfo).port);

      const res = await fetch(authUrl(port, "/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "No Contact",
          password: "password123",
          language: "uz",
          phone: null,
          email: null,
        }),
      });

      assert.equal(res.status, 400);
    } finally {
      await app.close();
    }
  },
);
