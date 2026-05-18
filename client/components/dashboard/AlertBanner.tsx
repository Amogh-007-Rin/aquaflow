import { Badge } from "@/components/ui/Badge";

export function AlertBanner({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <div className="mb-4 rounded-md border border-rose-500/40 bg-rose-500/10 p-3">
      <div className="flex items-center gap-2">
        <Badge variant="breach">EMERGENCY</Badge>
        <p className="text-sm text-rose-100">{message}</p>
      </div>
    </div>
  );
}
