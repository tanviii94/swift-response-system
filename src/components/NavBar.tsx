import { Link, useLocation } from "@tanstack/react-router";
import { Salad, Home, Search, ListChecks, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/predict", label: "Predict", icon: Search },
  { to: "/tracker", label: "Tracker", icon: ListChecks },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function NavBar() {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-xl gradient-bg-primary grid place-items-center shadow-md group-hover:scale-105 transition-transform">
            <Salad className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            Calo<span className="gradient-text">Smart</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <Link
          to="/predict"
          className="hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white gradient-bg-primary shadow-md hover-lift"
        >
          <Search className="h-4 w-4" /> Predict
        </Link>
      </div>
      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-3 left-3 right-3 z-50 card-soft px-2 py-2 flex items-center justify-around">
        {links.map((l) => {
          const Icon = l.icon;
          const active = pathname === l.to;
          return (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[11px] font-medium",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
