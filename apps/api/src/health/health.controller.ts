import { Controller, Get } from "@nestjs/common";
import { contract } from "@olympiad-academy-app/contracts";

@Controller("health")
export class HealthController {
  @Get()
  public status(): { status: "ok"; contractRouteCount: number } {
    // Importing `contract` here proves apps/api can consume
    // @olympiad-academy-app/contracts (OLY-8 DoD); real endpoints wire up
    // against individual contract routes in their own tickets.
    return { status: "ok", contractRouteCount: Object.keys(contract).length };
  }

  @Get("ready")
  public readiness(): { status: "ready" } {
    return { status: "ready" };
  }
}
