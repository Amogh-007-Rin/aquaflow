"use client";

import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Row = {
  time: string;
  value: number;
  warn?: number;
  breach?: number;
  anomaly?: boolean;
};

export function LiveFeedChart({ data }: { data: Row[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid stroke="#1a2d4a" />
          <XAxis dataKey="time" tick={{ fill: "#4a7fa5" }} />
          <YAxis tick={{ fill: "#4a7fa5" }} />
          <Tooltip />
          <ReferenceLine y={data[0]?.warn} stroke="#ffaa00" strokeDasharray="4 4" />
          <ReferenceLine y={data[0]?.breach} stroke="#ff3366" strokeDasharray="4 4" />
          <Line type="monotone" dataKey="value" stroke="#00d4ff" dot={false} strokeWidth={2} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
