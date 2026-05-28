'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';
import { useState } from 'react';

export function AdminSettingsView() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Label Information */}
      <Card className="glass-card p-6">
        <h2 className="text-xl font-bold mb-6">Label Information</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Label Name</label>
              <Input defaultValue="Zirect Label" className="bg-background" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Founded Year</label>
              <Input defaultValue="2023" className="bg-background" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input defaultValue="hello@zirect.com" className="bg-background" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Phone</label>
              <Input defaultValue="+84 (123) 456-789" className="bg-background" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">About Label</label>
            <Textarea 
              defaultValue="Zirect Label is a forward-thinking music distribution and artist management platform..."
              className="bg-background min-h-24 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Website</label>
              <Input defaultValue="https://zirect.com" className="bg-background" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Country</label>
              <Input defaultValue="Vietnam" className="bg-background" />
            </div>
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="bg-accent text-accent-foreground hover:bg-accent/90 w-full">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Label Info'}
          </Button>
        </div>
      </Card>

      {/* Platform Settings */}
      <Card className="glass-card p-6">
        <h2 className="text-xl font-bold mb-6">Spotify Integration</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Spotify Label ID</label>
            <Input defaultValue="zirect-label-2024" className="bg-background" />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Spotify API Key</label>
            <Input type="password" placeholder="••••••••••••••••" className="bg-background" />
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="bg-accent text-accent-foreground hover:bg-accent/90 w-full">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Update Integration'}
          </Button>
        </div>
      </Card>

      {/* Commission Settings */}
      <Card className="glass-card p-6">
        <h2 className="text-xl font-bold mb-6">Commission Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Label Commission Rate (%)</label>
            <Input type="number" defaultValue="20" min="0" max="100" className="bg-background" />
            <p className="text-xs text-muted-foreground mt-1">Percentage of revenue kept by the label</p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Artist Payout Rate (%)</label>
            <Input type="number" defaultValue="80" min="0" max="100" className="bg-background" disabled />
            <p className="text-xs text-muted-foreground mt-1">Automatically calculated (100% - commission)</p>
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="bg-accent text-accent-foreground hover:bg-accent/90 w-full">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </Card>

      {/* System Settings */}
      <Card className="glass-card p-6">
        <h2 className="text-xl font-bold mb-6">System Settings</h2>
        
        <div className="space-y-4">
          <label className="flex items-center gap-3 p-3 bg-background rounded-lg cursor-pointer hover:border-accent/40 border border-border">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm font-medium">Allow automatic distribution</span>
          </label>

          <label className="flex items-center gap-3 p-3 bg-background rounded-lg cursor-pointer hover:border-accent/40 border border-border">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm font-medium">Require cover art approval</span>
          </label>

          <label className="flex items-center gap-3 p-3 bg-background rounded-lg cursor-pointer hover:border-accent/40 border border-border">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm font-medium">Enable artist onboarding form</span>
          </label>

          <Button onClick={handleSave} disabled={isSaving} className="bg-accent text-accent-foreground hover:bg-accent/90 w-full">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
