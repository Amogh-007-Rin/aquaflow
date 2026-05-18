"use client";

import { SparkLine } from "@/components/charts/SparkLine";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import clsx from "clsx";

type Status = "NORMAL" | "WARNING" | "BREACH";

export function SensorCard({
  parameter,
  value,
  unit,
  trend,
  status,
  history,
  riskScore,
  anomaly,
}: {
  parameter: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "stable";
  status: Status;
  history: number[];
  riskScore: number;
  anomaly?: boolean;
}) {
  const trendArrow = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";
  const badgeVariant = status === "BREACH" ? "breach" : status === "WARNING" ? "warning" : "normal";

  return (
    <Card className={clsx("space-y-3", anomaly && "animate-pulse border-rose-500/60")}>
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-semibold text-slate-300">{parameter}</h3>
        <Badge variant={badgeVariant}>{status}</Badge>
      </div>
      <div className="mono text-4xl font-bold">
        {value.toFixed(2)} <span className="text-sm text-slate-400">{unit}</span>
      </div>
      <SparkLine values={history} />
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Trend {trendArrow}</span>
        <span>Risk {(riskScore * 100).toFixed(0)}%</span>
      </div>
      <div className="h-2 rounded bg-slate-800">
        <div className="h-2 rounded bg-cyan-400" style={{ width: `${Math.min(100, Math.max(0, riskScore * 100))}%` }} />
      </div>
    </Card>
  );
}
