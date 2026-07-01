import { useEffect, useState } from "react";
import { MINIONS } from "./assets";
import { TICKS, type ScreenId } from "./consoleData";

/**
 * The agent "minion" bar pinned to the bottom of the console. The four animated
 * SVG agents are the mockup's exact artwork (rendered from extracted markup) but
 * wrapped in real React buttons that navigate to the relevant screen. The center
 * status ticker rotates through TICKS on an interval (React-driven, replacing the
 * mockup's imperative DOM ticker).
 */
export function MinionBar({
  onNavigate,
  collapsed = false,
}: {
  onNavigate: (id: ScreenId) => void;
  collapsed?: boolean;
}) {
  const [tickIdx, setTickIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Track the fade timeout in effect scope so it is actually cleared on
    // unmount (returning a cleanup from the interval callback does nothing).
    let fade: ReturnType<typeof setTimeout> | null = null;
    const interval = setInterval(() => {
      setVisible(false);
      if (fade) clearTimeout(fade);
      fade = setTimeout(() => {
        setTickIdx((i) => (i + 1) % TICKS.length);
        setVisible(true);
      }, 300);
    }, 3000);
    return () => {
      clearInterval(interval);
      if (fade) clearTimeout(fade);
    };
  }, []);

  return (
    <div className={`fd-minions${collapsed ? " full" : ""}`}>
      {MINIONS.map((minion, i) => (
        <div
          key={i}
          role="button"
          tabIndex={0}
          title="Open related screen"
          className={`minion-wrap ${minion.state}`}
          onClick={() => onNavigate(minion.target as ScreenId)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onNavigate(minion.target as ScreenId);
          }}
          dangerouslySetInnerHTML={{ __html: minion.inner }}
        />
      ))}

      {/* Live ticker */}
      <div className="flex flex-col items-center gap-1 px-4 border-l border-r border-white/[.06]">
        <div className="text-[9px] tracking-[.15em] text-[#475569] uppercase font-semibold">
          System Status
        </div>
        <div
          className={`font-data-point text-[11px] text-secondary tracking-[.05em] min-w-[240px] text-center transition-opacity duration-300 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          {TICKS[tickIdx]}
        </div>
        <div className="flex gap-3 mt-0.5">
          <div className="text-[10px] text-[#64748b]">Leads today: <span className="text-primary font-bold">47</span></div>
          <div className="text-[10px] text-[#64748b]">Posts: <span className="text-secondary font-bold">12</span></div>
          <div className="text-[10px] text-[#64748b]">Booked: <span className="text-[#22d3ee] font-bold">8</span></div>
        </div>
      </div>
    </div>
  );
}
