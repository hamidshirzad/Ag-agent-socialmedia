import { Sidebar } from "../components/Sidebar";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Share2, Eye, Edit3, Plus } from "lucide-react";
import { cn } from "../lib/utils";

export default function Calendar() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  // Mock calendar items
  const schedule = [
    { day: 12, items: [{ type: "LinkedIn", title: "Scale Case Study", time: "09:00" }] },
    { day: 14, items: [{ type: "TikTok", title: "Morning Tips", time: "18:30" }, { type: "X", title: "Thread: AI Growth", time: "12:00" }] },
    { day: 15, items: [{ type: "Instagram", title: "Product Reveal", time: "15:00" }] },
  ];

  return (
    <div className="flex min-h-screen bg-sb-cream text-black font-sans tracking-sb">
      <Sidebar />
      <main className="flex-1 p-12 lg:p-24 overflow-y-auto">
        <header className="flex justify-between items-end mb-16 pb-8 border-b border-black/10">
          <div>
            <h1 className="text-sb-green font-semibold text-[3.6rem] leading-tight mb-2 uppercase tracking-sb">Relay Grid</h1>
            <p className="text-[1.6rem] text-black/50 font-medium">Multi-Platform Distribution Schedule</p>
          </div>
          <div className="flex gap-4">
            <button className="w-14 h-14 bg-white flex items-center justify-center rounded-full sb-shadow-nav sb-button-active border border-black/5">
              <ChevronLeft size={20} className="text-sb-green" />
            </button>
            <div className="px-10 py-4 bg-white sb-shadow-nav rounded-full font-bold text-[1.4rem] uppercase tracking-widest text-sb-green border border-black/5">
              May 2026
            </div>
            <button className="w-14 h-14 bg-white flex items-center justify-center rounded-full sb-shadow-nav sb-button-active border border-black/5">
              <ChevronRight size={20} className="text-sb-green" />
            </button>
          </div>
        </header>

        <div className="bg-white rounded-[12px] sb-shadow-card overflow-hidden">
          <div className="grid grid-cols-7 border-b border-black/5 bg-sb-ceramic">
            {days.map(day => (
              <div key={day} className="py-6 text-center font-bold text-[1.2rem] uppercase tracking-[0.2em] text-sb-green/60">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7">
            {Array.from({ length: 35 }).map((_, i) => {
              const dayNum = i - 3 + 1; // Simple offset for may 2026
              const dayData = schedule.find(s => s.day === dayNum);
              
              return (
                <div key={i} className={cn(
                  "min-h-[16rem] p-6 border-r border-b border-black/5 transition-all relative overflow-hidden",
                  dayNum < 1 || dayNum > 31 ? "bg-sb-cream/20" : "hover:bg-sb-cream/40 cursor-pointer"
                )}>
                  {dayNum > 0 && dayNum <= 31 && (
                    <>
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-[1.8rem] font-bold tracking-tight text-sb-green/40">{dayNum}</span>
                        {dayData && (
                          <div className="w-2.5 h-2.5 rounded-full bg-sb-accent shadow-lg animate-pulse" />
                        )}
                      </div>
                      <div className="space-y-3">
                         {dayData?.items.map((item, idx) => (
                           <div key={idx} className="p-4 bg-sb-house text-white rounded-[8px] text-[1.1rem] font-bold uppercase tracking-tight shadow-md hover:translate-y-[-2px] transition-transform">
                              <div className="flex justify-between mb-2 opacity-50">
                                 <span>{item.time}</span>
                                 <span className="text-sb-gold">{item.type}</span>
                              </div>
                              <div className="truncate drop-shadow-md">{item.title}</div>
                           </div>
                         ))}
                         {dayNum === 16 && (
                            <button className="w-full py-3 border-2 border-dashed border-sb-green/10 rounded-[8px] flex items-center justify-center text-sb-green/20 hover:text-sb-green/40 hover:border-sb-green/20 transition-all">
                              <Plus size={16} />
                            </button>
                         )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12">
           <div className="bg-white rounded-[12px] sb-shadow-card overflow-hidden">
              <div className="p-8 border-b border-black/5 bg-sb-ceramic flex justify-between items-center">
                <h3 className="text-sb-green font-bold text-[1.4rem] uppercase tracking-widest flex items-center gap-3">
                  <Eye size={18} className="fill-sb-green" /> Scheduled Queue
                </h3>
                <span className="text-[1rem] bg-sb-house text-white px-3 py-1 sb-pill font-black tracking-widest uppercase">3 Pending</span>
              </div>
              <div className="p-0">
                 {[1,2,3].map(i => (
                   <div key={i} className="flex justify-between items-center p-8 border-b border-black/5 hover:bg-sb-cream/30 transition-all group">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 bg-sb-ceramic rounded-[8px] overflow-hidden flex items-center justify-center">
                            <Share2 size={24} className="text-sb-green/20" />
                         </div>
                         <div>
                            <p className="text-[1.4rem] font-bold uppercase tracking-tight text-sb-green mb-1">Post Title {i}</p>
                            <p className="text-[1.2rem] opacity-50 font-medium italic">Ready for distribution on May 1{i}</p>
                         </div>
                      </div>
                      <button className="w-12 h-12 flex items-center justify-center bg-sb-cream rounded-full text-sb-green opacity-0 group-hover:opacity-100 transition-all sb-button-active">
                        <Edit3 size={18} />
                      </button>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-sb-house text-white rounded-[12px] sb-shadow-frap p-12 flex flex-col justify-center items-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-sb-accent" />
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8">
                <Share2 size={40} className="text-sb-accent fill-sb-accent" />
              </div>
              <h3 className="text-[2.4rem] font-bold tracking-sb mb-4 uppercase">Neural Bridge Active</h3>
              <p className="max-w-xs text-[1.4rem] opacity-60 font-medium leading-relaxed uppercase tracking-widest italic">
                System is optimized for high-traffic windows. Automated publishing is live across 4 platforms.
              </p>
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
