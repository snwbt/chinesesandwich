import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { z } from "zod";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  return session;
}

const pageSchema = z.object({
  slug: z.string().optional(),
  title: z.string().min(1),
  content: z.string(),
  published: z.boolean().optional(),
});

export async function GET() {
  const pages = await prisma.page.findMany({ orderBy: { slug: "asc" } });
  return NextResponse.json(pages);
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = pageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const { title, content, published = true } = parsed.data;
  const slug = parsed.data.slug ?? slugify(title);

  const page = await prisma.page.upsert({
    where: { slug },
    create: { slug, title, content, published },
    update: { title, content, published },
  });

  return NextResponse.json(page);
}
