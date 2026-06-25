import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "./index";

export const Route = createFileRoute("/settings")({ component: Settings });

function Settings() {
  return (
    <div className="space-y-5">
      <PageHeader title="Settings" subtitle="System configuration · access control · data sources" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Section title="OPERATOR PROFILE">
          <Row k="Operator" v="Cmdr. A. Sharma" />
          <Row k="Clearance" v="LEVEL 4 · NATIONAL SECURITY" />
          <Row k="Station" v="New Delhi · Command HQ" />
        </Section>
        <Section title="DATA SOURCES">
          <Row k="OSINT Feed" v="Connected · 142 sources" />
          <Row k="Maritime AIS" v="Connected" />
          <Row k="Market Data" v="Bloomberg + Platts" />
          <Row k="SIGINT" v="Restricted" />
        </Section>
        <Section title="ALERTING">
          <Row k="Threshold" v="Score < 50 → Critical" />
          <Row k="Channels" v="SMS · Secure Email · Pager" />
        </Section>
        <Section title="INTERFACE">
          <Row k="Theme" v="Command Dark (default)" />
          <Row k="Density" v="Comfortable" />
          <Row k="Map Style" v="NATO Geo-Intel" />
        </Section>
      </div>
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="panel p-5"><div className="text-xs tracking-widest text-cyan-300 mb-3">{title}</div><div className="space-y-2">{children}</div></div>;
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex items-center justify-between text-sm border-b border-white/5 py-2"><span className="text-white/60">{k}</span><span className="text-white font-medium">{v}</span></div>;
}
