import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { 
  BarChart3, 
  Users, 
  Zap, 
  TrendingUp, 
  Calendar, 
  Inbox, 
  Settings, 
  Send, 
  Brain, 
  Activity,
  PieChart as PieChartIcon,
  ChevronRight,
  Filter,
  Layers,
  Sparkles,
  RefreshCw,
  Clock,
  ArrowUpRight,
  Info,
  CheckCircle2,
  ListFilter,
  Share2,
  Twitter,
  Linkedin,
  Facebook,
  Copy,
  Check
} from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { StatsCard } from "../components/StatsCard";
import { cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  ComposedChart,
  Line,
  TooltipProps
} from 'recharts';

// Multi-timeframe performance trend datasets
const performanceDataMap: Record<string, any[]> = {
  "7d": [
    { name: 'May 15', engagement: 45, conversions: 12, outbounds: 120, replies: 18, reach: 980 },
    { name: 'May 16', engagement: 52, conversions: 15, outbounds: 145, replies: 22, reach: 1120 },
    { name: 'May 17', engagement: 48, conversions: 10, outbounds: 110, replies: 14, reach: 950 },
    { name: 'May 18', engagement: 61, conversions: 22, outbounds: 180, replies: 35, reach: 1450 },
    { name: 'May 19', engagement: 55, conversions: 18, outbounds: 165, replies: 28, reach: 1320 },
    { name: 'May 20', engagement: 67, conversions: 25, outbounds: 195, replies: 41, reach: 1680 },
    { name: 'May 21', engagement: 72, conversions: 28, outbounds: 220, replies: 48, reach: 1890 },
  ],
  "30d": [
    { name: 'Week 1', engagement: 185, conversions: 48, outbounds: 520, replies: 72, reach: 4100 },
    { name: 'Week 2', engagement: 210, conversions: 55, outbounds: 610, replies: 88, reach: 5200 },
    { name: 'Week 3', engagement: 255, conversions: 78, outbounds: 720, replies: 115, reach: 6400 },
    { name: 'Week 4', engagement: 310, conversions: 96, outbounds: 870, replies: 148, reach: 7900 },
  ],
  "ytd": [
    { name: 'Jan-Feb', engagement: 580, conversions: 125, outbounds: 1550, replies: 210, reach: 12000 },
    { name: 'Mar-Apr', engagement: 790, conversions: 188, outbounds: 2100, replies: 345, reach: 18500 },
    { name: 'May-Jun', engagement: 1150, conversions: 295, outbounds: 3200, replies: 490, reach: 29800 },
  ]
};

// Campaign analytics dataset including lead outcomes and response rates
const campaignPerformanceData = [
  { name: 'Q3 SaaS Outreach', rate: 14.8, leads: 58, budget: 1500, cost: 1200, status: "Active", color: "#006241" },
  { name: 'Fintech Founders Focus', rate: 12.2, leads: 42, budget: 1000, cost: 780, status: "Active", color: "#00754A" },
  { name: 'Angels & VC Outreach', rate: 8.5, leads: 18, budget: 800, cost: 800, status: "Idle", color: "#cba258" },
  { name: 'Growth Hack Webinar', rate: 18.2, leads: 64, budget: 2000, cost: 1850, status: "Active", color: "#1E3932" },
];

// Lead attribution details per acquisition Channel
const channelsAttribution = [
  { channel: 'LinkedIn Mailer', sent: 480, replies: 154, qualified: 42, conversion: 8.7, color: '#006241' },
  { channel: 'X Thread DM', sent: 350, replies: 84, qualified: 21, conversion: 6.0, color: '#00754A' },
  { channel: 'Cold Email Synth', sent: 820, replies: 123, qualified: 31, conversion: 3.7, color: '#cba258' },
  { channel: 'Lead Magnets', sent: 210, replies: 122, qualified: 48, conversion: 22.8, color: '#1E3932' }
];

// Market clusters breakdown 
const clusterDistribution = [
  { name: 'Enterprise SaaS', value: 450, color: '#006241' },
  { name: 'Fintech Unicorns', value: 310, color: '#00754A' },
  { name: 'Seed Stage Founders', value: 180, color: '#1E3932' },
  { name: 'Agency Operations', value: 110, color: '#cba258' },
];

