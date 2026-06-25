import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAegis } from "@/lib/aegis";
import { PageHeader } from "./index";
import { CheckCircle2, Shield, Truck, Layers, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/commander")({ component: Commander });

const plans = [
  {
    id: "A", title: "Release Strategic Reserves", icon: Shield, recommended: false,
    cost: "$680M", recovery: 64, time: "14 days", confidence: 78, riskReduction: 28,
    desc: "Draw down 4.2 days of national petroleum reserve to stabilize domestic prices.",
    pros: ["Immediate market signal", "No supplier negotiation"], cons: ["Reduces buffer for future shocks", "Limited duration"],
  },
  {
    id: "B", title: "Alternative Procurement", icon: Truck, recommended: false,
    cost: "$420M", recovery: 58, time: "21 days", confidence: 81, riskReduction: 34,
    desc: "Aramco + ADNOC spot tenders; redirect 3 VLCCs from Atlantic Basin.",
    pros: ["Preserves reserves", "Diversifies sources"], cons: ["Premium pricing", "Refinery slate adjustments"],
  },
  {
    id: "C", title: "Combined National Response", icon: Layers, recommended: true,
    cost: "$412M", recovery: 89, time: "18 days", confidence: 94, riskReduction: 52,
    desc: "Phased reserve release (2.4 days) + Saudi/UAE alternate procurement + demand-side fuel rationing trigger at +15% retail.",
    pros: ["Highest risk reduction", "Lowest net cost", "Refinery-compatible slate"], cons: ["Cross-ministry coordination required"],
  },
];

function Commander() {
  const { threat, securityScore } = useAegis();
  const [active, setActive] = useState("C");
  const ap = plans.find((p) => p.id === active)!;

  return (
    <div className="space-y-5">
      <PageHeader title="Decision Commander" subtitle="AI-generated response plans for the active crisis" />

      <div className="panel p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="label-tag">CURRENT CRISIS</div>
          <div className="text-lg font-bold text-red-300 mt-1">Hormuz Escalation</div>
          <div className="text-[10px] text-white/40">Detected 4h ago</div>
        </div>
        <div>
          <div className="label-tag">RISK LEVEL</div>
          <div className="text-lg font-bold text-orange-300 mt-1">{threat}</div>
          <div className="text-[10px] text-white/40">Score {securityScore.toFixed(0)} / 100</div>
        </div>
        <div>
          <div className="label-tag">AFFECTED IMPORTS</div>
          <div className="text-lg font-bold text-cyan-300 mt-1">42%</div>
          <div className="text-[10px] text-white/40">Gulf-origin crude</div>
        </div>
        <div>
          <div className="label-tag">ESTIMATED LOSS / DAY</div>
          <div className="text-lg font-bold text-red-400 mt-1">$214M</div>
          <div className="text-[10px] text-white/40">Without intervention</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {plans.map((p) => (
          <motion.button key={p.id} onClick={() => setActive(p.id)} whileHover={{ y: -3 }}
            className={`text-left panel p-5 relative transition ${active === p.id ? "border-cyan-400/60 glow-cyan" : ""} ${p.recommended ? "border-cyan-400/40" : ""}`}>
            {p.recommended && (
              <div className="absolute -top-3 left-4 px-2 py-0.5 rounded bg-gradient-to-r from-cyan-400 to-teal-400 text-black text-[10px] font-bold tracking-widest">
                ★ RECOMMENDED
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-md bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center"><p.icon className="w-4 h-4 text-cyan-300" /></div>
              <div>
                <div className="text-[10px] text-white/40">PLAN {p.id}</div>
                <div className="font-bold text-white">{p.title}</div>
              </div>
            </div>
            <p className="text-xs text-white/60 mt-3 leading-relaxed">{p.desc}</p>
            <div className="grid grid-cols-2 gap-2 mt-4 text-[11px]">
              <Stat label="Cost" v={p.cost} />
              <Stat label="Recovery" v={`${p.recovery}%`} accent="emerald" />
              <Stat label="Time" v={p.time} />
              <Stat label="Confidence" v={`${p.confidence}%`} accent="cyan" />
              <Stat label="Risk ↓" v={`-${p.riskReduction}%`} accent="emerald" />
              <Stat label="Status" v={active === p.id ? "Selected" : "Standby"} accent={active === p.id ? "cyan" : undefined} />
            </div>
          </motion.button>
        ))}
      </div>

      <div className="panel p-5">
        <div className="flex items-center gap-2 mb-3"><Sparkles className="w-4 h-4 text-cyan-300" /><div className="text-xs tracking-widest text-cyan-300">EXPLAINABILITY · WHY PLAN {ap.id}?</div></div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {["Lowest geopolitical risk path","Fastest delivery window","Refinery compatibility (crude slate)","Available tanker capacity (94%)","Lowest net economic impact"].map((f) => (
            <div key={f} className="p-3 rounded-lg border border-emerald-400/20 bg-emerald-500/5 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div className="text-xs text-emerald-100/90">{f}</div>
            </div>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border border-white/10 bg-black/30">
            <div className="label-tag mb-1">ADVANTAGES</div>
            <ul className="text-xs text-white/75 space-y-1">{ap.pros.map((p) => <li key={p}>• {p}</li>)}</ul>
          </div>
          <div className="p-3 rounded-lg border border-white/10 bg-black/30">
            <div className="label-tag mb-1">TRADE-OFFS</div>
            <ul className="text-xs text-white/75 space-y-1">{ap.cons.map((p) => <li key={p}>• {p}</li>)}</ul>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button className="px-4 py-2 rounded-md bg-gradient-to-r from-cyan-500 to-teal-500 text-black font-bold text-sm tracking-wider">EXECUTE PLAN {ap.id}</button>
          <button className="px-4 py-2 rounded-md border border-white/15 text-white/80 text-sm">EXPORT BRIEF</button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, v, accent }: { label: string; v: string; accent?: "cyan"|"emerald" }) {
  const c = accent === "emerald" ? "text-emerald-300" : accent === "cyan" ? "text-cyan-300" : "text-white/90";
  return (
    <div className="p-2 rounded bg-white/5 border border-white/10">
      <div className="label-tag">{label}</div>
      <div className={`font-bold ${c}`}>{v}</div>
    </div>
  );
}
