import { createFileRoute } from "@tanstack/react-router";
import { timelinePhases } from "@/lib/aegis";
import { PageHeader } from "./index";
import { motion } from "framer-motion";

export const Route = createFileRoute("/timeline")({ component: Timeline });

function Timeline() {
  const today = new Date();
  return (
    <div className="space-y-5">
      <PageHeader title="Event Timeline" subtitle="Predictive crisis progression with probability weighting" />
      <div className="panel p-6">
        <div className="relative pl-8">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-400/60 via-orange-400/40 to-red-500/40" />
          {timelinePhases.map((p, i) => {
            const d = new Date(today.getTime() + p.offsetDays * 86400000);
            const tone = p.prob > 85 ? "cyan" : p.prob > 75 ? "teal" : p.prob > 65 ? "amber" : "red";
            const dot = tone === "cyan" ? "bg-cyan-400" : tone === "teal" ? "bg-teal-400" : tone === "amber" ? "bg-orange-400" : "bg-red-500";
            return (
              <motion.div key={p.phase} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="relative pb-6">
                <span className={`absolute -left-[22px] top-1 w-3 h-3 rounded-full ${dot} ring-4 ring-[#06101f]`} />
                <div className="flex flex-wrap items-baseline gap-3">
                  <div className="text-sm font-bold text-white">{p.phase}</div>
                  <div className="text-[10px] text-white/40">{d.toDateString()} · T+{p.offsetDays}d</div>
                  <div className="ml-auto text-xs font-bold text-cyan-300">{p.prob}% probability</div>
                </div>
                <p className="text-xs text-white/65 mt-1 leading-relaxed">{p.desc}</p>
                <div className="h-1 mt-2 rounded bg-white/5 overflow-hidden max-w-md">
                  <div className={`h-full ${dot}`} style={{ width: `${p.prob}%` }} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
