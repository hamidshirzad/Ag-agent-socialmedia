import React from 'react';

export default function AnalyticsInsights2() {
  return (
    <>
      
{/* Welcome Header */}
<section>
<h1 className="font-h1 text-h1 text-on-surface">Analytics</h1>
<p className="font-body-sm text-on-surface-variant">Real-time growth performance</p>
</section>
{/* Metrics Grid */}
<section className="grid grid-cols-2 gap-3">
<div className="glass-card p-4 rounded-xl">
<div className="flex items-center gap-2 mb-1">
<span className="material-symbols-outlined text-primary text-sm" data-icon="trending_up">trending_up</span>
<span className="font-label-caps text-label-caps text-on-surface-variant uppercase">LTV Prediction</span>
</div>
<div className="font-h2 text-h2 text-on-surface">$2,840</div>
<div className="text-[10px] text-primary flex items-center gap-1 font-bold">+12.4% vs LW</div>
</div>
<div className="glass-card p-4 rounded-xl">
<div className="flex items-center gap-2 mb-1">
<span className="material-symbols-outlined text-tertiary text-sm" data-icon="bolt">bolt</span>
<span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Burn Rate</span>
</div>
<div className="font-h2 text-h2 text-on-surface">14.2%</div>
<div className="text-[10px] text-on-surface-variant flex items-center gap-1 font-bold">Stable</div>
</div>
</section>
{/* Lead Velocity Chart */}
<section className="glass-card p-5 rounded-xl">
<div className="flex justify-between items-center mb-6">
<div>
<h3 className="font-body-md font-bold text-on-surface">Lead Velocity</h3>
<p className="text-[10px] text-on-surface-variant uppercase tracking-widest">7-Day Aggregation</p>
</div>
<span className="material-symbols-outlined text-on-surface-variant" data-icon="more_vert">more_vert</span>
</div>
<div className="flex items-end justify-between h-32 gap-2 px-1">
<div className="flex flex-col items-center gap-2 flex-1">
<div className="w-full bg-[#18181B] rounded-t-sm h-12 relative overflow-hidden group">
<div className="absolute bottom-0 w-full bg-primary-container opacity-40 h-full"></div>
</div>
<span className="text-[10px] font-mono text-on-surface-variant uppercase">Mon</span>
</div>
<div className="flex flex-col items-center gap-2 flex-1">
<div className="w-full bg-[#18181B] rounded-t-sm h-20 relative overflow-hidden">
<div className="absolute bottom-0 w-full bg-primary-container opacity-50 h-full"></div>
</div>
<span className="text-[10px] font-mono text-on-surface-variant uppercase">Tue</span>
</div>
<div className="flex flex-col items-center gap-2 flex-1">
<div className="w-full bg-[#18181B] rounded-t-sm h-16 relative overflow-hidden">
<div className="absolute bottom-0 w-full bg-primary-container opacity-60 h-full"></div>
</div>
<span className="text-[10px] font-mono text-on-surface-variant uppercase">Wed</span>
</div>
<div className="flex flex-col items-center gap-2 flex-1">
<div className="w-full bg-[#18181B] rounded-t-sm h-24 relative overflow-hidden">
<div className="absolute bottom-0 w-full bg-primary-container h-full"></div>
</div>
<span className="text-[10px] font-mono text-on-surface-variant uppercase">Thu</span>
</div>
<div className="flex flex-col items-center gap-2 flex-1">
<div className="w-full bg-[#18181B] rounded-t-sm h-14 relative overflow-hidden">
<div className="absolute bottom-0 w-full bg-primary-container opacity-70 h-full"></div>
</div>
<span className="text-[10px] font-mono text-on-surface-variant uppercase">Fri</span>
</div>
<div className="flex flex-col items-center gap-2 flex-1">
<div className="w-full bg-[#18181B] rounded-t-sm h-28 relative overflow-hidden">
<div className="absolute bottom-0 w-full bg-primary-container h-full"></div>
</div>
<span className="text-[10px] font-mono text-on-surface-variant uppercase">Sat</span>
</div>
<div className="flex flex-col items-center gap-2 flex-1">
<div className="w-full bg-[#18181B] rounded-t-sm h-10 relative overflow-hidden">
<div className="absolute bottom-0 w-full bg-primary-container opacity-30 h-full"></div>
</div>
<span className="text-[10px] font-mono text-on-surface-variant uppercase">Sun</span>
</div>
</div>
</section>
{/* Strategic Advisory */}
<section className="space-y-4">
<div className="flex items-center justify-between">
<h3 className="font-body-md font-bold text-on-surface">Strategic Advisory</h3>
<span className="px-2 py-0.5 bg-primary-container/10 border border-primary-container/30 text-primary text-[10px] rounded-full font-bold">2 NEW</span>
</div>
{/* Card 1: Video Optimization */}
<div className="glass-card rounded-xl overflow-hidden group">
<div className="h-32 w-full relative">
<img className="w-full h-full object-cover opacity-60" data-alt="A futuristic digital interface showing high-speed motion graphics and neon light trails in a deep space setting. The scene represents video optimization with advanced AI patterns and data flows. The colors are dominated by Electric Blue and deep blacks with a cinematic, technical lighting mood." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3K-Il_sx077TDMpN78ARlBJ0JYDu9JsKqZF1NO6E08Y8xonhXQGAZC4fmnHkwh9j8BO-VyZT4iYRuyw5je01q784PWVid24tC2LjxsYoP0KI8DZxLbuu_FrT25CGbjuq_MmHuqA5SdIv4KFi7BmwZnnkfK1EX3MwJGURkCApcFDvmqivVnLjeI-v3RwFwimyBxFaYLcySklX-iNRR29NelqqgDtV_JxOyvy52P5oAZoX_l7J25Ls3ysGM24jVEAKYD1hgb5KA3mgH"/>
<div className="absolute inset-0 bg-gradient-to-t from-[#18181B] to-transparent"></div>
<div className="absolute top-4 left-4">
<div className="flex items-center gap-2 px-2 py-1 bg-surface-container-highest/80 backdrop-blur rounded-lg border border-outline-variant">
<span className="material-symbols-outlined text-primary text-sm" data-icon="videocam">videocam</span>
<span className="text-[10px] font-bold text-on-surface">AI Recommendation</span>
</div>
</div>
</div>
<div className="p-4 space-y-3">
<div>
<h4 className="font-body-md font-bold text-on-surface">Video Optimization</h4>
<p className="font-body-sm text-on-surface-variant">Switch hooks on 'Campaign Alpha' to 3s motion graphics for 14% higher retention.</p>
</div>
<button className="w-full py-3 bg-primary-container text-on-primary-container rounded-lg font-bold text-sm active:opacity-80 active:scale-[0.98] transition-all">
                        Execute
                    </button>
</div>
</div>
{/* Card 2: Audience Shift */}
<div className="glass-card rounded-xl overflow-hidden group">
<div className="h-32 w-full relative">
<img className="w-full h-full object-cover opacity-60" data-alt="A network graph visualization showing glowing nodes connecting in a complex web of data against a dark background. The lighting is focused on key hubs of activity in a vibrant electric blue. The aesthetic is clean, technical, and analytical, suggesting an intelligent audience shifting strategy within a pro growth marketing environment." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpNuM1ncJzX3AfSytoNQnrI7-67VmtPs72Q_Rp5TtxRfSJzngxrd1gSXa8uAYm_mufw77sQ7zBaOkiJJBAFJgT3623aSJSz6NgBXvp_XwS42VVCdiLnZP6kqnfpozfwpDQULVdl36q6cng-1fpVzYHM9vfbb4XOJw8qugcaQQ3DWiwNdFQ76_JnnGesC9g02MN7a2AjjV6nsyoEUVnfru_-zZ_ICvNb4N9NW12-EU9VxUKV5snubK4EPwSkmbLYLSNUzneggKkwzzD"/>
<div className="absolute inset-0 bg-gradient-to-t from-[#18181B] to-transparent"></div>
<div className="absolute top-4 left-4">
<div className="flex items-center gap-2 px-2 py-1 bg-surface-container-highest/80 backdrop-blur rounded-lg border border-outline-variant">
<span className="material-symbols-outlined text-tertiary text-sm" data-icon="groups">groups</span>
<span className="text-[10px] font-bold text-on-surface">Strategic Shift</span>
</div>
</div>
</div>
<div className="p-4 space-y-3">
<div>
<h4 className="font-body-md font-bold text-on-surface">Audience Shift</h4>
<p className="font-body-sm text-on-surface-variant">Reallocate $4.5k to 'High-Intent Lookalikes' based on recent conversion spikes.</p>
</div>
<button className="w-full py-3 bg-primary-container text-on-primary-container rounded-lg font-bold text-sm active:opacity-80 active:scale-[0.98] transition-all">
                        Execute
                    </button>
</div>
</div>
</section>

    </>
  );
}
