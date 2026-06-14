import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collection, deleteDoc, doc, onSnapshot, query, where } from "firebase/firestore";
import { Sidebar } from "../components/Sidebar";
import PageMeta from "../components/PageMeta";
import { Tooltip } from "../components/Tooltip";
import { ChevronLeft, ChevronRight, Share2, Eye, Trash2, Plus, Zap } from "lucide-react";
import { cn } from "../lib/utils";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import type { Post } from "../types";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function toDate(value: any): Date {
  if (value?.seconds != null) return new Date(value.seconds * 1000);
  return new Date(value);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function Calendar() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [viewDate, setViewDate] = useState(() => new Date());

  useEffect(() => {
    if (!profile?.id) return;
    const q = query(
      collection(db, "posts"),
      where("userId", "==", profile.id),
      where("status", "==", "scheduled"),
    );
    const unsubscribe = onSnapshot(
      q,
      snap => setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Post))),
      err => handleFirestoreError(err, OperationType.LIST, "posts"),
    );
    return unsubscribe;
  }, [profile?.id]);

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const { firstWeekday, daysInMonth, totalCells } = useMemo(() => {
    const firstDay     = new Date(year, month, 1).getDay();
    const firstWeekday = (firstDay + 6) % 7; // Monday-first grid
    const daysInMonth  = new Date(year, month + 1, 0).getDate();
    const totalCells   = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
    return { firstWeekday, daysInMonth, totalCells };
  }, [year, month]);

  const postsByDay = useMemo(() => {
    const map = new Map<number, Post[]>();
    for (const post of posts) {
      const date = toDate(post.scheduledAt);
      if (date.getFullYear() === year && date.getMonth() === month) {
        const day = date.getDate();
        map.set(day, [...(map.get(day) ?? []), post]);
      }
    }
    return map;
  }, [posts, year, month]);

  const upcoming = useMemo(() => {
    const now = new Date();
    return [...posts]
      .filter(p => toDate(p.scheduledAt) >= now)
      .sort((a, b) => toDate(a.scheduledAt).getTime() - toDate(b.scheduledAt).getTime())
      .slice(0, 3);
  }, [posts]);

  const goToPrevMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goToNextMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const handleCancel = async (postId: string) => {
    if (!window.confirm("Cancel this scheduled post?")) return;
    await deleteDoc(doc(db, "posts", postId)).catch(err => handleFirestoreError(err, OperationType.DELETE, `posts/${postId}`));
  };

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
              <button onClick={goToPrevMonth} aria-label="Previous month" className="w-14 h-14 bg-white flex items-center justify-center rounded-full sb-shadow-nav sb-button-active border border-black/5">
                <ChevronLeft size={20} className="text-sb-green" />
              </button>
            </Tooltip>
            <div className="px-10 py-4 bg-white sb-shadow-nav rounded-full font-bold text-[1.4rem] uppercase tracking-widest text-sb-green border border-black/5">
              {viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
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
            {DAYS.map(day => (
              <div key={day} className="py-6 text-center font-bold text-[1.2rem] uppercase tracking-[0.2em] text-sb-green/60">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {Array.from({ length: totalCells }).map((_, i) => {
              const dayNum   = i - firstWeekday + 1;
              const inMonth  = dayNum >= 1 && dayNum <= daysInMonth;
              const dayItems = inMonth ? postsByDay.get(dayNum) ?? [] : [];

              return (
                <div key={i} className={cn(
                  "min-h-[16rem] p-6 border-r border-b border-black/5 transition-all relative overflow-hidden",
                  !inMonth ? "bg-sb-cream/20" : "hover:bg-sb-cream/40"
                )}>
                  {inMonth && (
                    <>
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-[1.8rem] font-bold tracking-tight text-sb-green/40">{dayNum}</span>
                        {dayItems.length > 0 && (
                          <div className="w-2.5 h-2.5 rounded-full bg-sb-accent shadow-lg animate-pulse" />
                        )}
                      </div>
                      <div className="space-y-3">
                        {dayItems.map(item => (
                          <div key={item.id} className="p-4 bg-sb-house text-white rounded-[8px] text-[1.2rem] font-bold uppercase tracking-tight shadow-md hover:translate-y-[-2px] transition-transform">
                            <div className="flex justify-between mb-2 opacity-50">
                              <span>{toDate(item.scheduledAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                              <span className="text-sb-gold">{item.platforms?.map(capitalize).join(", ")}</span>
                            </div>
                            <div className="truncate drop-shadow-md">{item.caption}</div>
                          </div>
                        ))}
                        <Link to="/content" className="w-full py-3 border-2 border-dashed border-sb-green/10 rounded-[8px] flex items-center justify-center text-sb-green/20 hover:text-sb-green/40 hover:border-sb-green/20 transition-all">
                          <Plus size={16} />
                        </Link>
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
                 {upcoming.length === 0 ? (
                   <div className="p-12 text-center text-[1.3rem] text-black/40 font-medium">
                     No upcoming posts scheduled.{" "}
                     <Link to="/content" className="text-sb-green underline">Create one</Link>
                   </div>
                 ) : upcoming.map(post => (
                   <div key={post.id} className="flex justify-between items-center p-8 border-b border-black/5 hover:bg-sb-cream/30 transition-all group">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 bg-sb-ceramic rounded-[8px] overflow-hidden flex items-center justify-center">
                            <Share2 size={24} className="text-sb-green/20" />
                         </div>
                         <div>
                            <p className="text-[1.4rem] font-bold uppercase tracking-tight text-sb-green mb-1 max-w-xs truncate">{post.caption}</p>
                            <p className="text-[1.2rem] opacity-50 font-medium italic">
                              {toDate(post.scheduledAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </p>
                         </div>
                      </div>
                      <Tooltip content="Cancel Post" placement="left">
                        <button onClick={() => handleCancel(post.id)} aria-label="Cancel post" className="w-12 h-12 flex items-center justify-center bg-sb-cream rounded-full text-sb-green opacity-0 group-hover:opacity-100 transition-all sb-button-active">
                          <Trash2 size={18} />
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
      <Link to="/content" className="fixed bottom-12 right-12 w-[5.6rem] h-[5.6rem] bg-sb-accent rounded-full flex items-center justify-center text-white sb-shadow-frap sb-button-active z-[60]">
        <Zap className="fill-white w-6 h-6" />
      </Link>
    </div>
  );
}
