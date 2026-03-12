import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected paths
const protectedPaths = ["/orders", "/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path matches any of our protected route prefixes
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (isProtectedPath) {
    // Check for the "token" cookie set by AuthContext
    const token = request.cookies.get("token")?.value;

    if (!token) {
      // Create a URL to the login page, maintaining the intended destination as a query param
      const loginUrl = new URL("/auth", request.url);
      loginUrl.searchParams.set("mode", "login");
      loginUrl.searchParams.set("redirect", pathname);

      return NextResponse.redirect(loginUrl);
    }

    // Role check for /admin routes
    if (pathname.startsWith("/admin")) {
      try {
        const payloadBase64 = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        if (decodedPayload.role !== "ADMIN") {
          return NextResponse.redirect(new URL("/", request.url));
        }
      } catch (error) {
        console.error("Error decoding token in middleware:", error);
        return NextResponse.redirect(new URL("/auth?mode=login", request.url));
      }
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
