import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { FOODS, findFood, suggestFoods, type Food } from "@/lib/foods";
import { useAppStore } from "@/lib/store";
import { Search, Loader2, Plus, AlertCircle, Flame, Beef, Wheat, Droplet } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/predict")({
  head: () => ({
    meta: [
      { title: "Predict Calories — CaloSmart" },
      { name: "description", content: "Search any food and get instant calorie, protein, carb, and fat estimates." },
    ],
  }),
  component: PredictPage,
});

function PredictPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Food | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [servings, setServings] = useState(1);
  const addEntry = useAppStore((s) => s.addEntry);

  const suggestions = useMemo(() => suggestFoods(query), [query]);

  const onPredict = (q?: string) => {
    const term = (q ?? query).trim();
    if (!term) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setTimeout(() => {
      const found = findFood(term);
      if (!found) {
        setError(`We couldn't find "${term}". Try another food.`);
      } else {
        setResult(found);
        setQuery(found.name);
      }
      setLoading(false);
    }, 600);
  };

  return (
    <PageShell>
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold">Predict Calories</h1>
        <p className="text-muted-foreground mt-1">Type a food name to instantly see its nutrition profile.</p>
      </header>

      <div className="card-soft p-5 sm:p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setError(null); }}
            onKeyDown={(e) => { if (e.key === "Enter") onPredict(); }}
            placeholder="Enter food name (e.g. pizza, apple, rice)"
            className="w-full rounded-2xl border border-border bg-background/60 pl-12 pr-32 py-4 text-base outline-none focus:ring-2 focus:ring-primary/40 transition"
          />
          <button
            onClick={() => onPredict()}
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white gradient-bg-primary shadow-sm disabled:opacity-50 hover-lift"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {loading ? "Predicting..." : "Predict"}
          </button>
        </div>

        {/* Suggestions */}
        <AnimatePresence>
          {query && suggestions.length > 0 && !result && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 flex flex-wrap gap-2"
            >
              {suggestions.map((s) => (
                <button
                  key={s.name}
                  onClick={() => onPredict(s.name)}
                  className="inline-flex items-center gap-2 rounded-full bg-muted hover:bg-primary/10 hover:text-primary border border-border px-3 py-1.5 text-sm transition-colors"
                >
                  <span>{s.icon}</span> {s.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Popular */}
        {!query && !result && (
          <div className="mt-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Popular</div>
            <div className="flex flex-wrap gap-2">
              {FOODS.slice(0, 10).map((f) => (
                <button
                  key={f.name}
                  onClick={() => onPredict(f.name)}
                  className="inline-flex items-center gap-2 rounded-full bg-muted hover:bg-primary/10 hover:text-primary border border-border px-3 py-1.5 text-sm transition-colors"
                >
                  <span>{f.icon}</span> {f.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* States */}
      <div className="mt-8">
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="card-soft p-10 grid place-items-center"
            >
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                Analyzing nutrition...
              </div>
            </motion.div>
          )}

          {error && !loading && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="card-soft p-6 border-destructive/30 bg-destructive/5 flex items-start gap-3"
            >
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Food not found</div>
                <div className="text-sm text-muted-foreground">{error}</div>
              </div>
            </motion.div>
          )}

          {result && !loading && (
            <motion.div
              key={result.name}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="card-soft overflow-hidden"
            >
              <div className="p-6 sm:p-8 grid lg:grid-cols-[auto,1fr,auto] gap-6 items-center">
                <div className="h-20 w-20 rounded-2xl gradient-bg-primary text-4xl grid place-items-center shadow-md">
                  <span className="drop-shadow">{result.icon}</span>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-primary font-semibold">{result.category}</div>
                  <h2 className="text-2xl sm:text-3xl font-bold">{result.name}</h2>
                  <p className="text-sm text-muted-foreground">Serving: {result.serving}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-extrabold gradient-text">{Math.round(result.calories * servings)}</div>
                  <div className="text-xs text-muted-foreground">kcal</div>
                </div>
              </div>

              <div className="px-6 sm:px-8 grid sm:grid-cols-3 gap-3">
                <Macro icon={Beef} label="Protein" value={`${(result.protein * servings).toFixed(1)} g`} color="var(--berry)" />
                <Macro icon={Wheat} label="Carbs" value={`${(result.carbs * servings).toFixed(1)} g`} color="var(--peach)" />
                <Macro icon={Droplet} label="Fat" value={`${(result.fat * servings).toFixed(1)} g`} color="var(--sky)" />
              </div>

              <div className="p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Servings</span>
                  <div className="inline-flex items-center rounded-full border border-border overflow-hidden">
                    <button onClick={() => setServings((v) => Math.max(0.5, +(v - 0.5).toFixed(1)))} className="px-3 py-1.5 hover:bg-muted">−</button>
                    <span className="px-4 font-semibold">{servings}</span>
                    <button onClick={() => setServings((v) => +(v + 0.5).toFixed(1))} className="px-3 py-1.5 hover:bg-muted">+</button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    addEntry(result, servings);
                    toast.success(`Added ${result.name} (${Math.round(result.calories * servings)} kcal)`);
                  }}
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white gradient-bg-primary shadow-md hover-lift"
                >
                  <Plus className="h-4 w-4" /> Add to today
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  );
}

function Macro({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="card-soft p-4 flex items-center gap-3">
      <div
        className="h-10 w-10 rounded-xl grid place-items-center"
        style={{ background: `color-mix(in oklab, ${color} 18%, transparent)` }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-semibold">{value}</div>
      </div>
      <Flame className="hidden" />
    </div>
  );
}
