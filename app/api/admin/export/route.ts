import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const guests = await prisma.guest.findMany({
    include: {
      party: true,
      rsvpResponse: true,
    },
    orderBy: { name: "asc" },
  });

  const rows = guests.map((g) => ({
    name: g.name,
    email: g.email ?? "",
    party: g.party.name,
    inviteCode: g.party.inviteCode,
    attending: g.rsvpResponse?.attending ?? "",
    rsvpDate: g.rsvpResponse?.submittedAt?.toISOString() ?? "",
  }));

  const headers = ["name", "email", "party", "inviteCode", "attending", "rsvpDate"];
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      headers.map((h) => `"${String(r[h as keyof typeof r]).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="guests.csv"',
    },
  });
}
