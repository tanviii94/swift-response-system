import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { caloriesOf, getTodayEntries, sumCalories, useAppStore } from "@/lib/store";
import { Trash2, Search, Flame, Trophy } from "lucide-react";

export const Route = createFileRoute("/tracker")({
  head: () => ({
    meta: [
      { title: "Daily Tracker — CaloSmart" },
      { name: "description", content: "Track meals you've eaten today and monitor your calorie goal." },
    ],
  }),
  component: TrackerPage,
});

function TrackerPage() {
  const log = useAppStore((s) => s.log);
  const removeEntry = useAppStore((s) => s.removeEntry);
  const clearToday = useAppStore((s) => s.clearToday);
  const goal = useAppStore((s) => s.profile.goal);

  const today = getTodayEntries(log);
  const total = sumCalories(today);
  const pct = Math.min(100, Math.round((total / goal) * 100));
  const remaining = Math.max(0, goal - total);

  return (
    <PageShell>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold">Daily Tracker</h1>
          <p className="text-muted-foreground mt-1">Log every bite and stay on top of your goal.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/predict"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white gradient-bg-primary shadow-sm hover-lift"
          >
            <Search className="h-4 w-4" /> Add food
          </Link>
          {today.length > 0 && (
            <button
              onClick={clearToday}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border border-border hover:bg-muted"
            >
              <Trash2 className="h-4 w-4" /> Clear day
            </button>
          )}
        </div>
      </header>

      <section className="grid lg:grid-cols-3 gap-5 mb-8">
        <div className="card-soft p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-muted-foreground">Today's intake</div>
              <div className="text-3xl font-extrabold">
                {total.toLocaleString()} <span className="text-base font-medium text-muted-foreground">/ {goal.toLocaleString()} kcal</span>
              </div>
            </div>
            <div className={`text-sm font-semibold ${total > goal ? "text-destructive" : "text-primary"}`}>
              {pct}%
            </div>
          </div>
          <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              key={pct}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`h-full ${total > goal ? "bg-destructive" : ""} ${total > goal ? "" : "gradient-bg-primary"}`}
            />
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            {total > goal
              ? `You've gone ${total - goal} kcal over your goal.`
              : `${remaining.toLocaleString()} kcal remaining today.`}
          </div>
        </div>

        <div className="card-soft p-6 flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl gradient-bg-primary grid place-items-center text-white">
            {total > goal ? <Flame className="h-6 w-6" /> : <Trophy className="h-6 w-6" />}
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Status</div>
            <div className="font-semibold">
              {total === 0 ? "Nothing logged yet" : total > goal ? "Over goal" : pct >= 80 ? "Almost there" : "On track"}
            </div>
          </div>
        </div>
      </section>

      <section className="card-soft p-2 sm:p-4">
        <div className="px-3 py-3 flex items-center justify-between">
          <h2 className="font-semibold">Eaten today ({today.length})</h2>
        </div>
        {today.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            <div className="text-5xl mb-3">🍽️</div>
            No meals logged yet. Start by predicting a food.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            <AnimatePresence initial={false}>
              {today.map((e) => (
                <motion.li
                  key={e.id}
                  layout
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  className="flex items-center gap-4 px-3 py-3"
                >
                  <div className="h-11 w-11 rounded-xl bg-muted text-2xl grid place-items-center">{e.food.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{e.food.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {e.servings} × {e.food.serving} · {new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{caloriesOf(e)} kcal</div>
                    <div className="text-xs text-muted-foreground">{e.food.category}</div>
                  </div>
                  <button
                    onClick={() => removeEntry(e.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                    aria-label="Remove entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </section>
    </PageShell>
  );
}
