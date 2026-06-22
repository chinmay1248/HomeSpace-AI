import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { FloorPlanEditor } from './components/editor/FloorPlanEditor';
import { HouseViewer } from './components/viewer/HouseViewer';
import { UploadDropzone } from './components/upload/UploadDropzone';
import { ProjectSidebar } from './components/layout/ProjectSidebar';
import { useMetaNestStore } from './store/useMetaNestStore';
import { useBuilderStore } from './store/useBuilderStore';
import { api } from './services/api';
import { demoScene } from './utils/demoLayout';
import type { MaterialSettings, Project } from './types/metanest';

type AppMode = 'builder' | 'upload';

export default function App() {
  const [mode, setMode] = useState<AppMode>('builder');

  const materials = useMetaNestStore((s) => s.materials);
  const viewMode = useMetaNestStore((s) => s.viewMode);
  const setViewMode = useMetaNestStore((s) => s.setViewMode);
  const setMaterials = useMetaNestStore((s) => s.setMaterials);
  const projects = useMetaNestStore((s) => s.projects);
  const setProjects = useMetaNestStore((s) => s.setProjects);
  const activeProject = useMetaNestStore((s) => s.activeProject);
  const setActiveProject = useMetaNestStore((s) => s.setActiveProject);
  const upsertProject = useMetaNestStore((s) => s.upsertProject);
  const texturePresets = useMetaNestStore((s) => s.texturePresets);
  const setTexturePresets = useMetaNestStore((s) => s.setTexturePresets);
  const progress = useMetaNestStore((s) => s.progress);
  const setProgress = useMetaNestStore((s) => s.setProgress);
  const busy = useMetaNestStore((s) => s.busy);
  const setBusy = useMetaNestStore((s) => s.setBusy);
  const setStage = useMetaNestStore((s) => s.setStage);
  const setError = useMetaNestStore((s) => s.setError);

  // Builder store for real-time scene
  const builderState = useBuilderStore();

  const builderScene = useMemo(() => {
    return { ...builderState.getScenePayload(), materials };
  }, [builderState, materials]);

  // Determine which scene to show in the viewer
  const activeScene = useMemo(() => {
    if (mode === 'builder') return builderScene;
    if (activeProject?.scene) return { ...activeProject.scene, materials };
    return { ...demoScene, materials };
  }, [mode, builderScene, activeProject, materials]);

  // Fetch initial data
  useEffect(() => {
    api.listTextures().then(setTexturePresets).catch(() => undefined);
    api.listProjects().then(setProjects).catch(() => undefined);
  }, [setTexturePresets, setProjects]);

  // Upload → Analyze → Generate pipeline
  const handleUpload = useCallback(async (file: File) => {
    setBusy(true);
    setError(null);
    setStage('Uploading floor plan…');
    setProgress(10);
    try {
      const uploaded = await api.upload(file, (p) => setProgress(Math.min(p * 0.3, 30)));
      upsertProject(uploaded);
      setActiveProject(uploaded);
      setProgress(35);

      setStage('Analyzing layout with AI…');
      const analyzed = await api.analyze(uploaded.id);
      upsertProject(analyzed);
      setActiveProject(analyzed);
      setProgress(65);

      setStage('Generating 3D scene…');
      const generated = await api.generate3d(analyzed.id);
      upsertProject(generated);
      setActiveProject(generated);
      setProgress(100);
      setStage('Complete');
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }, [setBusy, setError, setStage, setProgress, upsertProject, setActiveProject]);

  const handleSelectProject = useCallback((project: Project) => {
    setActiveProject(project);
  }, [setActiveProject]);

  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify(activeScene, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `metanest-scene.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [activeScene]);

  return (
    <AppShell mode={mode} onModeChange={setMode}>
      {mode === 'builder' ? (
        /* ── Builder Mode: 2D Editor + 3D Viewer side-by-side ── */
        <div className="grid gap-5 xl:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <div>
                <h2 className="text-xl font-semibold text-white">2D Plan Editor</h2>
                <p className="text-sm text-slate-400">Draw walls, place doors, windows &amp; furniture</p>
              </div>
              <button
                onClick={handleExport}
                className="rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-sm transition hover:bg-white/10"
              >
                Export JSON
              </button>
            </div>
            <div className="h-[740px]">
              <FloorPlanEditor />
            </div>
          </div>

          <div className="h-[800px]">
            <HouseViewer
              scene={activeScene}
              viewMode={viewMode}
              materials={materials}
              onViewModeChange={setViewMode}
            />
          </div>
        </div>
      ) : (
        /* ── Upload Mode: Upload + Sidebar + 3D Viewer ── */
        <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
          <div className="space-y-5">
            <UploadDropzone onUpload={handleUpload} progress={progress} busy={busy} />
            <ProjectSidebar
              projects={projects}
              activeProject={activeProject}
              materials={materials}
              texturePresets={texturePresets}
              onSelectProject={handleSelectProject}
              onMaterialsChange={setMaterials}
              onExport={handleExport}
            />
          </div>

          <div className="min-h-[680px]">
            <HouseViewer
              scene={activeScene}
              viewMode={viewMode}
              materials={materials}
              onViewModeChange={setViewMode}
            />
          </div>
        </div>
      )}
    </AppShell>
  );
}
