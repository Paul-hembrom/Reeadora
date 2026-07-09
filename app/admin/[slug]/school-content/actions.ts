"use server";

import { createAdminClient } from "@/utils/supabase/server";

export async function getSubjectsByGrade(grade: string) {
  const adminClient = await createAdminClient();
  const { data, error } = await adminClient
    .from("curriculum_library")
    .select("subject, title")
    .eq("grade", grade);

  if (error) {
    console.error("Error fetching subjects:", error);
    return [];
  }

  return data;
}
