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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async verifyClerkToken(token) {
        try {
            if (this.configService.get("NODE_ENV") === "production") {
                this.logger.debug("Production mode: verifying with Clerk API");
                this.logger.debug(`Token: ${token?.substring(0, 20)}...`);
                const session = await clerk_sdk_node_1.clerkClient.verifyToken(token, {
                    issuer: `https://fresh-cougar-64.clerk.accounts.dev`,
                    secretKey: this.configService.get("CLERK_SECRET_KEY"),
                });
                if (!session || !session.sub) {
                    throw new common_1.UnauthorizedException("Invalid token");
                }
                const clerkUser = await clerk_sdk_node_1.clerkClient.users.getUser(session.sub);
                if (!clerkUser) {
                    throw new common_1.UnauthorizedException("User not found");
                }
                const user = await this.saveOrUpdateUser(clerkUser, token, session);
                return user;
            }
            else {
                this.logger.debug("Development mode: using mock authentication");
                const mockUser = {
                    id: "dev_user_123",
                    email: "dev@example.com",
                    firstName: "Dev",
                    lastName: "User",
                    imageUrl: "https://avatars.githubusercontent.com/u/1?v=4",
                };
                const user = await this.saveOrUpdateMockUser(mockUser, token);
                return user;
            }
        }
        catch (error) {
            this.logger.error("Token verification failed:", {
                error: error.message,
                stack: error.stack,
                type: error.constructor.name,
                tokenLength: token?.length,
            });
            if (error.message?.includes("fetch failed")) {
                this.logger.error("Network error - check internet connection and Clerk service status");
            }
            throw new common_1.UnauthorizedException(`Authentication failed: ${error.message}`);
        }
    }
    async saveOrUpdateUser(clerkUser, token, session) {
        this.logger.debug("Clerk user object:", JSON.stringify(clerkUser, null, 2));
        const primaryEmail = clerkUser.email_addresses?.[0]?.email_address ||
            clerkUser.primary_email_address?.email_address ||
            clerkUser.email ||
            clerkUser.emailAddresses?.[0]?.emailAddress;
        if (!primaryEmail) {
            this.logger.error("Available user properties:", Object.keys(clerkUser));
            throw new common_1.UnauthorizedException("User email not found");
        }
        try {
            const user = await this.prisma.user.upsert({
                where: { clerkId: clerkUser.id },
                update: {
                    email: primaryEmail,
                    firstName: clerkUser.first_name,
                    lastName: clerkUser.last_name,
                    imageUrl: clerkUser.image_url,
                    updatedAt: new Date(),
                },
                create: {
                    clerkId: clerkUser.id,
                    email: primaryEmail,
                    firstName: clerkUser.first_name,
                    lastName: clerkUser.last_name,
                    imageUrl: clerkUser.image_url,
                },
            });
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 1);
            const sessionId = `${user.id}_${session.sid || Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const existingSession = await this.prisma.userSession.findUnique({
                where: { clerkToken: token },
            });
            if (existingSession) {
                await this.prisma.userSession.update({
                    where: { id: existingSession.id },
                    data: {
                        isActive: true,
                        expiresAt,
                        lastActivity: new Date(),
                        updatedAt: new Date(),
                    },
                });
            }
            else {
                const existingSessionById = await this.prisma.userSession.findUnique({
                    where: { sessionId },
                });
                if (existingSessionById) {
                    const uniqueSessionId = `${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    await this.prisma.userSession.create({
                        data: {
                            userId: user.id,
                            clerkToken: token,
                            sessionId: uniqueSessionId,
                            isActive: true,
                            expiresAt,
                            lastActivity: new Date(),
                        },
                    });
                }
                else {
                    await this.prisma.userSession.create({
                        data: {
                            userId: user.id,
                            clerkToken: token,
                            sessionId,
                            isActive: true,
                            expiresAt,
                            lastActivity: new Date(),
                        },
                    });
                }
            }
            this.logger.log(`User authenticated and saved: ${user.email}`);
            return {
                id: user.id,
                clerkId: user.clerkId,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                imageUrl: user.imageUrl,
            };
        }
        catch (error) {
            this.logger.error("Failed to save user:", error);
            throw new common_1.UnauthorizedException("Failed to save user information");
        }
    }
    async getUserByToken(token) {
        try {
            const session = await this.prisma.userSession.findUnique({
                where: { clerkToken: token },
                include: { user: true },
            });
            if (!session || !session.isActive || session.expiresAt < new Date()) {
                return null;
            }
            await this.prisma.userSession.update({
                where: { id: session.id },
                data: { lastActivity: new Date() },
            });
            return {
                id: session.user.id,
                clerkId: session.user.clerkId,
                email: session.user.email,
                firstName: session.user.firstName,
                lastName: session.user.lastName,
                imageUrl: session.user.imageUrl,
            };
        }
        catch (error) {
            this.logger.error("Failed to get user by token:", error);
            return null;
        }
    }
    async invalidateSession(token) {
        try {
            await this.prisma.userSession.updateMany({
                where: { clerkToken: token },
                data: { isActive: false },
            });
            return true;
        }
        catch (error) {
            this.logger.error("Failed to invalidate session:", error);
            return false;
        }
    }
    async saveOrUpdateMockUser(mockUser, token) {
        try {
            const user = await this.prisma.user.upsert({
                where: { clerkId: mockUser.id },
                update: {
                    email: mockUser.email,
                    firstName: mockUser.firstName,
                    lastName: mockUser.lastName,
                    imageUrl: mockUser.imageUrl,
                    updatedAt: new Date(),
                },
                create: {
                    clerkId: mockUser.id,
                    email: mockUser.email,
                    firstName: mockUser.firstName,
                    lastName: mockUser.lastName,
                    imageUrl: mockUser.imageUrl,
                },
            });
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 1);
            await this.prisma.userSession.upsert({
                where: { clerkToken: token },
                update: {
                    isActive: true,
                    expiresAt,
                    lastActivity: new Date(),
                    updatedAt: new Date(),
                },
                create: {
                    userId: user.id,
                    clerkToken: token,
                    sessionId: `dev_session_${Date.now()}`,
                    isActive: true,
                    expiresAt,
                    lastActivity: new Date(),
                },
            });
            this.logger.log(`Mock user authenticated and saved: ${user.email}`);
            return {
                id: user.id,
                clerkId: user.clerkId,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                imageUrl: user.imageUrl,
            };
        }
        catch (error) {
            this.logger.error("Failed to save mock user:", error);
            throw new common_1.UnauthorizedException("Failed to save user information");
        }
    }
    async cleanExpiredSessions() {
        try {
            const result = await this.prisma.userSession.deleteMany({
                where: {
                    OR: [{ expiresAt: { lt: new Date() } }, { isActive: false }],
                },
            });
            this.logger.log(`Cleaned ${result.count} expired sessions`);
        }
        catch (error) {
            this.logger.error("Failed to clean expired sessions:", error);
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map