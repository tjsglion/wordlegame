"use client";

import { useEffect } from "react";

interface UseOverlayBehaviorOptions {
  open: boolean;
  portalRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  initialFocusSelector?: string;
}

type InertElement = HTMLElement & { inert: boolean };

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(
    (element) =>
      !element.hasAttribute("disabled") &&
      element.getAttribute("aria-hidden") !== "true" &&
      element.getClientRects().length > 0,
  );
}

export function useOverlayBehavior({
  open,
  portalRef,
  onClose,
  initialFocusSelector = "[data-overlay-initial-focus]",
}: UseOverlayBehaviorOptions) {
  useEffect(() => {
    if (!open) return;

    const portal = portalRef.current;
    if (!portal) return;

    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const scrollY = window.scrollY;
    const openUrl = window.location.href;

    const previousBodyStyles = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      left: document.body.style.left,
      right: document.body.style.right,
      overscrollBehavior: document.body.style.overscrollBehavior,
    };
    const siblingStates = Array.from(document.body.children)
      .filter((element) => element !== portal)
      .map((element) => ({
        element: element as InertElement,
        inert: (element as InertElement).inert,
        ariaHidden: element.getAttribute("aria-hidden"),
      }));

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overscrollBehavior = "none";

    siblingStates.forEach(({ element }) => {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });

    const focusInitialElement = () => {
      const preferredTarget = portal.querySelector<HTMLElement>(
        initialFocusSelector,
      );
      const firstFocusable = getFocusableElements(portal)[0];
      const nextTarget = preferredTarget ?? firstFocusable ?? portal;

      nextTarget.focus();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements(portal);
      if (focusableElements.length === 0) {
        event.preventDefault();
        portal.focus();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const frame = window.requestAnimationFrame(focusInitialElement);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);

      siblingStates.forEach(({ element, inert, ariaHidden }) => {
        element.inert = inert;
        if (ariaHidden === null) {
          element.removeAttribute("aria-hidden");
        } else {
          element.setAttribute("aria-hidden", ariaHidden);
        }
      });

      document.body.style.overflow = previousBodyStyles.overflow;
      document.body.style.position = previousBodyStyles.position;
      document.body.style.top = previousBodyStyles.top;
      document.body.style.width = previousBodyStyles.width;
      document.body.style.left = previousBodyStyles.left;
      document.body.style.right = previousBodyStyles.right;
      document.body.style.overscrollBehavior = previousBodyStyles.overscrollBehavior;

      if (window.location.href === openUrl) {
        window.scrollTo({ top: scrollY });
        if (previousFocus?.isConnected) {
          previousFocus.focus();
        }
      }
    };
  }, [initialFocusSelector, onClose, open, portalRef]);
}
