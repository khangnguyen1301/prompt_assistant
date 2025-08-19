import {
  Controller,
  Get,
  Post,
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
import { MessagesService, CreateMessageDto } from "./messages.service";
import { ClerkAuthGuard } from "@/auth/guards/clerk-auth.guard";
import {
  CurrentUser,
  AuthUser,
} from "@/auth/decorators/current-user.decorator";

@ApiTags("Messages")
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller("messages")
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: "Create a new message" })
  @ApiResponse({ status: 201, description: "Message created successfully" })
  async create(
    @CurrentUser() user: AuthUser,
    @Body() createMessageDto: CreateMessageDto
  ) {
    return this.messagesService.create(createMessageDto, user.clerkId);
  }

  @Get("conversation/:conversationId")
  @ApiOperation({ summary: "Get messages for a conversation" })
  @ApiResponse({ status: 200, description: "Messages retrieved successfully" })
  async findByConversation(
    @CurrentUser() user: AuthUser,
    @Param("conversationId") conversationId: string,
    @Query("page") page = "1",
    @Query("limit") limit = "50"
  ) {
    return this.messagesService.findByConversation(
      conversationId,
      user.clerkId,
      parseInt(page),
      parseInt(limit)
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get message by ID" })
  @ApiResponse({ status: 200, description: "Message retrieved successfully" })
  async findOne(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.messagesService.findOne(id, user.clerkId);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete message" })
  @ApiResponse({ status: 204, description: "Message deleted successfully" })
  async delete(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.messagesService.delete(id, user.clerkId);
  }
}
