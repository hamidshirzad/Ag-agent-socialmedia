import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Upload, Mail, CheckCircle, Send, Play, BarChart2, Zap } from "lucide-react";
import { cn } from "../lib/utils";

export default function Outreach() {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="flex min-h-screen bg-sb-cream text-black font-sans tracking-sb">
      <Sidebar />
      <main className="flex-1 p-12 lg:p-24 overflow-y-auto">
        <header className="mb-16 pb-8 border-b border-black/10">
          <h1 className="text-sb-green font-semibold text-[3.6rem] leading-tight mb-2 uppercase tracking-sb">Outreach Engine</h1>
          <p className="text-[1.6rem] text-black/50 font-medium">Autonomous Prospecting & Personalized Sequencing</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-16">
            {/* Upload Area */}
            <div className="bg-white border-2 border-dashed border-sb-green/20 rounded-[12px] p-24 flex flex-col items-center justify-center text-center sb-shadow-card">
              <div className="w-24 h-24 bg-sb-cream rounded-full flex items-center justify-center mb-8">
                <Upload size={40} className="text-sb-green/20" />
              </div>
              <h3 className="text-[2.4rem] font-bold text-sb-green mb-4 uppercase tracking-sb">Import Target Data</h3>
              <p className="text-[1.4rem] text-black/50 mb-12 max-w-[32rem] font-medium leading-relaxed italic uppercase tracking-wider">
                Upload a .CSV of LinkedIn profiles or Emails to trigger the AI personalization layer.
              </p>
              <button 
                onClick={() => setIsUploading(true)}
                className="px-12 py-5 bg-sb-accent text-white rounded-full font-bold text-[1.4rem] uppercase tracking-widest sb-button-active shadow-xl"
              >
                Choose File (.csv)
              </button>
            </div>

            {/* Strategy Logic */}
            <div className="bg-white rounded-[12px] sb-shadow-card">
               <div className="p-8 border-b border-black/5 bg-sb-ceramic flex justify-between items-center">
                 <h3 className="text-sb-green font-bold text-[1.6rem] uppercase tracking-wider flex items-center gap-3">
                   <Play size={18} className="fill-sb-green" /> Campaign Sequence
                 </h3>
                 <span className="text-[1rem] bg-sb-accent text-white px-4 py-1 sb-pill font-black tracking-widest uppercase shadow-lg">Optimized</span>
               </div>
               <div className="p-8 space-y-6">
                  {[
                    { step: 1, action: "Identify Pain Points", detail: "Scans profile for recent posts & interests" },
                    { step: 2, action: "Generate Hook", detail: "Personalized first line using Neural Synthesis" },
                    { step: 3, action: "Deploy Message", detail: "Sent via LinkedIn / Email Relay" },
                    { step: 4, action: "Auto-Followup", detail: "Triggered if no response in 72 hours" }
                  ].map((s) => (
                    <div key={s.step} className="flex gap-8 p-8 bg-sb-cream/20 rounded-[12px] border border-sb-green/5 hover:bg-sb-cream/50 transition-all group">
                       <span className="w-12 h-12 rounded-full bg-sb-house text-sb-gold flex items-center justify-center text-[1.4rem] font-black shrink-0 shadow-md">
                         {s.step}
                       </span>
                       <div>
                          <h4 className="text-[1.6rem] font-bold uppercase tracking-tight text-sb-green mb-1">{s.action}</h4>
                          <p className="text-[1.3rem] text-black/40 font-bold uppercase tracking-widest">{s.detail}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Outreach Stats */}
          <div className="space-y-12">
            <div className="bg-sb-house text-white p-12 rounded-[12px] sb-shadow-frap relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-sb-accent" />
               <div className="flex items-center gap-4 mb-12 opacity-50">
                  <BarChart2 size={20} />
                  <span className="text-[1.2rem] font-bold uppercase tracking-widest drop-shadow-sm">Engine Stats</span>
               </div>
               <div className="space-y-12">
                  <OutreachStat label="Messages Sent" value="1,204" />
                  <OutreachStat label="Reply Rate" value="12.4%" />
                  <OutreachStat label="Meetings Booked" value="42" />
               </div>
            </div>

            <div className="p-10 bg-white border border-sb-green/10 italic text-[1.4rem] leading-relaxed text-black/60 rounded-[12px] tracking-sb sb-shadow-card">
               "System intelligence has detected a higher response rate using 'Thought-Leadership' hooks for CTO targets in the SaaS niche. Strategy auto-adjusted."
            </div>
          </div>
        </div>
      </main>

      {/* Signature Floating Frap Button */}
      <button className="fixed bottom-12 right-12 w-[5.6rem] h-[5.6rem] bg-sb-accent rounded-full flex items-center justify-center text-white sb-shadow-frap sb-button-active z-[60]">
        <Zap className="fill-white w-6 h-6" />
      </button>
    </div>
  );
}

function OutreachStat({ label, value }: { label: string, value: string }) {
  return (
    <div className="group">
      <p className="text-[1.2rem] opacity-40 uppercase tracking-widest mb-2 font-bold group-hover:opacity-60 transition-all">{label}</p>
      <h3 className="text-[4rem] font-bold tracking-sb leading-tight drop-shadow-md text-sb-gold">{value}</h3>
    </div>
  );
}
