import { AdminSidebar } from '@/components/admin/sidebar';
import { ArtistsManagement } from '@/components/admin/artists-management';
import { Suspense } from 'react';

export default function AdminArtistsPage() {
  return (
    <div className="flex h-screen art-bg-admin">
      <div className="fixed inset-0 bg-[rgba(2,8,23,0.82)] pointer-events-none z-0" />
      <AdminSidebar />
      
      <main className="flex-1 md:ml-64 overflow-auto relative z-10">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-8 max-w-7xl">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold tracking-tighter">Artists <span className="gradient-text-cyan">Management</span></h1>
              <p className="text-muted-foreground mt-2">Manage all your label artists and their information.</p>
            </div>

            {/* Content */}
            <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
              <ArtistsManagement />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
