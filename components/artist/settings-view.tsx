'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, Mail, Phone, MapPin } from 'lucide-react';
import { useState } from 'react';

export function SettingsView() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Section */}
      <Card className="bg-card border-border p-6">
        <h2 className="text-xl font-bold mb-6">Profile Information</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Artist Name</label>
              <Input defaultValue="Luna Echo" className="bg-background" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Email Address</label>
              <Input type="email" defaultValue="luna@example.com" className="bg-background" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Phone Number</label>
              <Input type="tel" placeholder="+1 (555) 000-0000" className="bg-background" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Country</label>
              <Input placeholder="Vietnam" className="bg-background" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Bio</label>
            <Textarea 
              defaultValue="Independent music producer from Ho Chi Minh City, Vietnam. Creating electronic and ambient music."
              className="bg-background min-h-24 resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Website / Social Links</label>
            <Input placeholder="https://yourwebsite.com" className="bg-background" />
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="bg-accent text-accent-foreground hover:bg-accent/90 w-full">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>

      {/* Bank & Payment Info */}
      <Card className="bg-card border-border p-6">
        <h2 className="text-xl font-bold mb-6">Payment Information</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Payment Method</label>
              <select className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                <option>Bank Transfer</option>
                <option>PayPal</option>
                <option>Stripe</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Currency</label>
              <select className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                <option>USD - US Dollar</option>
                <option>EUR - Euro</option>
                <option>VND - Vietnamese Dong</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Bank Account Number</label>
            <Input type="password" placeholder="••••••••••••••••" className="bg-background" />
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="bg-accent text-accent-foreground hover:bg-accent/90 w-full">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Payment Info'}
          </Button>
        </div>
      </Card>

      {/* Account Settings */}
      <Card className="bg-card border-border p-6">
        <h2 className="text-xl font-bold mb-6">Account Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Current Password</label>
            <Input type="password" placeholder="••••••••" className="bg-background" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">New Password</label>
              <Input type="password" placeholder="••••••••" className="bg-background" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Confirm Password</label>
              <Input type="password" placeholder="••••••••" className="bg-background" />
            </div>
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="bg-accent text-accent-foreground hover:bg-accent/90 w-full">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </Card>

      {/* Contact Admin */}
      <Card className="bg-card border-border p-6">
        <h2 className="text-xl font-bold mb-6">Support & Contact</h2>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-accent" />
            <div>
              <p className="text-sm text-muted-foreground">Email Support</p>
              <a href="mailto:support@zirect.com" className="font-medium text-accent hover:underline">support@zirect.com</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-accent" />
            <div>
              <p className="text-sm text-muted-foreground">Phone Support</p>
              <a href="tel:+84123456789" className="font-medium text-accent hover:underline">+84 (123) 456-789</a>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
