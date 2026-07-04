import React, { useState } from 'react';
import { motion } from 'framer-motion';

const engagementStats = [
  { platform: 'Instagram', value: '12.8k', icon: 'camera', color: 'text-pink-500' },
  { platform: 'LinkedIn', value: '8.2k', icon: 'group', color: 'text-blue-400' },
  { platform: 'X (Twitter)', value: '24.5k', icon: 'close', color: 'text-zinc-100' },
  { platform: 'TikTok', value: '62.1k', icon: 'music_video', color: 'text-red-400' },
];

const activeAgents = [
  { name: 'Content Agent', status: 'ACTIVE', statusClass: 'bg-emerald-500/10 text-emerald-400', progress: 85, icon: 'edit_note', iconBg: 'bg-primary-container/20 text-primary' },
  { name: 'Lead Finder', status: 'ACTIVE', statusClass: 'bg-emerald-500/10 text-emerald-400', progress: 40, icon: 'radar', iconBg: 'bg-primary-container/20 text-primary' },
  { name: 'Outreach Bot', status: 'STANDBY', statusClass: 'bg-zinc-800 text-zinc-500', progress: 0, icon: 'mail', iconBg: 'bg-zinc-800 text-zinc-500' },
  { name: 'Strategy Architect', status: 'ACTIVE', statusClass: 'bg-emerald-500/10 text-emerald-400', progress: 95, icon: 'analytics', iconBg: 'bg-primary-container/20 text-primary' },
];

const activityLogs = [
  { agent: 'Content Agent', action: 'Generated 3 Instagram reels with trend-aware audio overlays', time: '14:22:10', impact: '+1.2k Reach', impactColor: 'text-emerald-400', indicator: 'bg-primary' },
  { agent: 'Lead Finder', action: 'Identified 42 high-intent prospects from LinkedIn Sales Nav', time: '13:05:45', impact: 'New Batch', impactColor: 'text-blue-400', indicator: 'bg-primary' },
  { agent: 'Strategy Architect', action: 'Re-balanced ad spend budget toward High-Performance TikTok creative', time: '11:12:02', impact: 'ROI Optimization', impactColor: 'text-emerald-400', indicator: 'bg-primary' },
  { agent: 'Content Agent', action: 'Drafted LinkedIn article: "The Future of Autonomous Performance"', time: '09:30:11', impact: 'Pending Review', impactColor: 'text-on-surface-variant opacity-60', indicator: 'bg-primary' },
  { agent: 'System Core', action: 'Automated nightly database synchronization and backup complete', time: '04:00:00', impact: 'Success', impactColor: 'text-on-surface-variant opacity-60', indicator: 'bg-zinc-600' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.4 } }
};

