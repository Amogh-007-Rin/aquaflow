export type SensorPacket = {
  facility_id: string;
  parameter: string;
  value: number;
  unit: string;
  timestamp: string;
  is_spike?: boolean;
  is_anomaly?: boolean;
  prediction_30m?: { probability: number; predicted_value: number | null; confidence: number };
  prediction_60m?: { probability: number; predicted_value: number | null; confidence: number };
};

const fallbackEngine = "http://localhost:8000";
const engineUrl = process.env.NEXT_PUBLIC_AI_ENGINE_URL ?? fallbackEngine;

export async function getLatestReadings(facilityId: string): Promise<SensorPacket[]> {
  const res = await fetch(`${engineUrl}/sensors/latest/${facilityId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch latest readings");
  const data = (await res.json()) as { readings: SensorPacket[] };
  return data.readings;
}

export async function getPredictions(facilityId: string) {
  const res = await fetch(`${engineUrl}/predictions/breach/${facilityId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch predictions");
  return res.json();
}
