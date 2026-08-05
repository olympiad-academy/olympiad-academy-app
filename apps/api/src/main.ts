import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

const apiRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const workspaceRoot = resolve(apiRoot, "../..");
const localEnvFiles = [resolve(workspaceRoot, ".env"), resolve(apiRoot, ".env")];

function unquoteEnvValue(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseLocalEnvFile(filePath: string): readonly (readonly [string, string])[] {
  const entries: (readonly [string, string])[] = [];
  const lines = readFileSync(filePath, "utf8").split(/\r?\n/u);
  for (const [index, line] of lines.entries()) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("#")) continue;
    const match = /^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/u.exec(trimmed);
    if (match?.[1] === undefined || match[2] === undefined) {
      throw new Error(`Invalid local env line ${String(index + 1)} in ${filePath}`);
    }
    entries.push([match[1], unquoteEnvValue(match[2])]);
  }
  return entries;
}

function loadLocalEnvFiles(): void {
  const externallyDefinedKeys = new Set(Object.keys(process.env));
  const locallyLoadedKeys = new Set<string>();
  for (const envFile of localEnvFiles) {
    if (!existsSync(envFile)) continue;
    for (const [key, value] of parseLocalEnvFile(envFile)) {
      if (!externallyDefinedKeys.has(key) || locallyLoadedKeys.has(key)) {
        process.env[key] = value;
        locallyLoadedKeys.add(key);
      }
    }
  }
}

// Reference NestJS bootstrap for the @olympiad-academy-app/api app (DL-16).
// Loads generated local env files before app modules initialize so generated auth uses
// AUTH_SESSION_SECRET/JWT_SECRET from the project, not probe-only process injection.
export async function bootstrap(): Promise<void> {
  loadLocalEnvFiles();
  const { AppModule } = await import("./app.module.js");
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle("Olympiad Academy API")
    .setDescription("API for the Olympiad Academy application")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  const apiPortRaw = process.env["API_PORT"];
  const apiPort = apiPortRaw === undefined ? 3000 : Number(apiPortRaw);
  if (!Number.isFinite(apiPort)) throw new Error("API_PORT must be a finite number");
  await app.listen(apiPort);
}

const invokedPath = process.argv[1];
if (invokedPath !== undefined && import.meta.url === pathToFileURL(invokedPath).href) {
  void bootstrap();
}
