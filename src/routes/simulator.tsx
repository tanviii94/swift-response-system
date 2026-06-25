import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { runSimulation, scenarios, type SimOutput } from "@/lib/aegis";
import { PageHeader } from "./index";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, CartesianGrid, Area, AreaChart } from "recharts";
import { Play, Anchor, Factory, Route as RouteIcon } from "lucide-react";

export const Route = createFileRoute("/simulator")({ component: SimulatorPage });

const regions = ["Hormuz", "Red Sea", "Suez", "Persian Gulf", "Arabian Sea"];

function SimulatorPage() {
  const [scenario, setScenario] = useState(scenarios[0]);
  const [duration, setDuration] = useState(30);
  const [severity, setSeverity] = useState(7);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(["Hormuz"]);
  const [result, setResult] = useState<SimOutput | null>(null);

  const run = () => setResult(runSimulation({ scenario, duration, severity, regions: selectedRegions }));

  return (
    <div className="space-y-5">
      <PageHeader title="Crisis Simulator" subtitle="Model the downstream impact of geopolitical scenarios on India's energy system" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="panel p-5 space-y-4">
          <div>
            <div className="label-tag mb-2">SCENARIO</div>
            <select value={scenario} onChange={(e) => setScenario(e.target.value)}
              className="w-full bg-black/40 border border-white/15 rounded-md px-3 py-2 text-sm text-white">
              {scenarios.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between"><span className="label-tag">DURATION</span><span className="text-xs text-cyan-300">{duration} days</span></div>
            <input type="range" min={3} max={120} value={duration} onChange={(e) => setDuration(+e.target.value)} className="w-full accent-cyan-400" />
          </div>
          <div>
            <div className="flex items-center justify-between"><span className="label-tag">SEVERITY</span><span className="text-xs text-cyan-300">{severity}/10</span></div>
            <input type="range" min={1} max={10} value={severity} onChange={(e) => setSeverity(+e.target.value)} className="w-full accent-cyan-400" />
          </div>
          <div>
            <div className="label-tag mb-2">AFFECTED REGIONS</div>
            <div className="flex flex-wrap gap-1.5">
              {regions.map((r) => {
                const on = selectedRegions.includes(r);
                return (
                  <button key={r} onClick={() => setSelectedRegions((s) => on ? s.filter((x) => x !== r) : [...s, r])}
                    className={`px-2 py-1 rounded text-[11px] border ${on ? "bg-cyan-500/15 border-cyan-400/50 text-cyan-200" : "bg-white/5 border-white/10 text-white/60"}`}>{r}</button>
                );
              })}
            </div>
          </div>
          <button onClick={run}
            className="w-full mt-2 px-4 py-2.5 rounded-md bg-gradient-to-r from-cyan-500 to-teal-500 text-black font-bold text-sm tracking-wider flex items-center justify-center gap-2 glow-cyan">
            <Play className="w-4 h-4" /> RUN SIMULATION
          </button>
        </div>

        <div className="lg:col-span-3 space-y-5">
          {!result ? (
            <div className="panel p-10 text-center text-white/50 text-sm">
              Configure parameters and run simulation to project impact.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Kpi label="Supply Reduction" value={`-${result.supplyReduction}%`} tone="red" />
                <Kpi label="Refinery Impact" value={`-${result.refineryImpact}%`} tone="amber" />
                <Kpi label="Petrol Price" value={`+${result.petrolDelta}%`} tone="amber" />
                <Kpi label="Diesel Price" value={`+${result.dieselDelta}%`} tone="amber" />
                <Kpi label="Inflation" value={`+${result.inflation}%`} tone="red" />
                <Kpi label="GDP" value={`${result.gdp}%`} tone="red" />
                <Kpi label="Logistics Cost" value={`+${result.logistics}%`} tone="amber" />
                <Kpi label="Confidence" value="84%" tone="cyan" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <ChartCard title="BRENT PRICE PROJECTION">
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={result.series}>
                      <defs><linearGradient id="g1" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#22d3ee" stopOpacity={0.6} /><stop offset="100%" stopColor="#22d3ee" stopOpacity={0} /></linearGradient></defs>
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="day" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} domain={['auto','auto']} />
                      <Tooltip contentStyle={{ background: "#0a1424", border: "1px solid rgba(34,211,238,0.3)", borderRadius: 8 }} />
                      <Area type="monotone" dataKey="price" stroke="#22d3ee" fill="url(#g1)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="SUPPLY AVAILABILITY">
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={result.series}>
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="day" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip contentStyle={{ background: "#0a1424", border: "1px solid rgba(34,211,238,0.3)", borderRadius: 8 }} />
                      <Line type="monotone" dataKey="supply" stroke="#f59e0b" dot={false} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              <div className="panel p-5">
                <div className="text-xs tracking-widest text-cyan-300 mb-3">AFFECTED INFRASTRUCTURE</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Infra icon={<Anchor className="w-4 h-4" />} label="Ports" items={["JNPT (Stress)", "Vadinar (Critical)", "Sikka (Stress)"]} />
                  <Infra icon={<Factory className="w-4 h-4" />} label="Refineries" items={["Jamnagar (-12%)", "Mangalore (-8%)", "Kochi (-6%)"]} />
                  <Infra icon={<RouteIcon className="w-4 h-4" />} label="Supply Corridors" items={["Hormuz (Disrupted)", "Bab-el-Mandeb (Stress)", "Cape Route (+12d)"]} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone: "cyan"|"red"|"amber" }) {
  const c = tone === "red" ? "text-red-400" : tone === "amber" ? "text-orange-300" : "text-cyan-300";
  return (
    <div className="panel p-3">
      <div className="label-tag">{label}</div>
      <div className={`text-xl font-bold mt-1 ${c}`}>{value}</div>
    </div>
  );
}
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="panel p-4">
      <div className="text-xs tracking-widest text-cyan-300 mb-2">{title}</div>
      {children}
    </div>
  );
}
function Infra({ icon, label, items }: { icon: React.ReactNode; label: string; items: string[] }) {
  return (
    <div className="p-3 rounded-lg border border-white/10 bg-black/30">
      <div className="flex items-center gap-2 text-cyan-300 mb-2">{icon}<span className="text-xs tracking-widest">{label}</span></div>
      <ul className="space-y-1">{items.map((i) => <li key={i} className="text-xs text-white/70">• {i}</li>)}</ul>
    </div>
  );
}
