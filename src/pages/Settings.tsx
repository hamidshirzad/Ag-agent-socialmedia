import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { Shield, Smartphone, Globe, CreditCard, Bell, Save, Zap, Trash2, Eye, EyeOff } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { cn } from "../lib/utils";

export default function Settings() {
  const { profile, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    company: profile?.company || "",
    niche: profile?.niche || "",
    apiKeys: {
      openai: profile?.apiKeys?.openai || "",
      anthropic: profile?.apiKeys?.anthropic || "",
      gemini: profile?.apiKeys?.gemini || ""
    }
  });

  const maskKey = (key: string) => {
    if (!key) return "";
    if (key.length <= 4) return key;
    return `•••• •••• •••• ${key.slice(-4)}`;
  };

  const handleClearKey = (provider: 'openai' | 'anthropic' | 'gemini') => {
    setFormData({
      ...formData,
      apiKeys: {
        ...formData.apiKeys,
        [provider]: ""
      }
    });
  };

  const handleSave = async () => {
    if (!profile?.id) return;
    const userRef = doc(db, "users", profile.id);
    try {
      await updateDoc(userRef, formData);
      await refreshProfile();
      alert("Neural Configuration Synchronized.");
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to synchronize settings.");
    }
  };

  return (
    <div className="flex min-h-screen bg-sb-cream text-black font-sans tracking-sb">
      <Sidebar />
      <main className="flex-1 p-12 lg:p-24 max-w-7xl">
        <header className="mb-16 pb-10 border-b border-black/5">
          <h1 className="text-[4.8rem] font-bold text-sb-green tracking-sb mb-2 uppercase">Configuration</h1>
          <p className="text-black/40 text-[1.6rem] font-medium italic">Adjust Neural Parameters & Integrations</p>
        </header>

        <div className="space-y-20">
          {/* AI Engine Keys */}
          <section className="bg-sb-house text-white rounded-[12px] p-12 lg:p-16 sb-shadow-frap border-b-4 border-sb-gold">
            <h2 className="text-[2.1rem] font-bold mb-10 flex items-center gap-4 uppercase tracking-wider">
              <Zap size={24} className="text-sb-gold fill-sb-gold" /> AI Engine Credentials
            </h2>
            <p className="text-white/60 text-[1.4rem] mb-12 italic font-medium">
              Activate higher resonance by connecting your professional AI instances. These keys are stored in your private vault.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="group">
                <label className="text-[1.1rem] font-black uppercase tracking-[0.2em] text-white/40 block mb-3 px-2">Gemini API Key</label>
                <div className="relative">
                  <input 
                    type={formData.apiKeys.gemini && formData.apiKeys.gemini === profile?.apiKeys?.gemini ? "text" : "password"}
                    placeholder="Enter Gemini Key"
                    value={formData.apiKeys.gemini && formData.apiKeys.gemini === profile?.apiKeys?.gemini ? maskKey(formData.apiKeys.gemini) : formData.apiKeys.gemini}
                    onChange={e => setFormData({...formData, apiKeys: {...formData.apiKeys, gemini: e.target.value}})}
                    className="w-full bg-white/5 border-2 border-white/10 rounded-[12px] p-5 pr-14 text-[1.4rem] font-bold focus:bg-white/10 focus:border-sb-gold transition-all outline-none"
                  />
                  {formData.apiKeys.gemini && (
                    <button 
                      onClick={() => handleClearKey('gemini')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-red-400 transition-colors"
                      title="Clear Key"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
              <div className="group">
                <label className="text-[1.1rem] font-black uppercase tracking-[0.2em] text-white/40 block mb-3 px-2">Claude (Anthropic) Key</label>
                <div className="relative">
                  <input 
                    type={formData.apiKeys.anthropic && formData.apiKeys.anthropic === profile?.apiKeys?.anthropic ? "text" : "password"}
                    placeholder="Enter Anthropic Key"
                    value={formData.apiKeys.anthropic && formData.apiKeys.anthropic === profile?.apiKeys?.anthropic ? maskKey(formData.apiKeys.anthropic) : formData.apiKeys.anthropic}
                    onChange={e => setFormData({...formData, apiKeys: {...formData.apiKeys, anthropic: e.target.value}})}
                    className="w-full bg-white/5 border-2 border-white/10 rounded-[12px] p-5 pr-14 text-[1.4rem] font-bold focus:bg-white/10 focus:border-sb-gold transition-all outline-none"
                  />
                  {formData.apiKeys.anthropic && (
                    <button 
                      onClick={() => handleClearKey('anthropic')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-red-400 transition-colors"
                      title="Clear Key"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
              <div className="group">
                <label className="text-[1.1rem] font-black uppercase tracking-[0.2em] text-white/40 block mb-3 px-2">OpenAI Key</label>
                <div className="relative">
                  <input 
                    type={formData.apiKeys.openai && formData.apiKeys.openai === profile?.apiKeys?.openai ? "text" : "password"}
                    placeholder="Enter OpenAI Key"
                    value={formData.apiKeys.openai && formData.apiKeys.openai === profile?.apiKeys?.openai ? maskKey(formData.apiKeys.openai) : formData.apiKeys.openai}
                    onChange={e => setFormData({...formData, apiKeys: {...formData.apiKeys, openai: e.target.value}})}
                    className="w-full bg-white/5 border-2 border-white/10 rounded-[12px] p-5 pr-14 text-[1.4rem] font-bold focus:bg-white/10 focus:border-sb-gold transition-all outline-none"
                  />
                  {formData.apiKeys.openai && (
                    <button 
                      onClick={() => handleClearKey('openai')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-red-400 transition-colors"
                      title="Clear Key"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-12 flex items-center gap-4 text-sb-gold/60 text-[1.1rem] font-black uppercase tracking-widest">
              <Shield size={16} /> 256-Bit Neural Encryption Active
            </div>
          </section>

          {/* Social Connections */}
          <section>
            <h2 className="text-[1.8rem] font-bold text-sb-green mb-10 flex items-center gap-4">
              <Shield size={20} className="text-sb-accent" /> Social Relays
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { name: "LinkedIn", status: "CONNECTED", icon: "🔗", color: "sb-accent" },
                { name: "Instagram", status: "PENDING", icon: "📸", color: "sb-gold" },
                { name: "X (Twitter)", status: "CONNECTED", icon: "𝕏", color: "sb-green" },
                { name: "TikTok", status: "DISCONNECTED", icon: "🎵", color: "black/20" }
              ].map(s => (
                <div key={s.name} className="p-8 bg-white rounded-[12px] sb-shadow-card flex justify-between items-center group transition-all cursor-pointer hover:bg-sb-cream/30">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-sb-cream rounded-full flex items-center justify-center text-[2.4rem] shadow-inner">
                      {s.icon}
                    </div>
                    <div>
                      <h4 className="text-[1.4rem] font-black uppercase tracking-widest text-sb-house">{s.name}</h4>
                      <p className={cn(
                        "text-[1.1rem] font-black uppercase tracking-widest mt-1 shadow-[0_0_8px_transparent]",
                        s.status === 'CONNECTED' ? "text-sb-accent" : 
                        s.status === 'PENDING' ? "text-sb-gold" : "text-black/20"
                      )}>
                        {s.status}
                      </p>
                    </div>
                  </div>
                  <button className="text-[1.1rem] font-black border-2 border-sb-green/10 px-5 py-2 uppercase tracking-widest rounded-full hover:border-sb-green hover:text-sb-green transition-all sb-button-active">Configure</button>
                </div>
              ))}
            </div>
          </section>

          {/* Profile Settings */}
          <section className="bg-white rounded-[12px] sb-shadow-card p-12 lg:p-16">
            <h2 className="text-[2.1rem] font-bold text-sb-green mb-12 border-b border-black/5 pb-6 uppercase tracking-wider">Operator Profile</h2>
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="group">
                  <label className="text-[1.2rem] font-black uppercase tracking-[0.15em] text-sb-green/60 block mb-3 px-2">Full Name</label>
                  <input 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-sb-cream border-2 border-transparent rounded-[12px] p-5 text-[1.4rem] font-bold focus:bg-white focus:border-sb-accent transition-all outline-none"
                  />
                </div>
                <div className="group">
                  <label className="text-[1.2rem] font-black uppercase tracking-[0.15em] text-sb-green/60 block mb-3 px-2">Organization</label>
                  <input 
                    value={formData.company}
                    onChange={e => setFormData({...formData, company: e.target.value})}
                    className="w-full bg-sb-cream border-2 border-transparent rounded-[12px] p-5 text-[1.4rem] font-bold focus:bg-white focus:border-sb-accent transition-all outline-none"
                  />
                </div>
              </div>
              <button 
                onClick={handleSave}
                className="bg-sb-house text-white px-12 py-6 rounded-full text-[1.4rem] font-black uppercase tracking-widest flex items-center gap-4 hover:bg-sb-green hover:shadow-xl transition-all sb-button-active"
              >
                <Save size={18} /> Save Settings
              </button>
            </div>
          </section>

          {/* Billing Status */}
          <section className="p-12 border-2 border-dashed border-sb-house/20 rounded-[12px] bg-sb-ceramic/10">
             <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                <div>
                   <h3 className="text-[2.4rem] font-bold text-sb-green uppercase tracking-sb mb-1">{profile?.plan || 'Starter'} Edition</h3>
                   <p className="text-[1.4rem] text-black/40 font-medium italic">Next neural cycle: June 01, 2026</p>
                </div>
                <button className="px-10 py-5 bg-white border-2 border-sb-house/10 text-sb-house rounded-full text-[1.3rem] font-black uppercase tracking-widest hover:border-sb-house transition-all sb-button-active shadow-sm">
                   Manage Subscription
                </button>
             </div>
          </section>
        </div>
      </main>

      {/* Signature Floating Frap Button */}
      <button className="fixed bottom-12 right-12 w-[5.6rem] h-[5.6rem] bg-sb-accent rounded-full flex items-center justify-center text-white sb-shadow-frap sb-button-active z-[60]">
        <Zap className="fill-white w-6 h-6" />
      </button>
    </div>
  );
}
