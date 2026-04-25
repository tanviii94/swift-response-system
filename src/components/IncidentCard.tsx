import { motion } from "framer-motion";
import { useSim, distanceKm, type Incident } from "@/lib/sim-store";
import { useEffect, useState } from "react";

const sevColor: Record<number, string> = {
  5: "bg-[oklch(0.7_0.24_25)] text-white",
  4: "bg-[oklch(0.75_0.2_45)] text-black",
  3: "bg-[oklch(0.85_0.17_90)] text-black",
  2: "bg-[oklch(0.78_0.15_230)] text-black",
  1: "bg-[oklch(0.78_0.18_155)] text-black",
};

const statusColor: Record<string, string> = {
  waiting: "bg-white/10 text-foreground/80",
  dispatched: "bg-[oklch(0.85_0.17_90_/_0.25)] text-[oklch(0.92_0.15_90)]",
  on_scene: "bg-[oklch(0.65_0.22_295_/_0.25)] text-[oklch(0.85_0.18_295)]",
  transport: "bg-[oklch(0.78_0.15_230_/_0.25)] text-[oklch(0.9_0.12_230)]",
  completed: "bg-[oklch(0.78_0.18_155_/_0.25)] text-[oklch(0.9_0.16_155)]",
};

export function IncidentCard({ incident }: { incident: Incident }) {
  const ambulances = useSim((s) => s.ambulances);
  const hospitals = useSim((s) => s.hospitals);
  const amb = ambulances.find((a) => a.id === incident.ambulanceId);
  const hosp = hospitals.find((h) => h.id === incident.hospitalId);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  let etaText = "—";
  if (amb && amb.targetLat != null && amb.targetLng != null && incident.status !== "completed") {
    const km = distanceKm(amb, { lat: amb.targetLat, lng: amb.targetLng });
    const speed = amb.speed; // km/h
    const sec = Math.max(0, Math.round((km / speed) * 3600));
    etaText = sec > 60 ? `${Math.floor(sec / 60)}m ${sec % 60}s` : `${sec}s`;
  } else if (incident.status === "completed" && incident.completedAt) {
    etaText = `${Math.round((incident.completedAt - incident.createdAt) / 1000)}s total`;
  }
  const elapsed = Math.round((now - incident.createdAt) / 1000);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="glass rounded-2xl p-3 transition-all duration-300 hover:shadow-[0_0_20px_oklch(0.78_0.15_230_/_0.4)]"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${sevColor[incident.severity]}`}>
            P{incident.severity}
          </span>
          <span className="text-sm font-semibold text-foreground">#{incident.id}</span>
          <span className="text-xs text-foreground/60">{incident.type}</span>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${statusColor[incident.status]}`}>
          {incident.status.replace("_", " ")}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-foreground/70">
        <div>📍 {incident.lat.toFixed(3)}, {incident.lng.toFixed(3)}</div>
        <div>⏱ ETA: <span className="text-foreground">{etaText}</span></div>
        <div>🚑 {amb ? `Unit #${amb.id}` : "—"}</div>
        <div>🏥 {hosp ? hosp.name : "—"}</div>
      </div>
      <div className="mt-1 text-[10px] text-foreground/40">+{elapsed}s since reported</div>
    </motion.div>
  );
}
