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
    <section id="about" className="py-20 sm:py-32 px-4 bg-card">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Text Content */}
          <div className="space-y-6">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter">
              About Zirect Label
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Founded in 2023, Zirect Label is a forward-thinking music distribution and artist management platform. We believe every artist deserves access to global audiences and fair compensation for their work.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our mission is to simplify music distribution, eliminate middlemen, and empower artists with the tools they need to succeed in the digital age.
            </p>
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-accent rounded-full" />
                <span className="text-foreground">Industry-leading royalty rates</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-accent rounded-full" />
                <span className="text-foreground">Zero hidden fees policy</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-accent rounded-full" />
                <span className="text-foreground">24/7 artist support</span>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="space-y-3 p-6 bg-background rounded-lg border border-border hover:border-accent/40 transition-colors">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-bold text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-8">
          <h3 className="text-2xl font-bold">Our Journey</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { year: '2023', title: 'Founded', desc: 'Zirect Label launched' },
              { year: '2023', title: '500+ Artists', desc: 'Reached milestone' },
              { year: '2024', title: '2.5M Streams', desc: 'Collective achievement' },
              { year: '2024', title: '$500K Paid', desc: 'To our artists' }
            ].map((item, idx) => (
              <div key={idx} className="relative pb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center text-accent font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-sm text-accent font-bold">{item.year}</div>
                    <h4 className="font-bold text-lg">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
