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
export function MinionBar({ onNavigate }: { onNavigate: (id: ScreenId) => void }) {
  const [tickIdx, setTickIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      const t = setTimeout(() => {
        setTickIdx((i) => (i + 1) % TICKS.length);
        setVisible(true);
      }, 300);
      return () => clearTimeout(t);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fd-minions">
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
      <div
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          padding: "0 16px",
          borderLeft: "1px solid rgba(255,255,255,.06)",
          borderRight: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <div style={{ fontSize: 9, letterSpacing: ".15em", color: "#475569", textTransform: "uppercase", fontWeight: 600 }}>
          System Status
        </div>
        <div
          style={{
            fontFamily: "'Space Grotesk', monospace", fontSize: 11, color: "#5de6ff",
            letterSpacing: ".05em", minWidth: 240, textAlign: "center",
            opacity: visible ? 1 : 0, transition: "opacity .3s",
          }}
        >
          {TICKS[tickIdx]}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 2 }}>
          <div style={{ fontSize: 10, color: "#64748b" }}>Leads today: <span style={{ color: "#c0c1ff", fontWeight: 700 }}>47</span></div>
          <div style={{ fontSize: 10, color: "#64748b" }}>Posts: <span style={{ color: "#5de6ff", fontWeight: 700 }}>12</span></div>
          <div style={{ fontSize: 10, color: "#64748b" }}>Booked: <span style={{ color: "#22d3ee", fontWeight: 700 }}>8</span></div>
        </div>
      </div>
    </div>
  );
}
