import React, { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import PageMeta from "../components/PageMeta";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Send, RotateCcw, Video, FileText, Share2, Sparkles, CheckCircle2, Brain, Database, Shield, Calendar, Clock, Target, FlaskConical, Play, Loader2, Lightbulb, User, ArrowRight, Copy, Check, BookOpen, Trash2, Edit3, Filter, Search } from "lucide-react";
import { generateMarketingContent, generateContentIdeas, generateMarketingContentForIdea } from "../services/geminiService";
import { generateVeoVideo } from "../services/videoService";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../lib/utils";
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, Timestamp, deleteDoc, doc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { Campaign } from "../types";

export default function ContentEngine() {
  const { profile } = useAuth();
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

  // AI Assistant Specific States
  const [activeTab, setActiveTab] = useState<'assistant' | 'direct' | 'library'>('assistant');
  const [libraryPosts, setLibraryPosts] = useState<any[]>([]);
  const [libraryFilter, setLibraryFilter] = useState<'all' | 'linkedin' | 'x' | 'tiktok' | 'general'>('all');
  const [librarySearch, setLibrarySearch] = useState("");
  const [assistantBrief, setAssistantBrief] = useState("");
  const [isAssistantGenerating, setIsAssistantGenerating] = useState(false);
  const [brainstormResponse, setBrainstormResponse] = useState<{
    assistantIntroduction: string;
    ideas: Array<{
      id: string;
      title: string;
      concept: string;
      targetPlatformFit: string;
      angleAndHook: string;
      messagingAngle: string;
      recommendedFormat: string;
      suggestedVisualPrompt: string;
      strategicReason: string;
    }>;
  } | null>(null);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [isIdeaConverting, setIsIdeaConverting] = useState(false);

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

  // Fetch drafts/library posts
  useEffect(() => {
    if (!profile?.id) return;
    const draftsQuery = query(
      collection(db, "posts"),
      where("userId", "==", profile.id),
      where("status", "==", "draft")
    );
    return onSnapshot(draftsQuery, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const sorted = docs.sort((a: any, b: any) => {
        const da = a.createdAt ? (a.createdAt.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt).getTime()) : 0;
        const db_ = b.createdAt ? (b.createdAt.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt).getTime()) : 0;
        return db_ - da; // newest first
      });
      setLibraryPosts(sorted);
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
      alert(err instanceof Error ? err.message : "Synthesis failed. Check your API keys in Settings.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBrainstorm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche) {
      alert("Please provide the Market Niche first so our Brainstorm Co-pilot can align.");
      return;
    }
    setIsAssistantGenerating(true);
    setBrainstormResponse(null);
    setSelectedIdeaId(null);

    const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);
    const selectedVariation = selectedCampaign?.variations?.find(v => v.id === selectedVariationId);
    
    const combinedGoal = selectedVariation 
      ? `${goal} (Experiment Focus: ${selectedVariation.name} - ${selectedVariation.description})`
      : goal;

    try {
      const data = await generateContentIdeas(
        niche,
        audience || "General digital audience interested in this niche",
        combinedGoal || "Increase engaging content presence and brand authority",
        assistantBrief,
        profile?.apiKeys,
        engine
      );
      setBrainstormResponse(data);
    } catch (err) {
      console.error("Brainstorming failed:", err);
      alert(err instanceof Error ? err.message : "Brainstorming failed. Confirm API keys match in Settings.");
    } finally {
      setIsAssistantGenerating(false);
    }
  };

  const handleConvertIdeaToFormats = async (idea: any) => {
    setIsIdeaConverting(true);
    setSelectedIdeaId(idea.id);

    try {
      const data = await generateMarketingContentForIdea(
        niche,
        audience || "General digital audience interested in this niche",
        goal || "Increase engaging content presence and brand authority",
        idea.title,
        idea.concept,
        idea.angleAndHook,
        idea.suggestedVisualPrompt,
        profile?.apiKeys,
        engine
      );
      setResult(data);
      setGeneratedVideoUrl(null);
      setTimeout(() => {
        const target = document.getElementById("neural-payload-section");
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } catch (err) {
      console.error("Failed converting idea:", err);
      alert(err instanceof Error ? err.message : "Conversion of idea failed.");
    } finally {
      setIsIdeaConverting(false);
      setSelectedIdeaId(null);
    }
  };

  const handleSaveDraft = async () => {
    if (!profile || !result) {
      alert("No content to save.");
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
      alert("Neural Artifact Saved! Content archived in your local library.");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "posts");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeploy = async () => {
    if (!profile || !result || selectedPlatforms.length === 0 || !scheduleDate) {
      alert("Please select at least one platform and a schedule date.");
      return;
    }

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
      alert("Neural Strategy Deployed! All posts have been synchronized and scheduled.");
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

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) ? prev.filter(p => p !== platformId) : [...prev, platformId]
    );
  };

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Draft caption copied to clipboard!");
    } catch (err) {
      console.error(err);
      alert("Failed to copy draft content.");
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    if (!confirm("Are you sure you want to permanently delete this archived draft from your library?")) {
      return;
    }
    try {
      await deleteDoc(doc(db, "posts", draftId));
      alert("Draft deleted successfully.");
    } catch (err) {
      console.error("Delete draft failed:", err);
      alert("Failed to delete draft.");
    }
  };

  const handleLoadDraftToWorkspace = (draft: any) => {
    const isLnk = draft.platforms?.includes('linkedin');
    const isX = draft.platforms?.includes('x');
    const isTk = draft.platforms?.includes('tiktok');
    
    let decodedImagePrompt = "A cinematic marketing campaign visual";
    if (draft.mediaUrl && draft.mediaUrl.includes('/prompt/')) {
      try {
        const parts = draft.mediaUrl.split('/prompt/');
        if (parts[1]) {
          const promptPart = parts[1].split('?')[0];
          decodedImagePrompt = decodeURIComponent(promptPart);
        }
      } catch (err) {
        // ignore fallback
      }
    }

    setResult({
      tiktokScript: isTk ? draft.caption : "",
      linkedinPost: isLnk ? draft.caption : "",
      xThread: isX ? draft.caption : "",
      suggestedImagePrompt: decodedImagePrompt,
      hashtags: []
    });

    if (draft.platforms && draft.platforms.length > 0) {
      setSelectedPlatforms(draft.platforms);
    } else {
      setSelectedPlatforms([]);
    }

    // Scroll payload section into view
    setTimeout(() => {
      const target = document.getElementById("neural-payload-section");
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);

    alert("Draft loaded into active workspace. Customize copy and deploy it from the panel on the right!");
  };

  const handleGenerateVideo = async () => {
    if (!(window as any).aistudio) {
      alert("Neural API Bridge not found.");
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
        alert("Session expired. Neural key reset. Please try generating again.");
      } else {
        alert(err.message || "Video synthesis failed.");
      }
    } finally {
      setIsVideoGenerating(false);
      setVideoStatus("");
    }
  };

  return (
    <div className="flex min-h-screen bg-sb-cream text-black font-sans tracking-sb selection:bg-sb-house selection:text-white">
      <PageMeta title="Content Engine" description="Generate platform-native posts with AI in seconds." path="/content" />
      <Sidebar />
      <main className="flex-1 p-12 lg:p-24 overflow-y-auto">
        <header className="mb-16">
          <h1 className="text-[4.8rem] font-bold text-sb-green tracking-sb mb-2 uppercase">Content lab</h1>
          <p className="text-black/40 text-[1.6rem] font-medium italic">Neural Content Synthesis & Strategy Optimizer</p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
          {/* Input Section */}
          <section className="space-y-10">
            {/* Tabs Selector */}
            <div className="flex bg-white/60 p-2 rounded-[12px] sb-shadow-card border-2 border-sb-green/5">
              <button
                type="button"
                onClick={() => setActiveTab('assistant')}
                className={cn(
                  "flex-1 py-4 text-[1.2rem] font-black uppercase tracking-widest rounded-[8px] transition-all flex items-center justify-center gap-3 cursor-pointer",
                  activeTab === 'assistant' ? "bg-sb-house text-white shadow-sm" : "text-sb-green/50 hover:text-sb-green/80 hover:bg-sb-cream/40"
                )}
              >
                <Brain size={16} />
                AI Ideas Partner
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('direct')}
                className={cn(
                  "flex-1 py-4 text-[1.2rem] font-black uppercase tracking-widest rounded-[8px] transition-all flex items-center justify-center gap-3 cursor-pointer",
                  activeTab === 'direct' ? "bg-sb-house text-white shadow-sm" : "text-sb-green/50 hover:text-sb-green/80 hover:bg-sb-cream/40"
                )}
              >
                <Zap size={16} />
                Direct Generator
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('library')}
                className={cn(
                  "flex-1 py-4 text-[1.2rem] font-black uppercase tracking-widest rounded-[8px] transition-all flex items-center justify-center gap-3 cursor-pointer",
                  activeTab === 'library' ? "bg-sb-house text-white shadow-sm" : "text-sb-green/50 hover:text-sb-green/80 hover:bg-sb-cream/40"
                )}
              >
                <BookOpen size={16} />
                Content Library
              </button>
            </div>

            {activeTab === 'library' ? (
              <div className="bg-white p-12 rounded-[12px] sb-shadow-card space-y-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <h2 className="text-[2.1rem] font-bold text-sb-green flex items-center gap-4">
                    <div className="w-10 h-10 bg-sb-cream rounded-full flex items-center justify-center text-sb-accent">
                      <BookOpen size={20} />
                    </div>
                    Archived Library
                  </h2>
                  <span className="text-[1.1rem] bg-sb-gold/20 text-sb-house border border-sb-gold/20 font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                    {libraryPosts.length} drafts
                  </span>
                </div>

                {/* Library Search & Filter Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-sb-green/40" size={16} />
                    <input 
                      type="text"
                      placeholder="Search saved content..."
                      value={librarySearch}
                      onChange={(e) => setLibrarySearch(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 bg-sb-cream border-2 border-transparent rounded-[12px] text-[1.3rem] font-bold focus:bg-white focus:border-sb-accent transition-all outline-none"
                    />
                  </div>
                  
                  <div className="relative">
                    <select
                      value={libraryFilter}
                      onChange={(e: any) => setLibraryFilter(e.target.value)}
                      className="w-full px-6 py-4 bg-sb-cream border-2 border-transparent rounded-[12px] text-[1.3rem] font-semibold focus:bg-white focus:border-sb-accent transition-all outline-none cursor-pointer appearance-none"
                    >
                      <option value="all">All Channels</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="x">X / Twitter</option>
                      <option value="tiktok">TikTok</option>
                      <option value="general">Generic / Other</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 select-none">
                      <Filter size={14} />
                    </div>
                  </div>
                </div>

                {/* Filter and render draft posts */}
                {(() => {
                  const filtered = libraryPosts.filter(draft => {
                    const matchesSearch = !librarySearch || 
                      (draft.caption && draft.caption.toLowerCase().includes(librarySearch.toLowerCase())) ||
                      (draft.platforms && draft.platforms.some((p: string) => p.toLowerCase().includes(librarySearch.toLowerCase())));
                    
                    if (libraryFilter === 'all') return matchesSearch;
                    if (libraryFilter === 'general') {
                      return matchesSearch && (!draft.platforms || draft.platforms.length === 0);
                    }
                    return matchesSearch && draft.platforms?.includes(libraryFilter);
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="py-24 text-center border-2 border-dashed border-sb-house/5 rounded-[12px] bg-sb-cream/20">
                        <BookOpen size={36} className="text-sb-green/10 mx-auto mb-4" />
                        <p className="text-[1.4rem] text-sb-green/50 font-bold uppercase tracking-wider">No Drafts Found</p>
                        <p className="text-[1.1rem] text-black/30 mt-2">Generate content and click "Save to Library" to build your backlog.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-6 max-h-[60rem] overflow-y-auto pr-2 scrollbar-thin">
                      {filtered.map((draft) => {
                        const date = draft.createdAt 
                          ? (draft.createdAt.seconds 
                              ? new Date(draft.createdAt.seconds * 1000) 
                              : new Date(draft.createdAt)) 
                          : null;
                        const formattedDate = date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown Date';
                        
                        return (
                          <div 
                            key={draft.id} 
                            className="p-6 bg-sb-cream rounded-[12px] border-2 border-transparent hover:border-sb-house/10 transition-all flex flex-col gap-4 relative group"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex flex-wrap gap-2 items-center">
                                {draft.platforms && draft.platforms.length > 0 ? (
                                  draft.platforms.map((p: string) => (
                                    <span key={p} className="text-[1rem] bg-sb-house text-white font-black uppercase tracking-wider px-3 py-1 rounded-full text-center">
                                      {p}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[1rem] bg-zinc-400 text-white font-black uppercase tracking-wider px-3 py-1 rounded-full text-center">
                                    General
                                  </span>
                                )}
                                <span className="text-[1rem] text-black/40 font-bold">
                                  {formattedDate}
                                </span>
                              </div>
                              
                              <button
                                type="button"
                                onClick={() => handleDeleteDraft(draft.id)}
                                className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                                title="Delete Draft"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>

                            <p className="text-[1.25rem] text-black/95 font-medium line-clamp-4 leading-relaxed whitespace-pre-wrap font-sans">
                              {draft.caption}
                            </p>

                            {draft.mediaUrl && (
                              <div className="w-full relative rounded-[8px] overflow-hidden border border-black/5 aspect-video bg-white">
                                <img 
                                  src={draft.mediaUrl} 
                                  alt="Visual mockup" 
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 mt-2 border-t border-black/5 pt-4">
                              <button
                                type="button"
                                onClick={() => handleCopyText(draft.caption)}
                                className="py-3 bg-white hover:bg-black/5 text-sb-green border border-black/5 rounded-full text-[1.1rem] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <Copy size={12} /> Copy Draft
                              </button>
                              <button
                                type="button"
                                onClick={() => handleLoadDraftToWorkspace(draft)}
                                className="py-3 bg-sb-house text-white rounded-full text-[1.1rem] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-sb-green hover:shadow-md cursor-pointer"
                              >
                                <Edit3 size={12} /> Workspace
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-[12px] sb-shadow-card">
                <h2 className="text-[2.1rem] font-bold text-sb-green mb-10 flex items-center gap-4">
                  <div className="w-10 h-10 bg-sb-cream rounded-full flex items-center justify-center text-sb-accent">
                    {activeTab === 'assistant' ? <Brain size={20} /> : <Sparkles size={20} />}
                  </div>
                  {activeTab === 'assistant' ? "AI Assistant Strategist" : "Direct Code Parameters"}
                </h2>

                {activeTab === 'assistant' ? (
                <form onSubmit={handleBrainstorm} className="space-y-8">
                  {/* Shareable niche input */}
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

                  {/* Audience */}
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

                  {/* Goal selection */}
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

                  {/* Neural Engine selection */}
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
                            "py-4 rounded-[12px] text-[1.1rem] font-black uppercase tracking-widest border-2 transition-all flex flex-col items-center gap-2 cursor-pointer",
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

                  {/* Campaign */}
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

                  {/* Experiment */}
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

                  {/* Custom brief focus */}
                  <div className="group">
                    <label className="text-[1.2rem] font-black uppercase tracking-[0.15em] text-sb-green/60 block mb-3 px-2 flex justify-between items-center">
                      <span>Co-pilot Brainstorm Brief / Focus</span>
                      <span className="text-[1rem] opacity-40 lowercase italic">Optional</span>
                    </label>
                    <textarea 
                      value={assistantBrief}
                      onChange={(e) => setAssistantBrief(e.target.value)}
                      placeholder="e.g. Focus on educational tips about our tech, launch an interactive challenge, or target high-conviction buying pain-points..."
                      className="w-full px-8 py-5 bg-sb-cream border-2 border-transparent rounded-[12px] text-[1.4rem] font-bold focus:bg-white focus:border-sb-accent transition-all outline-none resize-none h-28"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isAssistantGenerating}
                    className="w-full py-6 bg-sb-house text-white rounded-full font-black uppercase tracking-[0.15em] text-[1.6rem] flex items-center justify-center gap-4 hover:bg-sb-green hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isAssistantGenerating ? (
                      <>
                        <Loader2 className="animate-spin text-sb-gold" size={20} />
                        Co-pilot is thinking...
                      </>
                    ) : (
                      <>
                        <Brain size={20} className="text-sb-gold" />
                        Brainstorm Content Ideas
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleGenerate} className="space-y-8">
                  {/* Market Niche */}
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
                  {/* Audience */}
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
                  {/* Neural Engine */}
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
                            "py-4 rounded-[12px] text-[1.1rem] font-black uppercase tracking-widest border-2 transition-all flex flex-col items-center gap-2 cursor-pointer",
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

                  {/* Core Goal */}
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

                  {/* Campaign */}
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

                  {/* Experiments block */}
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
                    className="w-full py-6 bg-sb-house text-white rounded-full font-black uppercase tracking-[0.15em] text-[1.6rem] flex items-center justify-center gap-4 hover:bg-sb-green hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isGenerating ? <RotateCcw className="animate-spin" /> : <Zap size={20} className="fill-current" />}
                    {isGenerating ? "Synthesizing..." : "Generate Package"}
                  </button>
                </form>
              )}
            </div>
          )}

            {/* Brainstorm output display directly underneath parameter boxes */}
            {activeTab === 'assistant' && brainstormResponse && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                {/* Assistant Introductory Speech Bubble */}
                <div className="bg-sb-house text-white p-8 rounded-[12px] sb-shadow-card flex items-start gap-6 relative overflow-hidden border border-white/5">
                  <div className="absolute top-0 right-0 w-36 h-36 bg-sb-gold/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="w-12 h-12 rounded-full bg-sb-gold flex items-center justify-center shrink-0 shadow-lg">
                    <Brain className="text-sb-house" size={20} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[1.1rem] font-black uppercase tracking-widest text-sb-gold">Co-pilot Strategist</p>
                    <p className="text-[1.4rem] font-medium leading-relaxed opacity-95">
                      "{brainstormResponse.assistantIntroduction}"
                    </p>
                  </div>
                </div>

                {/* Ideas list title */}
                <div className="flex items-center gap-3 px-2">
                  <Lightbulb className="text-sb-gold" size={20} />
                  <h3 className="text-[1.5rem] font-black uppercase tracking-widest text-sb-green">Generated Campaign Vectors</h3>
                </div>

                {/* Grid of Brainstormed Ideas */}
                <div className="space-y-8">
                  {brainstormResponse.ideas.map((idea) => (
                    <motion.div 
                      key={idea.id}
                      whileHover={{ y: -2 }}
                      className={cn(
                        "bg-white p-8 rounded-[12px] border-2 shadow-sm transition-all relative overflow-hidden group/card",
                        selectedIdeaId === idea.id ? "border-sb-gold bg-sb-gold/5" : "border-transparent hover:border-sb-green/10"
                      )}
                    >
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <div>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-4 py-1.5 bg-sb-cream text-sb-green text-[1rem] font-black uppercase tracking-wider rounded-full border border-sb-green/10">
                              {idea.targetPlatformFit}
                            </span>
                            {idea.messagingAngle && (
                              <span className="px-4 py-1.5 bg-sb-gold/10 text-sb-gold text-[1rem] font-black uppercase tracking-wider rounded-full border border-sb-gold/20">
                                {idea.messagingAngle}
                              </span>
                            )}
                            {idea.recommendedFormat && (
                              <span className="px-4 py-1.5 bg-sb-house/10 text-sb-house text-[1rem] font-black uppercase tracking-wider rounded-full border border-sb-house/20">
                                {idea.recommendedFormat}
                              </span>
                            )}
                          </div>
                          <h4 className="text-[1.8rem] font-black text-sb-green mt-3 leading-tight group-hover/card:text-sb-house transition-colors">
                            {idea.title}
                          </h4>
                        </div>
                      </div>
                      
                      <p className="text-[1.3rem] text-black/70 font-medium leading-relaxed mb-6">
                        {idea.concept}
                      </p>
                      
                      <div className="space-y-4 border-t border-sb-cream pt-4 text-[1.2rem]">
                        <div>
                          <span className="font-black uppercase text-sb-green/50 text-[1rem] block tracking-wider mb-1">Hook &amp; Angle</span>
                          <p className="font-bold text-sb-green italic">"{idea.angleAndHook}"</p>
                        </div>
                        <div>
                          <span className="font-black uppercase text-sb-green/50 text-[1rem] block tracking-wider mb-1">Suggested Visual Direction</span>
                          <p className="font-medium text-black/60 italic">"{idea.suggestedVisualPrompt}"</p>
                        </div>
                        <div>
                          <span className="font-black uppercase text-sb-green/50 text-[1rem] block tracking-wider mb-1">Strategic Aligner</span>
                          <p className="font-medium text-black/60">{idea.strategicReason}</p>
                        </div>
                      </div>

                      <div className="mt-8 border-t border-sb-cream pt-6">
                        <button
                          type="button"
                          disabled={isIdeaConverting}
                          onClick={() => handleConvertIdeaToFormats(idea)}
                          className={cn(
                            "w-full py-4 text-[1.1rem] font-black uppercase tracking-wider rounded-[8px] flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer",
                            selectedIdeaId === idea.id ? "bg-sb-gold/10 text-sb-gold" : "bg-sb-cream hover:bg-sb-house hover:text-white hover:border-sb-house text-sb-green"
                          )}
                        >
                          {isIdeaConverting && selectedIdeaId === idea.id ? (
                            <>
                              <Loader2 className="animate-spin text-sb-gold" size={14} />
                              Translating concept to copy...
                            </>
                          ) : (
                            <>
                              <Sparkles className="text-sb-gold shrink-0 animate-pulse" size={14} />
                              Select &amp; Synthesize Copy
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </section>

          {/* Result Section */}
          <section id="neural-payload-section" className="relative scroll-mt-24">
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
                       <ContentBlock 
                         icon={Video} 
                         title="TikTok / Reel Script" 
                         content={result.tiktokScript} 
                         platform="tiktok"
                         selectedPlatforms={selectedPlatforms}
                         onTogglePlatform={togglePlatform}
                       />
                       <ContentBlock 
                         icon={FileText} 
                         title="LinkedIn Post" 
                         content={result.linkedinPost} 
                         platform="linkedin"
                         selectedPlatforms={selectedPlatforms}
                         onTogglePlatform={togglePlatform}
                       />
                       <ContentBlock 
                         icon={Share2} 
                         title="X System Thread" 
                         content={result.xThread} 
                         platform="x"
                         selectedPlatforms={selectedPlatforms}
                         onTogglePlatform={togglePlatform}
                       />
                       <ContentBlock 
                         icon={Sparkles} 
                         title="Visual Synthesis Prompt" 
                         content={result.suggestedImagePrompt} 
                         platform="visual"
                         onUsePrompt={() => {
                           const target = document.getElementById("visual-synthesis-section");
                           if (target) {
                             target.scrollIntoView({ behavior: "smooth" });
                           }
                         }}
                       />

                        <div id="visual-synthesis-section" className="pt-8 border-t border-white/5 scroll-mt-24">
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

function ContentBlock({ 
  icon: Icon, 
  title, 
  content, 
  platform, 
  selectedPlatforms = [], 
  onTogglePlatform,
  onUsePrompt 
}: {
  icon: React.ComponentType<any>;
  title: string;
  content: string;
  platform?: 'tiktok' | 'linkedin' | 'x' | 'visual';
  selectedPlatforms?: string[];
  onTogglePlatform?: (platform: string) => void;
  onUsePrompt?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  
  const charCount = content ? content.length : 0;
  const wordCount = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  
  const isSelected = platform && platform !== 'visual' && selectedPlatforms.includes(platform);

  const handleCopy = async () => {
    try {
      if (content) {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const handleUse = () => {
    if (platform === 'visual' && onUsePrompt) {
      onUsePrompt();
    } else if (platform && onTogglePlatform) {
      onTogglePlatform(platform);
    }
  };

  return (
    <div className={cn(
      "p-8 rounded-[14px] border-2 transition-all duration-300 relative overflow-hidden group/block",
      isSelected 
        ? "bg-sb-gold/[0.04] border-sb-gold" 
        : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
    )}>
      {/* Background radial accent */}
      {isSelected && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-sb-gold/5 rounded-full blur-2xl pointer-events-none" />
      )}
      
      {/* Header element */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3.5">
          <div className={cn(
            "w-[3.6rem] h-[3.6rem] rounded-full flex items-center justify-center transition-colors",
            isSelected ? "bg-sb-gold text-sb-house" : "bg-white/5 text-sb-gold"
          )}>
            <Icon size={18} />
          </div>
          <div>
            <h4 className="text-[1.4rem] font-black uppercase tracking-widest text-white">{title}</h4>
            <div className="flex items-center gap-2 mt-1 opacity-40 text-[1.1rem] font-bold uppercase tracking-widest">
              <span>{charCount} characters</span>
              <span>•</span>
              <span>{wordCount} words</span>
            </div>
          </div>
        </div>
        
        {/* Selected badge status */}
        {isSelected && (
          <span className="self-start sm:self-auto text-[1rem] bg-sb-gold text-sb-house px-3 py-1.5 rounded-full font-black tracking-widest shadow-lg flex items-center gap-1.5 animate-pulse uppercase">
            <span className="w-1.5 h-1.5 bg-sb-house rounded-full animate-ping" /> Selected for queue
          </span>
        )}
      </div>

      {/* Content wrapper */}
      <div className="relative">
        <div className="text-[1.35rem] text-white/95 leading-relaxed font-sans bg-black/20 p-6 rounded-[10px] border border-white/5 whitespace-pre-wrap max-h-72 overflow-y-auto font-medium shadow-inner scrollbar-thin">
          {content}
        </div>
      </div>

      {/* Action Tray */}
      <div className="flex flex-wrap sm:flex-nowrap gap-4 mt-6">
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "flex-1 py-4 text-[1.1rem] font-black uppercase tracking-widest rounded-full flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer border",
            copied 
              ? "bg-sb-gold/20 border-sb-gold text-sb-gold" 
              : "bg-white/5 border-white/10 hover:bg-white/10 text-white hover:border-white/20 active:scale-[0.97]"
          )}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied!" : "Copy Draft"}
        </button>

        <button
          type="button"
          onClick={handleUse}
          className={cn(
            "flex-1 py-4 text-[1.1rem] font-black uppercase tracking-widest rounded-full flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer border",
            isSelected 
              ? "bg-sb-gold text-sb-house border-sb-gold shadow-lg shadow-sb-gold/10 hover:bg-sb-gold/90 active:scale-[0.97]" 
              : "bg-white/5 border-white/10 hover:bg-white/10 text-white hover:border-white/20 active:scale-[0.97]"
          )}
        >
          {platform === 'visual' ? (
            <>
              <Sparkles size={14} className="text-sb-gold animate-pulse" />
              Focus Visualizer
            </>
          ) : isSelected ? (
            <>
              <Check size={14} />
              Deselect Post
            </>
          ) : (
            <>
              <ArrowRight size={14} />
              Queue for Post
            </>
          )}
        </button>
      </div>
    </div>
  );
}
