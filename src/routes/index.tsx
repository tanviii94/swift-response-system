import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { MapView } from "@/components/MapView";
import { StatsBar } from "@/components/StatsBar";
import { IncidentCard } from "@/components/IncidentCard";
import { NotificationFeed } from "@/components/NotificationFeed";
import { SimulationControls } from "@/components/SimulationControls";
import { useSim } from "@/lib/sim-store";
import { AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Control Room — AI Emergency Response" },
      { name: "description", content: "Real-time AI ambulance dispatch and hospital coordination simulation." },
      { property: "og:title", content: "AI Emergency Response Control Room" },
      { property: "og:description", content: "Smart dispatch, live map, and hospital coordination." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const incidents = useSim((s) => s.incidents);
  const active = incidents.filter((i) => i.status !== "completed");
  const completed = incidents.filter((i) => i.status === "completed");

  return (
    <AppLayout title="Control Room Dashboard" subtitle="Intelligent dispatch · live coordination">
      <div className="flex h-full min-h-0 flex-col gap-3">
        <StatsBar />
        <div className="grid min-h-0 flex-1 grid-cols-12 gap-3">
          <div className="col-span-12 lg:col-span-8 xl:col-span-9 min-h-[320px]">
            <MapView />
          </div>
          <div className="col-span-12 flex min-h-0 flex-col gap-3 lg:col-span-4 xl:col-span-3">
            <SimulationControls />
            <div className="glass flex min-h-0 flex-1 flex-col rounded-2xl p-3">
              <div className="mb-2 flex items-center justify-between px-1">
                <div className="text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Incidents · {active.length} active
                </div>
                <div className="text-[10px] text-foreground/40">{completed.length} done</div>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                  {[...active, ...completed].map((i) => (
                    <IncidentCard key={i.id} incident={i} />
                  ))}
                </AnimatePresence>
                {incidents.length === 0 && (
                  <div className="px-2 py-6 text-center text-xs text-foreground/40">
                    No incidents. Click "+ Incident" to start.
                  </div>
                )}
              </div>
            </div>
            <div className="h-48 shrink-0">
              <NotificationFeed />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
