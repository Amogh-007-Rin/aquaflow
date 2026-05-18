import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { name?: string; email?: string; password?: string };
  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    return NextResponse.json({ error: "Email already exists." }, { status: 409 });
  }

  const password = await bcrypt.hash(body.password, 12);
  const user = await prisma.user.create({
    data: { email: body.email, name: body.name, password, role: "OPERATOR" },
  });

  return NextResponse.json({ id: user.id, email: user.email });
}
