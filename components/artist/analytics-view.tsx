'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

export function AnalyticsView() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getAnalytics({ range: timeRange }) as any;
      if (res?.success) {
        setData(res.data);
      } else {
        setError(res?.message || 'Failed to load analytics');
      }
    } catch (err) {
      setError('Error fetching analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Group records by date for the charts
  const dailyStats = useMemo(() => {
    if (!data?.records) return [];
    
    const groups: Record<string, { date: string, streams: number, revenue: number }> = {};
    
    data.records.forEach((record: any) => {
      const dateStr = new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!groups[dateStr]) {
        groups[dateStr] = { date: dateStr, streams: 0, revenue: 0 };
      }
      groups[dateStr].streams += record.streams;
      groups[dateStr].revenue += record.revenue;
    });
    
    // Convert to array and sort by date (simple sort for now)
    return Object.values(groups).reverse(); // reverse because they come in desc order from backend
  }, [data]);

  // Process top tracks (using backend records or adding a dedicated endpoint)
  // For now, let's group by album/track in records
  const topTracks = useMemo(() => {
    if (!data?.records) return [];
    
    const tracks: Record<string, { title: string, streams: number, revenue: number }> = {};
    
    data.records.forEach((record: any) => {
      const key = record.albumId || 'unknown';
      if (!tracks[key]) {
        // Since we don't have track titles in the analytics records directly, 
        // we might need more info. But for now, let's use what we have.
        tracks[key] = { title: record.album?.title || 'Release #' + key.slice(-4), streams: 0, revenue: 0 };
      }
      tracks[key].streams += record.streams;
      tracks[key].revenue += record.revenue;
    });
    
    return Object.values(tracks).sort((a, b) => b.streams - a.streams).slice(0, 5);
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 bg-red-500/10 p-4 rounded-lg border border-red-500/20">
        {error}
      </div>
    );
  }

  const platformData = data?.byPlatform?.map((p: any) => {
    const names: Record<string, string> = {
      'spotify': 'Spotify',
      'apple_music': 'Apple Music',
      'youtube_music': 'YouTube Music',
      'tiktok': 'TikTok'
    };
    return {
      name: names[p.platform] || p.platform.replace(/_/g, ' '),
      value: data.totalRevenue > 0 ? Math.round((p.revenue / data.totalRevenue) * 100) : 0,
      revenue: p.revenue,
      streams: p.streams
    };
  }).filter((p: any) => p.revenue > 0 || p.streams > 0 || ['Spotify', 'Apple Music', 'YouTube Music', 'TikTok'].includes(p.name)) || [];

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <Card className="bg-card border-border p-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-muted-foreground" />
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-background border border-border rounded text-sm px-3 py-1 focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 3 months</option>
          <option value="1y">Last year</option>
          <option value="all">All time</option>
        </select>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Streams</p>
          <p className="text-2xl font-bold">
            {data?.totalStreams >= 1000000 
              ? `${(data.totalStreams / 1000000).toFixed(1)}M` 
              : data?.totalStreams >= 1000 
                ? `${(data.totalStreams / 1000).toFixed(1)}K` 
                : (data?.totalStreams || 0).toLocaleString()}
          </p>
          <p className="text-xs text-green-500 flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3" />
            Active performance
          </p>
        </Card>
        <Card className="bg-card border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Unpaid Balance</p>
          <p className="text-2xl font-bold text-accent">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data?.totalRevenue || 0)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Pending payments
          </p>
        </Card>
        <Card className="bg-card border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Avg per Stream</p>
          <p className="text-2xl font-bold">${data?.averageStreamValue?.toFixed(4) || '0.0000'}</p>
          <p className="text-xs text-muted-foreground mt-2">Estimated earnings</p>
        </Card>
        <Card className="bg-card border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Active Platforms</p>
          <p className="text-2xl font-bold">4</p>
          <p className="text-xs text-muted-foreground mt-2">Spotify, Apple, YT, TikTok</p>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <Card className="lg:col-span-2 bg-card border-border p-6">
          <h3 className="text-lg font-bold mb-4">Streams Over Time</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="streams" 
                  stroke="var(--color-accent)" 
                  strokeWidth={2}
                  name="Streams"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pie Chart */}
        <Card className="bg-card border-border p-6">
          <h3 className="text-lg font-bold mb-4">Platform Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => value > 0 ? `${name} ${value}%` : ''}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {platformData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="bg-card border-border p-6">
        <h3 className="text-lg font-bold mb-4">Revenue Trend</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }} />
              <Legend />
              <Bar 
                dataKey="revenue" 
                fill="var(--color-accent)" 
                name="Revenue ($)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Top Releases */}
      <Card className="bg-card border-border p-6">
        <h3 className="text-lg font-bold mb-4">Top Releases by Performance</h3>
        <div className="space-y-3">
          {topTracks.map((track: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-background rounded-lg hover:bg-accent/5 transition-colors">
              <div className="flex-1">
                <p className="font-bold">{track.title}</p>
                <p className="text-sm text-muted-foreground">
                  {track.streams >= 1000 ? `${(track.streams / 1000).toFixed(1)}K` : track.streams} streams
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-accent">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(track.revenue)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
