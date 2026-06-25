import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useAegis } from "@/lib/aegis";
import { IndiaSupplyMap } from "@/components/AegisMaps";
import { Activity, AlertTriangle, ShieldCheck, Database, TrendingDown, Globe2, Sparkles, AlertCircle, Anchor, Megaphone, Sword } from "lucide-react";

export const Route = createFileRoute("/")({ component: CommandCenter });

function CommandCenter() {
  const { securityScore, threat, supplyStability, reserveDays, economicExposure, importDependency, events } = useAegis();
  const kpis = [
    { label: "Energy Security", value: securityScore.toFixed(0), unit: "/100", icon: ShieldCheck, color: "cyan", trend: "+1.2" },
    { label: "Threat Level", value: threat, icon: AlertTriangle, color: threat === "CRITICAL" || threat === "HIGH" ? "red" : "amber", trend: "↑" },
    { label: "Supply Stability", value: supplyStability.toString(), unit: "%", icon: Activity, color: "teal", trend: "-3.4" },
    { label: "Strategic Reserve", value: `${reserveDays}d`, icon: Database, color: "cyan", trend: "stable" },
    { label: "Economic Exposure", value: economicExposure.toString(), unit: "%", icon: TrendingDown, color: "amber", trend: "+5.1" },
    { label: "Import Dependency", value: importDependency.toString(), unit: "%", icon: Globe2, color: "red", trend: "↑" },
  ] as const;

  return (
    <div className="space-y-5">
      <PageHeader title="Command Center" subtitle="National energy security posture · realtime fusion of geopolitical, market & supply intelligence" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((k, i) => (
          <motion.div key={k.label}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="panel p-4">
            <div className="flex items-center justify-between">
              <span className="label-tag">{k.label}</span>
              <k.icon className={`w-4 h-4 ${colorTxt(k.color)}`} />
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <div className={`text-2xl font-bold ${colorTxt(k.color)}`}>{k.value}</div>
              {"unit" in k && <div className="text-xs text-white/40">{k.unit}</div>}
            </div>
            <div className="mt-1 text-[10px] text-white/40">Δ {k.trend}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 panel p-3 h-[480px]">
          <div className="flex items-center justify-between px-2 pt-1 pb-2">
            <div>
              <div className="text-xs tracking-widest text-cyan-300">SUPPLY CORRIDOR INTELLIGENCE</div>
              <div className="text-[10px] text-white/50">India inbound crude routes · animated by status</div>
            </div>
            <div className="text-[10px] text-white/50">EPOCH · {new Date().toLocaleTimeString()}</div>
          </div>
          <div className="h-[420px]"><IndiaSupplyMap /></div>
        </div>

        <div className="panel p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <div className="text-xs tracking-widest text-cyan-300">AI EXECUTIVE BRIEFING</div>
          </div>
          <div className="text-[11px] text-white/40 mb-3">Classified · Updated {new Date().toLocaleTimeString()}</div>
          <p className="text-sm text-white/85 leading-relaxed">
            Risk around the <span className="text-orange-300 font-semibold">Strait of Hormuz</span> increased by <span className="text-orange-300">+18%</span> in the past 6 hours.
            Current disruption probability is <span className="text-red-300 font-bold">72%</span>.
          </p>
          <p className="text-sm text-white/70 mt-3 leading-relaxed">
            Combined with sustained Red Sea diversions, India's seaborne import exposure has widened. Tanker insurance premiums in the Gulf are up 23% week-over-week.
          </p>
          <div className="mt-4 p-3 rounded-lg border border-cyan-400/30 bg-cyan-500/5">
            <div className="label-tag mb-1">RECOMMENDED ACTION</div>
            <div className="text-sm text-cyan-200">Secure incremental cargo from Saudi Arabia (Aramco spot tender) and release <b>2.4 days</b> of strategic reserves over a 21-day window to dampen retail price transmission.</div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Mini label="Confidence" value="89%" tone="cyan" />
            <Mini label="Risk Reduction" value="-34%" tone="emerald" />
            <Mini label="Cost" value="$412M" tone="amber" />
          </div>
        </div>
      </div>

      <div className="panel p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs tracking-widest text-cyan-300">RECENT CRITICAL EVENTS · LAST 24H</div>
          <div className="text-[10px] text-white/40">Sources: SIGINT · OSINT · MARITIME AIS · MARKET FEEDS</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {events.map((e) => (
            <div key={e.id} className={`p-3 rounded-lg border ${severityBorder(e.severity)} bg-black/30`}>
              <div className="flex items-center gap-2 mb-2">
                {eventIcon(e.type)}
                <span className="label-tag">{e.type}</span>
                <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded ${severityTxt(e.severity)}`}>{e.severity}</span>
              </div>
              <div className="text-sm text-white/90 leading-snug">{e.title}</div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-white/50">
                <span>{e.region}</span><span>{e.time} UTC</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function eventIcon(t: string) {
  const c = "w-4 h-4 text-cyan-300";
  if (t === "Military") return <Sword className={c} />;
  if (t === "Shipping") return <Anchor className={c} />;
  if (t === "Sanction") return <AlertCircle className={c} />;
  return <Megaphone className={c} />;
}
function severityBorder(s: string) {
  if (s === "CRITICAL") return "border-red-500/50";
  if (s === "HIGH") return "border-orange-500/40";
  if (s === "ELEVATED") return "border-yellow-500/30";
  return "border-emerald-500/30";
}
function severityTxt(s: string) {
  if (s === "CRITICAL") return "bg-red-500/15 text-red-300";
  if (s === "HIGH") return "bg-orange-500/15 text-orange-300";
  if (s === "ELEVATED") return "bg-yellow-500/15 text-yellow-200";
  return "bg-emerald-500/15 text-emerald-300";
}
function colorTxt(c: string) {
  return c === "red" ? "text-red-400" : c === "amber" ? "text-orange-300" : c === "teal" ? "text-teal-300" : "text-cyan-300";
}
function Mini({ label, value, tone }: { label: string; value: string; tone: "cyan"|"emerald"|"amber" }) {
  const cls = tone === "emerald" ? "text-emerald-300" : tone === "amber" ? "text-orange-300" : "text-cyan-300";
  return (
    <div className="p-2 rounded bg-white/5 border border-white/10">
      <div className="label-tag">{label}</div>
      <div className={`text-sm font-bold ${cls}`}>{value}</div>
    </div>
  );
}
export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-cyan-grad tracking-tight">{title}</h1>
        <p className="text-xs text-white/50 mt-1">{subtitle}</p>
      </div>
      <div className="hidden md:flex items-center gap-2 text-[10px] text-white/40 tracking-widest">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" /> SYSTEM NOMINAL
      </div>
    </div>
  );
}
