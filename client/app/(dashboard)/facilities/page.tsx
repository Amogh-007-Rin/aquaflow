import Link from "next/link";
import { Card } from "@/components/ui/Card";

const facilities = [
  { id: "facility_001", name: "Riverfront Textile ETP", status: "ACTIVE", location: "Mumbai" },
  { id: "facility_002", name: "Delta Chemical Works", status: "UNDER_REVIEW", location: "Delhi" },
  { id: "facility_003", name: "Green Foods Processing", status: "ACTIVE", location: "Bengaluru" },
];

export default function FacilitiesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Facilities</h1>
      <div className="space-y-3">
        {facilities.map((f) => (
          <Card key={f.id} className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{f.name}</p>
              <p className="text-sm text-slate-400">{f.location} • {f.status}</p>
            </div>
            <Link href={`/facilities/${f.id}`} className="text-sm text-cyan-300">
              View
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
