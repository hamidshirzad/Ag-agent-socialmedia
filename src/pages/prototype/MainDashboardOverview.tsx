import React from 'react';
import { motion } from 'framer-motion';

const kpis = [
  { label: 'TOTAL LEADS', value: '1,284', icon: 'groups', trend: '+12.5% this month', trendIcon: 'trending_up', trendClass: 'text-secondary' },
  { label: 'CONTENT REACH', value: '428.5K', icon: 'share', trend: '+8.2% this month', trendIcon: 'trending_up', trendClass: 'text-secondary' },
  { label: 'ENGAGEMENT RATE', value: '4.82%', icon: 'bolt', trend: '-0.4% this month', trendIcon: 'trending_down', trendClass: 'text-error' },
  { label: 'BOOKED CALLS', value: '32', icon: 'calendar_today', trend: '+4 new today', trendIcon: 'trending_up', trendClass: 'text-secondary' },
];

const activeAgents = [
  { name: 'Content Agent', status: 'ACTIVE', statusClass: 'text-secondary bg-secondary/10 border-secondary/20', desc: 'Drafting 3 LinkedIn posts...', iconColor: 'bg-secondary shadow-[0_0_8px_#5de6ff]' },
  { name: 'Engagement Agent', status: 'THINKING', statusClass: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20', desc: 'Analyzing thread sentiments...', spinner: true },
  { name: 'Sales Agent', status: 'ACTIVE', statusClass: 'text-secondary bg-secondary/10 border-secondary/20', desc: 'Qualifying 12 inbound leads', iconColor: 'bg-secondary shadow-[0_0_8px_#5de6ff]' },
  { name: 'Analytics Agent', status: 'IDLE', statusClass: 'text-slate-500 bg-slate-500/10 border-slate-500/20', desc: 'Reports ready for review', iconColor: 'bg-slate-600' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.4 } }
};

