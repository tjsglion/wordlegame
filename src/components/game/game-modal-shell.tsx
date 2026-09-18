"use client";

import { type CSSProperties, type ReactNode, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOverlayBehavior } from "@/components/ui/use-overlay-behavior";
import { cn } from "@/lib/utils";

type GameModalVariant = "page" | "sheet" | "compact" | "drawer";

type ModalSlot =
  | "root"
  | "overlay"
  | "frame"
  | "panel"
  | "content"
  | "closeButton";

type ModalSlotClassNames = Record<ModalSlot, string>;
type GameModalClassNames = Partial<ModalSlotClassNames>;
type GameModalStyles = {
  frame?: CSSProperties;
  panel?: CSSProperties;
};

interface GameModalShellProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  variant?: GameModalVariant;
  titleId?: string;
  descriptionId?: string;
  ariaLabel?: string;
  closeButtonAriaLabel: string;
  /** Slot-level class overrides. Use this instead of adding a new prop per slot. */
  classNames?: GameModalClassNames;
  /** Inline styles needed for measured layout, kept separate from visual classes. */
  styles?: GameModalStyles;
  showCloseButton?: boolean;
}

/** Structure shared by every modal; variants only need to declare their differences. */
const BASE_SLOT_CLASS_NAMES: ModalSlotClassNames = {
  root: "fixed inset-0",
  overlay: "absolute inset-0",
  frame: "absolute inset-0",
  panel: "",
  content: "",
  closeButton: "",
};

const VARIANT_CLASS_NAMES: Record<GameModalVariant, ModalSlotClassNames> = {
  page: {
    root: "z-[60]",
    overlay: "touch-none bg-black/28 backdrop-blur-[2px]",
    frame: "pointer-events-none flex justify-center",
    panel:
      "pointer-events-auto relative h-full w-full max-w-4xl overflow-hidden bg-card shadow-2xl sm:border-x sm:border-border/80",
    content:
      "h-full overflow-y-auto px-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-[calc(env(safe-area-inset-bottom)+1.5rem)] sm:px-6 sm:pt-[calc(env(safe-area-inset-top)+1.5rem)]",
    closeButton:
      "absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 z-10 size-11 rounded-full text-muted-foreground hover:text-foreground",
  },
  sheet: {
    root: "z-[65]",
    overlay: "touch-none bg-black/30 backdrop-blur-[2px]",
    frame:
      "pointer-events-none flex items-end justify-center p-3 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-center sm:p-4",
    panel:
      "pointer-events-auto relative w-full max-w-sm rounded-[1.6rem] border border-border/80 bg-card/96 p-4 text-foreground shadow-[0_28px_90px_-24px_rgba(0,0,0,0.52)] supports-[backdrop-filter]:backdrop-blur-xl",
    content: "",
    closeButton:
      "absolute top-2 right-2 z-10 size-11 rounded-full text-muted-foreground hover:text-foreground",
  },
  compact: {
    root: "z-[65]",
    overlay: "touch-none bg-black/28 backdrop-blur-[2px]",
    frame:
      "pointer-events-none flex items-center justify-center p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]",
    panel:
      "pointer-events-auto relative w-full max-w-sm rounded-[1.4rem] border border-border/80 bg-card p-4 text-foreground shadow-[0_24px_64px_-30px_rgba(0,0,0,0.45)]",
    content: "",
    closeButton:
      "absolute top-2 right-2 z-10 size-11 rounded-full text-muted-foreground hover:text-foreground",
  },
  drawer: {
    root: "z-50",
    overlay: "bg-black/10 supports-backdrop-filter:backdrop-blur-xs",
    frame: "",
    panel:
      "fixed top-0 right-auto bottom-0 h-dvh max-h-dvh overflow-hidden rounded-none border-y-0 border-l-0 border-r border-border/80 bg-card/95 p-0 shadow-[24px_0_80px_-40px_rgba(0,0,0,0.45)] backdrop-blur-xl",
    content: "flex h-full flex-col",
    closeButton:
      "absolute top-3 right-3 z-10 size-11 rounded-full text-foreground/68 hover:text-foreground",
  },
};

function resolveSlotClassNames(
  variant: GameModalVariant,
  overrides: GameModalClassNames | undefined,
): ModalSlotClassNames {
  const variantClassNames = VARIANT_CLASS_NAMES[variant];
  return {
    root: cn(BASE_SLOT_CLASS_NAMES.root, variantClassNames.root, overrides?.root),
    overlay: cn(
      BASE_SLOT_CLASS_NAMES.overlay,
      variantClassNames.overlay,
      overrides?.overlay,
    ),
    frame: cn(BASE_SLOT_CLASS_NAMES.frame, variantClassNames.frame, overrides?.frame),
    panel: cn(BASE_SLOT_CLASS_NAMES.panel, variantClassNames.panel, overrides?.panel),
    content: cn(
      BASE_SLOT_CLASS_NAMES.content,
      variantClassNames.content,
      overrides?.content,
    ),
    closeButton: cn(
      BASE_SLOT_CLASS_NAMES.closeButton,
      variantClassNames.closeButton,
      overrides?.closeButton,
    ),
  };
}

export function GameModalShell({
  open,
  onClose,
  children,
  variant = "compact",
  titleId,
  descriptionId,
  ariaLabel,
  closeButtonAriaLabel,
  classNames,
  styles,
  showCloseButton = true,
}: GameModalShellProps) {
  const portalRef = useRef<HTMLDivElement>(null);
  const slotClassNames = resolveSlotClassNames(variant, classNames);

  useOverlayBehavior({
    open,
    portalRef,
    onClose,
  });

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      ref={portalRef}
      className={slotClassNames.root}
      aria-modal="true"
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-label={ariaLabel}
      tabIndex={-1}
    >
      <button
        type="button"
        aria-label={closeButtonAriaLabel}
        className={slotClassNames.overlay}
        onClick={onClose}
      />

      <div className={slotClassNames.frame} style={styles?.frame}>
        <div className={slotClassNames.panel} style={styles?.panel}>
          {showCloseButton ? (
            <Button
              type="button"
              variant="ghost"
              className={slotClassNames.closeButton}
              aria-label={closeButtonAriaLabel}
              data-overlay-close
              data-overlay-initial-focus
              onClick={onClose}
            >
              <X aria-hidden />
            </Button>
          ) : null}

          <div className={slotClassNames.content}>{children}</div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
