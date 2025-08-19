import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Body,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ClerkAuthGuard } from "./guards/clerk-auth.guard";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("me")
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user information" })
  @ApiResponse({
    status: 200,
    description: "User information retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getCurrentUser(@Request() req) {
    return req.user;
  }

  @Post("debug")
  @ApiOperation({ summary: "Debug Clerk token verification" })
  async debugToken(@Body("token") token: string) {
    try {
      const result = await this.authService.verifyClerkToken(token);
      return { success: true, user: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
