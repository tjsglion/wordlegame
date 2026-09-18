import { useCallback, useEffect, useRef, useState } from "react";

/** Owns elapsed-time accumulation and pauses it while the document is hidden. */
export function useStackdownTimer(isPlaying: boolean) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [hidden, setHidden] = useState(false);
  const elapsedRef = useRef(0);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (!isPlaying || hidden) return;
    let last = Date.now();
    const accumulate = () => {
      const now = Date.now();
      elapsedRef.current += Math.max(0, now - last);
      last = now;
      setElapsedMs(elapsedRef.current);
    };
    const id = window.setInterval(accumulate, 1000);
    return () => {
      window.clearInterval(id);
      accumulate();
    };
  }, [isPlaying, hidden]);

  const reset = useCallback((nextElapsedMs = 0) => {
    elapsedRef.current = nextElapsedMs;
    setElapsedMs(nextElapsedMs);
  }, []);

  return { elapsedMs, elapsedRef, reset };
}
