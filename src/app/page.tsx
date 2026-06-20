import Link from 'next/link';
import { ArrowRight, ShieldCheck, GitBranch, Scale, Radio } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

const FEATURES = [
  {
    icon: GitBranch,
    title: 'Stress-tested playbooks',
    body: 'Every response plan is pressure-tested against re-routing before it is ever shown to an operator.',
  },
  {
    icon: Scale,
    title: 'Judged before dispatch',
    body: 'An AI judging panel scores each plan on Safety, Feasibility and Clarity — and locks dispatch until it passes.',
  },
  {
    icon: Radio,
    title: 'Live operations',
    body: 'Real corridor congestion, marshal availability and signal recommendations from the city demand model.',
  },
];

export default function Landing() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-olive-50 via-background to-background">
      <header className="flex items-center gap-3 px-6 md:px-10 py-5">
        <BrandLogo size={40} />
        <div>
          <div className="text-sm font-bold tracking-wide text-foreground">BENGALURU TRAFFIC MANAGEMENT CENTER</div>
          <div className="text-[11px] text-text-subtle font-medium">City Operations Platform</div>
        </div>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 md:py-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-olive-200 bg-olive-50 px-3 py-1 text-[11px] font-bold tracking-wider text-olive-700 mb-6">
          <ShieldCheck className="w-3.5 h-3.5" /> HONEST AI FOR CITY TRAFFIC COMMAND
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground max-w-3xl">
          BlockBuster
        </h1>
        <p className="mt-4 text-base md:text-lg text-text-muted max-w-2xl">
          Detect, simulate and resolve traffic disruptions in real time — with response
          playbooks that are stress-tested and judged before a single unit is dispatched.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard/overview"
            className="inline-flex items-center gap-2 rounded-lg bg-[#2D2D2D] px-6 h-12 text-sm font-bold text-white hover:bg-[#1a1a1a] transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Enter Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard/live-traffic"
            className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-card-bg px-6 h-12 text-sm font-bold text-foreground hover:bg-surface-muted transition-colors"
          >
            Open Disaster Lab
          </Link>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3 max-w-4xl w-full">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-border-light bg-card-bg p-5 text-left shadow-card">
              <div className="w-9 h-9 rounded-lg bg-olive-50 text-olive-700 flex items-center justify-center mb-3">
                <f.icon className="w-5 h-5" />
              </div>
              <div className="text-sm font-bold text-foreground">{f.title}</div>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-6 md:px-10 py-5 text-center text-[11px] text-text-subtle border-t border-border-light">
        Demo system · traffic data from the ASTraM demand model · incidents &amp; events are simulated for demonstration.
      </footer>
    </main>
  );
}
