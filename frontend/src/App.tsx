import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BrainCircuit, CheckCircle2, Loader2 } from 'lucide-react';
import { AppShell } from './components/layout/AppShell';
import { ProjectSidebar } from './components/layout/ProjectSidebar';
import { UploadDropzone } from './components/upload/UploadDropzone';
import { HouseViewer, type ViewMode } from './components/viewer/HouseViewer';
import { api } from './services/api';
import type { MaterialSettings, Project } from './types/metanest';
import { demoScene } from './utils/demoLayout';

const defaultMaterials: MaterialSettings = {
  wall_color: '#E8F3FF',
  floor_texture: 'wood',
  ceiling_color: '#F8FBFF',
  theme: 'aurora',
  sunlight: true,
};

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [materials, setMaterials] = useState<MaterialSettings>(defaultMaterials);
  const [viewMode, setViewMode] = useState<ViewMode>('orbit');
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Ready');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeScene = useMemo(() => {
    if (activeProject?.scene) {
      return { ...activeProject.scene, materials };
    }
    return { ...demoScene, materials };
  }, [activeProject?.scene, materials]);

  useEffect(() => {
    api
      .listProjects()
      .then((items) => {
        setProjects(items);
        if (items[0]) {
          setActiveProject(items[0]);
          setMaterials(items[0].materials);
        }
      })
      .catch(() => {
        setStage('Offline demo mode');
      });
  }, []);

  async function handleUpload(file: File) {
    setBusy(true);
    setError(null);
    setProgress(8);
    setStage('Uploading source plan');
    try {
      const uploaded = await api.upload(file, (nextProgress) => setProgress(Math.min(nextProgress, 35)));
      setProjects((items) => [uploaded, ...items.filter((item) => item.id !== uploaded.id)]);
      setActiveProject(uploaded);

      setStage('Running OpenCV analysis');
      setProgress(48);
      const analyzed = await api.analyze(uploaded.id);
      setProjects((items) => [analyzed, ...items.filter((item) => item.id !== analyzed.id)]);
      setActiveProject(analyzed);

      setStage('Generating 3D metaverse');
      setProgress(76);
      const generated = await api.generate3d(analyzed.id);
      setProjects((items) => [generated, ...items.filter((item) => item.id !== generated.id)]);
      setActiveProject(generated);
      setMaterials(generated.materials);
      setProgress(100);
      setStage('Generated');
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Unable to process the floor plan.');
      setStage('Needs attention');
    } finally {
      window.setTimeout(() => {
        setBusy(false);
        setProgress(0);
      }, 700);
    }
  }

  async function handleMaterialsChange(nextMaterials: MaterialSettings) {
    setMaterials(nextMaterials);
    if (!activeProject) return;
    try {
      const updated = await api.updateMaterials(activeProject.id, nextMaterials);
      setActiveProject(updated);
      setProjects((items) => [updated, ...items.filter((item) => item.id !== updated.id)]);
    } catch {
      setStage('Materials changed locally');
    }
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(activeScene, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${activeProject?.name ?? 'metanest-scene'}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell>
      <div className="space-y-5">
        <UploadDropzone onUpload={handleUpload} progress={progress} busy={busy} />

        <section className="glass rounded-lg p-4">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <BrainCircuit className="h-5 w-5 text-teal-200" aria-hidden />
            AI Pipeline
          </h2>
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <Metric label="Walls" value={activeScene.walls.length.toString()} />
            <Metric label="Rooms" value={activeScene.rooms.length.toString()} />
            <Metric label="Openings" value={(activeScene.doors.length + activeScene.windows.length).toString()} />
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-200">
            {busy ? <Loader2 className="h-4 w-4 animate-spin text-teal-200" aria-hidden /> : <CheckCircle2 className="h-4 w-4 text-mint" aria-hidden />}
            {stage}
          </div>
          {error ? (
            <div className="mt-3 flex items-start gap-2 rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
              <AlertTriangle className="mt-0.5 h-4 w-4" aria-hidden />
              {error}
            </div>
          ) : null}
        </section>

        <ProjectSidebar
          projects={projects}
          activeProject={activeProject}
          materials={materials}
          onSelectProject={(project) => {
            setActiveProject(project);
            setMaterials(project.materials);
          }}
          onMaterialsChange={(nextMaterials) => void handleMaterialsChange(nextMaterials)}
          onExport={handleExport}
        />
      </div>

      <HouseViewer scene={activeScene} viewMode={viewMode} materials={materials} onViewModeChange={setViewMode} />
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

