import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Routes that don't need authentication
const PUBLIC_ROUTES = ['/', '/login', '/auth/callback', '/api/whatsapp'];

function isPublicPath(pathname: string) {
  if (
    pathname === '/sw.js' ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/icon.svg'
  ) {
    return true;
  }
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith('/auth/')
  );
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isPublic = isPublicPath(pathname);

  // Not authenticated and trying to access protected route
  if (!user && !isPublic) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Authenticated user going to login page — smart redirect
  if (user && pathname === '/login') {
    // Check if user is a field agent by looking up the agents table
    const { data: agentRecord } = await supabase
      .from('agents')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const redirectUrl = request.nextUrl.clone();
    // Agents go to /agent, everyone else to /dashboard
    redirectUrl.pathname = agentRecord ? '/agent' : '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};