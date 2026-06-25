import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "./index";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";

export const Route = createFileRoute("/economy")({ component: Economy });

function Economy() {
  const [oilPrice, setOilPrice] = useState(95);
  const [duration, setDuration] = useState(45);
  const [supplyLoss, setSupplyLoss] = useState(22);

  const m = useMemo(() => {
    const k = (oilPrice - 80) / 80 + supplyLoss / 100 + duration / 365;
    return {
      gdp: +(-k * 1.6).toFixed(2),
      inflation: +(k * 2.4).toFixed(2),
      fuel: +(k * 18).toFixed(1),
      logistics: +(k * 24).toFixed(1),
      manufacturing: +(-k * 12).toFixed(1),
      power: +(-k * 9).toFixed(1),
    };
  }, [oilPrice, duration, supplyLoss]);

  const series = Array.from({ length: 12 }, (_, i) => ({
    m: `M${i + 1}`,
    inflation: +(m.inflation * Math.sin((i + 1) / 4) * 0.8 + 4).toFixed(2),
    fuel: +(m.fuel * Math.cos((i + 1) / 6) * 0.5 + 100).toFixed(2),
  }));
  const bars = [
    { k: "GDP", v: m.gdp }, { k: "Inflation", v: m.inflation }, { k: "Fuel", v: m.fuel },
    { k: "Logistics", v: m.logistics }, { k: "Mfg", v: m.manufacturing }, { k: "Power", v: m.power },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Economic Impact Lab" subtitle="Quantify downstream consequences across the macro economy" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="panel p-5 space-y-5">
          <Slider label="Oil Price (Brent $/bbl)" v={oilPrice} min={50} max={180} on={setOilPrice} />
          <Slider label="Disruption Duration (days)" v={duration} min={5} max={180} on={setDuration} />
          <Slider label="Supply Loss (%)" v={supplyLoss} min={0} max={70} on={setSupplyLoss} />
          <div className="text-[10px] text-white/40">Sliders drive all charts in real time.</div>
        </div>
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-3">
          <Metric label="GDP Impact" v={`${m.gdp}%`} tone="red" />
          <Metric label="Inflation" v={`+${m.inflation}%`} tone="red" />
          <Metric label="Fuel Price" v={`+${m.fuel}%`} tone="amber" />
          <Metric label="Logistics Cost" v={`+${m.logistics}%`} tone="amber" />
          <Metric label="Manufacturing" v={`${m.manufacturing}%`} tone="amber" />
          <Metric label="Power Sector" v={`${m.power}%`} tone="amber" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Chart title="INFLATION TRAJECTORY (12M)">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={series}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="m" stroke="#64748b" fontSize={10} /><YAxis stroke="#64748b" fontSize={10} />
              <Tooltip contentStyle={{ background: "#0a1424", border: "1px solid rgba(34,211,238,0.3)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="inflation" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Chart>
        <Chart title="MACRO IMPACT (%)">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={bars}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="k" stroke="#64748b" fontSize={10} /><YAxis stroke="#64748b" fontSize={10} />
              <Tooltip contentStyle={{ background: "#0a1424", border: "1px solid rgba(34,211,238,0.3)", borderRadius: 8 }} />
              <Bar dataKey="v" fill="#22d3ee" />
            </BarChart>
          </ResponsiveContainer>
        </Chart>
      </div>
    </div>
  );
}
function Slider({ label, v, min, max, on }: { label: string; v: number; min: number; max: number; on: (n: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between"><span className="label-tag">{label}</span><span className="text-xs text-cyan-300">{v}</span></div>
      <input type="range" min={min} max={max} value={v} onChange={(e) => on(+e.target.value)} className="w-full accent-cyan-400" />
    </div>
  );
}
function Metric({ label, v, tone }: { label: string; v: string; tone: "red"|"amber"|"cyan" }) {
  const c = tone === "red" ? "text-red-400" : tone === "amber" ? "text-orange-300" : "text-cyan-300";
  return <div className="panel p-4"><div className="label-tag">{label}</div><div className={`text-2xl font-bold mt-1 ${c}`}>{v}</div></div>;
}
function Chart({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="panel p-4"><div className="text-xs tracking-widest text-cyan-300 mb-2">{title}</div>{children}</div>;
}
