import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient, createAdminClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data: authData, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && authData.user) {
      // Sync the user to `public.users` table using the admin client (in case RLS blocks inserts)
      const adminSupabase = await createAdminClient()
      
      const { user } = authData
      
      const { data: existingUser } = await adminSupabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()
        
      if (!existingUser) {
        // Create user in public.users
        await adminSupabase.from('users').insert({
          id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User',
          email: user.email,
          password_hash: null, // Keep null for gateway users
        })
      }
      
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
