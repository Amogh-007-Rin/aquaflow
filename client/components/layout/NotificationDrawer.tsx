"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

const alerts = [
  "COD predicted breach in 30m — Facility 2",
  "pH warning threshold crossed — Facility 1",
  "Anomaly fingerprint matched historical event #A-194",
];

export function NotificationDrawer() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-4 right-4 z-30">
      <Button onClick={() => setOpen((v) => !v)} variant="ghost">
        Notifications
      </Button>
      {open && (
        <div className="mt-2 w-80 rounded-lg border border-slate-700 bg-slate-900 p-3">
          <h3 className="mb-2 text-sm font-semibold">Recent notifications</h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {alerts.map((a) => (
              <li key={a} className="rounded border border-slate-800 p-2">
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
