'use client';

import { useState, useEffect } from 'react';
import { Music, ChevronRight, Download, Share2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/api';

export function AlbumsView() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const [albumsRes, profileRes] = await Promise.all([
        apiClient.getMyAlbums() as any,
        apiClient.getMyArtistProfile() as any
      ]);

      if (albumsRes?.success) {
        setAlbums(albumsRes.data || []);
      }
      if (profileRes?.success) {
        setProfile(profileRes.data);
      }
    } catch (err) {
      setError('Failed to load albums');
    } finally {
      setLoading(false);
    }
  };

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

  if (albums.length === 0) {
    return (
      <div className="text-center p-12 border border-dashed border-border rounded-lg text-muted-foreground">
        <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-bold text-foreground mb-2">No Albums Yet</h3>
        <p>You haven't released any albums yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {albums.map((album) => {
        // Calculate total revenue from all platforms for this album
        const albumPlatformRevenue = album.platformRevenues?.reduce((sum: number, r: any) => sum + r.totalRevenue, 0) || 0;
        
        // Find the artist's split percentage for this album
        let artistShare = 100;
        if (album.revenueSplits && album.revenueSplits.length > 0) {
          const split = album.revenueSplits.find((s: any) => s.artistId === profile?.id);
          if (split) {
            artistShare = split.percentage;
          } else {
            artistShare = 0;
          }
        }
        
        const artistAlbumRevenue = albumPlatformRevenue * (artistShare / 100);

        return (
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
                        <span className="text-muted-foreground">UPC: </span>
                        <span className="font-mono text-foreground">{album.upc || 'Pending'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Genre: </span>
                        <span className="text-foreground">{album.genre || 'Various'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Released: </span>
                        <span className="text-foreground">
                          {album.releaseDate ? new Date(album.releaseDate).toLocaleDateString() : 'TBA'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {album.platformRevenues?.map((pr: any) => (
                      <span key={pr.platform} className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium uppercase">
                        {pr.platform.replace('_', ' ')}
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
                <p className="text-2xl font-bold text-accent">
                  {album.totalStreams >= 1000000 
                    ? `${(album.totalStreams / 1000000).toFixed(1)}M` 
                    : album.totalStreams >= 1000 
                      ? `${(album.totalStreams / 1000).toFixed(1)}K` 
                      : (album.totalStreams || 0).toLocaleString()}
                </p>
              </Card>
              <Card className="bg-card border-border p-4">
                <p className="text-sm text-muted-foreground mb-1">Your Revenue</p>
                <p className="text-2xl font-bold text-accent">
                  ${artistAlbumRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </Card>
              <Card className="bg-card border-border p-4">
                <p className="text-sm text-muted-foreground mb-1">Number of Tracks</p>
                <p className="text-2xl font-bold">{album.tracks?.length || 0}</p>
              </Card>
              <Card className="bg-card border-border p-4">
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <p className={`text-sm font-bold px-2 py-1 rounded w-fit uppercase ${
                  album.status === 'distributed' ? 'bg-green-500/20 text-green-500' :
                  album.status === 'draft' ? 'bg-gray-500/20 text-gray-400' :
                  'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {album.status === 'draft' ? 'MAKING COVER ART' : album.status.replace(/_/g, ' ')}
                </p>
              </Card>
            </div>

            {/* Track Details */}
            <div>
              <h3 className="text-xl font-bold mb-4">Track Details</h3>
              <div className="space-y-3">
                {album.tracks?.map((track: any, idx: number) => (
                  <Card key={track.id || idx} className="bg-card border-border p-4 hover:border-accent/40 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-accent/10 rounded flex items-center justify-center text-accent font-bold flex-shrink-0">
                        {track.position || (idx + 1)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{track.title}</p>
                        <p className="text-xs text-muted-foreground font-mono">{track.isrc || 'ISRC Pending'}</p>
                      </div>

                      <div className="hidden sm:flex items-center gap-8 text-sm">
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">Duration</p>
                          <p className="font-bold">
                            {Math.floor((track.duration || 0) / 60)}:{(track.duration || 0) % 60 < 10 ? '0' : ''}{(track.duration || 0) % 60}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">Streams</p>
                          <p className="font-bold text-accent">
                            {track.streams >= 1000000 
                              ? `${(track.streams / 1000000).toFixed(1)}M` 
                              : track.streams >= 1000 
                                ? `${(track.streams / 1000).toFixed(1)}K` 
                                : (track.streams || 0).toLocaleString()}
                          </p>
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
        );
      })}
    </div>
  );
}
