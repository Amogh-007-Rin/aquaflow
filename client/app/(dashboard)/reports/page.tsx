"use client";

import { ReportCard } from "@/components/dashboard/ReportCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormEvent, useState } from "react";

export default function ReportsPage() {
  const [status, setStatus] = useState<string | null>(null);

  async function onGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const payload = {
      facilityId: String(fd.get("facilityId") ?? "facility_001"),
      period: String(fd.get("period") ?? "2026-05"),
      type: String(fd.get("type") ?? "MONTHLY"),
    };

    const res = await fetch("/api/reports/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setStatus("Failed to queue report generation.");
      return;
    }
    setStatus("Report queued. Status: GENERATING.");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Reports</h1>
      <Card>
        <form className="grid grid-cols-1 gap-3 md:grid-cols-4" onSubmit={onGenerate}>
          <select name="period" className="rounded border border-slate-700 bg-slate-900 px-3 py-2">
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
          </select>
          <select name="facilityId" className="rounded border border-slate-700 bg-slate-900 px-3 py-2">
            <option value="facility_001">Facility 001</option>
            <option value="facility_002">Facility 002</option>
            <option value="facility_003">Facility 003</option>
          </select>
          <select name="type" className="rounded border border-slate-700 bg-slate-900 px-3 py-2">
            <option value="REGULATORY_SUBMISSION">Regulatory Submission</option>
            <option value="INCIDENT">Incident</option>
            <option value="MONTHLY">Internal</option>
          </select>
          <Button type="submit">Generate PDF Report</Button>
        </form>
        {status && <p className="mt-3 text-sm text-cyan-200">{status}</p>}
      </Card>

      <div className="space-y-3">
        <ReportCard date="2026-05-18" type="Regulatory Submission" facility="Facility 001" status="READY" />
        <ReportCard date="2026-05-17" type="Incident" facility="Facility 002" status="GENERATING" />
        <ReportCard date="2026-05-16" type="Daily" facility="Facility 003" status="FAILED" />
      </div>
    </div>
  );
}
