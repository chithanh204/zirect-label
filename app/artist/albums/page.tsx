import { ArtistSidebar } from '@/components/artist/sidebar';
import { AlbumsView } from '@/components/artist/albums-view';

export default function ArtistAlbumsPage() {
  return (
    <div className="flex h-screen bg-background">
      <ArtistSidebar />
      
      <main className="flex-1 md:ml-64 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-8 max-w-7xl">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold tracking-tighter">My Albums</h1>
              <p className="text-muted-foreground mt-2">Manage and track all your released albums.</p>
            </div>

            {/* Content */}
            <AlbumsView />
          </div>
        </div>
      </main>
    </div>
  );
}
