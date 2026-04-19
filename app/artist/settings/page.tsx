import { ArtistSidebar } from '@/components/artist/sidebar';
import { SettingsView } from '@/components/artist/settings-view';

export default function ArtistSettingsPage() {
  return (
    <div className="flex h-screen bg-background">
      <ArtistSidebar />
      
      <main className="flex-1 md:ml-64 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold tracking-tighter">Settings</h1>
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
