'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, ChevronRight, Music, CheckCircle, AlertCircle, Clock, Loader2, X, ImageIcon, Check, Trash2 } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useAlbums } from '@/hooks/useApi';
import { apiClient } from '@/lib/api';

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  draft: { label: 'Making cover art', icon: Clock, color: 'bg-gray-500/20 text-gray-400' },
  submitted: { label: 'Submitted', icon: Clock, color: 'bg-blue-500/20 text-blue-500' },
  approved: { label: 'Approved', icon: CheckCircle, color: 'bg-cyan-500/20 text-cyan-500' },
  delivering: { label: 'Delivering', icon: Clock, color: 'bg-purple-500/20 text-purple-500' },
  distributed: { label: 'Distributed', icon: CheckCircle, color: 'bg-green-500/20 text-green-500' },
  rejected: { label: 'Rejected', icon: AlertCircle, color: 'bg-red-500/20 text-red-500' },
};

interface TrackInput {
  title: string;
  duration: number;
}

export function AlbumsManagement() {
  const { albums, loading, error, refetch } = useAlbums();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  // Create album dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Artists list for dropdown
  const [artistsList, setArtistsList] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    artistId: '',
    coverArt: '',
    releaseDate: '',
    upc: '',
  });
  const [tracks, setTracks] = useState<TrackInput[]>([{ title: '', duration: 0 }]);

  // Fetch artists for the dropdown
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await apiClient.getAllArtists() as any;
        if (response?.success && response.data) {
          setArtistsList(response.data.artists || []);
        }
      } catch (e) {
        console.error('Failed to fetch artists for dropdown:', e);
      }
    };
    fetchArtists();
  }, []);

  const filteredAlbums = albums.filter((album: any) =>
    (album.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      album.artistName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      album.upc?.includes(searchTerm)) &&
    (!filterStatus || album.status === filterStatus)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTrackChange = (index: number, field: keyof TrackInput, value: string | number) => {
    setTracks(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addTrack = () => {
    setTracks(prev => [...prev, { title: '', duration: 0 }]);
  };

  const removeTrack = (index: number) => {
    if (tracks.length <= 1) return;
    setTracks(prev => prev.filter((_, i) => i !== index));
  };

  // Cover art upload
  const handleFileSelect = useCallback(async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setSubmitError('Invalid file type. Allowed: JPEG, PNG, WebP');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError('File too large. Maximum size: 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(file);

    setIsUploading(true);
    setSubmitError(null);
    try {
      const response = await apiClient.uploadImage(file, 'zirect/covers');
      if (response?.success && response.data) {
        setFormData(prev => ({ ...prev, coverArt: response.data.url }));
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to upload cover art');
      setCoverPreview(null);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const removeCover = () => {
    setCoverPreview(null);
    setFormData(prev => ({ ...prev, coverArt: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetForm = () => {
    setFormData({ title: '', artistId: '', coverArt: '', releaseDate: '', upc: '' });
    setTracks([{ title: '', duration: 0 }]);
    setCoverPreview(null);
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      if (!formData.title || !formData.artistId) {
        setSubmitError('Title and Artist are required');
        setIsSubmitting(false);
        return;
      }

      const validTracks = tracks.filter(t => t.title.trim());
      const response = await apiClient.createAlbumAdmin({
        title: formData.title,
        artistId: formData.artistId,
        coverArt: formData.coverArt || undefined,
        releaseDate: formData.releaseDate || undefined,
        upc: formData.upc || undefined,
        tracks: validTracks.length > 0 ? validTracks : undefined,
      });

      if (response && (response as any).success) {
        resetForm();
        setIsCreateDialogOpen(false);
        refetch();
      } else {
        setSubmitError((response as any).message || 'Failed to create album');
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create album');
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
            placeholder="Search albums, artist, UPC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => { setIsCreateDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Album
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Album</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && (
                <div className="p-3 bg-red-500/20 border border-red-500 text-red-500 rounded-lg text-sm">
                  {submitError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Album Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter album title"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Artist <span className="text-red-500">*</span>
                </label>
                <select
                  name="artistId"
                  value={formData.artistId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  disabled={isSubmitting}
                >
                  <option value="">Select an artist</option>
                  {artistsList.map((artist: any) => (
                    <option key={artist.id} value={artist.id}>{artist.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Release Date</label>
                  <input
                    type="date"
                    name="releaseDate"
                    value={formData.releaseDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">UPC</label>
                  <input
                    type="text"
                    name="upc"
                    value={formData.upc}
                    onChange={handleInputChange}
                    placeholder="Optional"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Cover Art Upload */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Cover Art</label>
                {coverPreview ? (
                  <div className="relative w-full">
                    <div className="relative w-28 h-28 rounded-lg overflow-hidden border-2 border-accent/50">
                      <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={removeCover}
                      className="absolute top-0 left-24 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      disabled={isUploading}
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                    {formData.coverArt && !isUploading && (
                      <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Uploaded
                      </p>
                    )}
                  </div>
                ) : (
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200
                      ${isDragOver ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50 hover:bg-accent/5'}`}
                  >
                    <ImageIcon className={`w-5 h-5 ${isDragOver ? 'text-accent' : 'text-muted-foreground'}`} />
                    <p className="text-sm text-muted-foreground">
                      <span className="text-accent font-medium">Click to upload</span> or drag and drop
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileSelect(file); }}
                  disabled={isSubmitting || isUploading}
                />
              </div>

              {/* Tracks */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-foreground">Tracks</label>
                  <button
                    type="button"
                    onClick={addTrack}
                    className="text-xs text-accent hover:text-accent/80 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Track
                  </button>
                </div>
                <div className="space-y-2">
                  {tracks.map((track, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-6 text-right">{idx + 1}.</span>
                      <input
                        type="text"
                        value={track.title}
                        onChange={(e) => handleTrackChange(idx, 'title', e.target.value)}
                        placeholder="Track title"
                        className="flex-1 px-3 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        disabled={isSubmitting}
                      />
                      <input
                        type="number"
                        value={track.duration || ''}
                        onChange={(e) => handleTrackChange(idx, 'duration', parseInt(e.target.value) || 0)}
                        placeholder="Sec"
                        className="w-20 px-2 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        disabled={isSubmitting}
                      />
                      {tracks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTrack(idx)}
                          className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting || isUploading}>
                  {isSubmitting ? 'Creating...' : 'Create Album'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterStatus(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${!filterStatus
            ? 'bg-accent text-accent-foreground'
            : 'bg-card border border-border hover:border-accent/40'
            }`}
        >
          All ({albums.length})
        </button>
        {Object.entries(statusConfig).map(([key, config]) => {
          const count = albums.filter((a: any) => a.status === key).length;
          return (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === key
                ? 'bg-accent text-accent-foreground'
                : 'bg-card border border-border hover:border-accent/40'
                }`}
            >
              {config.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Albums Table */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th className="px-6 py-4 text-left text-sm font-bold">Album</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Artist</th>
                <th className="px-6 py-4 text-left text-sm font-bold">UPC</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Tracks</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Streams</th>
                <th className="px-6 py-4 text-right text-sm font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">Loading albums...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <p className="text-sm text-red-500">{error}</p>
                    <Button variant="outline" size="sm" onClick={refetch} className="mt-2">
                      Retry
                    </Button>
                  </td>
                </tr>
              ) : filteredAlbums.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    {searchTerm || filterStatus ? 'No albums match your filter' : 'No albums found'}
                  </td>
                </tr>
              ) : (
                filteredAlbums.map((album: any, idx: number) => {
                  const config = statusConfig[album.status] || statusConfig.draft;
                  return (
                    <tr
                      key={album.id}
                      className={`border-b border-border hover:bg-accent/5 transition-colors ${idx === filteredAlbums.length - 1 ? 'border-0' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {album.coverArt ? (
                            <img src={album.coverArt} alt={album.title} className="w-10 h-10 rounded object-cover border border-border" />
                          ) : (
                            <div className="w-10 h-10 bg-accent/20 rounded flex items-center justify-center flex-shrink-0">
                              <Music className="w-5 h-5 text-accent/40" />
                            </div>
                          )}
                          <p className="font-bold">{album.title}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">{album.artistName}</td>
                      <td className="px-6 py-4 font-mono text-sm">{album.upc || '—'}</td>
                      <td className="px-6 py-4">
                        <select
                          className={`appearance-none cursor-pointer outline-none px-3 py-1 rounded-full text-xs font-bold text-center ${config.color}`}
                          value={album.status}
                          onChange={async (e) => {
                            try {
                              const res = await apiClient.updateAlbumStatus(album.id, e.target.value) as any;
                              if (res?.success) {
                                refetch();
                              } else {
                                alert(res?.message || 'Failed to update status');
                              }
                            } catch (err) {
                              alert('Failed to update status');
                            }
                          }}
                        >
                          {Object.entries(statusConfig).map(([key, c]) => (
                            <option key={key} value={key} className="text-foreground bg-background">
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">{album.tracks?.length || 0}</td>
                      <td className="px-6 py-4 text-accent font-bold">
                        {album.totalStreams >= 1000000
                          ? `${(album.totalStreams / 1000000).toFixed(1)}M`
                          : album.totalStreams >= 1000
                            ? `${(album.totalStreams / 1000).toFixed(1)}K`
                            : album.totalStreams || 0}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/albums/${album.id}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-background transition-colors"
                        >
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(statusConfig).map(([key, config]) => {
          const count = albums.filter((a: any) => a.status === key).length;
          return (
            <Card key={key} className="bg-card border-border p-4 text-center">
              <p className="text-xs text-muted-foreground mb-2 uppercase">{config.label}</p>
              <p className="text-2xl font-bold">{loading ? '—' : count}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
