import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { HealthService } from "./health.service";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: "Health check endpoint" })
  @ApiResponse({
    status: 200,
    description: "Application is healthy",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "ok" },
        timestamp: { type: "string", format: "date-time" },
        uptime: { type: "number" },
        version: { type: "string" },
        environment: { type: "string" },
        database: { type: "string", example: "connected" },
        redis: { type: "string", example: "connected" },
      },
    },
  })
  async check() {
    return this.healthService.check();
  }

  @Get("detailed")
  @ApiOperation({ summary: "Detailed health check with service status" })
  @ApiResponse({ status: 200, description: "Detailed health information" })
  async detailed() {
    return this.healthService.detailedCheck();
  }
}
