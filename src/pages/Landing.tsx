import { useState } from "react";
import { motion } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/Toast";
import { ArrowRight, Zap, BarChart3, Users, Send, Mic2, Twitter, Instagram, Linkedin, Youtube, CheckCircle2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "../lib/utils";
import PageMeta from "../components/PageMeta";

/* ── Atmospheric gradient orb ──────────────────────────────────────────── */
function GradientOrb({ color, className }: { color: string; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("absolute rounded-full pointer-events-none", className)}
      style={{ background: `radial-gradient(ellipse at center, ${color}55 0%, ${color}22 40%, transparent 70%)` }}
    />
  );
}

/* ── Orb feature card ───────────────────────────────────────────────────── */
function OrbCard({ color, headline, body }: { color: string; headline: string; body: string }) {
  return (
    <div className="relative overflow-hidden rounded-[24px] p-8 flex flex-col justify-end min-h-[22rem]"
      style={{ background: "var(--color-el-canvas-soft)", border: "1px solid var(--color-el-hairline)" }}>
      <GradientOrb color={color} className="w-[28rem] h-[28rem] -top-24 -right-24 opacity-80" />
      <div className="relative z-10">
        <p className="el-display text-[2.8rem] leading-[1.15]" style={{ color: "var(--color-el-ink)" }}>{headline}</p>
        <p className="mt-3 text-[1.5rem] leading-relaxed" style={{ color: "var(--color-el-muted)", letterSpacing: "0.015em" }}>{body}</p>
      </div>
    </div>
  );
}

/* ── Feature card ───────────────────────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="el-card p-6 flex flex-col gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: "var(--color-el-surface-strong)" }}>
        <Icon size={18} style={{ color: "var(--color-el-ink)" }} />
      </div>
      <div>
        <p className="font-medium text-[1.5rem]" style={{ color: "var(--color-el-ink)", letterSpacing: "0.18px" }}>{title}</p>
        <p className="mt-2 text-[1.4rem] leading-relaxed" style={{ color: "var(--color-el-body)", letterSpacing: "0.15px" }}>{description}</p>
      </div>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────────────────── */
