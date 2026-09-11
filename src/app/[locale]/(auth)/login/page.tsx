import { getTranslations } from "next-intl/server";
import { getSession } from "@/lib/auth/utils";
import { resolveCallbackUrl } from "@/lib/auth/callback-url";
import { redirect } from "@/i18n/navigation";
import { SignInPanel } from "@/components/auth/sign-in-panel";

const errorKeys = [
  "OAuthSignin",
  "OAuthCallback",
  "OAuthCreateAccount",
  "OAuthAccountNotLinked",
  "Callback",
  "AccessDenied",
  "Configuration",
] as const;

export default async function LoginPage({
  params,
  searchParams,
}: PageProps<"/[locale]/login">) {
  const { locale } = await params;
  const query = await searchParams;
  const t = await getTranslations("LoginPage");

  const error = typeof query.error === "string" ? query.error : undefined;
  const callbackUrl = resolveCallbackUrl(query.callbackUrl);

  // Already signed in: leave the login page immediately.
  const session = await getSession();
  if (session?.user) {
    redirect({ href: callbackUrl, locale });
  }

  const errorKey =
    error && (errorKeys as readonly string[]).includes(error)
      ? error
      : "default";
  const errorMessage = error ? t(`errors.${errorKey}`) : null;

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <SignInPanel
        title={t("title")}
        description={t("description")}
        googleLabel={t("signInWithGoogle")}
        githubLabel={t("signInWithGitHub")}
        callbackUrl={callbackUrl}
        errorMessage={errorMessage}
        className="w-full max-w-sm"
      />
    </div>
  );
}
