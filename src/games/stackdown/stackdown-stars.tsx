"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { STAR_COUNT, stackdownStars } from "./shared";

/** Shared visual score used by the completed stage and the result overlay. */
export function StackdownStars({ hintsUsed }: { hintsUsed: number }) {
  const t = useTranslations("Stackdown");
  const filled = stackdownStars(hintsUsed);

  return (
    <div
      className="flex items-center justify-center gap-1"
      role="img"
      aria-label={t("a11y.stars", { filled })}
    >
      {Array.from({ length: STAR_COUNT }, (_, index) => (
        <Star
          key={index}
          aria-hidden
          className={`sd-star size-7 ${index < filled ? "filled" : "empty"}`}
        />
      ))}
    </div>
  );
}
