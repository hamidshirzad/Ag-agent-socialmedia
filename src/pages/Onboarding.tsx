import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, Target, Globe, Briefcase } from "lucide-react";
import { doc, updateDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { cn } from "../lib/utils";
import PageMeta from "../components/PageMeta";

export default function Onboarding() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    company: "",
    niche: "",
    industry: "SaaS",
    goals: "lead-gen"
  });

  const handleNext = () => setStep(s => s + 1);

  const handleComplete = async () => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    
    // Seed default scoring rules based on industry
    const rulesCollection = collection(db, "users", user.uid, "scoringRules");
    const defaultRules = [];

    if (data.industry === "SaaS") {
      defaultRules.push(
        { attribute: "job_title", operator: "contains", value: "CTO", points: 150, category: "attribute", isActive: true, userId: user.uid },
        { attribute: "company_size", operator: "greater_than", value: "50", points: 100, category: "attribute", isActive: true, userId: user.uid },
        { attribute: "trial_active", operator: "equals", value: "true", points: 200, category: "engagement", isActive: true, userId: user.uid }
      );
    } else if (data.industry === "Agency") {
      defaultRules.push(
        { attribute: "budget", operator: "greater_than", value: "5000", points: 250, category: "attribute", isActive: true, userId: user.uid },
        { attribute: "referral", operator: "equals", value: "true", points: 150, category: "crm", isActive: true, userId: user.uid }
      );
    } else {
      defaultRules.push(
        { attribute: "engagement_rate", operator: "greater_than", value: "3", points: 100, category: "engagement", isActive: true, userId: user.uid },
        { attribute: "email_opened", operator: "equals", value: "true", points: 50, category: "engagement", isActive: true, userId: user.uid }
      );
    }

    // Use a simpler approach for seeding to avoid complex batch logic for now
    for (const rule of defaultRules) {
      await addDoc(rulesCollection, { ...rule, createdAt: serverTimestamp() });
    }

    await updateDoc(userRef, {
      ...data,
      onboardingComplete: true
    });
    await refreshProfile();
    navigate("/dashboard");
  };

  const steps = [
    {
      id: 1,
      title: "Designation.",
      icon: Briefcase,
      content: (
        <div className="space-y-6">
          <input 
            placeholder="Official Entity Name"
            value={data.company}
            onChange={e => setData({...data, company: e.target.value})}
            className="w-full p-8 text-[2.4rem] font-bold bg-sb-cream border-2 border-transparent rounded-[24px] focus:bg-white focus:border-sb-accent transition-all outline-none shadow-inner"
          />
          <p className="text-[1.4rem] opacity-40 px-4 font-medium italic">Identification for your neural growth engine.</p>
        </div>
      )
    },
    {
      id: 2,
      title: "Ecosystem.",
      icon: Globe,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {["SaaS", "Agency", "E-commerce", "Fintech", "EdTech", "Other"].map(ind => (
              <button
                key={ind}
                onClick={() => setData({...data, industry: ind})}
                className={cn(
                  "p-6 rounded-[20px] text-[1.4rem] font-black uppercase tracking-widest transition-all border-2",
                  data.industry === ind ? "bg-sb-house text-white border-sb-house" : "bg-sb-cream text-sb-green/40 border-transparent hover:border-sb-green/10"
                )}
              >
                {ind}
              </button>
            ))}
          </div>
          <p className="text-[1.4rem] opacity-40 px-4 font-medium italic">Tuning neural filters for industry-specific sentiment.</p>
        </div>
      )
    },
    {
      id: 3,
      title: "Core Objective.",
      icon: Target,
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            {[
              { id: "lead-gen", label: "High-Intent Lead Gen", desc: "Maximize conversion through targeted outreach" },
              { id: "brand-awareness", label: "Massive Awareness", desc: "Optimize for viral triggers and reach" },
              { id: "authority", label: "Authority / IP", desc: "Focus on thought leadership synthesis" }
            ].map(g => (
              <button
                key={g.id}
                onClick={() => setData({...data, goals: g.id})}
                className={cn(
                  "w-full p-8 rounded-[24px] transition-all border-2 flex flex-col items-start gap-1",
                  data.goals === g.id ? "bg-sb-accent text-white border-sb-accent" : "bg-sb-cream text-sb-green/60 border-transparent hover:border-sb-accent/20"
                )}
              >
                <span className="text-[1.6rem] font-black uppercase tracking-widest">{g.label}</span>
                <span className={cn("text-[1.2rem] font-medium opacity-60", data.goals === g.id ? "text-white" : "text-black")}>{g.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Niche Depth.",
      icon: Target,
      content: (
        <div className="space-y-6">
          <textarea 
            placeholder="e.g. AI-Powered FinTech for SMBs..."
            value={data.niche}
            onChange={e => setData({...data, niche: e.target.value})}
            className="w-full h-40 p-8 text-[1.8rem] font-bold bg-sb-cream border-2 border-transparent rounded-[24px] focus:bg-white focus:border-sb-accent transition-all outline-none shadow-inner resize-none"
          />
          <p className="text-[1.4rem] opacity-40 px-4 font-medium italic text-center">Describe the specific intersection where your value resides.</p>
        </div>
      )
    },
    {
      id: 5,
      title: "Synthesis Ready.",
      icon: Zap,
      content: (
        <div className="space-y-6">
          <div className="p-10 bg-sb-house text-white rounded-[32px] sb-shadow-frap relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1.5 bg-sb-gold" />
             <div className="flex gap-3 items-center mb-6 opacity-60 font-black uppercase tracking-[0.2em] text-[1.2rem]">
                <Zap size={14} className="text-sb-gold fill-sb-gold" /> Neural Engine Active
             </div>
             <p className="text-[2.2rem] font-medium leading-relaxed italic text-white/90">
                "Stop wasting resonance on manual distribution. {data.company || "Your brand"} is now optimized for {data.industry} growth via {data.goals.replace('-', ' ')}. Synthesis complete."
             </p>
          </div>
          <p className="text-[1.4rem] opacity-40 px-4 text-center font-medium italic">Neural weights have been pre-set for {data.industry} benchmarks.</p>
        </div>
      )
    }
  ];

  const currentStep = steps.find(s => s.id === step);

  return (
    <div className="min-h-screen bg-sb-cream text-black font-sans flex flex-col items-center justify-center p-8 lg:p-12 overflow-hidden">
      <PageMeta title="Get Started" description="Set up your Fourdoor AI workspace in minutes." path="/onboarding" />
      <div className="max-w-2xl w-full">
        <div className="mb-16 flex justify-center">
           <div className="flex items-center gap-4 font-black text-[2.8rem] tracking-sb text-sb-green">
            <div className="w-14 h-14 bg-sb-house rounded-[12px] flex items-center justify-center shadow-lg">
              <Zap className="text-white w-8 h-8 fill-white" />
            </div>
            <span className="uppercase">FOURDOOR</span>
          </div>
        </div>

        <div className="mb-20 flex gap-4 justify-center">
           {[1,2,3,4,5].map(s => (
             <div key={s} className={cn(
               "h-1.5 flex-1 rounded-full transition-all duration-500",
               s <= step ? 'bg-sb-accent shadow-[0_0_10px_#00754A]' : 'bg-black/5'
             )} />
           ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-16"
          >
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-sb-house text-sb-gold rounded-[20px] flex items-center justify-center mx-auto mb-8 shadow-xl">
                 {currentStep && <currentStep.icon size={36} />}
              </div>
              <h2 className="text-[5.6rem] font-bold tracking-sb leading-[0.9] text-sb-green uppercase">{currentStep?.title}</h2>
            </div>

            <div className="min-h-[22rem]">
              {currentStep?.content}
            </div>

            <button
               onClick={step === 5 ? handleComplete : handleNext}
               className="w-full py-8 bg-sb-house text-white rounded-full font-black text-[1.8rem] uppercase tracking-widest flex items-center justify-center gap-6 hover:bg-sb-green hover:shadow-2xl active:scale-95 transition-all sb-button-active"
            >
               {step === 5 ? "Deploy Engine" : "Proceed"}
               <ArrowRight size={24} />
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
