import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { z } from "zod";
import {
  AskWhyLogSchema,
  AttemptSchema,
  DailyActivitySchema,
  ProblemSchema,
  TopicSchema,
  UserSchema,
} from "@olympiad-academy-app/contracts";

/**
 * OLY-10 schema test: the Postgres schema (declared in
 * apps/api/prisma/schema.prisma) must stay in lockstep with the shared
 * contracts in packages/contracts (MVP doc §12). Both live in this repo, so
 * the test derives the expected columns directly from the Zod schemas rather
 * than from a hand-maintained duplicate list — a drift on either side fails.
 *
 * `hints` is deliberately NOT a table: packages/contracts fixates it inline
 * on `Problem.hints` as a required JSON triple (OLY-8 decision, see
 * entities/hint.ts). The test below asserts that `problems.hints` is a
 * required Json column, which is the shape the fixated contract describes.
 */

interface Column {
  type: string;
  nullable: boolean;
}

const PRISMA_SCHEMA_PATH = new URL("../../../apps/api/prisma/schema.prisma", import.meta.url);

const PRISMA_SCALAR_TYPES = new Set([
  "String",
  "Boolean",
  "Int",
  "BigInt",
  "Float",
  "Decimal",
  "DateTime",
  "Json",
  "Bytes",
  "Unsupported",
]);

const PRODUCT_TABLES = [
  { table: "users", schema: UserSchema },
  { table: "topics", schema: TopicSchema },
  { table: "problems", schema: ProblemSchema },
  { table: "attempts", schema: AttemptSchema },
  { table: "ask_why_log", schema: AskWhyLogSchema },
  { table: "daily_activity", schema: DailyActivitySchema },
] as const;

function parsePrismaSchema(prismaText: string): Map<string, Map<string, Column>> {
  const models = new Map<string, Map<string, Column>>();
  const modelBlock = /model\s+(\w+)\s*\{([^}]*)\}/g;

  for (const match of prismaText.matchAll(modelBlock)) {
    const modelName = match[1];
    const body = match[2];

    const tableMap = body.match(/@@map\("([^"]+)"\)/);
    const table = tableMap ? tableMap[1] : modelName.toLowerCase();

    const columns = new Map<string, Column>();
    for (const line of body.split("\n")) {
      const field = line.trim();
      if (field.length === 0 || field.startsWith("@@")) continue;

      const parts = field.split(/\s+/);
      const [name, rawType] = parts;
      const type = rawType.replace(/\?$/, "");
      const isList = rawType.endsWith("[]") || rawType.includes("[]");
      const nullable = rawType.includes("?");
      if (!name || name.startsWith("//")) continue;
      if (!PRISMA_SCALAR_TYPES.has(type) || isList) continue;

      columns.set(name, { type, nullable });
    }

    models.set(table, columns);
  }

  return models;
}

function zodToColumnSpec(fieldSchema: z.ZodTypeAny): Column {
  if (fieldSchema instanceof z.ZodDefault) {
    return zodToColumnSpec(fieldSchema._def.innerType as z.ZodTypeAny);
  }
  if (fieldSchema instanceof z.ZodNullable) {
    const inner = zodToColumnSpec(fieldSchema._def.innerType as z.ZodTypeAny);
    return { ...inner, nullable: true };
  }
  if (fieldSchema instanceof z.ZodEffects) {
    return zodToColumnSpec(fieldSchema.innerType());
  }
  if (fieldSchema instanceof z.ZodString) {
    const checks = fieldSchema._def.checks as { kind?: string }[];
    const isTimestamp = checks.some((check) => check.kind === "datetime" || check.kind === "date");
    return { type: isTimestamp ? "DateTime" : "String", nullable: false };
  }
  if (fieldSchema instanceof z.ZodNumber) {
    return { type: "Int", nullable: false };
  }
  if (fieldSchema instanceof z.ZodBoolean) {
    return { type: "Boolean", nullable: false };
  }
  if (fieldSchema instanceof z.ZodEnum || fieldSchema instanceof z.ZodNativeEnum) {
    return { type: "String", nullable: false };
  }
  if (fieldSchema instanceof z.ZodUnion) {
    const options = fieldSchema._def.options as z.ZodLiteral<string | number>[];
    const valueKinds = new Set(options.map((option) => typeof option.value));
    const type = valueKinds.size === 1 && valueKinds.has("number") ? "Int" : "String";
    return { type, nullable: false };
  }
  if (fieldSchema instanceof z.ZodArray || fieldSchema instanceof z.ZodTuple) {
    return { type: "Json", nullable: false };
  }
  throw new Error(
    `Schema test cannot map Zod type ${(fieldSchema as z.ZodTypeAny).constructor.name} to a column`,
  );
}

