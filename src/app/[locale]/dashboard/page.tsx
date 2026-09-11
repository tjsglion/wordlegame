import { getTranslations } from "next-intl/server";
import { requireAuth } from "@/lib/auth/utils";
import { signOutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage({
  params,
}: PageProps<"/[locale]/dashboard">) {
  const { locale } = await params;
  const t = await getTranslations("DashboardPage");
  const tCommon = await getTranslations("Common");
  const session = await requireAuth(`/${locale}/dashboard`);

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{t("name")}</dt>
              <dd className="font-medium">{session.user.name ?? "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{t("email")}</dt>
              <dd className="font-medium">{session.user.email ?? "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{t("userId")}</dt>
              <dd className="font-mono text-xs">{session.user.id}</dd>
            </div>
          </dl>
          <form action={signOutAction}>
            <Button type="submit" variant="outline" className="w-full">
              {tCommon("logout")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
