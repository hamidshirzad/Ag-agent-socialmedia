import React, { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Target, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Briefcase, 
  Globe,
  Loader2,
  TrendingUp,
  Zap,
  FlaskConical,
  Activity,
  BarChart2,
  DollarSign,
  Magnet,
  Eye,
  Users,
  Rocket,
  ShieldCheck,
  Target as TargetIcon,
  Image as ImageIcon,
  Sparkles
} from "lucide-react";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc,
  serverTimestamp 
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { Campaign } from "../types";
import { cn } from "../lib/utils";

const inferGoalIcons = (goals: string) => {
  const g = goals.toLowerCase();
  const icons = [];
  if (g.includes("sale") || g.includes("revenue") || g.includes("profit") || g.includes("roi")) icons.push({ icon: DollarSign, color: "text-green-500", label: "Revenue" });
  if (g.includes("lead") || g.includes("conversion") || g.includes("acquire") || g.includes("funnel")) icons.push({ icon: Magnet, color: "text-sb-accent", label: "Leads" });
  if (g.includes("brand") || g.includes("awareness") || g.includes("visibility") || g.includes("reach")) icons.push({ icon: Eye, color: "text-sb-gold", label: "Awareness" });
  if (g.includes("engage") || g.includes("community") || g.includes("social") || g.includes("users")) icons.push({ icon: Users, color: "text-blue-500", label: "Engagement" });
  if (g.includes("growth") || g.includes("expand") || g.includes("scale") || g.includes("up")) icons.push({ icon: TrendingUp, color: "text-indigo-500", label: "Growth" });
  if (g.includes("speed") || g.includes("quick") || g.includes("rapid") || g.includes("fast")) icons.push({ icon: Zap, color: "text-sb-gold", label: "Speed" });
  if (g.includes("launch") || g.includes("initial") || g.includes("start")) icons.push({ icon: Rocket, color: "text-orange-500", label: "Launch" });
  if (g.includes("trust") || g.includes("secure") || g.includes("safe") || g.includes("protect")) icons.push({ icon: ShieldCheck, color: "text-sb-green", label: "Trust" });
  
  return icons.length > 0 ? icons : [{ icon: TargetIcon, color: "text-sb-green/20", label: "General" }];
};

