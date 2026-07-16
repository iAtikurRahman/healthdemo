import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/topnav";
import { FloatingAiButton } from "@/components/layout/floating-ai-button";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav />
        <main className="flex-1 bg-grid px-4 py-6 lg:px-6">{children}</main>
      </div>
      <FloatingAiButton />
    </div>
  );
}
