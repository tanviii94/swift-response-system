import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { MapView } from "@/components/MapView";
import { useSim, distanceKm } from "@/lib/sim-store";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/driver")({
  head: () => ({
    meta: [
      { title: "Driver Dashboard — AI Emergency Response" },
      { name: "description", content: "Ambulance driver mission control with live route and status." },
    ],
  }),
  component: DriverPage,
});

function DriverPage() {
  const ambulances = useSim((s) => s.ambulances);
  const incidents = useSim((s) => s.incidents);
  const hospitals = useSim((s) => s.hospitals);
  const traffic = useSim((s) => s.traffic);
  const driverAction = useSim((s) => s.driverAction);

  // Pick first busy ambulance, fallback to #1
  const activeAmb =
    ambulances.find((a) => a.status !== "available" && a.status !== "completed") ?? ambulances[0];
  const [selectedId, setSelectedId] = useState<number>(activeAmb?.id ?? 1);
  useEffect(() => {
    if (activeAmb && activeAmb.status !== "available") setSelectedId(activeAmb.id);
  }, [activeAmb?.id, activeAmb?.status]);

  const amb = ambulances.find((a) => a.id === selectedId)!;
  const inc = incidents.find((i) => i.id === amb?.incidentId);
  const hosp = hospitals.find((h) => h.id === amb?.hospitalId);

  const eta = useMemo(() => {
    if (!amb || amb.targetLat == null || amb.targetLng == null) return "—";
    const km = distanceKm(amb, { lat: amb.targetLat, lng: amb.targetLng });
    const inT = traffic.some((t) => distanceKm(amb, { lat: t.lat, lng: t.lng }) < t.radius);
    const sec = Math.max(0, Math.round((km / (amb.speed * (inT ? 0.5 : 1))) * 3600));
    return sec > 60 ? `${Math.floor(sec / 60)}m ${sec % 60}s` : `${sec}s`;
  }, [amb, traffic]);

  const inTraffic = amb && traffic.some((t) => distanceKm(amb, { lat: t.lat, lng: t.lng }) < t.radius);

  return (
    <AppLayout title="Driver Dashboard" subtitle={`Ambulance #${amb?.id ?? "—"}`}>
      <div className="grid h-full grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-8 min-h-[320px]">
          <MapView followAmbulanceId={amb?.id} highlightAmbulanceId={amb?.id} />
        </div>
        <div className="col-span-12 flex flex-col gap-3 lg:col-span-4">
          <div className="glass rounded-2xl p-4">
            <div className="text-[11px] uppercase tracking-wider text-foreground/60">Select Unit</div>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
            >
              {ambulances.map((a) => (
                <option key={a.id} value={a.id} className="bg-[oklch(0.18_0.04_265)]">
                  Ambulance #{a.id} — {a.status}
                </option>
              ))}
            </select>
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground/70">
              Current Mission
            </div>
            {inc ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-foreground/60">Incident</span><span>#{inc.id} · {inc.type}</span></div>
                <div className="flex justify-between"><span className="text-foreground/60">Severity</span><span>P{inc.severity}</span></div>
                <div className="flex justify-between"><span className="text-foreground/60">Destination</span><span className="text-right">{amb.status === "transport" && hosp ? hosp.name : "Incident scene"}</span></div>
                <div className="flex justify-between"><span className="text-foreground/60">ETA</span><span className="font-bold text-[oklch(0.85_0.15_230)]">{eta}</span></div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Traffic</span>
                  <span className={inTraffic ? "text-[oklch(0.85_0.17_90)]" : "text-[oklch(0.78_0.18_155)]"}>
                    {inTraffic ? "Heavy (50% slow)" : "Clear"}
                  </span>
                </div>
                <div className="flex justify-between"><span className="text-foreground/60">Status</span><span className="uppercase">{amb.status}</span></div>
              </div>
            ) : (
              <div className="py-6 text-center text-sm text-foreground/50">
                No active mission. Standing by.
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              disabled={!inc || amb.status !== "dispatched"}
              onClick={() => driverAction(amb.id, "arrived")}
              className="rounded-xl border border-[oklch(0.85_0.17_90_/_0.4)] bg-white/5 px-4 py-3 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_20px_oklch(0.85_0.17_90_/_0.5)] disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              ✅ Arrived on Scene
            </button>
            <button
              disabled={!inc || amb.status !== "on_scene"}
              onClick={() => driverAction(amb.id, "picked")}
              className="rounded-xl border border-[oklch(0.65_0.22_295_/_0.4)] bg-white/5 px-4 py-3 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_20px_oklch(0.65_0.22_295_/_0.5)] disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              🩺 Patient Picked Up
            </button>
            <button
              disabled={!inc || amb.status !== "transport"}
              onClick={() => driverAction(amb.id, "delivered")}
              className="rounded-xl border border-[oklch(0.78_0.18_155_/_0.4)] bg-white/5 px-4 py-3 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_20px_oklch(0.78_0.18_155_/_0.5)] disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              🏥 Delivered to Hospital
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
