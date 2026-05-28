import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminSettingsView } from '@/components/admin/settings-view';

export default function AdminSettingsPage() {
  return (
    <div className="flex h-screen art-bg-admin">
      <div className="fixed inset-0 bg-[rgba(2,8,23,0.82)] pointer-events-none z-0" />
      <AdminSidebar />
      
      <main className="flex-1 md:ml-64 overflow-auto relative z-10">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold tracking-tighter"><span className="gradient-text-cyan">Settings</span></h1>
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
