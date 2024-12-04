import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const JWT_ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;

  // Critical environment check
  if (!JWT_ACCESS_SECRET) {
    console.log('[AUTH MIDDLEWARE] 🚨 CRITICAL: ACCESS_TOKEN_SECRET is not set!');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const { pathname } = request.nextUrl;
  
  // Define authentication-related paths
  const authPaths = ['/login', '/signup'];
  const protectedPaths = ['/dashboard', '/profile', '/settings'];
  const publicPaths = ['/public'];

  // Check if current path is an authentication path
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));
  
  // Check for access token
  const accessToken = request.cookies.get('access_token')?.value;

  // Logic for authentication paths (login/signup)
  if (isAuthPath) {
    if (accessToken) {
      try {
        // Verify the token
        const secret = new TextEncoder().encode(JWT_ACCESS_SECRET);
        await jwtVerify(accessToken, secret);
        
        // If token is valid, redirect to dashboard
        console.log('[AUTH MIDDLEWARE] 🔒 Logged-in user attempted to access auth page');
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } catch (error) {
        // If token is invalid, allow access to auth pages
        return NextResponse.next();
      }
    }
    // No token, allow access to auth pages
    return NextResponse.next();
  }

  // Logic for protected paths
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  if (isProtectedPath) {
    // No token present
    if (!accessToken) {
      console.log(`[AUTH MIDDLEWARE] 🔒 No access token for protected path: ${pathname}`);
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verify JWT using jose
      const secret = new TextEncoder().encode(JWT_ACCESS_SECRET);
      const { payload } = await jwtVerify(accessToken, secret);

      console.log('✅ Token Successfully Verified', {
        path: pathname,
        userId: payload.id,
      });

      return NextResponse.next();
    } catch (error: any) {
      // Handle token verification errors
      console.log('[AUTH MIDDLEWARE] ❌ Token Verification Failed', {
        path: pathname,
        errorName: error.name,
        errorMessage: error.message,
      });

      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Public paths (always accessible)
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Default case: if no specific rules apply, continue request
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login', 
    '/signup', 
    '/dashboard/:path*', 
    '/profile/:path*', 
    '/settings/:path*'
  ],
};