'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-20 pb-32 sm:pt-32 sm:pb-40 px-4">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-accent">Elevating Music Distribution</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-tight">
          Where Music Meets
          <span className="block bg-gradient-to-r from-accent to-accent/60 bg-clip-text text-transparent">
            Opportunity
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Zirect Label connects independent artists with global audiences. Distribute your music to major streaming platforms, track real-time analytics, and maximize your revenue.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/contact">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 group">
              Start Distributing
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="#featured">
            <Button size="lg" variant="outline">
              Explore Featured Releases
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-12 sm:pt-16">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-bold text-accent">500+</div>
            <div className="text-sm text-muted-foreground">Artists</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-bold text-accent">2.5M+</div>
            <div className="text-sm text-muted-foreground">Streams</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-bold text-accent">$500K+</div>
            <div className="text-sm text-muted-foreground">Paid Out</div>
          </div>
        </div>
      </div>
    </section>
  );
}
