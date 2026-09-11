"use client";

import { useEffect } from "react";

/**
 * Keeps <html lang> in sync after client-side locale switches. The initial
 * document's lang is seeded by the inline script in the root layout; this
 * covers in-app navigation between /zh and /en.
 */
export function LangSync({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
