import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string;
  trend?: string;
  icon: LucideIcon;
}

export function StatsCard({ label, value, trend, icon: Icon }: StatsCardProps) {
  return (
    <div className="bg-white p-8 rounded-[12px] sb-shadow-card group hover:translate-y-[-4px] transition-all duration-300 relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 bg-sb-cream rounded-full flex items-center justify-center text-sb-green group-hover:bg-sb-green group-hover:text-white transition-all duration-300">
          <Icon size={20} />
        </div>
        {trend && (
          <span className={`px-3 py-1 rounded-full text-[1.2rem] font-black uppercase tracking-widest ${trend.startsWith('+') ? 'bg-sb-light text-sb-green' : 'bg-red-50 text-red-600'}`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-[1.2rem] uppercase font-black tracking-[0.15em] text-sb-green/60 mb-2">{label}</p>
        <h3 className="text-[3.2rem] font-bold tracking-sb text-sb-green leading-none">{value}</h3>
      </div>
      <div className="absolute top-0 right-0 w-24 h-24 bg-sb-ceramic/20 rounded-full translate-x-12 translate-y-[-12px] group-hover:bg-sb-accent/10 transition-colors" />
    </div>
  );
}
