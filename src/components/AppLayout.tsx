import { Sidebar } from "@/components/Sidebar";

export function AppLayout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-3 backdrop-blur-lg">
          <div>
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            {subtitle && <p className="text-xs text-foreground/60">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-foreground/70">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[oklch(0.78_0.18_155)] shadow-[0_0_8px_oklch(0.78_0.18_155)]" />
            Live simulation
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-hidden p-4">{children}</main>
      </div>
    </div>
  );
}
