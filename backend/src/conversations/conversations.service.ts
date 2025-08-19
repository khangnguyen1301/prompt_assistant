import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface CreateConversationDto {
  userId: string;
  title: string;
}

export interface UpdateConversationDto {
  title?: string;
}

@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateConversationDto) {
    console.log("🚀 Creating conversation with data:", data);

    try {
      const result = await this.prisma.conversation.create({
        data: {
          userId: data.userId,
          title: data.title,
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: 10,
          },
          _count: {
            select: { messages: true },
          },
        },
      });

      console.log("✅ Conversation created successfully:", result);
      return result;
    } catch (error) {
      console.error("❌ Failed to create conversation:", error);
      throw error;
    }
  }

  async findAllByUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where: { userId },
        include: {
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1, // Latest message only
          },
          _count: {
            select: { messages: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.conversation.count({
        where: { userId },
      }),
    ]);

    return {
      conversations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }

    if (conversation.userId !== userId) {
      throw new ForbiddenException("Access denied to this conversation");
    }

    return conversation;
  }

  async update(id: string, userId: string, data: UpdateConversationDto) {
    const conversation = await this.findOne(id, userId);

    return this.prisma.conversation.update({
      where: { id },
      data,
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  async delete(id: string, userId: string) {
    const conversation = await this.findOne(id, userId);

    return this.prisma.conversation.delete({
      where: { id },
    });
  }

  async updateLastActivity(id: string) {
    return this.prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });
  }
}
