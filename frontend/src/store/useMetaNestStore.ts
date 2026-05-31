import { create } from 'zustand';
import type { MaterialSettings, Project, TexturePreset, ViewMode } from '../types/metanest';

const defaultMaterials: MaterialSettings = {
  wall_color: '#E8F3FF',
  floor_texture: 'wood',
  ceiling_color: '#F8FBFF',
  theme: 'aurora',
  sunlight: true,
};

interface MetaNestState {
  projects: Project[];
  activeProject: Project | null;
  materials: MaterialSettings;
  texturePresets: TexturePreset[];
  viewMode: ViewMode;
  progress: number;
  stage: string;
  busy: boolean;
  error: string | null;
  setProjects: (projects: Project[]) => void;
  upsertProject: (project: Project) => void;
  setActiveProject: (project: Project | null) => void;
  setMaterials: (materials: MaterialSettings) => void;
  setTexturePresets: (texturePresets: TexturePreset[]) => void;
  setViewMode: (viewMode: ViewMode) => void;
  setProgress: (progress: number) => void;
  setStage: (stage: string) => void;
  setBusy: (busy: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMetaNestStore = create<MetaNestState>((set) => ({
  projects: [],
  activeProject: null,
  materials: defaultMaterials,
  texturePresets: [],
  viewMode: 'orbit',
  progress: 0,
  stage: 'Ready',
  busy: false,
  error: null,
  setProjects: (projects) => set({ projects }),
  upsertProject: (project) =>
    set((state) => ({
      projects: [project, ...state.projects.filter((item) => item.id !== project.id)],
    })),
  setActiveProject: (activeProject) => set({ activeProject }),
  setMaterials: (materials) => set({ materials }),
  setTexturePresets: (texturePresets) => set({ texturePresets }),
  setViewMode: (viewMode) => set({ viewMode }),
  setProgress: (progress) => set({ progress }),
  setStage: (stage) => set({ stage }),
  setBusy: (busy) => set({ busy }),
  setError: (error) => set({ error }),
}));

export { defaultMaterials };
