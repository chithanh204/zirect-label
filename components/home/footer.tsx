'use client';

import Link from 'next/link';
import { Music, Mail, MapPin, Phone, Github, Twitter, Linkedin, Facebook, Youtube, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="border-t border-border/20 card-overlay">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="font-bold text-lg">Zirect Label</span>
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
              <li><Link href="#" className="text-muted-foreground hover:text-accent transition-colors">About</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-accent transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-accent transition-colors">Careers</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-accent transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-bold">Get in Touch</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <a href="mailto:hello@zirect.com" className="hover:text-accent transition-colors">hello@zirect.com</a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Vietnam</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <a href="tel:+84123456789" className="hover:text-accent transition-colors">+84 (123) 456-789</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social & Bottom */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            {/* Bottom Links */}
            <ul className="flex flex-wrap justify-center sm:justify-start gap-6 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-accent transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-accent transition-colors">Cookie Policy</Link></li>
            </ul>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <Link href="https://www.youtube.com/@zirectlabel" className="w-10 h-10 rounded-lg bg-slate-800/40 hover:bg-accent/10 flex items-center justify-center transition-colors">
                <Youtube className="w-5 h-5 text-muted-foreground hover:text-accent" />
              </Link>
              <Link href="https://www.instagram.com/zirectlabel" className="w-10 h-10 rounded-lg bg-slate-800/40 hover:bg-accent/10 flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5 text-muted-foreground hover:text-accent" />
              </Link>
              <Link href="https://www.facebook.com/zirectlabel" className="w-10 h-10 rounded-lg bg-slate-800/40 hover:bg-accent/10 flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5 text-muted-foreground hover:text-accent" />
              </Link>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center text-sm text-muted-foreground pt-6 mt-6 border-t border-border/30">
            <p>&copy; 2026 Zirect Label. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
