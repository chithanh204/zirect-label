'use client';

import { useState, useEffect, useMemo } from 'react';
import { Music, DollarSign, Loader2, Wallet, History, Eye, CheckCircle2, Copy, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/api';

const PLATFORM_COLORS = ['#1DB954', '#FF0000', '#3b82f6', '#8b5cf6'];

export function DashboardOverview() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Wallet & payments tab states
  const [activeTab, setActiveTab] = useState<'analytics' | 'wallet'>('analytics');
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);

  // Define fetch function before useEffect so it can be referenced
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [albumsRes, profileRes, analyticsRes] = await Promise.all([
        apiClient.getMyAlbums() as any,
        apiClient.getMyArtistProfile() as any,
        apiClient.getAnalytics({ range: '30d' }) as any
      ]);

      if (albumsRes?.success) {
        setAlbums(albumsRes.data || []);
      }
      if (profileRes?.success) {
        setProfile(profileRes.data);
      }
      if (analyticsRes?.success) {
        setAnalyticsData(analyticsRes.data);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoadingPayments(true);
      const res = await apiClient.getMyPayments() as any;
      if (res?.success) {
        setPayments(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load payments', err);
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === 'wallet') {
      fetchPayments();
    }
  }, [activeTab]);

  // Group records by date for the charts
  // All hooks must be declared BEFORE any early returns (Rules of Hooks)
  const dailyStats = useMemo(() => {
    if (!analyticsData?.records) return [];

    const groups: Record<string, { date: string, streams: number, revenue: number }> = {};

    analyticsData.records.forEach((record: any) => {
      const dateStr = new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!groups[dateStr]) {
        groups[dateStr] = { date: dateStr, streams: 0, revenue: 0 };
      }
      groups[dateStr].streams += record.streams;
      groups[dateStr].revenue += record.revenue;
    });

    return Object.values(groups).reverse();
  }, [analyticsData]);

  // Process Platform Share
  const platformData = useMemo(() => {
    if (!analyticsData?.byPlatform) return [];
    const names: Record<string, string> = {
      'spotify': 'Spotify',
      'youtube_music': 'YouTube Music',
    };
    return analyticsData.byPlatform.map((p: any) => ({
      name: names[p.platform] || p.platform.replace(/_/g, ' '),
      value: analyticsData.totalStreams > 0 ? Math.round((p.streams / analyticsData.totalStreams) * 100) : 0,
      revenue: p.revenue,
      streams: p.streams
    })).filter((p: any) => p.streams > 0 || ['Spotify', 'YouTube Music'].includes(p.name));
  }, [analyticsData]);

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

  // Calculate total revenue from all albums
  // An album's revenue for the artist is:
  // (Total Platform Revenue) * (Artist's split percentage)
  let calculatedTotalRevenue = 0;
  
  const albumsWithCalculatedRevenue = albums.map(album => {
    // 1. Calculate total revenue from all platforms for this album
    const albumPlatformRevenue = album.platformRevenues?.reduce((sum: number, r: any) => sum + r.totalRevenue, 0) || 0;
    
    // 2. Find the artist's split percentage for this album
    // If no split is defined, assume 100% if they are the main artist
    let artistShare = 100;
    if (album.revenueSplits && album.revenueSplits.length > 0) {
      const split = album.revenueSplits.find((s: any) => s.artistId === profile?.id);
      if (split) {
        artistShare = split.percentage;
      } else {
        // If splits are defined but the artist is not in it, they get 0%
        artistShare = 0;
      }
    }
    
    // 3. Calculate this artist's actual revenue from this album
    const artistAlbumRevenue = albumPlatformRevenue * (artistShare / 100);
    
    calculatedTotalRevenue += artistAlbumRevenue;
    
    return {
      ...album,
      artistAlbumRevenue
    };
  });

  const totalStreams = profile?.totalStreams || albums.reduce((sum, album) => sum + (album.totalStreams || 0), 0);
  const totalRevenue = profile?.totalRevenue || calculatedTotalRevenue; 
  const distributedAlbums = albums.filter(a => a.status === 'distributed').length;

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex border-b border-accent/15">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 ${
            activeTab === 'analytics'
              ? 'border-accent text-accent'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Overview & Analytics
        </button>
        <button
          onClick={() => setActiveTab('wallet')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'wallet'
              ? 'border-accent text-accent'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Wallet className="w-4 h-4" />
          Wallet & Payouts
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Available Balance */}
        <Card className="glass-card p-6 border-emerald-400/20 bg-emerald-500/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1 text-emerald-400 font-semibold">Available Balance</p>
              <p className="text-2xl font-black text-emerald-400">
                £{(profile?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-400/10 border border-emerald-400/20 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Ready for PayPal payout</p>
        </Card>

        {/* Total Paid */}
        <Card className="glass-card p-6 border-blue-400/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Paid</p>
              <p className="text-2xl font-bold text-foreground">
                £{(profile?.totalPaid || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-400/10 border border-blue-400/20 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Successfully paid via PayPal</p>
        </Card>

        {/* Lifetime Revenue */}
        <Card className="glass-card p-6 border-sky-400/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Lifetime Earnings</p>
              <p className="text-2xl font-bold">
                £{(profile?.totalRevenue || totalRevenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-10 h-10 bg-sky-400/10 border border-sky-400/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">All-time streaming revenue</p>
        </Card>
      </div>


      {/* Recent Albums */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Recent <span className="gradient-text-cyan">Releases</span></h2>
          <div className="space-y-3">
            {albumsWithCalculatedRevenue.length === 0 ? (
              <Card className="glass-card p-8 text-center text-muted-foreground border-dashed border-accent/20">
                No albums released yet.
              </Card>
            ) : (
              albumsWithCalculatedRevenue.slice(0, 5).map((album) => {
                return (
                  <Card key={album.id} className="glass-card p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg">{album.title}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium uppercase border ${
                            album.status === 'distributed' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' :
                            album.status === 'draft' ? 'bg-gray-500/15 text-gray-400 border-gray-500/20' :
                            'bg-amber-500/15 text-amber-400 border-amber-500/20'
                          }`}>
                            {album.status === 'draft' ? 'MAKING COVER ART' : album.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>UPC: <span className="font-mono text-foreground">{album.upc || 'Pending'}</span></p>
                          <p>Released: {album.releaseDate ? new Date(album.releaseDate).toLocaleDateString() : 'TBA'}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 sm:text-right">
                        <div>
                          <p className="text-xs text-muted-foreground">Streams</p>
                          <p className="font-bold text-accent">
                            {album.totalStreams >= 1000000 
                              ? `${(album.totalStreams / 1000000).toFixed(1)}M` 
                              : album.totalStreams >= 1000 
                                ? `${(album.totalStreams / 1000).toFixed(1)}K` 
                                : (album.totalStreams || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Your Revenue</p>
                          <p className="font-bold text-accent">
                            ${album.artistAlbumRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Tracks</p>
                          <p className="font-bold">{album.tracks?.length || 0}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Wallet Tab */}
      {activeTab === 'wallet' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {/* Wallet Summary */}
          <div className="glass-card rounded-xl p-6 border border-accent/15 space-y-6 h-fit bg-[rgba(8,20,45,0.25)]">
            <h3 className="text-lg font-bold text-accent">Payout Information</h3>
            
            <div className="space-y-4">
              <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Payment Method</p>
                <p className="text-sm font-semibold mt-1">PayPal</p>
              </div>
              
              <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Recipient Account</p>
                <p className="text-sm font-mono font-semibold truncate mt-1 text-foreground">
                  {profile?.paypalAccount || 'PayPal Not Linked (Go to Settings)'}
                </p>
              </div>

              <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Verification Status</p>
                <div className="mt-1">
                  {profile?.paymentVerificationStatus === 'verified' && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-green-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Verified & Ready
                    </span>
                  )}
                  {profile?.paymentVerificationStatus === 'pending' && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-yellow-400 font-semibold">
                      Pending Verification
                    </span>
                  )}
                  {(!profile?.paymentVerificationStatus || profile?.paymentVerificationStatus === 'unverified') && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-red-400 font-semibold">
                      Unverified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payout History */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <History className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-bold">Payout History</h3>
            </div>

            <Card className="glass-card border-accent/10 overflow-hidden">
              {loadingPayments ? (
                <div className="p-12 text-center text-muted-foreground">Loading payout logs...</div>
              ) : payments.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground space-y-2">
                  <p>No payouts recorded yet.</p>
                  <p className="text-xs text-muted-foreground">Payments processed by the label will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[rgba(8,20,45,0.4)] text-muted-foreground uppercase tracking-wider font-bold border-b border-accent/10">
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">PayPal Email</th>
                        <th className="px-4 py-3">Transaction ID</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-4 py-3 text-center">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-accent/10">
                      {payments.map((p) => (
                        <tr key={p.id} className="hover:bg-accent/5 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">{new Date(p.paidAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3 font-mono">{p.paypalAccount}</td>
                          <td className="px-4 py-3 font-mono">
                            <div className="flex items-center gap-1">
                              <span className="truncate max-w-[120px]">{p.transactionId}</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(p.transactionId);
                                  setCopiedTxId(p.id);
                                  setTimeout(() => setCopiedTxId(null), 2000);
                                }}
                                className="text-muted-foreground hover:text-accent p-0.5"
                              >
                                {copiedTxId === p.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-green-400">£{p.amount.toFixed(2)}</td>
                          <td className="px-4 py-3 text-center">
                            {p.receiptUrl ? (
                              <a
                                href={p.receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline font-semibold"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View Receipt</span>
                              </a>
                            ) : (
                              <span className="text-muted-foreground/60 italic">N/A</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
