import { Cpu, Github, Layers3, RadioTower, Hammer, Upload } from 'lucide-react';
import type { ReactNode } from 'react';

type AppMode = 'builder' | 'upload';

interface AppShellProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  children: ReactNode;
}

export function AppShell({ mode, onModeChange, children }: AppShellProps) {
  return (
    <main className="min-h-screen px-4 py-5 text-slate-100 md:px-6 lg:px-8">
      {/* Header */}
      <header className="mx-auto mb-5 max-w-[1720px] overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
        <div className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-teal-300">MetaNest</p>
            <h1 className="mt-2 bg-gradient-to-r from-white via-teal-100 to-pink-200 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
              AI-Powered 3D House Metaverse
            </h1>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-slate-300">
            <StatusPill icon={<Cpu className="h-4 w-4" />} label="AI Vision" />
            <StatusPill icon={<Layers3 className="h-4 w-4" />} label="3D Engine" />
            <StatusPill icon={<RadioTower className="h-4 w-4" />} label="Realtime" />
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex gap-1 border-t border-white/[0.06] px-5 pt-1">
          <TabButton
            active={mode === 'builder'}
            icon={<Hammer className="h-4 w-4" />}
            label="Builder"
            onClick={() => onModeChange('builder')}
          />
          <TabButton
            active={mode === 'upload'}
            icon={<Upload className="h-4 w-4" />}
            label="Upload & Analyze"
            onClick={() => onModeChange('upload')}
          />
        </nav>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-[1720px]">{children}</div>

      {/* Footer */}
      <footer className="mx-auto mt-8 flex max-w-[1720px] flex-col items-center gap-2 border-t border-white/[0.06] py-6 text-xs text-slate-500 md:flex-row md:justify-between">
        <span>MetaNest v1.0 &mdash; Built with React, Three.js, FastAPI &amp; OpenCV</span>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 transition hover:text-slate-300"
        >
          <Github className="h-3.5 w-3.5" />
          Source on GitHub
        </a>
      </footer>
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

function TabButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-t-md border-b-2 px-4 py-3 text-sm font-medium transition ${
        active
          ? 'border-teal-400 text-white'
          : 'border-transparent text-slate-400 hover:border-white/20 hover:text-slate-200'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
