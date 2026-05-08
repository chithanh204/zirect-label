'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Music, Volume2, DollarSign, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/api';

export function DashboardOverview() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
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
      setError('Failed to load dashboard data');
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Streams</p>
              <p className="text-2xl font-bold">
                {totalStreams >= 1000000 
                  ? `${(totalStreams / 1000000).toFixed(1)}M` 
                  : totalStreams >= 1000 
                    ? `${(totalStreams / 1000).toFixed(1)}K` 
                    : totalStreams.toLocaleString()}
              </p>
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
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculatedTotalRevenue)}
              </p>
            </div>
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-accent" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Your share from streaming</p>
        </Card>

        <Card className="bg-card border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Albums</p>
              <p className="text-2xl font-bold">{albums.length}</p>
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
          {albumsWithCalculatedRevenue.length === 0 ? (
            <Card className="bg-card border-border p-8 text-center text-muted-foreground border-dashed">
              No albums released yet.
            </Card>
          ) : (
            albumsWithCalculatedRevenue.slice(0, 5).map((album) => {
              return (
                <Card key={album.id} className="bg-card border-border p-6 hover:border-accent/40 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg">{album.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${
                          album.status === 'distributed' ? 'bg-green-500/20 text-green-500' :
                          album.status === 'draft' ? 'bg-gray-500/20 text-gray-400' :
                          'bg-yellow-500/20 text-yellow-500'
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
    </div>
  );
}
