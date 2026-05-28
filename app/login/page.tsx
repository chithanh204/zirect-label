'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Music, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      // Store token
      if (data.data?.token) {
        localStorage.setItem('authToken', data.data.token);
        // Also set as cookie for Next.js middleware
        document.cookie = `authToken=${data.data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      }

      // Redirect based on user role from backend
      const userRole = data.data?.user?.type;
      if (userRole === 'admin') {
        window.location.href = '/admin';
      } else if (userRole === 'artist') {
        window.location.href = '/artist';
      } else {
        setError('Invalid user role');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen art-bg-home flex flex-col relative">
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-[rgba(2,8,23,0.85)] pointer-events-none z-0" />

      {/* Header */}
      <header className="border-b border-accent/10 glass-strong relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 group w-fit hover:opacity-75 transition-opacity">
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
            <span className="text-lg font-bold tracking-tighter">{title}</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-md">
          <div className="glass rounded-2xl p-8 neon-border space-y-8">
            {/* Heading */}
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold tracking-tighter">Welcome <span className="gradient-text-cyan">Back</span></h1>
              <p className="text-muted-foreground">Sign in to your Zirect Label account</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/25 rounded-lg p-3 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Email Address</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[rgba(8,20,45,0.5)] border-accent/15 focus:border-accent/40 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[rgba(8,20,45,0.5)] border-accent/15 focus:border-accent/40 transition-colors"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-accent/20 bg-[rgba(8,20,45,0.5)]" />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
                <a href="#" className="text-accent hover:underline">Forgot password?</a>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 neon-glow-sm font-semibold"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Back Link */}
            <div className="text-center">
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