export default function MainDashboardOverview() {
  return (
    <motion.div 
      initial="hidden" animate="show" variants={containerVariants}
      className="p-container-padding max-w-[1400px] mx-auto space-y-8"
    >
      {/* Header Section */}
      <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface">Good Morning, Alex</h1>
          <p className="text-on-surface-variant font-body-main mt-1 italic opacity-80">Your agents have identified 14 high-intent leads while you were away.</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 glass-card rounded-full text-label-caps font-label-caps text-secondary border-secondary/20 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary cyber-pulse"></span>
            SYSTEM ACTIVE
          </span>
        </div>
      </motion.header>

      {/* High-Level KPIs Bento Grid */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-element-gap">
        {kpis.map((kpi, idx) => (
          <motion.div key={idx} variants={itemVariants} whileHover={{ scale: 1.02 }} className="glass-card p-6 rounded-xl flex flex-col justify-between group hover:border-primary/30 transition-all cursor-default">
            <div className="flex justify-between items-start">
              <span className="text-label-caps font-label-caps text-on-surface-variant">{kpi.label}</span>
              <span className="material-symbols-outlined text-primary" data-icon={kpi.icon}>{kpi.icon}</span>
            </div>
            <div className="mt-4">
              <div className="text-data-point font-data-point text-on-surface">{kpi.value}</div>
              <div className={`text-xs mt-1 flex items-center gap-1 ${kpi.trendClass}`}>
                <span className="material-symbols-outlined text-xs" data-icon={kpi.trendIcon}>{kpi.trendIcon}</span>
                {kpi.trend}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-12 gap-element-gap">
        
        {/* Active Agents Panel */}
        <motion.div variants={itemVariants} className="col-span-12 lg:col-span-4 glass-card rounded-xl p-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[60px] rounded-full -mr-16 -mt-16"></div>
          <h2 className="font-h2 text-xl text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container" data-icon="smart_toy">smart_toy</span>
            Active Agents
          </h2>
          <div className="space-y-4">
            {activeAgents.map((agent, idx) => (
              <motion.div key={idx} whileHover={{ x: 4 }} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-800/50 group hover:border-secondary/20 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  {agent.spinner ? (
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <div className={`w-2 h-2 rounded-full ${agent.iconColor}`}></div>
                  )}
                  <div>
                    <div className="font-semibold text-sm text-slate-100">{agent.name}</div>
                    <div className="text-[11px] text-slate-500">{agent.desc}</div>
                  </div>
                </div>
                <div className={`text-[10px] font-label-caps px-2 py-0.5 rounded border ${agent.statusClass}`}>{agent.status}</div>
              </motion.div>
            ))}
          </div>
          
          {/* Plan & Connected Platforms Card */}
          <div className="mt-8 pt-8 border-t border-slate-800/50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-label-caps font-label-caps text-on-surface-variant">CURRENT PLAN</span>
              <span className="text-sm font-bold text-indigo-400">Pro Tier</span>
            </div>
            <div className="bg-indigo-500/5 rounded-xl p-4 border border-indigo-500/10 mb-4">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-400">Monthly Usage</span>
                <span className="text-slate-200">8.4k / 10k tokens</span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '84%' }} transition={{ duration: 1, delay: 0.5 }} className="bg-indigo-500 h-full"></motion.div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {['Instagram', 'LinkedIn', 'X', 'TikTok'].map((platform, idx) => (
                <motion.div key={idx} whileHover={{ scale: 1.1 }} className="p-2 glass-card rounded-lg flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-pointer">
                  <img alt={platform} className="w-5 h-5" src={`https://lh3.googleusercontent.com/aida-public/AB6AXuC0hnYdxEc-q_X9_e4abPW7JJQPL1Bdt5l0ov7xs0fOpxqk6LApYAyrKmVIKS4gG5Ly75TcDUobtZ576t6rzkMP_-kgVH5aZXvZbV1CJu_Sqshoffx9XN3FrP8jx-twxkhrjzmlDTAJwQG8SyMbm6kF0j5_9rtKD9BkB6hjUTOcFbOjdVQiCCZCgYv1KL81bCfp86A-5uLxNz1SrAAH7z1b9_WwNHtZvv6tMsEFpyrjjiT-SFJOM9M_2GM-DcBIBqgh9WRDYAsSvwX7`} />
                </motion.div>
              ))}
              <div className="p-2 glass-card border-dashed border-slate-700 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-lg" data-icon="add">add</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Activity Feed - Growth Engine */}
        <motion.div variants={itemVariants} className="col-span-12 lg:col-span-8 glass-card rounded-xl p-8 relative">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-h2 text-xl text-on-surface">Growth Engine</h2>
              <p className="text-sm text-slate-500 font-body-main">Real-time autonomous operations</p>
            </div>
            <button className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline">
              View Full Log
              <span className="material-symbols-outlined text-sm" data-icon="arrow_forward">arrow_forward</span>
            </button>
          </div>
          
          <div className="space-y-8 pl-6">
            {/* Activity Item 1 */}
            <div className="activity-line relative">
              <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-secondary border-2 border-surface"></div>
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-100 font-body-main">Content Published</span>
                    <span className="text-xs text-slate-500">2 minutes ago</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-3 max-w-lg">The "Autonomous Marketing" thread has been published to LinkedIn and X. Initial traction: 142 views within 120 seconds.</p>
                  <div className="flex gap-4">
                    <div className="glass-card rounded-lg p-2 flex items-center gap-3 border-indigo-500/20 pr-4 cursor-pointer hover:bg-slate-800/50 transition-colors">
                      <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center overflow-hidden">
                        <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDF6GIyKui9X3l6PyhUN4SZgQ7R6u9EkcZZlirKZi9b6IFg4RS16FJIQeJ6Cxq85pv7IfIMIlSGTQUKo0d-gSzo9GQgzhupIQsv6PAht8yj7c8seyK70puAbJvYev_Wct3EhWcbgi-C7JIu8ynyPKNb4gCV3Xr0upDOnLC3av-w1S8xL_vpBNE5hnwIn25ehW1OsBptkeyjpT7I2AjYuN7BE7HZ4JQ9oEkQdK9gQsqWRtgBjcJr973WoQayOtUaCBsfRmFpstUVm4JT" alt="Post thumbnail"/>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-label-caps">LINKEDIN POST</div>
                        <div className="text-xs font-semibold text-slate-300">The Future of AI agents...</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Item 2 */}
            <div className="activity-line relative">
              <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-indigo-500 border-2 border-surface"></div>
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-100 font-body-main">Lead Qualified</span>
                    <span className="text-xs text-slate-500">14 minutes ago</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">Sales Agent identified a high-intent prospect from recent engagement activity.</p>
                  <div className="flex flex-wrap gap-2">
                    <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-700/50 flex items-center gap-4 min-w-[300px] cursor-pointer hover:border-indigo-500/50 transition-colors">
                      <div className="w-10 h-10 rounded-full pro-gradient flex items-center justify-center text-white font-bold">SM</div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-slate-100">Sarah Mitchell</div>
                        <div className="text-[11px] text-slate-500">CTO at TechFlow Systems</div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-[10px] font-bant-score text-secondary bg-secondary/10 px-2 py-0.5 rounded border border-secondary/20">BANT: 88</div>
                        <div className="text-[10px] text-slate-500 mt-1">High Intent</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Lead Source Heatmap Card */}
        <motion.div variants={itemVariants} className="col-span-12 glass-card rounded-xl p-6 flex flex-col md:flex-row gap-8 items-center">
          <div className="md:w-1/3">
            <h3 className="text-lg font-bold text-slate-100 mb-2">Lead Density Map</h3>
            <p className="text-sm text-slate-500 mb-6 font-body-main">Distribution of high-intent prospects based on regional engagement metrics.</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">North America</span>
                <span className="text-secondary font-bold">45%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full">
                <motion.div initial={{ width: 0 }} whileInView={{ width: '45%' }} viewport={{ once: true }} className="bg-secondary h-full"></motion.div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Europe</span>
                <span className="text-indigo-400 font-bold">32%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full">
                <motion.div initial={{ width: 0 }} whileInView={{ width: '32%' }} viewport={{ once: true }} className="bg-indigo-400 h-full"></motion.div>
              </div>
            </div>
          </div>
          <div className="md:w-2/3 w-full h-64 bg-slate-900 rounded-xl overflow-hidden border border-slate-800/50 relative">
            <img className="w-full h-full object-cover opacity-30 mix-blend-luminosity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCn-mFLShmAFRRQVTYJEP3b35Hc75NgQfumDBtseeqYGflWysNx-IKL3_pGcKNrbfnQZGfEV_Y57FdLfD2DtnuZA2K_1wkPsqFipRBJCeAV4Yv_jDe7fUCQfUK_UgeHHVJ6vjohscAT89pKckaCEJTpPXvaNYyXlk0o__z9NQJ0smW4EKZfZo3YGD1eBlBiq7KOA0miBkludWJhNWdWSZZaSHVazucZ4kF71GGRuCTmkHWZ3giWbOGczG_nbmepR7S99Tlf0PeG2NvI" alt="World Map"/>
            <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-secondary rounded-full cyber-pulse"></div>
            <div className="absolute top-1/3 left-1/2 w-3 h-3 bg-indigo-500 rounded-full cyber-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-1/4 left-3/4 w-5 h-5 bg-primary rounded-full cyber-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
