'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Music, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'artist' | 'admin'>('artist');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Simulate login - replace with actual API call
    setTimeout(() => {
      if (!email || !password) {
        setError('Please fill in all fields');
      } else {
        // Redirect based on user type
        window.location.href = userType === 'admin' ? '/admin' : '/artist';
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 group w-fit hover:opacity-75 transition-opacity">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tighter">Zirect Label</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="space-y-8">
            {/* Heading */}
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold tracking-tighter">Welcome Back</h1>
              <p className="text-muted-foreground">Sign in to your Zirect Label account</p>
            </div>

            {/* User Type Selection */}
            <div className="grid grid-cols-2 gap-3 bg-card p-1 rounded-lg border border-border">
              <button
                onClick={() => setUserType('artist')}
                className={`py-2 px-3 rounded-md font-medium text-sm transition-all ${
                  userType === 'artist'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Artist
              </button>
              <button
                onClick={() => setUserType('admin')}
                className={`py-2 px-3 rounded-md font-medium text-sm transition-all ${
                  userType === 'admin'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Admin
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
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
                  className="bg-card"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-card"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-border" />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
                <a href="#" className="text-accent hover:underline">Forgot password?</a>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Demo Credentials (Testing):</p>
              <div className="space-y-1">
                <p className="text-xs">
                  <span className="text-foreground font-mono">artist@zirect.com</span>
                  <span className="text-muted-foreground"> / </span>
                  <span className="text-foreground font-mono">password123</span>
                </p>
                <p className="text-xs">
                  <span className="text-foreground font-mono">admin@zirect.com</span>
                  <span className="text-muted-foreground"> / </span>
                  <span className="text-foreground font-mono">admin123</span>
                </p>
              </div>
            </div>

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
