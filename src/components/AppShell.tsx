import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAegis } from "@/lib/aegis";
import {
  Activity, Radar, FlaskConical, Crosshair, Network, Database,
  LineChart, MessageSquare, CalendarClock, Settings as SettingsIcon, ShieldAlert, User
} from "lucide-react";

const nav = [
  { to: "/", label: "Command Center", icon: Activity },
  { to: "/radar", label: "Global Risk Radar", icon: Radar },
  { to: "/simulator", label: "Crisis Simulator", icon: FlaskConical },
  { to: "/commander", label: "Decision Commander", icon: Crosshair },
  { to: "/twin", label: "Supply Chain Twin", icon: Network },
  { to: "/reserve", label: "Strategic Reserve", icon: Database },
  { to: "/economy", label: "Economic Impact Lab", icon: LineChart },
  { to: "/copilot", label: "AI Copilot", icon: MessageSquare },
  { to: "/timeline", label: "Event Timeline", icon: CalendarClock },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { brent, securityScore, threat, reserveDays, activeAlerts, tick } = useAegis();

  useEffect(() => {
    const id = setInterval(tick, 2500);
    return () => clearInterval(id);
  }, [tick]);

  const threatColor =
    threat === "CRITICAL" ? "text-red-400 bg-red-500/10 border-red-500/40"
    : threat === "HIGH" ? "text-orange-400 bg-orange-500/10 border-orange-500/40"
    : threat === "ELEVATED" ? "text-yellow-300 bg-yellow-500/10 border-yellow-500/40"
    : "text-emerald-400 bg-emerald-500/10 border-emerald-500/40";

  return (
    <div className="min-h-screen flex w-full grid-overlay">
      <aside className="w-60 shrink-0 border-r border-white/10 bg-[#070b18]/80 backdrop-blur-xl flex flex-col">
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="relative">
              <ShieldAlert className="w-7 h-7 text-cyan-400" />
              <span className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-pulse-dot" />
            </div>
            <div>
              <div className="font-bold tracking-wider text-cyan-300 leading-none">AEGIS AI</div>
              <div className="text-[10px] text-white/50 mt-1 tracking-[0.18em]">ENERGY COMMAND</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto scrollbar-thin">
          {nav.map((n) => {
            const active = pathname === n.to;
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition-all border ${
                  active
                    ? "bg-cyan-500/10 border-cyan-400/40 text-cyan-200 shadow-[0_0_20px_-8px_rgba(34,211,238,0.6)]"
                    : "border-transparent text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{n.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-3 border-t border-white/10 text-[10px] text-white/40 tracking-wider">
          CLASSIFIED // OFFICIAL USE
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-white/10 bg-[#070b18]/70 backdrop-blur-xl flex items-center px-4 gap-3">
          <Stat label="ENERGY SECURITY" value={securityScore.toFixed(0)} accent="cyan" />
          <div className={`px-3 py-1.5 rounded-md text-[11px] font-bold tracking-widest border ${threatColor}`}>
            THREAT: {threat}
          </div>
          <Stat label="BRENT" value={`$${brent.toFixed(2)}`} accent="teal" />
          <Stat label="RESERVE" value={`${reserveDays}d`} accent="cyan" />
          <div className="px-3 py-1.5 rounded-md text-[11px] tracking-wider border border-orange-500/40 bg-orange-500/10 text-orange-300">
            {activeAlerts} ACTIVE ALERTS
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs text-white/60">
            <div className="hidden md:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
              LIVE FEED
            </div>
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
              <User className="w-4 h-4 text-cyan-300" />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: "cyan" | "teal" }) {
  const color = accent === "cyan" ? "text-cyan-300" : "text-teal-300";
  return (
    <div className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 flex items-center gap-2">
      <div className="text-[9px] tracking-[0.18em] text-white/50">{label}</div>
      <div className={`text-sm font-bold ${color}`}>{value}</div>
    </div>
  );
}
