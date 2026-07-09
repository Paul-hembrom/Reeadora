import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import { createServerClient } from '@supabase/ssr';
import { RateLimiter } from '@/lib/rate-limit';

// Rate limiters (in-memory per Edge instance)
const joinLimiter = new RateLimiter(60 * 60 * 1000, 30); // 30 requests per hour
const authLimiter = new RateLimiter(60 * 1000, 45);     // 45 requests per minute
const adminLimiter = new RateLimiter(60 * 1000, 45);    // 45 requests per minute

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const path = request.nextUrl.pathname;

  // Rate limit /join
  if (path.startsWith('/join')) {
    if (!joinLimiter.check(ip)) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }

  // Rate limit /api/auth/*
  if (path.startsWith('/api/auth/')) {
    if (!authLimiter.check(ip)) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }

  // Admin route protection & rate limit
  if (path.startsWith('/admin/')) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll() {},
        },
      }
    );
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.redirect(new URL('/join', request.url));
    }

    if (!adminLimiter.check(user.id)) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }

    // Must have role = 'admin' in organization_members OR be a school_admin
    // (We check both to not break D2 while complying with the prompt)
    const { data: orgAdmin } = await supabase
      .from('organization_members')
      .select('id')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .limit(1)
      .maybeSingle();

    const { data: schoolAdmin } = await supabase
      .from('school_admins')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (!orgAdmin && !schoolAdmin) {
      return NextResponse.redirect(new URL('/join', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