export default function MainDashboard() {
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = () => {
    setIsApproving(true);
    setTimeout(() => setIsApproving(false), 2000);
  };

  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants} className="max-w-container-max mx-auto space-y-stack-md">
      {/* Hero Stats Bento */}
      <motion.div variants={itemVariants} className="grid grid-cols-12 gap-gutter">
        {/* Main Lead Metric */}
        <div className="col-span-12 lg:col-span-5 bg-surface-container border border-outline-variant p-stack-md rounded-xl relative overflow-hidden group">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex justify-between items-start">
                <span className="text-label-caps text-on-surface-variant">Total Pipeline Leads</span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full text-xs">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  +12.4%
                </span>
              </div>
              <motion.h2 initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="font-display text-display text-on-surface mt-stack-sm tracking-tighter">4,822</motion.h2>
              <p className="text-body-sm text-on-surface-variant mt-stack-xs italic opacity-60">Calculated from last 7 days</p>
            </div>
            <div className="mt-stack-lg flex gap-stack-sm">
              <button className="bg-primary-container text-on-primary-container px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity active:scale-95">Export CRM</button>
              <button className="bg-surface-variant text-on-surface px-4 py-2 rounded-lg font-bold text-sm hover:bg-outline-variant transition-colors border border-outline-variant active:scale-95">View Details</button>
            </div>
          </div>
          {/* Abstract Background Pattern */}
          <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none">
            <svg className="w-full h-full text-primary" viewBox="0 0 100 100">
              <circle cx="80" cy="20" fill="currentColor" r="40" />
              <circle cx="90" cy="50" fill="currentColor" r="30" />
            </svg>
          </div>
        </div>
        {/* Content Engagement Pulse */}
        <div className="col-span-12 lg:col-span-7 bg-surface-container border border-outline-variant rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-zinc-900/20">
            <span className="text-label-caps text-on-surface-variant">Multi-Channel Engagement Hub</span>
            <div className="flex gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary cyber-pulse"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-700"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-700"></span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-outline-variant h-full">
            {engagementStats.map((stat, idx) => (
              <motion.div key={idx} whileHover={{ backgroundColor: 'rgba(39, 39, 42, 0.3)' }} className="p-6 flex flex-col justify-center items-center gap-2 transition-colors cursor-pointer">
                <span className={`material-symbols-outlined ${stat.color}`}>{stat.icon}</span>
                <span className="font-display text-h2">{stat.value}</span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{stat.platform}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* AI Agents Status & Activity Feed */}
      <motion.div variants={containerVariants} className="grid grid-cols-12 gap-gutter">
        {/* Agent Status Stack */}
        <div className="col-span-12 lg:col-span-4 space-y-gutter">
          <h3 className="text-label-caps text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">precision_manufacturing</span>
            AI Command Center
          </h3>
          <div className="space-y-stack-sm">
            {activeAgents.map((agent, idx) => (
              <motion.div key={idx} variants={itemVariants} whileHover={{ scale: 1.02 }} className="bg-surface-container-high border border-outline-variant p-4 rounded-xl flex items-center gap-4 transition-all hover:border-primary/50 cursor-pointer">
                <div className={`w-12 h-12 rounded-lg ${agent.iconBg} flex items-center justify-center`}>
                  <span className="material-symbols-outlined">{agent.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-on-surface">{agent.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-black ${agent.statusClass}`}>{agent.status}</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1 rounded-full mt-2 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${agent.progress}%` }} transition={{ duration: 1, delay: 0.2 }} className="bg-primary h-full rounded-full"></motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Recent Activity Feed */}
        <motion.div variants={itemVariants} className="col-span-12 lg:col-span-8 bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
          <div className="p-stack-md border-b border-outline-variant flex justify-between items-center">
            <h3 className="text-label-caps text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-primary">history</span>
              Neural Activity Logs
            </h3>
            <button className="text-[11px] font-bold text-primary cursor-pointer hover:underline hover:text-white transition-colors">Clear Logs</button>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-900/40 text-on-surface-variant text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 font-semibold">Origin</th>
                  <th className="px-6 py-3 font-semibold">Action Performed</th>
                  <th className="px-6 py-3 font-semibold">Timestamp</th>
                  <th className="px-6 py-3 font-semibold">Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {activityLogs.map((log, idx) => (
                  <motion.tr key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * idx }} className="hover:bg-zinc-800/20 transition-colors cursor-pointer group">
                    <td className="px-6 py-4 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${log.indicator} group-hover:scale-125 transition-transform`}></span>
                      <span className="font-mono text-zinc-100">{log.agent}</span>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant truncate max-w-xs md:max-w-md">{log.action}</td>
                    <td className="px-6 py-4 font-mono text-xs opacity-50">{log.time}</td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${log.impactColor}`}>{log.impact}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>

      {/* Contextual Strategy Card */}
      <motion.div variants={itemVariants} className="pro-gradient rounded-2xl p-8 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-12 gap-gutter items-center">
          <div className="col-span-12 lg:col-span-8">
            <h2 className="font-display text-h1 text-white tracking-tighter">Strategic Insight Available</h2>
            <p className="text-white/90 text-body-lg mt-stack-sm max-w-xl leading-relaxed">Our Strategy Architect has detected a 15% drop in CAC (Customer Acquisition Cost) on TikTok. We recommend shifting 20% of your LinkedIn budget to capitalize on this window.</p>
            <div className="mt-stack-md flex flex-wrap gap-4">
              <button 
                onClick={handleApprove}
                disabled={isApproving}
                className="bg-white text-primary px-6 py-3 rounded-lg font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-75"
              >
                {isApproving ? 'Executing...' : 'Approve Transition'}
              </button>
              <button className="bg-black/20 text-white backdrop-blur border border-white/20 px-6 py-3 rounded-lg font-black text-sm uppercase tracking-widest hover:bg-black/30 transition-colors active:scale-95">Simulation Model</button>
            </div>
          </div>
          <div className="hidden lg:block col-span-4 relative h-48">
            <motion.img 
              animate={{ y: [0, -10, 0] }} 
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              alt="AI Insights" 
              className="w-full h-full object-contain rounded-xl drop-shadow-2xl mix-blend-screen" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOqcVJl2MUB5y8pjYa3U6Onq1JfL2J6bHtS572z6Xl1HmAcZyhqAo3sDtixEnDUT4cEzQNrDLx6hNdo3e5mDgHHc75fi-AY-1xhZfuCDpC30Db_6KcFTjgz8Dz0BDRGs9IY8cN84BvDcoXZJkXyFmcfnOeOb327S9xeP5XKDFPjLwnIydxFyDhPMWSz-52bIPq0ubWugk1opUR6SGJcfZ7lyQuiKO7Kvw4Q1eiqIntcbQTl5Ch47TLWm2IfFH6_4g-Jlton_0Qjkrq"
            />
          </div>
        </div>
        {/* Glassmorphic Overlay Texture */}
        <div className="absolute inset-0 bg-white/[0.05] pointer-events-none"></div>
      </motion.div>
    </motion.div>
  );
}
