import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Get forwarded host and proto from proxy headers
  const forwardedHost = req.headers.get('x-forwarded-host');
  const forwardedProto = req.headers.get('x-forwarded-proto') || 'https';
  
  // If we have forwarded headers, we need to rewrite the request
  // so NextAuth knows the correct origin
  if (forwardedHost) {
    const url = req.nextUrl;
    // Update the URL to use the forwarded host/proto
    url.protocol = forwardedProto;
    url.host = forwardedHost;
    
    console.log(`[Middleware] Rewriting to: ${forwardedProto}://${forwardedHost}`);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/auth/:path*', '/api/admin/:path*'],
};
