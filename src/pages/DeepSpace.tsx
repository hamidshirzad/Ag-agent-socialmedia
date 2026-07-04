import React, { useEffect, useRef } from 'react';
import './DeepSpace.css';

export default function DeepSpace() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coordRef = useRef<HTMLDivElement>(null);
  const n1Ref = useRef<HTMLSpanElement>(null);
  const n2Ref = useRef<HTMLSpanElement>(null);
  const n3Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const CX = () => canvas.width / 2;
    const CY = () => canvas.height / 2;
    const NUM_STARS = 420;

    const stars = Array.from({ length: NUM_STARS }, () => ({
      x: (Math.random() - 0.5) * canvas.width * 4,
      y: (Math.random() - 0.5) * canvas.height * 4,
      z: Math.random() * canvas.width,
      pz: 0,
      hue: Math.random() < 0.15 ? 190 + Math.random() * 60 : 200 + Math.random() * 40,
      size: Math.random() * 1.5 + 0.3,
    }));

    let mx = 0, my = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 0.6;
      my = (e.clientY / window.innerHeight - 0.5) * 0.6;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let speed = 1;
    let tick = 0;
    let animationId: number;

    function drawStars() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const grad = ctx.createRadialGradient(CX(), CY(), 0, CX(), CY(), canvas.width * 0.7);
      grad.addColorStop(0, 'rgba(13,6,40,0.0)');
      grad.addColorStop(0.5, 'rgba(7,21,46,0.3)');
      grad.addColorStop(1, 'rgba(0,0,15,0.7)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = CX() + mx * 30;
      const cy = CY() + my * 30;

      for (const s of stars) {
        s.pz = s.z;
        s.z -= speed;

        if (s.z <= 0) {
          s.x = (Math.random() - 0.5) * canvas.width * 4;
          s.y = (Math.random() - 0.5) * canvas.height * 4;
          s.z = canvas.width;
          s.pz = s.z;
        }

        const sx = (s.x / s.z) * canvas.width + cx;
        const sy = (s.y / s.z) * canvas.height + cy;
        const psx = (s.x / s.pz) * canvas.width + cx;
        const psy = (s.y / s.pz) * canvas.height + cy;

        const depth = 1 - s.z / canvas.width;
        const r = s.size * depth * 2.5;
        const alpha = Math.min(1, depth * 1.4);

        ctx.beginPath();
        ctx.moveTo(psx, psy);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = `hsla(${s.hue},90%,85%,${alpha})`;
        ctx.lineWidth = r;
        ctx.stroke();

        if (depth > 0.7) {
          ctx.beginPath();
          ctx.arc(sx, sy, r * 2, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${s.hue},100%,90%,${(depth - 0.7) * 0.5})`;
          ctx.fill();
        }
      }

      const lf = ctx.createRadialGradient(cx, cy, 0, cx, cy, 200);
      lf.addColorStop(0, 'rgba(0,229,255,0.04)');
      lf.addColorStop(0.4, 'rgba(26,111,255,0.02)');
      lf.addColorStop(1, 'transparent');
      ctx.fillStyle = lf;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      tick++;
      speed = 1.5 + Math.sin(tick * 0.008) * 1.2;

      animationId = requestAnimationFrame(drawStars);
    }
    drawStars();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  useEffect(() => {
    let timers: ReturnType<typeof setTimeout>[] = [];
    let animationFrames: number[] = [];

    function animateCounter(el: HTMLElement | null, target: number, suffix: string, duration: number) {
      if (!el) return;
      const start = performance.now();
      const update = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(ease * target).toLocaleString() + suffix;
        if (p < 1) {
          animationFrames.push(requestAnimationFrame(update));
        }
      };
      animationFrames.push(requestAnimationFrame(update));
    }

    timers.push(setTimeout(() => {
      animateCounter(n1Ref.current, 93, 'B', 2000);
      animateCounter(n2Ref.current, 2000, '+', 2200);
      animateCounter(n3Ref.current, 400, 'T', 2400);
    }, 1800));

    return () => {
      timers.forEach(clearTimeout);
      animationFrames.forEach(cancelAnimationFrame);
    };
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    function updateCoords() {
      if (!coordRef.current) return;
      const t = Date.now() / 1000;
      const ra_h = String(Math.floor((t / 3600) % 24)).padStart(2, '0');
      const ra_m = String(Math.floor((t / 60) % 60)).padStart(2, '0');
      const ra_s = String(Math.floor(t % 60)).padStart(2, '0');
      const dec_d = String(Math.floor(Math.abs(Math.sin(t * 0.01) * 90))).padStart(2, '0');
      const dec_m = String(Math.floor(Math.random() * 60)).padStart(2, '0');
      const dec_s = String(Math.floor(Math.random() * 60)).padStart(2, '0');
      coordRef.current.textContent = `RA ${ra_h}h ${ra_m}m ${ra_s}s  ·  DEC +${dec_d}° ${dec_m}' ${dec_s}"`;
    }
    interval = setInterval(updateCoords, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="deep-space-container">
      <canvas id="space-canvas" ref={canvasRef}></canvas>

      <div className="nebula neb-a"></div>
      <div className="nebula neb-b"></div>
      <div className="nebula neb-c"></div>
      <div className="nebula neb-d"></div>

      <div className="grid"></div>
      <div className="scanline"></div>

      <div className="corner corner-tl"></div>
      <div className="corner corner-tr"></div>
      <div className="corner corner-bl"></div>
      <div className="corner corner-br"></div>

      <div className="stage">
        <div className="orb"></div>
        <div className="eyebrow">Sector 7 — Deep Field Observation</div>
        <h1>INTO THE<br /><span className="glow-word">INFINITE</span></h1>
        <p className="subtitle">
          Traveling at the speed of light through 93 billion light-years<br />
          of observable universe — and still counting.
        </p>
        <div className="divider"></div>
        <div className="stats">
          <div className="stat">
            <span className="stat-num" ref={n1Ref}>0</span>
            <span className="stat-label">Light Years</span>
          </div>
          <div className="stat">
            <span className="stat-num" ref={n2Ref}>0</span>
            <span className="stat-label">Galaxies Mapped</span>
          </div>
          <div className="stat">
            <span className="stat-num" ref={n3Ref}>0</span>
            <span className="stat-label">Stars Catalogued</span>
          </div>
        </div>
        <div className="cta">
          <a href="#" className="btn btn-primary">Launch Mission</a>
          <a href="#" className="btn btn-ghost">Explore Data</a>
        </div>
      </div>

      <div className="coords" ref={coordRef}>RA 00h 00m 00s · DEC +00° 00' 00"</div>
    </div>
  );
}
