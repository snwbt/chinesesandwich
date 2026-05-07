import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { getIronSession } from "iron-session";
import type { GuestSessionData } from "@/lib/guest-session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes — require Auth.js session
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const session = await auth();
    if (!session?.user) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Guest routes — require iron-session cookie
  const guestRoutes = ["/rsvp", "/about", "/registry", "/faq", "/travel"];
  const isGuestRoute =
    guestRoutes.some((r) => pathname.startsWith(r));

  if (isGuestRoute) {
    const response = NextResponse.next();
    const session = await getIronSession<GuestSessionData>(request, response, {
      cookieName: "guest_session",
      password: process.env.NEXTAUTH_SECRET ?? "fallback-secret-change-me",
    });

    if (!session.authenticated) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|api/guest/login).*)",
  ],
};
