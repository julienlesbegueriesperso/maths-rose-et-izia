import { useRef, useEffect, useCallback } from "react";

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  color: string;
  rotation: number;
  rotSpeed: number;
  life: number;
}

export function useConfetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animIdRef = useRef<number | null>(null);
  const particlesRef = useRef<ConfettiParticle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      ctxRef.current = canvas.getContext("2d");
      resizeConfetti();
      window.addEventListener("resize", resizeConfetti);
    }
    return () => {
      window.removeEventListener("resize", resizeConfetti);
    };
  }, []);

  function resizeConfetti() {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }

  const animateConfetti = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particlesRef.current = particlesRef.current.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.rotation += p.rotSpeed;
      p.life -= 0.006;

      if (p.life > 0 && p.y < canvas.height + 50) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
        return true;
      }
      return false;
    });

    if (particlesRef.current.length > 0) {
      animIdRef.current = requestAnimationFrame(animateConfetti);
    } else {
      animIdRef.current = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const spawnConfetti = useCallback(() => {
    const colors = [
      "#D01012",
      "#F5CD2F",
      "#00852B",
      "#0057A8",
      "#FE8A18",
      "#F785B1",
      "#1A9E8F",
    ];

    for (let i = 0; i < 55; i++) {
      particlesRef.current.push({
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * 80,
        vx: (Math.random() - 0.5) * 7,
        vy: Math.random() * 3 + 2,
        w: Math.random() * 8 + 4,
        h: Math.random() * 5 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        life: 1,
      });
    }

    if (!animIdRef.current) {
      animIdRef.current = requestAnimationFrame(animateConfetti);
    }
  }, [animateConfetti]);

  return { canvasRef, spawnConfetti };
}
