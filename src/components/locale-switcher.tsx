"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

const localeLabels: Record<string, string> = {
  zh: "ZH",
  en: "EN",
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div
      className="flex items-center rounded-full border border-border p-0.5"
      role="group"
      aria-label="Language"
    >
      {routing.locales.map((target) => (
        <Button
          key={target}
          type="button"
          size="sm"
          variant={target === locale ? "default" : "ghost"}
          className="h-11 rounded-full px-4 text-sm"
          disabled={isPending || target === locale}
          onClick={() =>
            startTransition(() => {
              router.replace(pathname, { locale: target });
            })
          }
        >
          {localeLabels[target] ?? target}
        </Button>
      ))}
    </div>
  );
}
