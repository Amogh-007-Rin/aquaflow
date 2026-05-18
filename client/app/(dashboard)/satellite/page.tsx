import { SatelliteMap } from "@/components/dashboard/SatelliteMap";
import { Card } from "@/components/ui/Card";

const facilities = [
  { id: "facility_001", name: "Facility 001", latitude: 19.076, longitude: 72.8777, score: 91 },
  { id: "facility_002", name: "Facility 002", latitude: 28.6139, longitude: 77.209, score: 76 },
  { id: "facility_003", name: "Facility 003", latitude: 12.9716, longitude: 77.5946, score: 84 },
];

export default function SatellitePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Satellite View</h1>
      <SatelliteMap facilities={facilities} />
      <Card>
        <h3 className="mb-2 text-sm font-semibold">Watershed Context</h3>
        <p className="text-sm text-slate-300">Downstream risk: Moderate • Groundwater proximity: 0.41 • Satellite last update: 3h ago • GRACE-FO stress index: Elevated</p>
      </Card>
    </div>
  );
}
