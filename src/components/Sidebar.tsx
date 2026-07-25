import { useState, useRef, useEffect } from "react";
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
  Bell,
  Sparkles,
  Check,
  X,
  Star,
  Trash2,
  CheckSquare
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import { cn } from "../lib/utils";

export function Sidebar() {
  const { logout, user } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearAllNotifications, 
    simulateHighQualityLead, 
    simulateBillingUpdate 
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const navItems = [
    { icon: BarChart3, label: "Overview", h: "/dashboard" },
    { icon: Target, label: "Campaigns", h: "/campaigns" },
    { icon: Rocket, label: "Content Engine", h: "/content" },
    { icon: Inbox, label: "Lead Inbox", h: "/leads" },
    { icon: TrendingUp, label: "Scoring Engine", h: "/scoring" },
    { icon: Users, label: "Team", h: "/team" },
    { icon: CreditCard, label: "Billing", h: "/billing" },
    { icon: Target, label: "Cold Outreach", h: "/outreach" },
    { icon: Calendar, label: "Calendar", h: "/calendar" },
    { icon: Settings, label: "Engine Settings", h: "/settings" },
  ];

  return (
    <aside className="w-72 border-r border-black/5 flex flex-col h-screen bg-white sb-shadow-nav z-50 relative">
      <div className="p-10 border-b border-black/5 bg-sb-house text-white">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Zap size={20} className="text-sb-house fill-sb-house" />
          </div>
          <span className="font-bold tracking-sb text-[1.8rem] uppercase">Fourdoor AI</span>
        </div>
      </div>
      
      <div className="p-4 border-b border-black/5 bg-sb-cream/40">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-4 px-6 py-4 w-full text-[1.25rem] font-bold uppercase tracking-widest sb-pill transition-all relative cursor-pointer",
            isOpen ? "bg-sb-gold/15 text-sb-green border border-sb-gold/30" : "hover:bg-sb-cream text-black/60 hover:text-sb-green"
          )}
        >
          <div className="relative">
            <Bell size={18} className={cn(isOpen && "text-sb-gold fill-current")} />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white font-black text-[0.8rem] w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="flex-1 text-left font-bold">Command Alerts</span>
          <span className="text-[1rem] opacity-40 font-black bg-black/5 px-2 py-0.5 rounded-full">
            {notifications.length}
          </span>
        </button>
      </div>

      {/* Persistent Popover / Dropdown Drawer */}
      {isOpen && (
        <div 
          ref={popoverRef}
          className="absolute left-80 bottom-12 w-[38rem] bg-white border border-black/10 rounded-[16px] shadow-2xl z-[999] flex flex-col overflow-hidden max-h-[580px] animate-in fade-in-50 zoom-in-95 duration-200"
        >
          {/* Popover Header */}
          <div className="p-6 border-b border-black/5 bg-sb-house text-white flex justify-between items-center">
            <div>
              <h3 className="font-bold text-[1.4rem] uppercase tracking-wider flex items-center gap-2 text-sb-gold">
                <Sparkles size={16} /> Signal Command Center
              </h3>
              <p className="text-[1rem] opacity-60 uppercase tracking-widest mt-1">Live Ingestion & Billing Nodes</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Action Row */}
          <div className="px-6 py-3 bg-sb-cream border-b border-black/5 flex justify-between items-center text-[1.1rem] font-black uppercase tracking-widest">
            <span className="text-black/45">{unreadCount} Unread Telemetry Logs</span>
            <div className="flex gap-4">
              <button 
                onClick={markAllAsRead} 
                className="text-sb-green hover:text-sb-accent flex items-center gap-1 cursor-pointer transition-colors"
                title="Mark all notifications as read"
              >
                <Check size={12} /> Read All
              </button>
              <button 
                onClick={clearAllNotifications} 
                className="text-red-600 hover:text-red-500 flex items-center gap-1 cursor-pointer transition-colors"
                title="Permanently erase all notification history"
              >
                <Trash2 size={12} /> Clear Log
              </button>
            </div>
          </div>

          {/* Scrollable Feed */}
          <div className="flex-1 overflow-y-auto max-h-[300px] p-4 space-y-3 bg-sb-ceramic/10">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-black/30 italic space-y-2">
                <Bell size={24} className="mx-auto opacity-30 animate-bounce" />
                <p className="text-[1.2rem] font-bold uppercase tracking-widest">Ingestion Lines Clear</p>
                <p className="text-[1rem] uppercase tracking-widest">No signals received yet.</p>
              </div>
            ) : (
              notifications.map((notif) => {
                let badgeColor = "bg-blue-50 text-blue-700 border-blue-200";
                let Icon = Bell;
                if (notif.type === "lead") {
                  badgeColor = "bg-sb-gold/10 text-sb-gold border-sb-gold/20";
                  Icon = Star;
                } else if (notif.type === "billing") {
                  badgeColor = "bg-sb-accent/10 text-sb-green border-sb-accent/20";
                  Icon = CreditCard;
                }

                return (
                  <div 
                    key={notif.id}
                    onClick={() => !notif.isRead && markAsRead(notif.id)}
                    className={cn(
                      "p-4 border rounded-[12px] bg-white hover:bg-sb-cream/30 transition-all cursor-pointer relative text-left",
                      notif.isRead ? "opacity-65 border-black/5" : "border-sb-accent/30 shadow-sm"
                    )}
                  >
                    {!notif.isRead && (
                      <span className="absolute top-4 right-4 w-2 h-2 bg-sb-accent rounded-full animate-ping" />
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn("px-2.5 py-0.5 rounded-full border text-[0.9rem] font-bold uppercase tracking-wider flex items-center gap-1.5", badgeColor)}>
                        <Icon size={10} /> {notif.type}
                      </span>
                      <span className="text-[1rem] opacity-40 font-bold ml-auto">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h4 className="font-bold text-[1.2rem] text-sb-house mb-1 leading-snug">{notif.title}</h4>
                    <p className="text-[1.1rem] text-black/60 leading-normal font-medium">{notif.message}</p>
                  </div>
                );
              })
            )}
          </div>

          {/* Popover Simulator Panel */}
          <div className="p-6 bg-sb-cream/60 border-t border-black/5 space-y-4">
            <h4 className="text-[1.1rem] font-black uppercase tracking-[0.15em] text-sb-green/60 block text-left">
              Telemetry Simulator Suite
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={simulateHighQualityLead}
                className="py-3 px-4 bg-sb-house hover:bg-sb-green text-sb-gold hover:text-white rounded-full text-[1rem] font-black uppercase tracking-widest transition-all sb-button-active shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                title="Generates a real new lead with high neural score in Firestore to test real-time alerts"
              >
                <Star size={10} className="fill-current text-sb-gold" /> Ingest Lead
              </button>
              <button 
                onClick={simulateBillingUpdate}
                className="py-3 px-4 bg-sb-accent hover:bg-sb-green text-white rounded-full text-[1rem] font-black uppercase tracking-widest transition-all sb-button-active shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                title="Toggles workspace plan tier to trigger billing configuration updates"
              >
                <CreditCard size={10} /> Upgrade Node
              </button>
            </div>
          </div>
        </div>
      )}
      
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
          className="flex items-center gap-4 w-full px-6 py-4 text-[1.4rem] font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 sb-pill transition-all sb-button-active cursor-pointer"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
