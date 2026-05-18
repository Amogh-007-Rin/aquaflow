import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { ComplianceRing } from "@/components/dashboard/ComplianceRing";
import { LiveFeedChart } from "@/components/dashboard/LiveFeedChart";
import { PredictionTimeline } from "@/components/dashboard/PredictionTimeline";
import { RiskHeatmap } from "@/components/dashboard/RiskHeatmap";
import { Card } from "@/components/ui/Card";

const chartData = Array.from({ length: 16 }).map((_, i) => ({
  time: `${i}:00`,
  value: 320 + Math.sin(i / 2) * 35,
  warn: 400,
  breach: 500,
}));

const predictionData = [
  { parameter: "COD", probability: 0.87 },
  { parameter: "BOD", probability: 0.42 },
  { parameter: "TSS", probability: 0.54 },
  { parameter: "AMMONIA", probability: 0.23 },
];

const heatmapRows = [
  { parameter: "PH", scores: [0.1, 0.2, 0.18, 0.2, 0.25, 0.3, 0.4, 0.45, 0.25, 0.2, 0.15, 0.1] },
  { parameter: "COD", scores: [0.2, 0.3, 0.35, 0.4, 0.48, 0.55, 0.6, 0.65, 0.73, 0.78, 0.8, 0.83] },
  { parameter: "BOD", scores: [0.15, 0.19, 0.22, 0.25, 0.27, 0.3, 0.31, 0.33, 0.37, 0.4, 0.42, 0.45] },
];

export default function DashboardHomePage() {
  return (
    <div className="space-y-4">
      <AlertBanner message="Predicted COD breach in Facility 2 within 30 minutes." />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Card><p className="text-sm text-slate-400">Compliance Score</p><p className="mono text-2xl">88%</p></Card>
        <Card><p className="text-sm text-slate-400">Active Alerts</p><p className="mono text-2xl">3</p></Card>
        <Card><p className="text-sm text-slate-400">Sensors OK</p><p className="mono text-2xl">26 / 30</p></Card>
        <Card><p className="text-sm text-slate-400">Predicted Breaches</p><p className="mono text-2xl">1 next hour</p></Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-sm font-semibold">Live Sensor Feed</h3>
          <LiveFeedChart data={chartData} />
        </Card>
        <RiskHeatmap rows={heatmapRows} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <PredictionTimeline items={predictionData} />
        <Card>
          <h3 className="mb-2 text-sm font-semibold">Recent Alerts</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="rounded border border-rose-500/30 bg-rose-500/10 p-2">CRITICAL • COD 511 mg/L vs 500 mg/L</li>
            <li className="rounded border border-amber-500/30 bg-amber-500/10 p-2">WARNING • TSS 545 mg/L vs 500 mg/L</li>
            <li className="rounded border border-cyan-500/30 bg-cyan-500/10 p-2">INFO • pH trend stabilizing</li>
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ComplianceRing score={88} />
        <Card>
          <h3 className="mb-2 text-sm font-semibold">Section 82 Compliance Table</h3>
          <table className="w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th>Parameter</th>
                <th>Value</th>
                <th>Threshold</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>COD</td><td>476</td><td>500</td><td className="text-amber-300">Warning</td></tr>
              <tr><td>BOD</td><td>214</td><td>300</td><td className="text-emerald-300">Compliant</td></tr>
              <tr><td>TSS</td><td>490</td><td>600</td><td className="text-emerald-300">Compliant</td></tr>
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
