import { Module } from "@nestjs/common";
import type { ModuleMetadata } from "@nestjs/common";
import { HealthModule } from "./health/health.module.js";

const generatedApiModules: NonNullable<ModuleMetadata["imports"]> = [];
// vibe-engineer:api-module-integrations:end

// Root application module composing the public health surface and
// schematic-generated API modules. Generated module registrations are inserted
// through the deterministic integration anchor above.
@Module({ imports: [HealthModule, ...generatedApiModules] })
export class AppModule {}
