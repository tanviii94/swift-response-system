import { create } from "zustand";

export type AmbStatus = "available" | "dispatched" | "on_scene" | "transport" | "completed";
export type IncStatus = "waiting" | "dispatched" | "on_scene" | "transport" | "completed";

export interface Ambulance {
  id: number;
  lat: number;
  lng: number;
  status: AmbStatus;
  speed: number; // base km/h
  targetLat?: number;
  targetLng?: number;
  incidentId?: number;
  hospitalId?: number;
}

export interface Hospital {
  id: number;
  name: string;
  lat: number;
  lng: number;
  totalBeds: number;
  availableBeds: number;
  icuBeds: number;
}

export interface Incident {
  id: number;
  lat: number;
  lng: number;
  severity: 1 | 2 | 3 | 4 | 5;
  type: string;
  status: IncStatus;
  ambulanceId?: number;
  hospitalId?: number;
  createdAt: number;
  completedAt?: number;
}

export interface TrafficZone {
  id: number;
  lat: number;
  lng: number;
  radius: number; // km
}

export interface Notification {
  id: number;
  ts: number;
  kind: "incident" | "assigned" | "hospital" | "traffic" | "complete" | "info";
  text: string;
}

interface SimState {
  ambulances: Ambulance[];
  hospitals: Hospital[];
  incidents: Incident[];
  traffic: TrafficZone[];
  notifications: Notification[];
  tick: number;
  // actions
  addIncident: (lat?: number, lng?: number, type?: string) => Incident;
  addTraffic: () => void;
  reduceBeds: () => void;
  reset: () => void;
  setHospitalBeds: (id: number, total: number, icu: number) => void;
  driverAction: (ambId: number, action: "arrived" | "picked" | "delivered") => void;
  step: () => void;
  pushNote: (n: Omit<Notification, "id" | "ts">) => void;
}

// Center: New Delhi-ish coordinates for a recognizable map
const CENTER = { lat: 28.6139, lng: 77.209 };

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

const initialHospitals = (): Hospital[] => [
  { id: 1, name: "Apollo Central", lat: CENTER.lat + 0.02, lng: CENTER.lng + 0.025, totalBeds: 40, availableBeds: 28, icuBeds: 8 },
  { id: 2, name: "Lifeline North", lat: CENTER.lat + 0.04, lng: CENTER.lng - 0.03, totalBeds: 30, availableBeds: 18, icuBeds: 5 },
  { id: 3, name: "Mediplex East", lat: CENTER.lat - 0.025, lng: CENTER.lng + 0.04, totalBeds: 50, availableBeds: 35, icuBeds: 10 },
  { id: 4, name: "City Care South", lat: CENTER.lat - 0.045, lng: CENTER.lng - 0.02, totalBeds: 25, availableBeds: 12, icuBeds: 4 },
];

const initialAmbulances = (): Ambulance[] =>
  Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    lat: CENTER.lat + rand(-0.05, 0.05),
    lng: CENTER.lng + rand(-0.05, 0.05),
    status: "available" as AmbStatus,
    speed: 60,
  }));

// haversine km
const dist = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};

const inferType = (): { type: string; severity: 1 | 2 | 3 | 4 | 5 } => {
  const pool = [
    { type: "Cardiac arrest", severity: 5 as const },
    { type: "Road accident", severity: 5 as const },
    { type: "Stroke", severity: 4 as const },
    { type: "Severe injury", severity: 4 as const },
    { type: "Fall / fracture", severity: 3 as const },
    { type: "Breathing distress", severity: 4 as const },
    { type: "Burns", severity: 3 as const },
    { type: "Allergic reaction", severity: 2 as const },
  ];
  return pool[Math.floor(Math.random() * pool.length)];
};

let nid = 1;
let iid = 1;
let tid = 1;

