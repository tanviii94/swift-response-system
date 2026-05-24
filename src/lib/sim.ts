import { create } from "zustand";

export type LogEntry = {
  id: string;
  ts: Date;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  endpoint: string;
  status: number; // 0 = timeout
  responseTime: number;
};

export type FailureGroup = {
  id: string;
  endpoint: string;
  status: number;
  count: number;
  recentDelta: number; // failures in last hour increase
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  firstSeen: Date;
};

export type Analysis = {
  rootCause: string;
  why: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  fix: string;
};

const ENDPOINTS = [
  { method: "GET" as const, path: "/api/users" },
  { method: "POST" as const, path: "/api/auth/login" },
  { method: "GET" as const, path: "/api/products" },
  { method: "POST" as const, path: "/api/orders" },
  { method: "GET" as const, path: "/api/payments/status" },
  { method: "PUT" as const, path: "/api/cart/update" },
  { method: "GET" as const, path: "/api/search" },
  { method: "DELETE" as const, path: "/api/sessions" },
  { method: "GET" as const, path: "/api/analytics/track" },
  { method: "POST" as const, path: "/api/upload" },
];

function pickStatus(): number {
  const r = Math.random();
  if (r < 0.82) return 200;
  if (r < 0.86) return 201;
  if (r < 0.9) return 400;
  if (r < 0.93) return 404;
  if (r < 0.97) return 500;
  if (r < 0.99) return 503;
  return 0; // timeout
}

function severityFor(status: number, count: number): FailureGroup["severity"] {
  if (status === 500 || status === 503 || status === 0) return count > 15 ? "CRITICAL" : "HIGH";
  if (status === 404) return count > 25 ? "HIGH" : "MEDIUM";
  return "LOW";
}

const ANALYSES: Record<number, (ep: string) => Analysis> = {
  500: (ep) => ({
    rootCause: "Unhandled exception in upstream service",
    why: `Spike of 500s on ${ep} correlates with a database connection pool exhaustion. The service is throwing uncaught errors when waiting for a free connection beyond the configured timeout.`,
    priority: "CRITICAL",
    fix: `// Increase pool size and add circuit breaker
db.pool.max = 50;
db.pool.acquireTimeoutMillis = 8000;
app.use(circuitBreaker({ threshold: 0.5, timeout: 5000 }));`,
  }),
  503: (ep) => ({
    rootCause: "Service unavailable — downstream dependency overloaded",
    why: `${ep} is returning 503 because its rate limiter is rejecting requests. Traffic has exceeded the per-instance quota over the last 10 minutes.`,
    priority: "HIGH",
    fix: `// Add autoscaling and exponential backoff
kubectl autoscale deploy api --min=3 --max=12 --cpu-percent=70
retry({ strategy: "exponential", maxAttempts: 4, baseMs: 200 });`,
  }),
  404: (ep) => ({
    rootCause: "Missing or renamed resource path",
    why: `Clients are hitting ${ep} for a resource that no longer exists. Likely a recent migration removed the route without updating consumers.`,
    priority: "MEDIUM",
    fix: `// Add a redirect or restore the route alias
app.get("${ep}", (req, res) => res.redirect(308, "/v2${ep.replace("/api", "")}"));`,
  }),
  400: (ep) => ({
    rootCause: "Invalid client payload schema",
    why: `${ep} is rejecting requests because the request body is missing required fields. A recent client update is sending an outdated payload shape.`,
    priority: "MEDIUM",
    fix: `// Validate with zod and return field-level errors
const schema = z.object({ userId: z.string(), amount: z.number().positive() });
const result = schema.safeParse(req.body);
if (!result.success) return res.status(400).json(result.error.flatten());`,
  }),
  0: (ep) => ({
    rootCause: "Request timeout — slow upstream response",
    why: `${ep} requests are exceeding the 30s gateway timeout. A recent N+1 query pattern is causing exponential latency under load.`,
    priority: "CRITICAL",
    fix: `// Batch queries and add caching
const users = await db.user.findMany({ where: { id: { in: ids } } });
cache.set(cacheKey, users, { ttl: 60 });`,
  }),
};

export function analyze(group: FailureGroup): Analysis {
  const builder = ANALYSES[group.status] ?? ANALYSES[500];
  return builder(group.endpoint);
}

type State = {
  logs: LogEntry[];
  groups: FailureGroup[];
  total: number;
  failures: number;
  avgRt: number;
  prevTotal: number;
  prevFailures: number;
  paused: boolean;
  tick: () => void;
  pause: () => void;
  resume: () => void;
  clearLogs: () => void;
};

export const useSim = create<State>((set, get) => ({
  logs: [],
  groups: [],
  total: 0,
  failures: 0,
  avgRt: 0,
  prevTotal: 0,
  prevFailures: 0,
  paused: false,
  pause: () => set({ paused: true }),
  resume: () => set({ paused: false }),
  clearLogs: () => set({ logs: [] }),
  tick: () => {
    const s = get();
    if (s.paused) return;
    const newOnes: LogEntry[] = [];
    const burst = 1 + Math.floor(Math.random() * 4);
    for (let i = 0; i < burst; i++) {
      const ep = ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)];
      const status = pickStatus();
      newOnes.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ts: new Date(),
        method: ep.method,
        endpoint: ep.path,
        status,
        responseTime: status === 0 ? 30000 : Math.round(40 + Math.random() * (status >= 500 ? 900 : 280)),
      });
    }
    const logs = [...s.logs, ...newOnes].slice(-300);
    // Recompute groups from failures
    const failureLogs = logs.filter((l) => l.status === 0 || l.status >= 400);
    const map = new Map<string, FailureGroup>();
    for (const f of failureLogs) {
      const key = `${f.endpoint}|${f.status}`;
      const g = map.get(key);
      if (g) {
        g.count++;
        g.recentDelta++;
      } else {
        map.set(key, {
          id: key,
          endpoint: f.endpoint,
          status: f.status,
          count: 1,
          recentDelta: 1,
          severity: "LOW",
          firstSeen: f.ts,
        });
      }
    }
    const groups = Array.from(map.values())
      .map((g) => ({ ...g, severity: severityFor(g.status, g.count) }))
      .sort((a, b) => b.count - a.count);

    const total = s.total + newOnes.length;
    const failures = s.failures + newOnes.filter((l) => l.status === 0 || l.status >= 400).length;
    const totalRt = logs.reduce((a, l) => a + l.responseTime, 0);
    set({
      logs,
      groups,
      total,
      failures,
      avgRt: Math.round(totalRt / Math.max(1, logs.length)),
      prevTotal: s.total,
      prevFailures: s.failures,
    });
  },
}));

// Seed the store on import
const seed = useSim.getState();
for (let i = 0; i < 12; i++) seed.tick();
