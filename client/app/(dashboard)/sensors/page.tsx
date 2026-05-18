"use client";

import { SensorCard } from "@/components/dashboard/SensorCard";
import { Modal } from "@/components/ui/Modal";
import { useMemo, useState } from "react";

const parameters = ["PH", "COD", "BOD", "TSS", "TEMPERATURE", "AMMONIA", "HEAVY_METAL_LEAD", "HEAVY_METAL_MERCURY", "DISSOLVED_OXYGEN", "TURBIDITY"];

export default function SensorsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const cards = useMemo(
    () =>
      parameters.map((p, i) => {
        const value = p === "PH" ? 7.2 + (i % 4) * 0.2 : 80 + (i * 47.5);
        const risk = Math.min(0.95, 0.1 + i * 0.08);
        return {
          parameter: p,
          value,
          unit: p === "PH" ? "pH" : p.includes("TEMPERATURE") ? "°C" : "mg/L",
          trend: i % 3 === 0 ? "up" : i % 3 === 1 ? "down" : "stable",
          status: risk > 0.75 ? "BREACH" : risk > 0.45 ? "WARNING" : "NORMAL",
          history: Array.from({ length: 40 }).map((_, x) => value + Math.sin(x / 3) * 3),
          riskScore: risk,
          anomaly: i === 1 || i === 8,
        } as const;
      }),
    [],
  );

  const current = cards.find((c) => c.parameter === selected);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Sensors</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <button key={card.parameter} onClick={() => setSelected(card.parameter)} className="text-left">
            <SensorCard {...card} />
          </button>
        ))}
      </div>

      <Modal open={Boolean(current)} title={current?.parameter ?? "Sensor detail"} onClose={() => setSelected(null)}>
        {current && (
          <div className="space-y-2 text-sm text-slate-300">
            <p>Current value: {current.value.toFixed(3)} {current.unit}</p>
            <p>24h statistics: mean 218.33, median 209.98, stddev 18.1</p>
            <p>Prediction (30m): breach probability {(current.riskScore * 100).toFixed(0)}%</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
