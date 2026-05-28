'use client';

import { useEffect, useState } from 'react';
import { Music, Play, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';

interface FeaturedRelease {
  id: string;
  trackName: string;
  artistNames: string;
  spotifyLink?: string;
  youtubeLink?: string;
  coverArt?: string;
}

export function FeaturedReleases() {
  const [releases, setReleases] = useState<FeaturedRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getFeaturedReleases();
        if (response && (response as any).success) {
          setReleases((response as any).data || []);
        }
      } catch (err) {
        console.error('Failed to fetch featured releases:', err);
        setError('Failed to load featured releases');
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <section id="featured" className="py-20 sm:py-32 px-4 relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/5 via-background to-background">
      {/* Decorative glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-wider uppercase text-white">
            OUR FEATURED TRACKS
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-12">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col items-center">
                <div className="aspect-square w-full bg-accent/5 rounded-xl border border-accent/10 mb-4" />
                <div className="h-4 bg-accent/5 rounded w-3/4 mb-2" />
                <div className="h-3 bg-accent/5 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-muted-foreground">{error}</div>
        ) : releases.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-accent/20 rounded-2xl bg-accent/5 max-w-lg mx-auto">
            <Music className="w-12 h-12 text-accent/30 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-1">No featured releases</h3>
            <p className="text-sm text-muted-foreground px-4">Check back soon for new tracks in the distribution spotlight.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-12">
            {releases.slice(0, 15).map((release) => {
              const platformLink = release.spotifyLink || release.youtubeLink || '#';
              return (
                <a
                  key={release.id}
                  href={platformLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2"
                >
                  {/* Artwork Container */}
                  <div className="aspect-square w-full rounded-xl overflow-hidden relative shadow-lg mb-4 bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center border border-white/5">
                    {release.coverArt ? (
                      <img
                        src={release.coverArt}
                        alt={release.trackName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <Music className="w-12 h-12 text-accent/30 group-hover:scale-105 transition-transform duration-500" />
                    )}

                    {/* Subtle Overlay with play button on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-all duration-300">
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <h3 className="font-bold text-sm sm:text-base text-white leading-snug truncate max-w-full group-hover:text-cyan-400 transition-colors px-1" title={release.trackName}>
                    {release.trackName}
                  </h3>
                  <p className="text-xs text-slate-400 truncate max-w-full mt-1 px-1" title={release.artistNames}>
                    {release.artistNames}
                  </p>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
