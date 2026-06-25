import { motion } from "framer-motion";
import { useAegis } from "@/lib/aegis";

const india =
  "M 690,200 L 700,215 L 712,222 L 720,238 L 715,255 L 728,272 L 740,288 L 752,310 L 748,330 L 740,352 L 728,372 L 710,388 L 692,398 L 678,410 L 668,425 L 660,440 L 650,432 L 642,415 L 630,400 L 620,382 L 615,365 L 612,348 L 605,330 L 598,310 L 595,288 L 600,268 L 612,252 L 628,240 L 642,228 L 660,218 L 678,208 Z";

const origins = [
  { id: "Saudi Arabia", x: 230, y: 290, label: "RIYADH" },
  { id: "Iraq", x: 290, y: 200, label: "BASRA" },
  { id: "UAE", x: 360, y: 290, label: "FUJAIRAH" },
  { id: "Russia", x: 520, y: 60,  label: "NOVOROSSIYSK" },
  { id: "Iran (Hormuz)", x: 360, y: 220, label: "HORMUZ CORRIDOR" },
];

const MUMBAI: [number, number] = [620, 340];

export function IndiaSupplyMap() {
  const routes = useAegis((s) => s.routes);
  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl">
      <svg viewBox="0 0 800 500" className="w-full h-full">
        <defs>
          <linearGradient id="ocean" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#06121f" />
            <stop offset="100%" stopColor="#040a14" />
          </linearGradient>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(34,211,238,0.06)" strokeWidth="1" />
          </pattern>
          <radialGradient id="indiaGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(34,211,238,0.35)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0.0)" />
          </radialGradient>
        </defs>
        <rect width="800" height="500" fill="url(#ocean)" />
        <rect width="800" height="500" fill="url(#grid)" />

        {/* abstract continents (stylized landmass clusters) */}
        <g fill="rgba(255,255,255,0.04)" stroke="rgba(34,211,238,0.18)" strokeWidth="1">
          <path d="M 50,150 Q 120,90 230,120 Q 320,140 380,180 Q 360,240 300,260 Q 220,280 160,260 Q 80,240 50,200 Z" />
          <path d="M 400,40 Q 520,30 640,60 Q 720,90 760,150 Q 700,180 600,170 Q 480,160 420,130 Z" />
          <path d="M 320,300 Q 380,290 430,320 Q 410,360 360,370 Q 320,360 310,330 Z" />
        </g>

        {/* India glow + outline */}
        <circle cx="660" cy="320" r="100" fill="url(#indiaGlow)" />
        <path d={india} fill="rgba(34,211,238,0.10)" stroke="#22d3ee" strokeWidth="1.5" />
        <text x="668" y="318" fill="#7dd3fc" fontSize="11" fontWeight="700" letterSpacing="2">INDIA</text>

        {/* Mumbai port */}
        <g transform={`translate(${MUMBAI[0]} ${MUMBAI[1]})`}>
          <circle r="6" fill="#22d3ee" />
          <circle r="12" fill="none" stroke="#22d3ee" strokeOpacity="0.5" />
          <text x="10" y="-8" fill="#bae6fd" fontSize="10" fontWeight="600">MUMBAI / JNPT</text>
        </g>

        {/* Routes */}
        {routes.map((r) => {
          const origin = origins.find((o) => o.id === r.from) ?? origins[0];
          const color = r.status === "safe" ? "#22c55e" : r.status === "stress" ? "#f59e0b" : "#ef4444";
          const mx = (origin.x + MUMBAI[0]) / 2;
          const my = Math.min(origin.y, MUMBAI[1]) - 40;
          const d = `M ${origin.x} ${origin.y} Q ${mx} ${my} ${MUMBAI[0]} ${MUMBAI[1]}`;
          return (
            <g key={r.id}>
              <path d={d} fill="none" stroke={color} strokeOpacity="0.25" strokeWidth="3" />
              <path d={d} fill="none" stroke={color} strokeWidth="2" className={r.status === "disrupted" ? "route-flow-fast" : "route-flow"} />
            </g>
          );
        })}

        {/* Origin markers */}
        {origins.map((o) => {
          const r = routes.find((x) => x.from === o.id);
          const color = !r ? "#94a3b8" : r.status === "safe" ? "#22c55e" : r.status === "stress" ? "#f59e0b" : "#ef4444";
          return (
            <g key={o.id} transform={`translate(${o.x} ${o.y})`}>
              <circle r="14" fill={color} fillOpacity="0.12" />
              <circle r="5" fill={color} />
              <text x="9" y="-9" fill="#cbd5e1" fontSize="9" fontWeight="700" letterSpacing="1.5">{o.label}</text>
              {r && <text x="9" y="14" fill={color} fontSize="9">{r.sharePct}% · {r.transitDays}d</text>}
            </g>
          );
        })}
      </svg>

      <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/40 border border-cyan-400/30 text-[10px] tracking-widest text-cyan-300">
        SUPPLY CORRIDOR · LIVE
      </div>
      <div className="absolute bottom-3 right-3 flex gap-3 text-[10px] text-white/60">
        <Legend color="#22c55e" label="SAFE" />
        <Legend color="#f59e0b" label="STRESS" />
        <Legend color="#ef4444" label="DISRUPTED" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      {label}
    </span>
  );
}

