import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected paths
const protectedPaths = ["/orders", "/admin"];

const decodeJwtPayload = (token: string): { role?: string; exp?: number } | null => {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = atob(padded);
    return JSON.parse(json) as { role?: string; exp?: number };
  } catch {
    return null;
  }
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path matches any of our protected route prefixes
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (isProtectedPath) {
    // Check for the "token" cookie set by auth store
    const token = request.cookies.get("token")?.value;

    if (!token) {
      // Create a URL to the login page, maintaining the intended destination as a query param
      const loginUrl = new URL("/auth", request.url);
      loginUrl.searchParams.set("mode", "login");
      loginUrl.searchParams.set("redirect", pathname);

      return NextResponse.redirect(loginUrl);
    }

    const payload = decodeJwtPayload(token);
    if (!payload?.role || !payload?.exp) {
      return NextResponse.redirect(new URL("/auth?mode=login", request.url));
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) {
      return NextResponse.redirect(new URL("/auth?mode=login", request.url));
    }

    // Role check for /admin routes
    if (pathname.startsWith("/admin") && payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// Config ensures middleware only runs on matching paths
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
