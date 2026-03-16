import { AdminGuard } from "@/components/admin/AdminGuard";
import { Sidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1 md:pl-[220px]">
          {/* Offset for the fixed sidebar on desktop */}
          {children}
        </div>
      </div>
    </AdminGuard>
  );
}
