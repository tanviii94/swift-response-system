import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { caloriesByCategory, getTodayEntries, last7DaysTrend, sumCalories, useAppStore } from "@/lib/store";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { motion } from "framer-motion";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — CaloSmart" },
      { name: "description", content: "Visualize your daily intake, weekly trends, and food category breakdown." },
    ],
  }),
  component: DashboardPage,
});

const COLORS = [
  "oklch(0.7 0.15 155)",
  "oklch(0.78 0.13 220)",
  "oklch(0.82 0.12 50)",
  "oklch(0.7 0.18 0)",
  "oklch(0.75 0.15 280)",
  "oklch(0.78 0.18 90)",
  "oklch(0.65 0.15 180)",
  "oklch(0.72 0.16 320)",
  "oklch(0.68 0.18 40)",
];

function DashboardPage() {
  const log = useAppStore((s) => s.log);
  const goal = useAppStore((s) => s.profile.goal);
  const today = getTodayEntries(log);
  const total = sumCalories(today);
  const trend = last7DaysTrend(log);
  const byCat = caloriesByCategory(today);
  const weeklyAvg = Math.round(trend.reduce((a, d) => a + d.calories, 0) / 7);

  const stats = [
    { label: "Today", value: `${total} kcal`, sub: `${Math.min(100, Math.round((total / goal) * 100))}% of goal` },
    { label: "Goal", value: `${goal} kcal`, sub: "Daily target" },
    { label: "Weekly avg", value: `${weeklyAvg} kcal`, sub: "Last 7 days" },
    { label: "Meals today", value: `${today.length}`, sub: "Items logged" },
  ];

  return (
    <PageShell>
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your nutrition at a glance.</p>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-soft p-5 hover-lift"
          >
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className="mt-1 text-2xl font-extrabold">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
          </motion.div>
        ))}
      </section>

      <section className="grid lg:grid-cols-5 gap-5">
        <div className="card-soft p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Daily intake — last 7 days</h2>
            <span className="text-xs text-muted-foreground">kcal</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="oklch(0.9 0.01 200)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" stroke="oklch(0.5 0.02 220)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.5 0.02 220)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid oklch(0.9 0.01 200)",
                    borderRadius: 12,
                    boxShadow: "0 10px 25px -10px rgba(0,0,0,.15)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="oklch(0.7 0.15 155)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "oklch(0.7 0.15 155)" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-soft p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Calories by category</h2>
            <span className="text-xs text-muted-foreground">today</span>
          </div>
          {byCat.length === 0 ? (
            <div className="h-72 grid place-items-center text-muted-foreground text-sm">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                Log a meal to see your breakdown.
              </div>
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCat}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {byCat.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid oklch(0.9 0.01 200)",
                      borderRadius: 12,
                    }}
                  />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
