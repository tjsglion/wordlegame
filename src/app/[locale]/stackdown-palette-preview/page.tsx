import { setRequestLocale } from "next-intl/server";
import { StackdownPalettePreview } from "@/components/stackdown/stackdown-palette-preview";
import { SiteShell } from "@/components/layout/site-shell";
import { getSession } from "@/lib/auth/utils";

export default async function StackdownPalettePreviewPage({
  params,
}: PageProps<"/[locale]/stackdown-palette-preview">) {
  const { locale } = await params;
  // The locale layout rejects unknown locales before this page renders.
  setRequestLocale(locale);

  const session = await getSession();

  return (
    <SiteShell
      pageTitle="Stackdown 配色试用"
      currentSlug="stackdown"
      isAuthenticated={Boolean(session?.user)}
      playfield
      user={session?.user ?? null}
    >
      <StackdownPalettePreview />
    </SiteShell>
  );
}
