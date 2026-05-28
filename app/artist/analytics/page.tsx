import { ArtistSidebar } from '@/components/artist/sidebar';
import { AnalyticsView } from '@/components/artist/analytics-view';

export default function ArtistAnalyticsPage() {
  return (
    <div className="flex h-screen art-bg-artist">
      <div className="fixed inset-0 bg-[rgba(2,8,23,0.82)] pointer-events-none z-0" />
      <ArtistSidebar />
      
      <main className="flex-1 md:ml-64 overflow-auto relative z-10">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold tracking-tighter"><span className="gradient-text-cyan">Analytics</span></h1>
              <p className="text-muted-foreground mt-2">Detailed insights into your streaming performance and revenue.</p>
            </div>

            {/* Content */}
            <AnalyticsView />
          </div>
        </div>
      </main>
    </div>
  );
}
