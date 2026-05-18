import { Card } from "@/components/ui/Card";

type PredictionBand = {
  parameter: string;
  probability: number;
};

export function PredictionTimeline({ items }: { items: PredictionBand[] }) {
  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold">Prediction Timeline (next 60m)</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.parameter}>
            <div className="mb-1 text-xs text-slate-300">{item.parameter}</div>
            <div className="h-3 overflow-hidden rounded bg-slate-800">
              <div
                className="h-full"
                style={{
                  width: `${Math.round(item.probability * 100)}%`,
                  backgroundColor: item.probability > 0.7 ? "#ff3366" : item.probability > 0.4 ? "#ffaa00" : "#00ff88",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
