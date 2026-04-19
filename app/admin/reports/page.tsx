import { AdminSidebar } from '@/components/admin/sidebar';
import { ProcessTracker } from '@/components/admin/process-tracker';

export default function AdminReportsPage() {
  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      
      <main className="flex-1 md:ml-64 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-8 max-w-7xl">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold tracking-tighter">Album Processing Tracker</h1>
              <p className="text-muted-foreground mt-2">Monitor the processing status of each album submission.</p>
            </div>

            {/* Content */}
            <ProcessTracker />
          </div>
        </div>
      </main>
    </div>
  );
}
