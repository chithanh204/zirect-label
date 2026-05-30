'use client';

import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/admin/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, Music, Play, ExternalLink, Activity, ArrowUpRight, Award, Flame, Loader2, ShieldAlert } from 'lucide-react';

interface AlbumRevenueInfo {
  id: string;
  title: string;
  artistName: string;
  coverArt: string | null;
  revenue: number;
  totalStreams: number;
  averageStreamValue: number;
}

interface TrendingReleaseInfo {
  id: string;
  title: string;
  isrc: string | null;
  revenue: number;
  albumId: string;
  albumTitle: string;
  artistName: string;
  spotifyUrl: string | null;
  spotifyId: string | null;
  popularity: number;
  imageUrl: string | null;
}

interface MonthlyRevenueData {
  month: string;
  revenue: number;
}

interface PlatformBreakdownData {
  platform: string;
  revenue: number;
  percentage: number;
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for API data
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalStreams, setTotalStreams] = useState(0);
  const [topAlbums, setTopAlbums] = useState<AlbumRevenueInfo[]>([]);
  const [trendingReleases, setTrendingReleases] = useState<TrendingReleaseInfo[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueData[]>([]);
  const [platformBreakdown, setPlatformBreakdown] = useState<PlatformBreakdownData[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('authToken') || undefined;
        const res: any = await apiClient.getAdminAnalytics(token);

        if (res && res.success && res.data) {
          setTotalRevenue(res.data.totalRevenue || 0);
          setTotalStreams(res.data.totalStreams || 0);
          setTopAlbums(res.data.topAlbums || []);
          setTrendingReleases(res.data.trendingReleases || []);
          setPlatformBreakdown(res.data.platformBreakdown || []);

          // Sort monthly revenue chronologically
          const sortedMonthly = (res.data.monthlyRevenue || []).sort((a: any, b: any) =>
            a.month.localeCompare(b.month)
          );
          setMonthlyRevenue(sortedMonthly);
        } else {
          setError('Failed to load analytics data from API.');
        }
      } catch (err: any) {
        console.error('Failed to load admin analytics:', err);
        setError(err.message || 'Failed to connect to the backend server.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Format currency helpers
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value);
  };

  // Format stream numbers helper
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  // Chart Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 rounded-lg border border-accent/15 shadow-xl text-sm">
          <p className="font-bold text-accent">{payload[0].payload.month}</p>
          <p className="text-foreground mt-1">
            Revenue: <span className="font-semibold text-emerald-400">{formatCurrency(payload[0].value)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex h-screen art-bg-admin">
        <div className="fixed inset-0 bg-[rgba(2,8,23,0.82)] pointer-events-none z-0" />
        <AdminSidebar />
        <main className="flex-1 md:ml-64 flex items-center justify-center relative z-10">
          <div className="text-center space-y-4">
            <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto" />
            <p className="text-muted-foreground text-sm font-medium">Generating premium analytics dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen art-bg-admin">
        <div className="fixed inset-0 bg-[rgba(2,8,23,0.82)] pointer-events-none z-0" />
        <AdminSidebar />
        <main className="flex-1 md:ml-64 flex items-center justify-center p-8 relative z-10">
          <Card className="glass max-w-lg w-full border-red-500/25 p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-xl font-bold">Analytics Loading Failed</h2>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-accent text-accent-foreground hover:bg-accent/90">
              Retry Connection
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen art-bg-admin">
      {/* Ambient dark overlay for perfect text contrast */}
      <div className="fixed inset-0 bg-[rgba(2,8,23,0.82)] pointer-events-none z-0" />
      <AdminSidebar />

      <main className="flex-1 md:ml-64 overflow-auto relative z-10">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-8 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold tracking-tighter">Admin <span className="gradient-text-cyan">Analytics</span></h1>
                <p className="text-muted-foreground mt-2">Comprehensive reports on label distribution streams, platform earnings, and trending releases.</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full border border-accent/20 bg-accent/5 w-fit h-fit text-accent">
                System Active
              </span>
            </div>

            {/* Monthly Revenue Bar Chart */}
            <Card className="glass border-accent/15 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Monthly Revenue Flows</CardTitle>
                    <CardDescription>Visual chart overview of catalog earnings imported monthly.</CardDescription>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium bg-accent/5 border border-accent/10 px-2.5 py-1 rounded">
                    Recharts Analytics Active
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {monthlyRevenue.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-accent/15 rounded-xl bg-accent/5">
                    <DollarSign className="w-10 h-10 text-accent/30 mx-auto mb-3" />
                    <h4 className="font-semibold mb-1">No monthly revenue data available</h4>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">Please import monthly distribution reports in Excel format under the Revenue section first.</p>
                  </div>
                ) : (
                  <div className="w-full h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={monthlyRevenue}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        {/* Define gradients for modern bars */}
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.85} />
                            <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.35} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis
                          dataKey="month"
                          stroke="rgba(255,255,255,0.4)"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="rgba(255,255,255,0.4)"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(val) => `$${formatNumber(val)}`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                        <Bar
                          dataKey="revenue"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={45}
                        >
                          {monthlyRevenue.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill="url(#barGradient)" />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats Grid - Total Revenue only */}
            <div className="grid grid-cols-1 gap-6">
              {/* Total Revenue */}
              <Card className="glass border-emerald-500/10 hover:border-emerald-500/25 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-24 h-24 bg-emerald-500/5 group-hover:bg-emerald-500/10 rounded-full blur-xl transition-all" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium group-hover:text-emerald-300 transition-colors">Total Revenue</p>
                      <p className="text-3xl font-extrabold tracking-tight mt-2 text-foreground">{formatCurrency(totalRevenue)}</p>
                      <p className="text-xs text-muted-foreground mt-2">Aggregated earnings across all releases</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <DollarSign className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Double List Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Profitable Albums */}
              <Card className="glass border-accent/15 shadow-xl">
                <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-4 border-b border-accent/10 mb-4">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Award className="w-5 h-5 text-accent" />
                      Top Profitable Albums
                    </CardTitle>
                    <CardDescription>Albums generating the highest yields.</CardDescription>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-accent/20 bg-accent/5 uppercase text-accent">
                    Revenue-Ranked
                  </span>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  {topAlbums.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-sm">No albums available for revenue ranking.</div>
                  ) : (
                    <div className="space-y-4">
                      {topAlbums.map((album, index) => (
                        <div
                          key={album.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-accent/5 bg-accent/5 hover:bg-accent/10 hover:border-accent/25 transition-all group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Rank Badge */}
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${index === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                index === 1 ? 'bg-zinc-300/20 text-zinc-300 border border-zinc-400/30' :
                                  index === 2 ? 'bg-orange-700/20 text-orange-400 border border-orange-700/30' :
                                    'bg-accent/5 text-muted-foreground border border-accent/10'
                              }`}>
                              {index + 1}
                            </span>

                            {/* Cover Art */}
                            <div className="w-10 h-10 bg-accent/10 border border-accent/15 rounded overflow-hidden flex items-center justify-center flex-shrink-0 relative">
                              {album.coverArt ? (
                                <img src={album.coverArt} alt={album.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                              ) : (
                                <Music className="w-5 h-5 text-accent/35" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <h4 className="font-bold text-sm truncate text-foreground group-hover:text-accent transition-colors">{album.title}</h4>
                              <p className="text-[11px] text-muted-foreground truncate">{album.artistName}</p>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0 ml-4">
                            <span className="font-extrabold text-sm text-emerald-400 block">{formatCurrency(album.revenue)}</span>
                            <span className="text-[10px] text-muted-foreground block mt-0.5">{formatNumber(album.totalStreams)} streams</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Spotify Popularity Trending Releases */}
              <Card className="glass border-accent/15 shadow-xl">
                <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-4 border-b border-accent/10 mb-4">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Flame className="w-5 h-5 text-[#1DB954]" />
                      Trending Releases
                    </CardTitle>
                    <CardDescription>Popular tracks on Spotify resolved dynamically.</CardDescription>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-[#1DB954]/20 bg-[#1DB954]/5 uppercase text-[#1DB954]">
                    Spotify Popularity
                  </span>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  {trendingReleases.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-accent/10 rounded-xl bg-accent/5">
                      <Flame className="w-8 h-8 text-accent/30 mx-auto mb-2 animate-pulse" />
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">No trending releases found. Trending releases are auto-resolved from distributed tracks that have valid Spotify links.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {trendingReleases.map((release) => (
                        <div
                          key={release.id}
                          className="p-3.5 rounded-lg border border-accent/5 bg-accent/5 hover:bg-accent/10 hover:border-accent/25 transition-all group space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Track Art Preview */}
                              <div className="w-9 h-9 bg-accent/10 border border-accent/15 rounded overflow-hidden flex items-center justify-center flex-shrink-0">
                                {release.imageUrl ? (
                                  <img src={release.imageUrl} alt={release.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                ) : (
                                  <Music className="w-4 h-4 text-accent/35" />
                                )}
                              </div>

                              <div className="min-w-0">
                                <h4 className="font-bold text-sm truncate text-foreground group-hover:text-accent transition-colors">{release.title}</h4>
                                <p className="text-[11px] text-muted-foreground truncate">{release.artistName} • {release.albumTitle}</p>
                              </div>
                            </div>

                            {/* Spotify Link */}
                            {release.spotifyUrl && (
                              <a
                                href={release.spotifyUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="w-7 h-7 rounded-full bg-[#1DB954]/10 hover:bg-[#1DB954]/20 border border-[#1DB954]/25 flex items-center justify-center text-[#1DB954] transition-all"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>

                          {/* Popularity Score Progress Bar */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-muted-foreground font-medium">Spotify Popularity index</span>
                              <span className="font-extrabold text-[#1DB954]">{release.popularity}/100</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-accent/10 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#1DB954] shadow-[0_0_8px_rgba(29,185,84,0.4)] transition-all duration-500"
                                style={{ width: `${release.popularity}%` }}
                              />
                            </div>
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
      </main>
    </div>
  );
}
