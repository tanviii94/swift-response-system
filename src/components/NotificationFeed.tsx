import { AnimatePresence, motion } from "framer-motion";
import { useSim } from "@/lib/sim-store";

export function NotificationFeed() {
  const notes = useSim((s) => s.notifications);
  return (
    <div className="glass flex h-full min-h-0 flex-col rounded-2xl p-3">
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="text-xs font-semibold uppercase tracking-wider text-foreground/70">Live Feed</div>
        <span className="h-2 w-2 animate-pulse rounded-full bg-[oklch(0.78_0.18_155)] shadow-[0_0_8px_oklch(0.78_0.18_155)]" />
      </div>
      <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {notes.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-1.5 text-[12px] text-foreground/85"
            >
              {n.text}
              <div className="text-[10px] text-foreground/40">
                {new Date(n.ts).toLocaleTimeString()}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {notes.length === 0 && (
          <div className="px-2 py-4 text-center text-xs text-foreground/40">No events yet</div>
        )}
      </div>
    </div>
  );
}
