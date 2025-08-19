import { AuthService } from "./auth.service";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    getCurrentUser(req: any): Promise<any>;
    debugToken(token: string): Promise<{
        success: boolean;
        user: import("./auth.service").AuthenticatedUser;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        user?: undefined;
    }>;
}
