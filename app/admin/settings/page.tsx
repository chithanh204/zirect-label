import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminSettingsView } from '@/components/admin/settings-view';

export default function AdminSettingsPage() {
  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      
      <main className="flex-1 md:ml-64 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold tracking-tighter">Settings</h1>
              <p className="text-muted-foreground mt-2">Manage label information, integrations, and system configuration.</p>
            </div>

            {/* Content */}
            <AdminSettingsView />
          </div>
        </div>
      </main>
    </div>
  );
}
