"use client";

import { useEffect, useState, type ComponentProps } from "react";
import { LogIn } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { SignInPanel } from "@/components/auth/sign-in-panel";
import { GameModalShell } from "@/components/game/game-modal-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const OPEN_LOGIN_MODAL_EVENT = "wordle:open-login";

export function openLoginModal(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_LOGIN_MODAL_EVENT));
}

interface LoginModalProps {
  triggerLabel?: string;
  triggerAriaLabel?: string;
  triggerVariant?: ComponentProps<typeof Button>["variant"];
  triggerClassName?: string;
  showIcon?: boolean;
}

export function LoginModal({
  triggerLabel,
  triggerAriaLabel,
  triggerVariant = "ghost",
  triggerClassName,
  showIcon = true,
}: LoginModalProps = {}) {
  const tCommon = useTranslations("Common");
  const tLogin = useTranslations("LoginPage");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const callbackUrl = queryString ? `${pathname}?${queryString}` : pathname;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOpen = () => setOpen(true);
    window.addEventListener(OPEN_LOGIN_MODAL_EVENT, handleOpen);

    return () => {
      window.removeEventListener(OPEN_LOGIN_MODAL_EVENT, handleOpen);
    };
  }, []);

  return (
    <>
      <Button
        type="button"
        variant={triggerVariant}
        className={cn(
          triggerLabel
            ? "h-11 rounded-full px-4"
            : "size-11 rounded-full text-foreground/68 hover:text-foreground",
          triggerClassName,
        )}
        aria-label={triggerAriaLabel ?? tCommon("login")}
        onClick={() => setOpen(true)}
      >
        {showIcon ? <LogIn aria-hidden /> : null}
        {triggerLabel ? <span>{triggerLabel}</span> : null}
      </Button>

      <GameModalShell
        open={open}
        onClose={() => setOpen(false)}
        variant="compact"
        titleId="login-modal-title"
        descriptionId="login-modal-description"
        closeButtonAriaLabel={tCommon("closeMenu")}
        classNames={{
          panel: "max-w-sm border-0 bg-transparent p-0 shadow-none",
          closeButton: "top-3 right-3",
        }}
      >
        <SignInPanel
          title={tLogin("title")}
          description={tLogin("description")}
          googleLabel={tLogin("signInWithGoogle")}
          githubLabel={tLogin("signInWithGitHub")}
          callbackUrl={callbackUrl}
          titleId="login-modal-title"
          descriptionId="login-modal-description"
          className="border-0 shadow-2xl ring-1 ring-foreground/10"
        />
      </GameModalShell>
    </>
  );
}
