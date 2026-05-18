import { Card } from "@/components/ui/Card";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Settings</h1>
      <Card>
        <h2 className="mb-2 text-sm font-semibold">Thresholds and notifications</h2>
        <p className="text-sm text-slate-300">Configure Section 82 threshold overrides, channel preferences (Email/Webhook/SMS), and suppression windows.</p>
      </Card>
      <Card>
        <h2 className="mb-2 text-sm font-semibold">Webhook integration hub</h2>
        <p className="text-sm text-slate-300">Route alerts to Slack, Teams, or custom HTTPS endpoints with facility-level controls.</p>
      </Card>
    </div>
  );
}
