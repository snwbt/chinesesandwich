import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  return session;
}

const settingsSchema = z.object({
  siteTitle: z.string().min(1).optional(),
  coupleNames: z.string().min(1).optional(),
  weddingDate: z.string().optional().nullable(),
  rsvpCutoff: z.string().optional().nullable(),
});

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const { siteTitle, coupleNames, weddingDate, rsvpCutoff } = parsed.data;

  const settings = await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      siteTitle: siteTitle ?? "Our Wedding",
      coupleNames: coupleNames ?? "The Happy Couple",
      weddingDate: weddingDate ? new Date(weddingDate) : null,
      rsvpCutoff: rsvpCutoff ? new Date(rsvpCutoff) : null,
    },
    update: {
      ...(siteTitle && { siteTitle }),
      ...(coupleNames && { coupleNames }),
      weddingDate: weddingDate ? new Date(weddingDate) : null,
      rsvpCutoff: rsvpCutoff ? new Date(rsvpCutoff) : null,
    },
  });

  return NextResponse.json(settings);
}
