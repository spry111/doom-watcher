"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (password.length < 8) {
    redirect("/signup?error=Password+must+be+at+least+8+characters");
  }

  if (password !== confirmPassword) {
    redirect("/signup?error=Passwords+do+not+match");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    const msg = error.message.includes("already registered")
      ? "An+account+with+this+email+already+exists"
      : encodeURIComponent(error.message);
    redirect(`/signup?error=${msg}`);
  }

  redirect("/login?message=Check+your+email+to+confirm+your+account");
}

export async function signUpWithGoogle() {
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    redirect("/signup?error=Google+sign-up+failed");
  }

  if (data.url) {
    redirect(data.url);
  }
}
