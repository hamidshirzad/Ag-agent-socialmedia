import React, { useState } from 'react';
import { motion } from 'framer-motion';

const activeLeads = [
  { id: 'EB', name: 'Elena Belova', role: 'CTO @ Cyberdyne', platform: 'LinkedIn', icon: 'alternate_email', score: 78, scoreWidth: '78%', status: 'Qualified', statusClass: 'bg-secondary/10 text-secondary border-secondary/20', avatarColor: 'from-indigo-500 to-indigo-700' },
  { id: 'SK', name: 'Soren Kierk', role: 'Director @ Nordic Soft', platform: 'Email Direct', icon: 'mail', score: 45, scoreWidth: '45%', status: 'Qualifying', statusClass: 'bg-surface-bright/50 text-slate-400 border-slate-700', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaBWdEDFu8VQvFqCArdJ5HrvCVeeE126h7I0R1Y61YEjstFY6glTukVwMo70Dwz5xDjagsJiuG2YEZ1dBCr3yOKOYCd5YiNiwc4cuvsls6xvscy4UNVcXosMJAjNWjTbTq5RH32FeJ4FWVTGhWiZ_QcTb3BdMQmee8Wj_3K3C6goN-PP4W9JsERFOFCGl5UGUho5vwXQ4HOz0e3uTQapoD5nyM3QZJpCLAGjkxtmKveclmR97QyV09exohe1BGpgYY1wtjGNPkWM43' },
  { id: 'AH', name: 'Aria Hall', role: 'Ops Lead @ Hallway', platform: 'Twitter X', icon: 'public', score: 95, scoreWidth: '95%', status: 'Call Booked', statusClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', avatarColor: 'from-slate-600 to-slate-800' },
  { id: 'DL', name: 'David Lee', role: 'Growth @ Scale.io', platform: 'LinkedIn', icon: 'alternate_email', score: 32, scoreWidth: '32%', status: 'Qualifying', statusClass: 'bg-surface-bright/50 text-slate-400 border-slate-700', avatarColor: 'from-cyan-500 to-indigo-500' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.4 } }
};

export default function LeadPipelineSalesAgent() {
  const [isCalling, setIsCalling] = useState(false);

  const handleCall = () => {
    setIsCalling(true);
    setTimeout(() => setIsCalling(false), 3000);
  };

  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants}>
      <motion.header variants={itemVariants} className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface">Lead Pipeline</h1>
          <p className="text-surface-bright mt-2 font-body-main text-on-surface-variant">Managing 1,284 autonomous prospect interactions.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded-xl border border-outline-variant shadow-sm">
            <span className="w-2 h-2 rounded-full bg-secondary cyber-pulse"></span>
            <span className="text-label-caps font-label-caps text-secondary uppercase tracking-widest">Agent active: Sales Qualifier 4</span>
          </div>
        </div>
      </motion.header>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Booked Section (High Value) */}
        <motion.section variants={itemVariants} className="col-span-12 lg:col-span-4 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border-l-4 border-indigo-500">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-400">event_available</span>
                Booked on Calendly
              </h3>
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bant-score text-bant-score font-bold">3 Today</span>
            </div>
            
            <div className="space-y-4">
              {/* Booked Lead Card */}
              <motion.div whileHover={{ scale: 1.02 }} className="p-4 rounded-xl bg-surface-container border border-indigo-500/30 hover:border-indigo-400/50 transition-all cursor-pointer shadow-lg shadow-indigo-500/5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-white">Julianne Stark</h4>
                    <p className="text-xs text-slate-400">VP Marketing @ Hyperion</p>
                  </div>
                  <div className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded">SCORE 92</div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-indigo-400">schedule</span>
                    <span className="text-xs text-slate-300">Today, 2:30 PM</span>
                  </div>
                  <img className="w-6 h-6 rounded-full border border-slate-700" alt="Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiB3PJQHE6im9Qd8uQqZVVcR2Bw31t-0uwYMWm27DFRENeDrlK5LS4VUTqj7dgs6YIko-P43jhQGMWSgewx2pWc8rQqRO7aHgDm7ZO_vm-0iB3OUVnT64YwdIfYDFONZObgI0XITsc27YXvOpYgpvKXmtXa52WqHxbLBOyVBVkhUQuMwhjJd7G2ZVMT_a2671KL0GnqC5JemRHNoTuDbG1ootX-8z5Sb9LtkieBhaKSrgqm6En5xXYju6yC2WRG44VULPjWJZL81KH"/>
                </div>
              </motion.div>
              
              {/* Booked Lead Card */}
              <motion.div whileHover={{ scale: 1.02 }} className="p-4 rounded-xl bg-surface-container border border-slate-800 hover:border-indigo-400/50 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-white">Marcus Thorne</h4>
                    <p className="text-xs text-slate-400">Founder @ Zenith AI</p>
                  </div>
                  <div className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded">SCORE 88</div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-indigo-400">schedule</span>
                    <span className="text-xs text-slate-300">Tomorrow, 10:00 AM</span>
                  </div>
                  <img className="w-6 h-6 rounded-full border border-slate-700" alt="Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7z1V-Ry2Swqx9elhk-ELZbEL33Y0eFomnUmbYFMIZ7m4TbquYFAWIMd7DLTvy47yGoRNpSnJvSTsFsCJZoA-Y4o14HWbkKMTy3Aeg3A6rYUjLLKCEWDy_yLbgF15USXgqc2ffC2OPEqXaWuTd7hZ5r2OLD-T9O8U7svHwdM0-kHBOaPizzdUTMuFkQFaWQIA6YvFjrWJCYbAQGzV_ZlsV9nPjeoa63v5CobI8dYr9bsR1vWg2NO__Tl-UMausqW1opaQcjcTbmzI2"/>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Sales Qualification Stats */}
          <div className="glass-panel rounded-2xl p-6 overflow-hidden relative group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 blur-[80px] rounded-full group-hover:bg-indigo-500/20 transition-colors"></div>
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-6 tracking-widest">Funnel Efficiency</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-400">Cold to Booked</span>
                  <span className="text-secondary font-bold">4.2% <span className="text-slate-500 font-normal">(Avg: 2.1%)</span></span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: '65%' }} viewport={{ once: true }} transition={{ duration: 1 }} className="h-full bg-secondary"></motion.div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-400">AI Response Rate</span>
                  <span className="text-indigo-400 font-bold">82%</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: '82%' }} viewport={{ once: true }} transition={{ duration: 1 }} className="h-full bg-indigo-500"></motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Main Lead Table Section */}
        <motion.section variants={itemVariants} className="col-span-12 lg:col-span-8">
          <div className="glass-panel rounded-2xl overflow-hidden h-full">
            <div className="p-6 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/20">
              <h3 className="font-h2 text-xl text-on-surface">Active Pipeline</h3>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg bg-surface-container border border-outline-variant hover:border-indigo-400 transition-colors active:scale-95">
                  <span className="material-symbols-outlined text-sm">search</span>
                </button>
                <button className="p-2 rounded-lg bg-surface-container border border-outline-variant hover:border-indigo-400 transition-colors active:scale-95">
                  <span className="material-symbols-outlined text-sm">tune</span>
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-6 py-4 font-label-caps text-label-caps text-slate-400 uppercase tracking-widest font-bold">Name</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps text-slate-400 uppercase tracking-widest font-bold">Platform</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps text-slate-400 uppercase tracking-widest font-bold">BANT Score</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps text-slate-400 uppercase tracking-widest font-bold">Status</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps text-slate-400 uppercase tracking-widest font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30">
                  {activeLeads.map((lead, idx) => (
                    <motion.tr key={lead.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * idx }} className="hover:bg-slate-800/20 transition-colors group cursor-pointer">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          {lead.avatar ? (
                            <img className="w-8 h-8 rounded border border-slate-700 object-cover" alt="Avatar" src={lead.avatar} />
                          ) : (
                            <div className={`w-8 h-8 rounded bg-gradient-to-br ${lead.avatarColor} flex items-center justify-center font-bold text-xs text-white`}>{lead.id}</div>
                          )}
                          <div>
                            <div className="text-sm font-semibold text-on-surface group-hover:text-indigo-400 transition-colors">{lead.name}</div>
                            <div className="text-[10px] text-slate-500">{lead.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg text-slate-400">{lead.icon}</span>
                          <span className="text-xs text-slate-300">{lead.platform}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} whileInView={{ width: lead.scoreWidth }} viewport={{ once: true }} transition={{ duration: 1 }} className={`h-full ${lead.score >= 70 ? 'bg-indigo-500' : 'bg-secondary'}`}></motion.div>
                          </div>
                          <span className={`font-data-point text-xs font-bold ${lead.score >= 70 ? 'text-indigo-400' : 'text-secondary'}`}>{lead.score}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${lead.statusClass}`}>{lead.status}</span>
                      </td>
                      <td className="px-6 py-5">
                        <button className="text-slate-500 hover:text-indigo-400 transition-colors bg-surface-container p-1.5 rounded-lg border border-transparent hover:border-indigo-500/30">
                          <span className="material-symbols-outlined text-sm">more_horiz</span>
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.section>

        {/* Conversation Detail Panel (Floating) */}
        <motion.div variants={itemVariants} className="col-span-12 glass-panel rounded-3xl p-0 overflow-hidden grid grid-cols-12 mt-4 shadow-2xl">
          <div className="col-span-12 md:col-span-8 p-8 border-b md:border-b-0 md:border-r border-slate-800/50">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full border-2 border-indigo-500 p-0.5">
                <img alt="Elena" className="w-full h-full rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJDZKhBkes_5AhbP80y-tzFp1Plku1dUSO6O64lrLy_CNwbooAOw__8PgoN3ioMjjWGujNkIqKaiiaD3d7cl0us9eQz7j2HthHrDoAf_s7AN9OoOqvv1xQE5FMoNBwF9Q3kHisX0HwBYxrA5iBiqjs-EyJcs7l8GE4OXg7uZr81hgMq8ZQSuwukY_m5EUT-XgKsUe-Qil-DlVyoyUrMzvJ5yuzfMxz6PIe-vmOjz9zWuVNAje_9XSUurAnoY0biLJBjbfeOxnkGXrz"/>
              </div>
              <div>
                <h3 className="font-h2 text-2xl text-on-surface">Elena Belova <span className="text-slate-500 text-sm font-normal">Conversation Log</span></h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-secondary flex items-center gap-1 font-bold tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary cyber-pulse"></span> Agent Engagement Live
                  </span>
                  <span className="text-xs text-slate-500">• 14m ago</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 scrollbar-hide">
              {/* Message 1 */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center border border-indigo-500/20">
                  <span className="material-symbols-outlined text-indigo-400 text-sm">smart_toy</span>
                </div>
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl rounded-tl-none max-w-[80%] shadow-lg">
                  <p className="text-sm text-slate-200 leading-relaxed">Hi Elena! Saw your post about scaling LLM infrastructure. We’ve been helping teams like yours automate the top-of-funnel without losing personalization. Any interest in seeing how we do it?</p>
                </div>
              </motion.div>
              
              {/* Message 2 */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-4 justify-end">
                <div className="bg-surface-container border border-slate-700 p-4 rounded-2xl rounded-tr-none max-w-[80%] shadow-lg">
                  <p className="text-sm text-slate-200 leading-relaxed">Hey. Actually yes, we are struggling with volume on LinkedIn specifically. Does your tool handle BANT qualification or just messaging?</p>
                </div>
                <div className="flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden border border-slate-700">
                  <img alt="User" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwPTxwtyyeVo3rn7p_au3nRku78gxoOq0jbFWw0HlsB8seM5qj5XmY-9BzugHSw-zyxr8iVTnhLhHFKPcvXYAxVgP3MdtlTBGiNPg-NE0hv6jAfT5rIpYIFLlOmfCM-_59kKYZiCgccLoYUAAYcY8uwV58sWDXXZ_2fUMEYUZPjpVxCy-gXfPrNsdnaLq8EDCCg5tDXwGOkPBMxXqwRILhEuGvteW84ShuOVf_8RO6fT7cHz_ig2DCXiTLj53aG8eilh_e_tB2crmT"/>
                </div>
              </motion.div>
              
              {/* Message 3 */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center border border-indigo-500/20">
                  <span className="material-symbols-outlined text-indigo-400 text-sm">smart_toy</span>
                </div>
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl rounded-tl-none max-w-[80%] shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-20"></div>
                  <p className="text-sm text-slate-200 text-indigo-200 italic mb-3 font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs animate-spin">sync</span>
                    Thinking... Executing Qualification Script v2.4
                  </p>
                  <p className="text-sm text-slate-200 leading-relaxed">Precisely. I've analyzed your current growth trajectory. Based on your scale, Fourdoor would automate the initial 4 touchpoints. Would you say your current budget for this quarter is focused more on tooling or headcount?</p>
                </div>
              </motion.div>
            </div>
          </div>
          
          <div className="col-span-12 md:col-span-4 p-8 bg-slate-900/40 flex flex-col justify-between">
            <div>
              <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-6 tracking-[0.2em] font-bold">Qualification Logic</h3>
              <div className="space-y-6">
                <div className="p-4 rounded-xl border border-secondary/20 bg-secondary/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 to-transparent"></div>
                  <div className="relative z-10 flex justify-between items-center mb-4 border-b border-secondary/10 pb-3">
                    <span className="text-xs font-bold text-secondary uppercase tracking-widest">BANT ANALYSIS</span>
                    <span className="text-xs font-data-point text-secondary font-bold">78/100</span>
                  </div>
                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-300 font-medium">Budget</span>
                      <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-300 font-medium">Authority</span>
                      <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-300 font-medium">Need</span>
                      <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                    </div>
                    <div className="flex items-center justify-between opacity-50">
                      <span className="text-xs text-slate-400 font-medium">Timeline</span>
                      <span className="material-symbols-outlined text-slate-500 text-sm">radio_button_unchecked</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Agent Reasoning</h4>
                  <p className="text-xs text-slate-300 leading-relaxed bg-surface-container-low p-4 rounded-lg border border-slate-800 shadow-inner italic">
                    "Elena has confirmed both Budget and Need. Authority is high given CTO title. Timeline remains ambiguous. Suggesting immediate Calendly hand-off to bridge the timeline gap."
                  </p>
                </div>
              </div>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCall}
              disabled={isCalling}
              className="w-full py-4 mt-8 rounded-xl pro-gradient text-white font-bold text-sm shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {isCalling ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                  Connecting to Elena...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">bolt</span>
                  Override & Call Elena
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
