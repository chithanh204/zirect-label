'use client';

import { Music, ChevronRight, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const albumDetails = [
  {
    id: 1,
    title: 'Midnight Dreams',
    ucp: 'UCP-2024-001',
    status: 'distributed',
    releaseDate: '2024-03-15',
    genre: 'Electronic',
    tracks: [
      { title: 'Track 1', isrc: 'ISRC-2024-001-001', duration: '3:45', streams: 45000 },
      { title: 'Track 2', isrc: 'ISRC-2024-001-002', duration: '4:12', streams: 52000 },
      { title: 'Track 3', isrc: 'ISRC-2024-001-003', duration: '3:28', streams: 48200 }
    ],
    totalStreams: 145200,
    totalRevenue: 1245.50,
    platforms: ['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music']
  }
];

export function AlbumsView() {
  return (
    <div className="space-y-6">
      {albumDetails.map((album) => (
        <div key={album.id} className="space-y-6">
          {/* Album Header */}
          <Card className="bg-card border-border p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-32 h-32 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Music className="w-16 h-16 text-accent/40" />
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{album.title}</h2>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">UCP: </span>
                      <span className="font-mono text-foreground">{album.ucp}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Genre: </span>
                      <span className="text-foreground">{album.genre}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Released: </span>
                      <span className="text-foreground">{new Date(album.releaseDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {album.platforms.map((platform) => (
                    <span key={platform} className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
                      {platform}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-border p-4">
              <p className="text-sm text-muted-foreground mb-1">Total Streams</p>
              <p className="text-2xl font-bold text-accent">{(album.totalStreams / 1000).toFixed(1)}K</p>
            </Card>
            <Card className="bg-card border-border p-4">
              <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-accent">${album.totalRevenue.toFixed(2)}</p>
            </Card>
            <Card className="bg-card border-border p-4">
              <p className="text-sm text-muted-foreground mb-1">Number of Tracks</p>
              <p className="text-2xl font-bold">{album.tracks.length}</p>
            </Card>
            <Card className="bg-card border-border p-4">
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <p className="text-sm font-bold px-2 py-1 bg-green-500/20 text-green-500 rounded w-fit">
                DISTRIBUTED
              </p>
            </Card>
          </div>

          {/* Track Details */}
          <div>
            <h3 className="text-xl font-bold mb-4">Track Details</h3>
            <div className="space-y-3">
              {album.tracks.map((track, idx) => (
                <Card key={idx} className="bg-card border-border p-4 hover:border-accent/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-accent/10 rounded flex items-center justify-center text-accent font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{track.title}</p>
                      <p className="text-xs text-muted-foreground font-mono">{track.isrc}</p>
                    </div>

                    <div className="hidden sm:flex items-center gap-8 text-sm">
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">Duration</p>
                        <p className="font-bold">{track.duration}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">Streams</p>
                        <p className="font-bold text-accent">{(track.streams / 1000).toFixed(1)}K</p>
                      </div>
                    </div>

                    <Button variant="ghost" size="sm">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
