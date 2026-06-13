import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { Zap, ArrowRight, Github, Twitter, Youtube, Linkedin, Instagram } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

export default function Landing() {
  const { signIn, user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Stats counters
  const [stats, setStats] = useState({ lightYears: 0, galaxies: 0, stars: 0 });
  const [coords, setCoords] = useState("RA 00h 00m 00s · DEC +00° 00' 00\"");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStart = async () => {
    if (loading) return;
    setErrorMsg(null);
    if (user) {
      navigate(profile?.onboardingComplete ? "/dashboard" : "/onboarding");
    } else {
      await signIn();
    }
  };

  // Canvas Starfield Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener("resize", resize);

    const CX = () => width / 2;
    const CY = () => height / 2;
    const NUM_STARS = 420;

    const stars = Array.from({ length: NUM_STARS }, () => ({
      x: (Math.random() - 0.5) * width * 4,
      y: (Math.random() - 0.5) * height * 4,
      z: Math.random() * width,
      pz: 0,
      hue: Math.random() < 0.15 ? 190 + Math.random() * 60 : 200 + Math.random() * 40,
      size: Math.random() * 1.5 + 0.3,
    }));

    let mx = 0, my = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mx = (e.clientX / width - 0.5) * 0.6;
      my = (e.clientY / height - 0.5) * 0.6;
    };
    window.addEventListener("mousemove", handleMouseMove);

    let speed = 1;
    let tick = 0;

    const drawStars = () => {
      ctx.clearRect(0, 0, width, height);

      const grad = ctx.createRadialGradient(CX(), CY(), 0, CX(), CY(), width * 0.7);
      grad.addColorStop(0, 'rgba(13,6,40,0.0)');
      grad.addColorStop(0.5, 'rgba(7,21,46,0.3)');
      grad.addColorStop(1, 'rgba(0,0,15,0.7)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      const cx = CX() + mx * 30;
      const cy = CY() + my * 30;

      for (const s of stars) {
        s.pz = s.z;
        s.z -= speed;

        if (s.z <= 0) {
          s.x = (Math.random() - 0.5) * width * 4;
          s.y = (Math.random() - 0.5) * height * 4;
          s.z = width;
          s.pz = s.z;
        }

        const sx = (s.x / s.z) * width + cx;
        const sy = (s.y / s.z) * height + cy;
        const psx = (s.x / s.pz) * width + cx;
        const psy = (s.y / s.pz) * height + cy;

        const depth = 1 - s.z / width;
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
      ctx.fillRect(0, 0, width, height);

      tick++;
      speed = 1.5 + Math.sin(tick * 0.008) * 1.2;
      animationFrameId = requestAnimationFrame(drawStars);
    };

    drawStars();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Counters Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 2000;
      const start = performance.now();
      
      const update = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        
        setStats({
          lightYears: Math.floor(ease * 93),
          galaxies: Math.floor(ease * 2000),
          stars: Math.floor(ease * 400)
        });
        
        if (p < 1) requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  // Coords Effect
  useEffect(() => {
    const interval = setInterval(() => {
      const t = Date.now() / 1000;
      const ra_h = String(Math.floor((t / 3600) % 24)).padStart(2, '0');
      const ra_m = String(Math.floor((t / 60) % 60)).padStart(2, '0');
      const ra_s = String(Math.floor(t % 60)).padStart(2, '0');
      const dec_d = String(Math.floor(Math.abs(Math.sin(t * 0.01) * 90))).padStart(2, '0');
      const dec_m = String(Math.floor(Math.random() * 60)).padStart(2, '0');
      const dec_s = String(Math.floor(Math.random() * 60)).padStart(2, '0');
      setCoords(`RA ${ra_h}h ${ra_m}m ${ra_s}s · DEC +${dec_d}° ${dec_m}' ${dec_s}"`);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#00000f] text-white font-['Rajdhani'] overflow-hidden selection:bg-[#00e5ff] selection:text-black">
      {/* Custom Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&display=swap');
        
        .deep-nebula {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          mix-blend-mode: screen;
          pointer-events: none;
          z-index: 1;
          animation: nebula-drift 18s ease-in-out infinite alternate;
        }
        @keyframes nebula-drift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(40px, 30px) scale(1.08); }
        }
        .ring-rotate { animation: ring-rotate 8s linear infinite; }
        .ring-rotate-reverse { animation: ring-rotate 14s linear infinite reverse; }
        @keyframes ring-rotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .scanline {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, rgba(0,229,255,0.6), transparent);
          z-index: 3;
          animation: scan 6s linear infinite;
          box-shadow: 0 0 20px rgba(0,229,255,0.4);
        }
        @keyframes scan {
          from { top: -10px; }
          to   { top: 100%; }
        }
        .grid-overlay {
          position: fixed;
          inset: 0;
          z-index: 2;
          background-image:
            linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          perspective: 600px;
          animation: grid-breathe 8s ease-in-out infinite;
        }
        @keyframes grid-breathe {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1; }
        }
      `}</style>

      {/* Canvas Layer */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0" />

      {/* Nebula Layers */}
      <div className="deep-nebula w-[700px] h-[500px] -top-[100px] -left-[150px] bg-[radial-gradient(ellipse,rgba(123,47,255,0.35)_0%,transparent_70%)] [animation-duration:22s]" />
      <div className="deep-nebula w-[600px] h-[400px] -bottom-[120px] -right-[100px] bg-[radial-gradient(ellipse,rgba(26,111,255,0.3)_0%,transparent_70%)] [animation-duration:17s] [animation-direction:alternate-reverse]" />
      <div className="deep-nebula w-[400px] h-[300px] top-[40%] left-[55%] bg-[radial-gradient(ellipse,rgba(0,229,255,0.18)_0%,transparent_70%)] [animation-duration:25s]" />
      <div className="deep-nebula w-[500px] h-[350px] top-[10%] right-[20%] bg-[radial-gradient(ellipse,rgba(255,80,80,0.12)_0%,transparent_70%)] [animation-duration:20s] [animation-direction:alternate-reverse]" />

      <div className="grid-overlay" />
      <div className="scanline" />

      {/* UI Elements */}
      <div className="fixed top-6 left-6 z-50 flex items-center gap-4">
        <Zap className="text-[#00e5ff] w-8 h-8 filter drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]" />
        <span className="font-['Orbitron'] font-bold text-xl tracking-[0.2em] text-white">FOURDOOR</span>
      </div>

      <div className="fixed top-6 right-6 z-50 flex items-center gap-4">
        <button 
          onClick={handleStart}
          className="px-6 py-2 border border-[#00e5ff]/40 rounded-[3px] text-[0.7rem] font-bold tracking-[0.2em] font-['Orbitron'] text-[#00e5ff] hover:bg-[#00e5ff]/10 hover:border-[#00e5ff] transition-all"
        >
          {user ? "DASHBOARD" : "ACCESS TERMINAL"}
        </button>
      </div>

      {/* Main Content Stage */}
      <main className="relative z-10 w-full h-screen flex flex-col items-center justify-center">
        {/* Animated Orb */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-[180px] h-[180px] rounded-full mb-12 bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.9)_0%,rgba(0,229,255,0.8)_25%,rgba(26,111,255,0.6)_55%,rgba(123,47,255,0.4)_80%,transparent_100%)] shadow-[0_0_60px_rgba(0,229,255,0.5),0_0_120px_rgba(26,111,255,0.3),0_0_200px_rgba(123,47,255,0.2)]"
        >
          {/* Inner pulsating glow handled by animate in motion? No, keep CSS pulse for better performance */}
          <div className="absolute inset-0 rounded-full animate-[orb-pulse_4s_ease-in-out_infinite]" />
          <div className="absolute inset-[-20px] rounded-full border border-[#00e5ff]/25 ring-rotate" />
          <div className="absolute inset-[-40px] rounded-full border border-dashed border-[#7b2fff]/20 ring-rotate-reverse" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="font-['Orbitron'] text-[0.7rem] font-normal tracking-[0.4em] text-[#00e5ff] uppercase mb-5"
        >
          Sector 7 — Deep Field Observation
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 1 }}
          className="font-['Orbitron'] text-[clamp(2.8rem,7vw,6rem)] font-black leading-[0.95] tracking-[-0.02em] text-center mb-8 bg-[linear-gradient(135deg,#ffffff_0%,#a8d8ff_40%,#00e5ff_70%,#7b2fff_100%)] bg-clip-text text-transparent"
        >
          INTO THE<br />
          <span className="inline-block filter drop-shadow-[0_0_20px_rgba(0,229,255,0.6)]">INFINITE</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="text-[clamp(0.95rem,2vw,1.2rem)] font-light tracking-[0.12em] text-[#e8f4ff]/60 text-center max-w-[520px] mb-10 leading-[1.7]"
        >
          Traveling at the speed of light through 93 billion light-years<br />
          of observable universe — and still counting.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="w-[120px] h-[1px] bg-[linear-gradient(90deg,transparent,#00e5ff,transparent)] mb-9"
        />

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7, duration: 1 }}
          className="flex gap-14 mb-12"
        >
          {[
            { value: stats.lightYears, label: "Light Years", suffix: "B" },
            { value: stats.galaxies, label: "Galaxies Mapped", suffix: "+" },
            { value: stats.stars, label: "Stars Catalogued", suffix: "T" }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <span className="block font-['Orbitron'] text-3xl md:text-5xl font-bold text-[#00e5ff] drop-shadow-[0_0_20px_rgba(0,229,255,0.5)]">
                {stat.value.toLocaleString()}{stat.suffix}
              </span>
              <span className="block text-[0.7rem] tracking-[0.25em] uppercase text-[#e8f4ff]/40 mt-1">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 1 }}
          className="flex gap-4"
        >
          <button 
            onClick={handleStart}
            className="font-['Orbitron'] text-[0.65rem] font-bold tracking-[0.25em] uppercase px-8 py-3.5 rounded-[3px] bg-[linear-gradient(135deg,#1a6fff,#00e5ff)] text-[#00000f] shadow-[0_0_30px_rgba(0,229,255,0.3)] hover:shadow-[0_0_60px_rgba(0,229,255,0.6)] hover:-translate-y-0.5 transition-all"
          >
            Launch Mission
          </button>
          <button className="font-['Orbitron'] text-[0.65rem] font-bold tracking-[0.25em] uppercase px-8 py-3.5 rounded-[3px] bg-transparent text-[#00e5ff] border border-[#00e5ff]/40 hover:bg-[#00e5ff]/10 hover:border-[#00e5ff] hover:-translate-y-0.5 transition-all">
            Explore Data
          </button>
        </motion.div>
      </main>

      {/* Decorative Borders */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2, duration: 1 }} className="fixed top-6 left-6 w-14 h-14 border-t border-l border-[#00e5ff]/50 pointer-events-none" />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2, duration: 1 }} className="fixed top-6 right-6 w-14 h-14 border-t border-r border-[#00e5ff]/50 pointer-events-none" />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2, duration: 1 }} className="fixed bottom-6 left-6 w-14 h-14 border-b border-l border-[#00e5ff]/50 pointer-events-none" />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2, duration: 1 }} className="fixed bottom-6 right-6 w-14 h-14 border-b border-r border-[#00e5ff]/50 pointer-events-none" />

      {/* Live Coords Bottom */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 1 }}
        className="fixed bottom-7 left-1/2 -translate-x-1/2 font-['Orbitron'] text-[0.55rem] tracking-[0.2em] text-[#00e5ff]/30 z-10"
      >
        {coords}
      </motion.div>

      {/* Error Terminal Dialog */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#040924] border-2 border-[#ff3b3b]/60 rounded-lg p-8 max-w-[500px] w-full shadow-[0_0_50px_rgba(255,59,59,0.3)] text-[#e8f4ff] relative"
            >
              <h3 className="font-['Orbitron'] text-lg font-bold tracking-[0.25em] text-[#ff3b3b] uppercase mb-4 flex items-center gap-3">
                ⚠️ TRANSMISSION FAILURE
              </h3>
              
              <div className="text-[0.9rem] leading-[1.6] tracking-wide text-[#e8f4ff]/80 mb-6 space-y-4 font-sans">
                <p>{errorMsg}</p>
                
                <div className="p-4 bg-red-950/40 border border-[#ff3b3b]/20 rounded text-[0.8rem] font-mono text-[#ff8080]">
                  <span className="font-bold text-white uppercase block mb-1">Diagnosis:</span>
                  The Google AI Studio container runs inside a sandboxed cross-origin iframe. If your browser blocks popups or restricts third-party storage, sign-in flows will be blocked.
                </div>
              </div>

              <div className="flex flex-col gap-3 font-sans">
                <button
                  onClick={() => {
                    window.open(window.location.href, "_blank");
                  }}
                  className="w-full font-['Orbitron'] text-[0.65rem] font-bold tracking-[0.25em] uppercase px-5 py-3 rounded bg-[linear-gradient(135deg,#ff3b3b,#ff8080)] text-black hover:shadow-[0_0_20px_rgba(255,59,59,0.5)] transition-all cursor-pointer text-center"
                >
                  🚀 Launch in New Tab (Recommended)
                </button>
                
                <button
                  onClick={() => setErrorMsg(null)}
                  className="w-full font-['Orbitron'] text-[0.65rem] font-bold tracking-[0.25em] uppercase px-5 py-3 rounded border border-white/20 hover:bg-white/5 transition-all cursor-pointer text-center text-white/75"
                >
                  Dismiss Alert
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orb Pulse Keyframes */}
      <style>{`
        @keyframes orb-pulse {
          0%, 100% { box-shadow: 0 0 60px rgba(0,229,255,0.5), 0 0 120px rgba(26,111,255,0.3), 0 0 200px rgba(123,47,255,0.2); }
          50%       { box-shadow: 0 0 90px rgba(0,229,255,0.8), 0 0 180px rgba(26,111,255,0.5), 0 0 280px rgba(123,47,255,0.35); }
        }
      `}</style>
    </div>
  );
}

