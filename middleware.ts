import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('authToken')?.value;

  // Paths that require authentication
  const isAdminPath = pathname.startsWith('/admin');
  const isArtistPath = pathname.startsWith('/artist');
  const isLoginPath = pathname === '/login';

  // Helper to decode JWT and get user role safely
  const getUserRole = (token: string): string | null => {
    try {
      const base64Url = token.split('.')[1];
      let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const pad = (4 - (base64.length % 4)) % 4;
      base64 += '='.repeat(pad);
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);
      return decoded.type || null;
    } catch (e) {
      return null;
    }
  };

  const userRole = token ? getUserRole(token) : null;

  // 1. If user is accessing protected routes without a valid token, redirect to login
  if (!token || !userRole) {
    if (isAdminPath || isArtistPath) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. If user is logged in
  if (token && userRole) {
    // Prevent logged-in users from accessing the login page
    if (isLoginPath) {
      if (userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      } else if (userRole === 'artist') {
        return NextResponse.redirect(new URL('/artist', request.url));
      }
    }

    // Prevent non-admins from accessing /admin paths
    if (isAdminPath && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/artist', request.url));
    }

    // Prevent non-artists from accessing /artist paths
    if (isArtistPath && userRole !== 'artist') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/admin/:path*',
    '/artist/:path*',
    '/login'
  ],
};
