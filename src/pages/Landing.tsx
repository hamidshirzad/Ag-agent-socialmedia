import { motion } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { ArrowRight, CheckCircle2, Zap, BarChart3, Users, Send, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

export default function Landing() {
  const { signIn, user, profile, loading } = useAuth();
  const navigate = useNavigate();

  const handleStart = async () => {
    if (loading) return;
    if (user) {
      navigate(profile?.onboardingComplete ? "/dashboard" : "/onboarding");
    } else {
      const { isNewUser } = await signIn();
      navigate(isNewUser ? "/onboarding" : "/dashboard");
    }
  };

  return (
    <div className="bg-sb-cream min-h-screen">
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

      {/* Hero Section */}
      <header className="grid grid-cols-1 lg:grid-cols-2 bg-sb-green text-white min-h-[60rem]">
        <div className="flex flex-col justify-center p-12 lg:p-24 bg-sb-house order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-[clamp(3.5rem,6vw,5.8rem)] leading-[1.2] font-semibold mb-8">
              Autonomous marketing <br /> starts here.
            </h1>
            <p className="max-w-lg text-[1.9rem] leading-relaxed mb-12 opacity-80">
              Join Fourdoor Growth Engine™ today and start automating your social distribution and lead generation automatically.
            </p>
            <button 
              onClick={handleStart}
              className="px-8 py-3 border border-white rounded-full text-[1.6rem] font-bold sb-button-active hover:bg-white hover:text-sb-house"
            >
              Learn more
            </button>
          </motion.div>
        </div>
        <div className="bg-[#d4e9e2] flex items-center justify-center p-12 order-1 lg:order-2">
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="relative w-full max-w-lg aspect-square bg-sb-green/10 rounded-full flex items-center justify-center"
           >
              <Zap className="w-48 h-48 text-sb-green animate-pulse" />
           </motion.div>
        </div>
      </header>

      {/* Intro Section */}
      <section className="py-24 px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-24">
        <div className="flex-1 space-y-8">
          <h2 className="text-[2.8rem] font-semibold text-sb-green uppercase">Intelligence as a service.</h2>
          <p className="text-[1.6rem] leading-relaxed text-black/70">
            Our neural engine doesn't just post content; it learns your brand voice, identifies high-intent targets, and scales your footprint while you focus on closing.
          </p>
          <button 
            onClick={handleStart}
            className="px-8 py-3 bg-sb-accent text-white rounded-full text-[1.6rem] font-bold sb-button-active shadow-lg"
          >
            Explore our platform
          </button>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-8">
           {[
             { label: "Content Gen", icon: CheckCircle2 },
             { label: "Lead Scoring", icon: Zap },
             { label: "Auto Booking", icon: BarChart3 },
             { label: "Distribution", icon: Send }
           ].map((item, i) => (
             <div key={i} className="bg-white p-8 rounded-[12px] sb-shadow-card flex flex-col items-center text-center gap-4 hover:-translate-y-1 transition-all">
                <item.icon className="text-sb-green w-10 h-10" />
                <span className="font-bold uppercase text-[1.2rem] tracking-wider">{item.label}</span>
             </div>
           ))}
        </div>
      </section>

      {/* Pricing - Rewards Experience */}
      <section id="pricing" className="bg-sb-ceramic py-32 px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="font-serif italic text-sb-green text-[5rem] mb-4">Choose your tier.</h2>
            <p className="text-[1.6rem] text-black/60 uppercase tracking-widest font-bold">Free growth is just the beginning.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { name: "Starter", price: "29", info: "Perfect for builders." },
              { name: "Pro", price: "79", info: "For established teams.", featured: true },
              { name: "Agency", price: "199", info: "Scalable enterprise." }
            ].map((plan, i) => (
              <div key={i} className={cn(
                "p-12 rounded-[12px] flex flex-col text-center sb-shadow-card transition-all hover:scale-[1.02]",
                plan.featured ? "bg-sb-house text-white" : "bg-white text-black"
              )}>
                <h3 className="text-[2.4rem] font-bold mb-2 italic font-serif">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mb-8">
                  <span className="text-[4.5rem] font-black">€{plan.price}</span>
                  <span className="opacity-50">/mo</span>
                </div>
                <p className="mb-12 opacity-80 font-medium">{plan.info}</p>
                <ul className="text-left space-y-4 mb-16 grow text-[1.4rem]">
                  <li className="flex gap-3 items-center"><CheckCircle2 className="w-4 h-4 text-sb-accent" /> AI Content Engine</li>
                  <li className="flex gap-3 items-center"><CheckCircle2 className="w-4 h-4 text-sb-accent" /> Lead Intelligence</li>
                  <li className="flex gap-3 items-center"><CheckCircle2 className="w-4 h-4 text-sb-accent" /> Multi-Relay Post</li>
                </ul>
                <button 
                  onClick={handleStart}
                  className={cn(
                    "py-4 rounded-full font-bold text-[1.6rem] sb-button-active",
                    plan.featured ? "bg-white text-sb-house" : "bg-sb-accent text-white"
                  )}
                >
                  Get started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sb-house text-white py-32 px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-24">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <Zap size={24} className="text-sb-house fill-sb-house" />
              </div>
              <span className="font-bold text-3xl tracking-sb uppercase">FOURDOOR</span>
            </div>
            <p className="max-w-sm text-white/60 text-[1.4rem] leading-relaxed">
              Autonomous marketing for the next generation of builders. Scale your impact without scaling your team.
            </p>
            <div className="flex gap-6 mt-10">
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-all group">
                <Twitter size={18} className="text-white/40 group-hover:text-white transition-colors" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-all group">
                <Instagram size={18} className="text-white/40 group-hover:text-white transition-colors" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-all group">
                <Linkedin size={18} className="text-white/40 group-hover:text-white transition-colors" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-all group">
                <Youtube size={18} className="text-white/40 group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-[1.6rem] mb-12 uppercase tracking-loose">Platform</h4>
            <div className="flex flex-col gap-6 text-white/50 text-[1.4rem] font-medium transition-all">
              <a href="#" className="hover:text-white">Content Engine</a>
              <a href="#" className="hover:text-white">Lead Inbox</a>
              <a href="#" className="hover:text-white">Distribution</a>
              <a href="#" className="hover:text-white">Analytics</a>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-[1.6rem] mb-12 uppercase tracking-loose">Company</h4>
            <div className="flex flex-col gap-6 text-white/50 text-[1.4rem] font-medium transition-all">
              <a href="#" className="hover:text-white">About Us</a>
              <a href="#" className="hover:text-white">Careers</a>
              <a href="#" className="hover:text-white">Contact</a>
              <a href="#" className="hover:text-white">Privacy</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-32 pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
           <p className="text-[1.2rem] text-white/40">© 2026 Fourdoor Coffee & Code Co. All rights reserved.</p>
           <div className="flex gap-12 text-sb-gold font-bold text-[1.3rem]">
              <a href="#" className="hover:underline">Terms of Service</a>
              <a href="#" className="hover:underline">Legal</a>
           </div>
        </div>
      </footer>

      {/* Signature Floating Frap Button */}
      <button 
        onClick={handleStart}
        className="fixed bottom-12 right-12 w-[5.6rem] h-[5.6rem] bg-sb-accent rounded-full flex items-center justify-center text-white sb-shadow-frap sb-button-active z-[60]"
      >
        <Zap className="fill-white" />
      </button>
    </div>
  );
}
