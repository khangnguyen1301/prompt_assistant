import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      // Get token from Authorization header
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new UnauthorizedException("No valid authorization header found");
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // For now, we'll do a basic validation
      // In production, you would verify the JWT token with Clerk
      if (!token || token.length < 10) {
        throw new UnauthorizedException("Invalid token format");
      }

      // Extract user ID from token (simplified for demo)
      // In production, decode JWT and verify signature
      const mockUserId = "user_demo123"; // This would come from JWT payload

      // Add user info to request
      request.user = {
        id: mockUserId,
        clerkId: mockUserId,
      };

      return true;
    } catch (error) {
      this.logger.error("Authentication failed:", error.message);
      throw new UnauthorizedException("Authentication failed");
    }
  }
}
