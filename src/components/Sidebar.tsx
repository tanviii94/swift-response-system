import { Link, useLocation } from "@tanstack/react-router";
import { Activity, Ambulance, Hospital as HospitalIcon, User } from "lucide-react";

const items = [
  { to: "/", label: "Control Room", icon: Activity },
  { to: "/driver", label: "Driver", icon: Ambulance },
  { to: "/hospital", label: "Hospital", icon: HospitalIcon },
  { to: "/citizen", label: "Citizen", icon: User },
] as const;

export function Sidebar() {
  const loc = useLocation();
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col gap-2 border-r border-white/10 bg-white/[0.03] p-4 backdrop-blur-lg">
      <div className="mb-4 px-2">
        <div className="text-xs uppercase tracking-[0.2em] text-foreground/50">AI Emergency</div>
        <div className="bg-gradient-to-r from-[oklch(0.78_0.15_230)] to-[oklch(0.65_0.22_295)] bg-clip-text text-xl font-bold text-transparent">
          ResQ Net
        </div>
      </div>
      {items.map((it) => {
        const active = loc.pathname === it.to;
        const Icon = it.icon;
        return (
          <Link
            key={it.to}
            to={it.to}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-300 ${
              active
                ? "bg-gradient-to-r from-[oklch(0.78_0.15_230_/_0.2)] to-[oklch(0.65_0.22_295_/_0.2)] text-foreground shadow-[0_0_20px_oklch(0.78_0.15_230_/_0.3)]"
                : "text-foreground/70 hover:bg-white/5 hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {it.label}
          </Link>
        );
      })}
      <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-3 text-[11px] leading-relaxed text-foreground/60">
        Real-time simulated emergency dispatch. All data is synthetic.
      </div>
    </aside>
  );
}
