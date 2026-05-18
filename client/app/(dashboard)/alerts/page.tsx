"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useState } from "react";

const filters = ["All", "Critical", "Warning", "Info", "Active", "Resolved", "Predicted"];
const alerts = [
  { id: "A1", severity: "CRITICAL", parameter: "COD", value: 511, threshold: 500, facility: "Facility 002", when: "5m ago", status: "ACTIVE" },
  { id: "A2", severity: "WARNING", parameter: "TSS", value: 540, threshold: 500, facility: "Facility 001", when: "17m ago", status: "ACTIVE" },
  { id: "A3", severity: "INFO", parameter: "pH", value: 6.7, threshold: 6.5, facility: "Facility 003", when: "48m ago", status: "RESOLVED" },
];

export default function AlertsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Alerts</h1>
      <Card className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Button key={f} variant={activeFilter === f ? "primary" : "ghost"} onClick={() => setActiveFilter(f)}>
            {f}
          </Button>
        ))}
      </Card>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <Card key={alert.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant={alert.severity === "CRITICAL" ? "breach" : alert.severity === "WARNING" ? "warning" : "info"}>
                    {alert.severity}
                  </Badge>
                  <span className="text-sm text-slate-300">{alert.parameter}</span>
                </div>
                <p className="text-sm text-slate-300">
                  {alert.value} vs {alert.threshold} • {alert.facility} • {alert.when}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost">Acknowledge</Button>
                <Button variant="danger">Resolve</Button>
                <Button variant="ghost">View Trend</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="mb-2 text-sm font-semibold">Alert Configuration</h3>
        <p className="text-sm text-slate-300">Channels: Email / Webhook / SMS • Per-parameter overrides • Suppression windows</p>
      </Card>
    </div>
  );
}
