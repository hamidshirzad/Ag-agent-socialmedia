import { useEffect, useState, type CSSProperties } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  NAV, PAGE_META, GROUP_LABELS, type ScreenId, type GroupId,
} from "./consoleData";
import { MAIN_DASHBOARD_HTML } from "./assets";
import { MinionBar } from "./MinionBar";
import "./console.css";

const Icon = ({ name, className, style }: { name: string; className?: string; style?: CSSProperties }) => (
  <span className={`material-symbols-outlined${className ? " " + className : ""}`} style={style}>{name}</span>
);

/** Placeholder for the 14 not-yet-ported screens (scaffolded per plan). */
function ScreenPlaceholder({ label, group }: { label: string; group: GroupId }) {
  return (
    <div className="p-container-padding max-w-[1400px] mx-auto">
      <div className="glass-card rounded-xl p-10 flex flex-col items-center justify-center text-center gap-3 min-h-[360px]">
        <Icon name="construction" className="text-primary-container" style={{ fontSize: 40 }} />
        <h1 className="font-h2 text-h2 text-on-surface">{label}</h1>
        <p className="text-on-surface-variant font-body-main max-w-md">
          The <span className="text-primary">{GROUP_LABELS[group]}</span> · {label} screen is scaffolded and
          coming soon. The main Dashboard is fully live — pick it from the sidebar to explore.
        </p>
        <span className="text-label-caps font-label-caps text-secondary mt-2">SCREEN SCAFFOLDED</span>
      </div>
    </div>
  );
}

export default function DashboardConsole() {
  const { profile, logout } = useAuth();
  const [screen, setScreen] = useState<ScreenId>("main_dashboard_overview");
  const [openGroups, setOpenGroups] = useState<Set<GroupId>>(new Set(["dashboard"]));
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Give the console a normal root font-size + locked scroll while mounted.
  useEffect(() => {
    document.documentElement.classList.add("fd-console-active");
    return () => document.documentElement.classList.remove("fd-console-active");
  }, []);

  const meta = PAGE_META[screen];

  const navigate = (id: ScreenId) => {
    setScreen(id);
    setOpenGroups((prev) => new Set(prev).add(PAGE_META[id].group));
    setMobileOpen(false);
  };

  const toggleGroup = (g: GroupId) =>
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(g) ? next.delete(g) : next.add(g);
      return next;
    });

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) setMobileOpen((v) => !v);
    else setCollapsed((v) => !v);
  };

  const planLabel = (profile?.plan ?? "starter").toUpperCase();

  return (
    <div className="fd-console font-body-main">
      {/* mobile overlay */}
      <div className={`mobile-overlay${mobileOpen ? " show" : ""}`} onClick={() => setMobileOpen(false)} />

      {/* SIDEBAR */}
      <aside className={`fd-sidebar${collapsed ? " collapsed" : ""}${mobileOpen ? " mobile-open" : ""}`}>
        <div className="sidebar-logo">
          <div className="logo-icon"><Icon name="rocket_launch" style={{ color: "#818cf8", fontSize: 19 }} /></div>
          <div>
            <div className="logo-title">Fourdoor AI</div>
            <div className="logo-sub">Autonomous Marketing</div>
          </div>
        </div>

        <div className="nav-section">
          {NAV.map((grp) => {
            const isOpen = openGroups.has(grp.id);
            return (
              <div className="nav-group" key={grp.id}>
                <button className={`nav-group-btn${isOpen ? " open" : ""}`} onClick={() => toggleGroup(grp.id)}>
                  <Icon name={grp.icon} /><span>{grp.label}</span>
                  <Icon name="expand_more" className="chevron" />
                </button>
                <div className={`nav-group-items${isOpen ? " open" : ""}`}>
                  {grp.items.map((it) => (
                    <button
                      key={it.id}
                      className={`nav-item${screen === it.id ? " active" : ""}`}
                      onClick={() => navigate(it.id)}
                    >
                      <Icon name={it.icon} /><span>{it.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <button className="new-campaign-btn"><Icon name="add" style={{ fontSize: 17 }} />New Campaign</button>
        <div className="sidebar-footer">
          <button className="footer-btn"><Icon name="help" style={{ fontSize: 17 }} />Support</button>
          <button className="footer-btn"><Icon name="menu_book" style={{ fontSize: 17 }} />Documentation</button>
        </div>
      </aside>

      {/* TOPBAR */}
      <nav className={`fd-topbar${collapsed ? " full" : ""}`}>
        <div className="topbar-left">
          <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar"><Icon name="menu" /></button>
          <span className="breadcrumb">{GROUP_LABELS[meta.group]}</span>
          <span style={{ color: "#334155" }}>/</span>
          <span className="page-title">{meta.label}</span>
        </div>
        <div className="topbar-right">
          <div className="flex items-center bg-[#1e293b]/50 border border-white/[.06] rounded-md py-1 px-[11px] gap-[7px] mr-1">
            <Icon name="search" className="text-[#475569] text-[15px]" />
            <input className="bg-transparent border-none outline-none text-[#cbd5e1] text-[13px] w-[110px]" placeholder="Search..." />
          </div>
          <span className="plan-badge">{planLabel}</span>
          <button className="topbar-btn" aria-label="Notifications"><Icon name="notifications" /></button>
          <button className="topbar-btn" aria-label="Log out" title="Log out" onClick={() => logout()}><Icon name="account_circle" /></button>
        </div>
      </nav>

      {/* CONTENT */}
      <div className={`fd-content${collapsed ? " full" : ""}`}>
        {screen === "main_dashboard_overview" ? (
          <div className="page-fade-in" dangerouslySetInnerHTML={{ __html: MAIN_DASHBOARD_HTML }} />
        ) : (
          <div className="page-fade-in"><ScreenPlaceholder label={meta.label} group={meta.group} /></div>
        )}
      </div>

      {/* MINION BAR */}
      <MinionBar collapsed={collapsed} onNavigate={navigate} />
    </div>
  );
}