export default function Landing() {
  const { signIn, user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [signingIn, setSigningIn] = useState(false);

  const handleStart = async () => {
    if (loading) return;
    if (user) {
      navigate(profile?.onboardingComplete ? "/dashboard" : "/onboarding");
      return;
    }
    setSigningIn(true);
    try {
      const { isNewUser } = await signIn();
      navigate(isNewUser ? "/onboarding" : "/dashboard");
    } catch (err: any) {
      const code: string = err?.code ?? "";
      if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") {
        toast.error(err?.message ?? "Sign-in failed. Please try again.");
      }
    } finally {
      setSigningIn(false);
    }
  };

  const plans = [
    { name: "Starter", price: "29", info: "For solo creators & founders.", features: ["5 AI posts / day", "Lead scoring engine", "2 platforms"] },
    { name: "Pro", price: "79", info: "For growth-stage teams.", features: ["Unlimited AI posts", "Full lead intelligence", "All platforms", "Priority generation"], featured: true },
    { name: "Agency", price: "199", info: "For agencies & enterprises.", features: ["Everything in Pro", "Client workspaces", "White-label export", "SLA support"] },
  ];

  return (
    <div className="bg-sb-cream min-h-screen">
      <PageMeta />
      {/* Navigation */}
      <nav className="flex justify-between items-center px-12 py-6 bg-white sb-shadow-nav sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-sb-green rounded-full flex items-center justify-center shrink-0">
            <Zap className="text-white w-6 h-6 fill-white" />
          </div>
          <span className="font-bold text-2xl tracking-sb text-sb-green uppercase">Fourdoor</span>
          <div className="hidden md:flex items-center gap-8 ml-12 text-[1.4rem] font-bold uppercase tracking-widest">
             <a href="#features" className="hover:text-sb-green transition-colors">Menu</a>
             <a href="#rewards" className="hover:text-sb-green transition-colors">Growth Rewards</a>
             <a href="#gift" className="hover:text-sb-green transition-colors">Gift Access</a>
          </div>
          <span className="font-semibold text-[1.5rem] tracking-tight" style={{ color: "var(--color-el-ink)" }}>Fourdoor</span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={handleStart}
            className="px-6 py-2 border border-black rounded-full text-[1.4rem] font-bold sb-button-active"
          >
            Sign in
          </button>
          <button 
            onClick={handleStart}
            className="px-6 py-2 bg-black text-white rounded-full text-[1.4rem] font-bold sb-button-active"
          >
            Join now
          </button>
        </div>
      </nav>

      {/* ── Hero Band ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden text-center px-6 py-[96px] md:py-[120px]">
        {/* Atmospheric orbs */}
        <GradientOrb color="var(--color-el-mint)"    className="w-[50rem] h-[50rem] -left-48 top-0 opacity-60" />
        <GradientOrb color="var(--color-el-peach)"   className="w-[40rem] h-[40rem] -right-32 top-16 opacity-50" />
        <GradientOrb color="var(--color-el-lavender)" className="w-[36rem] h-[36rem] left-1/2 -translate-x-1/2 top-8 opacity-40" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-10 text-[1.2rem] font-semibold uppercase tracking-[0.96px]"
              style={{ background: "var(--color-el-surface-strong)", color: "var(--color-el-muted)" }}>
              Autonomous Marketing Platform
            </div>

            <h1 className="el-display text-[clamp(4rem,8vw,7.2rem)] leading-[1.05] mb-8"
              style={{ letterSpacing: "clamp(-0.96px,-0.02em,-1.92px)", color: "var(--color-el-ink)" }}>
              Your brand.<br />Always on.
            </h1>

            <p className="max-w-xl mx-auto text-[1.6rem] leading-relaxed mb-12"
              style={{ color: "var(--color-el-body)", letterSpacing: "0.16px" }}>
              Fourdoor's AI agents generate content, qualify leads, and book sales calls — autonomously, around the clock.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button onClick={handleStart} disabled={signingIn} className="el-btn-primary" style={{ height: "44px", padding: "0 24px", fontSize: "15px" }}>
                {signingIn ? "Signing in…" : "Get started free"}
                {!signingIn && <ArrowRight size={15} />}
              </button>
              <button onClick={handleStart} className="el-btn-outline" style={{ height: "44px", padding: "0 24px", fontSize: "15px" }}>
                See how it works
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Feature grid ───────────────────────────────────────────── */}
      <section id="features" className="px-6 md:px-12 py-[96px] max-w-[1200px] mx-auto">
        <div className="mb-16">
          <p className="text-[1.2rem] font-semibold uppercase tracking-[0.96px] mb-4"
            style={{ color: "var(--color-el-muted)" }}>What we automate</p>
          <h2 className="el-display text-[clamp(2.8rem,5vw,4rem)] leading-[1.17]"
            style={{ color: "var(--color-el-ink)", letterSpacing: "-0.36px" }}>
            The full growth stack,<br />driven by AI agents.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard icon={Mic2} title="Content Generation" description="AI writes platform-native captions, hooks, and scripts calibrated to your brand voice." />
          <FeatureCard icon={Users} title="Lead Intelligence" description="Engagement signals are scored in real time. High-intent leads surface automatically." />
          <FeatureCard icon={BarChart3} title="Performance Analytics" description="Pattern analysis surfaces what's working and rewrites your strategy on the fly." />
          <FeatureCard icon={Send} title="Multi-Platform Distribution" description="Schedule and publish across LinkedIn, TikTok, Instagram, X, and more from one queue." />
          <FeatureCard icon={Zap} title="AI Engagement Agent" description="Auto-reply to DMs and comments. Qualify intent, nurture interest, and route hot leads." />
          <FeatureCard icon={CheckCircle2} title="Automated Booking" description="Sales calls book themselves. The agent qualifies, proposes times, and confirms." />
        </div>
      </section>

      {/* ── Orb capabilities section ───────────────────────────────── */}
      <section id="capabilities" className="px-6 md:px-12 py-[96px]"
        style={{ background: "var(--color-el-canvas-soft)" }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-16">
            <p className="text-[1.2rem] font-semibold uppercase tracking-[0.96px] mb-4"
              style={{ color: "var(--color-el-muted)" }}>Core capabilities</p>
            <h2 className="el-display text-[clamp(2.8rem,5vw,4rem)] leading-[1.17]"
              style={{ color: "var(--color-el-ink)", letterSpacing: "-0.36px" }}>
              Intelligence as a service.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <OrbCard color="var(--color-el-mint)" headline="Content Engine" body="Brand-voice calibrated posts generated and scheduled in seconds." />
            <OrbCard color="var(--color-el-lavender)" headline="Lead Scoring" body="Every engagement signal weighted, ranked, and surfaced to your inbox." />
            <OrbCard color="var(--color-el-peach)" headline="Auto Booking" body="Qualified leads move from inbox to calendar without human intervention." />
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────── */}
      <section id="pricing" className="px-6 md:px-12 py-[96px] max-w-[1200px] mx-auto">
        <div className="mb-16 text-center">
          <p className="text-[1.2rem] font-semibold uppercase tracking-[0.96px] mb-4"
            style={{ color: "var(--color-el-muted)" }}>Pricing</p>
          <h2 className="el-display text-[clamp(2.8rem,5vw,4rem)] leading-[1.17]"
            style={{ color: "var(--color-el-ink)", letterSpacing: "-0.36px" }}>
            Scale at your own pace.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.name}
              className={cn("rounded-[16px] p-8 flex flex-col border transition-shadow", plan.featured ? "hover:shadow-xl" : "hover:el-shadow-hover")}
              style={{
                background: plan.featured ? "var(--color-el-surface-dark)" : "var(--color-el-surface-card)",
                borderColor: plan.featured ? "var(--color-el-surface-dark-elevated)" : "var(--color-el-hairline)",
                boxShadow: plan.featured ? "0 8px 32px rgba(0,0,0,0.18)" : "var(--shadow-el-card)",
              }}>
              <div className="mb-6">
                <p className="text-[1.2rem] font-semibold uppercase tracking-[0.96px] mb-1"
                  style={{ color: plan.featured ? "var(--color-el-on-dark-soft)" : "var(--color-el-muted)" }}>{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="el-display text-[4.8rem] leading-none"
                    style={{ color: plan.featured ? "var(--color-el-on-dark)" : "var(--color-el-ink)" }}>€{plan.price}</span>
                  <span className="text-[1.4rem]" style={{ color: plan.featured ? "var(--color-el-on-dark-soft)" : "var(--color-el-muted)" }}>/mo</span>
                </div>
                <p className="text-[1.4rem]" style={{ color: plan.featured ? "var(--color-el-on-dark-soft)" : "var(--color-el-body)", letterSpacing: "0.15px" }}>{plan.info}</p>
              </div>

              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[1.4rem]"
                    style={{ color: plan.featured ? "var(--color-el-on-dark)" : "var(--color-el-body)", letterSpacing: "0.15px" }}>
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: plan.featured ? "#ffffff22" : "var(--color-el-surface-strong)" }}>
                      <CheckCircle2 size={10} style={{ color: plan.featured ? "white" : "var(--color-el-ink)" }} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <button onClick={handleStart} disabled={signingIn}
                className={plan.featured ? "el-btn-outline" : "el-btn-primary"}
                style={plan.featured ? { borderColor: "#ffffff44", color: "white", width: "100%", justifyContent: "center" } : { width: "100%", justifyContent: "center" }}>
                {signingIn ? "Signing in…" : "Get started"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Band ───────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-[96px] text-center"
        style={{ background: "var(--color-el-canvas-soft)", borderTop: "1px solid var(--color-el-hairline)" }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="el-display text-[clamp(2.8rem,5vw,4rem)] leading-[1.17] mb-8"
            style={{ color: "var(--color-el-ink)", letterSpacing: "-0.36px" }}>
            Ready to automate your growth?
          </h2>
          <p className="text-[1.6rem] leading-relaxed mb-10"
            style={{ color: "var(--color-el-body)", letterSpacing: "0.16px" }}>
            Join founders and agencies using Fourdoor to scale without hiring.
          </p>
          <button onClick={handleStart} disabled={signingIn} className="el-btn-primary" style={{ height: "48px", padding: "0 28px", fontSize: "15px" }}>
            {signingIn ? "Signing in…" : "Start for free"}
            {!signingIn && <ArrowRight size={15} />}
          </button>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="px-6 md:px-12 py-16"
        style={{ background: "var(--color-el-canvas)", borderTop: "1px solid var(--color-el-hairline)" }}>
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-12">
          {/* Brand column */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: "var(--color-el-primary)" }}>
                <Zap size={11} color="white" fill="white" />
              </div>
              <span className="font-semibold text-[1.5rem]" style={{ color: "var(--color-el-ink)" }}>Fourdoor</span>
            </div>
            <p className="text-[1.4rem] leading-relaxed mb-6 max-w-xs"
              style={{ color: "var(--color-el-body)", letterSpacing: "0.15px" }}>
              Autonomous marketing for the next generation of builders.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Twitter, label: "Follow us on X (Twitter)" },
                { Icon: Instagram, label: "Follow us on Instagram" },
                { Icon: Linkedin, label: "Connect on LinkedIn" },
                { Icon: Youtube, label: "Watch on YouTube" },
              ].map(({ Icon, label }) => (
                <a key={label} href="#" aria-label={label}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: "var(--color-el-surface-strong)" }}
                  onMouseOver={e => (e.currentTarget.style.background = "var(--color-el-hairline)")}
                  onMouseOut={e => (e.currentTarget.style.background = "var(--color-el-surface-strong)")}>
                  <Icon size={14} style={{ color: "var(--color-el-muted)" }} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {[
            { heading: "Platform", links: ["Content Engine", "Lead Inbox", "Analytics", "Distribution"] },
            { heading: "Company", links: ["About", "Careers", "Blog", "Contact"] },
            { heading: "Legal", links: ["Privacy", "Terms", "Security", "Cookies"] },
          ].map(col => (
            <div key={col.heading}>
              <p className="text-[1.2rem] font-semibold uppercase tracking-[0.96px] mb-5"
                style={{ color: "var(--color-el-ink)" }}>{col.heading}</p>
              <ul className="flex flex-col gap-4">
                {col.links.map(l => (
                  <li key={l}>
                    <a href="#" className="text-[1.4rem] transition-colors"
                      style={{ color: "var(--color-el-body)", letterSpacing: "0.15px" }}
                      onMouseOver={e => (e.currentTarget.style.color = "var(--color-el-ink)")}
                      onMouseOut={e => (e.currentTarget.style.color = "var(--color-el-body)")}>
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="max-w-[1200px] mx-auto mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderTop: "1px solid var(--color-el-hairline)" }}>
          <p className="text-[1.3rem]" style={{ color: "var(--color-el-muted)" }}>© 2026 Fourdoor AI. All rights reserved.</p>
          <p className="text-[1.3rem]" style={{ color: "var(--color-el-muted)" }}>Built for autonomous growth.</p>
        </div>
      </footer>
    </div>
  );
}
