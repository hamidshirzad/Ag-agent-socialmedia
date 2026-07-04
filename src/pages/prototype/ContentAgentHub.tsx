import React, { useState } from 'react';
import { motion } from 'framer-motion';

const platforms = [
  { id: 'instagram', icon: 'camera_alt', label: 'INSTAGRAM' },
  { id: 'linkedin', icon: 'work', label: 'LINKEDIN' },
  { id: 'twitter', icon: 'chat', label: 'X / TWITTER' },
  { id: 'tiktok', icon: 'video_library', label: 'TIKTOK' },
];

const scheduledItems = [
  { 
    id: 1, 
    title: 'The Future of Generative Creative...', 
    platform: 'Instagram', 
    platformIcon: 'camera_alt', 
    time: 'OCT 14, 10:00 AM', 
    status: 'Active', 
    statusClass: 'bg-secondary/10 text-secondary',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0PmRa-Z6GXEbjTJziU6OoZyOF9ClmDGvYiuhi0DYe1Fzwi9UA7qwHWCP8J2p2gEL2XuTMYTmKmcQ5cXMTcj0mETFupNNwZ1-7sMi8TCgjO2t2arFsvvZ_touZIQX0SQ1fjFD-uaBcpzvNuJqBCOV-slkQ6-eoR20zXxeIdDOCAzPRf_5vJWsddM9BLs1dxRDdWWMSaEBQOfQuKkYWjCsvHBojnTsVwQcHp2Ke8N_buDaIRGagMFCY97VGiquMGsB3JewM7NcULPjH' 
  },
  { 
    id: 2, 
    title: '5 Ways AI reduces CPA in Q4', 
    platform: 'LinkedIn', 
    platformIcon: 'work', 
    time: 'OCT 15, 02:30 PM', 
    status: 'Draft', 
    statusClass: 'bg-slate-800 text-slate-400',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCH-c06Z64yoAUb0Pvqvr_VWGeXHkYjzyFQeP8Xc9W1VddlL76w8NyaBSNQIx2E30IVBPZi7mSDXf8cXpYKwW8AshMeFxvuq3pR9E5wBhJzuVva7reLo2O2zQOg_cIgp1iDPrMJLa-QyB1zFdErXlHlAU42PoiUIWi5pVMa0i9NpJbXFszLuw0xvzYKx92RiIyat4tbbHQ2RvdJQ3vocLFAhntb5REhtJ0NvcYb17Voryr0so-XNZSliNOo8GIgVrh286Oy287XOR_t' 
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

export default function ContentAgentHub() {
  const [activePlatform, setActivePlatform] = useState('instagram');
  const [isDrafting, setIsDrafting] = useState(false);
  const [promptText, setPromptText] = useState('');

  const handleDraft = () => {
    if (!promptText.trim()) return;
    setIsDrafting(true);
    setTimeout(() => {
      setIsDrafting(false);
      setPromptText('');
    }, 2500);
  };

  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants}>
      <motion.header variants={itemVariants} className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface">Content Hub</h1>
          <p className="font-body-main text-on-surface-variant max-w-2xl mt-2">Manage your autonomous content factory. Orchestrate posts across platforms with AI-driven precision.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-surface-container rounded-lg p-1 border border-outline-variant/30">
            <button className="bg-primary-container/20 text-indigo-400 px-4 py-2 rounded font-label-caps text-label-caps shadow-sm">Platform Toggle</button>
            <button className="text-slate-400 px-4 py-2 rounded font-label-caps text-label-caps hover:text-white transition-colors">Assets Library</button>
          </div>
        </div>
      </motion.header>

      {/* Content Hub Grid */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* Generate Area (Left) */}
        <section className="col-span-12 xl:col-span-7 space-y-8">
          
          {/* Agent Prompt Card */}
          <motion.div variants={itemVariants} className="glass-panel rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full border border-secondary flex items-center justify-center">
                <div className={`w-2 h-2 bg-secondary rounded-full ${isDrafting ? 'animate-ping' : 'cyber-pulse'}`}></div>
              </div>
              <h3 className="font-h2 text-xl text-on-surface">Generate New Post</h3>
            </div>
            
            <div className="space-y-6">
              {/* Platform Selector */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {platforms.map((p) => (
                  <motion.button 
                    key={p.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActivePlatform(p.id)}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                      activePlatform === p.id 
                        ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                        : 'border-slate-800 hover:border-indigo-500/30 text-slate-400'
                    }`}
                  >
                    <span className="material-symbols-outlined">{p.icon}</span>
                    <span className="font-label-caps text-[10px]">{p.label}</span>
                  </motion.button>
                ))}
              </div>
              
              {/* Prompt Input */}
              <div className="relative">
                <textarea 
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-slate-800 rounded-xl p-6 font-data-point text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-on-surface outline-none placeholder:text-slate-600 transition-all shadow-inner" 
                  placeholder={`Brief the Content Agent: 'Create a ${activePlatform === 'instagram' ? 'carousel' : 'thread'} about the future of SaaS AI pricing models...'`} 
                  rows={4}
                />
                <div className="absolute bottom-4 right-4 flex items-center gap-4">
                  <span className="hidden sm:inline text-[10px] font-label-caps text-slate-500 uppercase">Context level: High</span>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDraft}
                    disabled={isDrafting || !promptText.trim()}
                    className="pro-gradient flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm shadow-xl shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{isDrafting ? 'Drafting...' : 'Draft Post'}</span>
                    {isDrafting ? (
                      <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                    ) : (
                      <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content Calendar */}
          <motion.div variants={itemVariants} className="glass-panel rounded-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-h2 text-xl text-on-surface">Scheduled Pipeline</h3>
              <button className="text-indigo-400 text-sm font-semibold flex items-center gap-1 hover:underline hover:text-indigo-300 transition-colors">
                View Full Calendar <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {scheduledItems.map((item, idx) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (idx * 0.1) }}
                  className={`group flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg bg-surface-container-low border border-slate-800/50 hover:border-indigo-500/30 transition-all cursor-pointer ${item.status === 'Draft' ? 'opacity-80' : ''}`}
                >
                  <div className="w-16 h-16 sm:w-12 sm:h-12 rounded bg-slate-800 overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                    <img className="w-full h-full object-cover" alt="Post thumbnail" src={item.image} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">{item.title}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-label-caps">
                        <span className="material-symbols-outlined text-[12px]">{item.platformIcon}</span> {item.platform}
                      </span>
                      <span className="text-slate-700">|</span>
                      <span className={`text-[10px] font-label-caps ${item.status === 'Active' ? 'text-indigo-400' : 'text-slate-500'}`}>{item.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 justify-between sm:justify-end mt-2 sm:mt-0">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${item.statusClass}`}>{item.status}</span>
                    <button className="p-2 text-slate-500 hover:text-white transition-colors rounded-full hover:bg-slate-800"><span className="material-symbols-outlined">more_vert</span></button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Live Preview Area (Right) */}
        <motion.section variants={itemVariants} className="col-span-12 xl:col-span-5">
          <div className="sticky top-24 glass-panel rounded-2xl border-indigo-500/20 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800/50 bg-indigo-500/5 flex justify-between items-center backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-400 cyber-pulse rounded-full">visibility</span>
                <span className="font-label-caps text-sm text-indigo-400 font-bold tracking-widest">Live Preview</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-label-caps text-slate-500">FORMAT: SQUARE CAROUSEL</span>
                <button className="text-slate-400 hover:text-white transition-colors"><span className="material-symbols-outlined text-sm">edit</span></button>
              </div>
            </div>
            
            <div className="p-8">
              {/* Simulated Instagram Post */}
              <motion.div 
                layoutId="previewCard"
                className="max-w-[400px] mx-auto bg-black rounded-lg border border-slate-800 overflow-hidden shadow-2xl"
              >
                {/* Header */}
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full pro-gradient p-0.5">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                        <span className="text-[10px] font-black text-white">4D</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-white">fourdoor_ai</span>
                  </div>
                  <span className="material-symbols-outlined text-sm text-white">more_horiz</span>
                </div>
                
                {/* Main Visual */}
                <div className="aspect-square bg-slate-900 relative group overflow-hidden">
                  <motion.img 
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full object-cover" 
                    alt="Cyberpunk metropolis" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuABes9ezfp2IBDxXNystn6EHG5HmHagyB0kmL1bpzReMpPHC7mRCn-gN5AHa9H1-h41M4tp_1FrBLepMimlHyrgch5-uz7ZR6SCa8ygqeFGLc5qnI8Y1DXpyzJs1BFcYwJIXRMGnAK9kTDyzW1E1f-VoSO6snOKZjdseUptC7_LV38rcvAZhUu1LxBvJRypC_7_kubOHo9aT9xvmSE7Gm1hbxMSDQucbgaybsvMveP-AjE8-eS_qkJLVuZGUF0QJLWff2FndhaRt-Af"
                  />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-slate-600 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-slate-600 rounded-full"></div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="p-3 text-white">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex gap-4">
                      <motion.button whileTap={{ scale: 0.8 }} className="hover:text-pink-500 transition-colors"><span className="material-symbols-outlined">favorite</span></motion.button>
                      <motion.button whileTap={{ scale: 0.8 }} className="hover:text-slate-300 transition-colors"><span className="material-symbols-outlined">chat_bubble</span></motion.button>
                      <motion.button whileTap={{ scale: 0.8 }} className="hover:text-indigo-400 transition-colors"><span className="material-symbols-outlined">send</span></motion.button>
                    </div>
                    <motion.button whileTap={{ scale: 0.8 }} className="hover:text-slate-300 transition-colors"><span className="material-symbols-outlined">bookmark</span></motion.button>
                  </div>
                  
                  {/* Caption Content */}
                  <div className="space-y-2">
                    <p className="text-[13px] leading-relaxed text-slate-200">
                      <span className="font-bold mr-1 text-white">fourdoor_ai</span> 
                      The era of manual content management is over. 🚀
                      <br/><br/>
                      Our new Autonomous Content Agent doesn't just write; it strategizes. From cross-platform hooks to hyper-optimized hashtags, your brand now runs on auto-pilot.
                      <br/><br/>
                      <span className="text-indigo-400 cursor-pointer hover:underline">#AI #MarketingAutomation #FourdoorAI #FutureOfWork</span>
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter">12 minutes ago • Translate</p>
                  </div>
                </div>
              </motion.div>
              
              {/* Post Controls */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="bg-surface-container border border-slate-800 text-slate-300 py-3 rounded-lg font-semibold text-sm hover:bg-slate-800/80 transition-all">Save to Drafts</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="pro-gradient text-white py-3 rounded-lg font-bold text-sm shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all">Publish Now</motion.button>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
