import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyEdgeToken } from "~/server/auth-edge";

// Routes that don't require authentication
const publicRoutes = [
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/reset-password",
];

// Routes that require admin access
const adminRoutes = ["/users"];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (publicRoutes.some((route) => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Get auth token from cookie
    const token = request.cookies.get("auth_token")?.value;

    // Redirect to login if no token
    if (!token) {
        const loginUrl = new URL("/auth/login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Verify token using Edge-compatible function
    const user = await verifyEdgeToken(token);

    // Redirect to login if token is invalid
    if (!user) {
        const loginUrl = new URL("/auth/login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Check if user is active
    if (user.status !== "Active") {
        const loginUrl = new URL("/auth/login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Check admin routes
    if (adminRoutes.some((route) => pathname.startsWith(route))) {
        if (user.userTier !== "Admin") {
            // Redirect non-admins to home
            const homeUrl = new URL("/", request.url);
            return NextResponse.redirect(homeUrl);
        }
    }

    return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
