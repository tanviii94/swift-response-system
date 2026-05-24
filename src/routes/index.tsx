import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  FiActivity,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiChevronRight,
  FiCopy,
  FiPause,
  FiPlay,
  FiTrash2,
  FiSearch,
  FiZap,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { useSim, analyze, type FailureGroup, type Analysis } from "@/lib/sim";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "API Failure Detector — AI Agent Dashboard" },
      { name: "description", content: "Real-time API failure detection with AI-powered root cause analysis and fix suggestions." },
    ],
  }),
  component: Dashboard,
});

function statusColor(code: number) {
  if (code === 0) return "text-purple-400";
  if (code >= 500) return "text-rose-400";
  if (code >= 400) return "text-amber-400";
  return "text-emerald-400";
}

function statusBadge(code: number) {
  if (code === 0) return "bg-purple-500/20 text-purple-300 border-purple-500/30";
  if (code === 503) return "bg-purple-500/20 text-purple-300 border-purple-500/30";
  if (code >= 500) return "bg-rose-500/20 text-rose-300 border-rose-500/30";
  if (code === 404) return "bg-orange-500/20 text-orange-300 border-orange-500/30";
  if (code >= 400) return "bg-amber-500/20 text-amber-300 border-amber-500/30";
  return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
}

function sevBadge(s: FailureGroup["severity"]) {
  switch (s) {
    case "CRITICAL": return "bg-rose-500/20 text-rose-300 border-rose-500/30";
    case "HIGH": return "bg-orange-500/20 text-orange-300 border-orange-500/30";
    case "MEDIUM": return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    case "LOW": return "bg-sky-500/20 text-sky-300 border-sky-500/30";
  }
}

function Header() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const time = now.toTimeString().slice(0, 8);
  const date = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  return (
    <header className="relative">
      <div className="flex flex-wrap items-center justify-between gap-4 py-5">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-bold">
            <span className="mr-2">🚨</span>
            <span className="text-gradient-pp">API Failure Detector</span>
          </h1>
          <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full border border-purple-400/40 bg-purple-500/10 text-purple-200 shadow-[0_0_20px_-4px_rgba(168,85,247,0.6)]">
            AI AGENT
          </span>
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse-dot" />
            <span className="text-[11px] font-semibold text-rose-300 tracking-wider">LIVE</span>
          </div>
        </div>
        <div className="text-sm text-slate-400 font-mono tabular-nums">
          {time} • {date}
        </div>
      </div>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
    </header>
  );
}

function CircularProgress({ value }: { value: number }) {
  const r = 50;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} stroke="rgba(255,255,255,0.15)" strokeWidth="10" fill="none" />
        <motion.circle
          cx="60" cy="60" r={r}
          stroke="white" strokeWidth="10" fill="none" strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-white font-bold text-xl">
        {Math.round(value)}%
      </div>
    </div>
  );
}

function HealthCard({ score, uptime }: { score: number; uptime: number }) {
  const status = score >= 85 ? "HEALTHY" : score >= 60 ? "DEGRADED" : "CRITICAL";
  const statusCls =
    status === "HEALTHY"
      ? "bg-emerald-500/25 text-emerald-100 border-emerald-300/40"
      : status === "DEGRADED"
      ? "bg-amber-500/25 text-amber-100 border-amber-300/40"
      : "bg-rose-500/25 text-rose-100 border-rose-300/40";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl p-6 sm:p-8 border border-white/10 glow-purple"
      style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed, #c026d3)" }}
    >
      <div className="absolute inset-0 grid-overlay opacity-30 pointer-events-none" />
      <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="text-xs font-semibold tracking-[0.2em] text-white/80">API HEALTH SCORE</div>
          <div className="text-7xl sm:text-8xl font-extrabold text-white leading-none mt-2 tabular-nums">
            {Math.round(score)}
          </div>
          <div className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold border ${statusCls}`}>
            {status}
          </div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <CircularProgress value={score} />
          <div className="text-center">
            <div className="text-2xl font-bold text-white tabular-nums">{uptime.toFixed(2)}%</div>
            <div className="text-xs text-white/70">Uptime (24h)</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({
  icon, label, value, trend, color,
}: { icon: React.ReactNode; label: string; value: string; trend: number; color: string }) {
  const up = trend > 0;
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass p-5 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(139,92,246,0.5)]"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl grid place-items-center ${color}`}>{icon}</div>
        <span className={`text-xs font-semibold ${up ? "text-emerald-400" : "text-slate-500"}`}>
          {up ? "▲" : "▼"} {Math.abs(trend)}
        </span>
      </div>
      <div className="text-2xl font-bold text-white tabular-nums">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </motion.div>
  );
}

