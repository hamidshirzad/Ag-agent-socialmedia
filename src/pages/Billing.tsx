import { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import { 
  CreditCard, 
  CheckCircle2, 
  Zap, 
  Shield, 
  ArrowRight,
  TrendingUp,
  Star,
  Zap as ZapIcon,
  Loader2,
  Lock
} from "lucide-react";
import { cn } from "../lib/utils";
import { motion } from "motion/react";
import axios from "axios";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "$29",
    description: "Perfect for solo operators and small brands.",
    features: [
      "100 AI Generations / mo",
      "Lead scoring (Basic)",
      "LinkedIn & X Integration",
      "Standard Analytics"
    ],
    color: "sb-accent"
  },
  {
    id: "pro",
    name: "Pro",
    price: "$99",
    description: "Advanced neural engine for growth hackers.",
    features: [
      "Unlimited AI Generations",
      "Neural Lead Scoring",
      "Full Multi-platform Relay",
      "Advanced ROI Analytics",
      "Priority Queue Access"
    ],
    color: "sb-gold",
    featured: true
  },
  {
    id: "agency",
    name: "Agency",
    price: "$299",
    description: "Multi-tenant solution for high-volume firms.",
    features: [
      "Everything in Pro",
      "Unlimited Client Seats",
      "Custom Neural Weights",
      "White-label Reports",
      "Direct API Access"
    ],
    color: "sb-house"
  }
];

