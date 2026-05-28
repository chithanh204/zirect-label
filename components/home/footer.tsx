'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Music, Mail, MapPin, Phone, Github, Twitter, Linkedin, Facebook, Youtube, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';

export function Footer() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('Zirect Label');

  useEffect(() => {
    // Fetch home page config for logo
    apiClient.getHomePageConfig()
      .then((data: any) => {
        if (data && data.success && data.data) {
          if (data.data.logoUrl) setLogoUrl(data.data.logoUrl);
          if (data.data.title) setTitle(data.data.title);
        }
      })
      .catch((err) => console.error('Failed to load logo in footer', err));
  }, []);

  return (
    <footer className="border-t border-accent/10 glass-strong">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden relative">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Music className="w-5 h-5 text-accent-foreground opacity-0" />
                )}
              </div>
              <span className="font-bold text-lg">{title}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering independent artists through global music distribution.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="font-bold">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-accent transition-colors">Distribution</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-accent transition-colors">Analytics</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-accent transition-colors">Artists</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-accent transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="font-bold">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#about" className="text-muted-foreground hover:text-accent transition-colors">About</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-accent transition-colors">Blog</Link></li>
              <li><Link href="#contact" className="text-muted-foreground hover:text-accent transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-bold">Get in Touch</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <a href="mailto:info@zirect.asia" className="hover:text-accent transition-colors">info@zirect.asia</a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Asia</span>
              </li>
              {/* <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <a href="tel:+84123456789" className="hover:text-accent transition-colors">+84 (123) 456-789</a>
              </li> */}
            </ul>
          </div>
        </div>

        {/* Social & Bottom */}
        <div className="border-t border-accent/10 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            {/* Bottom Links */}
            <ul className="flex flex-wrap justify-center sm:justify-start gap-6 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-accent transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-accent transition-colors">Cookie Policy</Link></li>
            </ul>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <Link href="https://www.youtube.com/@zirectlabel" className="w-10 h-10 rounded-lg glass-card flex items-center justify-center hover:border-accent/40 transition-all">
                <Youtube className="w-5 h-5 text-muted-foreground hover:text-accent transition-colors" />
              </Link>
              <Link href="https://www.instagram.com/zirect.label/" className="w-10 h-10 rounded-lg glass-card flex items-center justify-center hover:border-accent/40 transition-all">
                <Instagram className="w-5 h-5 text-muted-foreground hover:text-accent transition-colors" />
              </Link>
              <Link href="https://www.facebook.com/zirectlabel" className="w-10 h-10 rounded-lg glass-card flex items-center justify-center hover:border-accent/40 transition-all">
                <Facebook className="w-5 h-5 text-muted-foreground hover:text-accent transition-colors" />
              </Link>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center text-sm text-muted-foreground pt-6 mt-6 border-t border-accent/10">
            <p>&copy; {new Date().getFullYear()} {title}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