// Interactive tooltips rendered nicely
const CustomTrajectoryTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-sb-house text-white p-6 rounded-[12px] shadow-xl border border-white/10 text-[1.2rem] space-y-3 font-sans">
        <p className="font-bold border-b border-white/15 pb-2 text-sb-gold">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-8">
              <span className="opacity-70 font-medium flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.stroke }} />
                {entry.name}:
              </span>
              <span className="font-bold text-white">
                {entry.value !== undefined ? entry.value.toLocaleString() : ""}
                {entry.name.includes("Rate") || entry.name === "engagement" || entry.name === "conversions" ? "%" : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Trajectory view configuration
  const [timeframe, setTimeframe] = useState<string>("7d");
  const [campaignMetric, setCampaignMetric] = useState<'rate' | 'leads'>('rate');
  
  // Dynamic metrics calculated from the 7d data (first values to today comparisons)
  const calculateTrends = () => {
    const data7d = performanceDataMap["7d"];
    const current = data7d[data7d.length - 1];
    const previous = data7d[data7d.length - 2];

    const getTrend = (curr: number, prev: number) => {
      if (!prev) return "0.0%";
      const pct = ((curr - prev) / prev) * 100;
      return (pct >= 0 ? "+" : "") + pct.toFixed(1) + "%";
    };

    return {
      outboxTrend: getTrend(current.outbounds, previous.outbounds),
      engagementTrend: getTrend(current.engagement, previous.engagement),
      conversionTrend: getTrend(current.conversions, previous.conversions),
      repliesTrend: getTrend(current.replies, previous.replies),
      
      outboxValue: (current.outbounds * 5.64).toFixed(0), // scales 220 to 1240
      engagementValue: (current.engagement / 15).toFixed(1) + "%", // scales 72 to 4.8%
      conversionValue: (current.conversions / 23.3).toFixed(1) + "%", // scales 28 to 1.2%
      repliesValue: Math.round(current.replies / 2.66).toString(), // scales 48 to 18
    };
  };

  const dynamicStats = calculateTrends();

  // Social sharing states
  const [shareData, setShareData] = useState<{
    isOpen: boolean;
    componentName: string;
    prepopulatedText: string;
    targetPlatform: 'linkedin' | 'x' | 'meta';
  } | null>(null);

  const [copiedShare, setCopiedShare] = useState(false);

  const handleOpenShare = (componentName: string, text: string, defaultPlatform: 'linkedin' | 'x' | 'meta') => {
    setShareData({
      isOpen: true,
      componentName,
      prepopulatedText: text,
      targetPlatform: defaultPlatform
    });
    setCopiedShare(false);
  };

  const handleExecuteShare = () => {
    if (!shareData) return;
    const text = shareData.prepopulatedText;
    const currentUrl = "https://ai.studio/build";
    let shareUrl = "";

    switch (shareData.targetPlatform) {
      case 'x':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(currentUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}&summary=${encodeURIComponent(text)}`;
        break;
      case 'meta':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(text)}`;
        break;
    }

    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyShareText = () => {
    if (!shareData) return;
    navigator.clipboard.writeText(shareData.prepopulatedText);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  // Interactive visibility toggles for the primary Composed Chart
  const [visibleMetrics, setVisibleMetrics] = useState<Record<string, boolean>>({
    outbounds: true,
    replies: true,
    engagement: true,
    conversions: true,
    reach: false
  });

  const [selectedChannel, setSelectedChannel] = useState<typeof channelsAttribution[0] | null>(channelsAttribution[0]);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [aiInsightResult, setAiInsightResult] = useState<string | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState<boolean>(false);

  // Toggle dynamic metric lines
  const toggleMetric = (key: string) => {
    setVisibleMetrics(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Simulate Triggering predictive analytics pipeline
  const handleGenerateAiInsight = () => {
    setIsInsightLoading(true);
    setTimeout(() => {
      const insights = [
        `Lead resonance is exceptionally high (72% positive sentiment index) on tech webinars. Campaign recommendation: Reallocate $1,200 budget from Angels outreach directly to Q3 SaaS.`,
        `Widget lead magnets conversion has spiked to 22.8% during midday outbound sweeps. Prompting standard automated reply sequence 12m ahead of queue is advised.`,
        `Cold email copy generated under model Flash is demonstrating lower click rates (4%). Recommend running calibration tests under engine direct settings to boost interaction times.`
      ];
      const selected = insights[Math.floor(Math.random() * insights.length)];
      setAiInsightResult(selected);
      setIsInsightLoading(false);
    }, 800);
  };

  const activeTrajectoryData = performanceDataMap[timeframe] || performanceDataMap["7d"];

  return (
    <div className="flex min-h-screen bg-sb-cream text-black font-sans tracking-sb">
      <Sidebar />
      
      <main className="flex-1 p-12 lg:p-24 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-8 border-b border-black/10">
          <div>
            <h1 className="text-sb-green font-semibold text-[3.6rem] leading-tight mb-2 uppercase tracking-sb">System Overview</h1>
            <p className="text-[1.6rem] text-black/50 font-medium">Active Engine: <span className="text-sb-green font-bold">{profile?.company || "Unidentified Corp"}</span></p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={handleGenerateAiInsight}
              className="flex items-center gap-3 px-6 py-4 bg-sb-house text-sb-gold border border-sb-gold/25 rounded-full text-[1.2rem] font-bold uppercase tracking-widest hover:bg-sb-green transition-all sb-button-active shadow-sm cursor-pointer"
            >
              <Sparkles size={14} className="animate-pulse" />
              {isInsightLoading ? "Synthesizing Insights..." : "Run AI Insights Check"}
            </button>
            <div className="text-right hidden xl:block pl-6 border-l border-black/10">
              <p className="text-[1.2rem] text-sb-accent font-bold uppercase tracking-widest leading-tight">Uptime: 99.98%</p>
              <p className="text-[1.2rem] text-black/40 font-medium uppercase tracking-widest leading-tight">Optimized Just Now</p>
            </div>
          </div>
        </header>

        {aiInsightResult && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 bg-sb-light/30 border border-sb-accent/30 p-8 rounded-[12px] flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-sb-accent text-white flex items-center justify-center shrink-0 mt-1">
              <Sparkles size={16} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[1.2rem] uppercase tracking-widest font-black text-sb-green">Real-time Predictor Feedback</span>
                <button onClick={() => setAiInsightResult(null)} className="text-[1.1rem] font-bold text-black/40 hover:text-black uppercase tracking-widest">dismiss</button>
              </div>
              <p className="text-[1.35rem] text-sb-house font-semibold leading-relaxed font-serif italic">"{aiInsightResult}"</p>
            </div>
          </motion.div>
        )}

        {/* Neural Agent Highlight Panel */}
        <div className="mb-16">
          <section className="bg-sb-house text-white p-12 rounded-[12px] sb-shadow-frap relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-sb-gold" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Brain size={20} className="text-sb-gold" />
                <p className="text-[1.2rem] uppercase tracking-[0.2em] font-black text-sb-gold">Neural Agent Configured</p>
              </div>
              <h2 className="text-[4rem] font-bold uppercase tracking-sb leading-tight mb-2">
                {profile?.name || "Strategist"}'s Workspace
              </h2>
              <div className="flex items-center gap-4 text-white/60 mb-8 font-medium italic">
                <Activity size={18} className="text-sb-accent animate-pulse" />
                <span>Monitoring digital resonance metrics across configured channels...</span>
              </div>
              <div className="flex flex-wrap gap-4 items-center">
                <span className="text-[1.2rem] opacity-70 font-semibold bg-white/5 border border-white/10 px-4 py-2 rounded-[8px] uppercase tracking-widest">
                  Active Model: {profile?.apiKeys?.anthropic ? 'Claude 3.5 Sonnet' : profile?.apiKeys?.openai ? 'GPT-4o' : 'Gemini 1.5 Flash'}
                </span>
                <span className="text-[1.1rem] text-sb-gold/80 font-black uppercase tracking-widest border border-sb-gold/20 px-4 py-2 rounded-[8px]">
                  DB Status: Linked 
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-6 shrink-0 relative z-10 bg-white/5 p-6 rounded-[12px] border border-white/10">
              <div>
                <p className="text-[1.1rem] opacity-50 uppercase tracking-widest">Campaign Token Rate</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-[3rem] font-bold text-sb-gold">42%</span>
                  <span className="text-[1.2rem] opacity-70">consumed</span>
                </div>
                <button 
                  onClick={() => navigate('/settings')}
                  className="mt-4 w-full px-6 py-3 bg-white hover:bg-white/90 text-sb-house rounded-full text-[1.1rem] font-black uppercase tracking-widest transition-all sb-button-active text-center"
                >
                  Adjust Keys
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Basic KPI Performance Overview */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="cursor-pointer" onClick={() => toggleMetric("outbounds")}>
            <StatsCard 
              label="Outbox Volume" 
              value={dynamicStats.outboxValue} 
              trend={dynamicStats.outboxTrend} 
              icon={Users} 
            />
            <div className="text-[1.05rem] text-black/40 pl-8 -mt-4 uppercase tracking-wider font-extrabold flex items-center gap-1.5">
              <span className={cn("w-2 h-2 rounded-full", visibleMetrics.outbounds ? "bg-sb-green" : "bg-neutral-300")} />
              {visibleMetrics.outbounds ? "Rendered in Chart" : "Click to view in Chart"}
            </div>
          </div>

          <div className="cursor-pointer" onClick={() => toggleMetric("engagement")}>
            <StatsCard 
              label="Engagement Rate" 
              value={dynamicStats.engagementValue} 
              trend={dynamicStats.engagementTrend} 
              icon={Zap} 
            />
            <div className="text-[1.05rem] text-black/40 pl-8 -mt-4 uppercase tracking-wider font-extrabold flex items-center gap-1.5">
              <span className={cn("w-2 h-2 rounded-full", visibleMetrics.engagement ? "bg-sb-accent" : "bg-neutral-300")} />
              {visibleMetrics.engagement ? "Rendered in Chart" : "Click to view in Chart"}
            </div>
          </div>

          <div className="cursor-pointer" onClick={() => toggleMetric("conversions")}>
            <StatsCard 
              label="Conversion" 
              value={dynamicStats.conversionValue} 
              trend={dynamicStats.conversionTrend} 
              icon={TrendingUp} 
            />
            <div className="text-[1.05rem] text-black/40 pl-8 -mt-4 uppercase tracking-wider font-extrabold flex items-center gap-1.5">
              <span className={cn("w-2 h-2 rounded-full", visibleMetrics.conversions ? "bg-sb-gold" : "bg-neutral-300")} />
              {visibleMetrics.conversions ? "Rendered in Chart" : "Click to view in Chart"}
            </div>
          </div>

          <div className="cursor-pointer" onClick={() => toggleMetric("replies")}>
            <StatsCard 
              label="Scheduled Demos" 
              value={dynamicStats.repliesValue} 
              trend={dynamicStats.repliesTrend}
              icon={Calendar} 
            />
            <div className="text-[1.05rem] text-black/40 pl-8 -mt-4 uppercase tracking-wider font-extrabold flex items-center gap-1.5">
              <span className={cn("w-2 h-2 rounded-full", visibleMetrics.replies ? "bg-sb-house" : "bg-neutral-300")} />
              {visibleMetrics.replies ? "Rendered in Chart" : "Click to view in Chart"}
            </div>
          </div>
        </section>

        {/* Enhanced Visualizations Grid */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-12 mb-16">
          
          {/* Main Composed Trajectory Visualization */}
          <div className="xl:col-span-2 bg-white p-10 rounded-[12px] sb-shadow-card flex flex-col justify-between">
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-black/5 pb-6">
                <div>
                  <div className="flex items-center gap-4 flex-wrap mb-2">
                    <h3 className="text-sb-green font-bold text-[1.6rem] uppercase tracking-widest leading-none flex items-center gap-3">
                      <Layers size={16} className="text-sb-accent" />
                      Neural Trajectory Engine
                    </h3>
                    
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => handleOpenShare("Neural Trajectory Engine", `Outbox telemetry is performing strongly: Outbox volume is up ${dynamicStats.outboxTrend}, while Scheduled Demos have improved by ${dynamicStats.repliesTrend} using our automated engagement engine! #SaaS #Growth #Analytics`, 'x')}
                        className="w-7 h-7 rounded-full bg-sb-cream hover:bg-neutral-200 text-neutral-600 border border-black/5 flex items-center justify-center transition-all cursor-pointer"
                        title="Share to X"
                      >
                        <Twitter size={10} fill="currentColor" />
                      </button>
                      <button 
                        onClick={() => handleOpenShare("Neural Trajectory Engine", `Outbox telemetry is performing strongly: Outbox volume is up ${dynamicStats.outboxTrend}, while Scheduled Demos have improved by ${dynamicStats.repliesTrend} using our automated engagement engine! #SaaS #Growth #Analytics`, 'linkedin')}
                        className="w-7 h-7 rounded-full bg-sb-cream hover:bg-neutral-200 text-neutral-600 border border-black/5 flex items-center justify-center transition-all cursor-pointer"
                        title="Share to LinkedIn"
                      >
                        <Linkedin size={10} fill="currentColor" />
                      </button>
                      <button 
                        onClick={() => handleOpenShare("Neural Trajectory Engine", `Outbox telemetry is performing strongly: Outbox volume is up ${dynamicStats.outboxTrend}, while Scheduled Demos have improved by ${dynamicStats.repliesTrend} using our automated engagement engine! #SaaS #Growth #Analytics`, 'meta')}
                        className="w-7 h-7 rounded-full bg-sb-cream hover:bg-neutral-200 text-neutral-600 border border-black/5 flex items-center justify-center transition-all cursor-pointer"
                        title="Share to Meta"
                      >
                        <Facebook size={10} fill="currentColor" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[1.2rem] text-black/45 font-medium uppercase tracking-[0.2em] italic">Aesthetic Multi-Axis Outreach performance Insights</p>
                </div>
                
                {/* Timeframe Controller */}
                <div className="flex bg-sb-cream p-1.5 rounded-full overflow-hidden shrink-0">
                  {["7d", "30d", "ytd"].map((id) => (
                    <button
                      key={id}
                      onClick={() => setTimeframe(id)}
                      className={cn(
                        "px-6 py-2 rounded-full text-[1.1rem] font-bold uppercase tracking-widest transition-all cursor-pointer",
                        timeframe === id ? "bg-sb-house text-white" : "text-black/50 hover:text-black"
                      )}
                    >
                      {id === "7d" ? "7 Days" : id === "30d" ? "30 Days" : "YTD Cycles"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Metric Multi-Selectors */}
              <div className="flex flex-wrap items-center gap-4 mb-8 bg-sb-cream/40 p-4 rounded-[8px] border border-black/5">
                <span className="text-[1.1rem] uppercase tracking-widest font-black text-black/30 mr-2">Plot Lines:</span>
                {[
                  { key: 'outbounds', label: 'Outbound Count', color: '#006241' },
                  { key: 'replies', label: 'Replies Captured', color: '#1E3932' },
                  { key: 'engagement', label: 'Engagement Rate (%)', color: '#00754A' },
                  { key: 'conversions', label: 'Conversions (%)', color: '#cba258' },
                  { key: 'reach', label: 'Gross Reach Count', color: '#c358cb' },
                ].map((m) => (
                  <button
                    key={m.key}
                    onClick={() => toggleMetric(m.key)}
                    className={cn(
                      "px-4 py-2 rounded-full text-[1.1rem] font-bold uppercase tracking-widest border transition-all flex items-center gap-2 cursor-pointer",
                      visibleMetrics[m.key] 
                        ? "bg-white text-black text-sb-green shadow-sm" 
                        : "border-transparent text-black/40 hover:text-black/70"
                    )}
                    style={{ borderColor: visibleMetrics[m.key] ? m.color : 'transparent' }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Composed Chart Arena */}
            <div className="h-[320px] w-full min-h-[320px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={activeTrajectoryData}>
                  <defs>
                    <linearGradient id="gradientReach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00754A" stopOpacity={0.12}/>
                      <stop offset="95%" stopColor="#00754A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eae6e1" />
                  
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fontWeight: 700, fill: '#000000', opacity: 0.4 }}
                    dy={12}
                  />
                  
                  {/* Left Axis for volume scales */}
                  <YAxis 
                    yAxisId="volume"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 600, fill: '#000000', opacity: 0.3 }}
                    opacity={0.7}
                  />

                  {/* Right Axis for percentage rates */}
                  <YAxis 
                    yAxisId="rate"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 600, fill: '#00754A', opacity: 0.4 }}
                    opacity={0.7}
                  />

                  <Tooltip content={<CustomTrajectoryTooltip />} cursor={{ fill: '#eae6e1', opacity: 0.2 }} />
                  
                  {/* Trajectory Plotted Layers */}
                  {visibleMetrics.reach && (
                    <Area 
                      yAxisId="volume"
                      type="monotone" 
                      name="Gross Reach"
                      dataKey="reach" 
                      fill="url(#gradientReach)" 
                      stroke="#c358cb" 
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                    />
                  )}

                  {visibleMetrics.outbounds && (
                    <Bar 
                      yAxisId="volume"
                      name="Outbound Campaigns"
                      dataKey="outbounds" 
                      fill="#006241" 
                      radius={[4, 4, 0, 0]}
                      barSize={24}
                    />
                  )}

                  {visibleMetrics.replies && (
                    <Bar 
                      yAxisId="volume"
                      name="Replies"
                      dataKey="replies" 
                      fill="#1E3932" 
                      radius={[4, 4, 0, 0]}
                      barSize={12}
                    />
                  )}

                  {visibleMetrics.engagement && (
                    <Line 
                      yAxisId="rate"
                      name="Engagement Rate"
                      type="monotone" 
                      dataKey="engagement" 
                      stroke="#00754A" 
                      strokeWidth={3} 
                      dot={{ r: 4, strokeWidth: 1 }}
                      activeDot={{ r: 6 }} 
                    />
                  )}

                  {visibleMetrics.conversions && (
                    <Line 
                      yAxisId="rate"
                      name="Conversion Rate"
                      type="monotone" 
                      dataKey="conversions" 
                      stroke="#cba258" 
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 1 }}
                      activeDot={{ r: 6 }} 
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 flex justify-between items-center bg-sb-cream/30 p-4 rounded-[6px] text-[1.15rem] text-black/50">
              <span className="flex items-center gap-2"><Info size={12} /> Standard tracking calibrated with local UTC timestamps.</span>
              <span className="font-bold underline cursor-pointer hover:text-black/80" onClick={() => navigate('/scoring')}>View Calibration Settings</span>
            </div>
          </div>

          {/* Market Cluster Distribution (Pie Chart Card) */}
          <div className="bg-white p-10 rounded-[12px] sb-shadow-card flex flex-col justify-between">
            <div>
              <h3 className="text-sb-green font-bold text-[1.6rem] uppercase tracking-widest leading-none mb-10 pb-4 border-b border-black/5 flex items-center justify-between flex-wrap gap-4">
                <span className="flex items-center gap-2">
                  <PieChartIcon size={14} className="text-sb-gold shrink-0" />
                  Cluster Distribution
                </span>
                
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => handleOpenShare("Cluster Distribution", `Analyzing our customer cluster density: Enterprise SaaS leads with 43%, followed by Fintech Unicorns at 30%. Campaign accuracy is fully validated! #Data #Analytics #LeadGen`, 'x')}
                    className="w-7 h-7 rounded-full bg-sb-cream hover:bg-neutral-200 text-neutral-600 border border-black/5 flex items-center justify-center transition-all cursor-pointer"
                    title="Share to X"
                  >
                    <Twitter size={10} fill="currentColor" />
                  </button>
                  <button 
                    onClick={() => handleOpenShare("Cluster Distribution", `Analyzing our customer cluster density: Enterprise SaaS leads with 43%, followed by Fintech Unicorns at 30%. Campaign accuracy is fully validated! #Data #Analytics #LeadGen`, 'linkedin')}
                    className="w-7 h-7 rounded-full bg-sb-cream hover:bg-neutral-200 text-neutral-600 border border-black/5 flex items-center justify-center transition-all cursor-pointer"
                    title="Share to LinkedIn"
                  >
                    <Linkedin size={10} fill="currentColor" />
                  </button>
                  <button 
                    onClick={() => handleOpenShare("Cluster Distribution", `Analyzing our customer cluster density: Enterprise SaaS leads with 43%, followed by Fintech Unicorns at 30%. Campaign accuracy is fully validated! #Data #Analytics #LeadGen`, 'meta')}
                    className="w-7 h-7 rounded-full bg-sb-cream hover:bg-neutral-200 text-neutral-600 border border-black/5 flex items-center justify-center transition-all cursor-pointer"
                    title="Share to Meta"
                  >
                    <Facebook size={10} fill="currentColor" />
                  </button>
                </div>
              </h3>

              <div className="h-[210px] w-full relative min-h-[210px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={clusterDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {clusterDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} Leads`, "Density"]} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Total Counter Inside Center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <p className="text-[1rem] font-black uppercase tracking-widest text-black/30 leading-none">Total</p>
                  <p className="text-[2.6rem] font-bold text-sb-green leading-tight">1,050</p>
                  <p className="text-[0.95rem] text-black/40 font-bold uppercase tracking-wider">Leads</p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3 pt-6 border-t border-black/5">
              {clusterDistribution.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-[1.2rem]">
                  <div className="flex items-center gap-3">
                    <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="font-bold text-sb-green uppercase">{c.name}</span>
                  </div>
                  <span className="font-black text-black/50">{Math.round((c.value / 1050) * 100)}% ({c.value})</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Campaign Metrics & Acquisition Breakdown Grid */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-12 mb-16">
          
          {/* Channel Attribution Stack - Grouped View */}
          <div className="xl:col-span-2 bg-white p-10 rounded-[12px] sb-shadow-card">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-black/5 pb-6">
              <div>
                <div className="flex items-center gap-4 flex-wrap mb-2">
                  <h3 className="text-sb-green font-bold text-[1.6rem] uppercase tracking-widest leading-none">
                    Acquisition Channel Performance
                  </h3>
                  
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => handleOpenShare("Acquisition Channel Performance", `Acquisition performance review: our highest converting source this cycle is Lead Magnets at an outstanding 22.8% rate! Standard pipelines are performing on-target. #MarketingOps #Metrics #LeadGen`, 'x')}
                      className="w-7 h-7 rounded-full bg-sb-cream hover:bg-neutral-200 text-neutral-600 border border-black/5 flex items-center justify-center transition-all cursor-pointer"
                      title="Share to X"
                    >
                      <Twitter size={10} fill="currentColor" />
                    </button>
                    <button 
                      onClick={() => handleOpenShare("Acquisition Channel Performance", `Acquisition performance review: our highest converting source this cycle is Lead Magnets at an outstanding 22.8% rate! Standard pipelines are performing on-target. #MarketingOps #Metrics #LeadGen`, 'linkedin')}
                      className="w-7 h-7 rounded-full bg-sb-cream hover:bg-neutral-200 text-neutral-600 border border-black/5 flex items-center justify-center transition-all cursor-pointer"
                      title="Share to LinkedIn"
                    >
                      <Linkedin size={10} fill="currentColor" />
                    </button>
                    <button 
                      onClick={() => handleOpenShare("Acquisition Channel Performance", `Acquisition performance review: our highest converting source this cycle is Lead Magnets at an outstanding 22.8% rate! Standard pipelines are performing on-target. #MarketingOps #Metrics #LeadGen`, 'meta')}
                      className="w-7 h-7 rounded-full bg-sb-cream hover:bg-neutral-200 text-neutral-600 border border-black/5 flex items-center justify-center transition-all cursor-pointer"
                      title="Share to Meta"
                    >
                      <Facebook size={10} fill="currentColor" />
                    </button>
                  </div>
                </div>
                <p className="text-[1.2rem] text-black/45 font-semibold uppercase tracking-[0.2em] italic">Comparing outreach volume & conversions</p>
              </div>
              
              <div className="flex items-center gap-4 text-[1.15rem]">
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="w-3 h-3 bg-sb-accent rounded" />
                  <span>Outbound Sent</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="w-3 h-3 bg-sb-gold rounded" />
                  <span>Leads Qualified</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Grouped Bar Chart */}
              <div className="md:col-span-2 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={channelsAttribution}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eae6e1" />
                    <XAxis 
                      dataKey="channel" 
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#000000', opacity: 0.6 }}
                    />
                    <YAxis tickLine={false} tick={{ fontSize: 9, fill: '#000000', opacity: 0.3 }} />
                    <Tooltip />
                    <Bar name="Outbound Sent" dataKey="sent" fill="#00754A" radius={[3, 3, 0, 0]} />
                    <Bar name="Leads Qualified" dataKey="qualified" fill="#cba258" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Dynamic Interactive Panel Side-by-Side */}
              <div className="bg-sb-cream/40 p-6 rounded-[12px] border border-black/5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/5">
                    <span className="text-[1.1rem] font-black uppercase tracking-widest text-sb-green">Channel Inspector</span>
                    <span className="text-[1.05rem] font-bold text-black/35">Interactive</span>
                  </div>
                  
                  <select
                    value={selectedChannel?.channel}
                    onChange={(e) => {
                      const found = channelsAttribution.find(c => c.channel === e.target.value);
                      if (found) setSelectedChannel(found);
                    }}
                    className="w-full bg-white border border-black/10 px-4 py-3 rounded-[8px] text-[1.25rem] font-extrabold text-sb-green focus:outline-none mb-6 cursor-pointer"
                  >
                    {channelsAttribution.map((c) => (
                      <option key={c.channel} value={c.channel}>{c.channel}</option>
                    ))}
                  </select>

                  {selectedChannel && (
                    <div className="space-y-4 text-[1.2rem]">
                      <div className="flex justify-between">
                        <span className="opacity-65">Outbound Volume:</span>
                        <strong className="text-sb-house">{selectedChannel.sent}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-65 font-medium">Responses Collected:</span>
                        <strong className="text-sb-house">{selectedChannel.replies} ({Math.round((selectedChannel.replies / selectedChannel.sent) * 100)}%)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-65 font-medium">High Qualified:</span>
                        <strong className="text-sb-accent">{selectedChannel.qualified}</strong>
                      </div>
                      <div className="flex justify-between border-t border-black/5 pt-3">
                        <span className="font-extrabold text-sb-green">Conversion Rate:</span>
                        <strong className="text-sb-gold text-[1.4rem] font-black">{selectedChannel.conversion}%</strong>
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => navigate('/content')}
                  className="mt-6 w-full py-3 bg-sb-house hover:bg-sb-green text-white text-[1.1rem] font-black uppercase tracking-widest rounded-full transition-all text-center sb-button-active cursor-pointer"
                >
                  Tune Channel Script
                </button>
              </div>
            </div>
          </div>

          {/* Campaign Metrics Comparative Leaderboard */}
          <div className="bg-white p-10 rounded-[12px] sb-shadow-card flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-black/5 pb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-sb-green font-bold text-[1.5rem] uppercase tracking-widest mb-0">
                    Target Objectives
                  </h3>
                  
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleOpenShare("Target Objectives", `Campaign Objectives update: Q3 SaaS Outreach qualified leads rate is leading at 14.8%! All custom marketing triggers are active. #Outreach #Campaigns #B2B`, 'x')}
                      className="w-6 h-6 rounded-full bg-sb-cream hover:bg-neutral-200 text-neutral-600 border border-black/5 flex items-center justify-center transition-all cursor-pointer"
                      title="Share to X"
                    >
                      <Twitter size={9} fill="currentColor" />
                    </button>
                    <button 
                      onClick={() => handleOpenShare("Target Objectives", `Campaign Objectives update: Q3 SaaS Outreach qualified leads rate is leading at 14.8%! All custom marketing triggers are active. #Outreach #Campaigns #B2B`, 'linkedin')}
                      className="w-6 h-6 rounded-full bg-sb-cream hover:bg-neutral-200 text-neutral-600 border border-black/5 flex items-center justify-center transition-all cursor-pointer"
                      title="Share to LinkedIn"
                    >
                      <Linkedin size={9} fill="currentColor" />
                    </button>
                    <button 
                      onClick={() => handleOpenShare("Target Objectives", `Campaign Objectives update: Q3 SaaS Outreach qualified leads rate is leading at 14.8%! All custom marketing triggers are active. #Outreach #Campaigns #B2B`, 'meta')}
                      className="w-6 h-6 rounded-full bg-sb-cream hover:bg-neutral-200 text-neutral-600 border border-black/5 flex items-center justify-center transition-all cursor-pointer"
                      title="Share to Meta"
                    >
                      <Facebook size={9} fill="currentColor" />
                    </button>
                  </div>
                </div>
                
                {/* Metric Selector toggle */}
                <div className="flex bg-sb-cream p-1 rounded-full text-[1.05rem] font-black">
                  <button 
                    onClick={() => setCampaignMetric('rate')}
                    className={cn(
                      "px-3 py-1.5 rounded-full uppercase tracking-wider",
                      campaignMetric === 'rate' ? "bg-sb-house text-white" : "text-black/40"
                    )}
                  >
                    Rate
                  </button>
                  <button 
                    onClick={() => setCampaignMetric('leads')}
                    className={cn(
                      "px-3 py-1.5 rounded-full uppercase tracking-wider",
                      campaignMetric === 'leads' ? "bg-sb-house text-white" : "text-black/40"
                    )}
                  >
                    Leads
                  </button>
                </div>
              </div>

              <div className="h-[180px] w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={campaignPerformanceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eae6e1" />
                    <XAxis type="number" hide />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={100} 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 9, fontWeight: 700, fill: '#006241' }}
                    />
                    <Tooltip />
                    <Bar 
                      dataKey={campaignMetric} 
                      radius={[0, 4, 4, 0]}
                      barSize={14}
                    >
                      {campaignPerformanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-black/5">
              {campaignPerformanceData.map((camp, i) => (
                <div key={i} className="flex justify-between items-center text-[1.2rem]">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: camp.color }} />
                    <span className="font-bold text-sb-green truncate max-w-[12rem]">{camp.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-black text-black/50">
                      {campaignMetric === 'rate' ? `${camp.rate}% Conv.` : `${camp.leads} Leads`}
                    </span>
                    <span className={cn(
                      "text-[1rem] px-2 py-0.5 rounded font-black uppercase tracking-wider",
                      camp.status === "Active" ? "bg-sb-light text-sb-green" : "bg-neutral-100 text-neutral-400"
                    )}>
                      {camp.status}
                    </span>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => navigate('/campaigns')}
                className="w-full mt-4 text-[1.1rem] py-2 bg-transparent text-sb-green border border-sb-green/20 rounded-full font-black uppercase tracking-widest hover:bg-sb-cream/50 transition-all text-center cursor-pointer block"
              >
                Edit Active Objectives
              </button>
            </div>
          </div>
        </section>

        {/* Intelligence Log & Interactive Side-Drawer */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          
          {/* Recent Activity Log */}
          <div className="lg:col-span-2 bg-white rounded-[12px] sb-shadow-card overflow-hidden">
            <div className="p-8 border-b border-black/5 bg-sb-ceramic flex justify-between items-center">
              <div>
                <h3 className="text-sb-green font-bold text-[1.6rem] uppercase tracking-wider mb-1">Intelligence Log</h3>
                <p className="text-[1.15rem] text-black/40 font-medium">Detailed tracking telemetry log. Click row to expand payload details.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-sb-accent animate-pulse shadow-[0_0_8px_#00754A]" />
                <span className="text-[1.1rem] uppercase font-black tracking-widest text-sb-house">Realtime Feed</span>
              </div>
            </div>
            
            <div className="p-0 divide-y divide-black/5">
              {[
                { time: "14:22", event: "LinkedIn Pipeline Sweep", detail: "Generated & validated outreach copy for 14 active Enterprise executives.", status: "QUEUED", type: 'accent', payload: "Channel: LinkedIn. Persona: Director of Operations. Theme: Operational scaling bottleneck. Status: Processing through local scheduler queues." },
                { time: "13:45", event: "Automated Lead Qualification", detail: "John @ Acme Corp scored 88/100 matching 'ideal product' profile parameters.", status: "SENT", type: 'gold', payload: "Matched parameter sets: Series B startup, $12M revenue segment, explicit marketing tech stack. Direct action recommendation: Schedule intro sequence." },
                { time: "12:10", event: "Instagram sentiment analysis", detail: "Scanned inbox messages to categorize customer satisfaction levels.", status: "STABLE", type: 'house', payload: "Processed 8 historic messages. Negative sentiment content checked: 0%. Positive indicators: 87.5% requesting sandbox environments." },
                { time: "09:30", event: "Engine Campaign Tuning", detail: "Dynamic feedback pipeline recalculated optimum outreach schedule.", status: "COMPLETE", type: 'green', payload: "Hashtags adjusted for 'founders' campaign. Estimated reach trajectory shifted to +4% over week average." }
              ].map((log, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedLog(log)}
                  className={cn(
                    "group flex flex-col md:flex-row md:items-center p-8 hover:bg-sb-cream/30 transition-all cursor-pointer",
                    selectedLog?.time === log.time ? "bg-sb-cream/50 border-l-[4px] border-l-sb-accentPlotted pl-7" : ""
                  )}
                >
                  <div className="flex items-center justify-between md:contents mb-3">
                    <span className="text-[1.3rem] font-bold text-black/30 w-16 group-hover:text-sb-green transition-colors">{log.time}</span>
                    <div className="flex-1 md:px-8">
                      <span className="block text-[1.5rem] font-bold text-sb-green mb-1 uppercase tracking-tight">{log.event}</span>
                      <span className="block text-[1.3rem] text-black/50 font-medium italic">{log.detail}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:contents">
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-[1rem] font-black tracking-widest uppercase shadow-sm shrink-0",
                      log.type === 'accent' ? "bg-sb-accent text-white" :
                      log.type === 'gold' ? "bg-sb-gold text-white" :
                      log.type === 'house' ? "bg-sb-house text-white" :
                      "bg-sb-green text-white"
                    )}>
                      {log.status}
                    </span>
                    <ChevronRight size={14} className="text-black/20 group-hover:translate-x-2 transition-transform ml-4 hidden md:block" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Config Actions side space */}
          <div className="space-y-8">
            
            {/* Interactive Intelligence Details Drawer Card */}
            <AnimatePresence mode="wait">
              {selectedLog ? (
                <motion.div 
                  key="selected-drawer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-[12px] sb-shadow-card p-10 border-2 border-sb-accent/40 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-sb-accent" />
                  <div className="flex justify-between items-start mb-6 pb-2 border-b border-black/5">
                    <h4 className="text-sb-green font-bold text-[1.3rem] uppercase tracking-widest">
                      Detail inspector
                    </h4>
                    <button 
                      onClick={() => setSelectedLog(null)}
                      className="text-[1rem] font-black uppercase text-red-500 tracking-wider hover:underline"
                    >
                      Close [x]
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <span className="text-[1rem] text-black/40 font-bold uppercase tracking-widest block mb-1">Activity Scope</span>
                      <strong className="text-[1.6rem] text-sb-house block uppercase font-black leading-tight">{selectedLog.event}</strong>
                    </div>

                    <div>
                      <span className="text-[1rem] text-black/40 font-bold uppercase tracking-widest block mb-1">Timestamp</span>
                      <p className="text-[1.25rem] font-medium text-black">May 21, {selectedLog.time} UTC</p>
                    </div>

                    <div>
                      <span className="text-[1rem] text-black/40 font-bold uppercase tracking-widest block mb-1">Payload Variables</span>
                      <div className="bg-sb-cream p-4 rounded-[8px] text-[1.25rem] text-sb-green font-medium leading-relaxed font-mono">
                        {selectedLog.payload}
                      </div>
                    </div>

                    <div className="bg-sb-light/30 border border-sb-accent/10 p-4 rounded-[8px] flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-sb-accent shrink-0" />
                      <span className="text-[1.15rem] text-sb-house font-bold italic">Integrations verified. No fatal exceptions logged.</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="unselected-drawer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-sb-cream/40 rounded-[12px] p-10 text-center border-2 border-dashed border-black/10 py-16 flex flex-col items-center justify-center space-y-4"
                >
                  <Info size={30} className="text-sb-green/20" />
                  <div>
                    <h4 className="font-bold text-sb-green uppercase tracking-widest text-[1.3rem]">Telemetry Inspector</h4>
                    <p className="text-[1.15rem] text-black/40 mt-1 max-w-[18rem] mx-auto">Click on any entry in the Intelligence Log to extract internal script variables and payload diagnostic metadata.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-white rounded-[12px] sb-shadow-card p-10">
              <h3 className="text-sb-green font-bold text-[1.4rem] uppercase tracking-widest mb-10 border-b border-black/5 pb-4">Manual Overrides</h3>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => navigate('/content')}
                  className="flex items-center gap-4 p-5 bg-sb-cream text-sb-green rounded-full text-[1.3rem] font-black uppercase tracking-widest hover:bg-sb-accent hover:text-white transition-all shadow-sm sb-button-active cursor-pointer"
                >
                  <Zap size={18} className="fill-current" /> Auto Creative Suite
                </button>
                <button 
                  onClick={() => navigate('/leads')}
                  className="flex items-center gap-4 p-5 bg-white border-2 border-sb-green/10 text-sb-green rounded-full text-[1.3rem] font-black uppercase tracking-widest hover:border-sb-green transition-all shadow-sm sb-button-active cursor-pointer"
                >
                  <Inbox size={18} /> Lead Qualifier Workspace
                </button>
                <button 
                  onClick={() => navigate('/outreach')}
                  className="flex items-center gap-4 p-5 bg-white border-2 border-sb-green/10 text-sb-green rounded-full text-[1.3rem] font-black uppercase tracking-widest hover:border-sb-green transition-all shadow-sm sb-button-active cursor-pointer"
                >
                  <Send size={18} /> Blast Cold Outbound
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[12px] sb-shadow-card p-10">
              <h3 className="text-sb-green font-bold text-[1.4rem] uppercase tracking-widest mb-10 border-b border-black/5 pb-4">Neural Campaigns</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-sb-cream p-4 rounded-[8px]">
                  <span className="text-[1.2rem] font-bold text-sb-green">Q3 Expansion</span>
                  <span className="text-[1rem] py-1 px-3 bg-sb-accent text-white rounded-full font-black tracking-widest">ACTIVE</span>
                </div>
                <div className="flex justify-between items-center opacity-40">
                  <span className="text-[1.2rem] font-bold">Tech Founders</span>
                  <span className="text-[1rem] py-1 px-3 bg-black/10 rounded-full font-black tracking-widest uppercase">Idle</span>
                </div>
                <button 
                  onClick={() => navigate('/campaigns')}
                  className="w-full py-4 text-[1.1rem] font-black uppercase tracking-widest text-sb-green/60 hover:text-sb-green transition-all text-center cursor-pointer"
                >
                  Manage All Objectives
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Social Sharing Dialog Modal */}
      <AnimatePresence>
        {shareData && shareData.isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-[100]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white w-full max-w-xl rounded-[16px] sb-shadow-card border border-black/10 overflow-hidden"
            >
              <div className="bg-sb-green p-8 text-white flex justify-between items-center">
                <div>
                  <h4 className="text-[1.8rem] font-bold uppercase tracking-wider mb-1">Create Insight Share Post</h4>
                  <p className="text-[1.15rem] text-white/75 font-semibold">Pre-populated template from: {shareData.componentName}</p>
                </div>
                <button 
                  onClick={() => setShareData(null)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer font-black text-[1.4rem]"
                >
                  ✕
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <label className="text-[1rem] text-black/40 font-black uppercase tracking-widest block mb-2">Configure Post Caption</label>
                  <textarea 
                    value={shareData.prepopulatedText}
                    onChange={(e) => setShareData(prev => prev ? { ...prev, prepopulatedText: e.target.value } : null)}
                    rows={4}
                    className="w-full bg-sb-cream border border-black/10 p-4 rounded-[12px] text-[1.3rem] text-sb-house font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-sb-accent/50 resize-y"
                    placeholder="Capture your analytics story..."
                  />
                </div>

                <div>
                  <label className="text-[1rem] text-black/40 font-black uppercase tracking-widest block mb-3">Select Platform Target</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'x' as const, label: 'X (Twitter)', icon: Twitter, activeColor: 'bg-[#1DA1F2]/10 border-[#1DA1F2] text-[#1DA1F2]' },
                      { id: 'linkedin' as const, label: 'LinkedIn', icon: Linkedin, activeColor: 'bg-[#0077b5]/10 border-[#0077b5] text-[#0077b5]' },
                      { id: 'meta' as const, label: 'Facebook / Meta', icon: Facebook, activeColor: 'bg-[#1877f2]/10 border-[#1877f2] text-[#1877f2]' }
                    ].map((platform) => {
                      const Icon = platform.icon;
                      const isActive = shareData.targetPlatform === platform.id;
                      return (
                        <button
                          key={platform.id}
                          onClick={() => setShareData(prev => prev ? { ...prev, targetPlatform: platform.id } : null)}
                          className={cn(
                            "py-4 px-3 rounded-[12px] border flex flex-col items-center gap-2 transition-all cursor-pointer font-bold text-[1.1rem]",
                            isActive 
                              ? platform.activeColor 
                              : "border-black/5 bg-sb-cream hover:bg-neutral-100 text-neutral-600"
                          )}
                        >
                          <Icon size={18} fill="currentColor" />
                          <span>{platform.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-black/5">
                  <button
                    onClick={handleCopyShareText}
                    className="flex-1 py-4 px-6 rounded-full border border-black/15 text-[1.2rem] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-neutral-50 transition-all cursor-pointer"
                  >
                    {copiedShare ? (
                      <>
                        <Check size={14} className="text-sb-accent animate-pulse" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy Post Text</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleExecuteShare}
                    className="flex-1 py-4 px-6 bg-sb-accent hover:bg-sb-green text-white text-[1.2rem] font-black uppercase tracking-widest rounded-full transition-all text-center flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Share2 size={14} />
                    <span>Proceed to Share</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Signature Floating Frap Button */}
      <button 
        onClick={() => {
          handleGenerateAiInsight();
          // Scroll up to show the insight container
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        title="Trigger Quick Run Analysis"
        className="fixed bottom-12 right-12 w-[5.6rem] h-[5.6rem] bg-sb-accent rounded-full flex items-center justify-center text-white sb-shadow-frap sb-button-active z-[60] cursor-pointer"
      >
        <Zap className="fill-white w-6 h-6" />
      </button>
    </div>
  );
}