export function WorldRadarMap({ onSelect, selectedId }: { onSelect?: (id: string) => void; selectedId?: string }) {
  const hotspots = useAegis((s) => s.hotspots);
  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl">
      <svg viewBox="0 0 1000 500" className="w-full h-full">
        <defs>
          <pattern id="grid2" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(34,211,238,0.05)" strokeWidth="1" />
          </pattern>
          <radialGradient id="globe" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(34,211,238,0.06)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>
        <rect width="1000" height="500" fill="#04101c" />
        <rect width="1000" height="500" fill="url(#grid2)" />
        <ellipse cx="500" cy="250" rx="480" ry="220" fill="url(#globe)" />

        {/* stylized continents */}
        <g fill="rgba(255,255,255,0.04)" stroke="rgba(34,211,238,0.20)" strokeWidth="1">
          <path d="M 80,140 Q 200,80 320,120 Q 360,180 320,240 Q 220,260 140,240 Q 70,220 80,140 Z" />
          <path d="M 200,260 Q 270,270 300,330 Q 280,400 230,420 Q 180,380 190,310 Z" />
          <path d="M 360,90 Q 520,60 700,90 Q 800,130 780,200 Q 700,240 560,220 Q 420,200 360,150 Z" />
          <path d="M 500,230 Q 600,240 680,290 Q 700,360 640,400 Q 540,380 500,320 Z" />
          <path d="M 780,300 Q 870,310 900,360 Q 870,420 800,420 Q 760,380 780,330 Z" />
          <path d="M 720,210 Q 780,220 800,260 Q 770,295 730,290 Q 700,260 720,210 Z" />
        </g>

        {/* latitude lines */}
        <g stroke="rgba(34,211,238,0.08)" fill="none">
          <line x1="0" y1="250" x2="1000" y2="250" />
          <line x1="500" y1="0" x2="500" y2="500" />
        </g>

        {hotspots.map((h) => {
          const cx = (h.x / 100) * 1000;
          const cy = (h.y / 100) * 500;
          const color = h.score >= 75 ? "#ef4444" : h.score >= 55 ? "#f59e0b" : h.score >= 35 ? "#fcd34d" : "#22c55e";
          const sel = selectedId === h.id;
          return (
            <g key={h.id} transform={`translate(${cx} ${cy})`} onClick={() => onSelect?.(h.id)} className="cursor-pointer">
              <circle r={sel ? 28 : 22} fill={color} fillOpacity="0.08">
                <animate attributeName="r" values={`${sel?28:18};${sel?38:30};${sel?28:18}`} dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="fill-opacity" values="0.18;0.02;0.18" dur="2.5s" repeatCount="indefinite" />
              </circle>
              <circle r={sel ? 8 : 6} fill={color} stroke="#000" strokeOpacity="0.4" />
              <text x="10" y="-10" fill="#e2e8f0" fontSize="10" fontWeight="700" letterSpacing="1">{h.name.toUpperCase()}</text>
              <text x="10" y="4" fill={color} fontSize="9" fontWeight="600">SCORE {h.score.toFixed(0)} · CONF {h.confidence}%</text>
            </g>
          );
        })}
      </svg>
      <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/40 border border-cyan-400/30 text-[10px] tracking-widest text-cyan-300">
        GEO-INTEL RADAR · GLOBAL
      </div>
    </div>
  );
}
