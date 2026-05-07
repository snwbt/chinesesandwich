import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  return session;
}

const createSchema = z.object({
  name: z.string().min(1),
  capacity: z.number().int().min(1).max(100),
});

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const table = await prisma.table.create({ data: parsed.data });
  return NextResponse.json(table, { status: 201 });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tableId = searchParams.get("tableId");

  if (!tableId) {
    return NextResponse.json({ error: "tableId required" }, { status: 400 });
  }

  await prisma.seatAssignment.deleteMany({ where: { tableId } });
  await prisma.table.delete({ where: { id: tableId } });

  return NextResponse.json({ ok: true });
}
