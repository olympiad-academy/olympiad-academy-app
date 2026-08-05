import assert from "node:assert/strict";
import test from "node:test";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../src/auth/auth.service.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const JWT_RE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

function makeJwtService() {
  return {
    sign: (() => "mock.jwt.token") as (..._: unknown[]) => string,
  };
}

function makePrismaService(users: Map<string, { id: string; password_hash: string }>) {
  let counter = 0;
  return {
    user: {
      create: async (args: {
        data: {
          name: string;
          phone: string | null;
          email: string | null;
          password_hash: string;
          language: string;
          grade: number;
        };
        select: { id: true };
      }) => {
        const { phone, email } = args.data;
        const lookupKey = phone ?? email ?? "";
        if (lookupKey && users.has(lookupKey)) {
          const error = new Error() as Error & { code: string };
          error.code = "P2002";
          throw error;
        }
        const id = `11111111-1111-4111-${String(++counter).padStart(4, "0")}-111111111111`;
        users.set(lookupKey, { id, password_hash: args.data.password_hash });
        return { id };
      },
      findUnique: async (args: {
        where: { phone?: string; email?: string };
        select: { id: true; password_hash: true };
      }) => {
        const key = args.where.phone ?? args.where.email ?? "";
        const user = users.get(key);
        if (!user) return null;
        return { id: user.id, password_hash: user.password_hash };
      },
    },
  };
}

test("signup creates a user and returns user_id + valid JWT", async () => {
  const users = new Map<string, { id: string; password_hash: string }>();
  const service = new AuthService(
    makePrismaService(users) as unknown as Parameters<typeof AuthService.prototype.constructor>[0],
    makeJwtService() as unknown as Parameters<typeof AuthService.prototype.constructor>[1],
  );

  const result = await service.signup({
    name: "Test User",
    password: "password123",
    language: "uz",
    phone: "+998901234567",
    email: null,
  });

  assert.match(result.user_id, UUID_RE);
  assert.match(result.token, JWT_RE);
});

test("signup hashes password (never stored as plain text)", async () => {
  const users = new Map<string, { id: string; password_hash: string }>();
  const service = new AuthService(
    makePrismaService(users) as unknown as Parameters<typeof AuthService.prototype.constructor>[0],
    makeJwtService() as unknown as Parameters<typeof AuthService.prototype.constructor>[1],
  );

  await service.signup({
    name: "Test User",
    password: "mySecret123",
    language: "uz",
    phone: "+998901234568",
    email: null,
  });

  const stored = users.get("+998901234568");
  assert.ok(stored, "User should exist in store");
  assert.notEqual(stored.password_hash, "mySecret123");
  assert.ok(stored.password_hash.startsWith("$2a$") || stored.password_hash.startsWith("$2b$"));
});

test("signup with duplicate phone throws ConflictException", async () => {
  const users = new Map<string, { id: string; password_hash: string }>();
  const service = new AuthService(
    makePrismaService(users) as unknown as Parameters<typeof AuthService.prototype.constructor>[0],
    makeJwtService() as unknown as Parameters<typeof AuthService.prototype.constructor>[1],
  );

  await service.signup({
    name: "First",
    password: "password1!",
    language: "uz",
    phone: "+998901234569",
    email: null,
  });

  await assert.rejects(
    () =>
      service.signup({
        name: "Second",
        password: "password2@",
        language: "uz",
        phone: "+998901234569",
        email: null,
      }),
    (err: unknown) => err instanceof ConflictException,
  );
});

test("login with correct credentials returns user_id + token", async () => {
  const users = new Map<string, { id: string; password_hash: string }>();
  const service = new AuthService(
    makePrismaService(users) as unknown as Parameters<typeof AuthService.prototype.constructor>[0],
    makeJwtService() as unknown as Parameters<typeof AuthService.prototype.constructor>[1],
  );

  await service.signup({
    name: "Login Test",
    password: "correct",
    language: "uz",
    phone: "+998901234570",
    email: null,
  });

  const result = await service.login({
    password: "correct",
    phone: "+998901234570",
    email: null,
  });

  assert.match(result.user_id, UUID_RE);
  assert.match(result.token, JWT_RE);
});

test("login with wrong password throws UnauthorizedException", async () => {
  const users = new Map<string, { id: string; password_hash: string }>();
  const service = new AuthService(
    makePrismaService(users) as unknown as Parameters<typeof AuthService.prototype.constructor>[0],
    makeJwtService() as unknown as Parameters<typeof AuthService.prototype.constructor>[1],
  );

  await service.signup({
    name: "Login Test",
    password: "correct",
    language: "uz",
    phone: "+998901234571",
    email: null,
  });

  await assert.rejects(
    () =>
      service.login({
        password: "wrong",
        phone: "+998901234571",
        email: null,
      }),
    (err: unknown) => err instanceof UnauthorizedException,
  );
});

test("login with non-existent phone throws UnauthorizedException", async () => {
  const users = new Map<string, { id: string; password_hash: string }>();
  const service = new AuthService(
    makePrismaService(users) as unknown as Parameters<typeof AuthService.prototype.constructor>[0],
    makeJwtService() as unknown as Parameters<typeof AuthService.prototype.constructor>[1],
  );

  await assert.rejects(
    () =>
      service.login({
        password: "whatever",
        phone: "+998999999999",
        email: null,
      }),
    (err: unknown) => err instanceof UnauthorizedException,
  );
});

test("signup with email as identity works", async () => {
  const users = new Map<string, { id: string; password_hash: string }>();
  const service = new AuthService(
    makePrismaService(users) as unknown as Parameters<typeof AuthService.prototype.constructor>[0],
    makeJwtService() as unknown as Parameters<typeof AuthService.prototype.constructor>[1],
  );

  const result = await service.signup({
    name: "Email User",
    password: "password123",
    language: "en",
    phone: null,
    email: "test@example.com",
  });

  assert.match(result.user_id, UUID_RE);
  assert.match(result.token, JWT_RE);
});

test("login with email as identity works", async () => {
  const users = new Map<string, { id: string; password_hash: string }>();
  const service = new AuthService(
    makePrismaService(users) as unknown as Parameters<typeof AuthService.prototype.constructor>[0],
    makeJwtService() as unknown as Parameters<typeof AuthService.prototype.constructor>[1],
  );

  await service.signup({
    name: "Email User",
    password: "correct",
    language: "en",
    phone: null,
    email: "test@example.com",
  });

  const result = await service.login({
    password: "correct",
    phone: null,
    email: "test@example.com",
  });

  assert.match(result.user_id, UUID_RE);
  assert.match(result.token, JWT_RE);
});
