import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { validateSeatAssignment } from "@/lib/seating";
import { z } from "zod";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [tables, unassigned] = await Promise.all([
    prisma.table.findMany({
      include: { assignments: { include: { guest: { include: { party: true } } } } },
      orderBy: { name: "asc" },
    }),
    prisma.guest.findMany({
      where: {
        rsvpResponse: { attending: true },
        seatAssignment: null,
      },
      include: { party: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return NextResponse.json({ tables, unassigned });
}

const assignSchema = z.object({
  guestId: z.string(),
  tableId: z.string(),
  seat: z.number().optional(),
});

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = assignSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const { guestId, tableId, seat } = parsed.data;

  const table = await prisma.table.findUnique({
    where: { id: tableId },
    include: { assignments: { include: { guest: true } } },
  });

  if (!table) {
    return NextResponse.json({ error: "Table not found" }, { status: 404 });
  }

  const validation = validateSeatAssignment(guestId, table);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 422 });
  }

  const assignment = await prisma.seatAssignment.upsert({
    where: { guestId },
    create: { guestId, tableId, seat },
    update: { tableId, seat },
  });

  return NextResponse.json(assignment);
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const guestId = searchParams.get("guestId");

  if (!guestId) {
    return NextResponse.json({ error: "guestId required" }, { status: 400 });
  }

  await prisma.seatAssignment.deleteMany({ where: { guestId } });
  return NextResponse.json({ ok: true });
}
