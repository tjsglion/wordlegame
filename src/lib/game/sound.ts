/**
 * Procedural sound effects via Web Audio — no audio files.
 *
 * The AudioContext is created lazily on the first play call, which always
 * originates from a user gesture (key press / tap), satisfying browser
 * autoplay policies. A suspended context is resumed on every play.
 *
 * The mute switch is shared with haptics (one toggle controls both) and
 * persisted in localStorage under the global "_global" slug so it applies
 * to every game on the platform.
 */

import { loadGameData, saveGameData } from "./storage";

const SLUG = "_global";
const MUTE_KEY = "muted";

type MuteListener = (muted: boolean) => void;

let muted = false;
let initialized = false;
let ctx: AudioContext | null = null;
const listeners = new Set<MuteListener>();

function ensureInit(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  muted = loadGameData(SLUG, MUTE_KEY, false);
}

export function isMuted(): boolean {
  ensureInit();
  return muted;
}

export function setMuted(value: boolean): void {
  ensureInit();
  muted = value;
  saveGameData(SLUG, MUTE_KEY, value);
  listeners.forEach((listener) => listener(value));
}

/** Subscribe to mute changes; returns an unsubscribe function. */
export function subscribeMute(listener: MuteListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtor) return null;
  ctx ??= new AudioCtor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

interface ToneOptions {
  /** Frequency in Hz. */
  freq: number;
  /** Start offset in seconds from now (for sequencing). */
  at?: number;
  /** Note length in seconds. */
  duration: number;
  type?: OscillatorType;
  /** Peak gain, keep small — these are UI blips. */
  volume?: number;
}

function tone({ freq, at = 0, duration, type = "sine", volume = 0.12 }: ToneOptions): void {
  if (isMuted()) return;
  const ac = audioContext();
  if (!ac) return;
  const start = ac.currentTime + at;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/** Short click for a key press. */
export function playKey(): void {
  tone({ freq: 700, duration: 0.05, type: "square", volume: 0.05 });
}

/** Soft tap when a guess is accepted and the flip starts. */
export function playTap(): void {
  tone({ freq: 420, duration: 0.09, type: "triangle", volume: 0.12 });
}

/** Quick rising two-note chirp when a single word is solved. */
export function playSolved(): void {
  [523.25, 783.99].forEach((freq, i) =>
    tone({ freq, at: i * 0.08, duration: 0.14, type: "triangle", volume: 0.12 }),
  );
}

/** Low buzz for a rejected guess. */
export function playInvalid(): void {
  tone({ freq: 160, duration: 0.12, type: "sawtooth", volume: 0.07 });
}

/** Ascending arpeggio on a win. */
export function playWin(): void {
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) =>
    tone({ freq, at: i * 0.09, duration: 0.18, type: "triangle", volume: 0.12 }),
  );
}

/** Descending low notes on a loss. */
export function playLose(): void {
  [330, 262, 196].forEach((freq, i) =>
    tone({ freq, at: i * 0.12, duration: 0.22, type: "sine", volume: 0.12 }),
  );
}
