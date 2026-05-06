import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/events",
  "/search",
  "/categories",
  "/organizers",
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];

const AUTH_ONLY_PATHS = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];

function getTokenFromRequest(req: NextRequest): string | undefined {
  return (
    req.cookies.get("access_token")?.value ||
    req.cookies.get("refresh_token")?.value
  );
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = getTokenFromRequest(req);
  const isAuthenticated = !!token;

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && AUTH_ONLY_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Protect buyer routes
  if (pathname.startsWith("/checkout") || pathname.startsWith("/orders") || pathname.startsWith("/tickets") || pathname.startsWith("/profile")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect dashboard (organizer only — role check happens in the layout via ProtectedRoute)
  if (pathname.startsWith("/dashboard")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect scan routes
  if (pathname.startsWith("/scan")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     * - API routes
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
