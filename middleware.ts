import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  // If token cookie exists (Readora shared JWT token)
  if (token && process.env.JWT_SECRET) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      const { payload } = await jwtVerify(token, secret)
      
      const response = NextResponse.next({ request })
      if (payload.userId) {
        response.headers.set('x-user-id', String(payload.userId))
      }
      return response
    } catch {
      // If verification fails or token is expired, continue to session check or pass through
    }
  }

  // Fast-path: if no supabase auth cookies are present, avoid remote getUser call in middleware
  const hasSupabaseCookie = request.cookies.getAll().some(c => c.name.startsWith('sb-'))
  if (!hasSupabaseCookie) {
    return NextResponse.next({ request })
  }

  // Fallback to updateSession with a timeout protection to prevent 504 GATEWAY_TIMEOUT
  try {
    const { updateSession } = await import('@/utils/supabase/middleware')
    const updatePromise = updateSession(request)
    const timeoutPromise = new Promise<NextResponse>((_, reject) =>
      setTimeout(() => reject(new Error('middleware timeout')), 3000)
    )
    return await Promise.race([updatePromise, timeoutPromise])
  } catch (err) {
    // Return gracefully on timeout or error rather than hanging/504ing
    return NextResponse.next({ request })
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files & images:
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|css|js)$).*)',
  ],
}

