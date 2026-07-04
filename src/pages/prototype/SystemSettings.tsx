import React from 'react';

export default function SystemSettings() {
  return (
    <>
      
{/* Profile & Subscription Section */}
<section className="glass-card rounded-xl p-6 flex flex-col items-center text-center gap-4">
<div className="relative">
<div className="w-24 h-24 rounded-full border-2 border-primary p-1">
<img className="w-full h-full rounded-full object-cover" data-alt="Detailed user avatar for a performance marketer, featuring professional studio lighting with electric blue highlights. The image is crisp and centers on a tech-savvy professional against a deep obsidian background. Subtle digital overlays suggest data processing and high-level strategic capability inherent to the Fourdoor AI platform." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxGAJKgqf6qsn25_QqlxvJiRU0RFuWzOsPYZhC6RvAcs6Tup-GidT2FYcug8SNGXirs4TvaiWan5wr5xeVwp5ifo4__9FJTkNtU69xF1WCXwZGED1RTHUNFvQUOxuneaAyUuor4SpenZzYwzqktZt9aWm8QHVCziyqPNWsUb_BrMClK8xUlmntceDYWUzI4gW7r1nSY4qhIwTA7ziYAYa9vw4iCmoGcLrUynsCLLHjFxZ7Pd6j3OTK1RFYqew-5dUEXaWVS1apAr8I"/>
</div>
<div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1.5 border-4 border-surface-container-lowest">
<span className="material-symbols-outlined text-[16px]" data-icon="verified" style={{ fontVariationSettings: '"FILL" 1' }}>verified</span>
</div>
</div>
<div>
<h2 className="font-h1 text-h2 text-on-surface">Alex Sterling</h2>
<p className="font-body-sm text-on-surface-variant">Chief Growth Engineer</p>
</div>
<div className="bg-primary-container/20 border border-primary/30 rounded-full px-4 py-2 flex items-center gap-2">
<span className="material-symbols-outlined text-primary" data-icon="star" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
<span className="font-label-caps text-primary tracking-widest">PRO TIER SUBSCRIPTION</span>
</div>
</section>
{/* Global Logic Controls (Toggles) */}
<section className="space-y-3">
<h3 className="font-label-caps text-on-surface-variant px-2">GLOBAL LOGIC CONTROLS</h3>
<div className="glass-card rounded-xl divide-y divide-[#27272A]">
<div className="p-4 flex justify-between items-center">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
<span className="material-symbols-outlined" data-icon="psychology">psychology</span>
</div>
<div>
<p className="font-body-md font-semibold">Autonomous Bidding</p>
<p className="text-[12px] text-on-surface-variant">AI manages real-time CPC adjustments</p>
</div>
</div>
<div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
<div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
</div>
</div>
<div className="p-4 flex justify-between items-center">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
<span className="material-symbols-outlined" data-icon="auto_awesome">auto_awesome</span>
</div>
<div>
<p className="font-body-md font-semibold">Creative Synthesis</p>
<p className="text-[12px] text-on-surface-variant">Auto-generate ad variants from insights</p>
</div>
</div>
<div className="w-12 h-6 bg-surface-container-highest rounded-full relative cursor-pointer">
<div className="absolute left-1 top-1 w-4 h-4 bg-outline-variant rounded-full"></div>
</div>
</div>
</div>
</section>
{/* API Connection Status */}
<section className="space-y-3">
<h3 className="font-label-caps text-on-surface-variant px-2">CONNECTED PIPELINES</h3>
<div className="glass-card rounded-xl overflow-hidden">
<div className="p-4 flex items-center justify-between border-b border-[#27272A]">
<div className="flex items-center gap-3">
<div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
<span className="material-symbols-outlined text-slate-200" data-icon="bolt">bolt</span>
</div>
<div>
<p className="font-body-md font-medium">Anthropic Claude 3.5</p>
<div className="flex items-center gap-1.5">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
<span className="text-[12px] text-on-surface-variant">Active Connection</span>
</div>
</div>
</div>
<button className="text-[13px] font-semibold text-primary">MANAGE</button>
</div>
<div className="p-4 flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
<span className="material-symbols-outlined text-slate-200" data-icon="facebook">social_leaderboard</span>
</div>
<div>
<p className="font-body-md font-medium">Facebook Meta Ads</p>
<div className="flex items-center gap-1.5">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
<span className="text-[12px] text-on-surface-variant">Syncing 12 Campaigns</span>
</div>
</div>
</div>
<button className="text-[13px] font-semibold text-primary">MANAGE</button>
</div>
</div>
</section>
{/* Security & Session */}
<section className="space-y-3">
<h3 className="font-label-caps text-on-surface-variant px-2">SECURITY &amp; SESSION</h3>
<div className="glass-card rounded-xl divide-y divide-[#27272A]">
<button className="w-full p-4 flex items-center justify-between hover:bg-surface-container transition-colors">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-on-surface-variant" data-icon="lock">lock</span>
<span className="font-body-md">Two-Factor Authentication</span>
</div>
<span className="material-symbols-outlined text-on-surface-variant" data-icon="chevron_right">chevron_right</span>
</button>
<button className="w-full p-4 flex items-center justify-between hover:bg-surface-container transition-colors">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-on-surface-variant" data-icon="key">key</span>
<span className="font-body-md">API Access Keys</span>
</div>
<span className="material-symbols-outlined text-on-surface-variant" data-icon="chevron_right">chevron_right</span>
</button>
<button className="w-full p-4 flex items-center justify-between hover:bg-error/10 transition-colors group">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-error" data-icon="logout">logout</span>
<span className="font-body-md text-error">Logout Session</span>
</div>
</button>
</div>
</section>
{/* Danger Zone Footer */}
<div className="pt-4 pb-8 text-center">
<p className="text-[12px] text-on-surface-variant px-8">
                Version 2.4.1-stable. Fourdoor AI processes data autonomously using encrypted protocols. Your API keys are never stored in plaintext.
            </p>
</div>

    </>
  );
}
