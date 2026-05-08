'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, MoreVertical, Mail, X, ImageIcon, Copy, Check, Eye, EyeOff, KeyRound, RefreshCw, Loader2 } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';

interface Artist {
  id: string;
  userId: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  followers: number;
  totalStreams: number;
  totalRevenue: number;
  status: string;
  joinedAt: string;
  createdAt: string;
  paymentVerificationStatus?: string;
  _count?: {
    albums: number;
  };
}

export function ArtistsManagement() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(searchParams.get('action') === 'add-artist');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real data state
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Actions dropdown state
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Password dialog state (shared between create & reset)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordInfo, setPasswordInfo] = useState<{
    name: string;
    email: string;
    password: string;
    action: 'created' | 'reset';
  } | null>(null);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: ''
  });

  // Fetch artists from API
  const fetchArtists = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const response = await apiClient.getAllArtists() as any;
      if (response && response.success && response.data) {
        setArtists(response.data.artists || []);
      } else {
        setFetchError('Failed to load artists');
      }
    } catch (error) {
      setFetchError(error instanceof Error ? error.message : 'Failed to load artists');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    if (openDropdownId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdownId]);

  const filteredArtists = artists.filter(artist =>
    artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = useCallback(async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setSubmitError('Invalid file type. Allowed: JPEG, PNG, WebP, GIF');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError('File too large. Maximum size: 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    setSubmitError(null);
    try {
      const response = await apiClient.uploadImage(file, 'zirect/avatars');
      if (response && response.success && response.data) {
        setFormData(prev => ({ ...prev, avatar: response.data.url }));
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to upload avatar');
      setAvatarPreview(null);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleVerifyPayment = async (artistId: string) => {
    try {
      const res = await apiClient.verifyPaymentInfo(artistId) as any;
      if (res?.success) {
        alert('Payment info verified successfully');
        fetchArtists();
      } else {
        alert(res?.message || 'Failed to verify payment info');
      }
    } catch (error) {
      alert('Error verifying payment info');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeAvatar = () => {
    setAvatarPreview(null);
    setFormData(prev => ({ ...prev, avatar: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopyPassword = async () => {
    if (passwordInfo?.password) {
      await navigator.clipboard.writeText(passwordInfo.password);
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 2000);
    }
  };

  const handleResetPassword = async (artist: Artist) => {
    setOpenDropdownId(null);
    setIsResettingPassword(artist.id);
    try {
      const response = await apiClient.resetArtistPassword(artist.id) as any;
      if (response && response.success && response.data) {
        setPasswordInfo({
          name: artist.name,
          email: artist.email,
          password: response.data.newPassword,
          action: 'reset',
        });
        setIsPasswordDialogOpen(true);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to reset password');
    } finally {
      setIsResettingPassword(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      if (!formData.name || !formData.email) {
        setSubmitError('Name and Email are required');
        setIsSubmitting(false);
        return;
      }

      const response = await apiClient.createArtist({
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
        avatar: formData.avatar,
      });

      if (response && (response as any).success) {
        const data = (response as any).data;
        setPasswordInfo({
          name: formData.name,
          email: formData.email,
          password: data.generatedPassword || '',
          action: 'created',
        });

        setFormData({ name: '', email: '', bio: '', avatar: '' });
        setAvatarPreview(null);
        setIsDialogOpen(false);
        setIsPasswordDialogOpen(true);

        // Refresh the artists list
        fetchArtists();
      } else {
        setSubmitError((response as any).message || 'Failed to create artist');
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create artist');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stats from real data
  const totalArtists = artists.length;
  const activeArtists = artists.filter(a => a.status === 'active').length;
  const totalStreams = artists.reduce((sum, a) => sum + a.totalStreams, 0);

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search artists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add New Artist
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Artist</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && (
                <div className="p-3 bg-red-500/20 border border-red-500 text-red-500 rounded-lg text-sm">
                  {submitError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Artist Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter artist name"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Enter artist bio (optional)"
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Avatar
                </label>
                {avatarPreview ? (
                  <div className="relative w-full">
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-accent/50">
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="absolute top-0 left-20 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      disabled={isUploading}
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                    {formData.avatar && !isUploading && (
                      <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Uploaded successfully
                      </p>
                    )}
                  </div>
                ) : (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200
                      ${isDragOver
                        ? 'border-accent bg-accent/10'
                        : 'border-border hover:border-accent/50 hover:bg-accent/5'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDragOver ? 'bg-accent/20' : 'bg-background'}`}>
                      <ImageIcon className={`w-5 h-5 ${isDragOver ? 'text-accent' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        <span className="text-accent font-medium">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPEG, PNG, WebP, GIF (max 5MB)
                      </p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  disabled={isSubmitting || isUploading}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                A user account with a random password will be auto-generated for this artist.
              </p>

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                  disabled={isSubmitting || isUploading}
                >
                  {isSubmitting ? 'Creating...' : 'Create Artist'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Password Dialog (shared between create & reset) */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                {passwordInfo?.action === 'reset'
                  ? <KeyRound className="w-4 h-4 text-green-500" />
                  : <Check className="w-4 h-4 text-green-500" />
                }
              </div>
              {passwordInfo?.action === 'reset' ? 'Password Reset Successfully' : 'Artist Created Successfully'}
            </DialogTitle>
          </DialogHeader>
          {passwordInfo && (
            <div className="space-y-4">
              <div className="p-4 bg-background rounded-lg space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Artist Name</p>
                  <p className="text-sm font-medium">{passwordInfo.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{passwordInfo.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {passwordInfo.action === 'reset' ? 'New Password' : 'Generated Password'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 px-3 py-2 bg-card border border-border rounded-lg text-sm font-mono">
                      {showPassword ? passwordInfo.password : '••••••••••••••••'}
                    </code>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 rounded-lg hover:bg-accent/10 transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword
                        ? <EyeOff className="w-4 h-4 text-muted-foreground" />
                        : <Eye className="w-4 h-4 text-muted-foreground" />
                      }
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="p-2 rounded-lg hover:bg-accent/10 transition-colors"
                      title="Copy password"
                    >
                      {passwordCopied
                        ? <Check className="w-4 h-4 text-green-500" />
                        : <Copy className="w-4 h-4 text-muted-foreground" />
                      }
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p className="text-xs text-amber-400">
                  ⚠️ Please save this password and share it with the artist. It will not be shown again.
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setIsPasswordDialogOpen(false);
                    setPasswordInfo(null);
                    setShowPassword(false);
                    setPasswordCopied(false);
                  }}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Artists Table */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th className="px-6 py-4 text-left text-sm font-bold">Artist Name</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Payment</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Total Streams</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Joined</th>
                <th className="px-6 py-4 text-right text-sm font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">Loading artists...</p>
                  </td>
                </tr>
              ) : fetchError ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-sm text-red-500">{fetchError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchArtists}
                      className="mt-2"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" /> Retry
                    </Button>
                  </td>
                </tr>
              ) : filteredArtists.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    {searchTerm ? 'No artists match your search' : 'No artists found'}
                  </td>
                </tr>
              ) : (
                filteredArtists.map((artist, idx) => (
                  <tr
                    key={artist.id}
                    className={`border-b border-border hover:bg-accent/5 transition-colors ${idx === filteredArtists.length - 1 ? 'border-0' : ''
                      }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {artist.avatar ? (
                          <img
                            src={artist.avatar}
                            alt={artist.name}
                            className="w-9 h-9 rounded-full object-cover border border-border"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                            {artist.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-bold">{artist.name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {artist.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${artist.status === 'active'
                        ? 'bg-green-500/20 text-green-500'
                        : artist.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : 'bg-red-500/20 text-red-500'
                        }`}>
                        {artist.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {artist.paymentVerificationStatus === 'verified' ? (
                        <span className="text-green-500 font-medium flex items-center gap-1"><Check className="w-4 h-4" /> Verified</span>
                      ) : artist.paymentVerificationStatus === 'pending' ? (
                        <Button variant="outline" size="sm" className="h-7 text-xs border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10" onClick={() => handleVerifyPayment(artist.id)}>
                          Verify Now
                        </Button>
                      ) : (
                        <span className="text-red-500 font-medium flex items-center gap-1"><X className="w-4 h-4" /> Unverified</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-accent font-bold">
                      {artist.totalStreams >= 1000000
                        ? `${(artist.totalStreams / 1000000).toFixed(1)}M`
                        : artist.totalStreams >= 1000
                          ? `${(artist.totalStreams / 1000).toFixed(1)}K`
                          : artist.totalStreams}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(artist.joinedAt || artist.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === artist.id ? null : artist.id);
                          }}
                          className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-background transition-colors"
                        >
                          {isResettingPassword === artist.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          ) : (
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>

                        {/* Dropdown Menu */}
                        {openDropdownId === artist.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-xl z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleResetPassword(artist);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent/10 transition-colors"
                            >
                              <KeyRound className="w-4 h-4 text-amber-500" />
                              Reset Password
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Artists</p>
          <p className="text-2xl font-bold">{loading ? '—' : totalArtists}</p>
        </Card>
        <Card className="bg-card border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Active Artists</p>
          <p className="text-2xl font-bold text-green-500">{loading ? '—' : activeArtists}</p>
        </Card>
        <Card className="bg-card border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Streams (All)</p>
          <p className="text-2xl font-bold text-accent">
            {loading ? '—' : totalStreams >= 1000000
              ? `${(totalStreams / 1000000).toFixed(2)}M`
              : totalStreams >= 1000
                ? `${(totalStreams / 1000).toFixed(1)}K`
                : totalStreams}
          </p>
        </Card>
      </div>
    </div>
  );
}
