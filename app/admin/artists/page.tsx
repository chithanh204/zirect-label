import { AdminSidebar } from '@/components/admin/sidebar';
import { ArtistsManagement } from '@/components/admin/artists-management';
import { Suspense } from 'react';

export default function AdminArtistsPage() {
  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      
      <main className="flex-1 md:ml-64 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-8 max-w-7xl">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold tracking-tighter">Artists Management</h1>
              <p className="text-muted-foreground mt-2">Manage all your label artists and their information.</p>
            </div>

            {/* Content */}
            <Suspense fallback={<div>Loading...</div>}>
              <ArtistsManagement />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
