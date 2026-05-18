import { NotificationDrawer } from "@/components/layout/NotificationDrawer";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4">
        <TopBar />
        {children}
        <NotificationDrawer />
      </main>
    </div>
  );
}
