import React from 'react';

export default function AnalyticsStrategicInsights() {
  return (
    <>
      
{/* TopAppBar */}
<header className="bg-[#09090B]/80 backdrop-blur-md border-b border-[#27272A] docked full-width top-0 z-50 flex justify-between items-center px-6 h-16 w-full sticky">
<div className="flex items-center gap-4">
<div className="flex items-center gap-2 px-3 py-1.5 bg-[#18181B] rounded-full border border-[#27272A]">
<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
<span className="text-xs font-medium text-slate-300 font-inter">Agent Health: Active</span>
</div>
</div>
<div className="flex items-center gap-6">
<div className="flex items-center gap-1.5 text-slate-400 hover:text-[#0066FF] cursor-pointer transition-colors">
<span className="material-symbols-outlined text-xl">sensors</span>
<span className="text-xs font-medium">Live Feed</span>
</div>
<div className="relative">
<span className="material-symbols-outlined text-slate-400 hover:text-slate-50 cursor-pointer text-xl">notifications</span>
<span className="absolute -top-1 -right-1 w-2 h-2 bg-[#0066FF] rounded-full border border-[#09090B]"></span>
</div>
<span className="material-symbols-outlined text-slate-400 hover:text-slate-50 cursor-pointer text-2xl">account_circle</span>
</div>
</header>
{/* Content Canvas */}
<div className="p-margin max-w-container-max mx-auto w-full space-y-stack-lg">
{/* Hero Grid: Analytics & Advisory */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
{/* Lead Velocity Index */}
<div className="lg:col-span-8 glass-card rounded-xl p-stack-md flex flex-col">
<div className="flex justify-between items-center mb-stack-md">
<div>
<h3 className="text-h2 font-h2 text-slate-50">Lead Velocity Index</h3>
<p className="text-body-sm text-slate-500">Aggregated lead growth trajectories</p>
</div>
<div className="flex bg-[#09090B] p-1 rounded-lg border border-[#27272A]">
<button className="px-3 py-1 text-xs font-semibold text-slate-400 hover:text-slate-50">7D</button>
<button className="px-3 py-1 text-xs font-bold bg-[#18181B] text-[#0066FF] rounded shadow-sm">30D</button>
<button className="px-3 py-1 text-xs font-semibold text-slate-400 hover:text-slate-50">90D</button>
</div>
</div>
<div className="flex-1 min-h-[320px] relative mt-4">
<img className="w-full h-full object-cover rounded-lg opacity-80" data-alt="A sophisticated data visualization dashboard showing a complex area chart with vibrant electric blue lines against a dark charcoal background. The chart features glowing data points and subtle grid lines, suggesting high-frequency data processing and financial growth. The aesthetic is ultra-modern, clean, and high-density with a professional technological feel." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcpzZb7ew4fJBoMAZ6_TsP3sqFHthdIy4Kwn2UkIFuCm8viPQY1mzBZeML_GzEqH-dXt_KIervcvf5v_BIxANBkjwhQqowS2OPCwybvQ85oO-KIb5atLHYIrL9wftx8XYF0b2er3yqdOAL48geC3FBOaLQtYK4uV3Wi04S_ugej0l8zoXunisbdCJcWp6tu4XAQrkLF-cuSBY0MMbVkwnXF87-nKTdnoac99wSoiUc_xGxiaHH-CGbxkLe6CGr7_BC9nLdTuC1bo6k"/>
<div className="absolute inset-0 chart-gradient rounded-lg pointer-events-none"></div>
</div>
</div>
{/* Platform Delta */}
<div className="lg:col-span-4 glass-card rounded-xl p-stack-md">
<h3 className="text-h2 font-h2 text-slate-50 mb-stack-md">Platform Delta</h3>
<div className="space-y-stack-md mt-6">
<div className="space-y-2">
<div className="flex justify-between text-xs font-semibold uppercase tracking-widest text-slate-500">
<span>LinkedIn</span>
<span className="text-emerald-400">+18%</span>
</div>
<div className="h-10 w-full bg-[#09090B] rounded-sm overflow-hidden flex items-center">
<div className="h-full bg-primary-container" style={{ width: '85%' }}></div>
</div>
</div>
<div className="space-y-2">
<div className="flex justify-between text-xs font-semibold uppercase tracking-widest text-slate-500">
<span>YouTube</span>
<span className="text-emerald-400">+4.2%</span>
</div>
<div className="h-10 w-full bg-[#09090B] rounded-sm overflow-hidden flex items-center">
<div className="h-full bg-primary-container opacity-60" style={{ width: '55%' }}></div>
</div>
</div>
<div className="space-y-2">
<div className="flex justify-between text-xs font-semibold uppercase tracking-widest text-slate-500">
<span>Organic Web</span>
<span className="text-error-container text-error">-2.1%</span>
</div>
<div className="h-10 w-full bg-[#09090B] rounded-sm overflow-hidden flex items-center">
<div className="h-full bg-surface-container-high" style={{ width: '35%' }}></div>
</div>
</div>
</div>
<div className="mt-stack-lg p-stack-sm bg-primary-container/10 border border-primary-container/20 rounded-lg">
<p className="text-xs text-primary font-medium leading-relaxed italic">
                            "LinkedIn performance is at a 6-month high. Strategic pivot recommended for organic web optimization."
                        </p>
</div>
</div>
</div>
{/* Agent Strategic Advisory */}
<section className="space-y-stack-md">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary" data-weight="fill">auto_awesome</span>
<h2 className="text-h1 font-h1 text-slate-50">Agent Strategic Advisory</h2>
<span className="px-2 py-0.5 bg-error-container text-on-error-container text-[10px] font-bold rounded uppercase">High Priority</span>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
{/* Advisory Card 1 */}
<div className="glass-card rounded-xl p-stack-md relative overflow-hidden group">
<div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
<span className="material-symbols-outlined text-6xl">movie</span>
</div>
<h4 className="text-body-lg font-bold text-slate-50 mb-2">Video Optimization</h4>
<p className="text-body-sm text-slate-400 mb-6">"Double down on LinkedIn video content. Engagement is 4.2x higher than static images in current cohort."</p>
<button className="w-full py-2 bg-[#18181B] hover:bg-[#0066FF] border border-[#27272A] hover:border-transparent rounded-lg text-xs font-bold transition-all duration-200">
                            Apply Optimization
                        </button>
</div>
{/* Advisory Card 2 */}
<div className="glass-card rounded-xl p-stack-md relative overflow-hidden group">
<div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
<span className="material-symbols-outlined text-6xl">trending_up</span>
</div>
<h4 className="text-body-lg font-bold text-slate-50 mb-2">Audience Shift</h4>
<p className="text-body-sm text-slate-400 mb-6">"Re-allocate 15% of Meta budget to X (Twitter) technical threads based on high-intent lead signals."</p>
<button className="w-full py-2 bg-[#18181B] hover:bg-[#0066FF] border border-[#27272A] hover:border-transparent rounded-lg text-xs font-bold transition-all duration-200">
                            Adjust Budgets
                        </button>
</div>
{/* Advisory Card 3 */}
<div className="glass-card rounded-xl p-stack-md relative overflow-hidden group">
<div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
<span className="material-symbols-outlined text-6xl">bolt</span>
</div>
<h4 className="text-body-lg font-bold text-slate-50 mb-2">Response Speed</h4>
<p className="text-body-sm text-slate-400 mb-6">"Direct response rate is dropping. Enable AI Auto-Nurture for South-East Asia (GMT+8) active hours."</p>
<button className="w-full py-2 bg-primary-container text-on-primary-container rounded-lg text-xs font-bold transition-all duration-200 hover:opacity-90">
                            Enable Auto-Nurture
                        </button>
</div>
</div>
</section>
{/* Campaign Performance Cluster */}
<section className="glass-card rounded-xl overflow-hidden">
<div className="p-stack-md border-b border-[#27272A] flex justify-between items-center">
<h3 className="text-h2 font-h2 text-slate-50">Campaign Performance Cluster</h3>
<div className="flex gap-2">
<div className="px-3 py-1.5 bg-[#09090B] border border-[#27272A] rounded flex items-center gap-2 cursor-pointer hover:bg-[#18181B]">
<span className="material-symbols-outlined text-sm">filter_list</span>
<span className="text-xs font-semibold text-slate-400">Filter</span>
</div>
<div className="px-3 py-1.5 bg-[#09090B] border border-[#27272A] rounded flex items-center gap-2 cursor-pointer hover:bg-[#18181B]">
<span className="material-symbols-outlined text-sm">download</span>
<span className="text-xs font-semibold text-slate-400">Export</span>
</div>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-[#09090B]/50 text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-[#27272A]">
<th className="px-6 py-4">Source Campaign</th>
<th className="px-6 py-4">Impression Weight</th>
<th className="px-6 py-4">Conversion %</th>
<th className="px-6 py-4">Cost/Lead</th>
<th className="px-6 py-4">Status</th>
<th className="px-6 py-4 text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-[#27272A]">
<tr className="hover:bg-[#18181B]/50 transition-colors">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center border border-outline-variant">
<span className="material-symbols-outlined text-primary text-sm">rocket_launch</span>
</div>
<div>
<p className="text-sm font-bold text-slate-50">Q4 Enterprise Scale</p>
<p className="text-[10px] text-slate-500">Multi-Channel</p>
</div>
</div>
</td>
<td className="px-6 py-4 text-sm font-mono text-slate-300">1.2M</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2">
<span className="text-sm font-bold text-emerald-400">4.82%</span>
<span className="material-symbols-outlined text-xs text-emerald-500">arrow_upward</span>
</div>
</td>
<td className="px-6 py-4 text-sm font-mono text-slate-300">$12.40</td>
<td className="px-6 py-4">
<span className="px-2 py-1 bg-primary-container/20 text-primary text-[10px] font-bold rounded uppercase border border-primary-container/30">Scaling</span>
</td>
<td className="px-6 py-4 text-right">
<span className="material-symbols-outlined text-slate-500 hover:text-slate-50 cursor-pointer">more_horiz</span>
</td>
</tr>
<tr className="hover:bg-[#18181B]/50 transition-colors">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center border border-outline-variant">
<span className="material-symbols-outlined text-primary text-sm">video_library</span>
</div>
<div>
<p className="text-sm font-bold text-slate-50">Video Retargeting B</p>
<p className="text-[10px] text-slate-500">YouTube</p>
</div>
</div>
</td>
<td className="px-6 py-4 text-sm font-mono text-slate-300">840K</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2">
<span className="text-sm font-bold text-slate-50">2.15%</span>
<span className="material-symbols-outlined text-xs text-slate-500">horizontal_rule</span>
</div>
</td>
<td className="px-6 py-4 text-sm font-mono text-slate-300">$28.10</td>
<td className="px-6 py-4">
<span className="px-2 py-1 bg-[#27272A] text-slate-400 text-[10px] font-bold rounded uppercase">Active</span>
</td>
<td className="px-6 py-4 text-right">
<span className="material-symbols-outlined text-slate-500 hover:text-slate-50 cursor-pointer">more_horiz</span>
</td>
</tr>
<tr className="hover:bg-[#18181B]/50 transition-colors">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center border border-outline-variant">
<span className="material-symbols-outlined text-primary text-sm">podcasts</span>
</div>
<div>
<p className="text-sm font-bold text-slate-50">Legacy Search Arch</p>
<p className="text-[10px] text-slate-500">Google Ads</p>
</div>
</div>
</td>
<td className="px-6 py-4 text-sm font-mono text-slate-300">120K</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2">
<span className="text-sm font-bold text-error">0.85%</span>
<span className="material-symbols-outlined text-xs text-error">arrow_downward</span>
</div>
</td>
<td className="px-6 py-4 text-sm font-mono text-slate-300">$64.20</td>
<td className="px-6 py-4">
<span className="px-2 py-1 bg-surface-container-high text-slate-500 text-[10px] font-bold rounded uppercase">Paused</span>
</td>
<td className="px-6 py-4 text-right">
<span className="material-symbols-outlined text-slate-500 hover:text-slate-50 cursor-pointer">more_horiz</span>
</td>
</tr>
</tbody>
</table>
</div>
</section>
{/* Footer KPIs */}
<footer className="grid grid-cols-1 md:grid-cols-3 gap-gutter pt-stack-lg pb-stack-lg">
<div className="p-stack-md bg-[#18181B] border border-[#27272A] rounded-xl flex items-center justify-between">
<div>
<p className="text-label-caps text-slate-500 uppercase">Growth Integrity</p>
<p className="text-h1 font-h1 text-slate-50">98.4%</p>
</div>
<div className="w-12 h-12 rounded-full border-4 border-primary-container border-r-transparent rotate-45"></div>
</div>
<div className="p-stack-md bg-[#18181B] border border-[#27272A] rounded-xl flex items-center justify-between">
<div>
<p className="text-label-caps text-slate-500 uppercase">Cycle Velocity</p>
<p className="text-h1 font-h1 text-slate-50">2.4 Days</p>
</div>
<span className="material-symbols-outlined text-primary text-3xl">speed</span>
</div>
<div className="p-stack-md bg-[#18181B] border border-[#27272A] rounded-xl flex items-center justify-between">
<div>
<p className="text-label-caps text-slate-500 uppercase">Projected LTV</p>
<p className="text-h1 font-h1 text-slate-50">$4,280</p>
</div>
<span className="material-symbols-outlined text-primary text-3xl">payments</span>
</div>
</footer>
</div>

    </>
  );
}
