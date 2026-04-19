'use client';

import { LayoutDashboard, BarChart3, Album, Settings, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function ArtistSidebar() {
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/artist' },
    { icon: Album, label: 'My Albums', href: '/artist/albums' },
    { icon: BarChart3, label: 'Analytics', href: '/artist/analytics' },
    { icon: Settings, label: 'Settings', href: '/artist/settings' },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 hover:bg-muted rounded-lg transition-colors"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-card border-r border-border transition-transform duration-300 z-30 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 space-y-8 h-full flex flex-col">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tighter">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-accent-foreground text-sm font-bold">Z</span>
            </div>
            Zirect
          </Link>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
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
          <div className="space-y-3 border-t border-border pt-4">
            <div className="px-4 py-3 bg-background rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Logged in as</p>
              <p className="text-sm font-bold truncate">artist@zirect.com</p>
            </div>
            <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/'}>
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
