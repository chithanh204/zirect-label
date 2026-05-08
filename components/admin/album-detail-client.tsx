'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Loader2, Music, CheckCircle, AlertCircle, Clock, Plus, Trash2, Edit2, Check, X, ShieldAlert, BarChart3, Users, DollarSign } from 'lucide-react';
import Link from 'next/link';

const PLATFORMS = [
  { id: 'spotify', name: 'Spotify', color: 'text-green-500 bg-green-500/10' },
  { id: 'youtube_music', name: 'YouTube Music', color: 'text-red-500 bg-red-500/10' },
  { id: 'apple_music', name: 'Apple Music', color: 'text-pink-500 bg-pink-500/10' },
  { id: 'tiktok', name: 'TikTok', color: 'text-cyan-500 bg-cyan-500/10' },
];

export function AlbumDetailClient({ albumId }: { albumId: string }) {
  const router = useRouter();
  const [album, setAlbum] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs state
  const [activeTab, setActiveTab] = useState<'tracks' | 'collaborators' | 'revenue' | 'platform_revenue'>('tracks');

  // Platform Revenue State
  const [editingRevPlatform, setEditingRevPlatform] = useState<string | null>(null);
  const [revForm, setRevForm] = useState({ totalRevenue: 0 });
  const [paymentForm, setPaymentForm] = useState({ amount: 0, note: '' });
  const [isPaymentOpen, setIsPaymentOpen] = useState<string | null>(null); // platform ID

  // Edit Track Platform state
  const [editingPlatform, setEditingPlatform] = useState<{ trackId: string, platform: string } | null>(null);
  const [platformForm, setPlatformForm] = useState({ streams: 0, copyrightFlag: false, url: '' });

  // Collaborators State
  const [isAddCollabOpen, setIsAddCollabOpen] = useState(false);
  const [allArtists, setAllArtists] = useState<any[]>([]);
  const [collabForm, setCollabForm] = useState({ artistId: '', role: 'featured' });

  // Revenue Split State
  const [splits, setSplits] = useState<{ artistId: string, percentage: number }[]>([]);

  useEffect(() => {
    fetchAlbumDetail();
    fetchAllArtists();
  }, [albumId]);

  const fetchAlbumDetail = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getAlbumDetail(albumId) as any;
      if (res?.success && res.data) {
        setAlbum(res.data);
        // Initialize splits for UI editing
        if (res.data.revenueSplits) {
          setSplits(res.data.revenueSplits.map((s: any) => ({ artistId: s.artistId, percentage: s.percentage })));
        }
      } else {
        setError('Album not found');
      }
    } catch (err) {
      setError('Failed to fetch album details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllArtists = async () => {
    try {
      const res = await apiClient.getAllArtists() as any;
      if (res?.success && res.data?.artists) {
        setAllArtists(res.data.artists);
      }
    } catch (e) { }
  };

  // --- TRACK PLATFORMS ---
  const handleEditPlatform = (trackId: string, platform: string, currentData: any) => {
    setEditingPlatform({ trackId, platform });
    setPlatformForm({
      streams: currentData?.streams || 0,
      copyrightFlag: currentData?.copyrightFlag || false,
      url: currentData?.url || ''
    });
  };

  const handleSavePlatform = async () => {
    if (!editingPlatform) return;
    try {
      const res = await apiClient.updateTrackPlatform(
        editingPlatform.trackId,
        editingPlatform.platform,
        platformForm
      ) as any;
      if (res?.success) {
        setEditingPlatform(null);
        fetchAlbumDetail();
      }
    } catch (e) {
      alert('Failed to save platform data');
    }
  };

  const getPlatformData = (track: any, platformId: string) => {
    return track.platforms?.find((p: any) => p.platform === platformId) || null;
  };

  // --- COLLABORATORS ---
  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.addCollaborator(albumId, collabForm.artistId, collabForm.role) as any;
      if (res?.success) {
        setIsAddCollabOpen(false);
        setCollabForm({ artistId: '', role: 'featured' });
        fetchAlbumDetail();
      } else {
        alert(res?.message || 'Failed to add collaborator');
      }
    } catch (err: any) {
      alert(err.message || 'Error adding collaborator');
    }
  };

  const handleRemoveCollaborator = async (artistId: string) => {
    if (!confirm('Remove this collaborator?')) return;
    try {
      const res = await apiClient.removeCollaborator(albumId, artistId) as any;
      if (res?.success) {
        fetchAlbumDetail();
      }
    } catch (err) {
      alert('Error removing collaborator');
    }
  };

  // --- REVENUE SPLIT ---
  const handleSplitChange = (artistId: string, value: number) => {
    setSplits(prev => {
      const exists = prev.find(s => s.artistId === artistId);
      if (exists) {
        return prev.map(s => s.artistId === artistId ? { ...s, percentage: value } : s);
      } else {
        return [...prev, { artistId, percentage: value }];
      }
    });
  };

  const handleSaveSplits = async () => {
    const total = splits.reduce((sum, s) => sum + s.percentage, 0);
    if (Math.abs(total - 100) > 0.01 && splits.length > 0) {
      alert(`Total percentage must equal 100% (currently ${total.toFixed(1)}%)`);
      return;
    }
    try {
      const res = await apiClient.updateRevenueSplits(albumId, splits) as any;
      if (res?.success) {
        alert('Revenue splits updated successfully');
        fetchAlbumDetail();
      }
    } catch (e: any) {
      alert(e.message || 'Error updating splits');
    }
  };

  // --- PLATFORM REVENUE & PAYMENTS ---
  const handleSavePlatformRevenue = async (platformId: string) => {
    try {
      const res = await apiClient.updatePlatformRevenue(albumId, platformId, revForm.totalRevenue) as any;
      if (res?.success) {
        setEditingRevPlatform(null);
        fetchAlbumDetail();
      }
    } catch (e) {
      alert('Failed to update platform revenue');
    }
  };

  const handleAddPayment = async (e: React.FormEvent, platformId: string) => {
    e.preventDefault();
    try {
      const res = await apiClient.addPlatformPayment(albumId, platformId, paymentForm.amount, paymentForm.note) as any;
      if (res?.success) {
        setIsPaymentOpen(null);
        setPaymentForm({ amount: 0, note: '' });
        fetchAlbumDetail();
      } else {
        alert(res?.message || 'Failed to add payment');
      }
    } catch (err: any) {
      alert(err.message || 'Error adding payment');
    }
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-accent" />
    </div>
  );

  if (error || !album) return (
    <div className="p-8 text-center text-red-500 font-medium">
      {error}
      <br />
      <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/albums')}>Back to Albums</Button>
    </div>
  );

  // Collect all artists involved for revenue split (Main Artist + Collaborators)
  const involvedArtists = [
    { id: album.artist.id, name: `${album.artist.name} (Main Artist)`, avatar: album.artist.avatar },
    ...(album.collaborators?.map((c: any) => ({ id: c.artist.id, name: `${c.artist.name} (${c.role})`, avatar: c.artist.avatar })) || [])
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/albums" className="p-2 bg-card border border-border rounded-lg hover:bg-accent/10 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tighter">Album Details</h1>
          <p className="text-muted-foreground mt-1">Manage streams, collaborators, and revenue splits.</p>
        </div>
      </div>

      <Card className="bg-card border-border p-6 flex flex-col md:flex-row gap-6 items-start">
        {album.coverArt ? (
          <img src={album.coverArt} alt={album.title} className="w-32 h-32 rounded-lg object-cover shadow-lg border border-border" />
        ) : (
          <div className="w-32 h-32 bg-accent/20 rounded-lg flex items-center justify-center shadow-lg border border-border">
            <Music className="w-12 h-12 text-accent/40" />
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-3xl font-bold mb-2">{album.title}</h2>
          <div className="flex items-center gap-3 mb-4">
            {album.artist?.avatar ? (
              <img src={album.artist.avatar} alt="" className="w-6 h-6 rounded-full" />
            ) : (
              <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center text-xs text-accent font-bold">
                {album.artistName.charAt(0)}
              </div>
            )}
            <span className="font-medium text-lg">{album.artistName}</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div><strong className="text-foreground">UPC:</strong> {album.upc || '—'}</div>
            <div><strong className="text-foreground">Release Date:</strong> {album.releaseDate ? new Date(album.releaseDate).toLocaleDateString() : '—'}</div>
            <div><strong className="text-foreground">Status:</strong> <span className="uppercase text-xs font-bold px-2 py-0.5 bg-accent/20 text-accent rounded-full">{album.status}</span></div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-border hide-scrollbar">
        <button
          onClick={() => setActiveTab('tracks')}
          className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'tracks' ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          <BarChart3 className="w-4 h-4" /> Tracks & Streams
        </button>
        <button
          onClick={() => setActiveTab('collaborators')}
          className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'collaborators' ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          <Users className="w-4 h-4" /> Collaborators ({album.collaborators?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('revenue')}
          className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'revenue' ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          <BarChart3 className="w-4 h-4" /> Revenue Split
        </button>
        <button
          onClick={() => setActiveTab('platform_revenue')}
          className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'platform_revenue' ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          <DollarSign className="w-4 h-4" /> Platform Revenue
        </button>
      </div>

      {/* Tab Content: Tracks */}
      {activeTab === 'tracks' && (
        <Card className="bg-card border-border overflow-hidden">
          <div className="p-4 bg-background/50 border-b border-border">
            <h3 className="font-bold">Track Platforms & Streams</h3>
            <p className="text-sm text-muted-foreground">Manually update stream counts and copyright status per platform.</p>
          </div>
          <div className="divide-y divide-border">
            {album.tracks?.map((track: any) => (
              <div key={track.id} className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-muted-foreground font-medium w-6">{track.position}.</span>
                  <span className="font-bold flex-1">{track.title}</span>
                  <span className="text-sm text-muted-foreground">{track.duration}s</span>
                </div>
                
                {/* Platform grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ml-9">
                  {PLATFORMS.map(platform => {
                    const data = getPlatformData(track, platform.id);
                    const isEditing = editingPlatform?.trackId === track.id && editingPlatform?.platform === platform.id;

                    return (
                      <div key={platform.id} className="border border-border rounded-lg p-3 bg-background">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${platform.color}`}>
                            {platform.name}
                          </span>
                          {!isEditing && (
                            <button onClick={() => handleEditPlatform(track.id, platform.id, data)} className="text-muted-foreground hover:text-accent">
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="space-y-2 mt-2">
                            <div>
                              <label className="text-[10px] text-muted-foreground uppercase">Streams</label>
                              <input
                                type="number"
                                value={platformForm.streams}
                                onChange={e => setPlatformForm(prev => ({ ...prev, streams: parseInt(e.target.value) || 0 }))}
                                className="w-full bg-card border border-border rounded px-2 py-1 text-xs focus:ring-1 focus:ring-accent"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`copy-${track.id}-${platform.id}`}
                                checked={platformForm.copyrightFlag}
                                onChange={e => setPlatformForm(prev => ({ ...prev, copyrightFlag: e.target.checked }))}
                                className="rounded border-border bg-card text-accent focus:ring-accent"
                              />
                              <label htmlFor={`copy-${track.id}-${platform.id}`} className="text-xs text-red-500 font-medium">Copyright Flag</label>
                            </div>
                            <div className="flex gap-1 mt-2">
                              <Button size="sm" className="h-6 text-[10px] px-2 bg-accent hover:bg-accent/90 w-full" onClick={handleSavePlatform}>Save</Button>
                              <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 w-full" onClick={() => setEditingPlatform(null)}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="text-lg font-bold text-foreground">
                              {data?.streams ? data.streams.toLocaleString() : '0'} <span className="text-xs text-muted-foreground font-normal">streams</span>
                            </div>
                            {data?.copyrightFlag && (
                              <div className="flex items-center gap-1 text-red-500 text-xs font-medium">
                                <ShieldAlert className="w-3 h-3" /> Copyright Claimed
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab Content: Collaborators */}
      {activeTab === 'collaborators' && (
        <Card className="bg-card border-border p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-lg">Album Collaborators</h3>
              <p className="text-sm text-muted-foreground">Add featured artists, producers, etc.</p>
            </div>
            <Dialog open={isAddCollabOpen} onOpenChange={setIsAddCollabOpen}>
              <Button onClick={() => setIsAddCollabOpen(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Plus className="w-4 h-4 mr-2" /> Add Collaborator
              </Button>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Add Collaborator</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddCollaborator} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Artist</label>
                    <select
                      value={collabForm.artistId}
                      onChange={e => setCollabForm({ ...collabForm, artistId: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                      required
                    >
                      <option value="">Select artist...</option>
                      {allArtists.filter(a => a.id !== album.artistId).map(artist => (
                        <option key={artist.id} value={artist.id}>{artist.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Role</label>
                    <select
                      value={collabForm.role}
                      onChange={e => setCollabForm({ ...collabForm, role: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    >
                      <option value="featured">Featured Artist</option>
                      <option value="producer">Producer</option>
                      <option value="songwriter">Songwriter</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAddCollabOpen(false)}>Cancel</Button>
                    <Button type="submit" className="bg-accent text-accent-foreground">Add</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {/* Main Artist (Fixed) */}
            <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
              <div className="flex items-center gap-3">
                {album.artist?.avatar ? (
                  <img src={album.artist.avatar} alt="" className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center text-accent font-bold">
                    {album.artistName.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-bold">{album.artistName}</p>
                  <p className="text-xs text-accent font-medium uppercase tracking-wider">Main Artist</p>
                </div>
              </div>
            </div>

            {/* Collaborators */}
            {album.collaborators?.map((collab: any) => (
              <div key={collab.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  {collab.artist?.avatar ? (
                    <img src={collab.artist.avatar} alt="" className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center text-accent font-bold">
                      {collab.artist.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold">{collab.artist.name}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{collab.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveCollaborator(collab.artist.id)}
                  className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {album.collaborators?.length === 0 && (
              <div className="text-center p-6 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
                No collaborators added yet.
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Tab Content: Revenue Split */}
      {activeTab === 'revenue' && (
        <Card className="bg-card border-border p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-lg">Revenue Split</h3>
              <p className="text-sm text-muted-foreground">Distribute revenue percentages among involved artists.</p>
            </div>
            <Button onClick={handleSaveSplits} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Check className="w-4 h-4 mr-2" /> Save Splits
            </Button>
          </div>

          {/* Visual Preview Bar */}
          <div className="mb-8">
            <div className="flex h-6 rounded-full overflow-hidden bg-background border border-border mb-2">
              {splits.map((split, idx) => {
                const colors = ['bg-accent', 'bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
                return (
                  <div
                    key={split.artistId}
                    style={{ width: `${split.percentage}%` }}
                    className={`${colors[idx % colors.length]} transition-all duration-300`}
                    title={`${split.percentage}%`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-muted-foreground">0%</span>
              <span className={splits.reduce((a, b) => a + b.percentage, 0) === 100 ? "text-green-500" : "text-red-500"}>
                Total: {splits.reduce((a, b) => a + b.percentage, 0).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {involvedArtists.map((artist, idx) => {
              const currentSplit = splits.find(s => s.artistId === artist.id)?.percentage || 0;
              const colors = ['text-accent', 'text-purple-500', 'text-blue-500', 'text-green-500', 'text-yellow-500'];

              return (
                <div key={artist.id} className="flex items-center gap-4 p-4 bg-background border border-border rounded-lg">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-accent/20 flex-shrink-0 flex items-center justify-center">
                    {artist.avatar ? <img src={artist.avatar} alt="" className="w-full h-full object-cover" /> : <span className="font-bold text-xs">{artist.name.charAt(0)}</span>}
                  </div>
                  <div className="w-48 truncate font-medium text-sm" title={artist.name}>
                    {artist.name}
                  </div>
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.1"
                      value={currentSplit}
                      onChange={(e) => handleSplitChange(artist.id, parseFloat(e.target.value))}
                      className="w-full accent-accent"
                    />
                  </div>
                  <div className="w-24 flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={currentSplit}
                      onChange={(e) => handleSplitChange(artist.id, parseFloat(e.target.value) || 0)}
                      className="w-full bg-card border border-border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-accent text-right"
                    />
                    <span className={`font-bold ${colors[idx % colors.length]}`}>%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const eq = 100 / involvedArtists.length;
                setSplits(involvedArtists.map(a => ({ artistId: a.id, percentage: parseFloat(eq.toFixed(1)) })));
              }}
            >
              Split Equally
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSplits(involvedArtists.map((a, i) => ({ artistId: a.id, percentage: i === 0 ? 100 : 0 })));
              }}
            >
              100% to Main Artist
            </Button>
          </div>
        </Card>
      )}

      {/* Tab Content: Platform Revenue */}
      {activeTab === 'platform_revenue' && (
        <Card className="bg-card border-border p-6">
          <div className="mb-6">
            <h3 className="font-bold text-lg">Platform Revenue & Payments</h3>
            <p className="text-sm text-muted-foreground">Manage total revenue and record payouts per platform.</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {PLATFORMS.map(platform => {
              const revData = album.platformRevenues?.find((r: any) => r.platform === platform.id);
              const payments = album.platformPayments?.filter((p: any) => p.platform === platform.id) || [];
              const totalRevenue = revData?.totalRevenue || 0;
              const totalPaid = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
              const unpaidBalance = Math.max(0, totalRevenue - totalPaid);
              const isEditingRev = editingRevPlatform === platform.id;
              const isPaymentOpenForPlatform = isPaymentOpen === platform.id;

              return (
                <div key={platform.id} className="border border-border rounded-lg bg-background overflow-hidden flex flex-col">
                  {/* Platform Header */}
                  <div className="p-4 border-b border-border bg-accent/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${platform.color}`}>
                        {platform.name}
                      </span>
                    </div>
                  </div>

                  {/* Revenue Stats */}
                  <div className="p-4 grid grid-cols-3 gap-4 border-b border-border">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Total Revenue</p>
                      {isEditingRev ? (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-muted-foreground">$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={revForm.totalRevenue}
                            onChange={(e) => setRevForm({ totalRevenue: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-card border border-border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-accent"
                          />
                          <div className="flex flex-col gap-1">
                            <button onClick={() => handleSavePlatformRevenue(platform.id)} className="text-accent hover:text-accent/80"><Check className="w-4 h-4" /></button>
                            <button onClick={() => setEditingRevPlatform(null)} className="text-muted-foreground hover:text-red-500"><X className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group">
                          <p className="font-bold text-lg text-foreground">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          <button onClick={() => { setEditingRevPlatform(platform.id); setRevForm({ totalRevenue }); }} className="text-muted-foreground hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Total Paid</p>
                      <p className="font-bold text-lg text-green-500">${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Unpaid Balance</p>
                      <p className={`font-bold text-lg ${unpaidBalance > 0 ? 'text-red-500' : 'text-foreground'}`}>
                        ${unpaidBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Owed to Artists (if there is an unpaid balance) */}
                  {unpaidBalance > 0 && splits.length > 0 && (
                    <div className="p-4 border-b border-border bg-red-500/5">
                      <p className="text-xs font-bold text-red-500 uppercase mb-3 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Unpaid Split Breakdown
                      </p>
                      <div className="space-y-2">
                        {involvedArtists.map(artist => {
                          const splitPct = splits.find(s => s.artistId === artist.id)?.percentage || 0;
                          if (splitPct <= 0) return null;
                          const owed = (unpaidBalance * splitPct) / 100;
                          return (
                            <div key={artist.id} className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                {artist.avatar ? <img src={artist.avatar} className="w-5 h-5 rounded-full" alt="" /> : <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">{artist.name.charAt(0)}</div>}
                                <span className="text-muted-foreground truncate w-32">{artist.name}</span>
                                <span className="text-xs font-mono bg-accent/10 text-accent px-1.5 py-0.5 rounded">{splitPct}%</span>
                              </div>
                              <span className="font-bold text-foreground">${owed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Payments Section */}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-bold">Payment History</h4>
                      <Dialog open={isPaymentOpenForPlatform} onOpenChange={(open) => setIsPaymentOpen(open ? platform.id : null)}>
                        <Button variant="outline" size="sm" onClick={() => setIsPaymentOpen(platform.id)} className="h-7 text-xs">
                          <Plus className="w-3 h-3 mr-1" /> Log Payment
                        </Button>
                        <DialogContent className="bg-card border-border">
                          <DialogHeader>
                            <DialogTitle>Log Payment for {platform.name}</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={(e) => handleAddPayment(e, platform.id)} className="space-y-4">
                            <div>
                              <label className="text-sm font-medium mb-1 block">Payment Amount ($)</label>
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={paymentForm.amount || ''}
                                onChange={e => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                                required
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Max unpaid: ${unpaidBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1 block">Note / Ref ID (Optional)</label>
                              <input
                                type="text"
                                value={paymentForm.note}
                                onChange={e => setPaymentForm({ ...paymentForm, note: e.target.value })}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                                placeholder="e.g. Q1 2026 Distribution"
                              />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                              <Button type="button" variant="outline" onClick={() => setIsPaymentOpen(null)}>Cancel</Button>
                              <Button type="submit" className="bg-accent text-accent-foreground">Log Payment</Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {payments.length > 0 ? (
                      <div className="space-y-2 overflow-y-auto max-h-40 pr-2 custom-scrollbar">
                        {payments.map((p: any) => (
                          <div key={p.id} className="flex justify-between items-start p-2 bg-card border border-border rounded">
                            <div>
                              <p className="text-sm font-bold text-green-500">${p.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                              <p className="text-xs text-muted-foreground">{new Date(p.paidAt).toLocaleDateString()} {p.note && `• ${p.note}`}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground py-4 border border-dashed border-border rounded-lg">
                        No payments logged yet.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
