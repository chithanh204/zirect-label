'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Music, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Music className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tighter hidden sm:inline">Zirect Label</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#featured" className="text-sm hover:text-accent transition-colors">Featured</a>
            <a href="#about" className="text-sm hover:text-accent transition-colors">About</a>
            <a href="#contact" className="text-sm hover:text-accent transition-colors">Contact</a>
            <a href="#careers" className="text-sm hover:text-accent transition-colors">Careers</a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/contact">
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Join Us
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 space-y-3 border-t border-border pt-4">
            <a href="#featured" className="block text-sm hover:text-accent transition-colors py-2">Featured</a>
            <a href="#about" className="block text-sm hover:text-accent transition-colors py-2">About</a>
            <a href="#contact" className="block text-sm hover:text-accent transition-colors py-2">Contact</a>
            <a href="#careers" className="block text-sm hover:text-accent transition-colors py-2">Careers</a>
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">Sign In</Button>
              </Link>
              <Link href="/contact" className="flex-1">
                <Button size="sm" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  Join Us
                </Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
