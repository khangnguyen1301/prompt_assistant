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
exports.ConversationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ConversationsService = class ConversationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.conversation.create({
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
    }
    async findAllByUser(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [conversations, total] = await Promise.all([
            this.prisma.conversation.findMany({
                where: { userId },
                include: {
                    messages: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
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
    async findOne(id, userId) {
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
            throw new common_1.NotFoundException("Conversation not found");
        }
        if (conversation.userId !== userId) {
            throw new common_1.ForbiddenException("Access denied to this conversation");
        }
        return conversation;
    }
    async update(id, userId, data) {
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
    async delete(id, userId) {
        const conversation = await this.findOne(id, userId);
        return this.prisma.conversation.delete({
            where: { id },
        });
    }
    async updateLastActivity(id) {
        return this.prisma.conversation.update({
            where: { id },
            data: { updatedAt: new Date() },
        });
    }
};
exports.ConversationsService = ConversationsService;
exports.ConversationsService = ConversationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConversationsService);
//# sourceMappingURL=conversations.service.js.map