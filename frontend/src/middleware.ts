import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";

export default authMiddleware({
  // Routes that are completely public (no auth needed)
  publicRoutes: ["/sign-in(.*)", "/sign-up(.*)", "/api/webhooks(.*)"],

  // Routes that can always be publicly accessed, regardless of authentication status
  ignoredRoutes: [
    "/api/webhooks(.*)",
    "/_next(.*)",
    "/favicon.ico",
    "/api/health(.*)",
  ],

  // After sign in, redirect to home page
  afterAuth(auth, req, evt) {
    // Handle users who aren't authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    // If the user is authenticated and trying to access sign-in/sign-up, redirect to home
    if (
      auth.userId &&
      (req.nextUrl.pathname === "/sign-in" ||
        req.nextUrl.pathname === "/sign-up")
    ) {
      const homeUrl = new URL("/", req.url);
      return Response.redirect(homeUrl);
    }
  },
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
