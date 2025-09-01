import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { clerkClient } from "@clerk/clerk-sdk-node";

export interface ClerkUser {
  id: string;
  email_addresses: Array<{ email_address: string; id: string }>;
  first_name: string | null;
  last_name: string | null;
  image_url: string;
}

export interface AuthenticatedUser {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Verify Clerk token and get user information
   */
  async verifyClerkToken(token: string): Promise<AuthenticatedUser> {
    try {
      // In production, verify token with Clerk
      if (this.configService.get<string>("NODE_ENV") === "production") {
        this.logger.debug("Production mode: verifying with Clerk API");
        this.logger.debug(`Token: ${token?.substring(0, 20)}...`);

        const session = await clerkClient.verifyToken(token, {
          issuer: this.configService.get<string>("CLERK_ISSUER"),
          secretKey: this.configService.get<string>("CLERK_SECRET_KEY"),
        });

        if (!session || !session.sub) {
          throw new UnauthorizedException("Invalid token");
        }

        // Get user from Clerk
        const clerkUser = await clerkClient.users.getUser(session.sub);

        if (!clerkUser) {
          throw new UnauthorizedException("User not found");
        }

        // Save or update user in database
        const user = await this.saveOrUpdateUser(
          clerkUser as any,
          token,
          session
        );
        return user;
      } else {
        // Development mode - decode JWT manually or use mock data
        this.logger.debug("Development mode: using mock authentication");

        // Create mock user for development
        const mockUser = {
          id: "dev_user_123",
          email: "dev@example.com",
          firstName: "Dev",
          lastName: "User",
          imageUrl: "https://avatars.githubusercontent.com/u/1?v=4",
        };

        // Save mock user to database
        const user = await this.saveOrUpdateMockUser(mockUser, token);
        return user;
      }
    } catch (error) {
      this.logger.error("Token verification failed:", {
        error: error.message,
        stack: error.stack,
        type: error.constructor.name,
        tokenLength: token?.length,
      });

      if (error.message?.includes("fetch failed")) {
        this.logger.error(
          "Network error - check internet connection and Clerk service status"
        );
      }

      throw new UnauthorizedException(
        `Authentication failed: ${error.message}`
      );
    }
  }

  /**
   * Save or update user information in database
   */
  async saveOrUpdateUser(
    clerkUser: any, // Use any to handle different Clerk user structures
    token: string,
    session: any
  ): Promise<AuthenticatedUser> {
    this.logger.debug("Clerk user object:", JSON.stringify(clerkUser, null, 2));

    // Try multiple ways to get email
    const primaryEmail =
      clerkUser.email_addresses?.[0]?.email_address ||
      clerkUser.primary_email_address?.email_address ||
      clerkUser.email ||
      clerkUser.emailAddresses?.[0]?.emailAddress;

    if (!primaryEmail) {
      this.logger.error("Available user properties:", Object.keys(clerkUser));
      throw new UnauthorizedException("User email not found");
    }

    try {
      // Create or update user
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

      // Calculate token expiration (typically 1 hour)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Save or update session
      const sessionId = `${user.id}_${session.sid || Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Try to find existing session by token first
      const existingSession = await this.prisma.userSession.findUnique({
        where: { clerkToken: token },
      });

      if (existingSession) {
        // Update existing session
        await this.prisma.userSession.update({
          where: { id: existingSession.id },
          data: {
            isActive: true,
            expiresAt,
            lastActivity: new Date(),
            updatedAt: new Date(),
          },
        });
      } else {
        // Check if sessionId already exists (shouldn't happen but just in case)
        const existingSessionById = await this.prisma.userSession.findUnique({
          where: { sessionId },
        });

        if (existingSessionById) {
          // Use a completely unique sessionId
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
        } else {
          // Create new session
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
    } catch (error) {
      this.logger.error("Failed to save user:", error);
      throw new UnauthorizedException("Failed to save user information");
    }
  }

  /**
   * Get user by session token
   */
  async getUserByToken(token: string): Promise<AuthenticatedUser | null> {
    try {
      const session = await this.prisma.userSession.findUnique({
        where: { clerkToken: token },
        include: { user: true },
      });

      if (!session || !session.isActive || session.expiresAt < new Date()) {
        return null;
      }

      // Update last activity
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
    } catch (error) {
      this.logger.error("Failed to get user by token:", error);
      return null;
    }
  }

  /**
   * Invalidate user session
   */
  async invalidateSession(token: string): Promise<boolean> {
    try {
      await this.prisma.userSession.updateMany({
        where: { clerkToken: token },
        data: { isActive: false },
      });

      return true;
    } catch (error) {
      this.logger.error("Failed to invalidate session:", error);
      return false;
    }
  }

  /**
   * Save or update mock user for development
   */
  async saveOrUpdateMockUser(
    mockUser: any,
    token: string
  ): Promise<AuthenticatedUser> {
    try {
      // Create or update user
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

      // Calculate token expiration (typically 1 hour)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Save or update session
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
    } catch (error) {
      this.logger.error("Failed to save mock user:", error);
      throw new UnauthorizedException("Failed to save user information");
    }
  }

  /**
   * Clean expired sessions
   */
  async cleanExpiredSessions(): Promise<void> {
    try {
      const result = await this.prisma.userSession.deleteMany({
        where: {
          OR: [{ expiresAt: { lt: new Date() } }, { isActive: false }],
        },
      });

      this.logger.log(`Cleaned ${result.count} expired sessions`);
    } catch (error) {
      this.logger.error("Failed to clean expired sessions:", error);
    }
  }
}
