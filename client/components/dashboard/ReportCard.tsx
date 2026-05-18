import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function ReportCard({
  date,
  type,
  facility,
  status,
}: {
  date: string;
  type: string;
  facility: string;
  status: "READY" | "GENERATING" | "FAILED";
}) {
  const variant = status === "READY" ? "normal" : status === "FAILED" ? "breach" : "warning";
  return (
    <Card className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-200">{type}</p>
        <p className="text-xs text-slate-400">
          {facility} • {date}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={variant}>{status}</Badge>
        <Button variant="ghost">Download</Button>
      </div>
    </Card>
  );
}
