import { lazy, Suspense, useEffect, useState } from "react";

const MapViewInner = lazy(() =>
  import("./MapViewInner").then((m) => ({ default: m.MapView })),
);

interface Props {
  highlightAmbulanceId?: number;
  showOnlyAmbulanceId?: number;
  followAmbulanceId?: number;
  className?: string;
}

export function MapView(props: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className={`flex h-full w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] ${props.className ?? ""}`}>
        <div className="text-xs text-foreground/50">Loading map…</div>
      </div>
    );
  }
  return (
    <Suspense
      fallback={
        <div className={`flex h-full w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] ${props.className ?? ""}`}>
          <div className="text-xs text-foreground/50">Loading map…</div>
        </div>
      }
    >
      <MapViewInner {...props} />
    </Suspense>
  );
}
