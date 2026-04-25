import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { MapView } from "@/components/MapView";
import { useSim, MAP_CENTER, distanceKm } from "@/lib/sim-store";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/citizen")({
  head: () => ({
    meta: [
      { title: "Request Ambulance — AI Emergency Response" },
      { name: "description", content: "Request an ambulance and track it in real time." },
    ],
  }),
  component: CitizenPage,
});

function CitizenPage() {
  const addIncident = useSim((s) => s.addIncident);
  const incidents = useSim((s) => s.incidents);
  const ambulances = useSim((s) => s.ambulances);
  const hospitals = useSim((s) => s.hospitals);
  const [myIncidentId, setMyIncidentId] = useState<number | null>(null);

  const myInc = incidents.find((i) => i.id === myIncidentId);
  const myAmb = myInc ? ambulances.find((a) => a.id === myInc.ambulanceId) : undefined;
  const myHosp = myInc ? hospitals.find((h) => h.id === myInc.hospitalId) : undefined;

  const eta = useMemo(() => {
    if (!myAmb || myAmb.targetLat == null) return "—";
    const km = distanceKm(myAmb, { lat: myAmb.targetLat!, lng: myAmb.targetLng! });
    const sec = Math.max(0, Math.round((km / myAmb.speed) * 3600));
    return sec > 60 ? `${Math.floor(sec / 60)}m ${sec % 60}s` : `${sec}s`;
  }, [myAmb]);

  const handleRequest = () => {
    // request near a slight random offset of map center
    const inc = addIncident(MAP_CENTER.lat + (Math.random() - 0.5) * 0.02, MAP_CENTER.lng + (Math.random() - 0.5) * 0.02);
    setMyIncidentId(inc.id);
  };

  return (
    <AppLayout title="Citizen — Request Help" subtitle="One tap to dispatch">
      <div className="grid h-full grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7 min-h-[320px]">
          <MapView highlightAmbulanceId={myAmb?.id} followAmbulanceId={myAmb?.id} />
        </div>
        <div className="col-span-12 flex flex-col gap-3 lg:col-span-5">
          {!myInc && (
            <div className="glass flex flex-1 flex-col items-center justify-center rounded-2xl p-8 text-center">
              <div className="text-sm uppercase tracking-[0.2em] text-foreground/60">Emergency?</div>
              <div className="mt-2 max-w-sm text-foreground/70">
                Tap to instantly dispatch the nearest ambulance and notify a hospital.
              </div>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleRequest}
                className="mt-8 rounded-full bg-gradient-to-br from-[oklch(0.7_0.24_25)] to-[oklch(0.65_0.22_295)] px-10 py-8 text-xl font-bold text-white shadow-[0_0_50px_oklch(0.7_0.24_25_/_0.6)] transition-all"
              >
                🚨 Request Ambulance
              </motion.button>
              <div className="mt-6 text-[11px] text-foreground/50">Simulated request · no real dispatch</div>
            </div>
          )}

          {myInc && (
            <>
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div className="text-xs uppercase tracking-wider text-foreground/60">Your Request</div>
                  <span className="rounded-full bg-[oklch(0.7_0.24_25_/_0.25)] px-2.5 py-1 text-[10px] font-bold uppercase text-[oklch(0.85_0.2_25)]">
                    P{myInc.severity} · {myInc.type}
                  </span>
                </div>
                <div className="mt-3 text-3xl font-bold tracking-tight">
                  {myInc.status === "completed" ? "Arrived ✓" : eta}
                </div>
                <div className="text-xs text-foreground/60">
                  {myInc.status === "completed" ? "You have been delivered to the hospital" : "Estimated time of arrival"}
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-foreground/60">Ambulance</span><span>{myAmb ? `Unit #${myAmb.id}` : "Searching…"}</span></div>
                  <div className="flex justify-between"><span className="text-foreground/60">Status</span><span className="uppercase">{myInc.status.replace("_", " ")}</span></div>
                  <div className="flex justify-between"><span className="text-foreground/60">Hospital</span><span>{myHosp?.name ?? "—"}</span></div>
                </div>
              </div>

              <div className="glass rounded-2xl p-4">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-foreground/70">Timeline</div>
                <ol className="space-y-2 text-sm">
                  {[
                    { k: "waiting", label: "Request received" },
                    { k: "dispatched", label: "Ambulance dispatched" },
                    { k: "on_scene", label: "On scene" },
                    { k: "transport", label: "En route to hospital" },
                    { k: "completed", label: "Arrived at hospital" },
                  ].map((step, idx, arr) => {
                    const order = ["waiting", "dispatched", "on_scene", "transport", "completed"];
                    const cur = order.indexOf(myInc.status);
                    const reached = idx <= cur;
                    return (
                      <li key={step.k} className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${reached ? "bg-[oklch(0.78_0.18_155)] shadow-[0_0_8px_oklch(0.78_0.18_155)]" : "bg-white/15"}`}
                        />
                        <span className={reached ? "text-foreground" : "text-foreground/40"}>{step.label}</span>
                        {idx < arr.length - 1 && <span className="ml-auto text-[10px] text-foreground/30">→</span>}
                      </li>
                    );
                  })}
                </ol>
              </div>

              <button
                onClick={() => setMyIncidentId(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-foreground/70 hover:bg-white/10"
              >
                New Request
              </button>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
