import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminDashboardOverview } from '@/components/admin/dashboard-overview';

export default function AdminDashboard() {
  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      
      <main className="flex-1 md:ml-64 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-8 max-w-7xl">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold tracking-tighter">Admin Dashboard</h1>
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
