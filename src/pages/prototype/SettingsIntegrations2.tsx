import React from 'react';

export default function SettingsIntegrations2() {
  return (
    <>
      
<div className="max-w-6xl mx-auto space-y-stack-lg">
{/* Page Header */}
<section className="flex flex-col gap-2 border-b border-zinc-800 pb-8">
<h1 className="font-h1 text-h1 text-on-background">System Settings</h1>
<p className="text-body-md text-on-surface-variant max-w-2xl">Configure your autonomous strategic environment, manage active integrations, and oversee account-level security parameters.</p>
</section>
{/* Bento Layout 01: Subscription & Profile */}
<div className="grid grid-cols-12 gap-gutter">
{/* Account Profile (Left Side) */}
<div className="col-span-12 lg:col-span-5 glass-card p-6 rounded-xl flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-8">
<h2 className="text-h2 font-h2 text-on-surface">Account Profile</h2>
<span className="material-symbols-outlined text-primary" data-icon="manage_accounts">manage_accounts</span>
</div>
<div className="space-y-stack-md">
<div className="group">
<label className="text-label-caps text-outline-variant block mb-2">FULL NAME</label>
<input className="w-full bg-surface-container border border-outline-variant focus:border-primary-container focus:ring-1 focus:ring-primary-container rounded-lg text-on-surface text-body-sm px-4 py-2 transition-all" type="text" value="Alexander Sterling"/>
</div>
<div className="group">
<label className="text-label-caps text-outline-variant block mb-2">WORK EMAIL</label>
<input className="w-full bg-surface-container border border-outline-variant focus:border-primary-container focus:ring-1 focus:ring-primary-container rounded-lg text-on-surface text-body-sm px-4 py-2 transition-all" type="email" value="alex.sterling@fourdoor.ai"/>
</div>
<div className="grid grid-cols-2 gap-4">
<div>
<label className="text-label-caps text-outline-variant block mb-2">TIMEZONE</label>
<select className="w-full bg-surface-container border border-outline-variant focus:border-primary-container focus:ring-1 focus:ring-primary-container rounded-lg text-on-surface text-body-sm px-4 py-2 transition-all appearance-none">
<option>UTC-05:00 (EST)</option>
<option>UTC+00:00 (GMT)</option>
</select>
</div>
<div>
<label className="text-label-caps text-outline-variant block mb-2">STRATEGIC ROLE</label>
<select className="w-full bg-surface-container border border-outline-variant focus:border-primary-container focus:ring-1 focus:ring-primary-container rounded-lg text-on-surface text-body-sm px-4 py-2 transition-all appearance-none">
<option>Growth Engineer</option>
<option>Data Strategist</option>
</select>
</div>
</div>
</div>
</div>
<button className="mt-8 w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-on-surface font-semibold rounded-lg transition-colors text-body-sm">Update Profile Details</button>
</div>
{/* Subscription Management (Right Side - 3 Cards) */}
<div className="col-span-12 lg:col-span-7 space-y-4">
<h2 className="text-label-caps text-outline-variant mb-2">SUBSCRIPTION MANAGEMENT</h2>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
{/* Starter */}
<div className="glass-card p-5 rounded-xl border-zinc-800 hover:border-zinc-700 transition-all flex flex-col">
<p className="text-label-caps text-zinc-500 mb-1">STARTER</p>
<h3 className="text-h2 font-h2 text-on-surface mb-4">€29<span className="text-body-sm font-normal text-zinc-500">/mo</span></h3>
<ul className="text-[12px] space-y-2 text-on-surface-variant flex-1">
<li className="flex items-center gap-2"><span className="material-symbols-outlined text-[14px]" data-icon="check_circle">check_circle</span> 5 Active Pipelines</li>
<li className="flex items-center gap-2"><span className="material-symbols-outlined text-[14px]" data-icon="check_circle">check_circle</span> Basic Analytics</li>
<li className="flex items-center gap-2 text-zinc-600"><span className="material-symbols-outlined text-[14px]" data-icon="cancel">cancel</span> No Autonomous FB</li>
</ul>
<button className="mt-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-on-surface text-xs font-bold rounded-lg transition-all">Downgrade</button>
</div>
{/* Pro (Active) */}
<div className="relative bg-primary-container/10 border-2 border-primary-container p-5 rounded-xl transition-all flex flex-col shadow-[0_0_40px_-15px_rgba(0,102,255,0.3)]">
<div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-container text-[10px] font-black text-white px-3 py-1 rounded-full uppercase tracking-tighter">Current Plan</div>
<p className="text-label-caps text-primary mb-1 mt-2">PRO</p>
<h3 className="text-h2 font-h2 text-on-surface mb-4">€79<span className="text-body-sm font-normal text-zinc-500">/mo</span></h3>
<ul className="text-[12px] space-y-2 text-on-surface flex-1">
<li className="flex items-center gap-2 font-medium"><span className="material-symbols-outlined text-primary text-[14px]" data-icon="check_circle">check_circle</span> Unlimited Pipelines</li>
<li className="flex items-center gap-2 font-medium"><span className="material-symbols-outlined text-primary text-[14px]" data-icon="check_circle">check_circle</span> Autonomous FB Beta</li>
<li className="flex items-center gap-2 font-medium"><span className="material-symbols-outlined text-primary text-[14px]" data-icon="check_circle">check_circle</span> Claude 3.5 Native</li>
</ul>
<button className="mt-4 py-2 bg-primary-container text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-primary-container/20">Manage Billing</button>
</div>
{/* Agency */}
<div className="glass-card p-5 rounded-xl border-zinc-800 hover:border-zinc-700 transition-all flex flex-col">
<p className="text-label-caps text-zinc-500 mb-1">AGENCY</p>
<h3 className="text-h2 font-h2 text-on-surface mb-4">€199<span className="text-body-sm font-normal text-zinc-500">/mo</span></h3>
<ul className="text-[12px] space-y-2 text-on-surface-variant flex-1">
<li className="flex items-center gap-2"><span className="material-symbols-outlined text-[14px]" data-icon="check_circle">check_circle</span> Whitelabel Reports</li>
<li className="flex items-center gap-2"><span className="material-symbols-outlined text-[14px]" data-icon="check_circle">check_circle</span> Multi-seat Access</li>
<li className="flex items-center gap-2"><span className="material-symbols-outlined text-[14px]" data-icon="check_circle">check_circle</span> Priority Support</li>
</ul>
<button className="mt-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-on-surface text-xs font-bold rounded-lg transition-all">Upgrade Now</button>
</div>
</div>
</div>
</div>
{/* Global Logic Controls & Security Matrix Row */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
{/* Global Logic Controls */}
<div className="glass-card p-6 rounded-xl space-y-6">
<div className="flex items-center justify-between">
<h2 className="text-h2 font-h2 text-on-surface">Global Logic Controls</h2>
<span className="material-symbols-outlined text-primary" data-icon="precision_manufacturing">precision_manufacturing</span>
</div>
<div className="space-y-4">
<div className="flex items-center justify-between p-4 bg-zinc-900/40 rounded-lg border border-zinc-800">
<div>
<p className="text-body-sm font-semibold text-on-surface">Autonomous Feedback</p>
<p className="text-xs text-zinc-500">Allow AI to auto-correct low-confidence outputs.</p>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input checked="" className="sr-only peer" type="checkbox"/>
<div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-300 after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
</label>
</div>
<div className="flex items-center justify-between p-4 bg-zinc-900/40 rounded-lg border border-zinc-800">
<div>
<p className="text-body-sm font-semibold text-on-surface">Performance Deviations</p>
<p className="text-xs text-zinc-500">Push notifications for statistical anomalies.</p>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input className="sr-only peer" type="checkbox"/>
<div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-300 after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
</label>
</div>
</div>
</div>
{/* Security Matrix */}
<div className="glass-card p-6 rounded-xl space-y-6">
<div className="flex items-center justify-between">
<h2 className="text-h2 font-h2 text-on-surface">Security Matrix</h2>
<span className="material-symbols-outlined text-primary" data-icon="shield">shield</span>
</div>
<div className="space-y-2">
<a className="flex items-center justify-between p-3 border border-zinc-800 rounded-lg hover:bg-zinc-900 transition-colors group" href="#">
<span className="text-body-sm text-on-surface">Enable Two-Factor (2FA)</span>
<span className="material-symbols-outlined text-zinc-500 group-hover:text-primary" data-icon="chevron_right">chevron_right</span>
</a>
<a className="flex items-center justify-between p-3 border border-zinc-800 rounded-lg hover:bg-zinc-900 transition-colors group" href="#">
<span className="text-body-sm text-on-surface">Audit Authentication Logs</span>
<span className="material-symbols-outlined text-zinc-500 group-hover:text-primary" data-icon="chevron_right">chevron_right</span>
</a>
<button className="w-full flex items-center justify-between p-3 border border-red-900/30 bg-red-900/5 rounded-lg hover:bg-red-900/10 transition-colors group text-left">
<span className="text-body-sm text-red-400">Revoke All Active Sessions</span>
<span className="material-symbols-outlined text-red-400" data-icon="logout">logout</span>
</button>
</div>
</div>
</div>
{/* External API Pipeline Section */}
<section className="space-y-4">
<div className="flex items-center justify-between">
<h2 className="text-h2 font-h2 text-on-surface">External API Pipeline</h2>
<span className="text-label-caps text-primary px-3 py-1 bg-primary-container/10 border border-primary-container/20 rounded-full">2 Active Connections</span>
</div>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
{/* Connected Pipeline */}
<div className="glass-card p-6 rounded-xl border-l-4 border-l-emerald-500 flex flex-col gap-6">
<div className="flex items-start justify-between">
<div className="flex gap-4">
<div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-inner overflow-hidden">
<img className="w-8 h-8 object-contain" data-alt="The Anthropic logo featuring a stylized minimalist character or wordmark on a clean white background. The image is framed as a professional software integration icon, high contrast and modern." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnb2AcQOk-8AY1UpVDqUExAj9nEuHEgT38bedr65hjbSrD4Y3QEuxmGAXYHI_lHl61wi_RZsdE2hE7L_qs5uABTrO_TOX9w-9ERpFnngaZzC2NtrZ39OIF0ag1olFAeGb-zsZRQDKkr2F8Kkcf_GFYmHiRyM8QfTHIy4Ee4um1M_ti7tttDE7e_CAZ2lNN1vVCpXBI_avxIPyUa8v7lR1Tgy5JeTZs-UGKAyr-GllKiKuv0zZRpMSi4M_4YMJTSwJbQiTYCsx4pqs1"/>
</div>
<div>
<h3 className="text-body-lg font-bold text-on-surface">Anthropic Claude 3.5</h3>
<p className="text-xs text-zinc-500">Connected to Neural Interface Engine</p>
</div>
</div>
<span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 uppercase">Connected</span>
</div>
<div className="flex items-center gap-2 py-3 px-4 bg-zinc-900/50 rounded-lg">
<span className="material-symbols-outlined text-zinc-500 text-sm" data-icon="link">link</span>
<code className="text-[10px] text-zinc-400 font-mono">sk-ant-api03-xxxx-xxxxxxxxxxxxxx-L2P9</code>
</div>
<div className="flex gap-2">
<button className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-on-surface text-xs font-semibold rounded-lg transition-colors">Test Connection</button>
<button className="px-4 py-2 bg-zinc-900 text-zinc-500 hover:text-red-400 border border-zinc-800 hover:border-red-400/30 rounded-lg transition-all">
<span className="material-symbols-outlined text-sm" data-icon="delete">delete</span>
</button>
</div>
</div>
{/* Not Configured Pipeline */}
<div className="glass-card p-6 rounded-xl border-l-4 border-l-zinc-700 flex flex-col gap-6 opacity-80 hover:opacity-100 transition-opacity">
<div className="flex items-start justify-between">
<div className="flex gap-4">
<div className="w-12 h-12 bg-[#1877F2] rounded-lg flex items-center justify-center shadow-inner">
<img className="w-8 h-8 object-contain" data-alt="The Facebook Ads Manager logo, a white circular icon with stylized bar charts inside on a vibrant blue background. The aesthetic is clean, professional, and optimized for a dark-mode UI integration card." src="https://lh3.googleusercontent.com/aida-public/AB6AXuASi-OCsHNncFUzHtXhnQudtXHvJpB2yviTZHdwczMDE5Nwnc7MMAJWxPtI9aLTngJ6X5XNwgeqzq-P1Aa1y57lZJpNRVZA4WNgXDL1Pi3kOxJ9TEjADnOAKpLKXwdzWT4w44xtcNItnYY0ciLLDR5HFtdTlD-b78Eu6bo5VACR54uXQgWGpiyfIXhBOEqRP-xaZljTjmdSpTWs5zsOc58vkkALEYsCnuegQoaeAjCsJVrPTT18Ox3fAQSd5iNjOCcsC6kDYJhaow3z"/>
</div>
<div>
<h3 className="text-body-lg font-bold text-on-surface">Facebook Ads Manager</h3>
<p className="text-xs text-zinc-500">External Campaign Orchestration</p>
</div>
</div>
<span className="text-[10px] font-bold text-zinc-500 bg-zinc-800 px-2 py-1 rounded border border-zinc-700 uppercase">Not Configured</span>
</div>
<div className="p-4 bg-zinc-900/30 border border-dashed border-zinc-700 rounded-lg text-center">
<p className="text-xs text-zinc-500 italic">Auth token required to initialize sync</p>
</div>
<button className="w-full py-2.5 bg-primary-container hover:bg-primary-container/90 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2">
<span className="material-symbols-outlined text-sm" data-icon="lock_open">lock_open</span>
                            Authenticate via OAuth
                        </button>
</div>
</div>
</section>
{/* Global Footer Status */}
<footer className="pt-12 pb-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between text-zinc-600">
<div className="flex items-center gap-4 text-[10px] font-mono tracking-wider">
<span>SERVER: PROX-09-EUROPE-1</span>
<span className="text-zinc-800">|</span>
<span>LATENCY: 14MS</span>
<span className="text-zinc-800">|</span>
<span className="text-emerald-500/60 uppercase">System Optimal</span>
</div>
<div className="mt-4 md:mt-0 flex gap-6 text-[11px] uppercase font-bold tracking-tighter">
<a className="hover:text-primary transition-colors" href="#">Documentation</a>
<a className="hover:text-primary transition-colors" href="#">API Reference</a>
<a className="hover:text-primary transition-colors" href="#">Support Ticket</a>
</div>
</footer>
</div>

    </>
  );
}
