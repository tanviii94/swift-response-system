import { create } from "zustand";

export type Threat = "LOW" | "ELEVATED" | "HIGH" | "CRITICAL";

export interface Hotspot {
  id: string;
  name: string;
  x: number; // % on world map
  y: number;
  score: number; // 0-100
  confidence: number;
  trend: number; // -1..1
  importPct: number;
  detail: string;
}

export interface SupplyRoute {
  id: string;
  from: string;
  fromXY: [number, number];
  toXY: [number, number];
  sharePct: number;
  status: "safe" | "stress" | "disrupted";
  transitDays: number;
}

export interface IntelSignal {
  id: string;
  event: string;
  insight: string;
  confidence: number;
  impact: "Low" | "Moderate" | "High" | "Severe";
  region: string;
  time: string;
}

export interface CriticalEvent {
  id: string;
  type: "Sanction" | "Military" | "Shipping" | "OPEC";
  title: string;
  region: string;
  time: string;
  severity: Threat;
}

interface AegisState {
  brent: number;
  securityScore: number;
  threat: Threat;
  reserveDays: number;
  supplyStability: number;
  economicExposure: number;
  importDependency: number;
  activeAlerts: number;
  hotspots: Hotspot[];
  routes: SupplyRoute[];
  signals: IntelSignal[];
  events: CriticalEvent[];
  tick: () => void;
}

const initialHotspots: Hotspot[] = [
  { id: "hormuz", name: "Strait of Hormuz", x: 64, y: 47, score: 82, confidence: 91, trend: 0.4, importPct: 42, detail: "Iranian naval activity elevated. Tanker insurance premiums up 23%." },
  { id: "redsea", name: "Red Sea", x: 60, y: 50, score: 74, confidence: 88, trend: 0.3, importPct: 18, detail: "Houthi drone & missile attacks on commercial vessels." },
  { id: "suez", name: "Suez Canal", x: 58, y: 45, score: 58, confidence: 84, trend: 0.1, importPct: 14, detail: "Throughput reduced 31% YoY due to Red Sea diversions." },
  { id: "gulf", name: "Persian Gulf", x: 65, y: 48, score: 71, confidence: 86, trend: 0.2, importPct: 38, detail: "Regional tensions sustained; GCC contingency activated." },
  { id: "saudi", name: "Saudi Arabia", x: 62, y: 49, score: 35, confidence: 92, trend: -0.1, importPct: 17, detail: "Stable production. Aramco offering spot cargoes." },
  { id: "iraq", name: "Iraq", x: 64, y: 45, score: 52, confidence: 80, trend: 0.1, importPct: 22, detail: "Basra exports nominal; pipeline security advisories." },
  { id: "iran", name: "Iran", x: 66, y: 44, score: 88, confidence: 90, trend: 0.5, importPct: 0, detail: "Sanctioned. Strategic posture: hostile escalation risk." },
  { id: "uae", name: "UAE", x: 66, y: 49, score: 32, confidence: 93, trend: 0.0, importPct: 9, detail: "Fujairah bypass operational. Reliable alternate." },
  { id: "russia", name: "Russia", x: 70, y: 28, score: 65, confidence: 82, trend: 0.05, importPct: 35, detail: "Discounted Urals flow continues. Payment friction." },
];

const initialRoutes: SupplyRoute[] = [
  { id: "r1", from: "Saudi Arabia", fromXY: [62, 49], toXY: [78, 56], sharePct: 17, status: "safe", transitDays: 14 },
  { id: "r2", from: "Iraq", fromXY: [64, 45], toXY: [78, 56], sharePct: 22, status: "stress", transitDays: 16 },
  { id: "r3", from: "UAE", fromXY: [66, 49], toXY: [78, 56], sharePct: 9, status: "safe", transitDays: 12 },
  { id: "r4", from: "Russia", fromXY: [70, 28], toXY: [78, 56], sharePct: 35, status: "stress", transitDays: 35 },
  { id: "r5", from: "Iran (Hormuz Corridor)", fromXY: [66, 44], toXY: [78, 56], sharePct: 42, status: "disrupted", transitDays: 18 },
];

const initialSignals: IntelSignal[] = [
  { id: "s1", event: "Houthi Drone Attack on VLCC", insight: "Red Sea shipping risk +15%. Diversion via Cape adds 12 days transit.", confidence: 87, impact: "Moderate", region: "Red Sea", time: "12m ago" },
  { id: "s2", event: "IRGC Naval Exercise — Hormuz", insight: "Closure probability raised from 48% to 72%. Tanker insurance +23%.", confidence: 91, impact: "Severe", region: "Hormuz", time: "47m ago" },
  { id: "s3", event: "OPEC+ Surprise Cut Signaled", insight: "Brent forecast +$6/bbl over 30 days. Inflation transmission ~0.4%.", confidence: 78, impact: "High", region: "Global", time: "2h ago" },
  { id: "s4", event: "EU Sanctions Package 14", insight: "Russian crude buyers face secondary exposure. Discount widens.", confidence: 83, impact: "Moderate", region: "Russia", time: "5h ago" },
  { id: "s5", event: "Saudi Spare Capacity Statement", insight: "+1.2 Mbpd available within 30 days. Risk premium softens.", confidence: 89, impact: "Low", region: "Saudi Arabia", time: "9h ago" },
];

