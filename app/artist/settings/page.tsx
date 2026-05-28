import { ArtistSidebar } from '@/components/artist/sidebar';
import { SettingsView } from '@/components/artist/settings-view';

export default function ArtistSettingsPage() {
  return (
    <div className="flex h-screen art-bg-artist">
      <div className="fixed inset-0 bg-[rgba(2,8,23,0.82)] pointer-events-none z-0" />
      <ArtistSidebar />
      
      <main className="flex-1 md:ml-64 overflow-auto relative z-10">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold tracking-tighter"><span className="gradient-text-cyan">Settings</span></h1>
              <p className="text-muted-foreground mt-2">Manage your profile, payment information, and account settings.</p>
            </div>

            {/* Content */}
            <SettingsView />
          </div>
        </div>
      </main>
    </div>
  );
}
