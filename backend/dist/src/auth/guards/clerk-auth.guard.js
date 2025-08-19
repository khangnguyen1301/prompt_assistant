"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ClerkAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClerkAuthGuard = void 0;
const common_1 = require("@nestjs/common");
let ClerkAuthGuard = ClerkAuthGuard_1 = class ClerkAuthGuard {
    constructor() {
        this.logger = new common_1.Logger(ClerkAuthGuard_1.name);
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        try {
            const authHeader = request.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                throw new common_1.UnauthorizedException("No valid authorization header found");
            }
            const token = authHeader.substring(7);
            if (!token || token.length < 10) {
                throw new common_1.UnauthorizedException("Invalid token format");
            }
            const mockUserId = "user_demo123";
            request.user = {
                id: mockUserId,
                clerkId: mockUserId,
            };
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
    (0, common_1.Injectable)()
], ClerkAuthGuard);
//# sourceMappingURL=clerk-auth.guard.js.map