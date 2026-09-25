import { ReactNode } from "react";
import DocsSidebar from "@/components/docs/DocsSidebar";

interface DocsLayoutProps {
  children: ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full">
      {/* Spacer to reserve width for fixed desktop sidebar */}
      <div className="hidden md:block w-64 flex-shrink-0" aria-hidden="true" />

      {/* Fixed Docs Sidebar */}
      <div className="hidden md:block">
        <DocsSidebar />
      </div>

      {/* Docs Content */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
