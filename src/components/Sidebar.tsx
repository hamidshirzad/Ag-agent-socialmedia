import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Zap,
  Calendar,
  Inbox,
  Settings,
  LogOut,
  Target,
  Rocket,
  TrendingUp,
  CreditCard,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../lib/utils";

export function Sidebar() {
  const { logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { icon: BarChart3,   label: "Overview",        h: "/dashboard" },
    { icon: Target,      label: "Campaigns",        h: "/campaigns" },
    { icon: Rocket,      label: "Content Engine",   h: "/content" },
    { icon: Inbox,       label: "Lead Inbox",       h: "/leads" },
    { icon: TrendingUp,  label: "Scoring Engine",   h: "/scoring" },
    { icon: CreditCard,  label: "Billing",          h: "/billing" },
    { icon: Target,      label: "Cold Outreach",    h: "/outreach" },
    { icon: Calendar,    label: "Calendar",         h: "/calendar" },
    { icon: Settings,    label: "Engine Settings",  h: "/settings" },
  ];

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
        className="md:hidden fixed top-6 left-6 z-[60] w-12 h-12 bg-sb-house text-white rounded-full flex items-center justify-center shadow-lg"
      >
        <Menu size={18} aria-hidden="true" />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "w-72 border-r border-black/5 flex flex-col bg-white sb-shadow-nav",
          "fixed inset-y-0 left-0 z-50 transition-transform duration-300",
          "md:static md:translate-x-0 md:h-screen",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-10 border-b border-black/5 bg-sb-house text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Zap size={20} className="text-sb-house fill-sb-house" aria-hidden="true" />
            </div>
            <span className="font-bold tracking-sb text-[1.8rem] uppercase">Fourdoor AI</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
            className="md:hidden text-white/60 hover:text-white transition-colors"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.h}
              to={item.h}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-4 px-6 py-4 text-[1.4rem] font-bold uppercase tracking-widest sb-pill transition-all",
                isActive
                  ? "bg-sb-house text-white shadow-lg"
                  : "hover:bg-sb-cream text-black/60 hover:text-sb-green"
              )}
            >
              <item.icon size={18} aria-hidden="true" />
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
            aria-label="Sign out of your account"
            className="flex items-center gap-4 w-full px-6 py-4 text-[1.4rem] font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 sb-pill transition-all sb-button-active"
          >
            <LogOut size={18} aria-hidden="true" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
