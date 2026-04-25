import { useSim } from "@/lib/sim-store";
import { useMemo } from "react";

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: "blue" | "purple" | "green" | "red" }) {
  const glow =
    accent === "purple" ? "shadow-[0_0_20px_oklch(0.65_0.22_295_/_0.4)]" :
    accent === "green" ? "shadow-[0_0_20px_oklch(0.78_0.18_155_/_0.4)]" :
    accent === "red" ? "shadow-[0_0_20px_oklch(0.7_0.24_25_/_0.4)]" :
    "shadow-[0_0_20px_oklch(0.78_0.15_230_/_0.4)]";
  return (
    <div className={`glass flex-1 rounded-2xl px-4 py-3 ${glow}`}>
      <div className="text-[11px] uppercase tracking-wider text-foreground/60">{label}</div>
      <div className="mt-1 text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}

export function StatsBar() {
  const ambulances = useSim((s) => s.ambulances);
  const incidents = useSim((s) => s.incidents);

  const stats = useMemo(() => {
    const total = ambulances.length;
    const available = ambulances.filter((a) => a.status === "available").length;
    const active = incidents.filter((i) => i.status !== "completed").length;
    const completed = incidents.filter((i) => i.status === "completed" && i.completedAt);
    const avg =
      completed.length === 0
        ? 0
        : Math.round(
            completed.reduce((acc, i) => acc + (i.completedAt! - i.createdAt), 0) / completed.length / 1000,
          );
    return { total, available, active, avg };
  }, [ambulances, incidents]);

  return (
    <div className="flex gap-3">
      <Stat label="Total Ambulances" value={stats.total} accent="blue" />
      <Stat label="Available" value={stats.available} accent="green" />
      <Stat label="Active Incidents" value={stats.active} accent="red" />
      <Stat label="Avg Response (s)" value={stats.avg || "—"} accent="purple" />
    </div>
  );
}
