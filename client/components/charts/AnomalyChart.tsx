"use client";

import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Row = { t: string; value: number; anomaly?: boolean };

export function AnomalyChart({ data, threshold }: { data: Row[]; threshold?: number }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#1a2d4a" />
          <XAxis dataKey="t" tick={{ fill: "#4a7fa5" }} />
          <YAxis tick={{ fill: "#4a7fa5" }} />
          <Tooltip />
          {typeof threshold === "number" && <ReferenceLine y={threshold} stroke="#ff3366" strokeDasharray="5 5" />}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#00d4ff"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
