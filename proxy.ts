import nextAuthMiddleware from "next-auth/middleware";

export function proxy(request: Request) {
	// Delegate to NextAuth's middleware for auth handling
	return nextAuthMiddleware(request as any);
}

export const config = { matcher: ["/calendar/:path*"] };
