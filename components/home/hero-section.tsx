'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-20 pb-32 sm:pt-32 sm:pb-40 px-4">
      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10">
        {/* Radial glow from center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      </div>

      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full neon-border">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-accent">Elevating Music Distribution</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-tight">
          WHERE YOUR MUSIC
          <span className="block gradient-text-cyan neon-text mt-2">
            SOARS BEYOND LIMITS
          </span>
        </h1>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/contact">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 neon-glow group font-semibold">
              Start Distributing
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="#featured">
            <Button size="lg" variant="outline" className="border-accent/30 hover:border-accent/60 hover:bg-accent/5 transition-all">
              Explore Featured Releases
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-12 sm:pt-16">
          <div className="space-y-1 glass-card rounded-xl p-4 sm:p-6">
            <div className="text-2xl sm:text-3xl font-bold gradient-text-cyan">100+</div>
            <div className="text-sm text-muted-foreground">Playlists</div>
          </div>
          <div className="space-y-1 glass-card rounded-xl p-4 sm:p-6">
            <div className="text-2xl sm:text-3xl font-bold gradient-text-cyan">5M+</div>
            <div className="text-sm text-muted-foreground">Streams</div>
          </div>
          <div className="space-y-1 glass-card rounded-xl p-4 sm:p-6">
            <div className="text-2xl sm:text-3xl font-bold gradient-text-cyan">24/7</div>
            <div className="text-sm text-muted-foreground">Discovery</div>
          </div>
        </div>
      </div>
    </section >
  );
}
