import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { facilityId: string; period: string; type: "DAILY" | "WEEKLY" | "MONTHLY" | "INCIDENT" | "REGULATORY_SUBMISSION" };
  const { facilityId, period, type } = body;
  if (!facilityId || !period || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const report = await prisma.report.create({
    data: { facilityId, period, type, status: "GENERATING" },
  });

  fetch(`${process.env.AI_ENGINE_URL ?? "http://localhost:8000"}/reports/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reportId: report.id, facilityId, period, type }),
  }).catch(() => null);

  return NextResponse.json({ reportId: report.id, status: "GENERATING" });
}
