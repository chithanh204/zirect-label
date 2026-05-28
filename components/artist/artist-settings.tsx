'use client';

import { useState, useEffect } from 'react';
import { Loader2, Mail, User, Lock, DollarSign, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function ArtistSettings() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    paypalAccount: '',
    website: '',
    bio: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getMyArtistProfile() as any;
      if (res?.success) {
        const data = res.data;
        setProfile(data);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          paypalAccount: data.paypalAccount || '',
          website: data.website || '',
          bio: data.bio || '',
        });
      }
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await apiClient.updateArtistProfile({
        name: formData.name,
        email: formData.email,
        website: formData.website,
        bio: formData.bio,
        bankAccount: formData.paypalAccount,
      }) as any;

      if (res?.success) {
        toast({
          title: 'Success',
          description: 'Your profile has been updated',
        });
        setProfile(res.data);
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to save changes',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 glass-card p-4 rounded-lg border border-red-500/20">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Basic Information */}
      <Card className="glass-card p-6">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-accent" />
          Basic Information
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-accent transition-colors"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-accent transition-colors"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-accent transition-colors"
              placeholder="https://yoursite.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-accent transition-colors resize-none h-24"
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>
      </Card>

      {/* Payment Information */}
      <Card className="glass-card p-6">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-accent" />
          Payment Information
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">
              PayPal Account
            </label>
            <input
              type="email"
              value={formData.paypalAccount}
              onChange={(e) => handleInputChange('paypalAccount', e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-accent transition-colors"
              placeholder="your@paypal.com"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Use this email for receiving payments from your music sales.
            </p>
          </div>

          {profile?.paymentVerificationStatus && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Status:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${profile.paymentVerificationStatus === 'verified'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                }`}>
                {profile.paymentVerificationStatus}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex gap-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-accent hover:bg-accent/90 text-black font-bold px-6"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
