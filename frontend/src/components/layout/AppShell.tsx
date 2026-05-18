import { Cpu, Layers3, RadioTower } from 'lucide-react';
import type { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="min-h-screen px-4 py-5 text-slate-100 md:px-6 lg:px-8">
      <header className="mx-auto mb-5 flex max-w-[1720px] flex-col gap-4 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-teal-200">MetaNest</p>
          <h1 className="mt-2 text-3xl font-semibold text-white md:text-4xl">AI-Powered 3D House Metaverse Generator</h1>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs text-slate-300">
          <StatusPill icon={<Cpu className="h-4 w-4" />} label="AI Vision" />
          <StatusPill icon={<Layers3 className="h-4 w-4" />} label="3D Engine" />
          <StatusPill icon={<RadioTower className="h-4 w-4" />} label="Realtime" />
        </div>
      </header>
      <div className="mx-auto grid max-w-[1720px] gap-5 xl:grid-cols-[430px_minmax(0,1fr)]">{children}</div>
    </main>
  );
}

function StatusPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="flex min-h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3">
      {icon}
      {label}
    </span>
  );
}

