"use client";

import { useEffect, useRef } from "react";
import { Application, Graphics } from "pixi.js";

/**
 * PixiJS-powered confetti overlay for win celebrations.
 *
 * This is the "presentation enhancement" layer of the platform: game logic
 * stays in React/DOM, PixiJS only renders effects. The component must be
 * loaded with `next/dynamic` + `ssr: false` (PixiJS needs browser APIs).
 *
 * It covers the viewport with a pointer-transparent canvas, rains confetti
 * for `duration` ms, fades out, destroys the Pixi application, then calls
 * `onDone`.
 */

const CONFETTI_COLORS = [
  0x22c55e, 0xeab308, 0x3b82f6, 0xef4444, 0xa855f7, 0xf97316,
];
const PARTICLE_COUNT = 160;

interface Particle {
  sprite: Graphics;
  vx: number;
  vy: number;
  vr: number;
}

interface WinConfettiProps {
  play: boolean;
  duration?: number;
  onDone?: () => void;
}

export default function WinConfetti({
  play,
  duration = 3500,
  onDone,
}: WinConfettiProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const host = hostRef.current;
    if (!play || !host) return;

    // Respect reduced motion: skip the confetti rain entirely.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onDoneRef.current?.();
      return;
    }

    let destroyed = false;
    const app = new Application();

    const cleanup = () => {
      if (destroyed) return;
      destroyed = true;
      try {
        app.destroy({ removeView: true }, { children: true });
      } catch {
        // already destroyed
      }
      onDoneRef.current?.();
    };

    void (async () => {
      await app.init({ resizeTo: window, backgroundAlpha: 0, antialias: true });
      if (destroyed) {
        try {
          app.destroy({ removeView: true }, { children: true });
        } catch {
          // ignore
        }
        return;
      }
      host.appendChild(app.canvas);

      const particles: Particle[] = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const sprite = new Graphics();
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        if (i % 2 === 0) {
          sprite.rect(-4, -2, 8, 5).fill(color);
        } else {
          sprite.circle(0, 0, 3).fill(color);
        }
        sprite.x = Math.random() * window.innerWidth;
        sprite.y = -20 - Math.random() * window.innerHeight * 0.4;
        app.stage.addChild(sprite);
        particles.push({
          sprite,
          vx: (Math.random() - 0.5) * 4,
          vy: 2 + Math.random() * 4,
          vr: (Math.random() - 0.5) * 0.3,
        });
      }

      const start = performance.now();
      const fadeStart = duration - 800;
      app.ticker.add(() => {
        const dt = app.ticker.deltaTime;
        for (const p of particles) {
          p.vy += 0.05 * dt; // gravity
          p.sprite.x += p.vx * dt;
          p.sprite.y += p.vy * dt;
          p.sprite.rotation += p.vr * dt;
        }
        const elapsed = performance.now() - start;
        if (elapsed > fadeStart) {
          app.stage.alpha = Math.max(0, 1 - (elapsed - fadeStart) / 800);
        }
        if (elapsed >= duration) {
          cleanup();
        }
      });
    })();

    return cleanup;
  }, [play, duration]);

  if (!play) return null;

  return (
    <div
      ref={hostRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50"
    />
  );
}
