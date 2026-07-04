import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import './PrototypeLayout.css';

export default function PrototypeLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    dashboard: true,
    content: false,
    leads: false,
    analytics: false,
    settings: false
  });

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const handleNavigate = (path: string) => {
    navigate(`/prototype/${path}`);
  };

  return (
    <div className="font-body-main dark prototype-theme">
      {/* SIDEBAR */}
      <aside id="sidebar" className={sidebarOpen ? "" : "collapsed"}>
        <div className="sidebar-logo">
          <div className="logo-icon">
            <span className="material-symbols-outlined" style={{ color: '#818cf8', fontSize: '19px' }}>rocket_launch</span>
          </div>
          <div>
            <div className="logo-title">Fourdoor AI</div>
            <div className="logo-sub">Autonomous Marketing</div>
          </div>
        </div>
        
        <div className="nav-section">
          <div className="nav-group">
            <button className={`nav-group-btn ${openGroups.dashboard ? 'open' : ''}`} onClick={() => toggleGroup('dashboard')}>
              <span className="material-symbols-outlined">dashboard</span><span>Dashboard</span>
              <span className="material-symbols-outlined chevron">expand_more</span>
            </button>
            <div className={`nav-group-items ${openGroups.dashboard ? 'open' : ''}`}>
              <button className="nav-item" onClick={() => handleNavigate('main-dashboard-overview')}><span className="material-symbols-outlined">dashboard</span><span>Dashboard</span></button>
              <button className="nav-item" onClick={() => handleNavigate('main-dashboard')}><span className="material-symbols-outlined">space_dashboard</span><span>Overview</span></button>
              <button className="nav-item" onClick={() => handleNavigate('dashboard-overview')}><span className="material-symbols-outlined">monitor</span><span>Command View</span></button>
            </div>
          </div>

          <div className="nav-group">
            <button className={`nav-group-btn ${openGroups.content ? 'open' : ''}`} onClick={() => toggleGroup('content')}>
              <span className="material-symbols-outlined">auto_awesome</span><span>Content</span>
              <span className="material-symbols-outlined chevron">expand_more</span>
            </button>
            <div className={`nav-group-items ${openGroups.content ? 'open' : ''}`}>
              <button className="nav-item" onClick={() => handleNavigate('content-agent-hub')}><span className="material-symbols-outlined">auto_awesome</span><span>Content Hub</span></button>
              <button className="nav-item" onClick={() => handleNavigate('content-hub-1')}><span className="material-symbols-outlined">library_books</span><span>Content Library</span></button>
              <button className="nav-item" onClick={() => handleNavigate('content-hub-2')}><span className="material-symbols-outlined">calendar_month</span><span>Content Calendar</span></button>
            </div>
          </div>

          <div className="nav-group">
            <button className={`nav-group-btn ${openGroups.leads ? 'open' : ''}`} onClick={() => toggleGroup('leads')}>
              <span className="material-symbols-outlined">filter_list</span><span>Leads</span>
              <span className="material-symbols-outlined chevron">expand_more</span>
            </button>
            <div className={`nav-group-items ${openGroups.leads ? 'open' : ''}`}>
              <button className="nav-item" onClick={() => handleNavigate('lead-pipeline-sales-agent')}><span className="material-symbols-outlined">filter_list</span><span>Lead Pipeline</span></button>
              <button className="nav-item" onClick={() => handleNavigate('lead-pipeline-1')}><span className="material-symbols-outlined">view_kanban</span><span>Lead Board</span></button>
              <button className="nav-item" onClick={() => handleNavigate('lead-pipeline-2')}><span className="material-symbols-outlined">task_alt</span><span>Qualification</span></button>
            </div>
          </div>

          <div className="nav-group">
            <button className={`nav-group-btn ${openGroups.analytics ? 'open' : ''}`} onClick={() => toggleGroup('analytics')}>
              <span className="material-symbols-outlined">insights</span><span>Analytics</span>
              <span className="material-symbols-outlined chevron">expand_more</span>
            </button>
            <div className={`nav-group-items ${openGroups.analytics ? 'open' : ''}`}>
              <button className="nav-item" onClick={() => handleNavigate('analytics-strategic-insights')}><span className="material-symbols-outlined">insights</span><span>Strategic Insights</span></button>
              <button className="nav-item" onClick={() => handleNavigate('analytics-insights-1')}><span className="material-symbols-outlined">bar_chart</span><span>Campaign Analytics</span></button>
              <button className="nav-item" onClick={() => handleNavigate('analytics-insights-2')}><span className="material-symbols-outlined">trending_up</span><span>Performance</span></button>
            </div>
          </div>

          <div className="nav-group">
            <button className={`nav-group-btn ${openGroups.settings ? 'open' : ''}`} onClick={() => toggleGroup('settings')}>
              <span className="material-symbols-outlined">settings</span><span>Settings</span>
              <span className="material-symbols-outlined chevron">expand_more</span>
            </button>
            <div className={`nav-group-items ${openGroups.settings ? 'open' : ''}`}>
              <button className="nav-item" onClick={() => handleNavigate('settings-integrations-1')}><span className="material-symbols-outlined">cable</span><span>Integrations</span></button>
              <button className="nav-item" onClick={() => handleNavigate('settings-integrations-2')}><span className="material-symbols-outlined">hub</span><span>Connections</span></button>
              <button className="nav-item" onClick={() => handleNavigate('system-settings')}><span className="material-symbols-outlined">tune</span><span>System</span></button>
            </div>
          </div>
        </div>

        <button className="new-campaign-btn">
          <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>add</span>New Campaign
        </button>
        <div className="sidebar-footer">
          <button className="footer-btn"><span className="material-symbols-outlined" style={{ fontSize: '17px' }}>help</span>Support</button>
          <button className="footer-btn"><span className="material-symbols-outlined" style={{ fontSize: '17px' }}>menu_book</span>Documentation</button>
        </div>
      </aside>

      {/* TOPBAR */}
      <nav id="topbar" className={sidebarOpen ? "" : "full"}>
        <div className="topbar-left">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span id="breadcrumb">Dashboard</span>
          <span style={{ color: '#334155' }}>/</span>
          <span id="page-title">Overview</span>
        </div>
        <div className="topbar-right">
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(30,41,59,.5)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '6px', padding: '4px 11px', gap: '7px', marginRight: '4px' }}>
            <span className="material-symbols-outlined" style={{ color: '#475569', fontSize: '15px' }}>search</span>
            <input style={{ background: 'none', border: 'none', outline: 'none', color: '#cbd5e1', fontSize: '13px', width: '110px' }} placeholder="Search..." />
          </div>
          <span className="plan-badge">PRO</span>
          <button className="topbar-btn"><span className="material-symbols-outlined">notifications</span></button>
          <button className="topbar-btn"><span className="material-symbols-outlined">account_circle</span></button>
        </div>
      </nav>

      {/* CONTENT WRAPPER */}
      <div id="content-wrap" className={sidebarOpen ? "" : "full"}>
        <div id="page-content" className="page-fade-in" key={window.location.pathname}>
          <Outlet />
        </div>
      </div>

      {/* MINION BAR */}
      <div id="minion-bar" className={sidebarOpen ? "" : "full"}>
        <div className="minion-wrap minion-active" onClick={() => handleNavigate('content-agent-hub')} title="Go to Content Hub">
          <svg className="minion-body" width="52" height="64" viewBox="0 0 52 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#5de6ff', filter: 'drop-shadow(0 0 6px #5de6ff88)' }}>
            <rect x="10" y="22" width="32" height="28" rx="6" fill="#0d1f3c" stroke="currentColor" strokeWidth="1.5" />
            <rect x="13" y="6" width="26" height="20" rx="5" fill="#0d1f3c" stroke="currentColor" strokeWidth="1.5" />
            <rect x="16" y="9" width="20" height="11" rx="3" fill="#5de6ff22" stroke="#5de6ff" strokeWidth="1" />
            <circle cx="21" cy="14" r="2.5" fill="#5de6ff" style={{ animation: 'blink 3s ease-in-out infinite' }} />
            <circle cx="31" cy="14" r="2.5" fill="#5de6ff" style={{ animation: 'blink 3s ease-in-out infinite 0.15s' }} />
            <circle cx="22" cy="14" r="1" fill="#001a2e" />
            <circle cx="32" cy="14" r="1" fill="#001a2e" />
            <rect x="15" y="27" width="22" height="14" rx="2" fill="#001a2e" stroke="#5de6ff44" strokeWidth="0.5" />
            <rect x="17" y="30" width="12" height="1.5" rx="0.75" fill="#5de6ff" style={{ animation: 'screen-flicker 1s ease-in-out infinite' }} />
            <rect x="17" y="33" width="16" height="1.5" rx="0.75" fill="#5de6ff88" />
            <rect x="17" y="36" width="9" height="1.5" rx="0.75" fill="#5de6ff55" style={{ animation: 'screen-flicker 0.8s ease-in-out infinite 0.4s' }} />
            <rect x="27" y="36" width="1" height="1.5" fill="#5de6ff" style={{ animation: 'blink 0.8s ease-in-out infinite' }} />
            <rect x="2" y="32" width="8" height="4" rx="2" fill="#0d1f3c" stroke="currentColor" strokeWidth="1.2" style={{ transformOrigin: '10px 34px', animation: 'arm-type 0.4s ease-in-out infinite' }} />
            <rect x="42" y="32" width="8" height="4" rx="2" fill="#0d1f3c" stroke="currentColor" strokeWidth="1.2" style={{ transformOrigin: '42px 34px', animation: 'arm-type 0.4s ease-in-out infinite 0.2s' }} />
            <line x1="26" y1="6" x2="26" y2="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="26" cy="1" r="2" fill="currentColor" style={{ animation: 'pulse-glow 1s ease-in-out infinite' }} />
            <rect x="16" y="50" width="7" height="10" rx="2" fill="#0d1f3c" stroke="currentColor" strokeWidth="1.2" />
            <rect x="29" y="50" width="7" height="10" rx="2" fill="#0d1f3c" stroke="currentColor" strokeWidth="1.2" />
            <rect x="14" y="58" width="11" height="5" rx="2" fill="currentColor" opacity="0.8" />
            <rect x="27" y="58" width="11" height="5" rx="2" fill="currentColor" opacity="0.8" />
          </svg>
          <span className="minion-label" style={{ color: '#5de6ff' }}>Content</span>
          <span className="minion-status">● ACTIVE</span>
        </div>

        <div className="minion-wrap minion-thinking" onClick={() => handleNavigate('lead-pipeline-sales-agent')} title="Go to Lead Pipeline" style={{ color: '#818cf8' }}>
          <svg className="minion-body" width="52" height="64" viewBox="0 0 52 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#818cf8', filter: 'drop-shadow(0 0 6px #818cf888)' }}>
            <rect x="10" y="22" width="32" height="28" rx="6" fill="#0d1320" stroke="currentColor" strokeWidth="1.5" />
            <rect x="13" y="6" width="26" height="20" rx="5" fill="#0d1320" stroke="currentColor" strokeWidth="1.5" />
            <rect x="16" y="9" width="20" height="11" rx="3" fill="#818cf822" stroke="#818cf8" strokeWidth="1" />
            <rect x="16" y="14" width="20" height="1.5" fill="#818cf8" opacity="0.6" style={{ animation: 'arm-scan 1.5s ease-in-out infinite alternate' }} />
            <circle cx="21" cy="14" r="2.5" fill="#818cf8" style={{ animation: 'blink 4s ease-in-out infinite 0.5s' }} />
            <circle cx="31" cy="14" r="2.5" fill="#818cf8" style={{ animation: 'blink 4s ease-in-out infinite' }} />
            <circle cx="20" cy="14" r="1" fill="#0a0018" />
            <circle cx="30" cy="14" r="1" fill="#0a0018" />
            <line x1="26" y1="6" x2="26" y2="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="26" cy="1" r="2.5" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" style={{ animation: 'eye-spin 2s linear infinite' }} />
            <rect x="15" y="27" width="22" height="14" rx="2" fill="#090915" stroke="#818cf844" strokeWidth="0.5" />
            <polyline points="17,38 21,33 25,36 29,29 36,32" stroke="#818cf8" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="2" y="26" width="8" height="4" rx="2" fill="#0d1320" stroke="currentColor" strokeWidth="1.2" style={{ transformOrigin: '10px 28px', animation: 'arm-wave 1.2s ease-in-out infinite' }} />
            <rect x="42" y="34" width="8" height="4" rx="2" fill="#0d1320" stroke="currentColor" strokeWidth="1.2" />
            <rect x="16" y="50" width="7" height="10" rx="2" fill="#0d1320" stroke="currentColor" strokeWidth="1.2" />
            <rect x="29" y="50" width="7" height="10" rx="2" fill="#0d1320" stroke="currentColor" strokeWidth="1.2" />
            <rect x="14" y="58" width="11" height="5" rx="2" fill="currentColor" opacity="0.8" />
            <rect x="27" y="58" width="11" height="5" rx="2" fill="currentColor" opacity="0.8" />
          </svg>
          <span className="minion-label" style={{ color: '#818cf8' }}>Engagement</span>
          <span className="minion-status" style={{ color: '#818cf8' }}>◌ THINKING</span>
        </div>

        <div className="minion-wrap minion-active" onClick={() => handleNavigate('lead-pipeline-sales-agent')} title="Go to Lead Pipeline" style={{ color: '#22d3ee' }}>
          <svg className="minion-body" width="52" height="64" viewBox="0 0 52 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#22d3ee', filter: 'drop-shadow(0 0 6px #22d3ee88)' }}>
            <rect x="10" y="22" width="32" height="28" rx="6" fill="#021a1f" stroke="currentColor" strokeWidth="1.5" />
            <rect x="13" y="6" width="26" height="20" rx="5" fill="#021a1f" stroke="currentColor" strokeWidth="1.5" />
            <rect x="16" y="9" width="20" height="11" rx="3" fill="#22d3ee15" stroke="#22d3ee" strokeWidth="1" />
            <path d="M17 10 L17 12 L19 12" stroke="#22d3ee" strokeWidth="0.8" fill="none" />
            <path d="M35 10 L35 12 L33 12" stroke="#22d3ee" strokeWidth="0.8" fill="none" />
            <path d="M17 19 L17 17 L19 17" stroke="#22d3ee" strokeWidth="0.8" fill="none" />
            <path d="M35 19 L35 17 L33 17" stroke="#22d3ee" strokeWidth="0.8" fill="none" />
            <circle cx="21" cy="14" r="2.5" fill="#22d3ee" style={{ animation: 'blink 2.5s ease-in-out infinite 0.3s' }} />
            <circle cx="31" cy="14" r="2.5" fill="#22d3ee" style={{ animation: 'blink 2.5s ease-in-out infinite' }} />
            <circle cx="21" cy="14" r="1" fill="#001515" />
            <circle cx="31" cy="14" r="1" fill="#001515" />
            <rect x="15" y="26" width="22" height="16" rx="2" fill="#001515" stroke="#22d3ee44" strokeWidth="0.5" />
            <text x="26" y="38" fontFamily="Space Grotesk" fontSize="9" fontWeight="700" fill="#22d3ee" textAnchor="middle">BANT:92</text>
            <rect x="17" y="28" width="18" height="4" rx="1" fill="#22d3ee22" />
            <rect x="17" y="28" width="17" height="4" rx="1" fill="#22d3ee" style={{ animation: 'screen-flicker 1.5s ease-in-out infinite' }} />
            <rect x="42" y="24" width="8" height="12" rx="2" fill="#021a1f" stroke="currentColor" strokeWidth="1.2" />
            <rect x="43" y="22" width="6" height="2" rx="1" fill="currentColor" opacity="0.6" />
            <rect x="43" y="27" width="5" height="1" rx="0.5" fill="currentColor" opacity="0.5" />
            <rect x="43" y="29" width="4" height="1" rx="0.5" fill="currentColor" opacity="0.4" />
            <rect x="43" y="31" width="5" height="1" rx="0.5" fill="currentColor" opacity="0.5" />
            <rect x="2" y="30" width="8" height="4" rx="2" fill="#021a1f" stroke="currentColor" strokeWidth="1.2" />
            <line x1="26" y1="6" x2="26" y2="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="26" cy="1" r="2" fill="currentColor" style={{ animation: 'pulse-glow 0.8s ease-in-out infinite' }} />
            <rect x="16" y="50" width="7" height="10" rx="2" fill="#021a1f" stroke="currentColor" strokeWidth="1.2" />
            <rect x="29" y="50" width="7" height="10" rx="2" fill="#021a1f" stroke="currentColor" strokeWidth="1.2" />
            <rect x="14" y="58" width="11" height="5" rx="2" fill="currentColor" opacity="0.8" />
            <rect x="27" y="58" width="11" height="5" rx="2" fill="currentColor" opacity="0.8" />
          </svg>
          <span className="minion-label" style={{ color: '#22d3ee' }}>Sales</span>
          <span className="minion-status">● ACTIVE</span>
        </div>

        <div className="minion-wrap minion-idle" onClick={() => handleNavigate('analytics-strategic-insights')} title="Go to Analytics" style={{ color: '#475569' }}>
          <svg className="minion-body" width="52" height="64" viewBox="0 0 52 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#475569' }}>
            <rect x="10" y="22" width="32" height="28" rx="6" fill="#0d1117" stroke="currentColor" strokeWidth="1.5" />
            <rect x="13" y="6" width="26" height="20" rx="5" fill="#0d1117" stroke="currentColor" strokeWidth="1.5" />
            <rect x="16" y="9" width="20" height="11" rx="3" fill="#47556911" stroke="#475569" strokeWidth="1" />
            <ellipse cx="21" cy="15" rx="2.5" ry="1.5" fill="#475569" />
            <ellipse cx="31" cy="15" rx="2.5" ry="1.5" fill="#475569" />
            <text x="35" y="8" fontFamily="Inter" fontSize="6" fill="#475569" opacity="0.5">z</text>
            <text x="38" y="5" fontFamily="Inter" fontSize="5" fill="#475569" opacity="0.3">z</text>
            <rect x="15" y="27" width="22" height="14" rx="2" fill="#080c10" stroke="#47556933" strokeWidth="0.5" />
            <rect x="17" y="38" width="3" height="2" fill="#475569" opacity="0.4" />
            <rect x="22" y="35" width="3" height="5" fill="#475569" opacity="0.4" />
            <rect x="27" y="32" width="3" height="8" fill="#475569" opacity="0.4" />
            <rect x="32" y="33" width="3" height="7" fill="#475569" opacity="0.4" />
            <line x1="26" y1="6" x2="26" y2="0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <g style={{ transformOrigin: '26px 0px', animation: 'gear-spin 4s linear infinite' }}>
              <circle cx="26" cy="0" r="3" fill="none" stroke="#475569" strokeWidth="1.2" />
              <rect x="24.5" y="-4" width="3" height="2.5" rx="0.5" fill="#475569" />
              <rect x="24.5" y="1.5" width="3" height="2.5" rx="0.5" fill="#475569" />
              <rect x="-4" y="-1.5" width="2.5" height="3" rx="0.5" fill="#475569" transform="translate(26,0)" />
              <rect x="1.5" y="-1.5" width="2.5" height="3" rx="0.5" fill="#475569" transform="translate(26,0)" />
            </g>
            <rect x="2" y="34" width="8" height="4" rx="2" fill="#0d1117" stroke="currentColor" strokeWidth="1.2" />
            <rect x="42" y="34" width="8" height="4" rx="2" fill="#0d1117" stroke="currentColor" strokeWidth="1.2" />
            <rect x="16" y="50" width="7" height="10" rx="2" fill="#0d1117" stroke="currentColor" strokeWidth="1.2" />
            <rect x="29" y="50" width="7" height="10" rx="2" fill="#0d1117" stroke="currentColor" strokeWidth="1.2" />
            <rect x="14" y="58" width="11" height="5" rx="2" fill="currentColor" opacity="0.6" />
            <rect x="27" y="58" width="11" height="5" rx="2" fill="currentColor" opacity="0.6" />
          </svg>
          <span className="minion-label">Analytics</span>
          <span className="minion-status">— IDLE</span>
        </div>
      </div>
    </div>
  );
}
