"use client";

import { GaugeChart } from "@/components/charts/GaugeChart";
import { Card } from "@/components/ui/Card";

export function ComplianceRing({ score }: { score: number }) {
  return (
    <Card className="flex items-center justify-center">
      <div className="text-center">
        <h3 className="mb-2 text-sm text-slate-300">Compliance Score</h3>
        <GaugeChart value={score} />
      </div>
    </Card>
  );
}
