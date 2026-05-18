import { Card } from "@/components/ui/Card";

type GridCell = {
  parameter: string;
  scores: number[];
};

export function RiskHeatmap({ rows }: { rows: GridCell[] }) {
  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold">Risk Heatmap (24h)</h3>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.parameter} className="grid grid-cols-[120px_1fr] items-center gap-2">
            <span className="text-xs text-slate-300">{row.parameter}</span>
            <div className="grid grid-cols-12 gap-1">
              {row.scores.map((score, idx) => (
                <span
                  key={idx}
                  className="h-3 rounded"
                  style={{
                    backgroundColor: `rgba(255, 51, 102, ${Math.max(0.1, Math.min(1, score))})`,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
