import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/auth";

export async function proxy(request: NextRequest) {
    // 1. Skip static assets
    if (request.nextUrl.pathname.startsWith("/_next") ||
        request.nextUrl.pathname.startsWith("/favicon.ico") ||
        request.nextUrl.pathname.startsWith("/api") // Optional: API routes might need their own auth check
    ) {
        return NextResponse.next();
    }

    // 2. Allow Login page
    if (request.nextUrl.pathname === "/login") {
        // Optional: Redirect to dashboard if already logged in?
        // for now keep simple
        return NextResponse.next();
    }

    // 3. Check Session
    const session = request.cookies.get("session")?.value;

    if (!session) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // 4. Update Session Expiration (Sliding Window)
    return await updateSession(request);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
