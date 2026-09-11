/**
 * Vibration feedback with feature detection.
 *
 * `navigator.vibrate` is Android-only; iOS Safari ignores it. Unsupported
 * environments degrade silently. The mute switch in sound.ts gates haptics
 * too — one toggle controls both channels.
 */

import { isMuted } from "./sound";

export function vibrate(pattern: VibratePattern): void {
  if (isMuted()) return;
  if (typeof navigator === "undefined") return;
  if (typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // Vibration can throw in odd embedding contexts — never break gameplay.
  }
}

/** Key press tick. */
export function vibrateKey(): void {
  vibrate(10);
}

/** Rejected guess. */
export function vibrateInvalid(): void {
  vibrate(50);
}

/** Single word solved. */
export function vibrateSolved(): void {
  vibrate([25, 40, 25]);
}

/** Win celebration pattern. */
export function vibrateWin(): void {
  vibrate([30, 50, 30, 50, 80]);
}
