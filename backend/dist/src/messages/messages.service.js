"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = exports.MessageRole = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
var MessageRole;
(function (MessageRole) {
    MessageRole["USER"] = "USER";
    MessageRole["ASSISTANT"] = "ASSISTANT";
})(MessageRole || (exports.MessageRole = MessageRole = {}));
let MessagesService = class MessagesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data, userId) {
        const conversation = await this.prisma.conversation.findUnique({
            where: { id: data.conversationId },
        });
        if (!conversation) {
            throw new common_1.NotFoundException("Conversation not found");
        }
        if (conversation.userId !== userId) {
            throw new common_1.ForbiddenException("Access denied to this conversation");
        }
        const message = await this.prisma.message.create({
            data: {
                conversationId: data.conversationId,
                role: data.role,
                content: data.content,
                metadata: data.metadata,
            },
        });
        await this.prisma.conversation.update({
            where: { id: data.conversationId },
            data: { updatedAt: new Date() },
        });
        return message;
    }
    async findByConversation(conversationId, userId, page = 1, limit = 50) {
        const conversation = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
        });
        if (!conversation) {
            throw new common_1.NotFoundException("Conversation not found");
        }
        if (conversation.userId !== userId) {
            throw new common_1.ForbiddenException("Access denied to this conversation");
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
    async findOne(id, userId) {
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
            throw new common_1.NotFoundException("Message not found");
        }
        if (message.conversation.userId !== userId) {
            throw new common_1.ForbiddenException("Access denied to this message");
        }
        return message;
    }
    async delete(id, userId) {
        const message = await this.findOne(id, userId);
        return this.prisma.message.delete({
            where: { id },
        });
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MessagesService);
//# sourceMappingURL=messages.service.js.map