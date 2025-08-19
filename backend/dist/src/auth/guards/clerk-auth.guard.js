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
var ClerkAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClerkAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const auth_service_1 = require("../auth.service");
let ClerkAuthGuard = ClerkAuthGuard_1 = class ClerkAuthGuard {
    constructor(configService, authService) {
        this.configService = configService;
        this.authService = authService;
        this.logger = new common_1.Logger(ClerkAuthGuard_1.name);
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        try {
            const nodeEnv = this.configService.get("NODE_ENV");
            if (nodeEnv === "development") {
                this.logger.debug("Development mode: using simplified authentication");
                const authHeader = request.headers.authorization;
                let token = "dev-token-123";
                if (authHeader && authHeader.startsWith("Bearer ")) {
                    token = authHeader.substring(7);
                }
                const user = await this.authService.verifyClerkToken(token);
                request.user = user;
                return true;
            }
            console.log("🚀 ~ canActivate ~ request.headers:", request.headers);
            const authHeader = request.headers.authorization || request.headers.Authorization;
            this.logger.debug(`Production mode - Auth header: ${authHeader ? "present" : "missing"}`);
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                this.logger.error(`Invalid auth header: ${authHeader}`);
                this.logger.error(`All headers:`, JSON.stringify(request.headers, null, 2));
                throw new common_1.UnauthorizedException("No valid authorization header found");
            }
            const token = authHeader.substring(7);
            if (!token || token.length < 10) {
                throw new common_1.UnauthorizedException("Invalid token format");
            }
            const user = await this.authService.verifyClerkToken(token);
            request.user = user;
            return true;
        }
        catch (error) {
            this.logger.error("Authentication failed:", error.message);
            throw new common_1.UnauthorizedException("Authentication failed");
        }
    }
};
exports.ClerkAuthGuard = ClerkAuthGuard;
exports.ClerkAuthGuard = ClerkAuthGuard = ClerkAuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        auth_service_1.AuthService])
], ClerkAuthGuard);
//# sourceMappingURL=clerk-auth.guard.js.map