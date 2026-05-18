export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const facilityId = searchParams.get("facilityId") ?? "facility_001";
  const upstreamUrl = `${process.env.AI_ENGINE_URL ?? "http://localhost:8000"}/sensors/stream/${facilityId}`;

  const upstream = await fetch(upstreamUrl, { headers: { Accept: "text/event-stream" } });
  if (!upstream.body) {
    return new Response("Upstream stream unavailable", { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
