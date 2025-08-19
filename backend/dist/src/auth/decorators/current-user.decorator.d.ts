export interface AuthUser {
    id: string;
    clerkId: string;
}
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
