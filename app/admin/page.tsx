import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminDashboardOverview } from '@/components/admin/dashboard-overview';

export default function AdminDashboard() {
  return (
    <div className="flex h-screen art-bg-admin">
      {/* Dark overlay for readability */}
      <div className="fixed inset-0 bg-[rgba(2,8,23,0.82)] pointer-events-none z-0" />
      
      <AdminSidebar />
      
      <main className="flex-1 md:ml-64 overflow-auto relative z-10">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-8 max-w-7xl">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold tracking-tighter">Admin <span className="gradient-text-cyan">Dashboard</span></h1>
              <p className="text-muted-foreground mt-2">Overview of all artists, albums, and platform performance.</p>
            </div>

            {/* Content */}
            <AdminDashboardOverview />
          </div>
        </div>
      </main>
    </div>
  );
}
