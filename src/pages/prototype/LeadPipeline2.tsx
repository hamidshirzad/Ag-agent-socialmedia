import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const activeLeads = [
  { 
    id: 1, 
    name: 'Alex Thompson', 
    role: 'CTO @ NexaFlow', 
    bant: 94, 
    status: 'Active', 
    statusColor: 'bg-primary', 
    bantColor: 'bg-primary-container text-on-primary-container',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2rG4BepOG4NdbfKw33lCJfm5FOHSWjnJy8QsN0Y-XkeTQe9ZDzFPDiPLAlq8UjQGJUavd3BVjro8DiGDK5C5_JsebMTgGzaD_PXvE5ZqeJo9Vt586bTaKthnDOOdtmLMz4ekldDfuSu8K0c3U7xK2pjXcROFweVacbsazG7Wbg-PsKUA8-3ieXrM0WB01WFpUBmSrycF-rVffMOfxUI3mdxkHP3XJd3VF915jBf_MzR9R1X-NznOtKIcStTN8xeuO53-ZfsOoinEw',
    chatLog: [
      { sender: 'User', time: '10:24 AM', text: '"We\'re looking to scale our lead scoring by 300% next quarter. Current systems are too slow."' },
      { sender: 'Fourdoor AI', time: '10:25 AM', text: '"Understood. Our autonomous engine handles up to 50k events per minute. Shall we discuss implementation?"', isAI: true }
    ]
  },
  { 
    id: 2, 
    name: 'Sarah Jenkins', 
    role: 'VP Growth @ Scale.ly', 
    bant: 76, 
    status: 'Idle', 
    statusColor: 'bg-outline', 
    bantColor: 'bg-surface-container-highest text-on-surface-variant',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC70GxxB9rL3FISOZYmP9s1tPdO6UjJfdxrX5nQImRoLEZNGeKYXHGAiGdFMh0zqGtPd3qnf-ChwVoS37QdDcT4VRScTFztYUpjImpRg6K48ehp7oqXBN9TuxgwrJ1AcVagtjsDAGBUIurkho3DEYmeAq57i-UnQ3-c_WPh6KsXozrQsWew7Cd_P8vTDNPW-70lmuRAOGMUmZkBnRg5wmTvNtctk7G-NI-4xfi2XYjnreCTks4TNZZr79WTDAkw2M26Hyi9G75vd-ot',
    chatLog: []
  },
  { 
    id: 3, 
    name: 'Michael Chen', 
    role: 'Partner @ VC Blue', 
    bant: 42, 
    status: 'Archived', 
    statusColor: 'bg-outline', 
    bantColor: 'bg-error-container/20 text-error border border-error/20',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWtbZm3-ToBMOoFF_qDO2OECWdDhIJ6GADYO0KoJiZr9RhSfCSZvQSH5C0Nr9E0xdSkaWDiV9R78F9KvENEdk8EPS0X6RIBsJ7WBdxxLSVHa2_NiYqTLwIbDzFCLFOVgMQOnovkTMy9RyT6HiHmJNpiFabirtGVSsiHvh2eadnzMxWBN-UXkMJNTE5S1YrgeqJ-htKi8Q4PERxIM1EyOlzg_J7BvdAiFTPAv--tL3MHo13cvJqv-3qfU5UtG_AaDn5c45tA9YMf5j7',
    chatLog: []
  },
  { 
    id: 4, 
    name: 'Jessica Wu', 
    role: 'Director @ MetaEngine', 
    bant: 88, 
    status: 'Processing', 
    statusColor: 'bg-primary', 
    bantColor: 'bg-primary-container/40 text-primary-fixed',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDL75ghw8Tr9zCLXmjdtwqfmtvf_e0NfUkaUP5WNjLfxt9kP4gjeargVbo8Jp3IQL5Q1Aov4yuWszzIONGgDa625b_uF-iGD6F0KcN2JJ6Goy6J-FVl-W2K1LIUudCazeFxZrgLQuO3rc1e4G6IazDiNMSi3WH7-yiIKT_1ISd4ca3jCLX7NyBJrZH8D9hwAujvfVVW9ZCQ41BB8Oyi1u_KDfQYMTQtOb4hyfqL4hm3UMQ3qwMECirjbFVa2tfpmk8g68cSM9eX64mc',
    chatLog: [
      { sender: 'Fourdoor AI', time: '11:00 AM', text: '"Hi Jessica, I noticed your team is expanding. Let me know if you want to see our scaling benchmarks."', isAI: true }
    ]
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', bounce: 0.3 } }
};

export default function LeadPipeline2() {
  const [expandedId, setExpandedId] = useState<number | null>(1);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredLeads = activeLeads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    lead.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants} className="max-w-md mx-auto pb-12">
      {/* Dashboard Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="font-h1 text-h1 text-on-surface">Lead Pipeline</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Autonomous growth processing active</p>
      </motion.div>

      {/* Search Bar */}
      <motion.div variants={itemVariants} className="relative mb-8">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
        <input 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 pl-12 pr-4 text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all font-body-md shadow-inner" 
          placeholder="Search leads by name or BANT..." 
          type="text"
        />
      </motion.div>

      {/* Stats Overview (Asymmetric) */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 gap-3 mb-8">
        <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="glass-card p-4 rounded-xl flex flex-col justify-between h-32 cursor-pointer shadow-lg">
          <span className="font-label-caps text-label-caps text-on-surface-variant">HIGH INTENT</span>
          <div className="flex items-end justify-between">
            <span className="font-display text-display text-primary">24</span>
            <span className="material-symbols-outlined text-primary mb-2">trending_up</span>
          </div>
        </motion.div>
        <div className="flex flex-col gap-3">
          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="glass-card p-3 rounded-xl flex items-center justify-between cursor-pointer shadow-md">
            <div>
              <p className="font-label-caps text-label-caps text-on-surface-variant">AVG BANT</p>
              <p className="font-h2 text-h2">82</p>
            </div>
            <span className="material-symbols-outlined text-outline">bolt</span>
          </motion.div>
          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="glass-card p-3 rounded-xl flex items-center justify-between cursor-pointer shadow-md">
            <div>
              <p className="font-label-caps text-label-caps text-on-surface-variant">CONV RATE</p>
              <p className="font-h2 text-h2">12%</p>
            </div>
            <span className="material-symbols-outlined text-outline">monitoring</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Lead Pipeline List */}
      <motion.div variants={containerVariants} className="space-y-4">
        <AnimatePresence>
          {filteredLeads.map((lead) => {
            const isExpanded = expandedId === lead.id;
            
            return (
              <motion.div 
                key={lead.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`glass-card rounded-xl overflow-hidden transition-all duration-300 ${isExpanded ? 'border-primary/30 ring-1 ring-primary/20 shadow-xl' : 'hover:bg-surface-container-high border-transparent shadow-sm'}`}
              >
                <div 
                  onClick={() => toggleExpand(lead.id)}
                  className="p-4 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant">
                      <img className="w-full h-full object-cover" alt={lead.name} src={lead.avatar} />
                    </div>
                    <div>
                      <h3 className="font-h2 text-body-md font-bold text-on-surface">{lead.name}</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{lead.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`${lead.bantColor} font-label-caps text-[10px] px-2 py-1 rounded-full inline-block mb-1`}>
                      BANT {lead.bant}
                    </div>
                    <p className={`text-xs flex items-center justify-end gap-1 ${isExpanded ? 'text-on-surface-variant' : 'text-outline'}`}>
                      <span className={`w-2 h-2 rounded-full ${lead.statusColor} ${lead.status === 'Active' || lead.status === 'Processing' ? 'cyber-pulse' : ''}`}></span> {lead.status}
                    </p>
                  </div>
                </div>

                {/* Expansion Content */}
                <AnimatePresence>
                  {isExpanded && lead.chatLog && lead.chatLog.length > 0 && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-[#18181B] border-t border-[#27272A] overflow-hidden"
                    >
                      <div className="p-4">
                        <p className="font-label-caps text-label-caps text-on-surface-variant mb-3 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">psychology</span>
                          CONVERSATION LOG (AI SUMMARY)
                        </p>
                        <div className="space-y-3">
                          {lead.chatLog.map((chat, idx) => (
                            <div key={idx} className={`flex gap-3 ${chat.isAI ? 'justify-end' : ''}`}>
                              <div className={`flex-grow p-3 border ${chat.isAI ? 'max-w-[80%] bg-primary-container/20 rounded-lg rounded-tr-none border-primary/30' : 'bg-surface-container-low rounded-lg rounded-tl-none border-transparent'}`}>
                                <p className={`text-xs mb-1 font-bold ${chat.isAI ? 'text-primary' : 'text-on-surface-variant'}`}>{chat.sender} • {chat.time}</p>
                                <p className="text-sm text-slate-200 leading-relaxed">{chat.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 flex gap-2">
                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 pro-gradient text-white font-bold py-2 rounded-lg text-center transition-all text-sm shadow-lg shadow-indigo-500/20">TAKE OVER</motion.button>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-3 border border-outline-variant rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors">
                            <span className="material-symbols-outlined">more_horiz</span>
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {isExpanded && (!lead.chatLog || lead.chatLog.length === 0) && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-[#18181B] border-t border-[#27272A] p-4 overflow-hidden"
                    >
                      <p className="text-sm text-on-surface-variant text-center italic py-4">No active conversation log yet.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
