import { AdminSidebar } from '@/components/admin/sidebar';
import { AlbumsManagement } from '@/components/admin/albums-management';

export default function AdminAlbumsPage() {
  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      
      <main className="flex-1 md:ml-64 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-8 max-w-7xl">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold tracking-tighter">Albums Management</h1>
              <p className="text-muted-foreground mt-2">Track and manage all album submissions and their distribution status.</p>
            </div>

            {/* Content */}
            <AlbumsManagement />
          </div>
        </div>
      </main>
    </div>
  );
}
