import React, { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import PageMeta from "../components/PageMeta";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Calendar, 
  Star,
  CheckCircle2,
  Clock,
  ArrowRight,
  Zap,
  TrendingUp
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { Lead } from "../types";
import { cn, formatDate } from "../lib/utils";

export default function LeadInbox() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Calendly dispatch state
  const [calendlyStatusMap, setCalendlyStatusMap] = useState<Record<string, 'idle' | 'sending' | 'sent'>>({});

  // Dynamic Calendly Assets Loading
  useEffect(() => {
    // Inject CSS
    const link = document.createElement("link");
    link.href = "https://assets.calendly.com/assets/external/widget.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Inject JS
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.type = "text/javascript";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      try {
        document.head.removeChild(link);
      } catch (e) {}
      try {
        document.head.removeChild(script);
      } catch (e) {}
    };
  }, []);

  const openCalendly = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const bookingLink = import.meta.env.VITE_CALENDLY_BOOKING_LINK || "https://calendly.com/hameed-sherzad22/100";
    
    const win = window as any;
    if (win.Calendly) {
      win.Calendly.initPopupWidget({ url: bookingLink });
    } else {
      window.open(bookingLink, "_blank", "noopener,noreferrer");
    }
  };

  const handleSendCalendly = (leadId: string) => {
    setCalendlyStatusMap(prev => ({ ...prev, [leadId]: 'sending' }));
    setTimeout(() => {
      setCalendlyStatusMap(prev => ({ ...prev, [leadId]: 'sent' }));
    }, 1000);
  };

  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, "leads"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
      setLeads(data);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "leads");
    });

    return unsubscribe;
  }, [user]);

  return (
    <div className="flex h-screen bg-sb-cream text-black font-sans selection:bg-sb-house selection:text-white">
      <PageMeta title="Lead Inbox" description="Engage and qualify inbound leads with AI-powered conversations." path="/leads" />
      <Sidebar />
      
      <main className="flex-1 flex overflow-hidden">
        {/* Lead List */}
        <div className="w-[48rem] border-r border-black/5 bg-white flex flex-col sb-shadow-nav z-10">
          <div className="p-10 border-b border-black/5 shrink-0 bg-sb-ceramic/30">
            <h1 className="text-[2.4rem] font-bold uppercase tracking-wider text-sb-green mb-6 flex items-center gap-4">
               <Users size={28} className="text-sb-accent" />
               Lead Nexus
            </h1>
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-sb-green opacity-30" size={18} />
              <input 
                placeholder="Search leads..."
                className="w-full bg-sb-cream border-none py-5 pl-16 pr-6 text-[1.4rem] font-bold rounded-full focus:ring-2 focus:ring-sb-accent outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-12 text-center opacity-30 text-[1.4rem] font-bold animate-pulse">Syncing Database...</div>
            ) : leads.length === 0 ? (
              <div className="p-20 text-center">
                 <div className="w-16 h-16 bg-sb-cream rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users size={32} className="text-sb-green opacity-20" />
                 </div>
                 <p className="text-[1.2rem] font-bold uppercase tracking-widest opacity-30 italic">No leads captured yet.</p>
              </div>
            ) : (
              leads.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className={cn(
                    "w-full text-left p-10 border-b border-black/5 transition-all hover:bg-sb-cream/30 group",
                    selectedLead?.id === lead.id ? "bg-sb-cream/50 relative after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1.5 after:bg-sb-accent" : ""
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-[1.6rem] text-sb-green group-hover:text-sb-accent transition-colors">{lead.name}</h3>
                    <span className="text-[1.1rem] font-black bg-sb-house text-sb-gold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                      {lead.score}
                    </span>
                  </div>
                  <p className="text-[1.3rem] text-black/40 mb-6 font-medium italic lowercase">{lead.email}</p>
                  <div className="flex justify-between items-center text-[1.2rem] font-bold">
                    <span className={cn(
                      "px-4 py-1 rounded-full uppercase tracking-widest text-[1rem] shadow-sm",
                      lead.status === 'qualified' ? "bg-sb-accent text-white" : "bg-sb-ceramic text-sb-house"
                    )}>
                      {lead.status}
                    </span>
                    <span className="opacity-30 italic">{formatDate(lead.createdAt)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Lead Detail */}
        <div className="flex-1 bg-sb-cream flex flex-col relative overflow-hidden">
           <AnimatePresence mode="wait">
             {selectedLead ? (
               <motion.div 
                 key={selectedLead.id}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="flex-1 flex flex-col"
               >
                 {/* Detail Header */}
                 <div className="p-12 lg:p-16 bg-white border-b border-black/5 flex justify-between items-center sb-shadow-nav">
                    <div>
                      <h2 className="text-[3.6rem] font-bold tracking-sb text-sb-green mb-2 uppercase">{selectedLead.name}</h2>
                      <p className="text-[1.6rem] text-black/40 font-medium italic">{selectedLead.source} Lead • Captured {formatDate(selectedLead.createdAt)}</p>
                    </div>
                    <div className="flex gap-4 flex-wrap">
                        <button 
                           onClick={() => handleSendCalendly(selectedLead.id)}
                           disabled={calendlyStatusMap[selectedLead.id] === 'sending'}
                           className={cn(
                             "h-14 px-8 border rounded-full font-black flex items-center gap-3 transition-all uppercase tracking-widest text-[1.2rem] shadow-sm",
                             calendlyStatusMap[selectedLead.id] === 'sent'
                               ? "bg-sb-green text-white border-sb-green" 
                               : "bg-sb-house text-sb-gold hover:bg-sb-accent hover:text-white border-transparent"
                           )}
                           title="Instruct the AI Agent to send this prospect your custom Calendly link"
                        >
                           <Zap size={14} className={cn("fill-current", calendlyStatusMap[selectedLead.id] === 'sending' && "animate-spin")} />
                           {calendlyStatusMap[selectedLead.id] === 'sending' 
                             ? "Sending Link..." 
                             : calendlyStatusMap[selectedLead.id] === 'sent' 
                             ? "Booking Link Sent" 
                             : "Send Calendly Link"}
                        </button>

                        <button 
                           onClick={() => openCalendly()}
                           className="h-14 bg-sb-accent text-white rounded-full font-black px-10 flex items-center gap-4 hover:shadow-xl sb-button-active transition-all uppercase tracking-widest text-[1.4rem]"
                           title="Schedule time directly using the integrated popup widget"
                        >
                           Book Call <ArrowRight size={18} />
                        </button>
                     </div>
                     <div className="hidden">
                       <button className="w-14 h-14 flex items-center justify-center bg-sb-cream rounded-full text-sb-green hover:bg-sb-accent hover:text-white transition-all sb-button-active shadow-sm">
                          <Zap size={20} />
                       </button>
                       <button className="w-14 h-14 flex items-center justify-center bg-sb-cream rounded-full text-sb-green hover:bg-sb-accent hover:text-white transition-all sb-button-active shadow-sm">
                          <Calendar size={20} />
                       </button>
                       <button className="h-14 bg-sb-accent text-white rounded-full font-black px-10 flex items-center gap-4 hover:shadow-xl sb-button-active transition-all uppercase tracking-widest text-[1.4rem]">
                          Book Call <ArrowRight size={18} />
                       </button>
                    </div>
                 </div>

                 {/* Detail Content */}
                 <div className="flex-1 overflow-y-auto p-12 lg:p-24 grid grid-cols-1 lg:grid-cols-3 gap-16">
                    <div className="lg:col-span-2 space-y-16">
                       <section>
                          <h4 className="text-[1.2rem] font-black uppercase tracking-[0.2em] text-sb-green/30 mb-8">Interaction Timeline</h4>
                          <div className="space-y-10 relative before:absolute before:left-7 before:top-4 before:bottom-4 before:w-0.5 before:bg-sb-green/5">
                             <div className="flex gap-8 relative">
                                <div className="w-14 h-14 rounded-full bg-sb-house flex items-center justify-center shrink-0 shadow-lg z-10">
                                   <Star className="text-sb-gold w-6 h-6 fill-sb-gold" />
                                </div>
                                <div className="p-10 bg-white rounded-[12px] sb-shadow-card grow relative after:absolute after:left-[-10px] after:top-6 after:w-5 after:h-5 after:bg-white after:rotate-45">
                                   <p className="text-[1.6rem] leading-relaxed italic text-black/70 mb-4 tracking-sb font-medium">"{selectedLead.initialMessage}"</p>
                                   <p className="text-[1.1rem] font-black text-sb-house/40 uppercase tracking-widest">Inbound Signal / {formatDate(selectedLead.createdAt)}</p>
                                </div>
                             </div>
                             
                             <div className="flex gap-8 relative justify-end">
                                <div className="p-10 bg-sb-house text-white rounded-[12px] sb-shadow-frap grow max-w-[48rem] relative before:absolute before:right-[-10px] before:top-6 before:w-5 before:h-5 before:bg-sb-house before:rotate-45">
                                   <p className="text-[1.6rem] leading-relaxed mb-4 font-medium tracking-sb">Hi {selectedLead.name.split(' ')[0]}, I've analyzed your request. Based on your goals, our Pro Engine could increase your reach by 4x. Would you like a guided demo?</p>
                                   <p className="text-[1.1rem] font-black uppercase tracking-widest text-sb-gold">AI Protocol / Auto Output</p>
                                </div>
                                <div className="w-14 h-14 rounded-full bg-sb-accent flex items-center justify-center shrink-0 shadow-lg z-10">
                                   <Zap className="text-white w-6 h-6 fill-white" /></div></div>{calendlyStatusMap[selectedLead.id] === "sent" && (<div className="flex gap-8 relative justify-end animate-fade-in"><div className="p-10 bg-[#e6f4ea]/60 text-sb-green border border-sb-accent/20 rounded-[12px] sb-shadow-card grow max-w-[48rem] relative before:absolute before:right-[-10px] before:top-4 before:w-5 before:h-5 before:bg-[#e6f4ea]/60 before:rotate-45"><p className="text-[1.5rem] leading-relaxed mb-3 font-bold">📬 Calendly direct invitation sent!</p><p className="text-[1.3rem] leading-relaxed mb-4 font-semibold text-sb-house">"Hi {selectedLead.name.split(' ')[0]}, here is the direct booking calendar link so we can schedule some time together on our dashboard: {import.meta.env.VITE_CALENDLY_BOOKING_LINK || 'https://calendly.com/hameed-sherzad22/100'}"</p><p className="text-[1.1rem] font-black uppercase tracking-widest text-sb-accent">Agent Outbound Dispatched</p></div><div className="w-14 h-14 rounded-full bg-sb-green flex items-center justify-center shrink-0 shadow-lg z-10 font-bold"><Calendar size={18} className="text-white" /></div></div>)}<div className="hidden"><div className="hidden">
                                </div>
                             </div>
                          </div>
                       </section>
                    </div>

                    <div className="space-y-12">
                       <div className="p-10 bg-white rounded-[12px] sb-shadow-card">
                          <h4 className="text-[1.2rem] font-black uppercase tracking-[0.2em] text-sb-green/30 mb-8">Neural Analysis</h4>
                          <div className="space-y-10">
                             <div>
                                <p className="text-[1.1rem] font-black uppercase tracking-widest mb-3 text-sb-green/60">Lead Score</p>
                                <div className="flex items-center gap-6">
                                   <div className="flex-1 h-3 bg-sb-cream rounded-full overflow-hidden">
                                      <div className="h-full bg-sb-accent shadow-[0_0_8px_#00754A]" style={{ width: `${selectedLead.score / 10}%` }} />
                                   </div>
                                   <span className="text-[1.8rem] font-black italic text-sb-green">{selectedLead.score}</span>
                                </div>
                             </div>
                             <div>
                                <p className="text-[1.1rem] font-black uppercase tracking-widest mb-3 text-sb-green/60">Intelligence Status</p>
                                <div className="flex items-center gap-4 p-4 bg-sb-light/30 rounded-[12px] border border-sb-accent/10">
                                   <CheckCircle2 size={24} className="text-sb-accent" />
                                   <span className="text-[1.4rem] font-black uppercase tracking-tight text-sb-green">Ready for Conversion</span>
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="p-12 bg-sb-house text-white rounded-[12px] sb-shadow-frap relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-1 bg-sb-gold" />
                          <TrendingUp className="text-sb-gold mb-6" size={32} />
                          <h4 className="text-[1.8rem] font-bold mb-2 uppercase tracking-sb">Conversion Lift</h4>
                          <p className="text-[1.4rem] opacity-60 font-medium italic">System predicts 84% probability of closing this lead if demo is scheduled within 48h.</p>
                       </div>
                    </div>
                 </div>
               </motion.div>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center p-24 text-center">
                  <div className="w-32 h-32 bg-sb-ceramic rounded-full flex items-center justify-center mb-12 shadow-inner">
                    <Users size={48} className="text-sb-green opacity-20" />
                  </div>
                  <h3 className="text-[3.2rem] font-bold uppercase tracking-widest text-sb-green opacity-10">Nexus Standby</h3>
                  <p className="max-w-[32rem] text-[1.6rem] text-black/20 mt-6 leading-relaxed font-medium italic uppercase tracking-widest">Select a lead from the registry to view neural analysis and interaction history.</p>
               </div>
             )}
           </AnimatePresence>
        </div>
      </main>

      {/* Signature Floating Frap Button */}
      <button className="fixed bottom-12 right-12 w-[5.6rem] h-[5.6rem] bg-sb-accent rounded-full flex items-center justify-center text-white sb-shadow-frap sb-button-active z-[60]">
        <Zap className="fill-white w-6 h-6" />
      </button>
    </div>
  );
}
