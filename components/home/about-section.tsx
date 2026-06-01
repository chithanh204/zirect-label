'use client';

import { Award, Globe, Users, Zap } from 'lucide-react';

const features = [
  {
    icon: Globe,
    title: 'Global Distribution',
    description: 'Your music reaches Spotify, Apple Music, YouTube, and 100+ streaming platforms worldwide.'
  },
  {
    icon: Zap,
    title: 'Fast Turnaround',
    description: 'Get your music distributed in days, not weeks. From upload to live on all platforms.'
  },
  {
    icon: Users,
    title: 'Artist Support',
    description: 'Dedicated team to help with marketing, promotion, and strategic partnerships.'
  },
  {
    icon: Award,
    title: 'Transparent Payments',
    description: 'Real-time analytics dashboard and weekly payouts to your account.'
  }
];

export function AboutSection() {
  return (
    <section id="about" className="py-20 sm:py-32 px-4">
      <div className="max-w-7xl mx-auto glass rounded-2xl p-8 md:p-12 neon-border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Text Content */}
          <div className="space-y-6">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter">
              About <span className="gradient-text-cyan">Zirect Label</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Founded in 2023, Zirect Label is a forward-thinking music distribution and artist management platform. We believe every artist deserves access to global audiences and fair compensation for their work.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our mission is to simplify music distribution, eliminate middlemen, and empower artists with the tools they need to succeed in the digital age.
            </p>
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-accent rounded-full shadow-[0_0_8px_rgba(0,212,255,0.5)]" />
                <span className="text-foreground">Industry-leading royalty rates</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-accent rounded-full shadow-[0_0_8px_rgba(0,212,255,0.5)]" />
                <span className="text-foreground">Zero hidden fees policy</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-accent rounded-full shadow-[0_0_8px_rgba(0,212,255,0.5)]" />
                <span className="text-foreground">24/7 artist support</span>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="space-y-3 p-6 glass-card rounded-lg hover:neon-glow-sm transition-all">
                  <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-bold text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
