'use client';

import { useEffect, useState } from 'react';
import { Users, Music, TrendingUp, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/api';

interface DashboardStats {
  totalArtists: number;
  activeArtists: number;
  pendingArtists: number;
  blockedArtists: number;
  totalStreams: number;
  totalRevenue: number;
  totalAlbums: number;
  distributedAlbums: number;
  averageFollowers: number;
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

        if (dashboardRes.success && dashboardRes.data?.stats) {
          setStats(dashboardRes.data.stats);

          if (dashboardRes.data?.recentActivities) {
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
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  const dashboardStats = [
    {
      label: 'Total Artists',
      value: stats?.totalArtists || '0',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Total Albums',
      value: stats?.totalAlbums || '0',
      icon: Music,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      label: 'Total Streams',
      value: `${(stats?.totalStreams || 0) / 1000000}M`,
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      label: 'Total Revenue',
      value: `$${(stats?.totalRevenue || 0) / 1000}K`,
      icon: DollarSign,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    }
  ];
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="bg-card border-border p-6 hover:border-accent/40 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border p-6">
            <h2 className="text-xl font-bold mb-6">Recent Activities</h2>
            <div className="space-y-4">
              {activities && activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{activity.artist}</p>
                      <p className="text-sm text-muted-foreground truncate">{activity.title}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-xs font-bold px-2 py-1 rounded ${activity.status === 'distributed' ? 'bg-green-500/20 text-green-500' :
                        activity.status === 'pending_review' ? 'bg-yellow-500/20 text-yellow-500' :
                          activity.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                            'bg-blue-500/20 text-blue-500'
                        }`}>
                        {activity.status.replace(/_/g, ' ').toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No activities yet</p>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-card border-border p-6">
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium">
              Add New Artist
            </button>
            <button className="w-full px-4 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors text-sm font-medium">
              Review Pending Albums
            </button>
            <button className="w-full px-4 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors text-sm font-medium">
              Generate Revenue Report
            </button>
            <button className="w-full px-4 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors text-sm font-medium">
              Edit Label Info
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
