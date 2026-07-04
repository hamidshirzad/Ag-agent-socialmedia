import React, { useState } from 'react';
import { motion } from 'framer-motion';

const platforms = [
  { id: 'instagram', icon: 'photo_camera', label: 'Instagram', borderHover: 'hover:border-pink-500', iconHover: 'group-hover:text-pink-500', activeClass: 'border-pink-500 bg-pink-500/10 text-pink-500' },
  { id: 'linkedin', icon: 'work', label: 'LinkedIn', borderHover: 'hover:border-blue-400', iconHover: 'group-hover:text-blue-400', activeClass: 'border-blue-400 bg-blue-400/10 text-blue-400' },
  { id: 'twitter', icon: 'alternate_email', label: 'X (Twitter)', borderHover: 'hover:border-zinc-100', iconHover: 'group-hover:text-zinc-100', activeClass: 'border-zinc-100 bg-zinc-100/10 text-zinc-100' },
];

const scheduledPosts = [
  { 
    id: 1, 
    date: 'TOMORROW, 09:00 AM', 
    platform: 'LinkedIn', 
    icon: 'work', 
    text: '"The future of autonomous growth isn\'t just about scaling; it\'s about strategic precision. Here\'s how Fourdoor AI..."',
    reach: '2.4k',
    optimized: 'AI Optimized',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGt_uybz5eyvJu6rvD3NL2ag6CCWFE-35OZ0UHE3t1DnTZqIyMc2wwFNiY1dYgYQGsVDbaF3YQcougKRZ-qFyrgM1xYXvyoQGboCeMOXQoYgGIKi6EtvtxH9SFqg2ybqBl9DcLIahQjNakJm1ELq6EUv3-h3AvvncE8-LfOu_OcHMVz81DB4tCZjT_ekNgBD7GWpedYgH9L457PvOdUpiDPFlWw9Fhh0bHmu-rd1bUKxQuE1mEYWxAp2PDC8joRVjuKkKw_CwgOEOH'
  },
  { 
    id: 2, 
    date: 'SEP 24, 05:00 PM', 
    platform: 'Instagram', 
    icon: 'photo_camera', 
    text: 'Visualizing the core of Fourdoor AI\'s neural architecture. Designed for speed, built for intelligence.',
    reach: '5.1k',
    optimized: 'Creative Gen',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCT3d-R2hm7OLr8X2ykmXfjSR8DARbotORy_e_VoAAPNqD74Q_CGsUqAahWnbpcIA3z7oBn7IE9tIZ2qo_WYw-f1KnfmK1k-08W00TvHiVf82T3fjrN_QqsCT_7rCNBx8S4c9v4tRl-d5fVf6LTuZhALDnXYd6o9jtD_oLQLcMllVxO3Hoz0himjZg0K_FIEMIlM6JmVXV1oZjZdVAggVtREgy93UZOe_A6zBPS_FMgprtnjRFfJDyfoWpQn_19QCyCrwqPFxsIT21m'
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.4 } }
};

export default function ContentHub2() {
  const [activePlatform, setActivePlatform] = useState('linkedin');
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setPrompt('');
    }, 2500);
  };

  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants} className="max-w-md mx-auto space-y-stack-md pb-12">
      {/* Page Header */}
      <motion.div variants={itemVariants} className="space-y-1">
        <h2 className="font-h2 text-h2 text-on-surface">Content Hub</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Generate and orchestrate your social strategy.</p>
      </motion.div>

      {/* AI Generation Section */}
      <motion.section variants={itemVariants} className="bg-surface-container-low border border-outline-variant rounded-xl p-4 shadow-sm backdrop-blur-sm relative overflow-hidden">
        {isGenerating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-surface-container/90 backdrop-blur-md z-10 flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-primary text-4xl animate-spin mb-2">auto_awesome</span>
            <span className="font-label-caps tracking-widest text-primary text-xs font-bold">GENERATING...</span>
          </motion.div>
        )}
        
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary cyber-pulse rounded-full" data-icon="auto_awesome">auto_awesome</span>
          <h3 className="font-label-caps text-label-caps text-primary tracking-widest font-bold">AI GENERATOR</h3>
        </div>
        
        <div className="space-y-4">
          <div className="relative">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-surface-container-highest border border-outline-variant rounded-lg p-4 text-on-surface font-body-md focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/50 resize-none" 
              placeholder="Describe your post idea..." 
              rows={4}
            />
          </div>
          
          {/* Platform Selectors */}
          <div className="grid grid-cols-3 gap-2">
            {platforms.map((p) => {
              const isActive = activePlatform === p.id;
              return (
                <button 
                  key={p.id}
                  onClick={() => setActivePlatform(p.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all group ${
                    isActive ? p.activeClass : `border-outline-variant bg-surface-container-highest ${p.borderHover}`
                  }`}
                >
                  <span className={`material-symbols-outlined mb-1 transition-colors ${isActive ? '' : `text-on-surface-variant ${p.iconHover}`}`}>{p.icon}</span>
                  <span className={`text-[10px] font-bold transition-colors ${isActive ? '' : `text-on-surface-variant ${p.iconHover}`}`}>{p.label}</span>
                </button>
              );
            })}
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-4 pro-gradient text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined" data-icon="bolt">bolt</span>
            <span>Generate Post Content</span>
          </motion.button>
        </div>
      </motion.section>

      {/* Scheduled Queue Section */}
      <motion.section variants={containerVariants} className="space-y-stack-sm">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-h2 text-body-lg font-bold text-on-surface">Scheduled Queue</h3>
          <button className="text-primary text-sm font-semibold hover:underline">View All</button>
        </div>
        
        <div className="space-y-4">
          {scheduledPosts.map((post) => (
            <motion.article 
              key={post.id}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden hover:border-primary/50 transition-all group cursor-pointer shadow-lg"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={post.platform} src={post.image} />
                <div className="absolute top-3 left-3 bg-[#09090B]/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-primary" data-icon={post.icon} data-weight="fill" style={{ fontVariationSettings: '"FILL" 1' }}>{post.icon}</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white">{post.platform}</span>
                </div>
              </div>
              <div className="p-4 space-y-2 bg-surface-container-low">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded">{post.date}</span>
                  <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-white" data-icon="more_horiz">more_horiz</span>
                </div>
                <p className="font-body-sm text-on-surface line-clamp-2 leading-relaxed">{post.text}</p>
                <div className="flex items-center gap-4 pt-2 border-t border-outline-variant/30">
                  <div className="flex items-center gap-1 text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm" data-icon="query_stats">query_stats</span>
                    <span className="text-xs">Est. Reach: {post.reach}</span>
                  </div>
                  <div className="flex items-center gap-1 text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm text-primary" data-icon="psychology">psychology</span>
                    <span className="text-xs text-primary">{post.optimized}</span>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}
