import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  public status(): { status: "ok" } {
    return { status: "ok" };
  }

  @Get("ready")
  public readiness(): { status: "ready" } {
    return { status: "ready" };
  }
}
