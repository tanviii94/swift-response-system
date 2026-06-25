import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { PageHeader } from "./index";
import { Send, Sparkles, User } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/copilot")({ component: Copilot });

interface Msg { role: "user" | "ai"; text: string; meta?: { risk: number; confidence: number; impact: string; actions: string[]; econ: string } }

const examples = [
  "What happens if Hormuz closes for 30 days?",
  "Which supplier should India prioritize?",
  "How much reserve should be released?",
  "What is the cheapest recovery strategy?",
];

function answer(q: string): Msg {
  const l = q.toLowerCase();
  if (l.includes("hormuz")) {
    return {
      role: "ai",
      text: "A 30-day Hormuz closure removes ~42% of India's seaborne crude flow. Brent would likely spike +$24/bbl in week one. With Cape re-routing (+12d transit) and full Aramco/ADNOC alternate procurement, domestic shortfall stabilizes by day 21 at -8% throughput.",
      meta: { risk: 88, confidence: 91, impact: "Severe", econ: "GDP -1.8% · Inflation +2.4%", actions: ["Activate strategic reserve (4.2 days release)", "Trigger Aramco spot tender — 6 VLCCs", "Coordinate with US SPR & IEA stock release", "Notify refineries to switch to Urals/WTI slate"] },
    };
  }
  if (l.includes("supplier") || l.includes("priorit")) {
    return {
      role: "ai",
      text: "Priority order under current threat picture: 1) Saudi Arabia (spare capacity 1.2 Mbpd, stable), 2) UAE (Fujairah bypass — avoids Hormuz), 3) Russia (Urals at discount, payment friction), 4) Iraq (Basra stress).",
      meta: { risk: 54, confidence: 87, impact: "Moderate", econ: "Price premium ~$3.4/bbl avg", actions: ["Lock 90-day term with Aramco", "Increase UAE Fujairah lifting by 18%", "Maintain Russian flow at discount cap"] },
    };
  }
  if (l.includes("reserve")) {
    return {
      role: "ai",
      text: "Recommended release: 2.4 days of strategic reserve, phased over 21 days. This keeps retail prices below +8% (political threshold) while preserving 71 days of buffer for follow-on shocks.",
      meta: { risk: 41, confidence: 89, impact: "Low", econ: "Inflation transmission +0.4%", actions: ["Phase 1: 0.8 days over week 1", "Phase 2: 0.9 days over week 2", "Phase 3: 0.7 days over week 3"] },
    };
  }
  if (l.includes("cheap") || l.includes("recovery")) {
    return {
      role: "ai",
      text: "Lowest-cost recovery is Combined Plan C: limited reserve release + Saudi/UAE alternates + demand-side trigger at +15% pump price. Net cost $412M for 89% recovery in 18 days.",
      meta: { risk: 32, confidence: 94, impact: "Low", econ: "Net cost $412M · GDP impact -0.4%", actions: ["Execute Combined National Response", "Activate cross-ministry coordination cell", "Pre-position tankers in Fujairah"] },
    };
  }
  return {
    role: "ai",
    text: "Analyzing your question against the fused intelligence picture. Current geopolitical state suggests elevated supply risk centered on Gulf corridors.",
    meta: { risk: 60, confidence: 76, impact: "Moderate", econ: "Variable — depends on duration", actions: ["Run targeted scenario in Crisis Simulator", "Consult Decision Commander for response plans"] },
  };
}

function Copilot() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "ai", text: "AEGIS Copilot online. I can model crises, recommend procurement, and advise on reserve strategy. Ask me anything." }
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = (q: string) => {
    if (!q.trim()) return;
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setTimeout(() => setMsgs((m) => [...m, answer(q)]), 600);
  };

  return (
    <div className="space-y-5">
      <PageHeader title="AI Copilot" subtitle="Conversational decision support — risk, impact, recommendation, confidence" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="panel p-4">
          <div className="label-tag mb-2">EXAMPLE QUERIES</div>
          <div className="space-y-2">
            {examples.map((e) => (
              <button key={e} onClick={() => send(e)} className="w-full text-left text-xs p-2 rounded border border-white/10 bg-white/5 hover:border-cyan-400/40 hover:bg-cyan-500/5 text-white/80">{e}</button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 panel p-4 flex flex-col h-[640px]">
          <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3 pr-1">
            {msgs.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "ai" && <div className="w-8 h-8 rounded-md bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center shrink-0"><Sparkles className="w-4 h-4 text-cyan-300" /></div>}
                <div className={`max-w-[80%] ${m.role === "user" ? "bg-cyan-500/15 border-cyan-400/30" : "bg-black/40 border-white/10"} border rounded-xl p-3`}>
                  <p className="text-sm text-white/90 leading-relaxed">{m.text}</p>
                  {m.meta && (
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Tag label="Risk" v={`${m.meta.risk}/100`} tone="red" />
                      <Tag label="Confidence" v={`${m.meta.confidence}%`} tone="cyan" />
                      <Tag label="Impact" v={m.meta.impact} tone="amber" />
                      <Tag label="Economic" v={m.meta.econ} tone="amber" />
                      <div className="col-span-2 md:col-span-4 mt-1">
                        <div className="label-tag mb-1">RECOMMENDED ACTIONS</div>
                        <ul className="text-xs text-emerald-100/90 space-y-1">{m.meta.actions.map((a) => <li key={a}>• {a}</li>)}</ul>
                      </div>
                    </div>
                  )}
                </div>
                {m.role === "user" && <div className="w-8 h-8 rounded-md bg-white/10 border border-white/15 flex items-center justify-center shrink-0"><User className="w-4 h-4 text-white" /></div>}
              </motion.div>
            ))}
            <div ref={endRef} />
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="mt-3 flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask AEGIS…"
              className="flex-1 bg-black/40 border border-white/15 rounded-md px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400/60" />
            <button type="submit" className="px-4 rounded-md bg-gradient-to-r from-cyan-500 to-teal-500 text-black font-bold text-sm flex items-center gap-2"><Send className="w-4 h-4" /></button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Tag({ label, v, tone }: { label: string; v: string; tone: "red"|"cyan"|"amber" }) {
  const c = tone === "red" ? "text-red-300 border-red-500/30 bg-red-500/10"
    : tone === "amber" ? "text-orange-300 border-orange-500/30 bg-orange-500/10"
    : "text-cyan-300 border-cyan-400/30 bg-cyan-500/10";
  return <div className={`p-2 rounded border ${c}`}><div className="label-tag">{label}</div><div className="text-xs font-bold mt-0.5">{v}</div></div>;
}
