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
  role: string; // Accept string and convert to enum
  content: string;
  metadata?: any;
  images?: string[]; // Support for base64 images
  fileUris?: string[]; // Support for uploaded file IDs
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
        role: data.role.toUpperCase() as any, // Convert to uppercase for Prisma enum
        content: data.content,
        metadata: data.metadata,
      },
    });

    // Link uploaded files to this message if fileUris provided
    if (data.fileUris && data.fileUris.length > 0) {
      // Convert fileUris (which are actually file IDs) to proper updates
      const fileIds = data.fileUris;

      try {
        await this.prisma.uploadedFile.updateMany({
          where: {
            id: { in: fileIds },
            userId: userId, // Ensure files belong to the user
            messageId: null, // Only update files not already linked to a message
          },
          data: {
            messageId: message.id,
          },
        });
      } catch (error) {
        console.error("Error linking files to message:", error);
        // Don't fail the message creation if file linking fails
      }
    }

    // Update conversation's last activity
    await this.prisma.conversation.update({
      where: { id: data.conversationId },
      data: { updatedAt: new Date() },
    });

    // Return message with linked files
    const messageWithFiles = (await this.prisma.message.findUnique({
      where: { id: message.id },
      include: {
        uploadedFiles: true, // Include all fields for now
      },
    })) as any;

    return messageWithFiles || message;
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
          uploadedFiles: true, // Include all uploadedFile fields
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
