import { ReactNode } from "react";
import AuthGate from "@/components/auth/AuthGate";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthGate>
      <div className="flex min-h-[calc(100vh-4rem)] w-full">
        {/* Persistent Desktop Sidebar */}
        <div className="hidden md:block">
          <DashboardSidebar />
        </div>

        {/* Dashboard Main Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </AuthGate>
  );
}