export default function Campaigns() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeCampaignForVariation, setActiveCampaignForVariation] = useState<string | null>(null);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    niche: "",
    goals: ""
  });
  const [newVariation, setNewVariation] = useState({
    name: "",
    description: ""
  });

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "campaigns"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Campaign[];
      setCampaigns(data);
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, "campaigns"));

    return () => unsubscribe();
  }, [user]);

  const handleAddCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addDoc(collection(db, "campaigns"), {
        ...newCampaign,
        userId: user.uid,
        active: true,
        createdAt: serverTimestamp()
      });
      setShowAddModal(false);
      setNewCampaign({ name: "", niche: "", goals: "" });
    } catch (error) {
      console.error("Error adding campaign:", error);
    }
  };

  const toggleCampaignStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "campaigns", id), {
        active: !currentStatus
      });
    } catch (error) {
      console.error("Error toggling campaign status:", error);
    }
  };

  const handleAddVariation = async (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const variations = campaign.variations || [];
    const variation = {
      id: Math.random().toString(36).substr(2, 9),
      name: newVariation.name,
      description: newVariation.description,
      stats: { conversions: 0, engagement: 0 }
    };

    try {
      await updateDoc(doc(db, "campaigns", campaignId), {
        variations: [...variations, variation]
      });
      setActiveCampaignForVariation(null);
      setNewVariation({ name: "", description: "" });
    } catch (error) {
       console.error("Error adding variation:", error);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!window.confirm("Are you sure you want to terminate this campaign? All neural associations will be archived.")) return;
    try {
      await deleteDoc(doc(db, "campaigns", id));
    } catch (error) {
      console.error("Error deleting campaign:", error);
    }
  };

  const handleGenerateImage = async (id: string, name: string, niche: string) => {
    const prompt = `Professional high-tech marketing campaign visual for ${name} in the ${niche} industry, cinematic lighting, minimalist aesthetic, futuristic, 4k`;
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=400&nologo=true&seed=${Math.floor(Math.random() * 100000)}`;
    
    try {
      await updateDoc(doc(db, "campaigns", id), {
        imageUrl: imageUrl
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `campaigns/${id}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-sb-cream text-black font-sans tracking-sb">
      <Sidebar />
      
      <main className="flex-1 p-12 lg:p-20 overflow-y-auto">
        <header className="flex justify-between items-end mb-16">
          <div>
            <h1 className="text-[4.8rem] font-black tracking-sb uppercase leading-none mb-4 text-sb-green">
              Neural Campaigns
            </h1>
            <p className="text-[1.8rem] text-sb-green/60 font-medium italic">
              Define sector-specific objectives and orchestrate multi-channel resonance.
            </p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-10 py-6 bg-sb-house text-white rounded-full font-black text-[1.4rem] uppercase tracking-widest flex items-center gap-4 hover:bg-sb-green transition-all sb-button-active"
          >
            <Plus size={20} /> Establish Objective
          </button>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64">
             <Loader2 className="animate-spin text-sb-accent" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {campaigns.map((campaign) => (
                <motion.div
                  key={campaign.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={cn(
                    "relative group bg-white p-0 rounded-[12px] border-2 transition-all sb-shadow-card overflow-hidden",
                    campaign.active ? "border-sb-gold/20" : "border-black/5 opacity-60 grayscale"
                  )}
                >
                  <div className="relative h-48 w-full bg-sb-cream overflow-hidden group/img">
                    {campaign.imageUrl ? (
                      <img 
                        src={campaign.imageUrl} 
                        alt={campaign.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-sb-green/20">
                         <ImageIcon size={48} className="mb-2" />
                         <span className="text-[1rem] font-black uppercase tracking-widest">No Visual identity</span>
                      </div>
                    )}
                    <button 
                       onClick={() => handleGenerateImage(campaign.id, campaign.name, campaign.niche)}
                       className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-xl opacity-0 group-hover/img:opacity-100 transition-all hover:bg-sb-gold hover:text-white"
                       title="Generate Neural Visual"
                    >
                       <Sparkles size={16} />
                    </button>
                    <div className="absolute top-4 left-4 flex gap-2">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shadow-inner bg-white/90 backdrop-blur-sm",
                        campaign.active ? "text-sb-gold" : "text-black/40"
                      )}>
                        <Target size={18} />
                      </div>
                    </div>
                  </div>

                  <div className="p-10 pt-8">
                    <div className="flex justify-between items-start mb-6">
                       <h3 className="text-[2.2rem] font-bold text-sb-green uppercase tracking-tight truncate flex-1">
                        {campaign.name}
                      </h3>
                       <div className="flex gap-2 ml-4">
                          <button 
                            onClick={() => toggleCampaignStatus(campaign.id, campaign.active)}
                            className="p-3 bg-sb-cream rounded-full hover:bg-white border border-black/5 transition-all"
                          >
                             {campaign.active ? <XCircle size={14} className="text-red-500" /> : <CheckCircle2 size={14} className="text-sb-accent" />}
                          </button>
                          <button 
                            onClick={() => handleDeleteCampaign(campaign.id)}
                            className="p-3 bg-sb-cream rounded-full hover:bg-red-50 border border-black/5 transition-all text-red-400"
                          >
                             <Trash2 size={14} />
                          </button>
                       </div>
                    </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[1.2rem] font-black uppercase tracking-widest text-sb-green/40">
                       <Briefcase size={12} /> {campaign.niche}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 py-2">
                       {inferGoalIcons(campaign.goals).map((obj, i) => (
                          <div 
                            key={i} 
                            className={cn(
                              "flex items-center gap-2 px-3 py-1.5 rounded-full bg-sb-cream border border-black/5",
                              obj.color
                            )}
                            title={obj.label}
                          >
                             <obj.icon size={12} />
                             <span className="text-[1rem] font-black uppercase tracking-widest">{obj.label}</span>
                          </div>
                       ))}
                    </div>

                    <p className="text-[1.4rem] font-medium italic text-sb-green/60 line-clamp-2">
                      "{campaign.goals}"
                    </p>
                  </div>

                  {/* Variations Section */}
                  <div className="mt-8 pt-8 border-t border-black/5">
                     <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                           <FlaskConical size={14} className="text-sb-gold" />
                           <span className="text-[1.2rem] font-black uppercase tracking-[0.2em] text-sb-green/60">A/B Variations</span>
                        </div>
                        <button 
                           onClick={() => setActiveCampaignForVariation(campaign.id)}
                           className="text-[1rem] font-black uppercase tracking-widest text-sb-accent hover:underline"
                        >
                           + Experiment
                        </button>
                     </div>
                     
                     <div className="space-y-4">
                        {(!campaign.variations || campaign.variations.length === 0) ? (
                           <p className="text-[1.2rem] text-black/30 font-medium italic">No active experiments. Add one to start A/B testing.</p>
                        ) : (
                           campaign.variations.map(v => (
                              <div key={v.id} className="bg-sb-cream p-4 rounded-[8px] flex justify-between items-center group/var">
                                 <div className="flex flex-col">
                                    <span className="text-[1.2rem] font-bold text-sb-green uppercase">{v.name}</span>
                                    <div className="flex gap-4 opacity-40 text-[1rem] font-black uppercase tracking-widest">
                                       <span className="flex items-center gap-1"><Activity size={10} /> {v.stats.engagement}%</span>
                                       <span className="flex items-center gap-1"><BarChart2 size={10} /> {v.stats.conversions}</span>
                                    </div>
                                 </div>
                                 <div className="opacity-0 group-hover/var:opacity-100 transition-opacity">
                                    <TrendingUp size={14} className="text-sb-gold" />
                                 </div>
                              </div>
                           ))
                        )}
                     </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-black/5">
                     <div className="space-y-6">
                        <div className="flex flex-col gap-2">
                           <div className="flex justify-between items-end">
                              <span className="text-[1rem] font-black uppercase tracking-widest text-black/40">Resonance Scan</span>
                              <span className="text-[1.6rem] font-bold text-sb-green">84.2%</span>
                           </div>
                           <div className="h-1.5 w-full bg-sb-cream rounded-full overflow-hidden border border-black/5">
                              <div 
                                className="h-full bg-sb-green rounded-full transition-all duration-1000" 
                                style={{ width: '84.2%' }}
                              />
                           </div>
                        </div>

                        <div className="flex items-center justify-between">
                           <div className="flex flex-col">
                              <span className="text-[1rem] font-black uppercase tracking-widest text-black/40">Neural Sync</span>
                              <span className="text-[1.6rem] font-bold text-sb-gold flex items-center gap-2">
                                 <div className="w-2 h-2 rounded-full bg-sb-gold animate-pulse" />
                                 Active
                              </span>
                           </div>
                           <div className="flex items-center gap-2 text-sb-accent font-black text-[1rem] uppercase tracking-widest hover:translate-x-1 transition-transform cursor-pointer">
                              <TrendingUp size={12} /> ROI Tracker
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Variation Modal */}
        <AnimatePresence>
          {activeCampaignForVariation && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-sb-house/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white w-full max-w-lg p-12 rounded-[24px] shadow-2xl relative"
              >
                 <button 
                  onClick={() => setActiveCampaignForVariation(null)}
                  className="absolute top-8 right-8 text-black/20 hover:text-black transition-all"
                >
                  <XCircle size={24} />
                </button>

                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-sb-gold/10 text-sb-gold rounded-[12px] flex items-center justify-center">
                    <FlaskConical size={24} />
                  </div>
                  <h2 className="text-[2.4rem] font-black uppercase tracking-sb text-sb-green">New Experiment</h2>
                </div>

                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[1.2rem] font-black uppercase tracking-[0.2em] text-sb-green/40 px-2">Variant Name</label>
                    <input 
                      placeholder="e.g. Action-Oriented vs Educational"
                      value={newVariation.name}
                      onChange={e => setNewVariation({...newVariation, name: e.target.value})}
                      className="w-full bg-sb-cream border-2 border-transparent rounded-[12px] p-5 text-[1.6rem] font-bold focus:border-sb-gold transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[1.2rem] font-black uppercase tracking-[0.2em] text-sb-green/40 px-2">Variant Bias / Tone</label>
                    <textarea 
                      placeholder="Describe how this variation should differ from the baseline strategy..."
                      value={newVariation.description}
                      onChange={e => setNewVariation({...newVariation, description: e.target.value})}
                      className="w-full h-32 bg-sb-cream border-2 border-transparent rounded-[12px] p-5 text-[1.4rem] font-medium italic focus:border-sb-gold transition-all outline-none resize-none"
                    />
                  </div>

                  <button 
                    onClick={() => handleAddVariation(activeCampaignForVariation)}
                    disabled={!newVariation.name}
                    className="w-full py-6 bg-sb-house text-white rounded-full font-black text-[1.4rem] uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-sb-green transition-all sb-button-active disabled:opacity-30"
                  >
                    Deploy Variation
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Add Modal */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-sb-house/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="bg-sb-cream w-full max-w-xl p-12 rounded-[24px] shadow-2xl relative"
              >
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="absolute top-8 right-8 text-sb-green/40 hover:text-sb-green transition-all"
                >
                  <XCircle size={24} />
                </button>

                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-sb-house rounded-[12px] flex items-center justify-center">
                    <Zap className="text-white w-6 h-6 fill-white" />
                  </div>
                  <h2 className="text-[2.4rem] font-black uppercase tracking-sb text-sb-green">Establish Objective</h2>
                </div>

                <form onSubmit={handleAddCampaign} className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[1.2rem] font-black uppercase tracking-[0.2em] text-sb-green/40 px-2">Campaign Name</label>
                    <input 
                      required
                      placeholder="e.g. Q3 SaaS Expansion"
                      value={newCampaign.name}
                      onChange={e => setNewCampaign({...newCampaign, name: e.target.value})}
                      className="w-full bg-white border-2 border-transparent rounded-[12px] p-5 text-[1.6rem] font-bold focus:border-sb-gold transition-all outline-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[1.2rem] font-black uppercase tracking-[0.2em] text-sb-green/40 px-2 flex items-center gap-2">
                      <Globe size={12} /> Target Niche
                    </label>
                    <input 
                      required
                      placeholder="e.g. Enterprise Fintech"
                      value={newCampaign.niche}
                      onChange={e => setNewCampaign({...newCampaign, niche: e.target.value})}
                      className="w-full bg-white border-2 border-transparent rounded-[12px] p-5 text-[1.6rem] font-bold focus:border-sb-gold transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[1.2rem] font-black uppercase tracking-[0.2em] text-sb-green/40 px-2">Neural Goal / ROI Target</label>
                    <textarea 
                      required
                      placeholder="Define the core intent and expected outcome..."
                      value={newCampaign.goals}
                      onChange={e => setNewCampaign({...newCampaign, goals: e.target.value})}
                      className="w-full h-32 bg-white border-2 border-transparent rounded-[12px] p-5 text-[1.4rem] font-medium italic focus:border-sb-gold transition-all outline-none resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-6 bg-sb-house text-white rounded-full font-black text-[1.4rem] uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-sb-green transition-all sb-button-active"
                  >
                    Initialize Neural Path
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
