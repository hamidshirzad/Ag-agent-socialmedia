import React, { useState, useEffect, useMemo } from "react";
import { Sidebar } from "../components/Sidebar";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Share2, 
  Eye, 
  Edit3, 
  Plus, 
  Zap, 
  Trash2, 
  X, 
  Check, 
  Globe, 
  Clock, 
  Search, 
  Filter, 
  Sparkles, 
  Video, 
  FileText, 
  Target as CampaignIcon,
  HelpCircle,
  Database,
  Grid
} from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  Timestamp 
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { Post, Campaign } from "../types";

const AVAILABLE_PLATFORMS = [
  { id: "linkedin", name: "LinkedIn", icon: FileText, color: "bg-blue-600 text-white" },
  { id: "x", name: "X Thread", icon: Share2, color: "bg-zinc-900 text-white" },
  { id: "tiktok", name: "TikTok", icon: Video, color: "bg-pink-600 text-white" },
  { id: "instagram", name: "Instagram", icon: Globe, color: "bg-purple-600 text-white" },
  { id: "meta", name: "Meta / FB", icon: Eye, color: "bg-indigo-600 text-white" }
];

export default function Calendar() {
  const { profile } = useAuth();
  
  // Real Database States
  const [posts, setPosts] = useState<Post[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Filter States
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Calender Navigation State (defaults to current date - May 2026 based on metadata/user settings)
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    // Enforce May 2026 if current date is completely offline or out of bounds, but standard default works.
    return d;
  });

  // Modal / Scheduling States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Form Fields
  const [formCaption, setFormCaption] = useState("");
  const [formPlatforms, setFormPlatforms] = useState<string[]>([]);
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("12:00");
  const [formType, setFormType] = useState<'video' | 'image' | 'text'>('text');
  const [formMediaUrl, setFormMediaUrl] = useState("");
  const [formCampaignId, setFormCampaignId] = useState("");
  const [formStatus, setFormStatus] = useState<'draft' | 'scheduled' | 'posted'>('scheduled');
  const [formAutoReply, setFormAutoReply] = useState(true);
  const [formAgentEngagement, setFormAgentEngagement] = useState(true);

  const [isSubmitRunning, setIsSubmitRunning] = useState(false);

  // Help prompt state
  const [illustrationSeed, setIllustrationSeed] = useState(Math.floor(Math.random() * 1000));

  // --- Date Parsers ---
  const getPostDate = (timestamp: any): Date | null => {
    if (!timestamp) return null;
    if (timestamp.toDate && typeof timestamp.toDate === "function") {
      return timestamp.toDate();
    }
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000);
    }
    const d = new Date(timestamp);
    return isNaN(d.getTime()) ? null : d;
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  // --- Real-time Data Listeners ---
  useEffect(() => {
    if (!profile?.id) return;

    setIsLoading(true);
    const postsQuery = query(
      collection(db, "posts"),
      where("userId", "==", profile.id)
    );

    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      
      // Sort: closest scheduled dates first
      fetchedPosts.sort((a, b) => {
        const da = getPostDate(a.scheduledAt) || new Date(0);
        const db_ = getPostDate(b.scheduledAt) || new Date(0);
        return da.getTime() - db_.getTime();
      });

      setPosts(fetchedPosts);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "posts");
      setIsLoading(false);
    });

    const campaignsQuery = query(
      collection(db, "campaigns"),
      where("userId", "==", profile.id),
      where("active", "==", true)
    );

    const unsubscribeCampaigns = onSnapshot(campaignsQuery, (snapshot) => {
      setCampaigns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Campaign[]);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "campaigns");
    });

    return () => {
      unsubscribePosts();
      unsubscribeCampaigns();
    };
  }, [profile]);

  // --- Calendar Geometry Calculations ---
  const calendarGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    let startDayOfWeek = firstDay.getDay() - 1; // Align Mon = 0 to Sun = 6
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const cells: { date: Date; isCurrentMonth: boolean; dayNum: number }[] = [];

    // Prev month padding
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dNum = prevMonthTotalDays - i;
      cells.push({
        date: new Date(year, month - 1, dNum),
        isCurrentMonth: false,
        dayNum: dNum
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      cells.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
        dayNum: i
      });
    }

    // Next month padding to fill a neat grid of 42 cells (6 rows)
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        dayNum: i
      });
    }

    return cells;
  }, [currentDate]);

  // --- Filtering Posts ---
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Platform Filter
      if (selectedPlatformFilter !== "all" && !post.platforms?.includes(selectedPlatformFilter)) {
        return false;
      }
      // Status Filter
      if (statusFilter !== "all" && post.status !== statusFilter) {
        return false;
      }
      // Search Box Filter
      if (searchQuery.trim()) {
        const queryLower = searchQuery.toLowerCase();
        const bodyMatches = post.caption?.toLowerCase().includes(queryLower);
        const compMatches = campaigns.find(c => c.id === post.campaignId)?.name?.toLowerCase().includes(queryLower);
        if (!bodyMatches && !compMatches) return false;
      }
      return true;
    });
  }, [posts, selectedPlatformFilter, searchQuery, statusFilter, campaigns]);

  // Month shift triggers
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // --- Modal Forms handling ---
  const openScheduleModal = (post: Post | null, defaultDate?: Date) => {
    setEditingPost(post);
    if (post) {
      // populate form
      setFormCaption(post.caption || "");
      setFormPlatforms(post.platforms || []);
      setFormType(post.type || 'text');
      setFormMediaUrl(post.mediaUrl || "");
      setFormCampaignId(post.campaignId || "");
      setFormStatus(post.status || 'scheduled');
      setFormAutoReply(post.autoReply !== false);
      setFormAgentEngagement(post.agentEngagement !== false);

      const targetDate = getPostDate(post.scheduledAt) || new Date();
      const yr = targetDate.getFullYear();
      const mo = String(targetDate.getMonth() + 1).padStart(2, '0');
      const dy = String(targetDate.getDate()).padStart(2, '0');
      setFormDate(`${yr}-${mo}-${dy}`);

      const hr = String(targetDate.getHours()).padStart(2, '0');
      const mn = String(targetDate.getMinutes()).padStart(2, '0');
      setFormTime(`${hr}:${mn}`);
    } else {
      // reset clean slate
      setFormCaption("");
      setFormPlatforms([]);
      setFormType('text');
      setFormMediaUrl("");
      setFormCampaignId("");
      setFormStatus('scheduled');
      setFormAutoReply(true);
      setFormAgentEngagement(true);

      const cellDate = defaultDate || new Date();
      const yr = cellDate.getFullYear();
      const mo = String(cellDate.getMonth() + 1).padStart(2, '0');
      const dy = String(cellDate.getDate()).padStart(2, '0');
      setFormDate(`${yr}-${mo}-${dy}`);
      setFormTime("12:00");
    }
    setIsModalOpen(true);
  };

  const handleGenerateIllustration = () => {
    if (!formCaption) {
      alert("Please provide a caption first so we can extract concepts!");
      return;
    }
    const safeTopic = encodeURIComponent(
      formCaption.split(" ").slice(0, 6).join(" ").replace(/[^\w\s]/gi, '')
    );
    const newSeed = Math.floor(Math.random() * 1000000);
    setIllustrationSeed(newSeed);
    setFormMediaUrl(`https://image.pollinations.ai/prompt/cyberpunk_isometric_vector_creative_theme_for_${safeTopic}?width=1280&height=720&seed=${newSeed}&nologo=true`);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    if (!formCaption.trim()) {
      alert("Post caption is required.");
      return;
    }
    if (formPlatforms.length === 0) {
      alert("Please select at least one deployment platform.");
      return;
    }

    setIsSubmitRunning(true);
    try {
      // parse scheduled timestamp
      const [year, monthStr, day] = formDate.split("-");
      const [hours, minutes] = formTime.split(":");
      const targetJsDate = new Date(
        parseInt(year),
        parseInt(monthStr) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
      );
      const scheduledTimestamp = Timestamp.fromDate(targetJsDate);

      const postPayload: any = {
        userId: profile.id,
        caption: formCaption,
        platforms: formPlatforms,
        type: formType,
        mediaUrl: formMediaUrl || null,
        campaignId: formCampaignId || null,
        status: formStatus,
        autoReply: formAutoReply,
        agentEngagement: formAgentEngagement,
        scheduledAt: scheduledTimestamp,
        updatedAt: serverTimestamp()
      };

      if (editingPost) {
        // Update existing document
        const postRef = doc(db, "posts", editingPost.id);
        await updateDoc(postRef, postPayload);
      } else {
        // Create new document
        postPayload.createdAt = serverTimestamp();
        await addDoc(collection(db, "posts"), postPayload);
      }

      setIsModalOpen(false);
      setEditingPost(null);
    } catch (err) {
      handleFirestoreError(
        err, 
        editingPost ? OperationType.UPDATE : OperationType.CREATE, 
        "posts"
      );
    } finally {
      setIsSubmitRunning(false);
    }
  };

  const handlePostDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to cancel this scheduled publication? This action is irreversible.")) {
      return;
    }
    try {
      await deleteDoc(doc(db, "posts", postId));
      setIsModalOpen(false);
      setEditingPost(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, "posts");
    }
  };

  // --- Precalculations for UI Breakdown stats ---
  const platformStats = useMemo(() => {
    const stats_ = { linkedin: 0, x: 0, tiktok: 0, instagram: 0, meta: 0 };
    posts.forEach(p => {
      p.platforms?.forEach(pForm => {
        if (pForm in stats_) {
          stats_[pForm as keyof typeof stats_]++;
        }
      });
    });
    return stats_;
  }, [posts]);

  const upcomingScheduled = useMemo(() => {
    return posts.filter(p => {
      const d = getPostDate(p.scheduledAt);
      return p.status === 'scheduled' && d && d.getTime() > Date.now();
    });
  }, [posts]);

  return (
    <div className="flex min-h-screen bg-sb-cream text-black font-sans tracking-sb">
      <Sidebar />
      <main className="flex-1 p-8 lg:p-16 overflow-y-auto">
        
        {/* Header Console */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 pb-8 border-b border-black/10 gap-6">
          <div>
            <h1 className="text-sb-green font-semibold text-[3.6rem] leading-none mb-2 uppercase tracking-sb">RELAY GRID</h1>
            <p className="text-[1.6rem] text-black/50 font-medium">Coordinate Multi-Platform Distribution Calendars</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={() => openCalendly()}
              className="px-10 py-4 bg-sb-green text-white rounded-full font-black text-[1.4rem] uppercase tracking-widest hover:bg-opacity-95 hover:shadow-lg transition-all flex items-center gap-3 sb-button-active shadow-md"
              title="Book a live demo with the team"
            >
              <CalendarIcon size={16} className="text-sb-gold" /> Book a Demo
            </button>

            <button 
              onClick={() => openScheduleModal(null)}
              className="px-10 py-4 bg-sb-accent text-white rounded-full font-black text-[1.4rem] uppercase tracking-widest hover:bg-sb-green hover:shadow-lg transition-all flex items-center gap-3 sb-button-active"
            >
              <Plus size={16} /> Schedule Post
            </button>
            
            <div className="flex items-center bg-white rounded-full sb-shadow-nav border border-black/5 p-1.5 self-stretch">
              <button 
                onClick={prevMonth}
                className="w-10 h-10 hover:bg-sb-cream/80 flex items-center justify-center rounded-full transition-all"
              >
                <ChevronLeft size={18} className="text-sb-green" />
              </button>
              <div className="px-6 font-bold text-[1.2rem] uppercase tracking-widest text-sb-green text-center min-w-[12rem]">
                {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </div>
              <button 
                onClick={nextMonth}
                className="w-10 h-10 hover:bg-sb-cream/80 flex items-center justify-center rounded-full transition-all"
              >
                <ChevronRight size={18} className="text-sb-green" />
              </button>
            </div>
          </div>
        </header>

        {/* Filters and Utilities Bar */}
        <div className="bg-white rounded-[12px] sb-shadow-card p-6 mb-8 flex flex-col xl:flex-row justify-between gap-6 items-center">
          
          {/* Platform filter group */}
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <span className="text-[1.1rem] font-black uppercase tracking-[0.2em] text-sb-green/60 px-2 flex items-center gap-2">
              <Filter size={12} /> Platform View:
            </span>
            <button 
              onClick={() => setSelectedPlatformFilter("all")}
              className={cn(
                "px-5 py-2.5 rounded-full text-[1.1rem] font-bold uppercase tracking-widest border transition-all",
                selectedPlatformFilter === "all" 
                  ? "bg-sb-house text-white border-sb-house" 
                  : "bg-sb-cream text-black/50 border-transparent hover:border-black/5"
              )}
            >
              All Channels
            </button>
            {AVAILABLE_PLATFORMS.map((plat) => (
              <button 
                key={plat.id}
                onClick={() => setSelectedPlatformFilter(plat.id)}
                className={cn(
                  "px-5 py-2.5 rounded-full text-[1.1rem] font-bold uppercase tracking-widest border transition-all flex items-center gap-2",
                  selectedPlatformFilter === plat.id 
                    ? "bg-sb-accent text-white border-sb-accent" 
                    : "bg-sb-cream text-black/50 border-transparent hover:border-black/5"
                )}
              >
                <plat.icon size={12} />
                {plat.name}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
            {/* Status Select filter */}
            <div className="relative w-full sm:w-48">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-6 pr-10 py-3 bg-sb-cream border-2 border-transparent rounded-full text-[1.2rem] font-bold uppercase tracking-wider outline-none appearance-none cursor-pointer focus:bg-white focus:border-sb-accent transition-all"
              >
                <option value="all">ANY STATUS</option>
                <option value="scheduled">SCHEDULED</option>
                <option value="draft">DRAFTS</option>
                <option value="posted">POSTED</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                <ChevronRight size={12} className="rotate-90" />
              </div>
            </div>

            {/* Keyword Search */}
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-black/30" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search captions, campaigns..."
                className="w-full pl-12 pr-6 py-3 bg-sb-cream border-2 border-transparent rounded-full text-[1.2rem] font-bold focus:bg-white focus:border-sb-accent transition-all outline-none"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30 hover:text-black"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Calendar Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Monthly grid column */}
          <div className="lg:col-span-2 bg-white rounded-[12px] sb-shadow-card overflow-hidden self-start">
            {/* Visual Indicator Legend Bar */}
            <div className="px-6 py-4 bg-sb-cream/35 border-b border-black/5 flex items-center justify-between flex-wrap gap-4 select-none">
              <span className="text-[1.1rem] font-black uppercase tracking-[0.15em] text-sb-green/70 flex items-center gap-2">
                <Grid size={12} className="text-sb-gold shrink-0" /> Grid Indicators
              </span>
              <div className="flex items-center gap-6 flex-wrap">
                <span className="flex items-center gap-2 text-[1.15rem] font-bold text-black/60">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-500/10" />
                  Video
                </span>
                <span className="flex items-center gap-2 text-[1.15rem] font-bold text-black/60">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-500/10" />
                  Image
                </span>
                <span className="flex items-center gap-2 text-[1.15rem] font-bold text-black/60">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-500/10" />
                  Text
                </span>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b border-black/5 bg-sb-ceramic">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                <div key={day} className="py-5 text-center font-black text-[1.1rem] uppercase tracking-[0.2em] text-sb-green/60">
                  {day}
                </div>
              ))}
            </div>

            {isLoading ? (
              <div className="h-[60rem] flex flex-col items-center justify-center p-24 text-center">
                <div className="w-16 h-16 bg-sb-cream rounded-full flex items-center justify-center animate-pulse mb-6">
                  <Zap size={32} className="text-sb-accent animate-spin" />
                </div>
                <h3 className="text-[1.8rem] font-bold text-sb-green uppercase tracking-widest mb-2">Syncing Relay Grid...</h3>
                <p className="text-black/40 text-[1.3rem] italic">Synthesizing network schedules from Firestore</p>
              </div>
            ) : (
              <div className="grid grid-cols-7">
                {calendarGrid.map((cell, idx) => {
                  // find matching posts for this cell day
                  const dayEntries = filteredPosts.filter(post => {
                    const postDate = getPostDate(post.scheduledAt);
                    return postDate && isSameDay(postDate, cell.date);
                  });

                  const isToday = isSameDay(cell.date, new Date());

                  return (
                    <div 
                      key={idx} 
                      className={cn(
                        "min-h-[14rem] p-4 border-r border-b border-black/5 transition-all relative flex flex-col group",
                        cell.isCurrentMonth ? "bg-white" : "bg-sb-cream/20 opacity-50",
                        isToday ? "bg-sb-gold/5 border-sb-gold/30" : "hover:bg-sb-cream/35"
                      )}
                    >
                      {/* Day number & headers */}
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2.5">
                          <span className={cn(
                            "text-[1.6rem] font-bold tracking-tight",
                            isToday ? "text-sb-accent font-black" : "text-sb-green/40"
                          )}>
                            {cell.dayNum}
                          </span>

                          {/* Post Type Dot Indicators */}
                          {dayEntries.length > 0 && (
                            <div className="flex items-center gap-1.5" title={`${dayEntries.length} Publication(s) Scheduled`}>
                              {dayEntries.some(p => p.type === 'video') && (
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-500/10" title="Video Content" />
                              )}
                              {dayEntries.some(p => p.type === 'image') && (
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-500/10" title="Image Content" />
                              )}
                              {dayEntries.some(p => p.type === 'text') && (
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-500/10" title="Text Content" />
                              )}
                            </div>
                          )}
                        </div>
                        
                        {isToday ? (
                          <span className="text-[0.9rem] bg-sb-accent/10 text-sb-accent border border-sb-accent/20 px-2 py-0.5 rounded-full font-black tracking-widest uppercase scale-90">
                            Today
                          </span>
                        ) : (
                          // fast schedule trigger
                          <button 
                            onClick={() => openScheduleModal(null, cell.date)}
                            className="opacity-0 group-hover:opacity-100 w-7 h-7 bg-sb-cream hover:bg-sb-house hover:text-white rounded-full flex items-center justify-center text-sb-green/60 transition-all cursor-pointer"
                            title="Schedule post for this day"
                          >
                            <Plus size={12} />
                          </button>
                        )}
                      </div>

                      {/* Day social items */}
                      <div className="space-y-2 flex-grow overflow-y-auto max-h-[16rem]">
                        {dayEntries.map((post) => {
                          const postTime = getPostDate(post.scheduledAt);
                          const formattedTime = postTime ? postTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
                          
                          // identify primary theme color based on first platform
                          const primPlatform = post.platforms?.[0] || 'linkedin';
                          const platConfig = AVAILABLE_PLATFORMS.find(ap => ap.id === primPlatform);

                          return (
                            <div 
                              key={post.id}
                              onClick={() => openScheduleModal(post)}
                              className={cn(
                                "p-3 bg-sb-house hover:bg-sb-green font-bold text-[1.1rem] uppercase transition-all rounded-[6px] shadow-sm select-none cursor-pointer flex flex-col gap-1.5 text-white"
                              )}
                              title={post.caption}
                            >
                              <div className="flex items-center justify-between pointer-events-none">
                                <span className="opacity-60 text-[0.9rem] font-black">{formattedTime}</span>
                                <div className="flex gap-1">
                                  {post.platforms?.map(pForm => {
                                    const iconConfig = AVAILABLE_PLATFORMS.find(ap => ap.id === pForm);
                                    return iconConfig ? (
                                      <span key={pForm} className="p-0.5 bg-white/20 rounded-full" title={iconConfig.name}>
                                        <iconConfig.icon size={8} />
                                      </span>
                                    ) : null;
                                  })}
                                </div>
                              </div>
                              <div className="truncate text-[1.1rem] tracking-wide font-semibold opacity-95">{post.caption}</div>
                              {post.status === 'draft' && (
                                <span className="text-[0.8rem] bg-white/10 text-white border border-white/20 px-1 py-0 rounded self-start transform scale-90 -translate-x-1">DRAFT</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Schedulers stats & pipeline queue column */}
          <div className="space-y-8">
            
            {/* System Monitor stats */}
            <div className="bg-sb-house text-white rounded-[12px] p-8 sb-shadow-card relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-sb-gold" />
              <div className="flex items-center gap-3 mb-6">
                <Zap className="text-sb-gold fill-sb-gold" size={18} />
                <h3 className="font-['Orbitron'] text-[1.2rem] font-bold uppercase tracking-[0.2em] text-sb-gold">GRID MONITOR</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-white/5 mb-6">
                <div>
                  <span className="block text-[2.8rem] font-black font-['Orbitron'] text-[#00e5ff]">{upcomingScheduled.length}</span>
                  <span className="block text-[0.9rem] font-bold uppercase tracking-wider text-white/40">PENDING PLAYS</span>
                </div>
                <div>
                  <span className="block text-[2.8rem] font-black font-['Orbitron'] text-[#00e5ff]">{posts.filter(p => p.status === 'draft').length}</span>
                  <span className="block text-[0.9rem] font-bold uppercase tracking-wider text-white/40">SAVED DRAFTS</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <p className="text-[1rem] font-black uppercase tracking-widest text-[#00e5ff] opacity-60 mb-2">CHANNEL DISPATCH COUNT</p>
                {AVAILABLE_PLATFORMS.map(p => {
                  const count = platformStats[p.id as keyof typeof platformStats] || 0;
                  return (
                    <div key={p.id} className="flex justify-between items-center text-[1.2rem] opacity-80">
                      <span className="flex items-center gap-3 font-medium">
                        <p.icon size={12} className="opacity-50" />
                        {p.name}
                      </span>
                      <span className="font-mono font-bold bg-white/10 px-3 py-1 rounded-[6px]">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scheduled Queue */}
            <div className="bg-white rounded-[12px] sb-shadow-card flex flex-col max-h-[50rem]">
              <div className="p-8 border-b border-black/5 bg-sb-ceramic flex justify-between items-center">
                <h3 className="text-sb-green font-bold text-[1.4rem] uppercase tracking-widest flex items-center gap-3">
                  <Clock size={16} className="text-sb-accent" /> Scheduled Pipeline
                </h3>
                <span className="text-[1rem] bg-sb-house text-white px-3 py-1.5 rounded-full font-black tracking-widest uppercase">
                  {upcomingScheduled.length} Active
                </span>
              </div>

              <div className="divide-y divide-black/5 overflow-y-auto flex-grow">
                {upcomingScheduled.length === 0 ? (
                  <div className="p-12 text-center flex flex-col items-center">
                    <CalendarIcon size={32} className="text-[#00e5ff] opacity-3 relative mb-4" />
                    <p className="text-[1.3rem] font-bold text-sb-green/40 uppercase tracking-widest">Pipeline Empty</p>
                    <p className="text-black/30 text-[1.1rem] italic mt-1 leading-normal">No upcoming dispatches. Click days to trigger creative launches.</p>
                  </div>
                ) : (
                  upcomingScheduled.map((post) => {
                    const postDate = getPostDate(post.scheduledAt);
                    const formattedDateStr = postDate 
                      ? postDate.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }) 
                      : "Unscheduled time";

                    return (
                      <div 
                        key={post.id} 
                        onClick={() => openScheduleModal(post)}
                        className="p-6 hover:bg-sb-cream/40 transition-all cursor-pointer group flex flex-col gap-3"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[1.1rem] text-sb-accent font-black tracking-widest flex items-center gap-2">
                            <Clock size={10} /> {formattedDateStr}
                          </span>
                          <div className="flex gap-1">
                            {post.platforms?.map((pForm) => {
                              const platConfig = AVAILABLE_PLATFORMS.find(ap => ap.id === pForm);
                              return platConfig ? (
                                <span key={pForm} className="p-1 bg-sb-cream text-sb-green rounded-full hover:bg-sb-house hover:text-white transition-all transform scale-90" title={platConfig.name}>
                                  <platConfig.icon size={10} />
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>

                        <p className="text-[1.25rem] text-sb-green font-medium line-clamp-2 uppercase leading-[1.4] tracking-normal mb-1">
                          {post.caption}
                        </p>

                        <div className="flex items-center justify-between mt-1 text-[1rem]">
                          <div className="flex items-center gap-2">
                            <span className="text-[#00e5ff] font-['Orbitron'] uppercase scale-90 -translate-x-1 tracking-widest bg-[#00e5ff]/5 px-2.5 py-1 rounded border border-[#00e5ff]/10">
                              READY
                            </span>
                            <span className={cn(
                              "text-[0.95rem] font-black uppercase px-2 py-0.5 rounded-full border tracking-wide scale-90",
                              post.type === 'video' ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                              post.type === 'image' ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                              "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            )}>
                              {post.type}
                            </span>
                          </div>
                          <button className="text-sb-green opacity-0 group-hover:opacity-100 transition-opacity hover:text-sb-accent">
                            <Edit3 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>

        {/* SCHEDULE/EDIT MODAL DIALOG */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-[16px] sb-shadow-frap w-full max-w-[65rem] overflow-hidden my-auto flex flex-col max-h-[85vh]">
              
              {/* Modal Head */}
              <div className="p-8 border-b border-black/5 bg-sb-ceramic flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <Zap size={20} className="text-sb-accent" />
                  <h3 className="text-sb-green font-bold text-[1.8rem] uppercase tracking-widest">
                    {editingPost ? "RE-OPTIMIZE DISPATCH" : "SCHEDULE CO-PILOT"}
                  </h3>
                </div>
                <button 
                  onClick={() => { setIsModalOpen(false); setEditingPost(null); }}
                  className="w-10 h-10 rounded-full bg-sb-cream hover:bg-sb-house hover:text-white flex items-center justify-center transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleFormSubmit} className="p-8 space-y-8 overflow-y-auto flex-grow">
                
                {/* Caption editor */}
                <div className="space-y-3">
                  <label className="text-[1.1rem] font-black uppercase tracking-[0.2em] text-sb-green/60 block px-2">
                    Visual Copy / Caption Context
                  </label>
                  <textarea 
                    value={formCaption}
                    onChange={(e) => setFormCaption(e.target.value)}
                    placeholder="Enter what you want to broadcast across selected platforms..."
                    rows={4}
                    className="w-full px-6 py-5 bg-sb-cream rounded-[12px] border-2 border-transparent focus:bg-white focus:border-sb-accent transition-all outline-none text-[1.4rem] font-medium leading-[1.6]"
                    maxLength={10000}
                    required
                  />
                  <div className="flex justify-between text-[1rem] opacity-40 italic px-2">
                    <span>* Multi-channel dispatch matches caption directly.</span>
                    <span>{formCaption.length} chars</span>
                  </div>
                </div>

                {/* Platform Toggles */}
                <div className="space-y-4">
                  <label className="text-[1.1rem] font-black uppercase tracking-[0.2em] text-sb-green/60 block px-2">
                    Deploy Channels
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {AVAILABLE_PLATFORMS.map((plat) => {
                      const isActive = formPlatforms.includes(plat.id);
                      return (
                        <button
                          key={plat.id}
                          type="button"
                          onClick={() => {
                            setFormPlatforms(prev => 
                              prev.includes(plat.id) ? prev.filter(x => x !== plat.id) : [...prev, plat.id]
                            );
                          }}
                          className={cn(
                            "py-4 rounded-[8px] text-[1rem] font-black uppercase tracking-widest border transition-all flex flex-col items-center gap-2",
                            isActive 
                              ? "bg-sb-accent text-white border-sb-accent" 
                              : "bg-sb-cream text-black/50 border-transparent hover:border-black/5"
                          )}
                        >
                          <plat.icon size={16} />
                          {plat.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sub row: Date, Time & Post Type */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Scheduled Date */}
                  <div className="space-y-3">
                    <label className="text-[1.1rem] font-black uppercase tracking-[0.2em] text-sb-green/60 block px-2">
                      Dispatch Date
                    </label>
                    <input 
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-6 py-4 bg-sb-cream border-2 border-transparent rounded-[8px] text-[1.3rem] font-bold focus:bg-white focus:border-sb-accent outline-none appearance-none transition-all"
                      required
                    />
                  </div>

                  {/* Scheduled Time */}
                  <div className="space-y-3">
                    <label className="text-[1.1rem] font-black uppercase tracking-[0.2em] text-sb-green/60 block px-2">
                      Target Time (HH:MM)
                    </label>
                    <input 
                      type="time"
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="w-full px-6 py-4 bg-sb-cream border-2 border-transparent rounded-[8px] text-[1.3rem] font-bold focus:bg-white focus:border-sb-accent outline-none transition-all"
                      required
                    />
                  </div>

                  {/* Post Type enum */}
                  <div className="space-y-3">
                    <label className="text-[1.1rem] font-black uppercase tracking-[0.2em] text-sb-green/60 block px-2">
                      Asset Type
                    </label>
                    <div className="relative">
                      <select 
                        value={formType}
                        onChange={(e) => setFormType(e.target.value as any)}
                        className="w-full px-6 py-4 bg-sb-cream border-2 border-transparent rounded-[8px] text-[1.3rem] font-bold outline-none focus:bg-white focus:border-sb-accent appearance-none cursor-pointer transition-all"
                      >
                        <option value="text">Pure text / copy</option>
                        <option value="image">Illustrative Image</option>
                        <option value="video">Veo Video asset</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                        <ChevronRight size={12} className="rotate-90" />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Media URL and generation */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-[1.1rem] font-black uppercase tracking-[0.2em] text-sb-green/60">
                      Attached Media URL
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateIllustration}
                      className="text-[0.95rem] font-black uppercase tracking-widest text-sb-accent hover:text-sb-green flex items-center gap-1 bg-sb-accent/5 px-2 py-1 rounded"
                    >
                      <Sparkles size={11} /> Generate Placeholders
                    </button>
                  </div>
                  <input 
                    type="url"
                    value={formMediaUrl}
                    onChange={(e) => setFormMediaUrl(e.target.value)}
                    placeholder="https://example.com/asset.png"
                    className="w-full px-6 py-4 bg-sb-cream border-2 border-transparent focus:bg-white focus:border-sb-accent rounded-[8px] text-[1.3rem] font-medium transition-all outline-none"
                  />
                  {formMediaUrl && (
                    <div className="mt-2 text-center bg-sb-cream p-4 rounded-[12px] border border-black/5 max-w-sm mx-auto">
                      <img 
                        src={formMediaUrl} 
                        alt="Asset Preview" 
                        className="max-h-[14rem] mx-auto object-contain rounded"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as any).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Campaign Link & Status Toggle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Campaign associate */}
                  <div className="space-y-3">
                    <label className="text-[1.1rem] font-black uppercase tracking-[0.2em] text-sb-green/60 block px-2">
                      Brand Campaign Link
                    </label>
                    <div className="relative">
                      <select 
                        value={formCampaignId}
                        onChange={(e) => setFormCampaignId(e.target.value)}
                        className="w-full px-6 py-4 bg-sb-cream border-2 border-transparent rounded-[8px] text-[1.3rem] font-bold outline-none focus:bg-white focus:border-sb-accent appearance-none cursor-pointer transition-all"
                      >
                        <option value="">Agnostic context (No campaign)</option>
                        {campaigns.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                        <CampaignIcon size={12} />
                      </div>
                    </div>
                  </div>

                  {/* Status selection */}
                  <div className="space-y-3">
                    <label className="text-[1.1rem] font-black uppercase tracking-[0.2em] text-sb-green/60 block px-2">
                      Dispatch state
                    </label>
                    <div className="relative">
                      <select 
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as any)}
                        className="w-full px-6 py-4 bg-sb-cream border-2 border-transparent rounded-[8px] text-[1.3rem] font-bold outline-none focus:bg-white focus:border-sb-accent appearance-none cursor-pointer transition-all"
                      >
                        <option value="scheduled">Active Scheduled</option>
                        <option value="draft">Saved Draft (Grid silent)</option>
                        <option value="posted">Forced Completed (History archive)</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                        <Check size={12} />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Advanced Co-pilot flags */}
                <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center justify-between p-4 bg-sb-cream/50 rounded-[8px] border border-black/5 cursor-pointer hover:bg-sb-cream transition-all">
                    <span className="text-[1.1rem] font-black uppercase tracking-widest text-black/70 block px-1">
                      AI agent auto engagement
                    </span>
                    <input 
                      type="checkbox" 
                      checked={formAgentEngagement} 
                      onChange={(e) => setFormAgentEngagement(e.target.checked)}
                      className="w-5 h-5 accent-sb-accent"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-sb-cream/50 rounded-[8px] border border-black/5 cursor-pointer hover:bg-sb-cream transition-all">
                    <span className="text-[1.1rem] font-black uppercase tracking-widest text-black/70 block px-1">
                      Neural custom auto-reply
                    </span>
                    <input 
                      type="checkbox" 
                      checked={formAutoReply} 
                      onChange={(e) => setFormAutoReply(e.target.checked)}
                      className="w-5 h-5 accent-sb-accent"
                    />
                  </label>
                </div>

                {/* Form Buttons */}
                <div className="pt-6 border-t border-black/5 flex flex-col sm:flex-row justify-between gap-4">
                  {editingPost ? (
                    <button 
                      type="button" 
                      onClick={() => handlePostDelete(editingPost.id)}
                      className="px-8 py-4 border border-red-200 text-red-600 hover:bg-red-50 rounded-full font-bold text-[1.3rem] uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Trash2 size={14} /> Cancel Schedule
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      type="button" 
                      onClick={() => { setIsModalOpen(false); setEditingPost(null); }}
                      className="px-8 py-4 border border-black/10 rounded-full text-black/60 font-bold text-[1.3rem] uppercase tracking-wider hover:bg-sb-cream transition-all cursor-pointer"
                    >
                      Close console
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmitRunning}
                      className="px-10 py-4 bg-sb-house hover:bg-sb-green text-white rounded-full font-black text-[1.3rem] uppercase tracking-widest shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitRunning ? "Synchronizing..." : <Check size={16} />}
                      {editingPost ? "Update Dispatch" : "Activate Co-pilot"}
                    </button>
                  </div>
                </div>

              </form>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
