import { ReactNode } from "react";
import DocsSidebar from "@/components/docs/DocsSidebar";

interface DocsLayoutProps {
  children: ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full">
      {/* Docs Sidebar */}
      <div className="hidden md:block">
        <DocsSidebar />
      </div>

      {/* Docs Content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
