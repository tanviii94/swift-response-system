import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { ArrowRight, Sparkles, BarChart3, Salad, Apple, Pizza, Cookie } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CaloSmart — Smart Food Calorie Predictor" },
      { name: "description", content: "Know your calories. Eat smarter. Predict food calories instantly and track your daily nutrition." },
      { property: "og:title", content: "CaloSmart — Smart Food Calorie Predictor" },
      { property: "og:description", content: "Predict food calories and track daily nutrition with a clean, modern dashboard." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <PageShell>
      <section className="relative grid lg:grid-cols-2 gap-12 items-center py-8 lg:py-16">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-[color:var(--leaf)]/20 blur-3xl animate-blob" />
        <div className="pointer-events-none absolute top-40 -right-10 h-72 w-72 rounded-full bg-[color:var(--sky)]/25 blur-3xl animate-blob" style={{ animationDelay: "3s" }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" /> AI-powered nutrition
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05]">
            Smart Food <span className="gradient-text">Calorie</span> Predictor
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-lg">
            Know your calories. Eat smarter. Search any food, log your meals, and visualize your day in seconds.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/predict"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white gradient-bg-primary shadow-md hover-lift"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold bg-card border border-border hover-lift"
            >
              <BarChart3 className="h-4 w-4" /> View dashboard
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
            {[
              { k: "40+", v: "Foods" },
              { k: "1‑tap", v: "Logging" },
              { k: "100%", v: "Local & private" },
            ].map((s) => (
              <div key={s.v} className="card-soft p-4 text-center">
                <div className="text-2xl font-bold gradient-text">{s.k}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.v}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative z-10"
        >
          <div className="relative aspect-square max-w-md mx-auto">
            <div className="absolute inset-0 rounded-[2rem] gradient-bg-primary opacity-20 blur-2xl" />
            <div className="relative card-soft h-full p-8 flex flex-col items-center justify-center gap-6">
              <div className="grid grid-cols-2 gap-4 w-full">
                {[
                  { icon: Apple, color: "var(--leaf)", label: "Apple", cal: 95 },
                  { icon: Pizza, color: "var(--peach)", label: "Pizza", cal: 285 },
                  { icon: Salad, color: "var(--sky)", label: "Salad", cal: 33 },
                  { icon: Cookie, color: "var(--berry)", label: "Cookie", cal: 150 },
                ].map((it, i) => {
                  const Icon = it.icon;
                  return (
                    <motion.div
                      key={it.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      whileHover={{ y: -4 }}
                      className="card-soft p-4 flex items-center gap-3"
                    >
                      <div
                        className="h-11 w-11 rounded-xl grid place-items-center"
                        style={{ background: `color-mix(in oklab, ${it.color} 18%, transparent)` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: it.color }} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{it.label}</div>
                        <div className="text-xs text-muted-foreground">{it.cal} kcal</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="w-full card-soft p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Today</span>
                  <span className="font-semibold">1,420 / 2,000 kcal</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "71%" }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="h-full gradient-bg-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="py-12">
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { title: "Predict Instantly", desc: "Type any food and get calories, protein, carbs, and fat in real time.", icon: Sparkles },
            { title: "Track Your Day", desc: "Log meals with one click and see your remaining daily budget.", icon: Salad },
            { title: "Visualize Trends", desc: "Beautiful charts show your weekly intake and food categories.", icon: BarChart3 },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="card-soft p-6 hover-lift">
                <div className="h-10 w-10 rounded-xl gradient-bg-primary grid place-items-center text-white shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-lg">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
