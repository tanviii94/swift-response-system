import { createFileRoute } from "@tanstack/react-router";
import { useAegis } from "@/lib/aegis";
import { PageHeader } from "./index";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/reserve")({ component: Reserve });

function Reserve() {
  const { reserveDays } = useAegis();
  const pct = Math.min(100, (reserveDays / 120) * 100);
  const forecast = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, coverage: Math.max(20, reserveDays - i * 0.6 + Math.sin(i / 3) * 2) }));

  return (
    <div className="space-y-5">
      <PageHeader title="Strategic Reserve Intelligence" subtitle="Optimize emergency reserve usage and projection" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="panel p-6 flex flex-col items-center">
          <div className="label-tag">RESERVE COVERAGE</div>
          <div className="relative w-56 h-56 mt-4">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="50" stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="none" />
              <circle cx="60" cy="60" r="50" stroke="url(#g)" strokeWidth="10" fill="none"
                strokeDasharray={`${(pct / 100) * 314} 314`} strokeLinecap="round" />
              <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0%" stopColor="#22d3ee" /><stop offset="100%" stopColor="#2dd4bf" /></linearGradient></defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold text-cyan-grad">{reserveDays}d</div>
              <div className="text-[10px] text-white/50 mt-1">REMAINING</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 w-full">
            <Mini label="Capacity" v="120d" />
            <Mini label="Utilization" v={`${pct.toFixed(0)}%`} accent />
          </div>
        </div>

        <div className="panel p-5 lg:col-span-2">
          <div className="text-xs tracking-widest text-cyan-300 mb-3">AI RECOMMENDATION</div>
          <p className="text-sm text-white/85 leading-relaxed">
            Recommend phased release of <b className="text-cyan-300">2.4 days</b> equivalent over a <b>21-day</b> window. This stabilizes retail pump prices below the political threshold (+8%) while preserving <b className="text-emerald-300">71 days</b> of strategic buffer.
          </p>
          <div className="grid grid-cols-3 gap-3 mt-5">
            <Card label="Suggested Release" v="2.4 days" tone="cyan" sub="≈ 4.1M bbl over 21d" />
            <Card label="Coverage Remaining" v="71 days" tone="emerald" sub="Post-release buffer" />
            <Card label="Stabilization Time" v="18 days" tone="amber" sub="Expected to peak" />
          </div>
        </div>
      </div>

      <div className="panel p-5">
        <div className="text-xs tracking-widest text-cyan-300 mb-3">FORECAST · NEXT 30 DAYS</div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={forecast}>
            <defs><linearGradient id="rg" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.7} /><stop offset="100%" stopColor="#2dd4bf" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="day" stroke="#64748b" fontSize={10} />
            <YAxis stroke="#64748b" fontSize={10} />
            <Tooltip contentStyle={{ background: "#0a1424", border: "1px solid rgba(34,211,238,0.3)", borderRadius: 8 }} />
            <Area type="monotone" dataKey="coverage" stroke="#2dd4bf" fill="url(#rg)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
function Mini({ label, v, accent }: { label: string; v: string; accent?: boolean }) {
  return <div className="p-2 rounded bg-white/5 border border-white/10 text-center"><div className="label-tag">{label}</div><div className={`font-bold ${accent ? "text-cyan-300" : "text-white"}`}>{v}</div></div>;
}
function Card({ label, v, sub, tone }: { label: string; v: string; sub: string; tone: "cyan"|"emerald"|"amber" }) {
  const c = tone === "emerald" ? "text-emerald-300" : tone === "amber" ? "text-orange-300" : "text-cyan-300";
  return <div className="p-3 rounded-lg border border-white/10 bg-black/30"><div className="label-tag">{label}</div><div className={`text-xl font-bold mt-1 ${c}`}>{v}</div><div className="text-[10px] text-white/50 mt-1">{sub}</div></div>;
}
