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

      const initialNextUrl = new URL(finalNext, origin);
      const joinToken = initialNextUrl.searchParams.get('join_token');
      if (joinToken) {
        const { jwtVerify, SignJWT } = await import('jose');
        try {
          const jwtSecret = process.env.JWT_SECRET;
          if (!jwtSecret) throw new Error("JWT_SECRET is not configured on server");
          
          const { payload } = await jwtVerify(joinToken, new TextEncoder().encode(jwtSecret));
          const orgId = payload.org_id as string;
          const role = payload.role as string;
          
          if (orgId && role) {
            // Upsert member
            const { data: memberRecordCheck } = await adminSupabase
              .from("organization_members")
              .select("id")
              .eq("organization_id", orgId)
              .eq("user_id", user.id)
              .maybeSingle();

            if (!memberRecordCheck) {
              await adminSupabase.from('organization_members').insert({
                organization_id: orgId,
                user_id: user.id,
                role
              });
            }

            const { data: memberRecord } = await adminSupabase
              .from("organization_members")
              .select("role")
              .eq("organization_id", orgId)
              .eq("user_id", user.id)
              .maybeSingle();

            const actualRole = memberRecord?.role || role;

            const token = await new SignJWT({ user_id: user.id, org_id: orgId, role: actualRole })
              .setProtectedHeader({ alg: 'HS256' })
              .setExpirationTime('7d')
              .sign(new TextEncoder().encode(jwtSecret));

            const readoraUrl = process.env.NEXT_PUBLIC_READORA_URL || "https://redora.alphanexoraai.com";
            finalNext = `${readoraUrl}/auth/token-exchange?token=${token}&role=${actualRole}&org_id=${orgId}`;
          }
        } catch (e) {
          console.error("Invalid join_token", e);
        }
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
