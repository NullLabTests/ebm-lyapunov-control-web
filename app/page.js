'use client';

import { useRef, useEffect, useState } from 'react';

export default function LyapunovDemo() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 820;
    canvas.height = 620;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cx = 410;
    const cy = 310;
    const scale = 28;

    let particles = [];

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < 9; i++) {
        const angle = (i / 9) * Math.PI * 2;
        const dist = 7 + Math.random() * 4;
        particles.push({
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          history: [],
          color: `hsl(${i * 35}, 95%, 65%)`
        });
      }
    };

    const draw = () => {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Lyapunov energy contours
      ctx.strokeStyle = '#22c55e';
      for (let r = 1; r <= 14; r++) {
        ctx.globalAlpha = 0.1 + (r * 0.035);
        ctx.beginPath();
        ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Grid
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1;
      for (let i = -15; i <= 15; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + i * scale, 30);
        ctx.lineTo(cx + i * scale, canvas.height - 30);
        ctx.moveTo(30, cy + i * scale);
        ctx.lineTo(canvas.width - 30, cy + i * scale);
        ctx.stroke();
      }

      // Axes
      ctx.strokeStyle = '#a1a1aa';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(30, cy); ctx.lineTo(canvas.width - 30, cy);
      ctx.moveTo(cx, 30); ctx.lineTo(cx, canvas.height - 30);
      ctx.stroke();

      // Particles
      particles.forEach(p => {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3.5;
        ctx.globalAlpha = 0.75;
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        p.history.forEach((pt, i) => {
          const px = cx + pt.x * scale;
          const py = cy + pt.y * scale;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        const px = cx + p.x * scale;
        const py = cy + p.y * scale;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, 7, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const update = () => {
      particles.forEach(p => {
        const gradX = 2 * p.x;
        const gradY = 2 * p.y;
        p.x -= 0.09 * gradX;
        p.y -= 0.09 * gradY;
        p.history.push({ x: p.x, y: p.y });
        if (p.history.length > 60) p.history.shift();

        if (Math.hypot(p.x, p.y) < 0.18) {
          p.x = p.y = 0;
        }
      });
    };

    const loop = () => {
      draw();
      update();
      animationRef.current = requestAnimationFrame(loop);
    };

    const start = () => {
      if (isRunning) return;
      initParticles();
      setIsRunning(true);
      loop();
    };

    const stop = () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      setIsRunning(false);
      draw();
    };

    draw();
    window.startLyapunov = start;
    window.stopLyapunov = stop;

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning]);

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-[900px] w-full">
        <h1 className="text-6xl font-black tracking-tighter mb-2">EBM = Lyapunov</h1>
        <p className="text-emerald-400 text-3xl mb-10">Live Control Theory Demo</p>

        <div className="bg-zinc-900 rounded-3xl p-5 shadow-2xl border border-zinc-800">
          <canvas ref={canvasRef} className="w-full rounded-2xl" width="820" height="620" />
        </div>

        <div className="flex gap-6 justify-center mt-10">
          <button onClick={() => window.startLyapunov && window.startLyapunov()}
            className="px-12 py-6 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-2xl rounded-3xl shadow-xl transition-all active:scale-95">
            ▶️ Start Gradient Flow
          </button>
          <button onClick={() => window.stopLyapunov && window.stopLyapunov()}
            className="px-10 py-6 bg-zinc-800 hover:bg-zinc-700 font-bold text-2xl rounded-3xl transition-all">
            Reset
          </button>
        </div>

        <p className="text-center text-zinc-400 mt-12 text-sm max-w-md mx-auto">
          r/ControlTheory in the browser.<br/>
          Pure deterministic stability: <span className="font-mono text-emerald-300">dx/dt = −∇E(x)</span>
        </p>
      </div>
    </main>
  );
}
