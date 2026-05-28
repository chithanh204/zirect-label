'use client';

import { LayoutDashboard, BarChart3, Album, Settings, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';

export function ArtistSidebar() {
  const [isOpen, setIsOpen] = useState(true);
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
      .catch((err) => console.error('Failed to load logo', err));
  }, []);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/artist' },
    { icon: Album, label: 'My Albums', href: '/artist/albums' },
    { icon: Settings, label: 'Settings', href: '/artist/settings' },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 hover:bg-accent/10 rounded-lg transition-colors glass"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 sidebar-glass transition-transform duration-300 z-30 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 space-y-8 h-full flex flex-col">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tighter">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden relative">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
            <span className="gradient-text-cyan">Zirect</span>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent/10 text-muted-foreground hover:text-foreground transition-all group"
                >
                  <Icon className="w-5 h-5 group-hover:text-accent transition-colors" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="space-y-3 border-t border-accent/10 pt-4">
            <div className="px-4 py-3 glass-card rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Logged in as</p>
              <p className="text-sm font-bold truncate">artist@zirect.com</p>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start border-accent/15 hover:border-accent/30 hover:bg-accent/5"
              onClick={() => {
                localStorage.removeItem('authToken');
                document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                window.location.href = '/login';
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden z-20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
