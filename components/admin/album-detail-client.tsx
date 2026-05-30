'use client';

import { useState, useEffect, useRef, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Loader2, Music, CheckCircle, AlertCircle, Clock, Plus, Trash2, Edit2, Check, X, ShieldAlert, BarChart3, Users, DollarSign, Copy } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';

const PLATFORMS = [
  { id: 'spotify', name: 'Spotify', color: 'text-green-500 bg-green-500/10' },
  { id: 'youtube_music', name: 'YouTube Music', color: 'text-red-500 bg-red-500/10' },
];

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!value) return <span className="text-muted-foreground/40 italic">—</span>;
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="truncate font-medium">{value}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="text-muted-foreground hover:text-accent p-1 transition-colors rounded hover:bg-white/5 shrink-0"
        title={`Copy ${label}`}
      >
        {copied ? (
          <span className="text-emerald-400 text-xs font-semibold flex items-center gap-0.5">
            <Check className="w-3.5 h-3.5" />
          </span>
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}

export function AlbumDetailClient({ albumId }: { albumId: string }) {
  const { toast } = useToast();
  const router = useRouter();
  const [album, setAlbum] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>(null);

  // Spotify Tracks State
  const [spotifyTracks, setSpotifyTracks] = useState<any[]>([]);
  const [spotifyTracksLoading, setSpotifyTracksLoading] = useState(false);
  const [spotifyTracksError, setSpotifyTracksError] = useState<string | null>(null);
  const [showSpotifyTracks, setShowSpotifyTracks] = useState(false);

  // Tabs state
  const [activeTab, setActiveTab] = useState<'edit' | 'revenue'>('edit');

  // Edit Album State
  const [isEditAlbumOpen, setIsEditAlbumOpen] = useState(false);
  const [editAlbumForm, setEditAlbumForm] = useState<any>({});
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [metadataValidation, setMetadataValidation] = useState<{ hasWarnings: boolean; warnings: string[] }>({ hasWarnings: false, warnings: [] });

  const [editPrimaryArtists, setEditPrimaryArtists] = useState<Array<{ type: 'system' | 'custom'; id: string; name: string }>>([]);
  const [editFeaturingArtists, setEditFeaturingArtists] = useState<Array<{ type: 'system' | 'custom'; id: string; name: string }>>([]);

  const primaryFirstRun = useRef(true);
  const prevPrimaryStr = useRef('');

  // Edit Track State
  const [isEditTrackOpen, setIsEditTrackOpen] = useState(false);
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [editTrackForm, setEditTrackForm] = useState<any>({});
  const [isTrackEditSubmitting, setIsTrackEditSubmitting] = useState(false);
  const editTrackSourceRef = useRef<'main' | 'modal'>('modal');

  // Track Selectors States
  const [trackPrimaryArtists, setTrackPrimaryArtists] = useState<Array<{ type: 'system' | 'custom'; id: string; name: string }>>([]);
  const [trackFeaturingArtists, setTrackFeaturingArtists] = useState<Array<{ type: 'system' | 'custom'; id: string; name: string }>>([]);
  const [trackRemixingArtists, setTrackRemixingArtists] = useState<Array<{ type: 'system' | 'custom'; id: string; name: string }>>([]);
  const [trackComposers, setTrackComposers] = useState<Array<{ type: 'system' | 'custom'; id: string; name: string }>>([]);
  const [trackLyricists, setTrackLyricists] = useState<Array<{ type: 'system' | 'custom'; id: string; name: string }>>([]);

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

  // Payment Summary State
  const [paymentSummary, setPaymentSummary] = useState<any>(null);
  const [paymentSummaryLoading, setPaymentSummaryLoading] = useState(false);

  // New States for Inline Admin Actions
  const [editingArtistId, setEditingArtistId] = useState<string | null>(null);
  const [editArtistForm, setEditArtistForm] = useState({ email: '', paypalAccount: '' });
  const [isSavingArtistInfo, setIsSavingArtistInfo] = useState(false);

  useEffect(() => {
    fetchAlbumDetail(true);
    fetchAllArtists();
  }, [albumId]);

  // Synchronize splits state whenever payment summary is loaded/updated
  useEffect(() => {
    if (paymentSummary?.artists) {
      const systemSplits = paymentSummary.artists
        .filter((a: any) => a.artistId)
        .map((a: any) => ({
          artistId: a.artistId,
          percentage: parseFloat(a.percentage as any) || 0
        }));
      setSplits(systemSplits);
    }
  }, [paymentSummary]);

  // Synchronize displayArtist with primary artists on Edit Album Metadata Dialog
  useEffect(() => {
    const primaryArtistsStr = editPrimaryArtists.map(a => a.name.trim()).filter(Boolean).join(', ');

    if (primaryFirstRun.current) {
      primaryFirstRun.current = false;
      prevPrimaryStr.current = primaryArtistsStr;
      // Preserve database value on load
      return;
    }

    if (!editAlbumForm.displayArtist || editAlbumForm.displayArtist === prevPrimaryStr.current) {
      setEditAlbumForm((prev: any) => ({ ...prev, displayArtist: primaryArtistsStr }));
    }
    prevPrimaryStr.current = primaryArtistsStr;
  }, [editPrimaryArtists]);

  const parseArtistsString = (str: string) => {
    const parsed: Array<{ type: 'system' | 'custom'; id: string; name: string }> = [];
    if (str) {
      const names = str.split(',').map((n: string) => n.trim()).filter(Boolean);
      names.forEach((name: string) => {
        const sysArtist = allArtists.find(
          (a: any) =>
            a.name.toLowerCase() === name.toLowerCase() ||
            (a.composerName && a.composerName.toLowerCase() === name.toLowerCase())
        );
        if (sysArtist) {
          parsed.push({ type: 'system', id: sysArtist.id || sysArtist._id, name: sysArtist.name });
        } else {
          parsed.push({ type: 'custom', id: '', name });
        }
      });
    }
    return parsed;
  };

  const formatArtistsString = (artists: Array<{ type: 'system' | 'custom'; id: string; name: string }>, isComposerOrLyricist = false) => {
    return artists
      .map(a => {
        if (a.type === 'system') {
          const sysArtist = allArtists.find(x => x.id === a.id || x._id === a.id);
          if (isComposerOrLyricist && sysArtist) {
            return (sysArtist.composerName || sysArtist.name).trim();
          }
          return a.name.trim();
        }
        return a.name.trim();
      })
      .filter(Boolean)
      .join(', ');
  };

  const updateTrackArtistItem = (
    setter: React.Dispatch<React.SetStateAction<Array<{ type: 'system' | 'custom'; id: string; name: string }>>>,
    list: Array<{ type: 'system' | 'custom'; id: string; name: string }>,
    index: number,
    type: 'system' | 'custom',
    value: string,
    roleLabel: string
  ) => {
    if (type === 'system' && value) {
      const isDuplicate = list.some((a, i) => i !== index && a.type === 'system' && a.id == value);
      if (isDuplicate) {
        const sysArtist = allArtists.find((a: any) => a.id == value || a._id == value);
        alert(`Nghệ sĩ "${sysArtist ? sysArtist.name : ''}" đã được chọn trong vai trò ${roleLabel}! Vui lòng không chọn trùng.`);
        setter(prev => {
          const next = [...prev];
          next[index] = { type: 'system', id: '', name: '' };
          return next;
        });
        return;
      }
    }
    setter(prev => {
      const next = [...prev];
      if (type === 'system') {
        const sysArtist = allArtists.find((a: any) => a.id == value || a._id == value);
        next[index] = {
          type: 'system',
          id: value,
          name: sysArtist ? sysArtist.name : '',
        };
      } else {
        next[index] = {
          type: 'custom',
          id: '',
          name: value,
        };
      }
      return next;
    });
  };

  const updateEditPrimaryArtistItem = (index: number, type: 'system' | 'custom', value: string) => {
    if (type === 'system' && value) {
      const isDuplicate = editPrimaryArtists.some((a, i) => i !== index && a.type === 'system' && a.id === value);
      if (isDuplicate) {
        const sysArtist = allArtists.find((a: any) => a.id === value || a._id === value);
        alert(`Nghệ sĩ "${sysArtist ? sysArtist.name : ''}" đã được chọn làm Primary Artist! Vui lòng không chọn trùng.`);
        setEditPrimaryArtists(prev => {
          const next = [...prev];
          next[index] = { type: 'system', id: '', name: '' };
          return next;
        });
        return;
      }
    }
    setEditPrimaryArtists(prev => {
      const next = [...prev];
      if (type === 'system') {
        const sysArtist = allArtists.find((a: any) => a.id === value || a._id === value);
        next[index] = {
          type: 'system',
          id: value,
          name: sysArtist ? sysArtist.name : '',
        };
      } else {
        next[index] = {
          type: 'custom',
          id: '',
          name: value,
        };
      }
      return next;
    });
  };

  const updateEditFeaturingArtistItem = (index: number, type: 'system' | 'custom', value: string) => {
    if (type === 'system' && value) {
      const isDuplicate = editFeaturingArtists.some((a, i) => i !== index && a.type === 'system' && a.id === value);
      if (isDuplicate) {
        const sysArtist = allArtists.find((a: any) => a.id === value || a._id === value);
        alert(`Nghệ sĩ "${sysArtist ? sysArtist.name : ''}" đã được chọn làm Featuring Artist! Vui lòng không chọn trùng.`);
        setEditFeaturingArtists(prev => {
          const next = [...prev];
          next[index] = { type: 'system', id: '', name: '' };
          return next;
        });
        return;
      }
    }
    setEditFeaturingArtists(prev => {
      const next = [...prev];
      if (type === 'system') {
        const sysArtist = allArtists.find((a: any) => a.id === value || a._id === value);
        next[index] = {
          type: 'system',
          id: value,
          name: sysArtist ? sysArtist.name : '',
        };
      } else {
        next[index] = {
          type: 'custom',
          id: '',
          name: value,
        };
      }
      return next;
    });
  };


  const renderArtistSelectors = (
    label: string,
    list: Array<{ type: 'system' | 'custom'; id: string; name: string }>,
    setter: React.Dispatch<React.SetStateAction<Array<{ type: 'system' | 'custom'; id: string; name: string }>>>,
    roleLabel: string,
    isComposerOrLyricist = false
  ) => {
    return (
      <div className="px-3 py-2.5">
        <label className="text-xs font-medium text-muted-foreground block mb-2">{label}</label>
        <div className="space-y-2">
          {list.map((artist, index) => (
            <div key={index} className="flex items-center gap-2">
              {artist.type === 'system' ? (
                <select
                  value={artist.id}
                  onChange={(e) => updateTrackArtistItem(setter, list, index, 'system', e.target.value, roleLabel)}
                  className="flex-1 bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none"
                  required
                  disabled={isTrackEditSubmitting}
                >
                  <option value="">Select system artist</option>
                  {allArtists.map((a: any) => (
                    <option key={a.id || a._id} value={a.id || a._id}>
                      {a.name} {isComposerOrLyricist && a.composerName ? `(${a.composerName})` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={artist.name}
                  onChange={(e) => updateTrackArtistItem(setter, list, index, 'custom', e.target.value, roleLabel)}
                  placeholder={`Enter custom ${roleLabel.toLowerCase()} name`}
                  className="flex-1 bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none"
                  required
                  disabled={isTrackEditSubmitting}
                />
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setter(prev => prev.filter((_, i) => i !== index));
                }}
                className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                disabled={isTrackEditSubmitting}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setter(p => [...p, { type: 'system', id: '', name: '' }])}
            className="text-xs"
            disabled={isTrackEditSubmitting}
          >
            + Add System {isComposerOrLyricist ? 'Composer/Lyricist' : 'Artist'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setter(p => [...p, { type: 'custom', id: '', name: '' }])}
            className="text-xs"
            disabled={isTrackEditSubmitting}
          >
            + Add Custom Name
          </Button>
        </div>
      </div>
    );
  };

  const handleAddTrack = async () => {
    try {
      const res = await apiClient.addTrack(albumId) as any;
      if (res?.success) {
        fetchAlbumDetail();
      } else {
        alert(res?.message || 'Không thể thêm track mới');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi thêm track mới');
    }
  };

  const handleDeleteTrack = async (trackId: string) => {
    if (!confirm('Are you sure you want to delete this track?')) return;
    try {
      const res = await apiClient.deleteTrack(trackId) as any;
      if (res?.success) {
        alert('Track deleted successfully!');
        fetchAlbumDetail();
      } else {
        alert(res?.message || 'Failed to delete track');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting track');
    }
  };

  const handleStartEditArtist = (artistSummary: any) => {
    setEditingArtistId(artistSummary.artistId);
    setEditArtistForm({
      email: artistSummary.email || '',
      paypalAccount: artistSummary.paypalAccount || '',
    });
  };

  const handleSaveArtistInfo = async (artistId: string) => {
    if (!editArtistForm.email) {
      alert('Email là bắt buộc.');
      return;
    }
    setIsSavingArtistInfo(true);
    try {
      const res = await apiClient.updateArtistAdmin(artistId, {
        email: editArtistForm.email,
        paypalAccount: editArtistForm.paypalAccount,
      }) as any;
      if (res?.success) {
        alert('Cập nhật thông tin thanh toán thành công!');
        setEditingArtistId(null);
        fetchPaymentSummary();
      } else {
        alert(res?.message || 'Cập nhật thất bại');
      }
    } catch (e: any) {
      alert(e.message || 'Lỗi khi cập nhật thông tin');
    } finally {
      setIsSavingArtistInfo(false);
    }
  };



  const fetchPaymentSummary = async () => {
    try {
      setPaymentSummaryLoading(true);
      const res = await apiClient.getAlbumPaymentSummary(albumId) as any;
      if (res?.success && res.data) {
        setPaymentSummary(res.data);
      }
    } catch (err) {
      console.error('Error fetching payment summary:', err);
    } finally {
      setPaymentSummaryLoading(false);
    }
  };

  const fetchAlbumDetail = async (isFirstLoad = false) => {
    try {
      if (isFirstLoad) setLoading(true);
      const res = await apiClient.getAlbumDetail(albumId) as any;
      if (res?.success && res.data) {
        setAlbum(res.data);
        // Initialize edit form with album data
        setEditAlbumForm({
          title: res.data.title,
          releaseDate: res.data.releaseDate ? new Date(res.data.releaseDate).toISOString().split('T')[0] : '',
          barcode: res.data.upc || '',
          albumId: res.data.albumId || '',
          youtubeId: res.data.youtubeId || '',
          coverArt: res.data.coverArt || '',
          displayArtist: res.data.displayArtist || res.data.artistName || '',
          primaryArtists: res.data.primaryArtists || res.data.artistName || '',
          featuringArtists: res.data.featuringArtists || '',
          pYear: res.data.pYear || new Date().getFullYear(),
          cYear: res.data.cYear || new Date().getFullYear(),
          pLine: res.data.pLine || 'Zirect Label',
          cLine: res.data.cLine || 'Zirect Label',
          genre: res.data.genre || '',
          subgenre: res.data.subgenre || '',
        });
        // Fetch payment summary to sync splits and payment details
        fetchPaymentSummary();
      } else {
        console.error('Failed to fetch album:', res);
        setError(res?.message || 'Album not found');
      }
    } catch (err: any) {
      console.error('Error fetching album details:', err);
      setError(err?.message || 'Failed to fetch album details');
    } finally {
      if (isFirstLoad) setLoading(false);
    }
  };

  const handleImageUpload = (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Chỉ hỗ trợ file JPG hoặc PNG.');
      return;
    }

    const img = new Image();
    img.onload = async () => {
      if (img.width < 2000 || img.height < 2000) {
        alert(`Kích thước ảnh quá nhỏ (${img.width}x${img.height}). Yêu cầu tối thiểu 2000x2000px.`);
        return;
      }

      try {
        const res = await apiClient.uploadImage(file, 'zirect/covers') as any;
        if (res?.success && res.data?.url) {
          setEditAlbumForm((prev: any) => ({ ...prev, coverArt: res.data.url }));
        } else {
          throw new Error(res?.message || 'Upload failed');
        }
      } catch (err) {
        alert(`Lỗi upload ảnh cover: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };
    img.onerror = () => alert('Không thể đọc file ảnh. Vui lòng thử lại.');
    img.src = URL.createObjectURL(file);
  };

  const handleOpenEditAlbum = () => {
    primaryFirstRun.current = true;
    prevPrimaryStr.current = '';

    setEditAlbumForm({
      title: album.title,
      releaseDate: album.releaseDate ? new Date(album.releaseDate).toISOString().split('T')[0] : '',
      barcode: album.upc || '',
      albumId: album.albumId || '',
      youtubeId: album.youtubeId || '',
      coverArt: album.coverArt || '',
      displayArtist: album.displayArtist || album.artistName || '',
      primaryArtists: album.primaryArtists || album.artistName || '',
      featuringArtists: album.featuringArtists || '',
      pYear: album.pYear || new Date().getFullYear(),
      cYear: album.cYear || new Date().getFullYear(),
      pLine: album.pLine || 'Zirect Label',
      cLine: album.cLine || 'Zirect Label',
      genre: album.genre || '',
      subgenre: album.subgenre || '',
      tracksCount: album.tracks?.length || 0,
    });

    const parsedPrimary: Array<{ type: 'system' | 'custom'; id: string; name: string }> = [];
    if (album.primaryArtists) {
      const names = album.primaryArtists.split(',').map((n: string) => n.trim()).filter(Boolean);
      names.forEach((name: string) => {
        const sysArtist = allArtists.find((a: any) => a.name.toLowerCase() === name.toLowerCase());
        if (sysArtist) {
          parsedPrimary.push({ type: 'system', id: sysArtist.id || sysArtist._id, name: sysArtist.name });
        } else {
          parsedPrimary.push({ type: 'custom', id: '', name });
        }
      });
    }
    if (parsedPrimary.length === 0 && album.artistId) {
      parsedPrimary.push({ type: 'system', id: album.artistId, name: album.artistName });
    }
    if (parsedPrimary.length === 0) {
      parsedPrimary.push({ type: 'system', id: '', name: '' });
    }
    setEditPrimaryArtists(parsedPrimary);

    const parsedFeaturing: Array<{ type: 'system' | 'custom'; id: string; name: string }> = [];
    if (album.featuringArtists) {
      const names = album.featuringArtists.split(',').map((n: string) => n.trim()).filter(Boolean);
      names.forEach((name: string) => {
        const sysArtist = allArtists.find((a: any) => a.name.toLowerCase() === name.toLowerCase());
        if (sysArtist) {
          parsedFeaturing.push({ type: 'system', id: sysArtist.id || sysArtist._id, name: sysArtist.name });
        } else {
          parsedFeaturing.push({ type: 'custom', id: '', name });
        }
      });
    }
    setEditFeaturingArtists(parsedFeaturing);

    setIsEditAlbumOpen(true);
  };

  const validateMetadataWithApi = async () => {
    // When album is distributed, fetch data from APIs and compare
    if (album.status !== 'distributed') return true;

    const warnings: string[] = [];
    try {
      // Fetch Spotify data if available
      if (album.albumId) {
        const res = await apiClient.getAlbumSpotifyTracks(albumId) as any;
        if (res?.success && res.data) {
          const spotifyAlbum = res.data.album;
          const spotifyTracks = res.data.tracks || [];

          // Compare album-level metadata
          if (spotifyAlbum?.artist && editAlbumForm.displayArtist &&
            spotifyAlbum.artist.toLowerCase() !== editAlbumForm.displayArtist.toLowerCase()) {
            warnings.push(`⚠️ Artist mismatch: Metadata shows "${editAlbumForm.displayArtist}", but Spotify shows "${spotifyAlbum.artist}"`);
          }

          if (spotifyAlbum?.title && editAlbumForm.title &&
            spotifyAlbum.title.toLowerCase() !== editAlbumForm.title.toLowerCase()) {
            warnings.push(`⚠️ Title mismatch: Metadata shows "${editAlbumForm.title}", but Spotify shows "${spotifyAlbum.title}"`);
          }

          if (spotifyAlbum?.releaseDate && editAlbumForm.releaseDate) {
            const spotifyDate = new Date(spotifyAlbum.releaseDate).toISOString().split('T')[0];
            const formDate = new Date(editAlbumForm.releaseDate).toISOString().split('T')[0];
            if (spotifyDate !== formDate) {
              warnings.push(`⚠️ Release date mismatch: Metadata shows "${formDate}", but Spotify shows "${spotifyDate}"`);
            }
          }

          if (spotifyAlbum?.totalTracks && editAlbumForm.tracksCount &&
            spotifyAlbum.totalTracks !== editAlbumForm.tracksCount) {
            warnings.push(`⚠️ Track count mismatch: Metadata shows ${editAlbumForm.tracksCount} tracks, but Spotify shows ${spotifyAlbum.totalTracks} tracks`);
          }

          if (spotifyAlbum?.genres && spotifyAlbum.genres.length > 0 && editAlbumForm.genre) {
            const spotifyGenres = spotifyAlbum.genres.map((g: string) => g.toLowerCase());
            if (!spotifyGenres.includes(editAlbumForm.genre.toLowerCase())) {
              warnings.push(`⚠️ Genre mismatch: Metadata shows "${editAlbumForm.genre}", but Spotify shows "${spotifyAlbum.genres.join(', ')}"`);
            }
          }
        }
      }

      setMetadataValidation({
        hasWarnings: warnings.length > 0,
        warnings
      });
      return warnings.length === 0;
    } catch (e) {
      console.error('Error validating metadata:', e);
      return true;
    }
  };

  const handleSaveEditAlbum = async (e: React.FormEvent) => {
    e.preventDefault();

    const primaryArtistsStr = editPrimaryArtists.map(a => a.name.trim()).filter(Boolean).join(', ');
    const featuringArtistsStr = editFeaturingArtists.map(a => a.name.trim()).filter(Boolean).join(', ') || null;

    if (!primaryArtistsStr) {
      alert('Vui lòng chọn ít nhất một Primary Artist.');
      return;
    }

    const firstSystemArtist = editPrimaryArtists.find(a => a.type === 'system' && a.id);
    if (!firstSystemArtist) {
      alert('Vui lòng chọn ít nhất một nghệ sĩ trong hệ thống làm Primary Artist.');
      return;
    }

    // Check duplicate primary artists
    const artistNames = editPrimaryArtists.map(a => a.name.trim().toLowerCase()).filter(Boolean);
    const uniqueNames = new Set(artistNames);
    if (artistNames.length !== uniqueNames.size) {
      alert('Danh sách Primary Artists không được chứa nghệ sĩ trùng lặp.');
      return;
    }

    // Check duplicate featuring artists
    const featArtistNames = editFeaturingArtists.map(a => a.name.trim().toLowerCase()).filter(Boolean);
    const uniqueFeatNames = new Set(featArtistNames);
    if (featArtistNames.length !== uniqueFeatNames.size) {
      alert('Danh sách Featuring Artists không được chứa nghệ sĩ trùng lặp.');
      return;
    }

    if (album.status !== 'distributed' && editAlbumForm.releaseDate) {
      const selectedDate = new Date(editAlbumForm.releaseDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        alert('Release date không thể trước ngày hiện tại đối với album chưa distributed.');
        return;
      }
    }

    setIsEditSubmitting(true);

    try {
      // Validate metadata before saving
      const isValid = await validateMetadataWithApi();
      if (!isValid && !confirm('There are metadata warnings. Continue anyway?')) {
        setIsEditSubmitting(false);
        return;
      }

      const updateData: any = {
        status: album.status,
        title: editAlbumForm.title,
        releaseDate: editAlbumForm.releaseDate,
        upc: editAlbumForm.barcode || null,
        coverArt: editAlbumForm.coverArt || null,
        artistId: firstSystemArtist.id,
        artistName: firstSystemArtist.name,
        primaryArtists: primaryArtistsStr,
        displayArtist: editAlbumForm.displayArtist,
        featuringArtists: featuringArtistsStr,
        pYear: editAlbumForm.pYear,
        cYear: editAlbumForm.cYear,
        pLine: editAlbumForm.pLine,
        cLine: editAlbumForm.cLine,
        genre: editAlbumForm.genre,
        subgenre: editAlbumForm.subgenre,
      };

      if (editAlbumForm.albumId) updateData.albumId = editAlbumForm.albumId;
      if (editAlbumForm.youtubeId) updateData.youtubeId = editAlbumForm.youtubeId;

      const res = await apiClient.updateAlbumStatus(albumId, album.status, updateData) as any;
      if (res?.success) {
        setIsEditAlbumOpen(false);
        fetchAlbumDetail();
        alert('Album updated successfully');
      } else {
        alert(res?.message || 'Failed to update album');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update album');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleOpenEditTrack = (track: any, source: 'main' | 'modal' = 'modal') => {
    editTrackSourceRef.current = source;
    setEditingTrackId(track.id);
    setEditTrackForm({
      title: track.title,
      isrc: track.isrc || '',
      featuring: track.featuring || '',
      mixTitle: track.mixTitle || '',
      primaryArtists: track.primaryArtists || '',
      remixingArtists: track.remixingArtists || '',
      composers: track.composers || '',
      lyricists: track.lyricists || '',
      language: track.language || '',
      pYear: track.pYear || album.pYear || new Date().getFullYear(),
      cYear: track.cYear || album.cYear || new Date().getFullYear(),
      pLine: track.pLine || album.pLine || '',
      cLine: track.cLine || album.cLine || '',
      genre: track.genre || album.genre || '',
      subgenre: track.subgenre || album.subgenre || '',
      hasExplicitContent: track.hasExplicitContent || false,
    });

    const parsedPrimary = parseArtistsString(track.primaryArtists || album.primaryArtists || '');
    if (parsedPrimary.length === 0) {
      parsedPrimary.push({ type: 'system', id: '', name: '' });
    }
    setTrackPrimaryArtists(parsedPrimary);

    const parsedFeaturing = parseArtistsString(track.featuring || '');
    setTrackFeaturingArtists(parsedFeaturing);

    const parsedRemixing = parseArtistsString(track.remixingArtists || '');
    setTrackRemixingArtists(parsedRemixing);

    const parsedComposers = parseArtistsString(track.composers || '');
    setTrackComposers(parsedComposers);

    const parsedLyricists = parseArtistsString(track.lyricists || '');
    setTrackLyricists(parsedLyricists);

    setIsEditTrackOpen(true);
  };

  const handleSaveEditTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrackId) return;

    const primaryArtistsStr = formatArtistsString(trackPrimaryArtists);
    const featuringArtistsStr = formatArtistsString(trackFeaturingArtists) || null;
    const remixingArtistsStr = formatArtistsString(trackRemixingArtists) || null;
    const composersStr = formatArtistsString(trackComposers, true) || null;
    const lyricistsStr = formatArtistsString(trackLyricists, true) || null;

    if (!primaryArtistsStr) {
      alert('Vui lòng chọn hoặc nhập ít nhất một Primary Artist.');
      return;
    }

    setIsTrackEditSubmitting(true);
    try {
      const fallbackData = {
        title: editTrackForm.title,
        isrc: editTrackForm.isrc || null,
        featuring: featuringArtistsStr,
        mixTitle: editTrackForm.mixTitle || null,
        primaryArtists: primaryArtistsStr,
        remixingArtists: remixingArtistsStr,
        composers: composersStr,
        lyricists: lyricistsStr,
        language: editTrackForm.language || null,
        pYear: editTrackForm.pYear || album.pYear || null,
        cYear: editTrackForm.cYear || album.cYear || null,
        pLine: editTrackForm.pLine || album.pLine || null,
        cLine: editTrackForm.cLine || album.cLine || null,
        genre: editTrackForm.genre || album.genre || null,
        subgenre: editTrackForm.subgenre || album.subgenre || null,
        hasExplicitContent: editTrackForm.hasExplicitContent,
      };

      const res = await apiClient.updateTrackMetadata(editingTrackId, fallbackData) as any;

      if (res?.success) {
        setIsEditTrackOpen(false);
        fetchAlbumDetail();
        fetchPaymentSummary();
      } else {
        alert(res?.message || 'Failed to update track metadata');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update track metadata');
    } finally {
      setIsTrackEditSubmitting(false);
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

  const fetchSpotifyTracks = async () => {
    try {
      setSpotifyTracksLoading(true);
      setSpotifyTracksError(null);
      const res = await apiClient.getAlbumSpotifyTracks(albumId) as any;
      if (res?.success && res.data) {
        setSpotifyTracks(res.data);
        setShowSpotifyTracks(true);
      } else {
        setSpotifyTracksError(res?.message || 'Failed to fetch Spotify tracks');
      }
    } catch (err: any) {
      setSpotifyTracksError(err?.message || 'Failed to fetch Spotify tracks');
    } finally {
      setSpotifyTracksLoading(false);
    }
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
    const validSplits = splits.filter(s => s.artistId);
    const total = validSplits.reduce((sum, s) => sum + s.percentage, 0);
    if (Math.abs(total - 100) > 0.001) {
      alert(`Tổng phần trăm chia sẻ doanh thu phải bằng chính xác 100% (hiện tại là ${total.toFixed(1)}%)`);
      return;
    }
    try {
      const res = await apiClient.updateRevenueSplits(albumId, validSplits) as any;
      if (res?.success) {
        alert('Đã cập nhật tỷ lệ chia sẻ doanh thu thành công!');
        fetchAlbumDetail();
      } else {
        alert(res?.message || 'Cập nhật tỷ lệ chia sẻ thất bại');
      }
    } catch (e: any) {
      alert(e.message || 'Lỗi khi cập nhật tỷ lệ chia sẻ');
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
  const involvedArtists = album?.artist ? [
    { id: album.artist.id, name: `${album.artist.name} (Main Artist)`, avatar: album.artist.avatar },
    ...(album.collaborators?.map((c: any) => ({ id: c.artist.id, name: `${c.artist.name} (${c.role})`, avatar: c.artist.avatar })) || [])
  ] : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/albums" className="p-2 bg-card border border-border rounded-lg hover:bg-accent/10 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tighter">Album Details</h1>
          <p className="text-muted-foreground mt-1">Metadata and revenue splits.</p>
        </div>
      </div>

      <Card className="glass-card p-6 flex flex-col md:flex-row gap-6 items-start">
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
            <span className="font-medium text-lg">{album.displayArtist || album.artistName}</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div><strong className="text-foreground">UPC:</strong> {album.upc || '—'}</div>
            <div><strong className="text-foreground">Release Date:</strong> {album.releaseDate ? new Date(album.releaseDate).toLocaleDateString() : '—'}</div>
            <div><strong className="text-foreground">Status:</strong> <span className={`uppercase text-xs font-bold px-2 py-0.5 rounded-full ${album.status === 'distributed' ? 'bg-green-500/20 text-green-400' :
              album.status === 'approved' ? 'bg-blue-500/20 text-blue-400' :
                album.status === 'submitted' ? 'bg-yellow-500/20 text-yellow-400' :
                  album.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-muted/30 text-muted-foreground'
              }`}>{album.status}</span></div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-border hide-scrollbar">
        <button
          onClick={() => setActiveTab('edit')}
          className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'edit' ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          <Edit2 className="w-4 h-4" /> Edit Metadata & Tracks
        </button>
        <button
          onClick={() => setActiveTab('revenue')}
          className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'revenue' ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          <BarChart3 className="w-4 h-4" /> Revenue Splits & Payouts
        </button>
      </div>

      {/* Tab Content: Edit Album */}
      {activeTab === 'edit' && (
        <div className="space-y-6">
          {/* Edit Album & Tracks Form */}
          <Card className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-lg">Album Metadata</h3>
                <p className="text-sm text-muted-foreground">Edit album information and track details. Metadata on this page is the source of truth.</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleOpenEditAlbum}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Edit2 className="w-4 h-4 mr-2" /> Edit Metadata
                </Button>
              </div>
            </div>

            {/* Display current metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold mb-4 flex items-center gap-2 text-accent">
                  <span className="text-accent">●</span> Album Information
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-muted-foreground">Title:</span>
                    <CopyButton value={album.title} label="Title" />
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-muted-foreground">Display Artist:</span>
                    <CopyButton value={album.displayArtist || album.artistName} label="Display Artist" />
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-muted-foreground">Primary Artists:</span>
                    <CopyButton value={album.primaryArtists} label="Primary Artists" />
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-muted-foreground">Featuring Artists:</span>
                    <CopyButton value={album.featuringArtists || '—'} label="Featuring Artists" />
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-muted-foreground">Release Date:</span>
                    <CopyButton value={album.releaseDate ? new Date(album.releaseDate).toLocaleDateString() : '—'} label="Release Date" />
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-muted-foreground">Barcode (UPC):</span>
                    <CopyButton value={album.upc || '—'} label="Barcode (UPC)" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold mb-4 flex items-center gap-2 text-accent">
                  <span className="text-accent">●</span> Copyright & Catalog
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-muted-foreground">Genre / Subgenre:</span>
                    <CopyButton value={`${album.genre || '—'} / ${album.subgenre || '—'}`} label="Genre/Subgenre" />
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-muted-foreground">P Line:</span>
                    <CopyButton value={album.pLine ? `℗ ${album.pYear || ''} ${album.pLine}` : '—'} label="P Line" />
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-muted-foreground">C Line:</span>
                    <CopyButton value={album.cLine ? `© ${album.cYear || ''} ${album.cLine}` : '—'} label="C Line" />
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-muted-foreground">Spotify Album ID:</span>
                    <CopyButton value={album.albumId || '—'} label="Spotify Album ID" />
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-muted-foreground">YouTube Video ID:</span>
                    <CopyButton value={album.youtubeId || '—'} label="YouTube Video ID" />
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata validation warnings */}
            {metadataValidation.hasWarnings && (
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg space-y-2">
                <p className="font-bold text-yellow-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Metadata Warnings
                </p>
                {metadataValidation.warnings.map((warning, idx) => (
                  <p key={idx} className="text-sm text-yellow-400">{warning}</p>
                ))}
              </div>
            )}

            {/* Tracks Table */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold flex items-center gap-2 text-accent m-0">
                  <span className="text-accent">●</span> Tracks ({album.tracks?.length || 0})
                  <span className="text-xs font-normal text-muted-foreground italic">(Click a row to inspect & copy all metadata fields)</span>
                </h4>
                <Button onClick={handleAddTrack} size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs h-8">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add New Track
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-background/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-2.5 text-left">#</th>
                      <th className="px-4 py-2.5 text-left">Title / Mix Title</th>
                      <th className="px-4 py-2.5 text-left">ISRC</th>
                      <th className="px-4 py-2.5 text-left">Primary Artist(s)</th>
                      <th className="px-4 py-2.5 text-left">Featuring / Remix</th>
                      <th className="px-4 py-2.5 text-left">Genre</th>
                      <th className="px-4 py-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/45">
                    {album.tracks?.map((track: any, idx: number) => {
                      const isExpanded = expandedTrackId === track.id;
                      return (
                        <Fragment key={track.id}>
                          <tr
                            key={track.id}
                            onClick={() => setExpandedTrackId(isExpanded ? null : track.id)}
                            className="hover:bg-accent/5 cursor-pointer transition-colors border-b border-border/10"
                          >
                            <td className="px-4 py-3 font-semibold text-muted-foreground">{track.position || (idx + 1)}</td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-foreground">{track.title}</div>
                              {track.mixTitle && <div className="text-xs text-muted-foreground italic">{track.mixTitle}</div>}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs">
                              {track.isrc ? (
                                <CopyButton value={track.isrc} label="ISRC" />
                              ) : '—'}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground truncate max-w-[150px]" title={track.primaryArtists}>
                              {track.primaryArtists || '—'}
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">
                              {track.featuring && <div>Feat: {track.featuring}</div>}
                              {track.remixingArtists && <div>Remix: {track.remixingArtists}</div>}
                              {!track.featuring && !track.remixingArtists && '—'}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{track.genre || '—'}</td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs text-accent hover:text-accent-foreground hover:bg-accent/20 h-7 px-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditTrack(track, 'main');
                                  }}
                                >
                                  <Edit2 className="w-3 h-3 mr-1" /> Edit
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 px-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTrack(track.id);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs text-accent hover:text-accent-foreground hover:bg-accent/20 h-7 px-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedTrackId(isExpanded ? null : track.id);
                                  }}
                                >
                                  {isExpanded ? 'Hide Details' : 'View Details'}
                                </Button>
                              </div>
                            </td>
                          </tr>

                          {/* Expanded Track Metadata Grid */}
                          {isExpanded && (
                            <tr key={`${track.id}-details`} className="bg-accent/5">
                              <td colSpan={7} className="px-6 py-5 border-l-2 border-accent">
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                                    {/* Column 1: Core Fields */}
                                    <div className="space-y-2.5">
                                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                                        <span className="text-muted-foreground font-medium">Track Title:</span>
                                        <CopyButton value={track.title} label="Track Title" />
                                      </div>
                                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                                        <span className="text-muted-foreground font-medium">Mix Title:</span>
                                        <CopyButton value={track.mixTitle || '—'} label="Mix Title" />
                                      </div>
                                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                                        <span className="text-muted-foreground font-medium">ISRC Code:</span>
                                        <CopyButton value={track.isrc || '—'} label="ISRC" />
                                      </div>
                                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                                        <span className="text-muted-foreground font-medium">Explicit Content:</span>
                                        <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${track.hasExplicitContent ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                                          {track.hasExplicitContent ? 'EXPLICIT' : 'CLEAN'}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Column 2: Credits & Split */}
                                    <div className="space-y-2.5">
                                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                                        <span className="text-muted-foreground font-medium">Primary Artist(s):</span>
                                        <CopyButton value={track.primaryArtists || '—'} label="Primary Artists" />
                                      </div>
                                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                                        <span className="text-muted-foreground font-medium">Featuring Artist(s):</span>
                                        <CopyButton value={track.featuring || '—'} label="Featuring Artists" />
                                      </div>
                                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                                        <span className="text-muted-foreground font-medium">Remix Artist(s):</span>
                                        <CopyButton value={track.remixingArtists || '—'} label="Remix Artists" />
                                      </div>
                                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                                        <span className="text-muted-foreground font-medium">Composer(s):</span>
                                        <CopyButton value={track.composers || '—'} label="Composers" />
                                      </div>
                                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                                        <span className="text-muted-foreground font-medium">Lyricist(s):</span>
                                        <CopyButton value={track.lyricists || '—'} label="Lyricists" />
                                      </div>
                                    </div>

                                    {/* Column 3: Classification & Rights */}
                                    <div className="space-y-2.5">
                                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                                        <span className="text-muted-foreground font-medium">Genre / Subgenre:</span>
                                        <CopyButton value={`${track.genre || '—'} / ${track.subgenre || '—'}`} label="Genre/Subgenre" />
                                      </div>
                                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                                        <span className="text-muted-foreground font-medium">Language:</span>
                                        <CopyButton value={track.language || '—'} label="Language" />
                                      </div>
                                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                                        <span className="text-muted-foreground font-medium">P Line:</span>
                                        <CopyButton value={track.pLine ? `℗ ${track.pYear || ''} ${track.pLine}` : '—'} label="Track P Line" />
                                      </div>
                                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                                        <span className="text-muted-foreground font-medium">C Line:</span>
                                        <CopyButton value={track.cLine ? `© ${track.cYear || ''} ${track.cLine}` : '—'} label="Track C Line" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab Content: Revenue Splits & Payouts */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          {/* Outstanding Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Total Album Revenue</p>
                <h3 className="text-3xl font-extrabold text-foreground">
                  ${(paymentSummary?.totalRevenue || album.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="p-3 bg-accent/10 text-accent rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
            </Card>

            <Card className="glass-card p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Total Paid</p>
                <h3 className="text-3xl font-extrabold text-green-500">
                  ${(paymentSummary?.totalPaid || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="p-3 bg-green-500/10 text-green-500 rounded-xl">
                <CheckCircle className="w-6 h-6" />
              </div>
            </Card>

            <Card className="glass-card p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Outstanding Balance</p>
                <h3 className={`text-3xl font-extrabold ${(paymentSummary?.totalUnpaid || 0) > 0 ? 'text-red-500' : 'text-foreground'}`}>
                  ${(paymentSummary?.totalUnpaid || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className={`p-3 rounded-xl ${(paymentSummary?.totalUnpaid || 0) > 0 ? 'bg-red-500/10 text-red-500' : 'bg-muted/10 text-muted-foreground'}`}>
                <Clock className="w-6 h-6" />
              </div>
            </Card>
          </div>

          {/* Unified Revenue Splits & Payouts Manager */}
          <Card className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-lg">Revenue Splits & Payout Management</h3>
                <p className="text-sm text-muted-foreground">Set each artist's revenue split percentage and update their payment details.</p>
              </div>
              <Button onClick={handleSaveSplits} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Check className="w-4 h-4 mr-2" /> Save Splits
              </Button>
            </div>

            {/* Visual Splits Preview Bar */}
            <div className="mb-6 bg-background/30 p-4 border border-border/50 rounded-xl">
              <div className="flex h-6 rounded-full overflow-hidden bg-background border border-border mb-2">
                {splits.map((split, idx) => {
                  const artistName = paymentSummary?.artists?.find((a: any) => a.artistId === split.artistId)?.name || 'Artist';
                  const colors = ['bg-accent', 'bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
                  return (
                    <div
                      key={split.artistId}
                      style={{ width: `${split.percentage}%` }}
                      className={`${colors[idx % colors.length]} transition-all duration-300`}
                      title={`${artistName}: ${split.percentage}%`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">0%</span>
                <span className={splits.reduce((a, b) => a + b.percentage, 0) === 100 ? "text-green-500" : "text-red-500"}>
                  Total: {splits.reduce((a, b) => a + b.percentage, 0).toFixed(1)}% / 100%
                </span>
              </div>
            </div>

            {/* Single Streamlined Unified Table */}
            <div className="overflow-x-auto border border-border rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-accent/5 border-b border-border">
                  <tr>
                    <th className="px-4 py-3.5 text-left font-bold text-muted-foreground text-xs uppercase tracking-wider">Artist / Role</th>
                    <th className="px-4 py-3.5 text-left font-bold text-muted-foreground text-xs uppercase tracking-wider w-[240px]">Email</th>
                    <th className="px-4 py-3.5 text-left font-bold text-muted-foreground text-xs uppercase tracking-wider w-[200px]">PayPal</th>
                    <th className="px-4 py-3.5 text-center font-bold text-muted-foreground text-xs uppercase tracking-wider w-[120px]">% Split</th>
                    <th className="px-4 py-3.5 text-right font-bold text-muted-foreground text-xs uppercase tracking-wider">Total Share</th>
                    <th className="px-4 py-3.5 text-right font-bold text-muted-foreground text-xs uppercase tracking-wider">Total Paid</th>
                    <th className="px-4 py-3.5 text-right font-bold text-muted-foreground text-xs uppercase tracking-wider">Outstanding</th>
                    <th className="px-4 py-3.5 text-center font-bold text-muted-foreground text-xs uppercase tracking-wider w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paymentSummary?.artists?.map((artistSummary: any, idx: number) => {
                    const outstanding = artistSummary.totalUnpaid || 0;
                    const currentSplit = splits.find(s => s.artistId === artistSummary.artistId)?.percentage || 0;
                    const isEditing = artistSummary.artistId !== null && editingArtistId === artistSummary.artistId;

                    return (
                      <tr key={artistSummary.artistId} className="hover:bg-accent/5 transition-colors">
                        {/* Name & Roles */}
                        <td className="px-4 py-4">
                          <div className="font-bold text-foreground text-sm flex items-center gap-2">
                            <span>{artistSummary.name}</span>
                            {artistSummary.isSystem && artistSummary.email && !artistSummary.email.startsWith('temp_') ? (
                              <span className="text-[9px] font-bold bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded uppercase tracking-wider">System</span>
                            ) : (
                              <span className="text-[9px] font-bold bg-yellow-500/10 text-yellow-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Custom (Needs Update)</span>
                            )}
                          </div>
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {artistSummary.roles?.map((r: string) => (
                              <span key={r} className="text-[9px] font-medium bg-accent/10 text-accent px-1.5 py-0.5 rounded uppercase">{r}</span>
                            ))}
                          </div>
                        </td>

                        {/* Email Address */}
                        <td className="px-4 py-4">
                          {isEditing ? (
                            <input
                              type="email"
                              value={editArtistForm.email}
                              onChange={(e) => setEditArtistForm({ ...editArtistForm, email: e.target.value })}
                              className="w-full bg-background border border-border rounded px-2 py-1 text-xs focus:ring-1 focus:ring-accent focus:outline-none"
                              required
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground truncate block max-w-[220px]" title={artistSummary.email}>
                              {artistSummary.email && !artistSummary.email.startsWith('temp_') ? artistSummary.email : '—'}
                            </span>
                          )}
                        </td>

                        {/* PayPal Account */}
                        <td className="px-4 py-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editArtistForm.paypalAccount}
                              onChange={(e) => setEditArtistForm({ ...editArtistForm, paypalAccount: e.target.value })}
                              className="w-full bg-background border border-border rounded px-2 py-1 text-xs focus:ring-1 focus:ring-accent focus:outline-none"
                            />
                          ) : (
                            <span className="text-xs font-mono text-muted-foreground truncate block max-w-[180px]" title={artistSummary.paypalAccount}>
                              {artistSummary.paypalAccount || '—'}
                            </span>
                          )}
                        </td>

                        {/* Split Percentage Input directly inline! */}
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={currentSplit}
                              onChange={(e) => handleSplitChange(artistSummary.artistId, parseFloat(e.target.value) || 0)}
                              className="w-16 bg-card border border-border rounded px-2 py-1.5 text-xs font-bold text-right focus:ring-1 focus:ring-accent"
                            />
                            <span className="text-muted-foreground text-xs font-bold">%</span>
                          </div>
                        </td>

                        {/* Total Share */}
                        <td className="px-4 py-4 text-right font-semibold text-sm">
                          ${(artistSummary.share || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* Total Paid */}
                        <td className="px-4 py-4 text-right font-semibold text-green-500 text-sm">
                          ${(artistSummary.totalPaid || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* Outstanding Balance */}
                        <td className={`px-4 py-4 text-right font-extrabold text-sm ${outstanding > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                          ${outstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-red-400 hover:bg-red-500/10 rounded"
                                onClick={() => setEditingArtistId(null)}
                                disabled={isSavingArtistInfo}
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-green-400 hover:bg-green-500/10 rounded"
                                onClick={() => handleSaveArtistInfo(artistSummary.artistId)}
                                disabled={isSavingArtistInfo}
                                title="Save"
                              >
                                {isSavingArtistInfo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-4 h-4" />}
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs border-accent/40 text-accent hover:bg-accent/10"
                              onClick={() => {
                                setEditingArtistId(artistSummary.artistId);
                                setEditArtistForm({
                                  email: artistSummary.email && !artistSummary.email.startsWith('temp_') ? artistSummary.email : '',
                                  paypalAccount: artistSummary.paypalAccount || '',
                                });
                              }}
                            >
                              Edit
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {(!paymentSummary?.artists || paymentSummary.artists.length === 0) && (
                    <tr>
                      <td colSpan={8} className="text-center p-8 text-muted-foreground text-sm">
                        No artists found for this album.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-6 flex justify-between items-center border-t border-border pt-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const systemArtistsList = paymentSummary?.artists || [];
                    if (systemArtistsList.length === 0) return;
                    const eq = 100 / systemArtistsList.length;
                    setSplits(systemArtistsList.map((a: any) => ({ artistId: a.artistId, percentage: parseFloat(eq.toFixed(1)) })));
                  }}
                >
                  Split Equally
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const systemArtistsList = paymentSummary?.artists || [];
                    if (systemArtistsList.length === 0) return;
                    setSplits(systemArtistsList.map((a: any) => ({ artistId: a.artistId, percentage: a.artistId === album.artistId ? 100 : 0 })));
                  }}
                >
                  100% to Primary Artist
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Album Metadata Dialog */}
      <Dialog open={isEditAlbumOpen} onOpenChange={setIsEditAlbumOpen}>
        <DialogContent className="glass-card w-[95vw] sm:w-[95vw] max-w-[1600px] sm:max-w-[1600px] h-[92vh] max-h-[92vh] overflow-hidden flex flex-col !p-5">
          <DialogHeader className="flex-shrink-0 pb-3 border-b border-border">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Edit2 className="w-5 h-5 text-accent" /> Edit Album Metadata
              <span className="ml-auto text-xs font-normal text-muted-foreground bg-accent/10 px-2 py-1 rounded">
                {album.title}
              </span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveEditAlbum} className="flex flex-col flex-1 overflow-hidden">
            {/* Metadata Validation Warnings */}
            {metadataValidation.hasWarnings && (
              <div className="flex-shrink-0 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mx-0 mt-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-bold text-yellow-500 text-sm mb-1">Metadata Warnings</h4>
                    <ul className="space-y-0.5 text-xs">
                      {metadataValidation.warnings.map((w, i) => (
                        <li key={i} className="text-yellow-400">{w}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 2-column grid layout - optimized for 1600px width */}
            <div className="flex-1 overflow-y-auto pt-4">
              <div className="grid grid-cols-2 gap-8 text-base">

                {/* Column 1: Basic Info + Artist Info + Classification */}
                <div className="flex flex-col gap-3">
                  {/* Basic Information */}
                  <div>
                    <div className="bg-accent/5 border border-border rounded-t-lg px-4 py-2.5">
                      <span className="font-bold text-accent text-sm uppercase tracking-wider">Basic Information</span>
                    </div>
                    <div className="border border-t-0 border-border rounded-b-lg divide-y divide-border">
                      <div className="grid grid-cols-2 gap-0 divide-x divide-border">
                        <div className="px-3 py-2.5">
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Album Title <span className="text-red-400">*</span></label>
                          <input type="text" value={editAlbumForm.title || ''} onChange={e => setEditAlbumForm({ ...editAlbumForm, title: e.target.value })} className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" required />
                        </div>
                        <div className="px-3 py-2.5">
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Release Date</label>
                          <input type="date" value={editAlbumForm.releaseDate || ''} onChange={e => setEditAlbumForm({ ...editAlbumForm, releaseDate: e.target.value })} className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-0 divide-x divide-border">
                        <div className="px-3 py-2.5">
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Barcode (UPC)</label>
                          <input type="text" value={editAlbumForm.barcode || ''} onChange={e => setEditAlbumForm({ ...editAlbumForm, barcode: e.target.value })} className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" placeholder="e.g. 602557132223" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Artist Information */}
                  <div>
                    <div className="bg-accent/5 border border-border rounded-t-lg px-4 py-2.5">
                      <span className="font-bold text-accent text-sm uppercase tracking-wider">Artist Information</span>
                    </div>
                    <div className="border border-t-0 border-border rounded-b-lg divide-y divide-border">
                      <div className="grid grid-cols-2 gap-0 divide-x divide-border">
                        {/* Primary Artists Multiple Select */}
                        <div className="px-3 py-2.5">
                          <label className="text-xs font-medium text-muted-foreground block mb-2">Primary Artists <span className="text-red-400">*</span></label>
                          <div className="space-y-2">
                            {editPrimaryArtists.map((artist, index) => (
                              <div key={index} className="flex items-center gap-2">
                                {artist.type === 'system' ? (
                                  <select
                                    value={artist.id}
                                    onChange={(e) => updateEditPrimaryArtistItem(index, 'system', e.target.value)}
                                    className="flex-1 bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none"
                                    required
                                    disabled={isEditSubmitting}
                                  >
                                    <option value="">Select system artist</option>
                                    {allArtists.map((a: any) => (
                                      <option key={a.id || a._id} value={a.id || a._id}>{a.name}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    value={artist.name}
                                    onChange={(e) => updateEditPrimaryArtistItem(index, 'custom', e.target.value)}
                                    placeholder="Enter custom artist name"
                                    className="flex-1 bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none"
                                    required
                                    disabled={isEditSubmitting}
                                  />
                                )}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditPrimaryArtists(prev => prev.filter((_, i) => i !== index));
                                  }}
                                  className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                  disabled={editPrimaryArtists.length <= 1 || isEditSubmitting}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setEditPrimaryArtists(p => [...p, { type: 'system', id: '', name: '' }])}
                              className="text-xs"
                              disabled={isEditSubmitting}
                            >
                              + Add System Artist
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setEditPrimaryArtists(p => [...p, { type: 'custom', id: '', name: '' }])}
                              className="text-xs"
                              disabled={isEditSubmitting}
                            >
                              + Add Custom Artist
                            </Button>
                          </div>
                        </div>

                        {/* Featuring Artists Multiple Select */}
                        <div className="px-3 py-2.5">
                          <label className="text-xs font-medium text-muted-foreground block mb-2">Featuring Artists</label>
                          <div className="space-y-2">
                            {editFeaturingArtists.map((artist, index) => (
                              <div key={index} className="flex items-center gap-2">
                                {artist.type === 'system' ? (
                                  <select
                                    value={artist.id}
                                    onChange={(e) => updateEditFeaturingArtistItem(index, 'system', e.target.value)}
                                    className="flex-1 bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none"
                                    required
                                    disabled={isEditSubmitting}
                                  >
                                    <option value="">Select system artist</option>
                                    {allArtists.map((a: any) => (
                                      <option key={a.id || a._id} value={a.id || a._id}>{a.name}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    value={artist.name}
                                    onChange={(e) => updateEditFeaturingArtistItem(index, 'custom', e.target.value)}
                                    placeholder="Enter custom artist name"
                                    className="flex-1 bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none"
                                    required
                                    disabled={isEditSubmitting}
                                  />
                                )}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditFeaturingArtists(prev => prev.filter((_, i) => i !== index));
                                  }}
                                  className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                  disabled={isEditSubmitting}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setEditFeaturingArtists(p => [...p, { type: 'system', id: '', name: '' }])}
                              className="text-xs"
                              disabled={isEditSubmitting}
                            >
                              + Add System Artist
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setEditFeaturingArtists(p => [...p, { type: 'custom', id: '', name: '' }])}
                              className="text-xs"
                              disabled={isEditSubmitting}
                            >
                              + Add Custom Artist
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="px-3 py-2.5">
                        <label className="text-xs font-medium text-muted-foreground block mb-1">Display Artist </label>
                        <input
                          type="text"
                          value={editAlbumForm.displayArtist || ''}
                          onChange={e => setEditAlbumForm({ ...editAlbumForm, displayArtist: e.target.value })}
                          className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none"
                          required
                          disabled={isEditSubmitting}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Classification */}
                  <div>
                    <div className="bg-accent/5 border border-border rounded-t-lg px-4 py-2.5">
                      <span className="font-bold text-accent text-sm uppercase tracking-wider">Classification</span>
                    </div>
                    <div className="border border-t-0 border-border rounded-b-lg divide-y divide-border">
                      <div className="grid grid-cols-2 gap-0 divide-x divide-border">
                        <div className="px-3 py-2.5">
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Genre</label>
                          <input type="text" value={editAlbumForm.genre || ''} onChange={e => setEditAlbumForm({ ...editAlbumForm, genre: e.target.value })} className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" placeholder="e.g. Pop" />
                        </div>
                        <div className="px-3 py-2.5">
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Subgenre</label>
                          <input type="text" value={editAlbumForm.subgenre || ''} onChange={e => setEditAlbumForm({ ...editAlbumForm, subgenre: e.target.value })} className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" placeholder="e.g. Dance Pop" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Copyright + Platform IDs + Cover Art */}
                <div className="flex flex-col gap-3">
                  {/* Copyright & Rights */}
                  <div>
                    <div className="bg-accent/5 border border-border rounded-t-lg px-4 py-2.5">
                      <span className="font-bold text-accent text-sm uppercase tracking-wider">Copyright &amp; Rights</span>
                    </div>
                    <div className="border border-t-0 border-border rounded-b-lg divide-y divide-border">
                      <div className="grid grid-cols-2 gap-0 divide-x divide-border">
                        <div className="px-3 py-2.5">
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Production Year (P)</label>
                          <input type="number" min="1900" max="2100" value={editAlbumForm.pYear || ''} onChange={e => setEditAlbumForm({ ...editAlbumForm, pYear: parseInt(e.target.value) })} className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" />
                        </div>
                        <div className="px-3 py-2.5">
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Copyright Year (C)</label>
                          <input type="number" min="1900" max="2100" value={editAlbumForm.cYear || ''} onChange={e => setEditAlbumForm({ ...editAlbumForm, cYear: parseInt(e.target.value) })} className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" />
                        </div>
                      </div>
                      <div className="px-3 py-2.5">
                        <label className="text-xs font-medium text-muted-foreground block mb-1">Production Line (P)</label>
                        <input type="text" value={editAlbumForm.pLine || ''} onChange={e => setEditAlbumForm({ ...editAlbumForm, pLine: e.target.value })} className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" placeholder="e.g. © 2026 Label Name" />
                      </div>
                      <div className="px-3 py-2.5">
                        <label className="text-xs font-medium text-muted-foreground block mb-1">Copyright Line (C)</label>
                        <input type="text" value={editAlbumForm.cLine || ''} onChange={e => setEditAlbumForm({ ...editAlbumForm, cLine: e.target.value })} className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" placeholder="e.g. ℗ 2026 Label Name" />
                      </div>
                    </div>
                  </div>

                  {/* Platform IDs - always visible for admins */}
                  <div>
                    <div className="bg-accent/5 border border-border rounded-t-lg px-4 py-2.5">
                      <span className="font-bold text-accent text-sm uppercase tracking-wider">Platform IDs</span>
                    </div>
                    <div className="border border-t-0 border-border rounded-b-lg divide-y divide-border">
                      <div className="grid grid-cols-2 gap-0 divide-x divide-border">
                        <div className="px-3 py-2.5">
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Spotify Album ID</label>
                          <input type="text" value={editAlbumForm.albumId || ''} onChange={e => setEditAlbumForm({ ...editAlbumForm, albumId: e.target.value })} className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none font-mono" placeholder="e.g. 4aawyAB9vmqN3uQ7FjRGTy" />
                        </div>
                        <div className="px-3 py-2.5">
                          <label className="text-xs font-medium text-muted-foreground block mb-1">YouTube Music ID</label>
                          <input type="text" value={editAlbumForm.youtubeId || ''} onChange={e => setEditAlbumForm({ ...editAlbumForm, youtubeId: e.target.value })} className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none font-mono" placeholder="e.g. MPREb_Xc4..." />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cover Art */}
                  <div>
                    <div className="bg-accent/5 border border-border rounded-t-lg px-4 py-2.5">
                      <span className="font-bold text-accent text-sm uppercase tracking-wider">Cover Art</span>
                    </div>
                    <div className="border border-t-0 border-border rounded-b-lg divide-y divide-border">
                      <div className="px-4 py-3 flex items-center gap-4">
                        {editAlbumForm.coverArt && (
                          <img src={editAlbumForm.coverArt} alt="Preview" className="w-20 h-20 rounded-lg object-cover border border-border flex-shrink-0" onError={e => (e.currentTarget.style.display = 'none')} />
                        )}
                        <div className="flex-1">
                          <label className="text-sm font-medium text-muted-foreground block mb-1.5">Upload Cover Art (JPG/PNG, ≥ 2000px)</label>
                          <input type="file" accept="image/jpeg,image/png" onChange={e => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); }} className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions - sticky footer */}
            <div className="flex-shrink-0 flex justify-end items-center gap-3 pt-4 mt-2 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsEditAlbumOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-accent text-accent-foreground" disabled={isEditSubmitting}>
                {isEditSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  <><Check className="w-4 h-4 mr-2" /> Save Changes</>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Track Dialog */}
      <Dialog open={isEditTrackOpen} onOpenChange={(open: boolean) => setIsEditTrackOpen(open)}>
        <DialogContent className="glass-card w-[95vw] sm:w-[95vw] max-w-[1600px] sm:max-w-[1600px] h-[92vh] max-h-[92vh] overflow-hidden flex flex-col !p-5">
          <DialogHeader className="flex-shrink-0 pb-3 border-b border-border">
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-accent" /> Edit Track Metadata
              <span className="ml-auto text-xs font-normal text-muted-foreground bg-accent/10 px-2 py-1 rounded">
                Track {editTrackForm.title}
              </span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveEditTrack} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto pt-4">
              <div className="grid grid-cols-2 gap-8 text-base">

                {/* Column 1: Track Info + Credits */}
                <div className="flex flex-col gap-3">
                  {/* Track Information */}
                  <div>
                    <div className="bg-accent/5 border border-border rounded-t-lg px-4 py-2.5">
                      <span className="font-bold text-accent text-sm uppercase tracking-wider">Track Information</span>
                    </div>
                    <div className="border border-t-0 border-border rounded-b-lg divide-y divide-border">
                      <div className="px-3 py-2.5">
                        <label className="text-xs font-medium text-muted-foreground block mb-1">Track Title <span className="text-red-400">*</span></label>
                        <input type="text" value={editTrackForm.title || ''} onChange={e => setEditTrackForm({ ...editTrackForm, title: e.target.value })} className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" required />
                      </div>
                      <div className="px-3 py-2.5">
                        <label className="text-xs font-medium text-muted-foreground block mb-1">Mix Title <span className="text-xs text-muted-foreground font-normal">(e.g. Radio Edit, Extended Mix)</span></label>
                        <input type="text" value={editTrackForm.mixTitle || ''} onChange={e => setEditTrackForm({ ...editTrackForm, mixTitle: e.target.value })} className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" placeholder="e.g. Radio Edit" />
                      </div>
                      <div className="grid grid-cols-2 gap-0 divide-x divide-border">
                        <div className="px-3 py-2.5">
                          <label className="text-xs font-medium text-muted-foreground block mb-1">ISRC Code</label>
                          <input type="text" value={editTrackForm.isrc || ''} onChange={e => setEditTrackForm({ ...editTrackForm, isrc: e.target.value })} className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none font-mono" placeholder="e.g. USRC17607839" />
                        </div>
                        <div className="px-3 py-2.5">
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Language</label>
                          <input type="text" value={editTrackForm.language || ''} onChange={e => setEditTrackForm({ ...editTrackForm, language: e.target.value })} className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" placeholder="e.g. English" />
                        </div>
                      </div>
                      {renderArtistSelectors('Primary Artists *', trackPrimaryArtists, setTrackPrimaryArtists, 'Primary Artist')}
                      {renderArtistSelectors('Remixing Artists', trackRemixingArtists, setTrackRemixingArtists, 'Remixing Artist')}
                      {renderArtistSelectors('Featuring Artists', trackFeaturingArtists, setTrackFeaturingArtists, 'Featuring Artist')}
                    </div>
                  </div>

                  {/* Credits */}
                  <div>
                    <div className="bg-accent/5 border border-border rounded-t-lg px-4 py-2.5">
                      <span className="font-bold text-accent text-sm uppercase tracking-wider">Credits</span>
                    </div>
                    <div className="border border-t-0 border-border rounded-b-lg divide-y divide-border">
                      {renderArtistSelectors('Composers', trackComposers, setTrackComposers, 'Composer', true)}
                      {renderArtistSelectors('Lyricists', trackLyricists, setTrackLyricists, 'Lyricist', true)}
                    </div>
                  </div>
                </div>

                {/* Column 2: Copyright + Classification + Other */}
                <div className="flex flex-col gap-3">
                  {/* Copyright & Rights */}
                  <div>
                    <div className="bg-accent/5 border border-border rounded-t-lg px-4 py-2.5">
                      <span className="font-bold text-accent text-sm uppercase tracking-wider">Copyright &amp; Rights</span>
                    </div>
                    <div className="border border-t-0 border-border rounded-b-lg divide-y divide-border">
                      <div className="grid grid-cols-2 gap-0 divide-x divide-border">
                        <div className="px-3 py-2.5">
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Production Year (P)</label>
                          <input type="number" min="1900" max="2100" value={editTrackForm.pYear || ''} onChange={e => setEditTrackForm({ ...editTrackForm, pYear: parseInt(e.target.value) })} className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" />
                          {!editTrackForm.pYear && album.pYear && (
                            <p className="text-xs text-muted-foreground mt-1">From album: <span className="text-accent">{album.pYear}</span></p>
                          )}
                        </div>
                        <div className="px-3 py-2.5">
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Copyright Year (C)</label>
                          <input type="number" min="1900" max="2100" value={editTrackForm.cYear || ''} onChange={e => setEditTrackForm({ ...editTrackForm, cYear: parseInt(e.target.value) })} className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" />
                          {!editTrackForm.cYear && album.cYear && (
                            <p className="text-xs text-muted-foreground mt-1">From album: <span className="text-accent">{album.cYear}</span></p>
                          )}
                        </div>
                      </div>
                      <div className="px-3 py-2.5">
                        <label className="text-xs font-medium text-muted-foreground block mb-1">Production Line (P)</label>
                        <input type="text" value={editTrackForm.pLine || ''} onChange={e => setEditTrackForm({ ...editTrackForm, pLine: e.target.value })} className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" placeholder="e.g. © 2026 Label Name" />
                        {!editTrackForm.pLine && album.pLine && (
                          <p className="text-xs text-muted-foreground mt-1">From album: <span className="text-accent">{album.pLine}</span></p>
                        )}
                      </div>
                      <div className="px-3 py-2.5">
                        <label className="text-xs font-medium text-muted-foreground block mb-1">Copyright Line (C)</label>
                        <input type="text" value={editTrackForm.cLine || ''} onChange={e => setEditTrackForm({ ...editTrackForm, cLine: e.target.value })} className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" placeholder="e.g. ℗ 2026 Label Name" />
                        {!editTrackForm.cLine && album.cLine && (
                          <p className="text-xs text-muted-foreground mt-1">From album: <span className="text-accent">{album.cLine}</span></p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Classification */}
                  <div>
                    <div className="bg-accent/5 border border-border rounded-t-lg px-4 py-2.5">
                      <span className="font-bold text-accent text-sm uppercase tracking-wider">Classification</span>
                    </div>
                    <div className="border border-t-0 border-border rounded-b-lg divide-y divide-border">
                      <div className="grid grid-cols-2 gap-0 divide-x divide-border">
                        <div className="px-3 py-2.5">
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Genre</label>
                          <input type="text" value={editTrackForm.genre || ''} onChange={e => setEditTrackForm({ ...editTrackForm, genre: e.target.value })} className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" placeholder="e.g. Electronic" />
                          {!editTrackForm.genre && album.genre && (
                            <p className="text-xs text-muted-foreground mt-1">From album: <span className="text-accent">{album.genre}</span></p>
                          )}
                        </div>
                        <div className="px-3 py-2.5">
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Subgenre</label>
                          <input type="text" value={editTrackForm.subgenre || ''} onChange={e => setEditTrackForm({ ...editTrackForm, subgenre: e.target.value })} className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" placeholder="e.g. House" />
                          {!editTrackForm.subgenre && album.subgenre && (
                            <p className="text-xs text-muted-foreground mt-1">From album: <span className="text-accent">{album.subgenre}</span></p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Other */}
                  <div>
                    <div className="bg-accent/5 border border-border rounded-t-lg px-4 py-2.5">
                      <span className="font-bold text-accent text-sm uppercase tracking-wider">Other</span>
                    </div>
                    <div className="border border-t-0 border-border rounded-b-lg px-3 py-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={editTrackForm.hasExplicitContent || false} onChange={e => setEditTrackForm({ ...editTrackForm, hasExplicitContent: e.target.checked })} className="w-4 h-4 rounded accent-accent" />
                        <span className="text-sm font-medium">Explicit Content</span>
                        {editTrackForm.hasExplicitContent && (
                          <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Explicit</span>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions - sticky footer */}
            <div className="flex-shrink-0 flex justify-end gap-3 pt-4 mt-2 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsEditTrackOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-accent text-accent-foreground" disabled={isTrackEditSubmitting}>
                {isTrackEditSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  <><Check className="w-4 h-4 mr-2" /> Save Track</>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>


    </div>
  );
}