const initialEvents: CriticalEvent[] = [
  { id: "e1", type: "Military", title: "Iranian fast-boats shadowing UK-flagged tanker", region: "Hormuz", time: "00:42", severity: "CRITICAL" },
  { id: "e2", type: "Shipping", title: "VLCC re-routed around Cape of Good Hope", region: "Red Sea", time: "02:11", severity: "HIGH" },
  { id: "e3", type: "OPEC", title: "OPEC+ JMMC signals voluntary output cut extension", region: "Vienna", time: "06:30", severity: "ELEVATED" },
  { id: "e4", type: "Sanction", title: "Treasury OFAC designates 3 shadow-fleet entities", region: "USA", time: "09:15", severity: "ELEVATED" },
];

export const useAegis = create<AegisState>((set, get) => ({
  brent: 87.42,
  securityScore: 64,
  threat: "HIGH",
  reserveDays: 74,
  supplyStability: 58,
  economicExposure: 71,
  importDependency: 87,
  activeAlerts: 7,
  hotspots: initialHotspots,
  routes: initialRoutes,
  signals: initialSignals,
  events: initialEvents,
  tick: () => {
    const s = get();
    const brent = +(s.brent + (Math.random() - 0.48) * 0.8).toFixed(2);
    const score = Math.max(20, Math.min(95, s.securityScore + (Math.random() - 0.5) * 1.5));
    set({
      brent,
      securityScore: +score.toFixed(1),
      threat: score < 35 ? "CRITICAL" : score < 55 ? "HIGH" : score < 75 ? "ELEVATED" : "LOW",
      hotspots: s.hotspots.map((h) => ({
        ...h,
        score: Math.max(5, Math.min(99, h.score + (Math.random() - 0.5) * 2)),
      })),
    });
  },
}));

// Crisis simulator engine
export interface SimInput {
  scenario: string;
  duration: number; // days
  severity: number; // 1-10
  regions: string[];
}
export interface SimOutput {
  supplyReduction: number;
  refineryImpact: number;
  petrolDelta: number;
  dieselDelta: number;
  inflation: number;
  gdp: number;
  logistics: number;
  series: { day: number; price: number; supply: number }[];
}

export function runSimulation(i: SimInput): SimOutput {
  const k = i.severity / 10;
  const dur = i.duration;
  const scenarioMult: Record<string, number> = {
    "Hormuz Closure": 1.6,
    "Red Sea Blockage": 1.1,
    "OPEC Production Cut": 0.9,
    "Supplier Sanctions": 0.8,
    "Military Conflict": 1.3,
    "Multi-Crisis Event": 1.9,
  };
  const m = scenarioMult[i.scenario] ?? 1;
  const supplyReduction = +(k * m * 35).toFixed(1);
  const refineryImpact = +(k * m * 22).toFixed(1);
  const petrolDelta = +(k * m * 18).toFixed(1);
  const dieselDelta = +(k * m * 21).toFixed(1);
  const inflation = +(k * m * 1.8).toFixed(2);
  const gdp = +(-k * m * 1.2).toFixed(2);
  const logistics = +(k * m * 27).toFixed(1);
  const series = Array.from({ length: dur }, (_, d) => {
    const phase = Math.sin((d / dur) * Math.PI);
    return {
      day: d + 1,
      price: +(87 + petrolDelta * phase * 0.9 + (Math.random() - 0.5) * 1.2).toFixed(2),
      supply: +(100 - supplyReduction * phase).toFixed(1),
    };
  });
  return { supplyReduction, refineryImpact, petrolDelta, dieselDelta, inflation, gdp, logistics, series };
}

export const scenarios = [
  "Hormuz Closure",
  "Red Sea Blockage",
  "OPEC Production Cut",
  "Supplier Sanctions",
  "Military Conflict",
  "Multi-Crisis Event",
];

export const timelinePhases = [
  { phase: "Threat Detected", offsetDays: 0, prob: 100, desc: "Intelligence signals confirmed via multi-source fusion." },
  { phase: "Shipping Delays", offsetDays: 3, prob: 88, desc: "Insurance premiums spike; carriers re-route." },
  { phase: "Refinery Stress", offsetDays: 11, prob: 74, desc: "Throughput cuts at coastal refineries." },
  { phase: "Fuel Price Increase", offsetDays: 18, prob: 81, desc: "Retail pump prices climb 8–14%." },
  { phase: "Inflation Pressure", offsetDays: 32, prob: 68, desc: "CPI transmission across logistics & manufacturing." },
  { phase: "Supply Stabilization", offsetDays: 58, prob: 71, desc: "Alternate sourcing & reserve release rebalance market." },
];
