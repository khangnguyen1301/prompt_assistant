import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { PromptsService, GeneratePromptDto } from "./prompts.service";
import { ClerkAuthGuard } from "@/auth/guards/clerk-auth.guard";
import {
  CurrentUser,
  AuthUser,
} from "@/auth/decorators/current-user.decorator";

@ApiTags("Prompts")
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller("prompts")
export class PromptsController {
  constructor(private readonly promptsService: PromptsService) {}

  @Post("generate")
  @ApiOperation({ summary: "Generate optimized prompt from user input" })
  @ApiResponse({
    status: 201,
    description: "Prompt generated successfully",
    schema: {
      type: "object",
      properties: {
        id: { type: "string" },
        optimizedPrompt: {
          type: "object",
          properties: {
            goal: { type: "string" },
            input: { type: "string" },
            output: { type: "string" },
            instructions: { type: "array", items: { type: "string" } },
            notes: { type: "array", items: { type: "string" } },
            rawText: { type: "string" },
          },
        },
        originalInput: { type: "string" },
        metadata: {
          type: "object",
          properties: {
            processingTime: { type: "number" },
            tokensUsed: { type: "number" },
            model: { type: "string" },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: "Invalid input" })
  @ApiResponse({ status: 500, description: "AI service error" })
  async generatePrompt(
    @CurrentUser() user: AuthUser,
    @Body() generatePromptDto: GeneratePromptDto
  ) {
    return this.promptsService.generateOptimizedPrompt(
      generatePromptDto,
      user.clerkId
    );
  }

  @Get("history")
  @ApiOperation({ summary: "Get prompt generation history" })
  @ApiResponse({ status: 200, description: "History retrieved successfully" })
  async getHistory(
    @CurrentUser() user: AuthUser,
    @Query("page") page = "1",
    @Query("limit") limit = "20"
  ) {
    return this.promptsService.getPromptHistory(
      user.clerkId,
      parseInt(page),
      parseInt(limit)
    );
  }
}
