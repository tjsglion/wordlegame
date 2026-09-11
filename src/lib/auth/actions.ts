"use server";

import { signIn, signOut } from "@/auth";
import { resolveCallbackUrl } from "./callback-url";

export async function signInWithProvider(
  provider: "google" | "github",
  formData: FormData,
) {
  await signIn(provider, {
    redirectTo: resolveCallbackUrl(formData.get("callbackUrl")),
  });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
