import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { Network, CheckCircle2, XCircle, Clock, Settings2, Zap } from "lucide-react";
import { cn } from "../lib/utils";

type Status = 'CONNECTED' | 'PENDING' | 'DISCONNECTED';

interface Integration {
  name: string;
  category: string;
  icon: string;
  status: Status;
  detail?: string;
}

const StatusBadge = ({ status }: { status: Status }) => {
  const config = {
    CONNECTED:    { icon: CheckCircle2, className: "text-sb-accent bg-sb-accent/10", label: "Connected" },
    PENDING:      { icon: Clock,        className: "text-sb-gold bg-sb-gold/10",     label: "Pending" },
    DISCONNECTED: { icon: XCircle,      className: "text-black/30 bg-black/5",       label: "Disconnected" },
  }[status];
  const Icon = config.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[1rem] font-black uppercase tracking-widest", config.className)}>
      <Icon size={12} />
      {config.label}
    </span>
  );
};

export default function ApiHub() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const maskKey = (key?: string) =>
    key ? `•••• ${key.slice(-4)}` : "No key set";

  const aiEngines: Integration[] = [
    {
      name: "Google Gemini",
      category: "AI Engine",
      icon: "✦",
      status: profile?.apiKeys?.gemini ? 'CONNECTED' : 'DISCONNECTED',
      detail: maskKey(profile?.apiKeys?.gemini),
    },
    {
      name: "Anthropic Claude",
      category: "AI Engine",
      icon: "◈",
      status: profile?.apiKeys?.anthropic ? 'CONNECTED' : 'DISCONNECTED',
      detail: maskKey(profile?.apiKeys?.anthropic),
    },
    {
      name: "OpenAI GPT-4",
      category: "AI Engine",
      icon: "⬡",
      status: profile?.apiKeys?.openai ? 'CONNECTED' : 'DISCONNECTED',
      detail: maskKey(profile?.apiKeys?.openai),
    },
  ];

  const socialPlatforms: Integration[] = [
    { name: "LinkedIn",   category: "Social", icon: "🔗", status: 'CONNECTED' },
    { name: "Instagram",  category: "Social", icon: "📸", status: 'PENDING' },
    { name: "X (Twitter)",category: "Social", icon: "𝕏",  status: 'CONNECTED' },
    { name: "TikTok",     category: "Social", icon: "🎵", status: 'DISCONNECTED' },
    { name: "Facebook",   category: "Social", icon: "📘", status: 'DISCONNECTED' },
  ];

  const paymentServices: Integration[] = [
    { name: "PayPal",    category: "Payment",    icon: "💳", status: 'CONNECTED' },
    { name: "Calendly",  category: "Scheduling", icon: "📅", status: 'CONNECTED' },
  ];

  const all = [...aiEngines, ...socialPlatforms, ...paymentServices];
  const connectedCount    = all.filter(s => s.status === 'CONNECTED').length;
  const pendingCount      = all.filter(s => s.status === 'PENDING').length;
  const disconnectedCount = all.filter(s => s.status === 'DISCONNECTED').length;

  const renderGrid = (items: Integration[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {items.map(item => (
        <div key={item.name} className="bg-white rounded-[12px] sb-shadow-card p-8 flex flex-col gap-6 hover:bg-sb-cream/20 transition-all group">
          <div className="flex justify-between items-start">
            <div className="w-14 h-14 bg-sb-cream rounded-[10px] flex items-center justify-center text-[2.4rem] shadow-inner">
              {item.icon}
            </div>
            <StatusBadge status={item.status} />
          </div>

          <div>
            <h4 className="text-[1.6rem] font-black uppercase tracking-tight text-sb-house leading-none mb-2">
              {item.name}
            </h4>
            <span className="text-[1rem] font-black uppercase tracking-[0.2em] text-sb-green/40">
              {item.category}
            </span>
          </div>

          {item.detail && (
            <p className="text-[1.2rem] font-mono text-black/30 tracking-widest -mt-2">
              {item.detail}
            </p>
          )}

          <button
            onClick={() => navigate('/settings')}
            className="mt-auto flex items-center gap-2 text-[1.1rem] font-black uppercase tracking-widest text-sb-green/40 hover:text-sb-green transition-colors group-hover:text-sb-green"
          >
            <Settings2 size={14} /> Configure
          </button>
        </div>
      ))}
    </div>
  );

  const Section = ({ title, items }: { title: string; items: Integration[] }) => (
    <section className="space-y-8">
      <div className="flex items-center gap-4">
        <h2 className="text-[1.6rem] font-bold text-sb-green uppercase tracking-widest">{title}</h2>
        <div className="flex-1 h-px bg-black/5" />
        <span className="text-[1.1rem] font-black uppercase tracking-widest text-black/30">
          {items.filter(i => i.status === 'CONNECTED').length}/{items.length} active
        </span>
      </div>
      {renderGrid(items)}
    </section>
  );

  return (
    <div className="flex min-h-screen bg-sb-cream text-black font-sans tracking-sb">
      <Sidebar />
      <main className="flex-1 p-12 lg:p-24 overflow-y-auto">
        <header className="flex justify-between items-end mb-16 pb-8 border-b border-black/10">
          <div>
            <h1 className="text-sb-green font-semibold text-[3.6rem] leading-tight mb-2 uppercase tracking-sb flex items-center gap-4">
              <Network size={36} className="text-sb-green" /> API Hub
            </h1>
            <p className="text-[1.6rem] text-black/50 font-medium">Integration Portfolio — All Connected Services</p>
          </div>
        </header>

        {/* Summary bar */}
        <div className="grid grid-cols-3 gap-8 mb-16">
          {[
            { label: "Total Services",  value: all.length,        color: "bg-sb-house text-white" },
            { label: "Connected",       value: connectedCount,    color: "bg-sb-accent/10 text-sb-accent" },
            { label: "Needs Attention", value: disconnectedCount + pendingCount, color: "bg-sb-gold/10 text-sb-gold" },
          ].map(stat => (
            <div key={stat.label} className={cn("rounded-[12px] p-8 sb-shadow-card flex flex-col gap-2", stat.color)}>
              <span className="text-[3.6rem] font-black leading-none">{stat.value}</span>
              <span className="text-[1.1rem] font-black uppercase tracking-widest opacity-70">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="space-y-16">
          <Section title="AI Engines"         items={aiEngines} />
          <Section title="Social Platforms"   items={socialPlatforms} />
          <Section title="Payment & Scheduling" items={paymentServices} />
        </div>
      </main>

      <button className="fixed bottom-12 right-12 w-[5.6rem] h-[5.6rem] bg-sb-accent rounded-full flex items-center justify-center text-white sb-shadow-frap sb-button-active z-[60]">
        <Zap className="fill-white w-6 h-6" />
      </button>
    </div>
  );
}
