import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import type { GuestSessionData } from "@/lib/guest-session";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { buildRSVPSummaryHtml } from "@/lib/rsvp";

export async function POST(request: Request) {
  const session = await getIronSession<GuestSessionData>(request, new Response(), {
    cookieName: "guest_session",
    password: process.env.NEXTAUTH_SECRET ?? "fallback-secret-change-me",
  });

  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { partyId } = body;

  if (!partyId) {
    return NextResponse.json({ error: "Missing partyId" }, { status: 400 });
  }

  const party = await prisma.party.findUnique({
    where: { id: partyId },
    include: {
      guests: {
        include: { rsvpResponse: true },
      },
    },
  });

  if (!party) {
    return NextResponse.json({ error: "Party not found" }, { status: 404 });
  }

  const questions = await prisma.customQuestion.findMany({ orderBy: { order: "asc" } });

  const html = buildRSVPSummaryHtml(party, questions);

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Email not configured" }, { status: 503 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "noreply@example.com",
    to: process.env.ADMIN_EMAIL ?? "admin@example.com",
    subject: `RSVP Summary: ${party.name}`,
    html,
  });

  return NextResponse.json({ success: true });
}
