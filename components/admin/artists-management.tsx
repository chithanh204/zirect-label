'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, Search, MoreVertical, Mail, X, ImageIcon, Copy, Check, Eye, EyeOff, KeyRound, RefreshCw, Loader2, Edit, ShieldAlert } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

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
  paypalAccount?: string;
  composerName?: string;
  isActive: boolean;
  isAdmin: boolean;
  joinedAt: string;
  createdAt: string;
  paymentVerificationStatus?: string;
  _count?: {
    albums: number;
  };
}

export function ArtistsManagement() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog controls
  const [isCreateOpen, setIsCreateOpen] = useState(searchParams.get('action') === 'add-artist');
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);

  const [adminFormData, setAdminFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

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

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: '',
    paypalAccount: '',
    composerName: '',
    isAdmin: false
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: '',
    paypalAccount: '',
    composerName: '',
    isActive: true,
    isAdmin: false
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

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = useCallback(async (file: File, isEdit: boolean = false) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Upload Error',
        description: 'Allowed formats: JPEG, PNG, WebP, GIF',
        variant: 'destructive',
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Upload Error',
        description: 'Max file size is 5MB',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const response = await apiClient.uploadImage(file, 'zirect/avatars');
      if (response && response.success && response.data) {
        if (isEdit) {
          setEditFormData(prev => ({ ...prev, avatar: response.data.url }));
        } else {
          setFormData(prev => ({ ...prev, avatar: response.data.url }));
        }
        toast({
          title: 'Success',
          description: 'Avatar uploaded successfully.',
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload avatar to storage.',
        variant: 'destructive',
      });
      setAvatarPreview(null);
    } finally {
      setIsUploading(false);
    }
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent, isEdit: boolean = false) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file, isEdit);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeAvatar = (isEdit: boolean = false) => {
    setAvatarPreview(null);
    if (isEdit) {
      setEditFormData(prev => ({ ...prev, avatar: '' }));
      if (editFileInputRef.current) {
        editFileInputRef.current.value = '';
      }
    } else {
      setFormData(prev => ({ ...prev, avatar: '' }));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

  const handleOpenEdit = (artist: Artist) => {
    setEditingArtist(artist);
    setEditFormData({
      name: artist.name,
      email: artist.email,
      bio: artist.bio || '',
      avatar: artist.avatar || '',
      paypalAccount: artist.paypalAccount || '',
      composerName: artist.composerName || '',
      isActive: artist.isActive,
      isAdmin: artist.isAdmin
    });
    setAvatarPreview(artist.avatar || null);
    setIsEditOpen(true);
    setOpenDropdownId(null);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
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
        paypalAccount: formData.paypalAccount,
        composerName: formData.composerName,
        isAdmin: formData.isAdmin,
      });

      if (response && (response as any).success) {
        const data = (response as any).data;
        setPasswordInfo({
          name: formData.name,
          email: formData.email,
          password: data.generatedPassword || '',
          action: 'created',
        });

        setFormData({ name: '', email: '', bio: '', avatar: '', paypalAccount: '', composerName: '', isAdmin: false });
        setAvatarPreview(null);
        setIsCreateOpen(false);
        setIsPasswordDialogOpen(true);
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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtist) return;

    // Toggle active state confirmation
    if (editFormData.isActive !== editingArtist.isActive) {
      const confirmMsg = editFormData.isActive 
        ? `Are you sure you want to reactivate ${editingArtist.name}? They will regain full dashboard access.`
        : `Are you sure you want to deactivate ${editingArtist.name}? They will be locked out and will not be able to manage their catalog or view stream stats.`;
      if (!confirm(confirmMsg)) {
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('authToken') || undefined;
      const res: any = await apiClient.updateArtistAdmin(editingArtist.id, editFormData, token);
      if (res && res.success) {
        toast({
          title: 'Profile Updated',
          description: 'Artist details synced successfully.',
        });
        setIsEditOpen(false);
        fetchArtists();
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update artist profile.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      if (!adminFormData.name || !adminFormData.email || !adminFormData.password) {
        setSubmitError('Name, Email, and Password are required');
        setIsSubmitting(false);
        return;
      }

      if (adminFormData.password.length < 6) {
        setSubmitError('Password must be at least 6 characters');
        setIsSubmitting(false);
        return;
      }

      const response = await apiClient.createArtist({
        name: adminFormData.name,
        email: adminFormData.email,
        password: adminFormData.password,
        isAdmin: true,
      }) as any;

      if (response && response.success) {
        toast({
          title: 'Success',
          description: 'Admin user account created successfully.',
        });
        setAdminFormData({ name: '', email: '', password: '' });
        setIsCreateAdminOpen(false);
        fetchArtists();
      } else {
        setSubmitError(response.message || 'Failed to create admin');
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create admin');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Create Artist Dialog */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-cyan-500/10 border border-cyan-500/25 hover:bg-cyan-500/20 text-cyan-400 font-semibold w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add New Artist
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-accent/20 text-foreground max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Add New Artist</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                {submitError && (
                  <div className="p-3 bg-red-500/20 border border-red-500 text-red-500 rounded-lg text-sm">
                    {submitError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold mb-1">Artist Name <span className="text-accent">*</span></label>
                    <input
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter artist name"
                      className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold mb-1">Email <span className="text-accent">*</span></label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold mb-1">PayPal Account</label>
                    <input
                      type="email"
                      name="paypalAccount"
                      value={formData.paypalAccount}
                      onChange={handleInputChange}
                      placeholder="paypal@example.com"
                      className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold mb-1">Composer Name</label>
                    <input
                      type="text"
                      name="composerName"
                      value={formData.composerName}
                      onChange={handleInputChange}
                      placeholder="Legal Name or Alias"
                      className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Enter artist bio (optional)"
                    rows={3}
                    className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Avatar Image</label>
                  {avatarPreview ? (
                    <div className="relative w-full">
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-accent/50">
                        <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                        {isUploading && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAvatar(false)}
                        className="absolute top-0 left-20 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        disabled={isUploading}
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onDrop={(e) => handleDrop(e, false)}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 ${isDragOver ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50 hover:bg-accent/5'}`}
                    >
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Click or drag & drop to upload JPEG/PNG</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file, false);
                    }}
                    disabled={isSubmitting || isUploading}
                  />
                </div>

                <p className="text-xs text-muted-foreground italic">
                  * An artist user account with an auto-generated password will be created in the database.
                </p>

                <DialogFooter className="pt-4 border-t border-accent/10">
                  <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>Cancel</Button>
                  <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting || isUploading}>
                    Create Profile
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Create Admin Dialog */}
          <Dialog open={isCreateAdminOpen} onOpenChange={setIsCreateAdminOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold w-full sm:w-auto neon-glow-sm">
                <Plus className="w-4 h-4 mr-2" />
                Add New Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-accent/20 text-foreground max-w-md shadow-2xl">
              <DialogHeader>
                <DialogTitle>Add New Admin Account</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateAdminSubmit} className="space-y-4">
                {submitError && (
                  <div className="p-3 bg-red-500/20 border border-red-500 text-red-500 rounded-lg text-sm">
                    {submitError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold mb-1">Admin Name <span className="text-accent">*</span></label>
                  <input
                    required
                    type="text"
                    value={adminFormData.name}
                    onChange={(e) => setAdminFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                    className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Email Address <span className="text-accent">*</span></label>
                  <input
                    required
                    type="email"
                    value={adminFormData.email}
                    onChange={(e) => setAdminFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="admin@example.com"
                    className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Password <span className="text-accent">*</span></label>
                  <input
                    required
                    type="password"
                    value={adminFormData.password}
                    onChange={(e) => setAdminFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    disabled={isSubmitting}
                  />
                </div>

                <p className="text-xs text-muted-foreground italic">
                  * This account will have administrative access to the platform and can log in directly.
                </p>

                <DialogFooter className="pt-4 border-t border-accent/10">
                  <Button type="button" variant="ghost" onClick={() => setIsCreateAdminOpen(false)} disabled={isSubmitting}>Cancel</Button>
                  <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>
                    Create Admin
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="glass border-accent/20 text-foreground max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Artist Profile</DialogTitle>
          </DialogHeader>
          {editingArtist && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold mb-1">Artist Name <span className="text-accent">*</span></label>
                  <input
                    required
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold mb-1">Email <span className="text-accent">*</span></label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold mb-1">PayPal Account</label>
                  <input
                    type="email"
                    name="paypalAccount"
                    value={editFormData.paypalAccount}
                    onChange={handleEditInputChange}
                    placeholder="paypal@example.com"
                    className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold mb-1">Composer Name</label>
                  <input
                    type="text"
                    name="composerName"
                    value={editFormData.composerName}
                    onChange={handleEditInputChange}
                    placeholder="Legal Name or Alias"
                    className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={editFormData.bio}
                  onChange={handleEditInputChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  disabled={isSubmitting}
                />
              </div>

              <div className="p-4 bg-accent/5 border border-accent/15 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Artist Account Status</p>
                    <p className="text-xs text-muted-foreground">Toggle to deactivate or activate this artist profile.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={editFormData.isActive}
                    onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                    className="w-5 h-5 rounded border-accent text-accent focus:ring-accent cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Avatar Image</label>
                {avatarPreview ? (
                  <div className="relative w-full">
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-accent/50">
                      <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAvatar(true)}
                      className="absolute top-0 left-20 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      disabled={isUploading}
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDrop={(e) => handleDrop(e, true)}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => editFileInputRef.current?.click()}
                    className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 ${isDragOver ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50 hover:bg-accent/5'}`}
                  >
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Click or drag & drop to upload JPEG/PNG</p>
                  </div>
                )}
                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file, true);
                  }}
                  disabled={isSubmitting || isUploading}
                />
              </div>

              <DialogFooter className="pt-4 border-t border-accent/10">
                <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Save Settings
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Password Dialog (shared between create & reset) */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="glass border-accent/20 text-foreground max-w-md shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                {passwordInfo?.action === 'reset' ? <KeyRound className="w-4 h-4 text-green-500" /> : <Check className="w-4 h-4 text-green-500" />}
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
                  <p className="text-xs text-muted-foreground">{passwordInfo.action === 'reset' ? 'New Password' : 'Generated Password'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 px-3 py-2 bg-card border border-border rounded-lg text-sm font-mono">
                      {showPassword ? passwordInfo.password : '••••••••••••••••'}
                    </code>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 rounded-lg hover:bg-accent/10 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="p-2 rounded-lg hover:bg-accent/10 transition-colors"
                    >
                      {passwordCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-400">
                ⚠️ Save this password and share it with the artist immediately.
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
      <Card className="glass overflow-hidden shadow-xl border-accent/15">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-accent/10 bg-accent/5">
                <th className="px-6 py-4 text-sm font-bold">Artist Profile</th>
                <th className="px-6 py-4 text-sm font-bold">Status</th>
                <th className="px-6 py-4 text-sm font-bold">PayPal Account</th>
                <th className="px-6 py-4 text-sm font-bold">Composer Name</th>
                <th className="px-6 py-4 text-sm font-bold">Joined Date</th>
                <th className="px-6 py-4 text-right text-sm font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-accent" />
                    <p className="text-sm text-muted-foreground mt-2">Loading database artists...</p>
                  </td>
                </tr>
              ) : fetchError ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-destructive">
                    {fetchError}
                  </td>
                </tr>
              ) : filteredArtists.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    No artists registered.
                  </td>
                </tr>
              ) : (
                filteredArtists.map((artist, idx) => (
                  <tr
                    key={artist.id}
                    className={`border-b border-accent/5 hover:bg-accent/5 transition-colors ${!artist.isActive ? 'opacity-60 bg-red-950/5' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {artist.avatar ? (
                          <img src={artist.avatar} alt={artist.name} className="w-9 h-9 rounded-full object-cover border border-accent/20" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                            {artist.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-bold flex items-center gap-1.5 text-foreground">
                            {artist.name}
                            {artist.isAdmin && (
                              <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.2 rounded bg-accent/20 border border-accent/30 text-accent">Admin</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {artist.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${artist.isActive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {artist.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                      {artist.paypalAccount || <span className="text-xs text-muted-foreground/40 italic">Not Specified</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {artist.composerName || <span className="text-xs text-muted-foreground/40 italic">Not Specified</span>}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(artist.joinedAt || artist.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === artist.id ? null : artist.id);
                          }}
                          className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-accent/10 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </button>

                        {/* Dropdown Menu */}
                        {openDropdownId === artist.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-accent/15 rounded-lg shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEdit(artist);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
                            >
                              <Edit className="w-4 h-4 text-accent" />
                              Edit Profile
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleResetPassword(artist);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors border-t border-accent/5"
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
    </div>
  );
}
