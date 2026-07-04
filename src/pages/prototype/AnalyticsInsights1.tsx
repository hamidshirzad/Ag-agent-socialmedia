import React from 'react';

export default function AnalyticsInsights1() {
  return (
    <>
      
<div className="max-w-[1440px] mx-auto space-y-stack-md">
{/* Page Header */}
<div className="flex items-end justify-between mb-stack-lg">
<div className="space-y-1">
<h2 className="font-h1 text-h1 text-on-surface tracking-tight">Analytics &amp; Strategic Insights</h2>
<p className="text-zinc-500 font-body-md">Autonomous evaluation of your growth trajectory and platform resonance.</p>
</div>
<div className="flex gap-stack-sm">
<button className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">Export Report</button>
<button className="px-4 py-2 bg-primary-container text-white rounded-lg text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-primary-container/20">Generate Forecast</button>
</div>
</div>
{/* Bento Grid Section */}
<div className="grid grid-cols-12 gap-gutter">
{/* Lead Growth Chart */}
<div className="col-span-8 bg-zinc-900/30 border border-zinc-800/60 rounded-xl p-6 backdrop-blur-sm">
<div className="flex items-center justify-between mb-8">
<div>
<h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider mb-1">Lead Velocity Index</h3>
<p className="text-2xl font-black text-on-surface tracking-tighter">14,284 <span className="text-sm font-mono text-emerald-400 ml-2">+12.4%</span></p>
</div>
<div className="flex gap-2">
<button className="px-3 py-1 text-[11px] font-bold bg-zinc-800 text-zinc-300 rounded">7D</button>
<button className="px-3 py-1 text-[11px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors">30D</button>
<button className="px-3 py-1 text-[11px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors">90D</button>
</div>
</div>
{/* Mock Chart Visualization */}
<div className="h-[280px] w-full flex items-end gap-1 px-2">
<div className="flex-1 bg-zinc-800/50 rounded-t h-[30%] hover:bg-primary-container/40 transition-all relative group"><div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-zinc-950 px-2 py-1 rounded text-[10px] font-mono border border-zinc-800">4.2k</div></div>
<div className="flex-1 bg-zinc-800/50 rounded-t h-[45%] hover:bg-primary-container/40 transition-all relative group"></div>
<div className="flex-1 bg-zinc-800/50 rounded-t h-[42%] hover:bg-primary-container/40 transition-all relative group"></div>
<div className="flex-1 bg-zinc-800/50 rounded-t h-[58%] hover:bg-primary-container/40 transition-all relative group"></div>
<div className="flex-1 bg-zinc-800/50 rounded-t h-[65%] hover:bg-primary-container/40 transition-all relative group"></div>
<div className="flex-1 bg-zinc-800/50 rounded-t h-[52%] hover:bg-primary-container/40 transition-all relative group"></div>
<div className="flex-1 bg-zinc-800/50 rounded-t h-[75%] hover:bg-primary-container/40 transition-all relative group"></div>
<div className="flex-1 bg-zinc-800/50 rounded-t h-[82%] hover:bg-primary-container/40 transition-all relative group"></div>
<div className="flex-1 bg-zinc-800/50 rounded-t h-[78%] hover:bg-primary-container/40 transition-all relative group"></div>
<div className="flex-1 bg-zinc-800/50 rounded-t h-[92%] hover:bg-primary-container/40 transition-all relative group"></div>
<div className="flex-1 bg-primary-container/60 rounded-t h-[98%] hover:bg-primary-container transition-all relative group">
<div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-950 px-2 py-1 rounded text-[10px] font-mono border border-zinc-800 text-white">14.2k</div>
</div>
</div>
</div>
{/* Content Resonance Widget */}
<div className="col-span-4 flex flex-col gap-gutter">
<div className="flex-1 bg-zinc-900/30 border border-zinc-800/60 rounded-xl p-6 relative overflow-hidden group">
<div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent"></div>
<h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Platform Delta</h3>
<div className="space-y-4 relative">
<div className="flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-zinc-100">
<span className="material-symbols-outlined text-sm">alternate_email</span>
</div>
<span className="text-sm font-medium">LinkedIn</span>
</div>
<span className="text-sm font-mono text-emerald-400">+18%</span>
</div>
<div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
<div className="bg-primary-container h-full w-[82%] rounded-full shadow-[0_0_10px_rgba(0,102,255,0.4)]"></div>
</div>
<div className="flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-zinc-100">
<span className="material-symbols-outlined text-sm">movie</span>
</div>
<span className="text-sm font-medium">YouTube</span>
</div>
<span className="text-sm font-mono text-amber-400">+4.2%</span>
</div>
<div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
<div className="bg-zinc-500 h-full w-[64%] rounded-full"></div>
</div>
<div className="flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-zinc-100">
<span className="material-symbols-outlined text-sm">language</span>
</div>
<span className="text-sm font-medium">Organic Web</span>
</div>
<span className="text-sm font-mono text-zinc-500">-2.1%</span>
</div>
<div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
<div className="bg-zinc-700 h-full w-[45%] rounded-full"></div>
</div>
</div>
</div>
</div>
{/* AI Recommendations Section (Wide Glass Card) */}
<div className="col-span-12 bg-zinc-950 border border-[#0066FF]/30 rounded-xl p-8 relative overflow-hidden">
<div className="absolute -right-20 -top-20 w-64 h-64 bg-[#0066FF]/10 blur-[100px] rounded-full"></div>
<div className="flex items-start gap-8 relative z-10">
<div className="shrink-0 w-16 h-16 bg-[#0066FF]/20 rounded-2xl flex items-center justify-center border border-[#0066FF]/40">
<span className="material-symbols-outlined text-[#0066FF] text-3xl" data-weight="fill">psychology</span>
</div>
<div className="flex-1">
<div className="flex items-center gap-2 mb-2">
<h4 className="font-h2 text-h2 text-on-surface">Agent Strategic Advisory</h4>
<span className="px-2 py-0.5 bg-[#0066FF]/20 text-[#0066FF] text-[10px] font-black uppercase tracking-widest rounded border border-[#0066FF]/20">High Priority</span>
</div>
<p className="text-zinc-400 font-body-md max-w-3xl mb-6">Based on the last 72 hours of cross-platform interaction data, your current engagement density suggests a pivot in your distribution strategy. Early adopters are resonating with technical deep-dives over high-level summaries.</p>
<div className="grid grid-cols-3 gap-gutter">
<div className="p-4 bg-zinc-900/60 rounded-lg border border-zinc-800 hover:border-[#0066FF]/50 transition-all cursor-pointer group">
<div className="flex items-center gap-2 mb-3">
<span className="material-symbols-outlined text-sm text-[#0066FF]">bolt</span>
<span className="text-xs font-bold text-zinc-100 uppercase tracking-wider">Video Optimization</span>
</div>
<p className="text-sm text-zinc-300 leading-relaxed mb-4">"Double down on <span className="text-white font-semibold">LinkedIn video content</span>. Engagement is 4.2x higher on clips over 45 seconds."</p>
<button className="text-[11px] font-black text-[#0066FF] uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        Execute Task <span className="material-symbols-outlined text-xs">chevron_right</span>
</button>
</div>
<div className="p-4 bg-zinc-900/60 rounded-lg border border-zinc-800 hover:border-[#0066FF]/50 transition-all cursor-pointer group">
<div className="flex items-center gap-2 mb-3">
<span className="material-symbols-outlined text-sm text-[#0066FF]">target</span>
<span className="text-xs font-bold text-zinc-100 uppercase tracking-wider">Audience Shift</span>
</div>
<p className="text-sm text-zinc-300 leading-relaxed mb-4">"Re-allocate <span className="text-white font-semibold">15% of Meta budget</span> to X (Twitter) technical threads to capture developer leads."</p>
<button className="text-[11px] font-black text-[#0066FF] uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        Adjust Spend <span className="material-symbols-outlined text-xs">chevron_right</span>
</button>
</div>
<div className="p-4 bg-zinc-900/60 rounded-lg border border-zinc-800 hover:border-[#0066FF]/50 transition-all cursor-pointer group">
<div className="flex items-center gap-2 mb-3">
<span className="material-symbols-outlined text-sm text-[#0066FF]">chat_bubble</span>
<span className="text-xs font-bold text-zinc-100 uppercase tracking-wider">Response Speed</span>
</div>
<p className="text-sm text-zinc-300 leading-relaxed mb-4">"Direct response rate is dropping. <span className="text-white font-semibold">Enable AI Auto-Nurture</span> for leads from South-East Asia."</p>
<button className="text-[11px] font-black text-[#0066FF] uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        Enable Agent <span className="material-symbols-outlined text-xs">chevron_right</span>
</button>
</div>
</div>
</div>
</div>
</div>
{/* Detailed Metrics Table/List */}
<div className="col-span-12 bg-zinc-900/30 border border-zinc-800/60 rounded-xl overflow-hidden">
<div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
<h3 className="text-xs font-bold text-zinc-200 uppercase tracking-[0.2em]">Campaign Performance Cluster</h3>
<span className="text-[10px] font-mono text-zinc-500">LAST UPDATED: 2 MINS AGO</span>
</div>
<table className="w-full text-left">
<thead className="bg-zinc-900/50">
<tr>
<th className="px-6 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Source Campaign</th>
<th className="px-6 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Impression Weight</th>
<th className="px-6 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Conversion %</th>
<th className="px-6 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Cost/Lead</th>
<th className="px-6 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Status</th>
</tr>
</thead>
<tbody className="divide-y divide-zinc-800/50">
<tr className="hover:bg-zinc-800/20 transition-colors">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-2 h-2 rounded-full bg-blue-500"></div>
<div>
<div className="text-sm font-semibold text-zinc-100">Q4 Strategic Alpha</div>
<div className="text-[10px] font-mono text-zinc-500">ID: CAM-992-X</div>
</div>
</div>
</td>
<td className="px-6 py-4 text-center font-mono text-xs text-zinc-300">1.2M</td>
<td className="px-6 py-4 text-center font-mono text-xs text-emerald-400">4.82%</td>
<td className="px-6 py-4 text-center font-mono text-xs text-zinc-300">$12.40</td>
<td className="px-6 py-4 text-right">
<span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold uppercase rounded border border-emerald-500/20">Scaling</span>
</td>
</tr>
<tr className="hover:bg-zinc-800/20 transition-colors">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-2 h-2 rounded-full bg-purple-500"></div>
<div>
<div className="text-sm font-semibold text-zinc-100">AI Product Teaser</div>
<div className="text-[10px] font-mono text-zinc-500">ID: CAM-104-Y</div>
</div>
</div>
</td>
<td className="px-6 py-4 text-center font-mono text-xs text-zinc-300">842K</td>
<td className="px-6 py-4 text-center font-mono text-xs text-emerald-400">3.10%</td>
<td className="px-6 py-4 text-center font-mono text-xs text-zinc-300">$18.90</td>
<td className="px-6 py-4 text-right">
<span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[9px] font-bold uppercase rounded border border-blue-500/20">Active</span>
</td>
</tr>
<tr className="hover:bg-zinc-800/20 transition-colors">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-2 h-2 rounded-full bg-zinc-600"></div>
<div>
<div className="text-sm font-semibold text-zinc-100">Legacy Content Recycle</div>
<div className="text-[10px] font-mono text-zinc-500">ID: CAM-012-L</div>
</div>
</div>
</td>
<td className="px-6 py-4 text-center font-mono text-xs text-zinc-300">45K</td>
<td className="px-6 py-4 text-center font-mono text-xs text-zinc-500">0.45%</td>
<td className="px-6 py-4 text-center font-mono text-xs text-zinc-300">$42.00</td>
<td className="px-6 py-4 text-right">
<span className="px-2 py-0.5 bg-zinc-800 text-zinc-500 text-[9px] font-bold uppercase rounded border border-zinc-700">Paused</span>
</td>
</tr>
</tbody>
</table>
</div>
</div>
{/* Performance Visualization Footer */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mt-stack-lg">
<div className="bg-zinc-900/20 border border-zinc-800 p-4 rounded-lg flex items-center gap-4">
<div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
<span className="material-symbols-outlined text-emerald-400" data-weight="fill">verified</span>
</div>
<div>
<div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Growth Integrity</div>
<div className="text-lg font-black text-zinc-100">98.4%</div>
</div>
</div>
<div className="bg-zinc-900/20 border border-zinc-800 p-4 rounded-lg flex items-center gap-4">
<div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
<span className="material-symbols-outlined text-blue-400" data-weight="fill">speed</span>
</div>
<div>
<div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Cycle Velocity</div>
<div className="text-lg font-black text-zinc-100">2.4 Days</div>
</div>
</div>
<div className="bg-zinc-900/20 border border-zinc-800 p-4 rounded-lg flex items-center gap-4">
<div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
<span className="material-symbols-outlined text-amber-400" data-weight="fill">trending_up</span>
</div>
<div>
<div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Projected LTV</div>
<div className="text-lg font-black text-zinc-100">$4,280</div>
</div>
</div>
</div>
</div>

    </>
  );
}
