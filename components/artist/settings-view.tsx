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
  const [paypalAccount, setPaypalAccount] = useState('');

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
        setPaypalAccount(res.data.paypalAccount || '');
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
    if (!paypalAccount) {
      alert('Please enter your PayPal account email address.');
      return;
    }
    try {
      setSavingPayment(true);
      const res = await apiClient.updateMyPayPal(paypalAccount) as any;
      if (res?.success) {
        alert('PayPal email linked successfully! Pending admin approval.');
        loadProfile();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to update PayPal account.');
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
      <Card className="glass-card p-6">
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
      <Card className="glass-card p-6 border border-accent/15 relative overflow-hidden bg-[rgba(8,20,45,0.25)]">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold">PayPal Payment Information</h2>
            <p className="text-xs text-muted-foreground mt-1">Provide your PayPal account email to receive your royalty payouts from Zirect Label.</p>
          </div>
          {profile?.paymentVerificationStatus === 'verified' && (
            <div className="flex items-center gap-1.5 text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-auto">
              <CheckCircle2 className="w-4 h-4" /> Verified
            </div>
          )}
          {profile?.paymentVerificationStatus === 'pending' && (
            <div className="flex items-center gap-1.5 text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-auto">
              <Clock className="w-4 h-4" /> Pending Approval
            </div>
          )}
          {(!profile?.paymentVerificationStatus || profile?.paymentVerificationStatus === 'unverified') && (
            <div className="flex items-center gap-1.5 text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-auto">
              <XCircle className="w-4 h-4" /> Unlinked
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">PayPal Account (Email) <span className="text-accent">*</span></label>
            <Input 
              type="email"
              value={paypalAccount}
              onChange={(e) => setPaypalAccount(e.target.value)}
              placeholder="artist@paypal.com" 
              className="bg-background border-accent/15 focus:border-accent/40" 
            />
          </div>

          <Button onClick={handleSavePayment} disabled={savingPayment} className="bg-accent text-accent-foreground hover:bg-accent/90 w-full neon-glow-sm">
            {savingPayment ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {savingPayment ? 'Saving...' : 'Save PayPal Account'}
          </Button>
          <p className="text-[11px] text-muted-foreground text-center">
            * Note: Updating your PayPal email will reset your account status to <strong>Pending Approval</strong>. The admin will verify your details before processing payouts.
          </p>
        </div>
      </Card>

      {/* Account Settings */}
      <Card className="glass-card p-6">
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
      <Card className="glass-card p-6">
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
