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
  Sparkles,
  Settings2,
  Play,
  Pause,
  Clock,
  Bot,
  CheckCheck,
  AlertCircle,
  ListTodo
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
  serverTimestamp,
  orderBy,
  Timestamp
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { Campaign, AutomationJob } from "../types";
import { cn } from "../lib/utils";

const CHANNELS = ['linkedin', 'instagram', 'x', 'tiktok', 'facebook'] as const;
const CADENCES = ['daily', 'weekly', 'biweekly'] as const;
const CADENCE_MS: Record<string, number> = { daily: 864e5, weekly: 6048e5, biweekly: 12096e5 };

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

const jobStatusStyle = (status: AutomationJob['status']) => ({
  pending:   "bg-sb-gold/10 text-sb-gold",
  running:   "bg-blue-100 text-blue-500",
  completed: "bg-sb-accent/10 text-sb-accent",
  failed:    "bg-red-100 text-red-500",
}[status]);

const JobIcon = ({ status }: { status: AutomationJob['status'] }) => {
  if (status === 'pending')   return <Clock size={14} />;
  if (status === 'running')   return <Loader2 size={14} className="animate-spin" />;
  if (status === 'completed') return <CheckCheck size={14} />;
  return <AlertCircle size={14} />;
};

type JobTab = AutomationJob['status'];