function FailureGroups({
  groups, selectedId, onSelect,
}: { groups: FailureGroup[]; selectedId: string | null; onSelect: (g: FailureGroup) => void }) {
  return (
    <div className="glass p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-white flex items-center gap-2">
          🔍 <span>Active Failure Groups</span>
        </h2>
        <span className="text-xs font-bold px-2 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
          {groups.length}
        </span>
      </div>
      {groups.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <div className="text-4xl mb-2">✨</div>
          No failures detected in the last hour
        </div>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto scrollbar-thin pr-1">
          <AnimatePresence>
            {groups.map((g) => {
              const selected = selectedId === g.id;
              return (
                <motion.button
                  key={g.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  onClick={() => onSelect(g)}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-300 flex items-center gap-3 ${
                    selected
                      ? "bg-purple-500/15 border-purple-400/50 shadow-[0_0_25px_-10px_rgba(168,85,247,0.7)]"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="font-mono text-xs text-slate-200 truncate">{g.endpoint}</code>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${statusBadge(g.status)}`}>
                        {g.status === 0 ? "TIMEOUT" : g.status}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${sevBadge(g.severity)}`}>
                        {g.severity}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {g.count} failures
                      {g.recentDelta > 5 && (
                        <span className="text-rose-400 ml-2">+{g.recentDelta} in last hour</span>
                      )}
                    </div>
                  </div>
                  <FiChevronRight className="text-slate-500 shrink-0" />
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function AnalysisPanel({ group }: { group: FailureGroup | null }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    if (!group) {
      setAnalysis(null);
      return;
    }
    setLoading(true);
    setAnalysis(null);
    const id = setTimeout(() => {
      setAnalysis(analyze(group));
      setLoading(false);
    }, 900);
    return () => clearTimeout(id);
  }, [group]);

  const copyFix = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis.fix);
    toast.success("Fix copied to clipboard");
  };

  return (
    <div className="relative glass p-5 h-full overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500" />
      <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
        🤖 <span>AI Root Cause Analysis</span>
      </h2>

      {!group && (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">🧠</div>
          <p className="text-slate-300 font-medium">Select a failure group to see AI-powered analysis</p>
          <p className="text-slate-500 text-sm mt-1">Our AI agent analyzes patterns and suggests fixes</p>
        </div>
      )}

      {group && loading && (
        <div className="space-y-3">
          <p className="text-purple-300 font-medium">🧠 AI is analyzing log patterns...</p>
          <div className="h-4 bg-white/10 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-white/10 rounded animate-pulse w-full" />
          <div className="h-4 bg-white/10 rounded animate-pulse w-5/6" />
          <div className="h-20 bg-white/10 rounded animate-pulse" />
        </div>
      )}

      {group && analysis && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div>
            <div className="text-[10px] font-bold tracking-widest text-slate-400 mb-1">🎯 ROOT CAUSE</div>
            <p className="text-rose-300 font-semibold text-lg leading-snug">{analysis.rootCause}</p>
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-widest text-slate-400 mb-1">📖 WHY THIS HAPPENED</div>
            <p className="text-slate-300 text-sm leading-relaxed">{analysis.why}</p>
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-widest text-slate-400 mb-1">⚡ PRIORITY</div>
            <span className={`inline-block text-xs font-bold px-2 py-1 rounded border ${sevBadge(analysis.priority)}`}>
              {analysis.priority}
            </span>
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-widest text-slate-400 mb-1">🔧 SUGGESTED FIX</div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
              <pre className="font-mono text-xs text-emerald-200 whitespace-pre-wrap leading-relaxed">{analysis.fix}</pre>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={copyFix}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 border border-white/10 text-white transition-all"
            >
              <FiCopy /> Copy Fix
            </button>
            <button
              onClick={() => setModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-purple-500 hover:bg-purple-400 text-white transition-all"
            >
              <FiZap /> Apply Fix
            </button>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-white mb-3">Apply Fix — Steps</h3>
              <ol className="space-y-2 text-sm text-slate-300 list-decimal list-inside">
                <li>Review the suggested patch with your team.</li>
                <li>Create a feature branch and apply the change.</li>
                <li>Run integration tests against staging.</li>
                <li>Deploy with the canary strategy (5% → 50% → 100%).</li>
                <li>Watch this dashboard for 15 minutes to confirm recovery.</li>
              </ol>
              <button
                onClick={() => { setModal(false); toast.success("Fix scheduled for deployment"); }}
                className="mt-5 w-full py-2 rounded-lg bg-purple-500 hover:bg-purple-400 text-white font-semibold transition-all"
              >
                Confirm
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Forecast({ groups }: { groups: FailureGroup[] }) {
  const top = groups[0];
  const confidence = Math.min(95, 40 + groups.reduce((a, g) => a + g.count, 0));
  const minutes = Math.max(2, 20 - Math.floor(confidence / 10));
  return (
    <div className="glass p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-white flex items-center gap-2">
          🔮 <span>Failure Forecast</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/30">
            AI PREDICTION
          </span>
        </h2>
        <span className="text-xs text-slate-400">Confidence {confidence}%</span>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-slate-400">Next failure predicted in</div>
          <div className="text-3xl font-bold text-white mt-1">~{minutes} min</div>
          <div className="text-xs text-slate-500 mt-1">Based on historical failure patterns</div>
        </div>
        <div className="space-y-2">
          <div className="text-sm text-slate-400">Most likely endpoint</div>
          <code className="block font-mono text-sm text-purple-300">{top?.endpoint ?? "/api/—"}</code>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 1.2 }}
              className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function LogStream() {
  const logs = useSim((s) => s.logs);
  const paused = useSim((s) => s.paused);
  const pause = useSim((s) => s.pause);
  const resume = useSim((s) => s.resume);
  const clearLogs = useSim((s) => s.clearLogs);
  const [filter, setFilter] = useState<"all" | "errors" | "warnings" | "success">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (filter === "errors" && !(l.status === 0 || l.status >= 500)) return false;
      if (filter === "warnings" && !(l.status >= 400 && l.status < 500)) return false;
      if (filter === "success" && !(l.status >= 200 && l.status < 300)) return false;
      if (query && !l.endpoint.toLowerCase().includes(query.toLowerCase()) && !String(l.status).includes(query)) return false;
      return true;
    });
  }, [logs, filter, query]);

  return (
    <div className="glass p-5">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
        <h2 className="font-semibold text-white flex items-center gap-2">
          📡 <span>Live Log Stream</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            REAL-TIME
          </span>
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter..."
              className="pl-7 pr-2 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400/50 w-32"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="text-xs bg-white/5 border border-white/10 rounded-lg text-white px-2 py-1.5 focus:outline-none focus:border-purple-400/50"
          >
            <option value="all">All</option>
            <option value="errors">Errors Only</option>
            <option value="warnings">Warnings</option>
            <option value="success">Success</option>
          </select>
          <button
            onClick={() => (paused ? resume() : pause())}
            className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all"
          >
            {paused ? <FiPlay /> : <FiPause />} {paused ? "Resume" : "Pause"}
          </button>
          <button
            onClick={() => { if (confirm("Clear all logs?")) clearLogs(); }}
            className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 border border-white/10 text-white transition-all"
          >
            <FiTrash2 /> Clear
          </button>
        </div>
      </div>
      <div className="bg-black/40 rounded-xl p-3 font-mono text-sm h-72 overflow-y-auto scrollbar-thin flex flex-col-reverse">
        <div>
          {filtered.slice(-150).map((l) => (
            <div
              key={l.id}
              className="px-1 py-0.5 rounded hover:bg-white/5 transition-colors flex gap-2"
              title={`${l.responseTime}ms`}
            >
              <span className="text-gray-500">[{l.ts.toTimeString().slice(0, 8)}]</span>
              <span className="text-slate-300">→</span>
              <span className="text-slate-200 font-semibold">{l.method}</span>
              <span className="text-slate-400">{l.endpoint}</span>
              <span className="text-slate-300">→</span>
              <span className={statusColor(l.status)}>
                {l.status === 0 ? "TIMEOUT" : l.status} ({l.responseTime}ms)
              </span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-slate-500 text-center py-4">No logs match the current filter.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Charts() {
  const logs = useSim((s) => s.logs);

  const trend = useMemo(() => {
    const buckets: { label: string; failures: number }[] = [];
    const now = Date.now();
    for (let i = 5; i >= 0; i--) {
      const end = now - i * 5 * 60 * 1000;
      const start = end - 5 * 60 * 1000;
      const failures = logs.filter((l) => {
        const t = l.ts.getTime();
        return t >= start && t < end && (l.status === 0 || l.status >= 400);
      }).length;
      // For demo, distribute existing failures
      buckets.push({
        label: `${i * 5}m`,
        failures: failures || Math.floor(Math.random() * 8) + (i === 0 ? 6 : 2),
      });
    }
    return buckets.reverse();
  }, [logs]);

  const dist = useMemo(() => {
    const rts = logs.map((l) => l.responseTime).sort((a, b) => a - b);
    const q = (p: number) => rts[Math.floor((rts.length - 1) * p)] ?? 0;
    return [
      { label: "P50", value: q(0.5), color: "#10b981" },
      { label: "P90", value: q(0.9), color: "#84cc16" },
      { label: "P95", value: q(0.95), color: "#f59e0b" },
      { label: "P99", value: q(0.99), color: "#ef4444" },
    ];
  }, [logs]);

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <div className="glass p-5">
        <h2 className="font-semibold text-white mb-3">Failure Trend (Last 30 minutes)</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="failG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#1a1a3e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "white" }} />
              <Area type="monotone" dataKey="failures" stroke="#ef4444" strokeWidth={2} fill="url(#failG)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="glass p-5">
        <h2 className="font-semibold text-white mb-3">Response Time Distribution</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dist} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#1a1a3e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "white" }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {dist.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const tick = useSim((s) => s.tick);
  const logs = useSim((s) => s.logs);
  const groups = useSim((s) => s.groups);
  const total = useSim((s) => s.total);
  const failures = useSim((s) => s.failures);
  const avgRt = useSim((s) => s.avgRt);
  const prevTotal = useSim((s) => s.prevTotal);
  const prevFailures = useSim((s) => s.prevFailures);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(tick, 1500);
    return () => clearInterval(id);
  }, [tick]);

  const successRate = total === 0 ? 100 : ((total - failures) / total) * 100;
  const healthScore = Math.max(0, Math.min(100, successRate - Math.min(20, groups.length * 2)));
  const uptime = Math.max(95, 100 - failures / Math.max(1, total) * 50);
  const selected = groups.find((g) => g.id === selectedId) ?? null;

  return (
    <div className="min-h-screen grid-overlay">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Header />

        <main className="space-y-5 mt-5">
          <HealthCard score={healthScore} uptime={uptime} />

          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<FiActivity className="text-purple-300" />}
              label="Total Requests"
              value={total.toLocaleString()}
              trend={total - prevTotal}
              color="bg-purple-500/15"
            />
            <StatCard
              icon={<FiAlertCircle className="text-rose-300" />}
              label="Failures"
              value={failures.toLocaleString()}
              trend={failures - prevFailures}
              color="bg-rose-500/15"
            />
            <StatCard
              icon={<FiCheckCircle className="text-emerald-300" />}
              label="Success Rate"
              value={`${successRate.toFixed(1)}%`}
              trend={0}
              color="bg-emerald-500/15"
            />
            <StatCard
              icon={<FiClock className="text-amber-300" />}
              label="Avg Response"
              value={`${avgRt} ms`}
              trend={0}
              color="bg-amber-500/15"
            />
          </section>

          <section className="grid lg:grid-cols-5 gap-5">
            <div className="lg:col-span-3">
              <FailureGroups groups={groups} selectedId={selectedId} onSelect={(g) => setSelectedId(g.id)} />
            </div>
            <div className="lg:col-span-2">
              <AnalysisPanel group={selected} />
            </div>
          </section>

          <Forecast groups={groups} />

          <LogStream />

          <Charts />

          <footer className="text-center text-xs text-slate-500 pt-4">
            {logs.length} log entries in buffer • AI Agent v1.0
          </footer>
        </main>
      </div>
    </div>
  );
}
