import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "../auth.service";

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      // In development mode, use simplified authentication
      const nodeEnv = this.configService.get<string>("NODE_ENV");
      if (nodeEnv === "development") {
        this.logger.debug("Development mode: using simplified authentication");

        // Check if Authorization header exists
        const authHeader = request.headers.authorization;
        let token = "dev-token-123";

        if (authHeader && authHeader.startsWith("Bearer ")) {
          token = authHeader.substring(7);
        }

        // Use AuthService to handle user authentication and DB storage
        const user = await this.authService.verifyClerkToken(token);

        // Add user info to request
        request.user = user;

        return true;
      }

      // Check both lowercase and uppercase authorization headers
      const authHeader =
        request.headers.authorization || request.headers.Authorization;
      this.logger.debug(
        `Production mode - Auth header: ${authHeader ? "present" : "missing"}`
      );

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        this.logger.error(`Invalid auth header: ${authHeader}`);
        this.logger.error(
          `All headers:`,
          JSON.stringify(request.headers, null, 2)
        );
        throw new UnauthorizedException("No valid authorization header found");
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      if (!token || token.length < 10) {
        throw new UnauthorizedException("Invalid token format");
      }

      // Use AuthService to verify token and get user from DB
      const user = await this.authService.verifyClerkToken(token);

      // Add user info to request
      request.user = user;

      return true;
    } catch (error) {
      this.logger.error("Authentication failed:", error.message);
      throw new UnauthorizedException("Authentication failed");
    }
  }
}
