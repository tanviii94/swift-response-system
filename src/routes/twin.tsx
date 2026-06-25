import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAegis } from "@/lib/aegis";
import { PageHeader } from "./index";
import { Anchor, Factory, Truck, Globe2, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/twin")({ component: Twin });

const ports = [{ id: "p1", name: "Vadinar", state: "stress" }, { id: "p2", name: "JNPT", state: "safe" }, { id: "p3", name: "Sikka", state: "safe" }, { id: "p4", name: "Chennai", state: "stress" }];
const refineries = [{ id: "r1", name: "Jamnagar", state: "safe" }, { id: "r2", name: "Mangalore", state: "stress" }, { id: "r3", name: "Kochi", state: "safe" }, { id: "r4", name: "Visakh", state: "safe" }];
const dist = [{ id: "d1", name: "North Grid", state: "safe" }, { id: "d2", name: "West Grid", state: "stress" }, { id: "d3", name: "South Grid", state: "safe" }, { id: "d4", name: "East Grid", state: "safe" }];

function Twin() {
  const { routes } = useAegis();
  const [sel, setSel] = useState<string>(routes[0].id);
  const s = routes.find((r) => r.id === sel)!;

  return (
    <div className="space-y-5">
      <PageHeader title="Supply Chain Digital Twin" subtitle="Live digital model of India's crude-to-distribution flow" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-3 panel p-5 overflow-x-auto">
          <div className="min-w-[900px] grid grid-cols-5 gap-3 items-stretch">
            <Col title="SUPPLIERS" icon={<Globe2 className="w-4 h-4" />}>
              {routes.map((r) => (
                <Node key={r.id} active={sel === r.id} onClick={() => setSel(r.id)} state={r.status} title={r.from} sub={`${r.sharePct}% · ${r.transitDays}d`} />
              ))}
            </Col>
            <Arrow />
            <Col title="ROUTES" icon={<ChevronRight className="w-4 h-4" />}>
              {routes.map((r) => (
                <Node key={r.id} state={r.status} title={`Route ${r.id.toUpperCase()}`} sub={`Transit ${r.transitDays}d`} />
              ))}
            </Col>
            <Arrow />
            <Col title="PORTS" icon={<Anchor className="w-4 h-4" />}>
              {ports.map((p) => <Node key={p.id} state={p.state as any} title={p.name} sub="Receipt" />)}
            </Col>
          </div>
          <div className="mt-6 min-w-[900px] grid grid-cols-5 gap-3 items-stretch">
            <Col title="REFINERIES" icon={<Factory className="w-4 h-4" />}>
              {refineries.map((p) => <Node key={p.id} state={p.state as any} title={p.name} sub="Throughput" />)}
            </Col>
            <Arrow />
            <Col title="DISTRIBUTION" icon={<Truck className="w-4 h-4" />}>
              {dist.map((p) => <Node key={p.id} state={p.state as any} title={p.name} sub="Network" />)}
            </Col>
          </div>
        </div>
        <div className="panel p-5">
          <div className="label-tag">SUPPLIER DETAIL</div>
          <div className="text-lg font-bold text-cyan-200 mt-1">{s.from}</div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            <Stat label="Import Share" v={`${s.sharePct}%`} />
            <Stat label="Risk Level" v={s.status.toUpperCase()} tone={s.status === "safe" ? "emerald" : s.status === "stress" ? "amber" : "red"} />
            <Stat label="Transit Time" v={`${s.transitDays} days`} />
            <Stat label="Carrier Capacity" v="94%" />
          </div>
          <div className="mt-4 label-tag">ALTERNATIVE OPTIONS</div>
          <ul className="mt-1 text-xs text-white/80 space-y-1">
            <li>• Aramco spot (Saudi)</li>
            <li>• ADNOC term swap (UAE)</li>
            <li>• WTI Atlantic Basin (USA)</li>
            <li>• Bonny Light (Nigeria)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Col({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="panel p-3">
      <div className="flex items-center gap-2 mb-3 text-cyan-300">{icon}<span className="label-tag">{title}</span></div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
function Arrow() {
  return <div className="flex items-center justify-center text-cyan-400/60"><ChevronRight className="w-6 h-6" /></div>;
}
function Node({ title, sub, state, onClick, active }: { title: string; sub: string; state: "safe"|"stress"|"disrupted"; onClick?: () => void; active?: boolean }) {
  const c = state === "safe" ? "border-emerald-400/40 shadow-[0_0_18px_-6px_rgba(34,197,94,0.6)]"
    : state === "stress" ? "border-orange-400/40 shadow-[0_0_18px_-6px_rgba(249,115,22,0.6)]"
    : "border-red-500/50 shadow-[0_0_20px_-4px_rgba(239,68,68,0.7)]";
  const dot = state === "safe" ? "bg-emerald-400" : state === "stress" ? "bg-orange-400" : "bg-red-500";
  return (
    <button onClick={onClick} className={`w-full text-left p-2.5 rounded-md border bg-black/40 ${c} ${active ? "ring-1 ring-cyan-400" : ""}`}>
      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse-dot`} />
        <span className="text-xs font-semibold text-white/90 truncate">{title}</span>
      </div>
      <div className="text-[10px] text-white/50 mt-0.5">{sub}</div>
    </button>
  );
}
function Stat({ label, v, tone }: { label: string; v: string; tone?: "emerald"|"amber"|"red" }) {
  const c = tone === "red" ? "text-red-300" : tone === "amber" ? "text-orange-300" : tone === "emerald" ? "text-emerald-300" : "text-white/90";
  return <div className="p-2 rounded bg-white/5 border border-white/10"><div className="label-tag">{label}</div><div className={`font-bold ${c}`}>{v}</div></div>;
}
