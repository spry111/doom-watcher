"use server";

import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { redirect } from "next/navigation";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function acceptDisclaimer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("user_profiles")
    .update({ disclaimer_accepted_at: new Date().toISOString() })
    .eq("id", user.id);
}

export async function resetDisclaimer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("user_profiles")
    .update({ disclaimer_accepted_at: null })
    .eq("id", user.id);

  redirect("/dashboard");
}

export async function deleteAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Sign out first so cookies are cleared
  await supabase.auth.signOut();

  // Delete via admin client (bypasses RLS; CASCADE removes user_profiles row)
  await supabaseAdmin.auth.admin.deleteUser(user.id);

  redirect("/");
}