function contractShape(schema: z.ZodTypeAny): z.ZodRawShape {
  const inner = schema instanceof z.ZodEffects ? schema.innerType() : schema;
  return (inner as z.ZodObject<z.ZodRawShape>).shape;
}

test("prisma schema stays in lockstep with the shared contract entities", () => {
  const prisma = readFileSync(PRISMA_SCHEMA_PATH, "utf8");
  const models = parsePrismaSchema(prisma);

  for (const { table, schema } of PRODUCT_TABLES) {
    const model = models.get(table);
    assert.ok(model, `Expected a Prisma model for table \`${table}\` (contracts entity)`);

    const expected = Object.entries(contractShape(schema)).map(([field, fieldSchema]) => [
      field,
      zodToColumnSpec(fieldSchema),
    ]);
    assert.deepEqual(
      [...model.keys()].sort(),
      expected.map(([field]) => field).sort(),
      `Table \`${table}\` must contain exactly the columns the contract defines`,
    );

    for (const [field, spec] of expected) {
      const actual = model.get(field);
      assert.deepEqual(
        actual,
        spec,
        `Column \`${table}.${field}\` must match the contract field type`,
      );
    }
  }
});

test("problems.hints is stored inline as a required Json column (OLY-8 fixated decision)", () => {
  const prisma = readFileSync(PRISMA_SCHEMA_PATH, "utf8");
  const models = parsePrismaSchema(prisma);

  const problems = models.get("problems");
  assert.ok(problems, "Expected a Prisma model for table `problems`");
  assert.deepEqual(problems.get("hints"), { type: "Json", nullable: false });
});

const MIGRATIONS_DIR = fileURLToPath(
  new URL("../../../apps/api/prisma/migrations/", import.meta.url),
);

/**
 * The one migration that creates the product tables. Identified by content,
 * not by directory name, so the test survives future migration renames.
 */
function productMigrationSql(): string {
  const migrations = readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => readFileSync(`${MIGRATIONS_DIR}${entry.name}/migration.sql`, "utf8"))
    .filter((sql) => sql.includes('CREATE TABLE "problems"'));
  assert.equal(
    migrations.length,
    1,
    "Expected exactly one migration that creates the product tables",
  );
  return migrations[0];
}

test("the product migration keeps difficulty 1-3 via a CHECK constraint, not 1-5 (OLY-10 review)", () => {
  const sql = productMigrationSql();
  assert.match(
    sql,
    /CONSTRAINT "problems_difficulty_check" CHECK \("difficulty" BETWEEN 1 AND 3\)/,
    "Expected a CHECK constraint pinning difficulty to 1-3",
  );
});

test("the product migration stores the worked solution as solution_steps JSONB, not explanation (OLY-10 review)", () => {
  const sql = productMigrationSql();
  const problemsTable = /CREATE TABLE "problems" \(([\s\S]*?)\n\);/.exec(sql);
  assert.ok(problemsTable, "Expected a CREATE TABLE block for `problems`");
  assert.match(
    problemsTable[1],
    /"solution_steps" JSONB NOT NULL/,
    "Expected problems.solution_steps to be a required JSONB column",
  );
  assert.doesNotMatch(
    problemsTable[1],
    /"explanation"/,
    "Expected no `explanation` column on problems",
  );
});

test("the product migration makes users.phone and users.email unique (OLY-10 review)", () => {
  const sql = productMigrationSql();
  assert.match(sql, /CREATE UNIQUE INDEX "users_phone_key" ON "users"\("phone"\)/);
  assert.match(sql, /CREATE UNIQUE INDEX "users_email_key" ON "users"\("email"\)/);
});
