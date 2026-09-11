"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { signOutAction } from "@/lib/auth/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface UserProfileTriggerProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

function getProfileName(user: UserProfileTriggerProps["user"]): string {
  return user.name?.trim() || user.email?.trim() || "Player";
}

function getInitials(user: UserProfileTriggerProps["user"]): string {
  const source = getProfileName(user).replace(/\s+/g, " ").trim();
  const parts = source.split(" ").filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "WG";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "WG";
}

export function UserProfileTrigger({ user }: UserProfileTriggerProps) {
  const t = useTranslations("Common");
  const name = getProfileName(user);
  const email = user.email?.trim() || null;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="group relative flex shrink-0">
      <button
        type="button"
        aria-label={t("account")}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex size-11 items-center justify-center rounded-full text-foreground/68 transition-all hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        onClick={() => setOpen((current) => !current)}
      >
        <Avatar className="size-9 ring-1 ring-border/60 transition-transform duration-150 group-hover:scale-[1.02] group-focus-within:scale-[1.02]">
          {user.image ? <AvatarImage src={user.image} alt={name} /> : null}
          <AvatarFallback>{getInitials(user)}</AvatarFallback>
        </Avatar>
      </button>

      <div
        className="pointer-events-none invisible absolute top-full right-0 z-40 translate-y-2 pt-2 opacity-0 transition-all duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 data-[open=true]:pointer-events-auto data-[open=true]:visible data-[open=true]:translate-y-0 data-[open=true]:opacity-100"
        data-open={open}
      >
        <div className="w-64 rounded-[1.5rem] border border-border/70 bg-background/96 p-3 text-sm shadow-[0_24px_70px_-38px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          <div className="flex items-center gap-3 px-1 py-1">
            <Avatar className="size-10 ring-1 ring-border/60">
              {user.image ? <AvatarImage src={user.image} alt={name} /> : null}
              <AvatarFallback>{getInitials(user)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold tracking-[-0.02em] text-foreground">
                {name}
              </p>
              {email ? (
                <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
                  {email}
                </p>
              ) : null}
            </div>
          </div>

          <div className="my-2 h-px bg-border/70" />

          <div>
            <form action={signOutAction}>
              <Button
                type="submit"
                variant="ghost"
                className="h-10 w-full justify-start rounded-[1rem] px-3 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              >
                <LogOut aria-hidden />
                {t("logout")}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
