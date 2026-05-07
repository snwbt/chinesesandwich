import { NextResponse } from "next/server";
import { getGuestSession } from "@/lib/guest-session";
import { z } from "zod";

const schema = z.object({
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { password } = parsed.data;
  const expected = process.env.GUEST_PASSWORD;

  if (!expected || password !== expected) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const session = await getGuestSession();
  session.authenticated = true;
  await session.save();

  return NextResponse.json({ ok: true });
}
