import { useSim } from "@/lib/sim-store";
import { Plus, TrafficCone, BedDouble, RotateCcw } from "lucide-react";

function Btn({ onClick, children, variant = "blue" }: { onClick: () => void; children: React.ReactNode; variant?: "blue" | "purple" | "yellow" | "red" }) {
  const map = {
    blue: "hover:shadow-[0_0_20px_oklch(0.78_0.15_230_/_0.6)] border-[oklch(0.78_0.15_230_/_0.4)]",
    purple: "hover:shadow-[0_0_20px_oklch(0.65_0.22_295_/_0.6)] border-[oklch(0.65_0.22_295_/_0.4)]",
    yellow: "hover:shadow-[0_0_20px_oklch(0.85_0.17_90_/_0.6)] border-[oklch(0.85_0.17_90_/_0.4)]",
    red: "hover:shadow-[0_0_20px_oklch(0.7_0.24_25_/_0.6)] border-[oklch(0.7_0.24_25_/_0.4)]",
  };
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-xl border bg-white/5 px-3 py-2.5 text-xs font-medium text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 ${map[variant]}`}
    >
      {children}
    </button>
  );
}

export function SimulationControls() {
  const addIncident = useSim((s) => s.addIncident);
  const addTraffic = useSim((s) => s.addTraffic);
  const reduceBeds = useSim((s) => s.reduceBeds);
  const reset = useSim((s) => s.reset);
  return (
    <div className="glass rounded-2xl p-3">
      <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-foreground/70">Simulation</div>
      <div className="flex flex-wrap gap-2">
        <Btn onClick={() => addIncident()} variant="red"><Plus className="h-3.5 w-3.5" /> Incident</Btn>
        <Btn onClick={() => addTraffic()} variant="yellow"><TrafficCone className="h-3.5 w-3.5" /> Traffic</Btn>
        <Btn onClick={() => reduceBeds()} variant="purple"><BedDouble className="h-3.5 w-3.5" /> -5 Beds</Btn>
        <Btn onClick={() => reset()} variant="blue"><RotateCcw className="h-3.5 w-3.5" /> Reset</Btn>
      </div>
    </div>
  );
}
