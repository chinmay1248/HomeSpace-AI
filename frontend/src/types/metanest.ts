export type Point2D = [number, number];

export interface Wall {
  start: Point2D;
  end: Point2D;
  thickness: number;
  confidence: number;
}

export interface Room {
  id: string;
  label: string;
  polygon: Point2D[];
  area: number;
  confidence: number;
}

export interface Opening {
  id: string;
  type: 'door' | 'window' | 'bed' | 'toilet' | 'sink' | 'stove' | 'dining_table';
  center: Point2D;
  width: number;
  wall_index?: number | null;
  confidence: number;
}

export interface TextLabel {
  text: string;
  bbox: Point2D[];
  confidence: number;
}

export interface LayoutAnalysis {
  units: string;
  source_size: [number, number];
  scale: number;
  walls: Wall[];
  rooms: Room[];
  doors: Opening[];
  windows: Opening[];
  text_labels?: TextLabel[];
  metadata: Record<string, unknown>;
}

export interface MaterialSettings {
  wall_color: string;
  floor_texture: 'wood' | 'marble' | 'tiles' | 'concrete' | 'paint';
  ceiling_color: string;
  theme: string;
  sunlight: boolean;
}

export type ViewMode = 'orbit' | 'first-person' | 'top';

export interface TexturePreset {
  id: MaterialSettings['floor_texture'];
  label: string;
  category: 'floor' | 'wall' | 'ceiling';
  color: string;
  roughness: number;
  metalness: number;
  description: string;
}

export interface ScenePayload {
  version: string;
  units: string;
  bounds: {
    min: Point2D;
    max: Point2D;
    center: Point2D;
  };
  wallHeight: number;
  wallThickness: number;
  walls: Wall[];
  rooms: Room[];
  doors: Opening[];
  windows: Opening[];
  text_labels?: TextLabel[];
  materials: MaterialSettings;
  features: Record<string, boolean>;
}

export interface Project {
  id: string;
  name: string;
  status: 'uploaded' | 'analyzed' | 'generated' | 'failed';
  filename: string;
  content_type: string;
  file_path: string;
  preview_url?: string | null;
  layout?: LayoutAnalysis | null;
  scene?: ScenePayload | null;
  materials: MaterialSettings;
  error?: string | null;
  created_at: string;
  updated_at: string;
}
