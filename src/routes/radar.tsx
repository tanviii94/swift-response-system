import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAegis } from "@/lib/aegis";
import { WorldRadarMap } from "@/components/AegisMaps";
import { PageHeader } from "./index";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export const Route = createFileRoute("/radar")({ component: RadarPage });

function RadarPage() {
  const { hotspots, signals } = useAegis();
  const [sel, setSel] = useState<string>("hormuz");
  const h = hotspots.find((x) => x.id === sel) ?? hotspots[0];

  return (
    <div className="space-y-5">
      <PageHeader title="Global Risk Radar" subtitle="Geopolitical threat detection before supply impact" />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-3 panel p-3 h-[560px]">
          <div className="h-full"><WorldRadarMap onSelect={setSel} selectedId={sel} /></div>
        </div>
        <div className="panel p-4">
          <div className="label-tag">SELECTED HOTSPOT</div>
          <div className="text-lg font-bold text-cyan-200 mt-1">{h.name}</div>
          <p className="text-xs text-white/60 mt-2 leading-relaxed">{h.detail}</p>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Metric label="Threat Score" value={h.score.toFixed(0)} accent={h.score > 70 ? "red" : h.score > 50 ? "amber" : "emerald"} />
            <Metric label="Confidence" value={`${h.confidence}%`} accent="cyan" />
            <Metric label="Risk Trend" value={h.trend > 0.2 ? "Rising" : h.trend < -0.2 ? "Falling" : "Stable"} icon={h.trend > 0.2 ? <TrendingUp className="w-3 h-3" /> : h.trend < -0.2 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />} accent={h.trend > 0.2 ? "red" : "emerald"} />
            <Metric label="Imports Affected" value={`${h.importPct}%`} accent="amber" />
          </div>
        </div>
      </div>

      <div className="panel p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs tracking-widest text-cyan-300">AI INTELLIGENCE FEED</div>
            <div className="text-[10px] text-white/40">Processed geopolitical signals · not raw news</div>
          </div>
          <div className="text-[10px] text-white/40">FUSED FROM 142 SOURCES</div>
        </div>
        <div className="space-y-3">
          {signals.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="p-4 rounded-lg border border-white/10 bg-black/30 grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
              <div>
                <div className="label-tag">EVENT</div>
                <div className="text-sm font-semibold text-white/90 mt-1">{s.event}</div>
                <div className="text-[10px] text-white/40 mt-1">{s.region} · {s.time}</div>
              </div>
              <div className="md:col-span-2">
                <div className="label-tag">EXTRACTED INSIGHT</div>
                <div className="text-sm text-cyan-100 mt-1">{s.insight}</div>
              </div>
              <div>
                <div className="label-tag">CONFIDENCE</div>
                <div className="text-sm font-bold text-cyan-300 mt-1">{s.confidence}%</div>
                <div className="h-1.5 mt-1 rounded bg-white/10 overflow-hidden">
                  <div className="h-full bg-cyan-400" style={{ width: `${s.confidence}%` }} />
                </div>
              </div>
              <div>
                <div className="label-tag">PREDICTED IMPACT</div>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-semibold ${impactTone(s.impact)}`}>{s.impact}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function impactTone(i: string) {
  if (i === "Severe") return "bg-red-500/15 text-red-300 border border-red-500/40";
  if (i === "High") return "bg-orange-500/15 text-orange-300 border border-orange-500/40";
  if (i === "Moderate") return "bg-yellow-500/15 text-yellow-200 border border-yellow-500/40";
  return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40";
}
function Metric({ label, value, accent, icon }: { label: string; value: string; accent: "cyan"|"red"|"amber"|"emerald"; icon?: React.ReactNode }) {
  const c = accent === "red" ? "text-red-400" : accent === "amber" ? "text-orange-300" : accent === "emerald" ? "text-emerald-300" : "text-cyan-300";
  return (
    <div className="p-2 rounded bg-white/5 border border-white/10">
      <div className="label-tag">{label}</div>
      <div className={`text-base font-bold mt-0.5 flex items-center gap-1 ${c}`}>{icon}{value}</div>
    </div>
  );
}
