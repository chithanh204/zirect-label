'use client';

import { TrendingUp, Music, Volume2, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';

const albumData = [
  {
    id: 1,
    title: 'Midnight Dreams',
    releaseDate: '2024-03-15',
    ucp: 'UCP-2024-001',
    status: 'distributed',
    streams: 145200,
    revenue: 1245.50,
    tracks: 8,
    isrc: ['ISRC-2024-001-001', 'ISRC-2024-001-002', 'ISRC-2024-001-003']
  },
  {
    id: 2,
    title: 'Urban Vibes EP',
    releaseDate: '2024-03-12',
    ucp: 'UCP-2024-002',
    status: 'distributed',
    streams: 98500,
    revenue: 892.30,
    tracks: 5,
    isrc: ['ISRC-2024-002-001', 'ISRC-2024-002-002']
  },
  {
    id: 3,
    title: 'Summer Collection',
    releaseDate: '2024-03-10',
    ucp: 'UCP-2024-003',
    status: 'making_cover_art',
    streams: 45000,
    revenue: 382.10,
    tracks: 12,
    isrc: ['ISRC-2024-003-001']
  }
];

export function DashboardOverview() {
  const totalStreams = albumData.reduce((sum, album) => sum + album.streams, 0);
  const totalRevenue = albumData.reduce((sum, album) => sum + album.revenue, 0);
  const distributedAlbums = albumData.filter(a => a.status === 'distributed').length;

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Streams</p>
              <p className="text-2xl font-bold">{(totalStreams / 1000).toFixed(1)}K</p>
            </div>
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-accent" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Across all releases</p>
        </Card>

        <Card className="bg-card border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
              <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-accent" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">From streaming</p>
        </Card>

        <Card className="bg-card border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Albums</p>
              <p className="text-2xl font-bold">{albumData.length}</p>
            </div>
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-accent" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">{distributedAlbums} distributed</p>
        </Card>

        <Card className="bg-card border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Growth</p>
              <p className="text-2xl font-bold">+24%</p>
            </div>
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">vs last month</p>
        </Card>
      </div>

      {/* Recent Albums */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Recent Releases</h2>
        <div className="space-y-3">
          {albumData.map((album) => (
            <Card key={album.id} className="bg-card border-border p-6 hover:border-accent/40 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg">{album.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      album.status === 'distributed' ? 'bg-green-500/20 text-green-500' :
                      album.status === 'making_cover_art' ? 'bg-blue-500/20 text-blue-500' :
                      'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {album.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>UCP: <span className="font-mono text-foreground">{album.ucp}</span></p>
                    <p>Released: {new Date(album.releaseDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 sm:text-right">
                  <div>
                    <p className="text-xs text-muted-foreground">Streams</p>
                    <p className="font-bold text-accent">{(album.streams / 1000).toFixed(1)}K</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="font-bold text-accent">${album.revenue.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tracks</p>
                    <p className="font-bold">{album.tracks}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
