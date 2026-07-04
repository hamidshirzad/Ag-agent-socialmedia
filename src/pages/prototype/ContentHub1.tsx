import React, { useState } from 'react';
import { motion } from 'framer-motion';

const scheduledPosts = [
  { id: 1, date: 'TOMORROW • 09:15 AM', title: 'Why Attribution is a Lie in 2024', platform: 'LinkedIn Pipeline', icon: 'work', color: 'text-[#0066FF]', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMCR4e8yRdzKtFw9isvSNssKWgj9NGv4iWFJhtxn5t70heNbSBXBAD7aH61n09BZ9kA6tdnp00bQath-OoyZbXi84wGHIk_b30wCX0aIvlLKq7sNtEbynwNXNvsR51IBezPr0r9OHJFquJqJCKP9jvkaRRp-LZr1a76p0eqT8JpSRwkqlUEoVbwqgkb_5spZsFsDT8iRF45XiIjdgQL5GomsOBEW5Xk2HYKgNRv7cM_2ztJl1_9jYcbnQoWMDCbl1ViRFWlAVEi4WD' },
  { id: 2, date: 'OCT 26 • 11:30 AM', title: 'Autonomous Content Loops Explained', platform: 'Instagram Reel', icon: 'photo_camera', color: 'text-tertiary', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPgo6ahrg5tibyvQEt4oTdZhwRHVSwSu-N1UreENeS6tPskVhTYHpZDMkQJVnoGf1Cwk2WTocxirxjx4OHjNmndjXtyPdGW3Xhp-u1c1B1Mnw9NHlo0tYQvU6rOKVL1EoaQUvji_CaDOAvEo5dMGn4fiFAHp-qqFxFrPLSxHIwEKCwKFmNUZQ8tmXuEaxZnm5vm6rGIZpkOM45hxC3f4WmgZa0_wEZ88bY0L2vI6fQThQ8TUGDXexIRg79JM4A8JJ2CEB3b2PRbIJ9' },
  { id: 3, date: 'OCT 28 • 02:00 PM', title: 'Case Study: 400% ROI in 14 Days', platform: 'Twitter Threads', icon: 'brand_awareness', color: 'text-zinc-500', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAD10X0SLxpdHcCAAmLKwldTSda6vkY0fOHN5Rcq_2pUG2BcJCwn7P3RrTHDr8VaUPLA8syAA1TV4aqj6jIjPfnnBqaQdZHI-REkpfJP0Y6HRYmWLb7RqO1El-ccXFFQD6Amae9Ug2131C2rPpP5j8WhdTVOawAReECYSmgOgCTSVw-sC3BCZ6ap_LTRSlOdUHruHeVIXze4GWss1wH1CJ5Nl4TyaxBwcmELGijdUHMI937FEBvaAQ0pZxoo0ykBOuJOi6CVzVdC7-f' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.4 } }
};

export default function ContentHub1() {
  const [activePlatform, setActivePlatform] = useState('linkedin');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [prompt, setPrompt] = useState('');

  const handleSynthesize = () => {
    setIsSynthesizing(true);
    setTimeout(() => setIsSynthesizing(false), 2000);
  };

  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants} className="max-w-7xl mx-auto space-y-stack-md">
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <h2 className="font-h1 text-h1 text-on-surface mb-1">Content Hub</h2>
          <p className="text-zinc-400 font-body-sm">Orchestrate your multi-channel autonomous content strategy.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg border border-zinc-800 hover:bg-zinc-800 transition-colors active:scale-95">
            <span className="material-symbols-outlined text-sm" data-icon="history">history</span>
            <span className="text-sm font-medium">Archive</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-container text-white rounded-lg hover:brightness-110 transition-all font-semibold shadow-lg shadow-primary-container/20 active:scale-95">
            <span className="material-symbols-outlined text-sm" data-icon="add" style={{ fontVariationSettings: '"FILL" 1' }}>add</span>
            <span className="text-sm">Batch Generate</span>
          </button>
        </div>
      </motion.div>

      {/* Dashboard Layout (Bento Grid) */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Generator Panel (Left) */}
        <motion.div variants={itemVariants} className="col-span-12 lg:col-span-7 space-y-gutter">
          <div className="bg-surface-container border border-outline-variant rounded-xl p-6 shadow-sm relative overflow-hidden">
            {isSynthesizing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-surface-container/80 backdrop-blur-sm z-20 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <span className="material-symbols-outlined text-primary-fixed text-4xl animate-spin">autorenew</span>
                  <span className="text-primary-fixed font-bold tracking-widest uppercase text-sm">Synthesizing Content...</span>
                </div>
              </motion.div>
            )}
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-h2 text-h2 text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-fixed" data-icon="magic_button">magic_button</span>
                AI Content Orchestrator
              </h3>
              <div className="flex gap-2">
                {['instagram', 'linkedin', 'twitter'].map((platform) => (
                  <button 
                    key={platform}
                    onClick={() => setActivePlatform(platform)}
                    className={`p-2 rounded-lg transition-colors border ${
                      activePlatform === platform 
                        ? 'bg-primary-container/20 border-primary-container text-[#0066FF]' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm" data-icon={platform === 'instagram' ? 'photo_camera' : platform === 'linkedin' ? 'work' : 'brand_awareness'}>
                      {platform === 'instagram' ? 'photo_camera' : platform === 'linkedin' ? 'work' : 'brand_awareness'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2 block">Campaign Context & Goal</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-300 focus:border-primary-container focus:ring-1 focus:ring-primary-container/20 transition-all resize-none outline-none" 
                  placeholder="Explain the theme of your post. E.g., 'A thought leadership piece on the future of autonomous agents...'" 
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2 block">Voice Tone</label>
                  <select className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-300 focus:ring-1 focus:ring-primary-container outline-none appearance-none">
                    <option>Strategic & Professional</option>
                    <option>Aggressive & Direct</option>
                    <option>Educational & Soft</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2 block">Target Action</label>
                  <select className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-300 focus:ring-1 focus:ring-primary-container outline-none appearance-none">
                    <option>Demo Request</option>
                    <option>Newsletter Opt-in</option>
                    <option>Thought Leadership</option>
                  </select>
                </div>
              </div>
              <button 
                onClick={handleSynthesize}
                disabled={isSynthesizing}
                className="w-full py-4 bg-primary-container text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-container/10 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined" data-icon="auto_fix_high" style={{ fontVariationSettings: '"FILL" 1' }}>auto_fix_high</span>
                Synthesize Content
              </button>
            </div>
          </div>

          {/* Preview Area */}
          <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-8 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent opacity-50"></div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
                <span className="text-[11px] font-bold text-primary-fixed uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm" data-icon="visibility">visibility</span>
                  Synthetic Preview: {activePlatform.charAt(0).toUpperCase() + activePlatform.slice(1)}
                </span>
                <div className="flex gap-2">
                  <button className="text-zinc-500 hover:text-white transition-colors active:scale-95"><span className="material-symbols-outlined text-sm" data-icon="content_copy">content_copy</span></button>
                  <button onClick={handleSynthesize} className="text-zinc-500 hover:text-white transition-colors active:scale-95"><span className="material-symbols-outlined text-sm" data-icon="refresh">refresh</span></button>
                </div>
              </div>
              
              <motion.div initial={{ opacity: 0.5 }} animate={{ opacity: isSynthesizing ? 0.2 : 1 }} className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-zinc-500 mb-1">The Hook</h4>
                  <p className="text-lg font-semibold text-zinc-100 tracking-tight leading-relaxed">The era of "Manual Growth" is dead. If you're still clicking buttons to launch ads, you're already 3 steps behind the autonomous curve.</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-500 mb-1">Body Text</h4>
                  <p className="text-sm text-zinc-400 leading-relaxed">Most marketing teams spend 80% of their time on execution and 20% on strategy. We're flipping the script. Fourdoor AI handles the labor of scaling, optimizing, and reporting—leaving you to do what humans do best: Pure Strategy. <br/><br/>Read how we scaled Agent Protocol to $2M ARR with zero manual interventions.</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-500 mb-1">Hashtags</h4>
                  <p className="text-sm text-[#0066FF] font-mono">#AutonomousMarketing #GrowthEngineering #AI #StrategicOps</p>
                </div>
              </motion.div>
              
              <div className="pt-4 border-t border-zinc-800/50 flex gap-4">
                <button className="flex-1 py-2.5 bg-zinc-800 text-white rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors active:scale-95">Save Draft</button>
                <button className="flex-1 py-2.5 bg-primary-container text-white rounded-lg text-sm font-bold hover:brightness-110 shadow-lg shadow-primary-container/20 transition-all active:scale-95">Schedule Post</button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Schedule & Assets (Right) */}
        <motion.div variants={itemVariants} className="col-span-12 lg:col-span-5 space-y-gutter">
          {/* Calendar / Upcoming */}
          <div className="bg-surface-container border border-outline-variant rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-widest">Scheduled Queue</h3>
              <span className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full font-mono">OCT 24-30</span>
            </div>
            
            <div className="space-y-4">
              {scheduledPosts.map((post) => (
                <motion.div key={post.id} whileHover={{ x: 5 }} className="group flex items-start gap-4 p-3 rounded-lg hover:bg-zinc-900/50 transition-colors border border-transparent hover:border-zinc-800 cursor-pointer">
                  <div className="w-12 h-12 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0 group-hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-shadow">
                    <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" alt={post.title} src={post.image} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold ${post.color}`}>{post.date}</span>
                      <span className="material-symbols-outlined text-xs text-zinc-600 group-hover:text-white transition-colors" data-icon="more_horiz">more_horiz</span>
                    </div>
                    <p className="text-sm font-medium text-zinc-200 mt-0.5 line-clamp-1">{post.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="material-symbols-outlined text-[14px] text-zinc-500" data-icon={post.icon}>{post.icon}</span>
                      <span className="text-[11px] text-zinc-500">{post.platform}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <button className="w-full mt-6 py-3 border border-zinc-800 rounded-lg text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all uppercase tracking-widest active:scale-95">View Master Calendar</button>
          </div>

          {/* Performance Stats Card */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 overflow-hidden relative group cursor-pointer">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary-container/10 rounded-full blur-3xl group-hover:bg-primary-container/20 transition-all duration-500"></div>
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Channel Performance (30D)</h3>
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Total Impressions</span>
                <span className="text-sm font-mono text-white">1.2M <span className="text-[#0066FF] text-[10px]">+14%</span></span>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} whileInView={{ width: '72%' }} viewport={{ once: true }} transition={{ duration: 1 }} className="bg-primary-container h-full"></motion.div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Avg. Engagement Rate</span>
                <span className="text-sm font-mono text-white">4.8% <span className="text-[#0066FF] text-[10px]">+0.4%</span></span>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} whileInView={{ width: '45%' }} viewport={{ once: true }} transition={{ duration: 1 }} className="bg-tertiary h-full"></motion.div>
              </div>
            </div>
            <div className="mt-6 flex items-start gap-2 text-[11px] text-zinc-500 italic relative z-10">
              <span className="material-symbols-outlined text-xs" data-icon="info">info</span>
              AI suggests shifting focus to LinkedIn video content.
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
