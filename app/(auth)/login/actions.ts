"use server";

import { revalidatePath } from "next/cache";
import { redirectWithToast } from "@/lib/redirect-with-toast";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  error: string | null;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email dan kata sandi wajib diisi." };
  }

  if (!EMAIL_PATTERN.test(email)) {
    return { error: "Format email tidak valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Email atau kata sandi salah. Silakan coba lagi." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Gagal memverifikasi sesi. Silakan coba lagi." };
  }

  revalidatePath("/", "layout");
  redirectWithToast("/dashboard", "login-success");
}
