"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";

export function SparkLine({ values }: { values: number[] }) {
  const data = values.map((value, i) => ({ i, value }));

  return (
    <div className="h-16 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="value" stroke="#00d4ff" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
