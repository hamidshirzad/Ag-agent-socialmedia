import { useState, useEffect } from "react";
import PageMeta from "../components/PageMeta";
import { motion } from "motion/react";
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
  ChevronRight
} from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { StatsCard } from "../components/StatsCard";
import { cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
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
  Cell
} from 'recharts';

const performanceData = [
  { name: '04/24', engagement: 45, conversions: 12 },
  { name: '04/25', engagement: 52, conversions: 15 },
  { name: '04/26', engagement: 48, conversions: 10 },
  { name: '04/27', engagement: 61, conversions: 22 },
  { name: '04/28', engagement: 55, conversions: 18 },
  { name: '04/29', engagement: 67, conversions: 25 },
  { name: '04/30', engagement: 72, conversions: 28 },
];

const campaignData = [
  { name: 'Q3 SaaS', value: 400, color: '#00754A' },
  { name: 'Fintech', value: 300, color: '#cba258' },
  { name: 'Founders', value: 200, color: '#1B1F1C' },
  { name: 'Outreach', value: 150, color: '#FF5733' },
];

export default function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [postCount, setPostCount]           = useState(0);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [leadCount, setLeadCount]           = useState(0);

  useEffect(() => {
    if (!profile?.id) return;
    const postsQ = query(collection(db, "posts"), where("userId", "==", profile.id));
    const leadsQ = query(collection(db, "leads"), where("userId", "==", profile.id));
    const unsubPosts = onSnapshot(postsQ, snap => {
      setPostCount(snap.size);
      setScheduledCount(snap.docs.filter(d => d.data().status === "scheduled").length);
    }, err => handleFirestoreError(err, OperationType.LIST, "posts"));
    const unsubLeads = onSnapshot(leadsQ, snap => setLeadCount(snap.size),
      err => handleFirestoreError(err, OperationType.LIST, "leads"));
    return () => { unsubPosts(); unsubLeads(); };
  }, [profile?.id]);

  return (
    <div className="flex min-h-screen bg-sb-cream text-black font-sans tracking-sb">
      <PageMeta title="Dashboard" description="Monitor your campaigns, leads, and AI performance in real time." path="/dashboard" />
      <Sidebar />

      <main className="flex-1 p-12 lg:p-24 overflow-y-auto">
        <header className="flex justify-between items-end mb-16 pb-8 border-b border-black/10">
          <div>
            <h1 className="text-sb-green font-semibold text-[3.6rem] leading-tight mb-2 uppercase tracking-sb">System Overview</h1>
            <p className="text-[1.6rem] text-black/50 font-medium whitespace-nowrap">Active Engine: <span className="text-sb-green font-bold">{profile?.company || "Unidentified Corp"}</span></p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-[1.2rem] text-sb-accent font-bold uppercase tracking-widest leading-tight">Uptime: 99.98%</p>
            <p className="text-[1.2rem] text-black/40 font-medium uppercase tracking-widest leading-tight">Optimized 12m ago</p>
          </div>
        </header>

        {/* Engine Status & Coworker */}
        <div className="mb-16">
          <section className="bg-sb-house text-white p-12 rounded-[12px] sb-shadow-frap relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-sb-gold" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Brain size={20} className="text-sb-gold" />
                <p className="text-[1.2rem] uppercase tracking-[0.2em] font-black text-sb-gold">Neural Coworker Active</p>
              </div>
              <h2 className="text-[4rem] font-bold uppercase tracking-sb leading-tight mb-2">
                {profile?.name}'s Agent
              </h2>
              <div className="flex items-center gap-4 text-white/60 mb-8 font-medium italic">
                <Activity size={18} className="text-sb-accent animate-pulse" />
                <span>Currently analyzing lead sentiment and qualifying sources...</span>
              </div>
              <p className="text-[1.3rem] opacity-60 font-medium bg-white/5 p-4 rounded-[8px] inline-block uppercase tracking-widest">
                Engine: {profile?.apiKeys?.anthropic ? 'Claude 3.5 Sonnet' : profile?.apiKeys?.openai ? 'GPT-4o' : 'Gemini 1.5 Flash'}
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <button 
                onClick={() => navigate('/settings')}
                className="px-10 py-5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-[1.2rem] font-black uppercase tracking-widest transition-all sb-button-active"
              >
                Sync Neural Keys
              </button>
            </div>
          </section>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <StatsCard label="Lead Volume"  value={String(leadCount)}      trend="+12.4%"  icon={Users} />
          <StatsCard label="Engagement"   value="4.8%"                   trend="+0.2%"   icon={Zap} />
          <StatsCard label="Conversion"   value="1.2%"                   trend="-0.1%"   icon={TrendingUp} />
          <StatsCard label="Scheduled"    value={String(scheduledCount)}                 icon={Calendar} />
        </section>

        {/* Analytics Section */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-12 mb-16">
          <div className="xl:col-span-2 bg-white p-10 rounded-[12px] sb-shadow-card">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-sb-green font-bold text-[1.6rem] uppercase tracking-widest leading-none mb-2">Neural Trajectory</h3>
                <p className="text-[1.2rem] text-black/40 font-medium uppercase tracking-[0.2em] italic">Resonance vs. Conversions (Weekly)</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-sb-accent" />
                   <span className="text-[1rem] font-bold uppercase tracking-widest text-black/60">Engagement</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-sb-gold" />
                   <span className="text-[1rem] font-bold uppercase tracking-widest text-black/60">Conversion</span>
                </div>
              </div>
            </div>
            <div className="h-[300px] w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00754A" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#00754A" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#cba258" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#cba258" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#000000', opacity: 0.3 }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontFamily: 'inherit', fontWeight: 700 }}
                    cursor={{ stroke: '#00754A', strokeWidth: 2 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="engagement" 
                    stroke="#00754A" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorEngage)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="conversions" 
                    stroke="#cba258" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorConv)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[12px] sb-shadow-card">
             <h3 className="text-sb-green font-bold text-[1.6rem] uppercase tracking-widest leading-none mb-10 pb-4 border-b border-black/5">Cluster Distro</h3>
             <div className="h-[240px] w-full relative min-h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={campaignData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {campaignData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                   <p className="text-[1rem] font-black uppercase tracking-widest text-black/30">Total</p>
                   <p className="text-[2.4rem] font-bold text-sb-green">1,050</p>
                </div>
             </div>
             <div className="mt-8 space-y-4">
                {campaignData.map((c, i) => (
                  <div key={i} className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="text-[1.2rem] font-bold text-sb-green uppercase">{c.name}</span>
                     </div>
                     <span className="text-[1.2rem] font-black text-black/40">{Math.round((c.value / 1050) * 100)}%</span>
                  </div>
                ))}
             </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-[12px] sb-shadow-card overflow-hidden">
            <div className="p-8 border-b border-black/5 bg-sb-ceramic flex justify-between items-center">
              <h3 className="text-sb-green font-bold text-[1.6rem] uppercase tracking-wider">Intelligence Log</h3>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-sb-accent animate-pulse shadow-[0_0_8px_#00754A]" />
                <span className="text-[1.2rem] uppercase font-black tracking-widest text-sb-house">Realtime</span>
              </div>
            </div>
            <div className="p-0">
              {[
                { time: "14:22", event: "AI Content Generation", detail: "LinkedIn Post Analysis", status: "QUEUED", type: 'accent' },
                { time: "13:45", event: "Lead Qualified", detail: "John @ Acme Corp (Score: 882)", status: "SENT", type: 'gold' },
                { time: "12:10", event: "Engagement Reply", detail: "Auto-reply to Instagram DM", status: "STABLE", type: 'house' },
                { time: "09:30", event: "System Optimization", detail: "Refined hashtag strategy", status: "COMPLETE", type: 'green' }
              ].map((log, i) => (
                <div key={i} className="group flex items-center p-8 border-b border-black/5 hover:bg-sb-cream/30 transition-all cursor-pointer">
                  <span className="text-[1.3rem] font-bold text-black/30 w-16">{log.time}</span>
                  <div className="flex-1 px-8">
                    <span className="block text-[1.5rem] font-bold text-sb-green mb-1 uppercase tracking-tight">{log.event}</span>
                    <span className="block text-[1.3rem] text-black/40 font-medium italic">{log.detail}</span>
                  </div>
                  <span className={cn(
                    "px-4 py-1 rounded-full text-[1rem] font-black tracking-widest uppercase shadow-sm",
                    log.type === 'accent' ? "bg-sb-accent text-white" :
                    log.type === 'gold' ? "bg-sb-gold text-white" :
                    log.type === 'house' ? "bg-sb-house text-white" :
                    "bg-sb-green text-white"
                  )}>
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-8">
            <div className="bg-white rounded-[12px] sb-shadow-card p-10">
              <h3 className="text-sb-green font-bold text-[1.4rem] uppercase tracking-widest mb-10 border-b border-black/5 pb-4">Manual Overrides</h3>
              <div className="flex flex-col gap-4">
                <button className="flex items-center gap-4 p-5 bg-sb-cream text-sb-green rounded-full text-[1.3rem] font-black uppercase tracking-widest hover:bg-sb-accent hover:text-white transition-all shadow-sm sb-button-active">
                  <Zap size={18} className="fill-current" /> Trigger Gen
                </button>
                <button className="flex items-center gap-4 p-5 bg-white border-2 border-sb-green/10 text-sb-green rounded-full text-[1.3rem] font-black uppercase tracking-widest hover:border-sb-green transition-all shadow-sm sb-button-active">
                  <Inbox size={18} /> Review Leads
                </button>
                <button className="flex items-center gap-4 p-5 bg-white border-2 border-sb-green/10 text-sb-green rounded-full text-[1.3rem] font-black uppercase tracking-widest hover:border-sb-green transition-all shadow-sm sb-button-active">
                  <Send size={18} /> Blast Outreach
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
                  className="w-full py-4 text-[1.2rem] font-black uppercase tracking-widest text-sb-green/60 hover:text-sb-green transition-all text-center"
                >
                  Manage All Objectives
                </button>
              </div>
            </div>

            <div className="bg-sb-house text-white rounded-[12px] sb-shadow-frap p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-sb-gold" />
              <p className="text-[1.2rem] mb-2 uppercase tracking-[0.2em] font-black text-sb-gold">Account Status</p>
              <h4 className="text-[2.4rem] font-bold mb-4 uppercase tracking-sb leading-tight">{profile?.plan || 'Starter'} Edition</h4>
              <div className="h-1.5 bg-white/10 rounded-full mb-4 overflow-hidden">
                <div className="h-full bg-sb-gold w-[42%] shadow-[0_0_8px_#cba258]" />
              </div>
              <p className="text-[1.2rem] leading-relaxed opacity-60 font-medium italic">4.2k / 10k tokens consumed. System healthy.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Signature Floating Frap Button */}
      <button className="fixed bottom-12 right-12 w-[5.6rem] h-[5.6rem] bg-sb-accent rounded-full flex items-center justify-center text-white sb-shadow-frap sb-button-active z-[60]">
        <Zap className="fill-white w-6 h-6" />
      </button>
    </div>
  );
}
