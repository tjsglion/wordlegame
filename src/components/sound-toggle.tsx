"use client";

import { useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useTranslations } from "next-intl";
import { isMuted, playKey, setMuted, subscribeMute } from "@/lib/game/sound";

/**
 * Site-header toggle for sound + haptics. Mute state lives in sound.ts and
 * persists to localStorage, so the button stays in sync across tabs of the
 * same page and across games.
 */
export function SoundToggle() {
  const t = useTranslations("Common");
  const muted = useSyncExternalStore(
    subscribeMute,
    isMuted,
    () => false, // server snapshot: sound modules are client-only anyway
  );

  return (
    <button
      type="button"
      onClick={() => {
        const next = !muted;
        setMuted(next);
        // Audible confirmation when turning sound back on.
        if (!next) playKey();
      }}
      aria-label={t("toggleSound")}
      aria-pressed={muted}
      className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-muted hover:text-brand active:scale-90"
    >
      {muted ? (
        <VolumeX className="h-4 w-4" aria-hidden />
      ) : (
        <Volume2 className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}
