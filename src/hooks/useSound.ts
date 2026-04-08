import { useCallback } from "react";

export type SoundType = "correct" | "wrong" | "star";

export function useSound() {
  const playSound = useCallback((type: SoundType) => {
    try {
      const ctx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      if (type === "correct") {
        [523.25, 659.25, 783.99].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(
            0.001,
            ctx.currentTime + i * 0.1 + 0.3,
          );
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.1);
          osc.stop(ctx.currentTime + i * 0.1 + 0.3);
        });
      } else if (type === "wrong") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = 220;
        osc.frequency.linearRampToValueAtTime(160, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === "star") {
        [880, 1047, 1319].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(
            0.001,
            ctx.currentTime + i * 0.12 + 0.2,
          );
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.12);
          osc.stop(ctx.currentTime + i * 0.12 + 0.2);
        });
      }
    } catch (e) {
      // Ignore audio errors
    }
  }, []);

  return { playSound };
}
