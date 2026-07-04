import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const activeLeads = [
  { id: 1, name: 'Marcus Chen', role: 'CTO at NexaCorp', source: 'LinkedIn', icon: 'alternate_email', score: 88, status: 'Qualified', statusClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFkNG2wU4jWmfNFRtMHcFOcBNacqoZhUhIv7FAWEfr_RGYXrecre7xYE1WAo4KIi-sDrHOO4qVS7JHt8r2EcYOpfRKO-OYM8Fk3aXLalotK4yptjibnHNda4T1zL4CaddqE9tlWcOwdMM28hlVz4zKIqG3ElhMuA_IwZoImEJz4LBMBPSjIa0KPLyBzthtWCZIpfTuK3Fy_EIHHmXARICWhV2dK5Nw_ETvhla8VfX2I-0u4R71FgXQmcL8KnyPho4xYT25BMKdVM7t' },
  { id: 2, name: 'Sarah Jenkins', role: 'Growth lead @ ScaleFlow', source: 'Direct Inbound', icon: 'language', score: 92, status: 'Meeting Booked', statusClass: 'bg-primary-container/10 text-primary border-primary/20', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_7qcsh4-boZAmXyfOb4bWen0o3Yfp3WKt2bKLImF72_IJSvfmNlUUWlE6YBEXftyaMGDYHtYfxlO64UecXruKmGwLJzL7ZZ8zCXuYiU8hykUpliQF2wEUAnyWUrDb9RlsT2PluoM_9JZEk73hKDyWABZT8mrPHPPaKNCxr_O8Y34rb6lPxiGf88CM9sMVC19nCmESnZin1Qn_DLgTtDKpNowiMQq8h2x_ZeRD8qquPTJi5ad--zo9Kex6cKINTyWenLQUPNPOGgID' },
  { id: 3, name: 'David Miller', role: 'Operations Manager', source: 'Twitter Ad', icon: 'campaign', score: 45, status: 'New', statusClass: 'bg-surface-container-highest text-on-surface-variant border-outline-variant/30', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLJmY7PFh3QYmmGVnf4tbW7ttJVegXSf2O6owfOrPK5_oNB1gaj5JAtYGjB-VPskPnh4Uk6WI9-uPnGZwJI1MtGPEaf7O31jyD6DOdu71VnMXauEfGm_Lv_1oeJaYN22rcFM2GbmcH4lV_30_P4LCHtlWVsKhkrV4wCE-xUzyvn0RtvptNXWtF6C9xM3rCh_tCbf1iWIZ0oNJKaj4PtQHe1OrMHaWQE4HyUZiXRW7k7_f0EG1a4hSllNtLJ7CJLNhEybR0l9ofX47f' },
  { id: 4, name: 'Elena Rodriguez', role: 'VP Partnerships @ TechFlow', source: 'Referral', icon: 'groups', score: 12, status: 'Lost', statusClass: 'bg-error-container text-on-error-container border-error/20', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0IAK9Lnx1vQtA5mDBVVfhVyyr-etFudkULo9Rd8BLG35Sov8LPWMDH02yVmaZOHB54fJJhg8dmYwYTUdvfGMC2B-BlGJhGanev9elpJWOLPpPDqgzpH_oxhZxFFmKkoGhsCROZPzJbPf8wd-eUgzTsq47gl4qOJKp-NnyA0E6Z0YXjwKcYansL6vyPq30qZr1S7u1bx3dXr1Q_qfkN-VJXyDf7wpYFnsLX2lWRxrIvPXXFMiJ9uHssFzYLkrUzkbP0kCcCVbRmauV' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.4 } }
};

export default function LeadPipeline1() {
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(2); // Default to Sarah

  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants} className="max-w-[1440px] mx-auto">
      {/* Header & Stats Bento */}
      <motion.div variants={itemVariants} className="grid grid-cols-12 gap-6 mb-stack-md">
        <div className="col-span-8">
          <h2 className="font-h1 text-h1 text-on-surface mb-2">Lead Pipeline</h2>
          <p className="text-on-surface-variant text-body-sm max-w-2xl leading-relaxed">Autonomous engagement agents are currently processing 142 leads across 4 high-intent channels. BANT scoring is updated in real-time based on conversation sentiment analysis.</p>
        </div>
        <div className="col-span-4 flex items-end justify-end gap-3">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 bg-surface-container border border-outline-variant text-on-surface rounded-lg text-sm font-semibold hover:bg-surface-container-high transition-colors flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-sm">filter_list</span>
            Filters
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 pro-gradient text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">add</span>
            Add Lead
          </motion.button>
        </div>
      </motion.div>

      {/* Bento Stats Grid */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-stack-md">
        {[
          { label: 'Total Leads', value: '2,841', diff: '+12.4%', diffColor: 'text-emerald-500' },
          { label: 'Qualified (SQL)', value: '156', diff: 'Active', diffColor: 'text-primary' },
          { label: 'Avg. BANT Score', value: '74.2', diff: '/ 100', diffColor: 'text-on-surface-variant' },
          { label: 'Agent Efficiency', value: '98.8%', diff: 'bolt', diffColor: 'text-emerald-500 material-symbols-outlined text-sm' }
        ].map((stat, idx) => (
          <motion.div key={idx} variants={itemVariants} whileHover={{ y: -5 }} className="p-6 rounded-xl bg-surface-container border border-outline-variant/30 flex flex-col gap-2 shadow-sm cursor-pointer">
            <span className="text-on-surface-variant font-label-caps uppercase tracking-wider text-xs">{stat.label}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-on-surface">{stat.value}</span>
              <span className={`${stat.diffColor} font-bold text-xs`}>{stat.diff}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Layout: Table & Conversation Drawer */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Lead Table Container */}
        <motion.div variants={itemVariants} className="flex-1 bg-surface-container-low rounded-xl border border-outline-variant/30 overflow-hidden shadow-2xl w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-surface-container-high/50 border-b border-outline-variant/30">
                  <th className="px-6 py-4 font-label-caps text-on-surface-variant text-[11px] uppercase tracking-widest font-bold">Lead Name</th>
                  <th className="px-6 py-4 font-label-caps text-on-surface-variant text-[11px] uppercase tracking-widest font-bold">Source</th>
                  <th className="px-6 py-4 font-label-caps text-on-surface-variant text-[11px] uppercase tracking-widest font-bold">BANT Score</th>
                  <th className="px-6 py-4 font-label-caps text-on-surface-variant text-[11px] uppercase tracking-widest font-bold">Status</th>
                  <th className="px-6 py-4 font-label-caps text-on-surface-variant text-[11px] uppercase tracking-widest font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {activeLeads.map((lead) => {
                  const isSelected = selectedLeadId === lead.id;
                  return (
                    <motion.tr 
                      key={lead.id}
                      onClick={() => setSelectedLeadId(lead.id)}
                      className={`transition-colors cursor-pointer group ${isSelected ? 'bg-primary-container/10 border-l-2 border-primary' : 'hover:bg-surface-container-high'}`}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden border ${isSelected ? 'border-primary/50 ring-2 ring-primary/20' : 'border-outline-variant/20'} transition-all`}>
                            <img className="w-full h-full object-cover" alt={lead.name} src={lead.avatar} />
                          </div>
                          <div>
                            <div className={`font-semibold text-sm transition-colors ${isSelected ? 'text-primary' : 'text-on-surface group-hover:text-primary'}`}>{lead.name}</div>
                            <div className="text-on-surface-variant text-[11px]">{lead.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-surface-container w-fit border border-outline-variant/30">
                          <span className="material-symbols-outlined text-primary text-sm">{lead.icon}</span>
                          <span className="text-xs font-medium text-on-surface">{lead.source}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 w-24 bg-surface-container-highest rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${lead.score}%` }} transition={{ duration: 1 }} className={`h-full rounded-full ${lead.score >= 80 ? 'bg-emerald-500' : lead.score >= 40 ? 'bg-amber-500' : 'bg-error'}`}></motion.div>
                          </div>
                          <span className="text-xs font-bold text-on-surface">{lead.score}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 w-fit ${lead.statusClass}`}>
                          <span className={`w-1 h-1 rounded-full ${lead.score >= 80 ? 'bg-emerald-500' : lead.score >= 40 ? 'bg-amber-500' : 'bg-error'}`}></span>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="text-on-surface-variant hover:text-primary transition-colors p-1.5 bg-surface-container rounded-lg border border-transparent hover:border-primary/30">
                          <span className="material-symbols-outlined text-sm">more_horiz</span>
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-6 py-4 border-t border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
              <span className="text-xs text-on-surface-variant font-medium">Showing 4 of 2,841 active leads</span>
              <div className="flex gap-2">
                <button className="p-2 border border-outline-variant/30 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-50 active:scale-95">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button className="p-2 border border-outline-variant/30 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors active:scale-95">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Automated Conversation Sidebar/Drawer */}
        <AnimatePresence mode="wait">
          {selectedLeadId && (
            <motion.div 
              key={selectedLeadId}
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: 'spring', bounce: 0.2 }}
              className="w-full lg:w-[400px] bg-surface-container border border-outline-variant/30 rounded-xl flex flex-col h-[600px] overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-high/30">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>chat_bubble</span>
                  <div>
                    <h3 className="text-sm font-bold text-on-surface">Conversation Log</h3>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full cyber-pulse"></span>
                      Agent ID: AE-042 (Sarah)
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedLeadId(null)} className="text-on-surface-variant hover:text-white transition-colors"><span className="material-symbols-outlined text-sm">close</span></button>
              </div>

              {/* Chat History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {/* Timestamp */}
                <div className="flex justify-center">
                  <span className="text-[10px] text-on-surface-variant bg-surface-container-highest px-3 py-1 rounded-full uppercase font-bold tracking-widest shadow-inner">Tuesday, 14:21 PM</span>
                </div>
                
                {/* Agent Message */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1 max-w-[85%]">
                  <div className="text-[10px] font-bold text-primary ml-1 uppercase tracking-wider">Fourdoor Agent</div>
                  <div className="bg-primary-container/10 border border-primary/20 text-on-surface text-xs p-4 rounded-2xl rounded-tl-sm leading-relaxed shadow-sm">
                    Hi Sarah, I noticed you were looking at our API documentation earlier today. I'm an autonomous assistant for Fourdoor. Would you like a technical brief on how we handle high-concurrency lead flows?
                  </div>
                </motion.div>
                
                {/* Lead Message */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col gap-1 items-end max-w-[85%] ml-auto">
                  <div className="text-[10px] font-bold text-on-surface-variant mr-1 uppercase tracking-wider">Sarah Jenkins</div>
                  <div className="bg-surface-container-highest border border-outline-variant/30 text-on-surface text-xs p-4 rounded-2xl rounded-tr-sm leading-relaxed shadow-sm">
                    Yes, actually. We currently handle about 50k events per second. Can your agent layer scale horizontally to meet that without increasing latency?
                  </div>
                </motion.div>
                
                {/* Agent Message with AI Insight Badge */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col gap-1 max-w-[85%]">
                  <div className="text-[10px] font-bold text-primary ml-1 uppercase tracking-wider">Fourdoor Agent</div>
                  <div className="bg-primary-container/10 border border-primary/20 text-on-surface text-xs p-4 rounded-2xl rounded-tl-sm leading-relaxed shadow-sm">
                    Absolutely. We utilize a geo-distributed node cluster that auto-scales. Based on your volume, I'd recommend our Enterprise Sharding protocol. 
                    <div className="mt-3 pt-3 border-t border-primary/20 flex items-center justify-between bg-primary/5 -mx-4 -mb-4 p-3 rounded-b-xl">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 tracking-wider">
                        <span className="material-symbols-outlined text-xs">analytics</span>
                        BANT Boost: +15 Budget High
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Lead Message */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex flex-col gap-1 items-end max-w-[85%] ml-auto">
                  <div className="text-[10px] font-bold text-on-surface-variant mr-1 uppercase tracking-wider">Sarah Jenkins</div>
                  <div className="bg-surface-container-highest border border-outline-variant/30 text-on-surface text-xs p-4 rounded-2xl rounded-tr-sm leading-relaxed shadow-sm">
                    That sounds promising. Let's book a technical deep dive. Tomorrow at 10 AM?
                  </div>
                </motion.div>
                
                {/* Event Log */}
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }} className="flex justify-center py-2">
                  <div className="flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/10">
                    <span className="material-symbols-outlined text-sm">event_available</span>
                    Meeting Auto-Booked: Oct 25, 10:00 AM
                  </div>
                </motion.div>
              </div>

              {/* Quick Actions / AI Response Builder */}
              <div className="p-4 border-t border-outline-variant/30 bg-surface-container-high/50 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-px bg-outline-variant/30"></div>
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Override Agent</span>
                  <div className="flex-1 h-px bg-outline-variant/30"></div>
                </div>
                <div className="flex gap-2">
                  <input className="flex-1 bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-4 py-2.5 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-500 text-white shadow-inner" placeholder="Type a manual override message..." type="text"/>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 bg-primary text-on-primary font-bold rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 transition-all">
                    <span className="material-symbols-outlined text-sm">send</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
