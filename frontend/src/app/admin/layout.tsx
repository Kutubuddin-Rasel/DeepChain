import { Sidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 md:pl-64">
        {/* We add pl-64 to offset the fixed 64 (16rem) sidebar on desktop */}
        {children}
      </div>
    </div>
  );
}
