import { NavLink } from "react-router-dom";
import { 
  BarChart3,
  Users,
  Zap,
  Calendar,
  Inbox,
  Settings,
  LogOut,
  Target,
  Rocket,
  TrendingUp,
  CreditCard,
  Briefcase
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../lib/utils";

export function Sidebar() {
  const { logout, user } = useAuth();

  const navItems = [
    { icon: BarChart3, label: "Overview", h: "/dashboard" },
    { icon: Target, label: "Campaigns", h: "/campaigns" },
    { icon: Rocket, label: "Content Engine", h: "/content" },
    { icon: Briefcase, label: "Job Signals", h: "/jobs" },
    { icon: Inbox, label: "Lead Inbox", h: "/leads" },
    { icon: TrendingUp, label: "Scoring Engine", h: "/scoring" },
    { icon: CreditCard, label: "Billing", h: "/billing" },
    { icon: Target, label: "Cold Outreach", h: "/outreach" },
    { icon: Calendar, label: "Calendar", h: "/calendar" },
    { icon: Settings, label: "Engine Settings", h: "/settings" },
  ];

  return (
    <aside className="w-72 border-r border-black/5 flex flex-col h-screen bg-white sb-shadow-nav z-50">
      <div className="p-10 border-b border-black/5 bg-sb-house text-white">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Zap size={20} className="text-sb-house fill-sb-house" />
          </div>
          <span className="font-bold tracking-sb text-[1.8rem] uppercase">Fourdoor AI</span>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.h}
            to={item.h}
            className={({ isActive }) => cn(
              "flex items-center gap-4 px-6 py-4 text-[1.4rem] font-bold uppercase tracking-widest sb-pill transition-all",
              isActive 
                ? "bg-sb-house text-white shadow-lg" 
                : "hover:bg-sb-cream text-black/60 hover:text-sb-green"
            )}
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-black/5 bg-sb-ceramic/30">
        <div className="flex items-center gap-4 p-4 mb-4 bg-white rounded-[12px] sb-shadow-card truncate">
          <div className="w-10 h-10 rounded-full bg-sb-accent flex items-center justify-center text-[1.2rem] text-white font-bold shrink-0">
             {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="truncate">
            <p className="text-[1.2rem] font-bold truncate leading-none mb-1 text-sb-green">{user?.email}</p>
            <p className="text-[1.1rem] opacity-50 uppercase tracking-widest font-black">Operator</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-4 w-full px-6 py-4 text-[1.4rem] font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 sb-pill transition-all sb-button-active"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
