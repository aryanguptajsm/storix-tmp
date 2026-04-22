import { Sidebar } from "@/components/Sidebar";
import { MeshBackground } from "@/components/ui/MeshBackground";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen relative overflow-hidden">
      <MeshBackground />
      <Sidebar />
      <main className="flex-1 lg:ml-0 overflow-auto relative z-10 pt-24 lg:pt-0">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {children}
        </div>
      </main>
    </div>
  );
}
