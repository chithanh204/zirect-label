'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Music, Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('Zirect Label');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch home page config
    apiClient.getHomePageConfig()
      .then((data: any) => {
        if (data && data.success && data.data) {
          if (data.data.logoUrl) setLogoUrl(data.data.logoUrl);
          if (data.data.title) setTitle(data.data.title);
        }
      })
      .catch((err) => console.error('Failed to load home page config', err));

    // Check user auth state
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      apiClient.getCurrentUser(token)
        .then((data: any) => {
          if (data && data.success && data.data) {
            setUser(data.data);
          } else {
            // Token expired or invalid
            localStorage.removeItem('authToken');
            document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          }
        })
        .catch(() => {
          localStorage.removeItem('authToken');
          document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        });
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      setUser(null);
      setIsDropdownOpen(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-[rgba(0,212,255,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden relative">
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
            <span className="text-xl font-bold tracking-tighter hidden sm:inline gradient-text-cyan">{title}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#featured" className="text-sm text-muted-foreground hover:text-accent transition-colors">Featured</a>
            <a href="#about" className="text-sm text-muted-foreground hover:text-accent transition-colors">About</a>
            <a href="#contact" className="text-sm text-muted-foreground hover:text-accent transition-colors">Contact</a>
          </nav>

          {/* CTA / Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link href={user.type === 'admin' ? '/admin' : '/artist'}>
                  <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 neon-glow-sm px-5">
                    Account
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs"
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent/10">Sign In</Button>
                </Link>
                <a href="#contact">
                  <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 neon-glow-sm">
                    Join Us
                  </Button>
                </a>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-accent/10 rounded-lg transition-colors text-foreground"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 space-y-3 border-t border-[rgba(0,212,255,0.1)] pt-4">
            <a href="#featured" onClick={() => setIsMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-accent transition-colors py-2">Featured</a>
            <a href="#about" onClick={() => setIsMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-accent transition-colors py-2">About</a>
            <a href="#contact" onClick={() => setIsMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-accent transition-colors py-2">Contact</a>

            <div className="pt-2 border-t border-[rgba(255,255,255,0.05)]">
              {user ? (
                <div className="space-y-3 pt-2">
                  <div className="px-3 py-1 bg-accent/5 rounded-lg border border-accent/10">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Logged in as</p>
                    <p className="text-sm font-semibold truncate text-foreground mt-0.5">{user.email}</p>
                  </div>
                  <Link
                    href={user.type === 'admin' ? '/admin' : '/artist'}
                    onClick={() => setIsMenuOpen(false)}
                    className="block"
                  >
                    <Button size="sm" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                      Account
                    </Button>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link href="/login" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full border-accent/20 hover:border-accent/40 text-foreground">Sign In</Button>
                  </Link>
                  <a href="#contact" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                    <Button size="sm" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                      Join Us
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
