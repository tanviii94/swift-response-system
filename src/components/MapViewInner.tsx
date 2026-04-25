import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import { useSim, MAP_CENTER, type Ambulance } from "@/lib/sim-store";

const ambIcon = (status: Ambulance["status"]) => {
  const color =
    status === "available" ? "#22c55e" : status === "dispatched" || status === "transport" ? "#facc15" : "#ef4444";
  return L.divIcon({
    className: "",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    html: `<div style="width:34px;height:34px;border-radius:9999px;background:${color};display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px ${color};border:2px solid #0f172a;font-size:18px;transition:all .8s linear;">🚑</div>`,
  });
};

const hospIcon = L.divIcon({
  className: "",
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  html: `<div style="width:34px;height:34px;border-radius:10px;background:#8b5cf6;display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px #8b5cf6;border:2px solid #0f172a;font-size:18px;">🏥</div>`,
});

const incIcon = L.divIcon({
  className: "incident-marker",
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  html: `<div style="position:relative;z-index:2;width:26px;height:26px;border-radius:9999px;background:#ef4444;border:2px solid #fff;box-shadow:0 0 12px #ef4444;"></div>`,
});

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom(), { duration: 0.6 });
  }, [lat, lng, map]);
  return null;
}

interface Props {
  highlightAmbulanceId?: number;
  showOnlyAmbulanceId?: number;
  followAmbulanceId?: number;
  className?: string;
}

export function MapView({ highlightAmbulanceId, showOnlyAmbulanceId, followAmbulanceId, className }: Props) {
  const ambulances = useSim((s) => s.ambulances);
  const hospitals = useSim((s) => s.hospitals);
  const incidents = useSim((s) => s.incidents);
  const traffic = useSim((s) => s.traffic);

  const visibleAmbs = useMemo(
    () => (showOnlyAmbulanceId ? ambulances.filter((a) => a.id === showOnlyAmbulanceId) : ambulances),
    [ambulances, showOnlyAmbulanceId],
  );

  const followAmb = followAmbulanceId ? ambulances.find((a) => a.id === followAmbulanceId) : undefined;

  return (
    <div className={`relative h-full w-full overflow-hidden rounded-2xl border border-white/10 ${className ?? ""}`}>
      <MapContainer
        center={[MAP_CENTER.lat, MAP_CENTER.lng]}
        zoom={13}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {traffic.map((t) => (
          <Circle
            key={t.id}
            center={[t.lat, t.lng]}
            radius={t.radius * 1000}
            pathOptions={{ color: "#facc15", fillColor: "#facc15", fillOpacity: 0.15 }}
          />
        ))}

        {hospitals.map((h) => (
          <Marker key={h.id} position={[h.lat, h.lng]} icon={hospIcon}>
            <Popup>
              <strong>{h.name}</strong>
              <br />
              Beds: {h.availableBeds}/{h.totalBeds} · ICU: {h.icuBeds}
            </Popup>
          </Marker>
        ))}

        {incidents
          .filter((i) => i.status !== "completed")
          .map((i) => (
            <Marker key={i.id} position={[i.lat, i.lng]} icon={incIcon}>
              <Popup>
                <strong>Incident #{i.id}</strong>
                <br />
                {i.type} · P{i.severity}
                <br />
                Status: {i.status}
              </Popup>
            </Marker>
          ))}

        {visibleAmbs.map((a) => {
          const isHi = a.id === highlightAmbulanceId;
          return (
            <Marker
              key={a.id}
              position={[a.lat, a.lng]}
              icon={ambIcon(a.status)}
              zIndexOffset={isHi ? 1000 : 0}
            >
              <Popup>
                <strong>Ambulance #{a.id}</strong>
                <br />
                Status: {a.status}
              </Popup>
            </Marker>
          );
        })}

        {visibleAmbs
          .filter((a) => a.targetLat != null && a.targetLng != null)
          .map((a) => (
            <Polyline
              key={`route-${a.id}`}
              positions={[
                [a.lat, a.lng],
                [a.targetLat!, a.targetLng!],
              ]}
              pathOptions={{
                color: a.status === "transport" ? "#8b5cf6" : "#38bdf8",
                weight: 3,
                opacity: 0.85,
                dashArray: "8 8",
              }}
            />
          ))}

        {followAmb && <FlyTo lat={followAmb.lat} lng={followAmb.lng} />}
      </MapContainer>

      {/* Legend */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] glass rounded-xl px-3 py-2 text-xs text-foreground/90">
        <div className="mb-1 font-semibold tracking-wide text-foreground/70">LEGEND</div>
        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#22c55e] shadow-[0_0_8px_#22c55e]" /> Available</div>
        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#facc15] shadow-[0_0_8px_#facc15]" /> En-route</div>
        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#ef4444] shadow-[0_0_8px_#ef4444]" /> Busy / Incident</div>
        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded bg-[#8b5cf6] shadow-[0_0_8px_#8b5cf6]" /> Hospital</div>
      </div>
    </div>
  );
}
