import { Card } from "@/components/ui/Card";

export default async function FacilityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Facility Detail: {id}</h1>
      <Card>
        <p className="text-sm text-slate-300">Deep-dive panel with live KPIs, threshold overrides, user access, and report history for this facility.</p>
      </Card>
    </div>
  );
}
