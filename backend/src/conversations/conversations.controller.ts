import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import {
  ConversationsService,
  CreateConversationDto,
  UpdateConversationDto,
} from "./conversations.service";
import { ClerkAuthGuard } from "@/auth/guards/clerk-auth.guard";
import {
  CurrentUser,
  AuthUser,
} from "@/auth/decorators/current-user.decorator";

@ApiTags("Conversations")
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller("conversations")
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new conversation" })
  @ApiResponse({
    status: 201,
    description: "Conversation created successfully",
  })
  async create(
    @CurrentUser() user: AuthUser,
    @Body() createConversationDto: CreateConversationDto
  ) {
    return this.conversationsService.create({
      ...createConversationDto,
      userId: user.id, // Use internal UUID, not clerkId
    });
  }

  @Get()
  @ApiOperation({ summary: "Get all conversations for current user" })
  @ApiResponse({
    status: 200,
    description: "Conversations retrieved successfully",
  })
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query("page") page = "1",
    @Query("limit") limit = "20"
  ) {
    return this.conversationsService.findAllByUser(
      user.id, // Use internal UUID
      parseInt(page),
      parseInt(limit)
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get conversation by ID" })
  @ApiResponse({
    status: 200,
    description: "Conversation retrieved successfully",
  })
  @ApiResponse({ status: 404, description: "Conversation not found" })
  async findOne(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.conversationsService.findOne(id, user.id); // Use internal UUID
  }

  @Put(":id")
  @ApiOperation({ summary: "Update conversation" })
  @ApiResponse({
    status: 200,
    description: "Conversation updated successfully",
  })
  async update(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() updateConversationDto: UpdateConversationDto
  ) {
    return this.conversationsService.update(
      id,
      user.id, // Use internal UUID
      updateConversationDto
    );
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete conversation" })
  @ApiResponse({
    status: 204,
    description: "Conversation deleted successfully",
  })
  async delete(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.conversationsService.delete(id, user.id); // Use internal UUID
  }
}
