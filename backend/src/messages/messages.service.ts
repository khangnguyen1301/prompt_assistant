import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export enum MessageRole {
  USER = "USER",
  ASSISTANT = "ASSISTANT",
}

export interface CreateMessageDto {
  conversationId: string;
  role: MessageRole;
  content: string;
  metadata?: any;
}

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMessageDto, userId: string) {
    // Verify conversation belongs to user
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: data.conversationId },
    });

    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }

    if (conversation.userId !== userId) {
      throw new ForbiddenException("Access denied to this conversation");
    }

    // Create message
    const message = await this.prisma.message.create({
      data: {
        conversationId: data.conversationId,
        role: data.role as any, // Cast to Prisma enum
        content: data.content,
        metadata: data.metadata,
      },
    });

    // Update conversation's last activity
    await this.prisma.conversation.update({
      where: { id: data.conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async findByConversation(
    conversationId: string,
    userId: string,
    page = 1,
    limit = 50
  ) {
    // Verify conversation belongs to user
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }

    if (conversation.userId !== userId) {
      throw new ForbiddenException("Access denied to this conversation");
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
        include: {
          prompts: {
            select: {
              id: true,
              structuredPrompt: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.message.count({
        where: { conversationId },
      }),
    ]);

    return {
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id },
      include: {
        conversation: {
          select: { userId: true },
        },
        prompts: true,
      },
    });

    if (!message) {
      throw new NotFoundException("Message not found");
    }

    if (message.conversation.userId !== userId) {
      throw new ForbiddenException("Access denied to this message");
    }

    return message;
  }

  async delete(id: string, userId: string) {
    const message = await this.findOne(id, userId);

    return this.prisma.message.delete({
      where: { id },
    });
  }
}
