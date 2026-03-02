import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import DoomDashboard from "@/components/DoomDashboard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return <DoomDashboard user={user} profile={profile} />;
}
