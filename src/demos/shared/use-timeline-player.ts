import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./use-reduced-motion";

/**
 * Drives a playhead from 0 to `duration` (in demo "ticks").
 * - Smooth playback via requestAnimationFrame at `ticksPerSecond`.
 * - With reduced motion, Play advances in whole ticks instead of gliding.
 * - Step / Reset work the same either way, so every demo is fully usable
 *   from the keyboard without watching anything animate.
 */
export function useTimelinePlayer(duration: number, ticksPerSecond = 2.2) {
  const reduced = useReducedMotion();
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const raf = useRef<number | null>(null);
  const last = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;

    if (reduced) {
      const id = window.setInterval(() => {
        setT((prev) => {
          const next = Math.min(duration, Math.floor(prev) + 1);
          if (next >= duration) setPlaying(false);
          return next;
        });
      }, 650);
      return () => window.clearInterval(id);
    }

    const frame = (now: number) => {
      const dt = last.current === null ? 0 : (now - last.current) / 1000;
      last.current = now;
      setT((prev) => {
        const next = Math.min(duration, prev + dt * ticksPerSecond);
        if (next >= duration) setPlaying(false);
        return next;
      });
      raf.current = requestAnimationFrame(frame);
    };
    raf.current = requestAnimationFrame(frame);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
      last.current = null;
    };
  }, [playing, reduced, duration, ticksPerSecond]);

  const play = useCallback(() => {
    setT((prev) => (prev >= duration ? 0 : prev));
    setPlaying(true);
  }, [duration]);
  const pause = useCallback(() => setPlaying(false), []);
  const step = useCallback(() => {
    setPlaying(false);
    setT((prev) => Math.min(duration, Math.floor(prev) + 1));
  }, [duration]);
  const reset = useCallback(() => {
    setPlaying(false);
    setT(0);
  }, []);

  return { t, playing, play, pause, step, reset, done: t >= duration };
}