export default function Campaigns() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [jobs, setJobs] = useState<AutomationJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeCampaignForVariation, setActiveCampaignForVariation] = useState<string | null>(null);
  const [missionCampaignId, setMissionCampaignId] = useState<string | null>(null);
  const [missionForm, setMissionForm] = useState<Partial<Campaign>>({});
  const [savingMission, setSavingMission] = useState(false);
  const [jobsTab, setJobsTab] = useState<JobTab>('pending');
  const [newCampaign, setNewCampaign] = useState({ name: "", niche: "", goals: "" });
  const [newVariation, setNewVariation] = useState({ name: "", description: "" });

  // Campaign listener
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "campaigns"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Campaign[];
      setCampaigns(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // Automation jobs listener
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "automationJobs"),
      where("userId", "==", user.uid),
      orderBy("scheduledFor", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setJobs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as AutomationJob[]);
    });
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
        status: "draft",
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
      await updateDoc(doc(db, "campaigns", id), { active: !currentStatus });
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
      await updateDoc(doc(db, "campaigns", campaignId), { variations: [...variations, variation] });
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
      await updateDoc(doc(db, "campaigns", id), { imageUrl });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `campaigns/${id}`);
    }
  };

  const openMission = (campaign: Campaign) => {
    setMissionCampaignId(campaign.id);
    setMissionForm({
      objective:      campaign.objective      ?? "",
      targetAudience: campaign.targetAudience ?? "",
      budgetRange:    campaign.budgetRange    ?? "",
      channels:       campaign.channels       ?? [],
      cadence:        campaign.cadence        ?? "weekly",
    });
  };

  const saveMission = async (campaign: Campaign) => {
    setSavingMission(true);
    try {
      await updateDoc(doc(db, "campaigns", campaign.id), {
        objective:      missionForm.objective      ?? "",
        targetAudience: missionForm.targetAudience ?? "",
        budgetRange:    missionForm.budgetRange    ?? "",
        channels:       missionForm.channels       ?? [],
        cadence:        missionForm.cadence        ?? "weekly",
      });
    } catch (error) {
      console.error("Error saving mission:", error);
    } finally {
      setSavingMission(false);
    }
  };

  const activateMission = async (campaign: Campaign) => {
    if (!user) return;
    const cadence = missionForm.cadence ?? campaign.cadence ?? "weekly";
    const interval = CADENCE_MS[cadence];
    const jobTypes: AutomationJob['type'][] = ['content_creation', 'lead_follow_up', 'performance_review'];
    try {
      await Promise.all([
        ...jobTypes.map((type, i) =>
          addDoc(collection(db, "automationJobs"), {
            userId: user.uid,
            campaignId: campaign.id,
            type,
            status: "pending",
            scheduledFor: Timestamp.fromMillis(Date.now() + i * 60_000),
            createdAt: serverTimestamp(),
          })
        ),
        updateDoc(doc(db, "campaigns", campaign.id), {
          status: "active",
          lastRunAt: serverTimestamp(),
          nextRunAt: Timestamp.fromMillis(Date.now() + interval),
        }),
      ]);
    } catch (error) {
      console.error("Error activating mission:", error);
    }
  };

  const deactivateMission = async (campaign: Campaign) => {
    try {
      await updateDoc(doc(db, "campaigns", campaign.id), { status: "paused" });
    } catch (error) {
      console.error("Error deactivating mission:", error);
    }
  };

  // Always derive from live `campaigns` so the drawer never reads a stale snapshot
  const missionCampaign = missionCampaignId
    ? campaigns.find(c => c.id === missionCampaignId) ?? null
    : null;
  const campaignJobs = missionCampaignId ? jobs.filter(j => j.campaignId === missionCampaignId) : [];

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
                      <div className="flex-1 min-w-0 mr-4">
                        <h3 className="text-[2.2rem] font-bold text-sb-green uppercase tracking-tight truncate mb-2">
                          {campaign.name}
                        </h3>
                        {campaign.status === 'active' && (
                          <span className="inline-flex items-center gap-1.5 text-[1rem] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-sb-accent/10 text-sb-accent">
                            <span className="w-1.5 h-1.5 rounded-full bg-sb-accent animate-pulse" /> Active
                          </span>
                        )}
                        {campaign.status === 'paused' && (
                          <span className="inline-flex items-center gap-1.5 text-[1rem] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-black/5 text-black/40">
                            <Pause size={10} /> Paused
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
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
                            className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full bg-sb-cream border border-black/5", obj.color)}
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

                    {/* Variations */}
                    <div className="mt-8 pt-8 border-t border-black/5">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <FlaskConical size={14} className="text-sb-gold" />
                          <span className="text-[1.1rem] font-black uppercase tracking-[0.2em] text-sb-green/60">A/B Variations</span>
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
                          <p className="text-[1.1rem] text-black/30 font-medium italic">No active experiments. Add one to start A/B testing.</p>
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

                    {/* Stats row */}
                    <div className="mt-8 pt-8 border-t border-black/5">
                      <div className="space-y-6">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-end">
                            <span className="text-[1rem] font-black uppercase tracking-widest text-black/40">Resonance Scan</span>
                            <span className="text-[1.6rem] font-bold text-sb-green">84.2%</span>
                          </div>
                          <div className="h-1.5 w-full bg-sb-cream rounded-full overflow-hidden border border-black/5">
                            <div className="h-full bg-sb-green rounded-full transition-all duration-1000" style={{ width: '84.2%' }} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[1rem] font-black uppercase tracking-widest text-black/40">Neural Sync</span>
                            <span className="text-[1.6rem] font-bold text-sb-gold flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-sb-gold animate-pulse" /> Active
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sb-accent font-black text-[1rem] uppercase tracking-widest hover:translate-x-1 transition-transform cursor-pointer">
                            <TrendingUp size={12} /> ROI Tracker
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Configure Mission button */}
                    <button
                      onClick={() => openMission(campaign)}
                      className="mt-6 w-full flex items-center justify-center gap-2 py-4 text-[1.1rem] font-black uppercase tracking-widest text-sb-green/40 hover:text-sb-green hover:bg-sb-cream rounded-[10px] transition-all border border-black/5"
                    >
                      <Settings2 size={14} /> Configure Mission
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Automation Jobs section */}
        <section className="mt-20 pt-12 border-t border-black/5">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-[2.4rem] font-bold text-sb-green uppercase tracking-sb flex items-center gap-4">
              <Bot size={24} /> Automation Jobs
            </h2>
            <div className="flex gap-3">
              {(['pending', 'running', 'completed', 'failed'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setJobsTab(tab)}
                  className={cn(
                    "px-5 py-2 rounded-full text-[1.1rem] font-black uppercase tracking-widest transition-all",
                    jobsTab === tab ? "bg-sb-house text-white" : "text-black/30 hover:text-sb-green"
                  )}
                >
                  {tab}
                  {jobs.filter(j => j.status === tab).length > 0 && (
                    <span className={cn("ml-2 text-[0.9rem]", jobsTab === tab ? "opacity-70" : "opacity-50")}>
                      ({jobs.filter(j => j.status === tab).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {jobs.filter(j => j.status === jobsTab).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-black/20">
              <Bot size={48} className="mb-4" />
              <p className="text-[1.4rem] font-black uppercase tracking-widest">No {jobsTab} jobs</p>
              {jobsTab === 'pending' && campaigns.some(c => c.status === 'active') === false && (
                <p className="text-[1.2rem] font-medium mt-2 text-black/30 italic">Activate a campaign mission to create jobs</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.filter(j => j.status === jobsTab).map(job => {
                const campaign = campaigns.find(c => c.id === job.campaignId);
                return (
                  <div key={job.id} className="bg-white rounded-[12px] p-8 sb-shadow-card flex items-center gap-6">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", jobStatusStyle(job.status))}>
                      <JobIcon status={job.status} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span className="text-[1.3rem] font-bold text-sb-green uppercase tracking-tight">
                          {job.type.replace(/_/g, " ")}
                        </span>
                        {campaign && (
                          <span className="text-[1rem] font-black text-black/30 uppercase tracking-widest">
                            · {campaign.name}
                          </span>
                        )}
                      </div>
                      {job.resultSummary && (
                        <p className="text-[1.2rem] text-black/50 font-medium italic truncate">{job.resultSummary}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[1rem] font-black uppercase tracking-widest text-black/30">Scheduled</p>
                      <p className="text-[1.2rem] font-bold text-sb-green">
                        {job.scheduledFor?.toDate ? job.scheduledFor.toDate().toLocaleDateString() : "—"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

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
                    <label className="text-[1.1rem] font-black uppercase tracking-[0.2em] text-sb-green/40 px-2">Variant Name</label>
                    <input
                      placeholder="e.g. Action-Oriented vs Educational"
                      value={newVariation.name}
                      onChange={e => setNewVariation({ ...newVariation, name: e.target.value })}
                      className="w-full bg-sb-cream border-2 border-transparent rounded-[12px] p-5 text-[1.6rem] font-bold focus:border-sb-gold transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[1.1rem] font-black uppercase tracking-[0.2em] text-sb-green/40 px-2">Variant Bias / Tone</label>
                    <textarea
                      placeholder="Describe how this variation should differ from the baseline strategy..."
                      value={newVariation.description}
                      onChange={e => setNewVariation({ ...newVariation, description: e.target.value })}
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

        {/* Add Campaign Modal */}
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
                    <label className="text-[1.1rem] font-black uppercase tracking-[0.2em] text-sb-green/40 px-2">Campaign Name</label>
                    <input
                      required
                      placeholder="e.g. Q3 SaaS Expansion"
                      value={newCampaign.name}
                      onChange={e => setNewCampaign({ ...newCampaign, name: e.target.value })}
                      className="w-full bg-white border-2 border-transparent rounded-[12px] p-5 text-[1.6rem] font-bold focus:border-sb-gold transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[1.1rem] font-black uppercase tracking-[0.2em] text-sb-green/40 px-2 flex items-center gap-2">
                      <Globe size={12} /> Target Niche
                    </label>
                    <input
                      required
                      placeholder="e.g. Enterprise Fintech"
                      value={newCampaign.niche}
                      onChange={e => setNewCampaign({ ...newCampaign, niche: e.target.value })}
                      className="w-full bg-white border-2 border-transparent rounded-[12px] p-5 text-[1.6rem] font-bold focus:border-sb-gold transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[1.1rem] font-black uppercase tracking-[0.2em] text-sb-green/40 px-2">Neural Goal / ROI Target</label>
                    <textarea
                      required
                      placeholder="Define the core intent and expected outcome..."
                      value={newCampaign.goals}
                      onChange={e => setNewCampaign({ ...newCampaign, goals: e.target.value })}
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

        {/* Mission Drawer */}
        <AnimatePresence>
          {missionCampaign && (
            <>
              <div
                className="fixed inset-0 z-[90] bg-sb-house/60 backdrop-blur-sm"
                onClick={() => setMissionCampaignId(null)}
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed right-0 top-0 h-screen w-full max-w-xl z-[100] bg-white shadow-2xl overflow-y-auto"
              >
                <div className="p-12 pt-16">
                  <button
                    onClick={() => setMissionCampaignId(null)}
                    className="absolute top-8 right-8 text-black/20 hover:text-black transition-colors"
                  >
                    <XCircle size={24} />
                  </button>

                  <div className="flex items-center gap-4 mb-2">
                    <Settings2 size={20} className="text-sb-accent" />
                    <h2 className="text-[2.4rem] font-black uppercase tracking-sb text-sb-green">Mission Config</h2>
                  </div>
                  <p className="text-[1.4rem] font-bold text-sb-green/40 uppercase tracking-widest mb-10 truncate">
                    {missionCampaign.name}
                  </p>

                  {/* Automation status + toggle */}
                  <div className="mb-10 p-8 bg-sb-cream rounded-[12px] flex items-center justify-between">
                    <div>
                      <p className="text-[1.1rem] font-black uppercase tracking-widest text-black/40 mb-1">Automation</p>
                      <p className={cn("text-[1.6rem] font-bold uppercase tracking-tight",
                        missionCampaign.status === 'active' ? "text-sb-accent" : "text-black/40"
                      )}>
                        {missionCampaign.status === 'active' ? '● Active' : missionCampaign.status === 'paused' ? '⏸ Paused' : '○ Draft'}
                      </p>
                    </div>
                    {missionCampaign.status === 'active' ? (
                      <button
                        onClick={() => deactivateMission(missionCampaign)}
                        className="px-6 py-3 bg-red-50 text-red-500 rounded-full font-black text-[1.2rem] uppercase tracking-widest hover:bg-red-100 transition-all flex items-center gap-2"
                      >
                        <Pause size={14} /> Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => activateMission(missionCampaign)}
                        className="px-6 py-3 bg-sb-accent text-white rounded-full font-black text-[1.2rem] uppercase tracking-widest hover:bg-sb-green transition-all flex items-center gap-2"
                      >
                        <Play size={14} /> Activate
                      </button>
                    )}
                  </div>

                  <div className="space-y-8">
                    {/* Objective */}
                    <div>
                      <label className="block text-[1.1rem] font-black uppercase tracking-[0.2em] text-sb-green/40 mb-3">Mission Objective</label>
                      <textarea
                        value={missionForm.objective ?? ""}
                        onChange={e => setMissionForm(f => ({ ...f, objective: e.target.value }))}
                        placeholder="Describe the core mission and intended outcome..."
                        className="w-full h-24 bg-sb-cream border-2 border-transparent rounded-[12px] p-5 text-[1.4rem] font-medium italic focus:border-sb-gold transition-all outline-none resize-none"
                      />
                    </div>

                    {/* Target Audience */}
                    <div>
                      <label className="block text-[1.1rem] font-black uppercase tracking-[0.2em] text-sb-green/40 mb-3">Target Audience</label>
                      <input
                        value={missionForm.targetAudience ?? ""}
                        onChange={e => setMissionForm(f => ({ ...f, targetAudience: e.target.value }))}
                        placeholder="e.g. B2B SaaS founders, Series A–C"
                        className="w-full bg-sb-cream border-2 border-transparent rounded-[12px] p-5 text-[1.4rem] font-bold focus:border-sb-gold transition-all outline-none"
                      />
                    </div>

                    {/* Budget Range */}
                    <div>
                      <label className="block text-[1.1rem] font-black uppercase tracking-[0.2em] text-sb-green/40 mb-3">Budget Range</label>
                      <input
                        value={missionForm.budgetRange ?? ""}
                        onChange={e => setMissionForm(f => ({ ...f, budgetRange: e.target.value }))}
                        placeholder="e.g. $500–1,000 / month"
                        className="w-full bg-sb-cream border-2 border-transparent rounded-[12px] p-5 text-[1.4rem] font-bold focus:border-sb-gold transition-all outline-none"
                      />
                    </div>

                    {/* Channels */}
                    <div>
                      <label className="block text-[1.1rem] font-black uppercase tracking-[0.2em] text-sb-green/40 mb-3">Channels</label>
                      <div className="flex flex-wrap gap-3">
                        {CHANNELS.map(ch => {
                          const selected = (missionForm.channels ?? []).includes(ch);
                          return (
                            <button
                              key={ch}
                              type="button"
                              onClick={() => {
                                const cur = missionForm.channels ?? [];
                                setMissionForm(f => ({
                                  ...f,
                                  channels: selected ? cur.filter(c => c !== ch) : [...cur, ch]
                                }));
                              }}
                              className={cn(
                                "px-5 py-2 rounded-full text-[1.1rem] font-black uppercase tracking-widest transition-all",
                                selected
                                  ? "bg-sb-house text-white"
                                  : "bg-sb-cream text-black/40 hover:text-sb-green border border-black/10"
                              )}
                            >
                              {ch}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Cadence */}
                    <div>
                      <label className="block text-[1.1rem] font-black uppercase tracking-[0.2em] text-sb-green/40 mb-3">Cadence</label>
                      <div className="flex gap-3">
                        {CADENCES.map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setMissionForm(f => ({ ...f, cadence: c }))}
                            className={cn(
                              "flex-1 py-4 rounded-[10px] text-[1.2rem] font-black uppercase tracking-widest transition-all",
                              (missionForm.cadence ?? 'weekly') === c
                                ? "bg-sb-house text-white shadow-md"
                                : "bg-sb-cream text-black/40 hover:text-sb-green border border-black/10"
                            )}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => saveMission(missionCampaign)}
                      disabled={savingMission}
                      className="w-full py-5 bg-sb-house text-white font-black text-[1.4rem] uppercase tracking-widest rounded-[12px] sb-button-active flex items-center justify-center gap-3 disabled:opacity-50 transition-all hover:bg-sb-green"
                    >
                      {savingMission ? <Loader2 size={18} className="animate-spin" /> : <Settings2 size={18} />}
                      Save Mission
                    </button>
                  </div>

                  {/* Per-campaign jobs list */}
                  {campaignJobs.length > 0 && (
                    <div className="mt-12 pt-10 border-t border-black/5">
                      <h3 className="text-[1.4rem] font-black uppercase tracking-widest text-sb-green/60 mb-6 flex items-center gap-3">
                        <ListTodo size={16} /> Automation Jobs
                      </h3>
                      <div className="space-y-3">
                        {campaignJobs.map(job => (
                          <div key={job.id} className="flex items-center gap-4 p-5 bg-sb-cream rounded-[10px]">
                            <span className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0", jobStatusStyle(job.status))}>
                              <JobIcon status={job.status} />
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[1.2rem] font-bold text-sb-green uppercase tracking-tight">
                                {job.type.replace(/_/g, " ")}
                              </p>
                              <p className="text-[1rem] font-black uppercase tracking-widest text-black/30">{job.status}</p>
                            </div>
                            <p className="text-[1.1rem] text-black/30 font-medium shrink-0">
                              {job.scheduledFor?.toDate ? job.scheduledFor.toDate().toLocaleDateString() : "—"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
