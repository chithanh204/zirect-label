'use client';

import { useEffect, useState } from 'react';
import { Users, Music, FileText, ChevronRight, Activity as ActivityIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import Link from 'next/link';

interface DashboardStats {
  totalArtists: number;
  activeArtists: number;
  totalAlbums: number;
  distributedAlbums: number;
}

interface Activity {
  id: string;
  type: string;
  artist: string;
  title: string;
  timestamp: string;
  status: string;
}

export function AdminDashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const dashboardRes = await apiClient.getDashboardData() as any;

        if (dashboardRes.success && dashboardRes.data) {
          setStats(dashboardRes.data.stats);
          if (dashboardRes.data.recentActivities) {
            setActivities(dashboardRes.data.recentActivities);
          }
        } else {
          setError('Invalid dashboard data format');
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading dashboard overview...</div>;
  }

  if (error) {
    return <div className="text-red-400 text-center py-8 glass-card rounded-lg p-4 max-w-lg mx-auto">{error}</div>;
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Artists Card */}
        <Link href="/admin/artists" className="block group">
          <Card className="glass p-6 border-cyan-400/10 hover:border-cyan-400/30 transition-all duration-300 hover:shadow-[0_8px_25px_rgba(34,211,238,0.1)] relative overflow-hidden h-full">
            {/* Ambient hover glow */}
            <div className="absolute -right-10 -top-10 w-24 h-24 bg-cyan-400/5 group-hover:bg-cyan-400/10 rounded-full blur-xl transition-all" />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm text-muted-foreground mb-1 group-hover:text-cyan-300 transition-colors font-medium">Total Artists</p>
                <p className="text-4xl font-bold tracking-tight text-foreground">{stats?.totalArtists || 0}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  <span className="text-cyan-400 font-semibold">{stats?.activeArtists || 0}</span> active profiles
                </p>
              </div>
              <div className="w-12 h-12 bg-cyan-400/10 rounded-xl flex items-center justify-center border border-cyan-400/20 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </Card>
        </Link>

        {/* Total Albums Card */}
        <Link href="/admin/albums" className="block group">
          <Card className="glass p-6 border-blue-400/10 hover:border-blue-400/30 transition-all duration-300 hover:shadow-[0_8px_25px_rgba(59,130,246,0.1)] relative overflow-hidden h-full">
            <div className="absolute -right-10 -top-10 w-24 h-24 bg-blue-400/5 group-hover:bg-blue-400/10 rounded-full blur-xl transition-all" />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm text-muted-foreground mb-1 group-hover:text-blue-300 transition-colors font-medium">Total Albums</p>
                <p className="text-4xl font-bold tracking-tight text-foreground">{stats?.totalAlbums || 0}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  <span className="text-blue-400 font-semibold">{stats?.distributedAlbums || 0}</span> distributed albums
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-400/10 rounded-xl flex items-center justify-center border border-blue-400/20 group-hover:scale-110 transition-transform">
                <Music className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </Card>
        </Link>

        {/* Reports Card */}
        <Link href="/admin/reports" className="block group">
          <Card className="glass p-6 border-rose-400/10 hover:border-rose-400/30 transition-all duration-300 hover:shadow-[0_8px_25px_rgba(251,113,133,0.1)] relative overflow-hidden h-full">
            <div className="absolute -right-10 -top-10 w-24 h-24 bg-rose-400/5 group-hover:bg-rose-400/10 rounded-full blur-xl transition-all" />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm text-muted-foreground mb-1 group-hover:text-rose-300 transition-colors font-medium">Reports Center</p>
                <p className="text-4xl font-bold tracking-tight text-foreground">Flags</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Contracts, discrepancies, and schedules
                </p>
              </div>
              <div className="w-12 h-12 bg-rose-400/10 rounded-xl flex items-center justify-center border border-rose-400/20 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-rose-400" />
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Activities Section (Full-width) */}
      <Card className="glass border-accent/15 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-accent/10">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ActivityIcon className="w-5 h-5 text-accent" />
            Recent <span className="gradient-text-cyan">Activities</span>
          </h2>
          <span className="text-xs text-muted-foreground font-medium">Sorted by newest updates</span>
        </div>

        <div className="space-y-1">
          {activities && activities.length > 0 ? (
            activities.map((activity) => (
              <Link
                key={activity.id}
                href={`/admin/albums/${activity.id}`}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-accent/5 border border-transparent hover:border-accent/10 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Subtle pulsing indicator */}
                  <div className="w-2.5 h-2.5 rounded-full bg-accent flex-shrink-0 shadow-[0_0_8px_rgba(0,212,255,0.6)] animate-pulse" />
                  <div className="min-w-0">
                    <p className="font-bold text-foreground truncate text-sm group-hover:text-accent transition-colors">{activity.title}</p>
                    <p className="text-xs text-muted-foreground truncate mt-1">Managed under the Zirect Label catalog</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                  <div className="text-right">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                      activity.status === 'distributed' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' :
                      activity.status === 'submitted' ? 'bg-amber-500/15 text-amber-400 border-amber-500/20' :
                      activity.status === 'approved' ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20' :
                      activity.status === 'rejected' ? 'bg-red-500/15 text-red-400 border-red-500/20' :
                      'bg-accent/15 text-accent border-accent/20'
                    }`}>
                      {activity.status.replace(/_/g, ' ')}
                    </span>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(activity.timestamp).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-12 border border-dashed border-accent/10 rounded-xl bg-accent/5">
              <p className="text-muted-foreground text-sm">No recent activities available</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
