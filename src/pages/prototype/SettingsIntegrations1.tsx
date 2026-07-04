import React from 'react';

export default function SettingsIntegrations1() {
  return (
    <>
      
<div className="max-w-7xl mx-auto space-y-8">
{/* Page Header */}
<div className="flex flex-col gap-2">
<h2 className="font-h1 text-h1 text-on-surface tracking-tight">Settings &amp; Integrations</h2>
<p className="font-body-md text-on-surface-variant max-w-2xl">Configure your autonomous workflow, manage external API connections, and adjust your strategic tier level.</p>
</div>
<div className="grid grid-cols-12 gap-gutter">
{/* Subscription Management (Large Bento Item) */}
<section className="col-span-12 lg:col-span-8 glass-panel p-stack-md rounded-xl space-y-stack-md">
<div className="flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="bg-primary-container p-2 rounded-lg">
<span className="material-symbols-outlined text-on-primary-container" data-icon="verified">verified</span>
</div>
<div>
<h3 className="font-h2 text-h2 text-on-surface">Subscription Management</h3>
<p className="font-body-sm text-on-surface-variant">Manage your computational power and strategic access levels.</p>
</div>
</div>
<span className="bg-primary-container/20 text-primary-fixed border border-primary-container/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Current Tier: Pro</span>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-stack-sm">
{/* Starter */}
<div className="border border-outline-variant p-stack-sm rounded-lg hover:border-primary-fixed-dim transition-colors group cursor-pointer bg-surface-container-low">
<p className="font-label-caps text-label-caps text-on-surface-variant mb-base">STARTER</p>
<p className="font-h2 text-h2 mb-stack-xs">$49<span className="text-sm font-normal text-on-surface-variant">/mo</span></p>
<ul className="text-xs space-y-2 text-on-surface-variant mb-6">
<li className="flex items-center gap-2"><span className="material-symbols-outlined text-[14px] text-primary">check_circle</span> 2 Active Agents</li>
<li className="flex items-center gap-2"><span className="material-symbols-outlined text-[14px] text-primary">check_circle</span> Basic Analytics</li>
<li className="flex items-center gap-2"><span className="material-symbols-outlined text-[14px] text-primary">check_circle</span> Email Support</li>
</ul>
<button className="w-full py-2 text-xs font-bold border border-outline-variant rounded-md group-hover:bg-zinc-800 transition-colors">Downgrade</button>
</div>
{/* Pro */}
<div className="border-2 border-primary-container p-stack-sm rounded-lg relative bg-surface-container shadow-[0_0_20px_rgba(0,102,255,0.15)]">
<div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-container text-white text-[10px] px-3 py-1 rounded-full font-black tracking-widest uppercase">Popular</div>
<p className="font-label-caps text-label-caps text-primary-fixed mb-base">PRO</p>
<p className="font-h2 text-h2 mb-stack-xs">$199<span className="text-sm font-normal text-on-surface-variant">/mo</span></p>
<ul className="text-xs space-y-2 text-on-surface-variant mb-6">
<li className="flex items-center gap-2"><span className="material-symbols-outlined text-[14px] text-primary">check_circle</span> Unlimited Agents</li>
<li className="flex items-center gap-2"><span className="material-symbols-outlined text-[14px] text-primary">check_circle</span> Advanced Predictive AI</li>
<li className="flex items-center gap-2"><span className="material-symbols-outlined text-[14px] text-primary">check_circle</span> Priority Infrastructure</li>
</ul>
<button className="w-full py-2 text-xs font-bold bg-primary-container text-white rounded-md">Manage Plan</button>
</div>
{/* Agency */}
<div className="border border-outline-variant p-stack-sm rounded-lg hover:border-primary-fixed-dim transition-colors group cursor-pointer bg-surface-container-low">
<p className="font-label-caps text-label-caps text-on-surface-variant mb-base">AGENCY</p>
<p className="font-h2 text-h2 mb-stack-xs">$599<span className="text-sm font-normal text-on-surface-variant">/mo</span></p>
<ul className="text-xs space-y-2 text-on-surface-variant mb-6">
<li className="flex items-center gap-2"><span className="material-symbols-outlined text-[14px] text-primary">check_circle</span> Multi-Tenant Shell</li>
<li className="flex items-center gap-2"><span className="material-symbols-outlined text-[14px] text-primary">check_circle</span> White-Label Delivery</li>
<li className="flex items-center gap-2"><span className="material-symbols-outlined text-[14px] text-primary">check_circle</span> API Direct Tunnel</li>
</ul>
<button className="w-full py-2 text-xs font-bold border border-outline-variant rounded-md group-hover:bg-zinc-800 transition-colors">Upgrade</button>
</div>
</div>
</section>
{/* API Integrations (Right Column) */}
<section className="col-span-12 lg:col-span-4 glass-panel p-stack-md rounded-xl space-y-stack-md flex flex-col justify-between">
<div>
<div className="flex items-center gap-3 mb-6">
<div className="bg-secondary-container p-2 rounded-lg">
<span className="material-symbols-outlined text-on-secondary-container" data-icon="sensors">sensors</span>
</div>
<h3 className="font-h2 text-h2 text-on-surface">External API Pipeline</h3>
</div>
<div className="space-y-4">
{/* Anthropic */}
<div className="space-y-2">
<label className="font-label-caps text-label-caps text-on-surface-variant flex items-center justify-between">
                                    ANTHROPIC CLAUDE 3.5
                                    <span className="text-[10px] text-primary uppercase font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> Connected</span>
</label>
<div className="relative group">
<input className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm font-mono text-zinc-400 focus:border-primary-container focus:ring-0 transition-colors" type="password" value="sk-ant-api03-xxxxxxxxxxxxxxxxxxxx"/>
<button className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200">
<span className="material-symbols-outlined text-sm">visibility</span>
</button>
</div>
</div>
{/* Facebook Ads */}
<div className="space-y-2">
<label className="font-label-caps text-label-caps text-on-surface-variant flex items-center justify-between">
                                    FACEBOOK ADS MANAGER
                                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Not Configured</span>
</label>
<button className="w-full bg-white text-black font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-zinc-200 transition-colors">
<span className="material-symbols-outlined text-sm">link</span>
                                    Authenticate via OAuth
                                </button>
</div>
</div>
</div>
<div className="pt-6 border-t border-zinc-800">
<div className="flex items-center gap-2 text-xs text-on-surface-variant">
<span className="material-symbols-outlined text-sm">info</span>
                            Keys are encrypted at rest with AES-256 GCM.
                        </div>
</div>
</section>
{/* Profile & Account Settings (Bottom Left) */}
<section className="col-span-12 lg:col-span-7 glass-panel p-stack-md rounded-xl space-y-stack-md">
<div className="flex items-center gap-3 mb-4">
<div className="bg-surface-container-highest p-2 rounded-lg">
<span className="material-symbols-outlined text-on-surface" data-icon="account_circle">account_circle</span>
</div>
<h3 className="font-h2 text-h2 text-on-surface">Account Profile</h3>
</div>
<div className="grid grid-cols-2 gap-stack-md">
<div className="space-y-4">
<div className="flex items-center gap-4">
<img className="w-16 h-16 rounded-full border-2 border-zinc-700 object-cover" data-alt="A professional high-contrast portrait of a digital growth engineer in a dark studio setting. The lighting is moody and directional, highlighting facial features against a deep black background. The overall aesthetic is minimalist and technical, using a palette of cool grays and deep shadows to convey expertise and strategic authority in a modern tech environment." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1zUfFpX4aEg-NTeSJJHmcEAgV2ZqM5mrvWzRsMDdl4ezSnqUQvee_Nl7k_cybKNCqGBB_2NLlZvKWadmI8meYogNDhpyPC1ww9jKA65OGmNKJ9faAcVZTjshbd9g0azgNYpDRm3jjZyT8cQuLh2h5Pj3cBBtv21-BtA4KNulh0N2SMQHwD-9WkCNk3150UC8junPkyVI7_y3YfCe9QScuy-gcRUyndINxdYH-dBi5t6uG1dsUBSvTnOHqXhgaFpfOyW-DXFSaCiD3"/>
<button className="text-xs font-bold text-primary-fixed border border-primary-container px-3 py-1 rounded hover:bg-primary-container/10">Change Avatar</button>
</div>
<div className="space-y-1">
<p className="font-label-caps text-label-caps text-on-surface-variant">FULL NAME</p>
<input className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:border-primary-container focus:ring-0" type="text" value="Alexander Sterling"/>
</div>
<div className="space-y-1">
<p className="font-label-caps text-label-caps text-on-surface-variant">WORK EMAIL</p>
<input className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:border-primary-container focus:ring-0" type="email" value="alex@sterling-growth.ai"/>
</div>
</div>
<div className="space-y-4">
<div className="space-y-1">
<p className="font-label-caps text-label-caps text-on-surface-variant">STRATEGIC ROLE</p>
<select className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:border-primary-container focus:ring-0 appearance-none">
<option>Growth Engineer</option>
<option>Performance Marketer</option>
<option>Strategic Lead</option>
</select>
</div>
<div className="space-y-1">
<p className="font-label-caps text-label-caps text-on-surface-variant">TIMEZONE</p>
<div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-400 flex items-center justify-between cursor-not-allowed">
                                    UTC -05:00 (EST)
                                    <span className="material-symbols-outlined text-sm">lock</span>
</div>
</div>
<div className="pt-4 flex justify-end">
<button className="bg-primary-container text-white font-bold px-6 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity">Save Profile Changes</button>
</div>
</div>
</div>
</section>
{/* Notifications & Security (Bottom Right) */}
<section className="col-span-12 lg:col-span-5 glass-panel p-stack-md rounded-xl space-y-stack-md">
<div className="flex items-center gap-3">
<div className="bg-surface-container-highest p-2 rounded-lg">
<span className="material-symbols-outlined text-on-surface" data-icon="psychology">psychology</span>
</div>
<h3 className="font-h2 text-h2 text-on-surface">Global Logic Controls</h3>
</div>
<div className="space-y-6">
{/* AI Alert Toggle */}
<div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-lg border border-zinc-800/50">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary" data-icon="auto_awesome">auto_awesome</span>
<div>
<p className="text-sm font-bold">Autonomous Feedback</p>
<p className="text-[10px] text-zinc-500 uppercase font-black">Agent Push Notifications</p>
</div>
</div>
<div className="w-10 h-5 bg-primary-container rounded-full relative cursor-pointer">
<div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
</div>
</div>
{/* Lead Threshold Toggle */}
<div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-lg border border-zinc-800/50">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-zinc-500" data-icon="query_stats">query_stats</span>
<div>
<p className="text-sm font-bold">Performance Deviations</p>
<p className="text-[10px] text-zinc-500 uppercase font-black">Email Anomaly Reports</p>
</div>
</div>
<div className="w-10 h-5 bg-zinc-700 rounded-full relative cursor-pointer">
<div className="absolute left-0.5 top-0.5 w-4 h-4 bg-zinc-400 rounded-full"></div>
</div>
</div>
{/* Security */}
<div className="pt-2">
<p className="font-label-caps text-label-caps text-on-surface-variant mb-3 uppercase font-black tracking-[0.1em]">Security Matrix</p>
<div className="flex flex-col gap-2">
<button className="w-full text-left px-4 py-2 text-xs font-bold border border-zinc-800 rounded-lg flex items-center justify-between hover:bg-zinc-900 transition-colors">
                                    Enable Two-Factor (2FA)
                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
</button>
<button className="w-full text-left px-4 py-2 text-xs font-bold border border-zinc-800 rounded-lg flex items-center justify-between hover:bg-zinc-900 transition-colors">
                                    Audit Authentication Logs
                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
</button>
<button className="w-full text-left px-4 py-2 text-xs font-bold text-red-500/80 border border-red-500/20 rounded-lg flex items-center justify-between hover:bg-red-500/5 transition-colors">
                                    Revoke All Active Sessions
                                    <span className="material-symbols-outlined text-sm">logout</span>
</button>
</div>
</div>
</div>
</section>
</div>
{/* Global Footer Status */}
<footer className="flex items-center justify-between py-stack-md text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
<div>Core Engine: v4.2.0-Alpha</div>
<div className="flex items-center gap-4">
<a className="hover:text-zinc-400" href="#">Security Protocol</a>
<a className="hover:text-zinc-400" href="#">Privacy Architecture</a>
<a className="hover:text-zinc-400" href="#">Support Node</a>
</div>
<div>Node Location: US-East-1 (WDC)</div>
</footer>
</div>

    </>
  );
}
