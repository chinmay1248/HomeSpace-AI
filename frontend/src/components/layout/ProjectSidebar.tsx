import { Building2, CheckCircle2, Clock3, Database, Download, Palette, Sparkles } from 'lucide-react';
import type { MaterialSettings, Project, TexturePreset } from '../../types/metanest';

interface ProjectSidebarProps {
  projects: Project[];
  activeProject: Project | null;
  materials: MaterialSettings;
  texturePresets: TexturePreset[];
  onSelectProject: (project: Project) => void;
  onMaterialsChange: (materials: MaterialSettings) => void;
  onExport: () => void;
}

const fallbackTextures: TexturePreset[] = [
  { id: 'wood', label: 'Warm Oak', category: 'floor', color: '#A8763E', roughness: 0.46, metalness: 0.02, description: 'Warm wood floor preset.' },
  { id: 'marble', label: 'White Marble', category: 'floor', color: '#E7EDF4', roughness: 0.28, metalness: 0.02, description: 'Bright marble-like floor preset.' },
  { id: 'tiles', label: 'Ceramic Tile', category: 'floor', color: '#9AB8C2', roughness: 0.38, metalness: 0.02, description: 'Cool tile preset.' },
  { id: 'concrete', label: 'Soft Concrete', category: 'floor', color: '#737B82', roughness: 0.72, metalness: 0.02, description: 'Neutral concrete preset.' },
  { id: 'paint', label: 'Matte Paint', category: 'floor', color: '#C7F9CC', roughness: 0.84, metalness: 0.02, description: 'Soft matte painted surface.' },
];
const wallColors = ['#E8F3FF', '#F5D0FE', '#D9F99D', '#FDE68A', '#CBD5E1', '#FED7AA'];

export function ProjectSidebar({
  projects,
  activeProject,
  materials,
  texturePresets,
  onSelectProject,
  onMaterialsChange,
  onExport,
}: ProjectSidebarProps) {
  const floorTextures = (texturePresets.length ? texturePresets : fallbackTextures).filter((texture) => texture.category === 'floor');

  return (
    <aside className="space-y-5">
      <section className="glass rounded-lg p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Database className="h-5 w-5 text-teal-200" aria-hidden />
            Projects
          </h2>
          <span className="text-xs text-slate-400">{projects.length} saved</span>
        </div>
        <div className="no-scrollbar max-h-64 space-y-2 overflow-y-auto">
          {projects.length === 0 ? (
            <p className="rounded-md border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300">Upload a plan to create the first metaverse project.</p>
          ) : (
            projects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => onSelectProject(project)}
                className={`w-full rounded-md border p-3 text-left transition ${
                  activeProject?.id === project.id
                    ? 'border-teal-300/60 bg-teal-300/10'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/24'
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 font-medium text-white">
                    <Building2 className="h-4 w-4 text-ember" aria-hidden />
                    {project.name}
                  </span>
                  <Status status={project.status} />
                </span>
                <span className="mt-2 block text-xs text-slate-400">{project.filename}</span>
              </button>
            ))
          )}
        </div>
      </section>

      <section className="glass rounded-lg p-4">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <Palette className="h-5 w-5 text-pulse" aria-hidden />
          Materials
        </h2>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm text-slate-300">Wall Color</p>
            <div className="grid grid-cols-6 gap-2">
              {wallColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  title={color}
                  aria-label={`Set wall color ${color}`}
                  onClick={() => onMaterialsChange({ ...materials, wall_color: color })}
                  className={`h-9 rounded-md border ${materials.wall_color === color ? 'border-white' : 'border-white/20'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Floor Texture</span>
            <select
              value={materials.floor_texture}
              onChange={(event) => onMaterialsChange({ ...materials, floor_texture: event.target.value as MaterialSettings['floor_texture'] })}
              className="w-full rounded-md border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none focus:border-teal-300"
            >
              {floorTextures.map((texture) => (
                <option key={texture.id} value={texture.id}>
                  {texture.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-200">
            Sunlight Simulation
            <input
              type="checkbox"
              checked={materials.sunlight}
              onChange={(event) => onMaterialsChange({ ...materials, sunlight: event.target.checked })}
              className="h-4 w-4 accent-teal-300"
            />
          </label>

          <button
            type="button"
            onClick={onExport}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-teal-300/30 bg-teal-300/10 px-3 py-2 text-sm font-medium text-teal-50 transition hover:bg-teal-300/16"
          >
            <Download className="h-4 w-4" aria-hidden />
            Export Scene JSON
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-ember/30 bg-ember/10 p-4">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-100">
          <Sparkles className="h-4 w-4" aria-hidden />
          Future-ready Modules
        </h2>
        <p className="text-sm leading-6 text-amber-50/80">The architecture leaves room for VR sessions, multiplayer presence, AI interiors, voice commands, and collaborative editing.</p>
      </section>
    </aside>
  );
}

function Status({ status }: { status: Project['status'] }) {
  const isDone = status === 'generated';
  return (
    <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] ${isDone ? 'bg-mint/15 text-mint' : 'bg-white/10 text-slate-300'}`}>
      {isDone ? <CheckCircle2 className="h-3 w-3" aria-hidden /> : <Clock3 className="h-3 w-3" aria-hidden />}
      {status}
    </span>
  );
}
