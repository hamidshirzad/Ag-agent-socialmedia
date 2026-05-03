import React, { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Send, RotateCcw, Video, FileText, Share2, Sparkles, CheckCircle2, Brain, Database, Shield, Calendar, Clock, Target, FlaskConical, Play, Loader2 } from "lucide-react";
import { generateMarketingContent } from "../services/geminiService";
import { generateVeoVideo } from "../services/videoService";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/Toast";
import { cn } from "../lib/utils";
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, Timestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { Campaign } from "../types";

export default function ContentEngine() {
  const { profile } = useAuth();
  const toast = useToast();
  const [niche, setNiche] = useState(profile?.niche || "");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState(profile?.goals || "");
  const [engine, setEngine] = useState<'gemini' | 'anthropic' | 'openai'>('gemini');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [selectedVariationId, setSelectedVariationId] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [videoStatus, setVideoStatus] = useState("");
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  // Distribution State
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState("");
  const [autoReply, setAutoReply] = useState(true);
  const [agentEngagement, setAgentEngagement] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync with profile if it loads later
  useEffect(() => {
    if (profile?.niche && !niche) setNiche(profile.niche);
    if (profile?.goals && !goal) setGoal(profile.goals);
  }, [profile]);

  // Fetch campaigns
  useEffect(() => {
    if (!profile?.id) return;
    const q = query(collection(db, "campaigns"), where("userId", "==", profile.id), where("active", "==", true));
    return onSnapshot(q, (snapshot) => {
      setCampaigns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Campaign[]);
    });
  }, [profile]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);
    const selectedVariation = selectedCampaign?.variations?.find(v => v.id === selectedVariationId);
    
    const combinedGoal = selectedVariation 
      ? `${goal} (Experiment Focus: ${selectedVariation.name} - ${selectedVariation.description})`
      : goal;

    try {
      const data = await generateMarketingContent(
        niche, 
        audience, 
        combinedGoal, 
        profile?.apiKeys,
        engine
      );
      setResult(data);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Synthesis failed. Check your API keys in Settings.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!profile || !result) {
      toast.error("No content to save.");
      return;
    }

    setIsSaving(true);
    try {
      const postsCol = collection(db, "posts");
      
      // Save for each selected platform if any, otherwise just one general draft
      const platformsToSave = selectedPlatforms.length > 0 ? selectedPlatforms : ['general'];
      
      const savePromises = platformsToSave.map(platform => {
        let caption = "";
        let type: 'video' | 'image' | 'text' = 'text';
        
        if (platform === 'linkedin') { 
          caption = result.linkedinPost; 
          type = 'text'; 
        } else if (platform === 'x') { 
          caption = result.xThread; 
          type = 'text'; 
        } else if (platform === 'tiktok') { 
          caption = result.tiktokScript; 
          type = 'video'; 
        } else {
          caption = result.linkedinPost || result.xThread || result.tiktokScript;
        }

        return addDoc(postsCol, {
          userId: profile.id,
          campaignId: selectedCampaignId || null,
          variationId: selectedVariationId || null,
          type,
          platforms: platformsToSave[0] === 'general' ? [] : [platform],
          caption,
          mediaUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(result.suggestedImagePrompt)}?width=1280&height=720&seed=${result.imageSeed || 42}&nologo=true`,
          status: 'draft',
          createdAt: serverTimestamp()
        });
      });

      await Promise.all(savePromises);
      toast.success("Neural Artifact Saved! Content archived in your local library.");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "posts");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeploy = async () => {
    if (!profile || !result || selectedPlatforms.length === 0 || !scheduleDate) {
      toast.error("Please select at least one platform and a schedule date.");
      return;
    }

    if (isNaN(new Date(scheduleDate).getTime())) {
      toast.error("Invalid schedule date. Please select a valid date and time.");
      return;
    }
    const scheduledTimestamp = Timestamp.fromDate(new Date(scheduleDate));

    setIsDeploying(true);
    try {
      const postsCol = collection(db, "posts");
      const scheduledTimestamp = Timestamp.fromDate(new Date(scheduleDate));
      
      const deploymentPromises = selectedPlatforms.map(platform => {
        let caption = "";
        let type: 'video' | 'image' | 'text' = 'text';
        
        if (platform === 'linkedin') { 
          caption = result.linkedinPost; 
          type = 'text'; 
        } else if (platform === 'x') { 
          caption = result.xThread; 
          type = 'text'; 
        } else if (platform === 'tiktok') { 
          caption = result.tiktokScript; 
          type = 'video'; 
        }

        return addDoc(postsCol, {
          userId: profile.id,
          campaignId: selectedCampaignId || null,
          variationId: selectedVariationId || null,
          type,
          platforms: [platform],
          caption,
          mediaUrl: platform === 'tiktok' && generatedVideoUrl ? generatedVideoUrl : `https://image.pollinations.ai/prompt/${encodeURIComponent(result.suggestedImagePrompt)}?width=1280&height=720&seed=${result.imageSeed || 42}&nologo=true`,
          scheduledAt: scheduledTimestamp,
          autoReply,
          agentEngagement,
          status: 'scheduled',
          createdAt: serverTimestamp()
        });
      });

      await Promise.all(deploymentPromises);
      toast.success("Neural Strategy Deployed! All posts synchronized and scheduled.");
      setResult(null);
      setSelectedPlatforms([]);
      setScheduleDate("");
      setGeneratedVideoUrl(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "posts");
    } finally {
      setIsDeploying(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!(window as any).aistudio) {
      toast.error("Neural API Bridge not found.");
      return;
    }

    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
      // Assume success as per skill instructions
    }

    setIsVideoGenerating(true);
    setVideoStatus("Connecting to Veo Cluster...");

    try {
      // For Veo, we'll use the tiktok script and suggested image prompt as baseline
      const videoUrl = await generateVeoVideo({
        prompt: `Scene based on this script: ${result.tiktokScript}. Aesthetic: ${result.suggestedImagePrompt}`,
        aspectRatio: '9:16',
        resolution: '720p'
      }, (status) => setVideoStatus(status));

      setGeneratedVideoUrl(videoUrl);
    } catch (err: any) {
      console.error(err);
      if (err.message === "KEY_NOT_FOUND") {
        await (window as any).aistudio.openSelectKey();
        toast.error("Session expired. Neural key reset. Please try generating again.");
      } else {
        toast.error(err.message || "Video synthesis failed.");
      }
    } finally {
      setIsVideoGenerating(false);
      setVideoStatus("");
    }
  };

  return (
    <div className="flex min-h-screen bg-sb-cream text-black font-sans tracking-sb selection:bg-sb-house selection:text-white">
      <Sidebar />
      <main className="flex-1 p-12 lg:p-24 overflow-y-auto">
        <header className="mb-16">
          <h1 className="text-[4.8rem] font-bold text-sb-green tracking-sb mb-2 uppercase">Content lab</h1>
          <p className="text-black/40 text-[1.6rem] font-medium italic">Neural Content Synthesis & Strategy Optimizer</p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
          {/* Input Section */}
          <section className="space-y-10">
            <div className="bg-white p-12 rounded-[12px] sb-shadow-card">
              <h2 className="text-[2.1rem] font-bold text-sb-green mb-10 flex items-center gap-4">
                <div className="w-10 h-10 bg-sb-cream rounded-full flex items-center justify-center text-sb-accent">
                  <Sparkles size={20} />
                </div>
                Strategy Parameters
              </h2>
              <form onSubmit={handleGenerate} className="space-y-8">
                <div className="group">
                  <label className="text-[1.2rem] font-black uppercase tracking-[0.15em] text-sb-green/60 block mb-3 px-2">Market Niche</label>
                  <input 
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="e.g. Luxury Eco-Travel, B2B SaaS Security"
                    className="w-full px-8 py-5 bg-sb-cream border-2 border-transparent rounded-[12px] text-[1.4rem] font-bold focus:bg-white focus:border-sb-accent transition-all outline-none"
                    required
                  />
                </div>
                <div className="group">
                  <label className="text-[1.2rem] font-black uppercase tracking-[0.15em] text-sb-green/60 block mb-3 px-2">Target Audience</label>
                  <input 
                     value={audience}
                     onChange={(e) => setAudience(e.target.value)}
                     placeholder="e.g. Gen Z Digital Nomads, Fortune 500 CTOs"
                     className="w-full px-8 py-5 bg-sb-cream border-2 border-transparent rounded-[12px] text-[1.4rem] font-bold focus:bg-white focus:border-sb-accent transition-all outline-none"
                     required
                  />
                </div>
                <div className="group">
                  <label className="text-[1.2rem] font-black uppercase tracking-[0.15em] text-sb-green/60 block mb-3 px-2">Neural Engine</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'gemini', label: 'Gemini', icon: Sparkles },
                      { id: 'anthropic', label: 'Claude', icon: Brain },
                      { id: 'openai', label: 'GPT-4o', icon: Zap }
                    ].map((eng) => (
                      <button
                        key={eng.id}
                        type="button"
                        onClick={() => setEngine(eng.id as any)}
                        className={cn(
                          "py-4 rounded-[12px] text-[1.1rem] font-black uppercase tracking-widest border-2 transition-all flex flex-col items-center gap-2",
                          engine === eng.id ? "bg-sb-house text-white border-sb-house" : "bg-sb-cream text-sb-green/40 border-transparent hover:border-sb-green/10"
                        )}
                      >
                        <eng.icon size={16} className={cn(engine === eng.id ? "text-sb-gold" : "text-sb-green/20")} />
                        {eng.label}
                      </button>
                    ))}
                  </div>
                  {engine !== 'gemini' && !profile?.apiKeys?.[engine] && (
                    <p className="mt-2 text-[1rem] text-red-400 font-bold uppercase tracking-widest px-2 flex items-center gap-2">
                       <Shield size={12} /> Key not found in settings
                    </p>
                  )}
                </div>

                <div className="group">
                  <label className="text-[1.2rem] font-black uppercase tracking-[0.15em] text-sb-green/60 block mb-3 px-2">Core Goal</label>
                  <div className="relative">
                    <select 
                       value={goal}
                       onChange={(e) => setGoal(e.target.value)}
                       className="w-full px-8 py-5 bg-sb-cream border-2 border-transparent rounded-[12px] text-[1.4rem] font-bold focus:bg-white focus:border-sb-accent transition-all outline-none appearance-none cursor-pointer"
                       required
                    >
                      <option value="">Select Primary Objective</option>
                      <option value="brand-awareness">Massive Virality & Awareness</option>
                      <option value="lead-gen">High-Intent Lead Generation</option>
                      <option value="authority">Thought Leadership & Authority</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                      <RotateCcw size={14} className="rotate-90" />
                    </div>
                  </div>
                </div>

                <div className="group">
                  <label className="text-[1.2rem] font-black uppercase tracking-[0.15em] text-sb-green/60 block mb-3 px-2 flex justify-between items-center">
                    <span>Neural Campaign</span>
                    <span className="text-[1rem] opacity-40 lowercase italic">Optional association</span>
                  </label>
                  <div className="relative">
                    <select 
                       value={selectedCampaignId}
                       onChange={(e) => {
                          setSelectedCampaignId(e.target.value);
                          setSelectedVariationId("");
                       }}
                       className="w-full px-8 py-5 bg-sb-cream border-2 border-transparent rounded-[12px] text-[1.4rem] font-bold focus:bg-white focus:border-sb-accent transition-all outline-none appearance-none cursor-pointer"
                    >
                      <option value="">Select Target Campaign</option>
                      {campaigns.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.niche})</option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                      <Target size={14} />
                    </div>
                  </div>
                </div>

                {selectedCampaignId && campaigns.find(c => c.id === selectedCampaignId)?.variations?.length && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="group"
                  >
                    <label className="text-[1.2rem] font-black uppercase tracking-[0.15em] text-sb-gold block mb-3 px-2 flex justify-between items-center">
                      <span>Neural Experiment</span>
                      <span className="text-[1rem] opacity-60 lowercase italic">A/B Variation</span>
                    </label>
                    <div className="relative">
                      <select 
                         value={selectedVariationId}
                         onChange={(e) => setSelectedVariationId(e.target.value)}
                         className="w-full px-8 py-5 bg-sb-gold/5 border-2 border-sb-gold/20 rounded-[12px] text-[1.4rem] font-bold focus:bg-white focus:border-sb-gold transition-all outline-none appearance-none cursor-pointer"
                      >
                        <option value="">Baseline Strategy</option>
                        {campaigns.find(c => c.id === selectedCampaignId)?.variations?.map(v => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 text-sb-gold">
                        <FlaskConical size={14} />
                      </div>
                    </div>
                  </motion.div>
                )}
                <button 
                  disabled={isGenerating}
                  className="w-full py-6 bg-sb-house text-white rounded-full font-black uppercase tracking-[0.15em] text-[1.6rem] flex items-center justify-center gap-4 hover:bg-sb-green hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 sb-button-active"
                >
                  {isGenerating ? <RotateCcw className="animate-spin" /> : <Zap size={20} className="fill-current" />}
                  {isGenerating ? "Synthesizing..." : "Generate Package"}
                </button>
              </form>
            </div>
          </section>

          {/* Result Section */}
          <section className="relative">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8 pb-12"
                >
                  <div className="bg-sb-house text-white p-12 rounded-[12px] sb-shadow-frap relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-sb-gold" />
                    <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/10">
                      <h3 className="text-[2.1rem] font-bold uppercase tracking-sb">Neural Payload</h3>
                      <span className="text-[1.1rem] bg-sb-gold text-sb-house px-4 py-1.5 rounded-full font-black tracking-widest shadow-lg">STABLE</span>
                    </div>

                    <div className="space-y-10">
                       <ContentBlock icon={Video} title="TikTok / Reel Script" content={result.tiktokScript} />
                       <ContentBlock icon={FileText} title="LinkedIn Post" content={result.linkedinPost} />
                       <ContentBlock icon={Share2} title="X System Thread" content={result.xThread} />

                       <div className="pt-8 border-t border-white/5">
                          <div className="flex items-center gap-3 mb-6 opacity-80">
                            <Sparkles size={16} className="text-sb-gold" />
                            <h4 className="text-[1.2rem] font-black uppercase tracking-widest text-sb-gold">AI Visual Synthesis</h4>
                          </div>
                          
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <p className="text-[1.1rem] font-black uppercase tracking-widest text-white/40">Base Visual</p>
                                <div className="relative group rounded-[12px] overflow-hidden border border-white/10 aspect-video bg-sb-cream/5 shadow-inner">
                                  <img 
                                    src={`https://image.pollinations.ai/prompt/${encodeURIComponent(result.suggestedImagePrompt)}?width=1280&height=720&seed=${result.imageSeed || 42}&nologo=true`}
                                    alt="AI Generated Visual"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-sb-house/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                                    <p className="text-[1.1rem] text-white/60 italic font-medium">"{result.suggestedImagePrompt}"</p>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <p className="text-[1.1rem] font-black uppercase tracking-widest text-sb-gold">Veo Video synthesis</p>
                                <div className="relative group rounded-[12px] overflow-hidden border border-white/10 aspect-video bg-sb-cream/5 shadow-inner flex items-center justify-center">
                                  {generatedVideoUrl ? (
                                    <video 
                                      src={generatedVideoUrl} 
                                      controls 
                                      className="w-full h-full object-cover"
                                    />
                                  ) : isVideoGenerating ? (
                                    <div className="flex flex-col items-center gap-6 p-8 text-center bg-sb-house/50 w-full h-full justify-center">
                                      <Loader2 size={32} className="text-sb-gold animate-spin" />
                                      <div className="space-y-2">
                                        <p className="text-white font-black uppercase tracking-widest text-[1.2rem]">{videoStatus}</p>
                                        <p className="text-white/40 text-[1rem] italic">Neural rendering in progress. This may take 2-3 minutes.</p>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center gap-6 p-8 text-center">
                                      <Video size={40} className="text-white/10" />
                                      <button 
                                        onClick={handleGenerateVideo}
                                        className="px-8 py-4 bg-sb-gold text-sb-house rounded-full text-[1.1rem] font-black uppercase tracking-widest hover:shadow-lg transition-all flex items-center gap-3 animate-pulse border-2 border-sb-gold/20"
                                      >
                                        <Play size={14} className="fill-current" /> Generate Veo Video
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-4">
                              <button 
                                onClick={() => setResult({...result, imageSeed: Math.floor(Math.random() * 1000000)})}
                                className="flex-1 py-4 bg-white/5 border border-white/10 rounded-full text-[1.1rem] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                              >
                                <RotateCcw size={14} /> Regenerate All
                              </button>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              {[10, 20, 30].map((offset) => (
                                <button 
                                  key={offset}
                                  onClick={() => setResult({...result, imageSeed: (result.imageSeed || 42) + offset})}
                                  className="aspect-square rounded-[8px] overflow-hidden border border-white/10 hover:border-sb-gold transition-all"
                                >
                                  <img 
                                    src={`https://image.pollinations.ai/prompt/${encodeURIComponent(result.suggestedImagePrompt)}?width=400&height=400&seed=${(result.imageSeed || 42) + offset}&nologo=true`}
                                    alt={`Variation ${offset}`}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                       
                       <div className="pt-8 border-t border-white/5">
                          <p className="text-[1.1rem] font-black uppercase tracking-widest mb-6 text-sb-gold opacity-80">Optimized Signals</p>
                          <div className="flex flex-wrap gap-3">
                             {result.hashtags?.map((tag: string) => (
                               <span key={tag} className="text-[1.1rem] px-5 py-2 bg-white/5 rounded-full border border-white/10 font-bold hover:bg-white/10 transition-colors">#{tag}</span>
                             ))}
                          </div>
                       </div>

                       {/* Distribution Module */}
                       <div className="pt-8 border-t border-white/5">
                          <div className="flex items-center gap-3 mb-6 opacity-80">
                            <Calendar size={16} className="text-sb-gold" />
                            <h4 className="text-[1.2rem] font-black uppercase tracking-widest text-sb-gold">Neural Distribution</h4>
                          </div>
                          <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                              {[
                                { id: 'linkedin', label: 'LinkedIn', icon: FileText },
                                { id: 'x', label: 'X Thread', icon: Share2 },
                                { id: 'tiktok', label: 'TikTok', icon: Video }
                              ].map((plat) => (
                                <button
                                  key={plat.id}
                                  onClick={() => {
                                    setSelectedPlatforms(prev => 
                                      prev.includes(plat.id) ? prev.filter(p => p !== plat.id) : [...prev, plat.id]
                                    );
                                  }}
                                  className={cn(
                                    "py-5 rounded-[12px] text-[1rem] font-black uppercase tracking-widest border-2 transition-all flex flex-col items-center gap-3",
                                    selectedPlatforms.includes(plat.id) ? "bg-sb-accent border-sb-accent text-white" : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                                  )}
                                >
                                  <plat.icon size={18} />
                                  {plat.label}
                                </button>
                              ))}
                            </div>

                            <div className="group">
                              <label className="text-[1.1rem] font-black uppercase tracking-[0.2em] text-white/40 block mb-3 px-2 flex items-center gap-2">
                                <Clock size={12} /> Schedule Deployment
                              </label>
                              <input 
                                type="datetime-local"
                                value={scheduleDate}
                                onChange={(e) => setScheduleDate(e.target.value)}
                                className="w-full bg-white/5 border-2 border-white/10 rounded-[12px] p-5 text-[1.4rem] font-bold text-white focus:bg-white/10 focus:border-sb-gold transition-all outline-none [color-scheme:dark]"
                              />
                            </div>

                            <div className="pt-4 space-y-4">
                              <label className="flex items-center justify-between p-4 bg-white/5 rounded-[12px] border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                                <div className="flex items-center gap-3">
                                  <Brain size={16} className={cn(agentEngagement ? "text-sb-gold" : "text-white/20")} />
                                  <span className="text-[1.1rem] font-black uppercase tracking-widest text-white/80">AI Agent Engagement</span>
                                </div>
                                <input 
                                  type="checkbox" 
                                  checked={agentEngagement} 
                                  onChange={(e) => setAgentEngagement(e.target.checked)}
                                  className="w-5 h-5 accent-sb-gold"
                                />
                              </label>
                              <label className="flex items-center justify-between p-4 bg-white/5 rounded-[12px] border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                                <div className="flex items-center gap-3">
                                  <RotateCcw size={16} className={cn(autoReply ? "text-sb-gold" : "text-white/20")} />
                                  <span className="text-[1.1rem] font-black uppercase tracking-widest text-white/80">Neural Auto-Reply</span>
                                </div>
                                <input 
                                  type="checkbox" 
                                  checked={autoReply} 
                                  onChange={(e) => setAutoReply(e.target.checked)}
                                  className="w-5 h-5 accent-sb-gold"
                                />
                              </label>
                            </div>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-12">
                      <button 
                        onClick={handleSaveDraft}
                        disabled={isSaving || isDeploying}
                        className="py-6 border-2 border-white/10 text-white/60 rounded-full font-black uppercase tracking-[0.15em] text-[1.4rem] flex items-center justify-center gap-4 hover:bg-white/5 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                         {isSaving ? <RotateCcw size={20} className="animate-spin" /> : <Database size={20} />}
                         {isSaving ? "Archiving..." : "Save to Library"}
                      </button>

                      <button 
                        onClick={handleDeploy}
                        disabled={isDeploying || isSaving || selectedPlatforms.length === 0 || !scheduleDate}
                        className="py-6 bg-sb-gold text-sb-house rounded-full font-black uppercase tracking-[0.15em] text-[1.4rem] flex items-center justify-center gap-4 hover:shadow-xl active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed sb-button-active"
                      >
                         {isDeploying ? <RotateCcw size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                         {isDeploying ? "Deploying..." : "Deploy Strategy"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full min-h-[50rem] bg-white border-2 border-dashed border-sb-house/10 rounded-[12px] flex flex-col items-center justify-center text-center p-16 shadow-inner">
                   <div className="w-24 h-24 bg-sb-cream rounded-full flex items-center justify-center mb-8 shadow-inner">
                      <Zap size={48} className="text-sb-green opacity-10" />
                   </div>
                   <h3 className="font-bold text-[2.4rem] text-sb-green opacity-30 uppercase tracking-widest mb-4">Neural Standby</h3>
                   <p className="max-w-[28rem] text-[1.6rem] text-black/20 italic font-medium uppercase tracking-widest">Enter niche parameters to trigger content synthesis.</p>
                </div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>

      {/* Signature Floating Frap Button */}
      <button className="fixed bottom-12 right-12 w-[5.6rem] h-[5.6rem] bg-sb-accent rounded-full flex items-center justify-center text-white sb-shadow-frap sb-button-active z-[60]">
        <Zap className="fill-white w-6 h-6" />
      </button>
    </div>
  );
}

function ContentBlock({ icon: Icon, title, content }: any) {
  const len: number = content?.length ?? 0;
  return (
    <div>
      <div className="flex items-center gap-3 mb-4 opacity-80">
        <Icon size={16} className="text-sb-gold" />
        <h4 className="text-[1.2rem] font-black uppercase tracking-widest text-sb-gold">{title}</h4>
      </div>
      <p className="text-[1.4rem] text-white/80 leading-relaxed font-sans bg-white/5 p-6 rounded-[12px] border border-white/10 italic">
        {content}
      </p>
      <p className={cn(
        "text-[1.1rem] text-right mt-2 font-bold uppercase tracking-widest",
        len > 9500 ? "text-red-400" : "text-white/30"
      )}>
        {len.toLocaleString()} / 10,000
      </p>
    </div>
  );
}
