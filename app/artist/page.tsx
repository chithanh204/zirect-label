import { ArtistSidebar } from '@/components/artist/sidebar';
import { DashboardOverview } from '@/components/artist/dashboard-overview';

export default function ArtistDashboard() {
  return (
    <div className="flex h-screen bg-background">
      <ArtistSidebar />
      
      <main className="flex-1 md:ml-64 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-8 max-w-7xl">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold tracking-tighter">Dashboard</h1>
              <p className="text-muted-foreground mt-2">Welcome back! Here&apos;s your music performance overview.</p>
            </div>

            {/* Content */}
            <DashboardOverview />
          </div>
        </div>
      </main>
    </div>
  );
}
