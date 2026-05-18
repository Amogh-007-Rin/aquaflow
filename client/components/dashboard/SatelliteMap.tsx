"use client";

import { useEffect, useRef } from "react";

type FacilityPin = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  score: number;
};

export function SatelliteMap({ facilities }: { facilities: FacilityPin[] }) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    let disposed = false;

    async function setupMap() {
      if (!mapContainerRef.current || mapRef.current) return;
      const L = await import("leaflet");
      if (disposed || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        preferCanvas: true,
      }).setView([20.5937, 78.9629], 5);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const points: Array<[number, number]> = [];
      facilities.forEach((facility) => {
        points.push([facility.latitude, facility.longitude]);
        const color = facility.score >= 85 ? "#00ff88" : facility.score >= 70 ? "#ffaa00" : "#ff3366";
        L.circleMarker([facility.latitude, facility.longitude], {
          radius: 8,
          color,
          fillColor: color,
          fillOpacity: 0.8,
          weight: 2,
        })
          .addTo(map)
          .bindPopup(
            `<strong>${facility.name}</strong><br/>Compliance score: ${facility.score}%<br/>Lat ${facility.latitude}, Lon ${facility.longitude}`
          );
      });

      if (points.length > 1) map.fitBounds(points, { padding: [24, 24] });
      mapRef.current = map;
    }

    setupMap();

    return () => {
      disposed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [facilities]);

  return (
    <div className="space-y-3 rounded-lg border border-[#1a2d4a] bg-[#091327] p-3">
      <p className="text-sm text-slate-300">Leaflet dark-map view (facility overlays)</p>
      <div ref={mapContainerRef} className="h-[420px] w-full overflow-hidden rounded-md border border-slate-800" />
    </div>
  );
}
