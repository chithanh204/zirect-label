'use client';

import { useEffect, useState } from 'react';
import { Music, Play, TrendingUp, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';

interface Album {
  id: string;
  title: string;
  artistName: string;
  totalStreams: number;
  revenue: number;
  status: string;
  releaseDate: string;
  coverArt?: string;
}

export function FeaturedReleases() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getAllAlbums();

        // Get first 4 albums for featured display
        const featuredAlbums = (response.data?.albums || []).slice(0, 4);
        setAlbums(featuredAlbums);
      } catch (err) {
        console.error('Failed to fetch albums:', err);
        setError('Failed to load featured releases');

        // Fallback to mock data if API fails
        setAlbums([
          {
            id: '1',
            title: 'Midnight Dreams',
            artistName: 'Luna Echo',
            totalStreams: 145200,
            revenue: 1245,
            status: 'distributed',
            releaseDate: '2024-03-15',
          },
          {
            id: '2',
            title: 'Urban Vibes',
            artistName: 'City Beats',
            totalStreams: 98500,
            revenue: 892,
            status: 'distributed',
            releaseDate: '2024-03-12',
          },
          {
            id: '3',
            title: 'Sunset Paradise',
            artistName: 'Tropical Waves',
            totalStreams: 76300,
            revenue: 645,
            status: 'distributed',
            releaseDate: '2024-03-10',
          },
          {
            id: '4',
            title: 'Ethereal Nights',
            artistName: 'Cosmic Sound',
            totalStreams: 62100,
            revenue: 512,
            status: 'distributed',
            releaseDate: '2024-03-08',
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);
  return (
    <section id="featured" className="py-20 sm:py-32 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="space-y-4 mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter">
            Featured Releases
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Discover the latest tracks from our growing roster of artists. Each release is carefully distributed across all major streaming platforms.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading releases...</div>
        ) : albums.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No releases available yet</div>
        ) : (
          <>
            {/* Featured Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {/* Large Featured Card */}
              {albums[0] && (
                <div className="md:col-span-2 bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-xl p-8 hover:border-accent/40 transition-colors group overflow-hidden">
                  <div className="flex flex-col sm:flex-row gap-8">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 bg-accent/20 rounded-lg flex-shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Music className="w-16 h-16 text-accent/40" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="inline-block px-3 py-1 bg-accent/20 rounded-full text-sm font-medium text-accent mb-3">
                          Trending Now
                        </div>
                        <h3 className="text-3xl font-bold mb-2">{albums[0].title}</h3>
                        <p className="text-muted-foreground mb-4">{albums[0].artistName}</p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div>
                            <div className="text-accent font-bold">{(albums[0].totalStreams / 1000).toFixed(1)}K</div>
                            <div className="text-muted-foreground">Streams</div>
                          </div>
                          <div>
                            <div className="text-accent font-bold">${(albums[0].revenue / 1000).toFixed(1)}K</div>
                            <div className="text-muted-foreground">Revenue</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <Button className="bg-accent text-accent-foreground hover:bg-accent/90" size="sm">
                          <Play className="w-4 h-4 mr-2" />
                          Listen on Spotify
                        </Button>
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Release Cards Grid */}
              {albums.slice(1).map((album) => (
                <div
                  key={album.id}
                  className="bg-card border border-border rounded-lg p-6 hover:border-accent/40 hover:bg-accent/5 transition-all group cursor-pointer"
                >
                  <div className="flex gap-4 mb-4">
                    <div className="w-20 h-20 bg-accent/20 rounded-lg flex-shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Music className="w-10 h-10 text-accent/40" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg leading-tight mb-1">{album.title}</h3>
                      <p className="text-muted-foreground text-sm mb-2">{album.artistName}</p>
                      <div className="inline-block px-2 py-1 bg-accent/20 rounded text-xs font-medium text-accent">
                        {album.status.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Volume2 className="w-4 h-4" />
                        Streams
                      </div>
                      <span className="font-bold text-accent">{(album.totalStreams / 1000).toFixed(1)}K</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <TrendingUp className="w-4 h-4" />
                        Revenue
                      </div>
                      <span className="font-bold text-accent">${(album.revenue / 1000).toFixed(1)}K</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <Button variant="outline" size="lg">
                View All Releases
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

import { ArrowRight } from 'lucide-react';
