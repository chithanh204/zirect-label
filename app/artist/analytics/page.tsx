import { ArtistSidebar } from '@/components/artist/sidebar';
import { AnalyticsView } from '@/components/artist/analytics-view';

export default function ArtistAnalyticsPage() {
  return (
    <div className="flex h-screen bg-background">
      <ArtistSidebar />
      
      <main className="flex-1 md:ml-64 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold tracking-tighter">Analytics</h1>
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
