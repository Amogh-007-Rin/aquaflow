import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const facilities = await prisma.facility.findMany({
    orderBy: { createdAt: "asc" },
    include: { sensors: true },
  });
  return NextResponse.json({ facilities });
}
