"use client";

type FacilityPin = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  score: number;
};

export function SatelliteMap({ facilities }: { facilities: FacilityPin[] }) {
  return (
    <div className="h-[420px] rounded-lg border border-[#1a2d4a] bg-[#091327] p-4">
      <p className="mb-3 text-sm text-slate-300">Leaflet dark-map view (facility overlays)</p>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {facilities.map((facility) => (
          <div key={facility.id} className="rounded border border-slate-700 bg-slate-900/60 p-3 text-sm">
            <p className="font-semibold text-cyan-200">{facility.name}</p>
            <p className="text-slate-400">Lat {facility.latitude}, Lon {facility.longitude}</p>
            <p className="text-slate-300">Compliance score: {facility.score}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}
