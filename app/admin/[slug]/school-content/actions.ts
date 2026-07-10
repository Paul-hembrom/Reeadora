"use server";

import { createAdminClient, createClient } from "@/utils/supabase/server";
import { SignJWT } from "jose";

export async function getSubjectsByGrade(grade: string) {
  const adminClient = await createAdminClient();
  const { data, error } = await adminClient
    .from("curriculum_library")
    .select("id, subject, title, subtopic")
    .eq("grade", grade)
    .order("title")
    .order("subtopic");

  if (error) {
    console.error("Error fetching subjects:", error);
    return [];
  }

  return data;
}

export async function prepareContentRedirect(role: string, orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated" };
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error("JWT_SECRET is not configured on server");

  const localToken = await new SignJWT({ userId: user.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(jwtSecret));

  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
    domain: '.alphanexoraai.com'
  };

  cookieStore.set('token', localToken, cookieOptions);
  cookieStore.set('sb-role', role, cookieOptions);
  cookieStore.set('sb-org-id', orgId, cookieOptions);

  return { success: true };
}
