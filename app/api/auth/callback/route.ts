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
      
      // Superadmin check
      const superadminEmail = process.env.SUPERADMIN_EMAIL;
      let finalNext = next;
      if (
        superadminEmail &&
        user.email &&
        user.email.toLowerCase() === superadminEmail.toLowerCase()
      ) {
        finalNext = '/superadmin';
      }

      const { data: existingUser } = await adminSupabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()
        
      if (!existingUser) {
        // Create user in public.users
        const { error: insertError } = await adminSupabase.from('users').insert({
          id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User',
          email: user.email,
          password_hash: null, // Keep null for gateway users
        })
        if (insertError) {
          console.error("Failed to insert user:", insertError)
        }
      }
      
      if (user.email) {
        const { data: invitations } = await adminSupabase
          .from('teacher_invitations')
          .select('*')
          .eq('email', user.email)
          .eq('status', 'pending');

        if (invitations && invitations.length > 0) {
          for (const inv of invitations) {
            const { data: existingMember } = await adminSupabase
              .from('organization_members')
              .select('id')
              .eq('organization_id', inv.org_id)
              .eq('user_id', user.id)
              .maybeSingle();

            if (!existingMember) {
              await adminSupabase.from('organization_members').insert({
                organization_id: inv.org_id,
                user_id: user.id,
                role: 'teacher'
              });
            }

            await adminSupabase.from('teacher_assignments').insert({
              teacher_user_id: user.id,
              org_id: inv.org_id,
              subjects: inv.subjects
            });

            await adminSupabase.from('teacher_invitations').update({
              status: 'accepted'
            }).eq('id', inv.id);
          }
        }
      }

      const nextUrl = new URL(finalNext, origin)
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(nextUrl)
      } else if (forwardedHost) {
        // Clean up forwardedHost if it has multiple values
        const primaryHost = forwardedHost.split(',')[0].trim()
        nextUrl.host = primaryHost
        nextUrl.protocol = 'https:'
        return NextResponse.redirect(nextUrl)
      } else {
        return NextResponse.redirect(nextUrl)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