export const useSim = create<SimState>((set, get) => ({
  ambulances: initialAmbulances(),
  hospitals: initialHospitals(),
  incidents: [],
  traffic: [],
  notifications: [],
  tick: 0,

  pushNote: (n) =>
    set((s) => ({
      notifications: [{ id: nid++, ts: Date.now(), ...n }, ...s.notifications].slice(0, 60),
    })),

  addIncident: (lat, lng, type) => {
    const meta = type ? { type, severity: 4 as 4 } : inferType();
    const inc: Incident = {
      id: iid++,
      lat: lat ?? CENTER.lat + rand(-0.05, 0.05),
      lng: lng ?? CENTER.lng + rand(-0.05, 0.05),
      severity: meta.severity,
      type: meta.type,
      status: "waiting",
      createdAt: Date.now(),
    };
    set((s) => ({ incidents: [inc, ...s.incidents] }));
    get().pushNote({ kind: "incident", text: `🚨 New incident #${inc.id} — ${inc.type} (P${inc.severity})` });
    // dispatch immediately
    setTimeout(() => dispatchIncident(inc.id), 200);
    return inc;
  },

  addTraffic: () => {
    const z: TrafficZone = {
      id: tid++,
      lat: CENTER.lat + rand(-0.04, 0.04),
      lng: CENTER.lng + rand(-0.04, 0.04),
      radius: 1.2,
    };
    set((s) => ({ traffic: [...s.traffic, z] }));
    get().pushNote({ kind: "traffic", text: `🚦 Traffic zone created near map center` });
  },

  reduceBeds: () => {
    set((s) => ({
      hospitals: s.hospitals.map((h) =>
        h.id === s.hospitals[0].id ? { ...h, availableBeds: Math.max(0, h.availableBeds - 5) } : h,
      ),
    }));
    get().pushNote({ kind: "hospital", text: `🏥 Bed capacity reduced at ${get().hospitals[0].name}` });
  },

  setHospitalBeds: (id, total, icu) =>
    set((s) => ({
      hospitals: s.hospitals.map((h) =>
        h.id === id
          ? { ...h, totalBeds: total, icuBeds: icu, availableBeds: Math.min(h.availableBeds, total) }
          : h,
      ),
    })),

  reset: () => {
    iid = 1;
    tid = 1;
    set({
      ambulances: initialAmbulances(),
      hospitals: initialHospitals(),
      incidents: [],
      traffic: [],
      notifications: [{ id: nid++, ts: Date.now(), kind: "info", text: "🔄 Simulation reset" }],
      tick: 0,
    });
  },

  driverAction: (ambId, action) => {
    const s = get();
    const amb = s.ambulances.find((a) => a.id === ambId);
    if (!amb || amb.incidentId == null) return;
    const inc = s.incidents.find((i) => i.id === amb.incidentId);
    if (!inc) return;

    if (action === "arrived") {
      set((st) => ({
        ambulances: st.ambulances.map((a) => (a.id === ambId ? { ...a, status: "on_scene" } : a)),
        incidents: st.incidents.map((i) => (i.id === inc.id ? { ...i, status: "on_scene" } : i)),
      }));
      get().pushNote({ kind: "info", text: `🚑 Ambulance #${ambId} on scene of incident #${inc.id}` });
    } else if (action === "picked") {
      const hosp = s.hospitals.find((h) => h.id === amb.hospitalId);
      if (!hosp) return;
      set((st) => ({
        ambulances: st.ambulances.map((a) =>
          a.id === ambId ? { ...a, status: "transport", targetLat: hosp.lat, targetLng: hosp.lng } : a,
        ),
        incidents: st.incidents.map((i) => (i.id === inc.id ? { ...i, status: "transport" } : i)),
      }));
      get().pushNote({ kind: "info", text: `🩺 Patient picked up — transporting to ${hosp.name}` });
    } else if (action === "delivered") {
      completeMission(ambId);
    }
  },

  step: () => {
    const s = get();
    const updated = s.ambulances.map((a) => {
      if (a.targetLat == null || a.targetLng == null) return a;
      // traffic slowdown
      const inTraffic = s.traffic.some((t) => dist(a, { lat: t.lat, lng: t.lng }) < t.radius);
      const speedKmh = a.speed * (inTraffic ? 0.5 : 1);
      // step ~ 2s
      const stepKm = (speedKmh / 3600) * 2;
      const d = dist(a, { lat: a.targetLat, lng: a.targetLng });
      if (d < 0.05) {
        // arrived
        if (a.status === "dispatched") {
          // auto-arrive on scene
          set((st) => ({
            ambulances: st.ambulances.map((x) =>
              x.id === a.id ? { ...x, lat: a.targetLat!, lng: a.targetLng!, status: "on_scene" } : x,
            ),
            incidents: st.incidents.map((i) =>
              i.id === a.incidentId ? { ...i, status: "on_scene" } : i,
            ),
          }));
          // auto pickup after 4s
          setTimeout(() => {
            const cur = get().ambulances.find((x) => x.id === a.id);
            if (cur && cur.status === "on_scene") get().driverAction(a.id, "picked");
          }, 4000);
        } else if (a.status === "transport") {
          // delivered
          setTimeout(() => completeMission(a.id), 200);
        }
        return a;
      }
      const ratio = stepKm / d;
      return {
        ...a,
        lat: a.lat + (a.targetLat - a.lat) * ratio,
        lng: a.lng + (a.targetLng - a.lng) * ratio,
      };
    });
    set({ ambulances: updated, tick: s.tick + 1 });
  },
}));

