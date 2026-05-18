import { NextResponse } from "next/server";

const engineUrl = process.env.AI_ENGINE_URL ?? "http://localhost:8000";

export async function GET() {
  const response = await fetch(`${engineUrl}/alerts`, { cache: "no-store" });
  if (!response.ok) return NextResponse.json({ alerts: [] }, { status: 200 });
  const data = await response.json();
  return NextResponse.json(data);
}
