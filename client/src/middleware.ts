import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  if (pathname.startsWith('/youtube-notes-for-')) {
    const slug = pathname.replace('/youtube-notes-for-', '');
    return NextResponse.rewrite(new URL(`/youtube-to-notes/subject/${slug}`, request.url), {
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    // Match all paths except internal, api, static assets, robots, and sitemap requests
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.*\\.xml|.*\\.).*)',
  ],
};
