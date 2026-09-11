"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { createPortal } from "react-dom";
import { LogIn, X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { SignInPanel } from "@/components/auth/sign-in-panel";
import { Button } from "@/components/ui/button";
import { useOverlayBehavior } from "@/components/ui/use-overlay-behavior";
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
  const portalRef = useRef<HTMLDivElement>(null);

  useOverlayBehavior({
    open,
    portalRef,
    onClose: () => setOpen(false),
  });

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

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
                ref={portalRef}
              className="fixed inset-0 z-[60]"
              aria-modal="true"
              role="dialog"
              aria-label={tLogin("title")}
                tabIndex={-1}
            >
              <button
                type="button"
                aria-label={tCommon("closeMenu")}
                className="absolute inset-0 touch-none bg-black/28 backdrop-blur-[2px]"
                onClick={() => setOpen(false)}
              />

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
                <div
                  className={cn(
                    "pointer-events-auto relative w-full max-w-sm animate-in fade-in-0 zoom-in-95 duration-150",
                  )}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    className="absolute top-3 right-3 z-10 size-11 rounded-full text-muted-foreground hover:text-foreground"
                    aria-label={tCommon("closeMenu")}
                    data-overlay-close
                      data-overlay-initial-focus
                    onClick={() => setOpen(false)}
                  >
                    <X aria-hidden />
                  </Button>

                  <SignInPanel
                    title={tLogin("title")}
                    description={tLogin("description")}
                    googleLabel={tLogin("signInWithGoogle")}
                    githubLabel={tLogin("signInWithGitHub")}
                    callbackUrl={callbackUrl}
                    className="border-0 shadow-2xl ring-1 ring-foreground/10"
                  />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
