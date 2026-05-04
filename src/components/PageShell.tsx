import { motion } from "framer-motion";
import { NavBar } from "./NavBar";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-8 pb-28 md:pb-12"
      >
        {children}
      </motion.main>
      <footer className="hidden md:block border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        Built with care · CaloSmart © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
