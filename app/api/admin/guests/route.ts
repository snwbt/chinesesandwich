import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateInviteCode } from "@/lib/utils";
import { z } from "zod";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  return session;
}

const createGuestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  partyId: z.string().optional(),
  partyName: z.string().optional(),
});

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const guests = await prisma.guest.findMany({
    include: { party: true, rsvpResponse: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(guests);
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createGuestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const { name, email, partyId, partyName } = parsed.data;

  let resolvedPartyId = partyId;

  if (!resolvedPartyId && partyName) {
    const party = await prisma.party.create({
      data: { name: partyName, inviteCode: generateInviteCode() },
    });
    resolvedPartyId = party.id;
  }

  if (!resolvedPartyId) {
    return NextResponse.json({ error: "partyId or partyName required" }, { status: 400 });
  }

  const guest = await prisma.guest.create({
    data: {
      name,
      email: email || null,
      partyId: resolvedPartyId,
    },
    include: { party: true },
  });

  return NextResponse.json(guest, { status: 201 });
}
