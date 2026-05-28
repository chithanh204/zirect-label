import { ArtistSidebar } from '@/components/artist/sidebar';
import { AlbumsView } from '@/components/artist/albums-view';

export default function ArtistAlbumsPage() {
  return (
    <div className="flex h-screen art-bg-artist">
      <div className="fixed inset-0 bg-[rgba(2,8,23,0.82)] pointer-events-none z-0" />
      <ArtistSidebar />
      
      <main className="flex-1 md:ml-64 overflow-auto relative z-10">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-8 max-w-7xl">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold tracking-tighter">My <span className="gradient-text-cyan">Albums</span></h1>
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
