import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface GuestSessionData {
  authenticated: boolean;
}

export async function getGuestSession() {
  const cookieStore = await cookies();
  return getIronSession<GuestSessionData>(cookieStore, {
    cookieName: "guest_session",
    password: process.env.NEXTAUTH_SECRET ?? "fallback-secret-change-me",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  });
}
