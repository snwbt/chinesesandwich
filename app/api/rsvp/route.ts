import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import type { GuestSessionData } from "@/lib/guest-session";
import { prisma } from "@/lib/prisma";
import { validateRSVPSubmission, buildRSVPSummaryHtml } from "@/lib/rsvp";
import { Resend } from "resend";

export async function POST(request: Request) {
  const session = await getIronSession<GuestSessionData>(request, new Response(), {
    cookieName: "guest_session",
    password: process.env.NEXTAUTH_SECRET ?? "fallback-secret-change-me",
  });

  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { partyId, responses } = body;

  if (!partyId || !Array.isArray(responses)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const party = await prisma.party.findUnique({
    where: { id: partyId },
    include: { guests: true },
  });

  if (!party) {
    return NextResponse.json({ error: "Party not found" }, { status: 404 });
  }

  const questions = await prisma.customQuestion.findMany({ orderBy: { order: "asc" } });

  const errors = validateRSVPSubmission(party, responses, questions);
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  for (const response of responses) {
    await prisma.rSVPResponse.upsert({
      where: { guestId: response.guestId },
      create: {
        guestId: response.guestId,
        attending: response.attending,
        answers: response.answers,
      },
      update: {
        attending: response.attending,
        answers: response.answers,
        updatedAt: new Date(),
      },
    });
  }

  const partyWithRsvps = await prisma.party.findUnique({
    where: { id: partyId },
    include: {
      guests: {
        include: { rsvpResponse: true },
      },
    },
  });

  if (partyWithRsvps && process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const html = buildRSVPSummaryHtml(partyWithRsvps, questions);
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "noreply@example.com",
        to: process.env.ADMIN_EMAIL ?? "admin@example.com",
        subject: `New RSVP: ${partyWithRsvps.name}`,
        html,
      });
    } catch (emailError) {
      console.error("Failed to send RSVP email:", emailError);
    }
  }

  return NextResponse.json({ success: true });
}
