import { NextResponse } from 'next/server';
import { securityMiddleware } from './lib/middleware/security';

export async function proxy(request) {
  // Only apply security middleware to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return securityMiddleware(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};