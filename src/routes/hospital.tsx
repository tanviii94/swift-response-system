import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useSim } from "@/lib/sim-store";

export const Route = createFileRoute("/hospital")({
  head: () => ({
    meta: [
      { title: "Hospital Dashboard — AI Emergency Response" },
      { name: "description", content: "Hospital incoming patients and bed capacity management." },
    ],
  }),
  component: HospitalPage,
});

function HospitalPage() {
  const hospitals = useSim((s) => s.hospitals);
  const incidents = useSim((s) => s.incidents);
  const setHospitalBeds = useSim((s) => s.setHospitalBeds);

  return (
    <AppLayout title="Hospital Dashboard" subtitle="Capacity & incoming patients">
      <div className="grid h-full grid-cols-1 gap-3 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-3">
        {hospitals.map((h) => {
          const incoming = incidents.filter(
            (i) => i.hospitalId === h.id && i.status !== "completed",
          );
          const ratio = h.availableBeds / Math.max(1, h.totalBeds);
          const status =
            ratio > 0.4 ? { label: "Available", c: "oklch(0.78 0.18 155)" } :
            ratio > 0.1 ? { label: "Busy", c: "oklch(0.85 0.17 90)" } :
            { label: "Full", c: "oklch(0.7 0.24 25)" };
          return (
            <div key={h.id} className="glass rounded-2xl p-4 transition-all duration-300 hover:shadow-[0_0_20px_oklch(0.65_0.22_295_/_0.4)]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-semibold text-foreground">{h.name}</div>
                  <div className="text-[11px] text-foreground/60">ID #{h.id}</div>
                </div>
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: `color-mix(in oklab, ${status.c} 25%, transparent)`, color: status.c }}
                >
                  {status.label}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-white/5 p-2">
                  <div className="text-lg font-bold">{h.availableBeds}</div>
                  <div className="text-[10px] uppercase text-foreground/60">Free</div>
                </div>
                <div className="rounded-lg bg-white/5 p-2">
                  <div className="text-lg font-bold">{h.totalBeds}</div>
                  <div className="text-[10px] uppercase text-foreground/60">Total</div>
                </div>
                <div className="rounded-lg bg-white/5 p-2">
                  <div className="text-lg font-bold">{h.icuBeds}</div>
                  <div className="text-[10px] uppercase text-foreground/60">ICU</div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <div className="mb-1 flex justify-between text-[11px] text-foreground/70">
                    <span>Total beds</span><span>{h.totalBeds}</span>
                  </div>
                  <input
                    type="range" min={10} max={80} value={h.totalBeds}
                    onChange={(e) => setHospitalBeds(h.id, Number(e.target.value), h.icuBeds)}
                    className="w-full accent-[oklch(0.78_0.15_230)]"
                  />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-[11px] text-foreground/70">
                    <span>ICU beds</span><span>{h.icuBeds}</span>
                  </div>
                  <input
                    type="range" min={0} max={20} value={h.icuBeds}
                    onChange={(e) => setHospitalBeds(h.id, h.totalBeds, Number(e.target.value))}
                    className="w-full accent-[oklch(0.65_0.22_295)]"
                  />
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-foreground/70">
                  Incoming · {incoming.length}
                </div>
                <div className="space-y-1">
                  {incoming.length === 0 && (
                    <div className="rounded-lg bg-white/5 px-2 py-2 text-center text-[11px] text-foreground/40">No incoming patients</div>
                  )}
                  {incoming.map((i) => (
                    <div key={i.id} className="flex items-center justify-between rounded-lg bg-white/5 px-2.5 py-1.5 text-[12px]">
                      <span>#{i.id} · {i.type}</span>
                      <span className="text-[10px] uppercase text-foreground/60">{i.status.replace("_", " ")}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