function dispatchIncident(incidentId: number) {
  const s = useSim.getState();
  const inc = s.incidents.find((i) => i.id === incidentId);
  if (!inc || inc.status !== "waiting") return;
  // nearest available ambulance
  const avail = s.ambulances.filter((a) => a.status === "available");
  if (avail.length === 0) {
    s.pushNote({ kind: "info", text: `⚠️ No ambulances available for incident #${inc.id}` });
    return;
  }
  const amb = [...avail].sort((a, b) => dist(a, inc) - dist(b, inc))[0];
  // nearest hospital with bed
  const validH = s.hospitals.filter((h) => h.availableBeds > 0);
  if (validH.length === 0) {
    s.pushNote({ kind: "hospital", text: `🏥 All hospitals full — incident #${inc.id} queued` });
    return;
  }
  const hosp = [...validH].sort((a, b) => dist(a, inc) - dist(b, inc))[0];
  // assign
  useSim.setState({
    ambulances: s.ambulances.map((a) =>
      a.id === amb.id
        ? {
            ...a,
            status: "dispatched",
            targetLat: inc.lat,
            targetLng: inc.lng,
            incidentId: inc.id,
            hospitalId: hosp.id,
          }
        : a,
    ),
    incidents: s.incidents.map((i) =>
      i.id === inc.id ? { ...i, status: "dispatched", ambulanceId: amb.id, hospitalId: hosp.id } : i,
    ),
    hospitals: s.hospitals.map((h) =>
      h.id === hosp.id ? { ...h, availableBeds: h.availableBeds - 1 } : h,
    ),
  });
  s.pushNote({ kind: "assigned", text: `✅ Ambulance #${amb.id} → Incident #${inc.id} (${hosp.name})` });
}

function completeMission(ambId: number) {
  const s = useSim.getState();
  const a = s.ambulances.find((x) => x.id === ambId);
  if (!a) return;
  useSim.setState({
    ambulances: s.ambulances.map((x) =>
      x.id === ambId
        ? {
            ...x,
            status: "available",
            targetLat: undefined,
            targetLng: undefined,
            incidentId: undefined,
            hospitalId: undefined,
          }
        : x,
    ),
    incidents: s.incidents.map((i) =>
      i.id === a.incidentId ? { ...i, status: "completed", completedAt: Date.now() } : i,
    ),
    hospitals: s.hospitals.map((h) =>
      h.id === a.hospitalId ? { ...h, availableBeds: Math.min(h.totalBeds, h.availableBeds + 1) } : h,
    ),
  });
  s.pushNote({ kind: "complete", text: `🏁 Ambulance #${ambId} completed mission` });
}

// Singleton ticker — start once on module load (client only)
if (typeof window !== "undefined") {
  // @ts-expect-error attach guard
  if (!window.__simStarted) {
    // @ts-expect-error attach guard
    window.__simStarted = true;
    setInterval(() => useSim.getState().step(), 2000);
    // seed an initial incident so the demo is alive
    setTimeout(() => useSim.getState().addIncident(), 1500);
  }
}

export const MAP_CENTER = CENTER;
export const distanceKm = dist;
