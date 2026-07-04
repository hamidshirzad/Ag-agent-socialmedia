import React from 'react';
import { motion } from 'framer-motion';

const activityFeed = [
  { action: 'Qualified Lead', target: 'TechFlow CTO', time: '12m', icon: 'check_circle', iconColor: 'text-emerald-400' },
  { action: 'Published', target: 'LinkedIn Post', time: '1h', icon: 'send', iconColor: 'text-primary' },
  { action: 'Drafted', target: 'X Thread', time: '2h', icon: 'edit', iconColor: 'text-on-surface-variant' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', bounce: 0.3 } }
};

export default function DashboardOverview() {
  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants} className="max-w-container-max mx-auto space-y-stack-md">
      {/* Header & Agent Status */}
      <motion.section variants={itemVariants} className="flex flex-col gap-stack-xs mt-4">
        <h1 className="font-h1 text-h1 text-on-background">Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="font-label-caps text-label-caps text-primary tracking-widest">AUTONOMOUS AGENT ACTIVE</span>
        </div>
      </motion.section>

      {/* Main Stats Bento Grid */}
      <motion.section variants={containerVariants} className="grid grid-cols-2 gap-4">
        {/* Total Leads */}
        <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="glass-card p-stack-md rounded-xl col-span-2 relative overflow-hidden group cursor-pointer">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-display" data-icon="trending_up">trending_up</span>
          </div>
          <div className="flex justify-between items-start mb-2">
            <span className="font-label-caps text-label-caps text-on-surface-variant">TOTAL LEADS</span>
            <span className="text-xs font-bold text-primary flex items-center gap-1">+12.4%</span>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="font-display text-display text-on-background tracking-tighter">2,841</motion.div>
          <div className="mt-4 h-12 w-full bg-surface-container rounded flex items-end gap-1 px-1 overflow-hidden">
            {[20, 30, 40, 25, 60, 50, 100].map((height, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.5, delay: 0.2 + (i * 0.1) }}
                className={`flex-1 ${height === 100 ? 'bg-primary' : 'bg-primary/20 hover:bg-primary/40'} rounded-t-sm transition-colors`}
              ></motion.div>
            ))}
          </div>
        </motion.div>

        {/* Content Reach */}
        <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} className="glass-card p-stack-md rounded-xl flex flex-col justify-between cursor-pointer">
          <div>
            <span className="font-label-caps text-label-caps text-on-surface-variant block mb-1">REACH</span>
            <div className="font-h2 text-h2 text-on-background">428.5k</div>
          </div>
          <div className="flex items-center gap-1 mt-4">
            <span className="material-symbols-outlined text-primary text-sm" data-icon="hub">hub</span>
            <span className="text-[10px] font-bold text-on-surface-variant">V-NETWORK</span>
          </div>
        </motion.div>

        {/* Conversion */}
        <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} className="glass-card p-stack-md rounded-xl flex flex-col justify-between cursor-pointer">
          <div>
            <span className="font-label-caps text-label-caps text-on-surface-variant block mb-1">CONVERSION</span>
            <div className="font-h2 text-h2 text-on-background">4.2%</div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-emerald-400">
            <span className="material-symbols-outlined text-sm" data-icon="arrow_upward">arrow_upward</span>
            <span className="text-[10px] font-bold">0.8%</span>
          </div>
        </motion.div>
      </motion.section>

      {/* Activity Feed Mini */}
      <motion.section variants={itemVariants} className="glass-card rounded-xl p-stack-md">
        <div className="flex justify-between items-center mb-4">
          <span className="font-label-caps text-label-caps text-on-surface-variant">RECENT AGENT ACTIVITY</span>
          <span className="material-symbols-outlined text-sm text-on-surface-variant">more_horiz</span>
        </div>
        <div className="space-y-4">
          {activityFeed.map((activity, idx) => (
            <motion.div key={idx} whileHover={{ x: 5 }} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-8 h-8 rounded-full bg-surface-container flex items-center justify-center ${activity.iconColor} group-hover:bg-slate-800 transition-colors`}>
                <span className="material-symbols-outlined text-sm">{activity.icon}</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-on-background">{activity.action}</div>
                <div className="text-xs text-on-surface-variant">{activity.target}</div>
              </div>
              <span className="text-[10px] font-label-caps text-on-surface-variant">{activity.time}</span>
            </motion.div>
          ))}
        </div>
        <button className="w-full mt-6 py-2 bg-surface-container hover:bg-outline-variant transition-colors text-xs font-bold text-on-background rounded-lg uppercase tracking-widest active:scale-95">View Full Log</button>
      </motion.section>
    </motion.div>
  );
}
