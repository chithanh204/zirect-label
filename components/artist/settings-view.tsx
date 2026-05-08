'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, Mail, Phone, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export function SettingsView() {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profile, setProfile] = useState<any>(null);
  
  // Profile Form
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');

  // Payment Form
  const [paymentMethod, setPaymentMethod] = useState('');
  const [currency, setCurrency] = useState('');
  const [bankAccount, setBankAccount] = useState('');

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getMyArtistProfile() as any;
      if (res?.success) {
        setProfile(res.data);
        setBio(res.data.bio || '');
        setWebsite(res.data.website || '');
        setPaymentMethod(res.data.paymentMethod || 'Bank Transfer');
        setCurrency(res.data.currency || 'USD');
        setBankAccount(res.data.bankAccount || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      const res = await apiClient.updateArtistProfile({ bio, website }) as any;
      if (res?.success) {
        alert('Profile updated successfully');
        loadProfile();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePayment = async () => {
    try {
      setSavingPayment(true);
      const res = await apiClient.updateArtistProfile({ paymentMethod, currency, bankAccount }) as any;
      if (res?.success) {
        alert('Payment info updated successfully. Please wait for admin verification.');
        loadProfile();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to update payment info');
    } finally {
      setSavingPayment(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      return alert('New passwords do not match');
    }
    if (newPassword.length < 6) {
      return alert('Password must be at least 6 characters');
    }
    try {
      setSavingPassword(true);
      const res = await apiClient.updatePassword({ currentPassword, newPassword }) as any;
      if (res?.success) {
        alert('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        alert(res?.message || 'Failed to update password');
      }
    } catch (e: any) {
      alert(e.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Section */}
      <Card className="bg-card border-border p-6">
        <h2 className="text-xl font-bold mb-6">Profile Information</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Artist Name</label>
              <Input value={profile?.name || ''} readOnly className="bg-muted cursor-not-allowed" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Email Address</label>
              <Input type="email" value={profile?.email || ''} readOnly className="bg-muted cursor-not-allowed" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Bio</label>
            <Textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell your story..."
              className="bg-background min-h-24 resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Website / Social Links</label>
            <Input 
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourwebsite.com" 
              className="bg-background" 
            />
          </div>

          <Button onClick={handleSaveProfile} disabled={savingProfile} className="bg-accent text-accent-foreground hover:bg-accent/90 w-full">
            {savingProfile ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>

      {/* Bank & Payment Info */}
      <Card className="bg-card border-border p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Payment Information</h2>
          {profile?.paymentVerificationStatus === 'verified' && (
            <div className="flex items-center gap-1.5 text-green-500 bg-green-500/10 px-3 py-1 rounded-full text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" /> Verified
            </div>
          )}
          {profile?.paymentVerificationStatus === 'pending' && (
            <div className="flex items-center gap-1.5 text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full text-sm font-medium">
              <Clock className="w-4 h-4" /> Pending Verification
            </div>
          )}
          {(!profile?.paymentVerificationStatus || profile?.paymentVerificationStatus === 'unverified') && (
            <div className="flex items-center gap-1.5 text-red-500 bg-red-500/10 px-3 py-1 rounded-full text-sm font-medium">
              <XCircle className="w-4 h-4" /> Unverified
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Payment Method</label>
              <select 
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="PayPal">PayPal</option>
                <option value="Stripe">Stripe</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Currency</label>
              <select 
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="VND">VND - Vietnamese Dong</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Account Number / Email</label>
            <Input 
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              placeholder="Your bank account number or PayPal email" 
              className="bg-background" 
            />
          </div>

          <Button onClick={handleSavePayment} disabled={savingPayment} className="bg-accent text-accent-foreground hover:bg-accent/90 w-full">
            {savingPayment ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {savingPayment ? 'Saving...' : 'Save Payment Info'}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Note: Updating your payment info will require admin verification before you can receive payouts.
          </p>
        </div>
      </Card>

      {/* Account Settings */}
      <Card className="bg-card border-border p-6">
        <h2 className="text-xl font-bold mb-6">Account Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Current Password</label>
            <Input 
              type="password" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••" 
              className="bg-background" 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">New Password</label>
              <Input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••" 
                className="bg-background" 
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Confirm Password</label>
              <Input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••" 
                className="bg-background" 
              />
            </div>
          </div>

          <Button onClick={handleUpdatePassword} disabled={savingPassword || !currentPassword || !newPassword} className="bg-accent text-accent-foreground hover:bg-accent/90 w-full">
            {savingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {savingPassword ? 'Updating...' : 'Update Password'}
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
