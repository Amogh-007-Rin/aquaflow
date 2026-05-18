"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useState } from "react";

const predictions = [
  { parameter: "COD", probability: 87, predictedValue: 521, threshold: 500, confidence: 0.92 },
  { parameter: "TSS", probability: 63, predictedValue: 612, threshold: 600, confidence: 0.81 },
  { parameter: "AMMONIA", probability: 44, predictedValue: 43, threshold: 50, confidence: 0.77 },
];

export default function PredictionsPage() {
  const [horizon, setHorizon] = useState<15 | 30 | 60>(30);
  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-lg font-semibold">AI Prediction Confidence Panel</h1>
        <p className="mt-1 text-sm text-slate-400">Based on current trends, these breaches are predicted in the next 60 minutes.</p>
      </Card>

      <div className="space-x-2">
        {[15, 30, 60].map((h) => (
          <Button key={h} variant={horizon === h ? "primary" : "ghost"} onClick={() => setHorizon(h as 15 | 30 | 60)}>
            {h}m
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {predictions.map((p) => (
          <Card key={p.parameter}>
            <h2 className="mb-2 font-semibold">{p.parameter}</h2>
            <div className="mb-2 h-3 rounded bg-slate-800">
              <div className="h-3 rounded bg-rose-500" style={{ width: `${p.probability}%` }} />
            </div>
            <p className="text-sm text-slate-300">Breach probability: {p.probability}%</p>
            <p className="text-sm text-slate-300">Predicted value: {p.predictedValue}</p>
            <p className="text-sm text-slate-300">Threshold: {p.threshold}</p>
            <p className="text-sm text-slate-300">Confidence: {(p.confidence * 100).toFixed(0)}%</p>
            <Button className="mt-3" variant="ghost">
              Take Action
            </Button>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="mb-2 text-sm font-semibold">Prediction Accuracy Tracker</h3>
        <p className="text-sm text-slate-300">Accuracy: 91.3% • False positive rate: 7.8% • Recall: 89.1% (horizon {horizon}m)</p>
      </Card>
    </div>
  );
}
