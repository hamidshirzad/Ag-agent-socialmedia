import { useEffect, useMemo, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Sidebar } from "../components/Sidebar";
import PageMeta from "../components/PageMeta";
import { Tooltip } from "../components/Tooltip";
import { ChevronLeft, ChevronRight, Share2, Eye, Edit3, Zap } from "lucide-react";
import { cn } from "../lib/utils";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import type { Post } from "../types";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toJsDate(value: Post["scheduledAt"]): Date {
  if (value?.toDate) return value.toDate();
  return new Date(value);
}

export default function Calendar() {
  const { profile } = useAuth();
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (!profile?.id) return;
    const postsQ = query(
      collection(db, "posts"),
      where("userId", "==", profile.id),
      where("status", "==", "scheduled"),
    );
    const unsub = onSnapshot(
      postsQ,
      snap => setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Post))),
      err => handleFirestoreError(err, OperationType.LIST, "posts"),
    );
    return unsub;
  }, [profile?.id]);

  const schedule = useMemo(() => {
    const byDay = new Map<number, { type: string; title: string; time: string }[]>();
    for (const post of posts) {
      const date = toJsDate(post.scheduledAt);
      if (date.getMonth() !== currentMonth || date.getFullYear() !== currentYear) continue;
      const day = date.getDate();
      const items = byDay.get(day) || [];
      items.push({
        type: post.platforms?.[0] || "Post",
        title: post.caption,
        time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
      byDay.set(day, items);
    }
    return byDay;
  }, [posts, currentMonth, currentYear]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  // getDay(): 0=Sun..6=Sat; shift so the grid starts on Monday.
  const firstWeekday = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;
  const totalCells = Math.ceil((daysInMonth + firstWeekday) / 7) * 7;

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const scheduledQueue = useMemo(
    () => [...posts].sort((a, b) => toJsDate(a.scheduledAt).getTime() - toJsDate(b.scheduledAt).getTime()).slice(0, 3),
    [posts],
  );

  return (
    <div className="flex min-h-screen bg-sb-cream text-black font-sans tracking-sb">
      <PageMeta title="Calendar" description="Schedule and manage your content publication calendar." path="/calendar" />
      <Sidebar />
      <main className="flex-1 p-12 lg:p-24 overflow-y-auto">
        <header className="flex justify-between items-end mb-16 pb-8 border-b border-black/10">
          <div>
            <h1 className="text-sb-green font-semibold text-[3.6rem] leading-tight mb-2 uppercase tracking-sb">Relay Grid</h1>
            <p className="text-[1.6rem] text-black/50 font-medium">Multi-Platform Distribution Schedule</p>
          </div>
          <div className="flex gap-4">
            <Tooltip content="Previous Month" placement="bottom">
              <button onClick={goToPreviousMonth} aria-label="Previous month" className="w-14 h-14 bg-white flex items-center justify-center rounded-full sb-shadow-nav sb-button-active border border-black/5">
                <ChevronLeft size={20} className="text-sb-green" />
              </button>
            </Tooltip>
            <div className="px-10 py-4 bg-white sb-shadow-nav rounded-full font-bold text-[1.4rem] uppercase tracking-widest text-sb-green border border-black/5">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </div>
            <Tooltip content="Next Month" placement="bottom">
              <button onClick={goToNextMonth} aria-label="Next month" className="w-14 h-14 bg-white flex items-center justify-center rounded-full sb-shadow-nav sb-button-active border border-black/5">
                <ChevronRight size={20} className="text-sb-green" />
              </button>
            </Tooltip>
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
            {Array.from({ length: totalCells }).map((_, i) => {
              const dayNum = i - firstWeekday + 1;
              const dayData = dayNum >= 1 && dayNum <= daysInMonth ? schedule.get(dayNum) : undefined;
              const inMonth = dayNum >= 1 && dayNum <= daysInMonth;

              return (
                <div key={i} className={cn(
                  "min-h-[16rem] p-6 border-r border-b border-black/5 transition-all relative overflow-hidden",
                  !inMonth ? "bg-sb-cream/20" : "hover:bg-sb-cream/40 cursor-pointer"
                )}>
                  {inMonth && (
                    <>
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-[1.8rem] font-bold tracking-tight text-sb-green/40">{dayNum}</span>
                        {dayData && (
                          <div className="w-2.5 h-2.5 rounded-full bg-sb-accent shadow-lg animate-pulse" />
                        )}
                      </div>
                      <div className="space-y-3">
                         {dayData?.map((item, idx) => (
                           <div key={idx} className="p-4 bg-sb-house text-white rounded-[8px] text-[1.2rem] font-bold uppercase tracking-tight shadow-md hover:translate-y-[-2px] transition-transform">
                              <div className="flex justify-between mb-2 opacity-50">
                                 <span>{item.time}</span>
                                 <span className="text-sb-gold">{item.type}</span>
                              </div>
                              <div className="truncate drop-shadow-md">{item.title}</div>
                           </div>
                         ))}
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
                <span className="text-[1rem] bg-sb-house text-white px-3 py-1 sb-pill font-black tracking-widest uppercase">{posts.length} Pending</span>
              </div>
              <div className="p-0">
                 {scheduledQueue.length === 0 ? (
                   <div className="p-8 text-center text-[1.4rem] text-black/30 font-medium italic">No posts scheduled.</div>
                 ) : scheduledQueue.map(post => (
                   <div key={post.id} className="flex justify-between items-center p-8 border-b border-black/5 hover:bg-sb-cream/30 transition-all group">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 bg-sb-ceramic rounded-[8px] overflow-hidden flex items-center justify-center">
                            <Share2 size={24} className="text-sb-green/20" />
                         </div>
                         <div>
                            <p className="text-[1.4rem] font-bold uppercase tracking-tight text-sb-green mb-1 truncate max-w-[24rem]">{post.caption}</p>
                            <p className="text-[1.2rem] opacity-50 font-medium italic">Ready for distribution on {toJsDate(post.scheduledAt).toLocaleDateString()}</p>
                         </div>
                      </div>
                      <Tooltip content="Edit Post" placement="left">
                        <button aria-label="Edit post" className="w-12 h-12 flex items-center justify-center bg-sb-cream rounded-full text-sb-green opacity-0 group-hover:opacity-100 transition-all sb-button-active">
                          <Edit3 size={18} />
                        </button>
                      </Tooltip>
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
