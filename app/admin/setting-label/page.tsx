'use client';

import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/admin/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api';
import { Music, Plus, Edit2, Trash2, ArrowUp, ArrowDown, ExternalLink, Upload, Loader2, ShieldAlert, KeyRound } from 'lucide-react';

interface FeaturedRelease {
  id: string;
  trackName: string;
  artistNames: string;
  spotifyLink?: string;
  youtubeLink?: string;
  coverArt?: string;
  order: number;
}

export default function SettingLabelPage() {
  const { toast } = useToast();
  
  // Home Page branding states
  const [logoUrl, setLogoUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Featured Releases states
  const [releases, setReleases] = useState<FeaturedRelease[]>([]);
  const [loadingReleases, setLoadingReleases] = useState(true);
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState<FeaturedRelease | null>(null);
  const [trackName, setTrackName] = useState('');
  const [artistNames, setArtistNames] = useState('');
  const [spotifyLink, setSpotifyLink] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [coverArt, setCoverArt] = useState('');
  const [savingRelease, setSavingRelease] = useState(false);

  // Upload states
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    // Load home page configuration
    apiClient.getHomePageConfig()
      .then((res: any) => {
        if (res && res.success && res.data) {
          setLogoUrl(res.data.logoUrl || '');
          setTitle(res.data.title || '');
          setDescription(res.data.description || '');
        }
      })
      .catch((err) => console.error('Error loading config', err));

    // Load featured releases
    fetchFeaturedReleases();
  }, []);

  const fetchFeaturedReleases = async () => {
    try {
      setLoadingReleases(true);
      const res: any = await apiClient.getFeaturedReleases();
      if (res && res.success) {
        // Sort by order ascending
        const sorted = (res.data || []).sort((a: FeaturedRelease, b: FeaturedRelease) => a.order - b.order);
        setReleases(sorted);
      }
    } catch (err) {
      console.error('Error loading featured releases', err);
    } finally {
      setLoadingReleases(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploadingLogo(true);
      const res: any = await apiClient.uploadImage(file, 'zirect/branding');
      if (res && res.success && res.data?.url) {
        setLogoUrl(res.data.url);
        toast({
          title: 'Logo Uploaded',
          description: 'Branding logo uploaded successfully.',
        });
      } else {
        throw new Error(res.message || 'Upload failed');
      }
    } catch (err: any) {
      toast({
        title: 'Upload Error',
        description: err.message || 'Failed to upload logo image.',
        variant: 'destructive',
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploadingCover(true);
      const res: any = await apiClient.uploadImage(file, 'zirect/featured');
      if (res && res.success && res.data?.url) {
        setCoverArt(res.data.url);
        toast({
          title: 'Cover Art Uploaded',
          description: 'Featured release cover art uploaded successfully.',
        });
      } else {
        throw new Error(res.message || 'Upload failed');
      }
    } catch (err: any) {
      toast({
        title: 'Upload Error',
        description: err.message || 'Failed to upload cover art image.',
        variant: 'destructive',
      });
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingConfig(true);
      const token = localStorage.getItem('authToken') || undefined;
      const res: any = await apiClient.updateHomePageConfig({ logoUrl, title, description }, token);
      if (res && res.success) {
        toast({
          title: 'Config Saved',
          description: 'Home page branding updated successfully.',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to save configuration.',
        variant: 'destructive',
      });
    } finally {
      setSavingConfig(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'New password and confirmation do not match.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setChangingPassword(true);
      const token = localStorage.getItem('authToken') || undefined;
      const res: any = await apiClient.updatePassword({ currentPassword, newPassword }, token);
      
      if (res && res.success) {
        toast({
          title: 'Password Updated',
          description: 'Admin password changed successfully.',
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast({
          title: 'Error',
          description: res.message || 'Incorrect current password or update failed.',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update password.',
        variant: 'destructive',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleOpenAddDialog = () => {
    setEditingRelease(null);
    setTrackName('');
    setArtistNames('');
    setSpotifyLink('');
    setYoutubeLink('');
    setCoverArt('');
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (release: FeaturedRelease) => {
    setEditingRelease(release);
    setTrackName(release.trackName);
    setArtistNames(release.artistNames);
    setSpotifyLink(release.spotifyLink || '');
    setYoutubeLink(release.youtubeLink || '');
    setCoverArt(release.coverArt || '');
    setDialogOpen(true);
  };

  const handleSaveRelease = async () => {
    if (!trackName || !artistNames) {
      toast({
        title: 'Validation Error',
        description: 'Track Name and Artist Name(s) are required.',
        variant: 'destructive',
      });
      return;
    }

    if (!coverArt) {
      toast({
        title: 'Validation Error',
        description: 'Cover Art image is required. Please upload an image.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSavingRelease(true);
      const token = localStorage.getItem('authToken') || undefined;
      const payload = { trackName, artistNames, spotifyLink, youtubeLink, coverArt };

      if (editingRelease) {
        const res: any = await apiClient.updateFeaturedRelease(editingRelease.id, payload, token);
        if (res && res.success) {
          toast({
            title: 'Release Updated',
            description: 'Featured release updated successfully.',
          });
        }
      } else {
        const nextOrder = releases.length > 0 ? Math.max(...releases.map(r => r.order)) + 1 : 0;
        const res: any = await apiClient.createFeaturedRelease({ ...payload, order: nextOrder }, token);
        if (res && res.success) {
          toast({
            title: 'Release Added',
            description: 'New featured release added successfully.',
          });
        }
      }
      setDialogOpen(false);
      fetchFeaturedReleases();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to save featured release.',
        variant: 'destructive',
      });
    } finally {
      setSavingRelease(false);
    }
  };

  const handleDeleteRelease = async (id: string) => {
    if (!confirm('Are you sure you want to remove this featured release?')) return;
    try {
      const token = localStorage.getItem('authToken') || undefined;
      const res: any = await apiClient.deleteFeaturedRelease(id, token);
      if (res && res.success) {
        toast({
          title: 'Release Removed',
          description: 'Featured release deleted successfully.',
        });
        fetchFeaturedReleases();
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete featured release.',
        variant: 'destructive',
      });
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newReleases = [...releases];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newReleases.length) return;

    const temp = newReleases[index];
    newReleases[index] = newReleases[targetIndex];
    newReleases[targetIndex] = temp;

    const orderedIds = newReleases.map(r => r.id);
    setReleases(newReleases);

    try {
      const token = localStorage.getItem('authToken') || undefined;
      await apiClient.reorderFeaturedReleases(orderedIds, token);
      toast({
        title: 'Order Updated',
        description: 'Featured releases order saved.',
      });
    } catch (err: any) {
      toast({
        title: 'Ordering Error',
        description: 'Failed to save custom order to database.',
        variant: 'destructive',
      });
      fetchFeaturedReleases();
    }
  };

  return (
    <div className="flex h-screen art-bg-admin">
      <div className="fixed inset-0 bg-[rgba(2,8,23,0.82)] pointer-events-none z-0" />
      <AdminSidebar />

      <main className="flex-1 md:ml-64 overflow-auto relative z-10">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-8 max-w-7xl">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold tracking-tighter">Setting <span className="gradient-text-cyan">Label</span></h1>
              <p className="text-muted-foreground mt-2">Manage your public website branding, brand settings, and admin account security.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Branding and Security Config Forms (Left Column) */}
              <div className="lg:col-span-1 space-y-8">
                {/* Branding Card */}
                <Card className="glass shadow-xl border-accent/15">
                  <CardHeader>
                    <CardTitle className="text-xl">Website Branding</CardTitle>
                    <CardDescription>Logo and general text metadata.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSaveConfig} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Label Logo</label>
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-lg bg-accent/5 border border-accent/15 overflow-hidden flex items-center justify-center flex-shrink-0 group">
                            {logoUrl ? (
                              <>
                                <img src={logoUrl} alt="Logo preview" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setLogoUrl('')}
                                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-destructive-foreground hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <Music className="w-6 h-6 text-accent/35" />
                            )}
                            {uploadingLogo && (
                              <div className="absolute inset-0 bg-background/85 flex items-center justify-center">
                                <Loader2 className="w-5 h-5 text-accent animate-spin" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <label className="relative flex flex-col items-center justify-center px-4 py-3 rounded-lg border border-dashed border-accent/20 bg-accent/5 hover:border-accent/40 hover:bg-accent/10 cursor-pointer transition-all">
                              <span className="text-xs font-medium text-accent flex items-center gap-1.5">
                                <Upload className="w-3.5 h-3.5" />
                                {uploadingLogo ? 'Uploading...' : 'Upload Logo Image'}
                              </span>
                              <span className="text-[10px] text-muted-foreground mt-0.5">PNG or JPG</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                disabled={uploadingLogo}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Branding Title</label>
                        <Input
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Zirect Label"
                          className="bg-[rgba(8,20,45,0.4)] border-accent/15 focus:border-accent/40"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Header Description</label>
                        <Textarea
                          required
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Empowering independent artists through global music distribution..."
                          className="bg-[rgba(8,20,45,0.4)] border-accent/15 focus:border-accent/40 min-h-24 resize-none"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={savingConfig}
                        className="w-full bg-accent text-accent-foreground hover:bg-accent/90 neon-glow-sm"
                      >
                        {savingConfig ? 'Saving Branding...' : 'Save Branding Changes'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Change Password Card */}
                <Card className="glass shadow-xl border-accent/15">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-accent" />
                      <CardTitle className="text-xl">Admin Security</CardTitle>
                    </div>
                    <CardDescription>Update your administrator password.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Current Password</label>
                        <Input
                          required
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="bg-[rgba(8,20,45,0.4)] border-accent/15 focus:border-accent/40"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold">New Password</label>
                        <Input
                          required
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="bg-[rgba(8,20,45,0.4)] border-accent/15 focus:border-accent/40"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Confirm New Password</label>
                        <Input
                          required
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="bg-[rgba(8,20,45,0.4)] border-accent/15 focus:border-accent/40"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={changingPassword}
                        className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        {changingPassword ? 'Updating Password...' : 'Change Password'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Featured Releases List (Right Column) */}
              <div className="lg:col-span-2">
                <Card className="glass shadow-xl border-accent/15">
                  <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-4">
                    <div>
                      <CardTitle className="text-xl">Featured Releases Grid</CardTitle>
                      <CardDescription>Grid of up to 15 highlighted songs with links.</CardDescription>
                    </div>
                    <Button
                      onClick={handleOpenAddDialog}
                      size="sm"
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      Add Release
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {loadingReleases ? (
                      <div className="text-center py-12 text-muted-foreground">Loading featured releases...</div>
                    ) : releases.length === 0 ? (
                      <div className="text-center py-16 border border-dashed border-accent/15 rounded-xl bg-accent/5">
                        <Music className="w-10 h-10 text-accent/30 mx-auto mb-3" />
                        <h4 className="font-semibold mb-1">No featured releases yet</h4>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">Add up to 15 featured distribution records to show on the main website homepage grid.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {releases.map((release, index) => (
                          <div
                            key={release.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-accent/10 bg-accent/5 hover:border-accent/30 transition-all"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded overflow-hidden flex items-center justify-center flex-shrink-0">
                                {release.coverArt ? (
                                  <img src={release.coverArt} alt={release.trackName} className="w-full h-full object-cover" />
                                ) : (
                                  <Music className="w-6 h-6 text-accent/35" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-sm truncate text-foreground">{release.trackName}</h4>
                                <p className="text-xs text-muted-foreground truncate mt-0.5">{release.artistNames}</p>
                                <div className="flex gap-2 mt-1">
                                  {release.spotifyLink && (
                                    <span className="text-[10px] text-[#1DB954] font-medium flex items-center gap-0.5">
                                      Spotify <ExternalLink className="w-2.5 h-2.5" />
                                    </span>
                                  )}
                                  {release.youtubeLink && (
                                    <span className="text-[10px] text-accent font-medium flex items-center gap-0.5">
                                      YouTube <ExternalLink className="w-2.5 h-2.5" />
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Reordering and Actions */}
                            <div className="flex items-center gap-1.5 ml-4">
                              <Button
                                size="icon"
                                variant="ghost"
                                disabled={index === 0}
                                onClick={() => handleMove(index, 'up')}
                                className="w-8 h-8 text-muted-foreground hover:text-accent"
                              >
                                <ArrowUp className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                disabled={index === releases.length - 1}
                                onClick={() => handleMove(index, 'down')}
                                className="w-8 h-8 text-muted-foreground hover:text-accent"
                              >
                                <ArrowDown className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleOpenEditDialog(release)}
                                className="w-8 h-8 text-muted-foreground hover:text-accent"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeleteRelease(release.id)}
                                className="w-8 h-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add / Edit Release Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass border-accent/20 text-foreground max-w-md shadow-2xl">
          <DialogHeader>
            <DialogTitle>{editingRelease ? 'Edit Featured Release' : 'Add Featured Release'}</DialogTitle>
            <DialogDescription>Input release track information and distribution links.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Track Name <span className="text-accent">*</span></label>
              <Input
                required
                value={trackName}
                onChange={(e) => setTrackName(e.target.value)}
                placeholder="Cyan Dreams"
                className="bg-[rgba(8,20,45,0.4)] border-accent/15 focus:border-accent/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Artist Name(s) <span className="text-accent">*</span></label>
              <Input
                required
                value={artistNames}
                onChange={(e) => setArtistNames(e.target.value)}
                placeholder="Zirect, John Doe (comma separated)"
                className="bg-[rgba(8,20,45,0.4)] border-accent/15 focus:border-accent/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Cover Art <span className="text-accent">*</span></label>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-md bg-accent/5 border border-accent/15 overflow-hidden flex items-center justify-center flex-shrink-0 group">
                  {coverArt ? (
                    <>
                      <img src={coverArt} alt="Cover preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setCoverArt('')}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-destructive-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <Music className="w-6 h-6 text-accent/35" />
                  )}
                  {uploadingCover && (
                    <div className="absolute inset-0 bg-background/85 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-accent animate-spin" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <label className="relative flex flex-col items-center justify-center px-4 py-2.5 rounded-lg border border-dashed border-accent/20 bg-accent/5 hover:border-accent/40 hover:bg-accent/10 cursor-pointer transition-all">
                    <span className="text-xs font-medium text-accent flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingCover ? 'Uploading...' : 'Upload Cover Image'}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">PNG or JPG</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      disabled={uploadingCover}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Spotify Link</label>
              <Input
                value={spotifyLink}
                onChange={(e) => setSpotifyLink(e.target.value)}
                placeholder="https://open.spotify.com/track/..."
                className="bg-[rgba(8,20,45,0.4)] border-accent/15 focus:border-accent/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">YouTube Music Link</label>
              <Input
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
                placeholder="https://music.youtube.com/watch?v=..."
                className="bg-[rgba(8,20,45,0.4)] border-accent/15 focus:border-accent/40"
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="hover:bg-accent/10">Cancel</Button>
            <Button
              onClick={handleSaveRelease}
              disabled={savingRelease}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {savingRelease ? 'Saving...' : 'Save Release'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
