 'use client'

import { useRef, useEffect, useState } from 'react';

export default function Home() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = 400;
    const centerY = 300;
    const scale = 30;

    let particles = [];

    const initTrajectories = () => {
      particles = [];
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const dist = 8 + Math.random() * 4;
        particles.push({
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          history: [],
          color: `hsl(${i * 40}, 90%, 60%)`
        });
      }
    };

    const drawBackground = () => {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Energy contours (concentric circles)
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.5;
      for (let r = 1; r < 13; r += 1) {
        ctx.globalAlpha = 0.15 + (r / 13) * 0.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, r * scale, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Grid
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1;
      for (let x = -13; x <= 13; x++) {
        ctx.beginPath();
        ctx.moveTo(centerX + x * scale, 0);
        ctx.lineTo(centerX + x * scale, canvas.height);
        ctx.stroke();
      }
      for (let y = -9; y <= 9; y++) {
        ctx.beginPath();
        ctx.moveTo(0, centerY + y * scale);
        ctx.lineTo(canvas.width, centerY + y * scale);
        ctx.stroke();
      }

      // Axes
      ctx.strokeStyle = '#a1a1aa';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(50, centerY);
      ctx.lineTo(canvas.width - 50, centerY);
      ctx.moveTo(centerX, 50);
      ctx.lineTo(centerX, canvas.height - 50);
      ctx.stroke();

      // Labels
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '500 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('x₁', canvas.width - 30, centerY + 25);
      ctx.fillText('x₂', centerX + 25, 35);
      ctx.fillText('Energy Landscape E(x) = x₁² + x₂²', 400, 30);
    };

    const drawParticles = () => {
      particles.forEach((p) => {
        // Trail
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.7;
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        p.history.forEach((pt, idx) => {
          const px = centerX + pt.x * scale;
          const py = centerY + pt.y * scale;
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Current dot
        const px = centerX + p.x * scale;
        const py = centerY + p.y * scale;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, 7, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const updateParticles = () => {
      particles.forEach((p) => {
        const gradX = 2 * p.x;
        const gradY = 2 * p.y;
        p.x -= 0.12 * gradX;  // Euler step for dx/dt = -∇E
        p.y -= 0.12 * gradY;
        p.history.push({ x: p.x, y: p.y });
        if (p.history.length > 50) p.history.shift();

        if (Math.hypot(p.x, p.y) < 0.15) {
          p.x = 0;
          p.y = 0;
        }
      });
    };

    const animateLoop = () => {
      drawBackground();
      drawParticles();
      updateParticles();
      animationRef.current = requestAnimationFrame(animateLoop);
    };

    const startDemo = () => {
      if (animating) return;
      initTrajectories();
      setAnimating(true);
      animateLoop();
    };

    const stopDemo = () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      setAnimating(false);
      // Keep last frame visible
    };

    // Initial static draw
    drawBackground();

    // Make functions global for button clicks
    window.startDemo = startDemo;
    window.stopDemo = stopDemo;

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [animating]);

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="max-w-[900px] w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-bold tracking-tighter">EBM ė Lyapunov</h1>
            <p className="text-emerald-400 text-2xl">Live Control Theory Demo</p>
          </div>
          <a href="https://github.com/NullLabTests/ebm-lyapunov-control-demo" target="_blank" className="text-xs px-4 py-2 bg-zinc-900 hover:bg-zinc-800 transition-colors rounded-2xl flex items-center gap-2">
            ← Original Python Demo
          </a>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-4 shadow-inner">
          <canvas ref={canvasRef} className="w-full rounded-2xl" width="800" height="600" />
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <button 
            onClick={() => window.startDemo && window.startDemo()}
            className="px-10 py-5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all font-semibold text-lg text-black rounded-3xl flex items-center gap-3 shadow-lg"
          >
            ▶️ Start Gradient Flow Simulation
          </button>
          <button 
            onClick={() => window.stopDemo && window.stopDemo()}
            className="px-10 py-5 bg-zinc-800 hover:bg-zinc-700 transition-all font-semibold text-lg rounded-3xl"
          >
            ⏹️ Reset
          </button>
        </div>

        <div className="mt-16 text-center max-w-md mx-auto text-zinc-400 text-sm leading-relaxed">
          This is the exact energy minimization the r/ControlTheory thread was hyped about.<br/>
          Pure deterministic stability via <span className="font-mono text-emerald-300">dx/dt = −∇E(x)</span>. No tokens. No probability.<br/>
          <span className="text-xs mt-6 block">Deployed instantly on Vercel • Built in one bash script</span>
        </div>
      </div>
    </main>
  );
}
