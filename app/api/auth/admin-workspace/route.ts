import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { SignJWT } from 'jose'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const schoolId = searchParams.get('schoolId')
  
  if (!schoolId) {
    return NextResponse.redirect(`${origin}/join`)
  }
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.redirect(`${origin}/join`)
  }
  
  const adminClient = await createAdminClient()
  
  // Verify the user is an admin of this school
  const { data: adminCheck } = await adminClient
    .from("school_admins")
    .select("id")
    .eq("school_id", schoolId)
    .eq("user_id", user.id)
    .maybeSingle()
    
  if (!adminCheck) {
    return NextResponse.redirect(`${origin}/join`)
  }
  
  // Create local token
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error("JWT_SECRET is not configured on server");

  const localToken = await new SignJWT({ userId: user.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(jwtSecret));

  const cookieStore = await cookies();
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
    domain: '.alphanexoraai.com'
  };

  // The admin acts as an admin role with the organization ID being the school ID
  // (In D1, we might use this to grant them overarching access, or at least let them in)
  cookieStore.set('token', localToken, cookieOptions);
  cookieStore.set('sb-role', 'admin', cookieOptions);
  cookieStore.set('sb-org-id', schoolId, cookieOptions);

  const readoraUrl = process.env.NEXT_PUBLIC_READORA_URL || "https://redora.alphanexoraai.com";
  const nocache = Date.now();
  
  return NextResponse.redirect(`${readoraUrl}/?_nocache=${nocache}`);
}