export default function Billing() {
  const { profile, user } = useAuth();
  const { addToast, addNotification } = useNotifications();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  // Handle return from Stripe Checkout
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const isSuccess = queryParams.get("success") === "true";
    const isCanceled = queryParams.get("canceled") === "true";
    const planId = queryParams.get("plan");
    const sessionId = queryParams.get("session_id");

    if (isSuccess && planId) {
      const planName = PLANS.find((p) => p.id === planId)?.name || planId.toUpperCase();

      addToast({
        title: "Stripe Checkout Complete",
        message: `Successfully subscribed to ${planName} Edition! Session: ${sessionId?.substring(0, 16) || "active"}`,
        type: "success",
      });

      addNotification(
        "Billing Plan Modified via Stripe",
        `Workspace upgraded to ${planName} Edition via Stripe Checkout.`,
        "billing",
        { plan: planId }
      );

      // Persist plan update to Firestore if user logged in
      if (user?.uid) {
        import("../lib/firebase").then(({ db }) => {
          import("firebase/firestore").then(({ doc, updateDoc }) => {
            updateDoc(doc(db, "users", user.uid), {
              plan: planId,
              subscriptionStatus: "active",
            }).catch((err) => console.error("Error updating user plan in Firestore:", err));
          });
        });
      }

      // Clean URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (isCanceled) {
      addToast({
        title: "Checkout Canceled",
        message: "Stripe Checkout session was canceled. No charges were made.",
        type: "info",
      });

      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user]);

  const handleStripeCheckout = async (planId: string) => {
    setLoadingPlanId(planId);
    try {
      const response = await axios.post("/api/billing/create-checkout-session", {
        planId,
        userId: user?.uid,
        userEmail: user?.email,
        successUrl: `${window.location.origin}/billing?success=true&plan=${planId}&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/billing?canceled=true`,
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error("Invalid session URL returned");
      }
    } catch (error: any) {
      console.error("Stripe Checkout Error:", error);
      addToast({
        title: "Checkout Error",
        message: error.response?.data?.error || "Could not initiate Stripe Checkout session.",
        type: "error",
      });
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-sb-cream text-black font-sans tracking-sb">
      <Sidebar />
      
      <main className="flex-1 p-12 lg:p-24 overflow-y-auto">
        <header className="mb-16 pb-10 border-b border-black/5">
          <h1 className="text-[4.8rem] font-bold text-sb-green tracking-sb mb-2 uppercase">Billing & Neural Credits</h1>
          <p className="text-black/40 text-[1.6rem] font-medium italic">Manage your subscription via Stripe Checkout</p>
        </header>

        {/* Current Plan Summary */}
        <div className="mb-20">
          <div className="bg-sb-house text-white rounded-[12px] p-12 lg:p-16 sb-shadow-frap relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-sb-gold" />
            <div className="relative z-10">
              <p className="text-[1.2rem] mb-4 uppercase tracking-[0.2em] font-black text-sb-gold">Active Subscription</p>
              <h2 className="text-[4rem] font-bold uppercase tracking-sb leading-tight mb-2">
                {profile?.plan || "Free"} Edition
              </h2>
              <div className="flex items-center gap-4 text-white/60 mb-8 font-medium">
                <CheckCircle2 size={18} className="text-sb-accent" />
                <span>Next Cycle: June 01, 2026</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full w-full max-w-[40rem] overflow-hidden">
                <div className="h-full bg-sb-gold w-[42%] shadow-[0_0_8px_#cba258]" />
              </div>
              <p className="mt-4 text-[1.3rem] opacity-60 font-medium">4.2k / 10k tokens consumed this month</p>
            </div>
            
            <div className="bg-white/5 p-10 rounded-[12px] border border-white/10 backdrop-blur-sm min-w-[28rem] relative z-10 text-center">
              <TrendingUp className="text-sb-gold mx-auto mb-6" size={32} />
              <p className="text-[1.4rem] font-bold mb-1">Growth Index</p>
              <h4 className="text-[3.2rem] font-black text-sb-accent">+124%</h4>
              <p className="text-[1.1rem] opacity-40 uppercase tracking-widest mt-2">Efficiency Rating</p>
            </div>
          </div>
        </div>

        {/* Plan Grid */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <h3 className="text-[2.1rem] font-bold text-sb-green uppercase tracking-wider flex items-center gap-4">
              <CreditCard size={28} className="text-sb-accent" /> Upgrade Your Neural Map
            </h3>
            <div className="flex items-center gap-2 text-[1.1rem] font-bold uppercase tracking-widest text-black/40 bg-white/60 px-4 py-2 rounded-full border border-black/5">
              <Lock size={14} className="text-sb-accent" /> Powered by Stripe Checkout
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {PLANS.map((plan) => {
              const isLoading = loadingPlanId === plan.id;
              const isCurrent = (profile?.plan || "free").toLowerCase() === plan.id;

              return (
                <motion.div 
                  key={plan.id}
                  whileHover={{ y: -8 }}
                  className={cn(
                    "bg-white rounded-[12px] p-12 pb-16 flex flex-col relative overflow-hidden transition-all",
                    plan.featured ? "sb-shadow-frap ring-2 ring-sb-gold scale-105 z-10" : "sb-shadow-card",
                    isCurrent && "ring-2 ring-sb-accent bg-sb-light/20"
                  )}
                >
                  {plan.featured && (
                    <div className="absolute top-8 right-[-35px] bg-sb-gold text-sb-house font-black uppercase text-[1rem] tracking-widest px-12 py-1 rotate-45">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-[1.4rem] font-black uppercase tracking-[0.2em] text-sb-green/40">{plan.name}</h4>
                    {isCurrent && (
                      <span className="bg-sb-accent/10 text-sb-green text-[0.9rem] font-black uppercase px-3 py-1 rounded-full border border-sb-accent/20">
                        Current Plan
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-[4.8rem] font-bold text-sb-green tracking-tight">{plan.price}</span>
                    <span className="text-[1.6rem] text-black/40 font-medium lowercase">/mo</span>
                  </div>
                  <p className="text-[1.4rem] text-black/60 font-medium italic mb-10 leading-relaxed">{plan.description}</p>
                  
                  <div className="space-y-6 mb-12 flex-1">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="w-5 h-5 rounded-full bg-sb-light flex items-center justify-center text-sb-green shrink-0 mt-1">
                          <CheckCircle2 size={12} />
                        </div>
                        <span className="text-[1.35rem] font-medium text-black/80">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => handleStripeCheckout(plan.id)}
                    disabled={isLoading}
                    className={cn(
                      "w-full py-6 rounded-full font-black uppercase tracking-[0.15em] text-[1.4rem] flex items-center justify-center gap-4 transition-all sb-button-active shadow-sm cursor-pointer disabled:opacity-50",
                      plan.featured 
                        ? "bg-sb-gold text-sb-house hover:bg-sb-house hover:text-white" 
                        : "bg-sb-house text-white hover:bg-sb-green"
                    )}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> Preparing Checkout...
                      </>
                    ) : (
                      <>
                        Checkout with Stripe <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Security / Trust */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-black/5 pt-16 uppercase tracking-widest text-[1rem] font-black text-black/30">
          <div className="flex items-center gap-4">
            <Shield size={24} className="text-sb-accent/30" />
            <span>Stripe Encrypted Checkout • PCI-DSS Level 1 Security</span>
          </div>
          <div className="flex items-center gap-4 md:justify-end">
            <Star size={24} className="text-sb-gold/30" />
            <span>Trusted by 450+ Content Operators</span>
          </div>
        </div>
      </main>

      {/* Signature Floating Frap Button */}
      <button className="fixed bottom-12 right-12 w-[5.6rem] h-[5.6rem] bg-sb-accent rounded-full flex items-center justify-center text-white sb-shadow-frap sb-button-active z-[60]">
        <ZapIcon className="fill-white w-6 h-6" />
      </button>
    </div>
  );
}

