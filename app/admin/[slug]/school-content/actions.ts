"use server";

import { createAdminClient, createClient } from "@/utils/supabase/server";
import { SignJWT } from "jose";

import { unstable_noStore as noStore } from "next/cache";

export async function getGrades() {
  noStore();
  const adminClient = await createAdminClient();
  
  const { data, error } = await adminClient
    .from("curriculum_library")
    .select("grade, subject")
    .limit(100000);

  if (error) {
    console.error("Error fetching grades:", error);
    return [];
  }

  // 1. Diagnostic logging
  console.log("--- Diagnostic Logging: Curriculum Library ---");
  const gradeSubjectCounts: Record<string, number> = {};
  let nullOrEmptyCount = 0;

  data.forEach((row: any) => {
    if (!row.grade || row.grade.trim() === "") {
      nullOrEmptyCount++;
    } else {
      const key = `${row.grade.trim()} - ${row.subject || 'unknown'}`;
      gradeSubjectCounts[key] = (gradeSubjectCounts[key] || 0) + 1;
    }
  });

  console.log(`Total rows fetched: ${data.length}`);
  console.log(`Rows with null/empty grade: ${nullOrEmptyCount}`);
  console.log("Grade + Subject counts:", gradeSubjectCounts);
  console.log("----------------------------------------------");

  // 2. Normalize and get distinct grades
  const grades = Array.from(
    new Set(
      data
        .map((d: any) => (d.grade ? d.grade.trim() : ""))
        .filter(Boolean)
    )
  ).sort();
  
  console.log('Fetched distinct normalized grades:', grades);
  return grades;
}

export async function getSubjectsByGrade(grade: string) {
  noStore();
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

  // 1. Clear any legacy host-only AND parent-domain class cookies to prevent duplicate or stale cookie issues
  cookieStore.set('token', '', { path: '/', maxAge: 0 });
  cookieStore.set('sb-role', '', { path: '/', maxAge: 0 });
  cookieStore.set('sb-org-id', '', { path: '/', maxAge: 0 });
  cookieStore.set('sb-role', '', { path: '/', domain: '.alphanexoraai.com', maxAge: 0 });
  cookieStore.set('sb-org-id', '', { path: '/', domain: '.alphanexoraai.com', maxAge: 0 });

  // 2. Set new cookies on parent domain
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
