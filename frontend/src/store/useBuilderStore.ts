import { create } from 'zustand';
import type { Opening, Point2D, Room, ScenePayload, Wall } from '../types/metanest';
import { demoScene } from '../utils/demoLayout';

interface BuilderState {
  bounds: { min: Point2D; max: Point2D; center: Point2D };
  walls: Wall[];
  rooms: Room[];
  doors: Opening[];
  windows: Opening[];
  furniture: Opening[];
  mode: 'select' | 'wall' | 'door' | 'window' | 'furniture';
  
  // Actions
  setBounds: (width: number, height: number) => void;
  setMode: (mode: BuilderState['mode']) => void;
  addWall: (start: Point2D, end: Point2D) => void;
  updateWall: (index: number, wall: Wall) => void;
  removeWall: (index: number) => void;
  addOpening: (opening: Opening) => void;
  updateOpening: (index: number, opening: Opening, type: 'door' | 'window' | 'furniture') => void;
  removeOpening: (index: number, type: 'door' | 'window' | 'furniture') => void;
  getScenePayload: () => ScenePayload;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  // Initialize with a simple 10x10 empty plot
  bounds: { min: [0, 0], max: [10, 10], center: [5, 5] },
  walls: [],
  rooms: [],
  doors: [],
  windows: [],
  furniture: [],
  mode: 'select',

  setBounds: (width, height) => set({
    bounds: {
      min: [0, 0],
      max: [width, height],
      center: [width / 2, height / 2]
    }
  }),

  setMode: (mode) => set({ mode }),

  addWall: (start, end) => set((state) => ({
    walls: [...state.walls, { start, end, thickness: 0.18, confidence: 1 }]
  })),

  updateWall: (index, wall) => set((state) => {
    const walls = [...state.walls];
    walls[index] = wall;
    return { walls };
  }),

  removeWall: (index) => set((state) => {
    const walls = [...state.walls];
    walls.splice(index, 1);
    return { walls };
  }),

  addOpening: (opening) => set((state) => {
    if (opening.type === 'door') return { doors: [...state.doors, opening] };
    if (opening.type === 'window') return { windows: [...state.windows, opening] };
    return { furniture: [...state.furniture, opening] };
  }),

  updateOpening: (index, opening, type) => set((state) => {
    if (type === 'door') {
      const doors = [...state.doors];
      doors[index] = opening;
      return { doors };
    }
    if (type === 'window') {
      const windows = [...state.windows];
      windows[index] = opening;
      return { windows };
    }
    const furniture = [...state.furniture];
    furniture[index] = opening;
    return { furniture };
  }),

  removeOpening: (index, type) => set((state) => {
    if (type === 'door') {
      const doors = [...state.doors];
      doors.splice(index, 1);
      return { doors };
    }
    if (type === 'window') {
      const windows = [...state.windows];
      windows.splice(index, 1);
      return { windows };
    }
    const furniture = [...state.furniture];
    furniture.splice(index, 1);
    return { furniture };
  }),

  getScenePayload: () => {
    const state = get();
    // Default materials for preview
    const materials = {
      wall_color: '#E8F3FF',
      floor_texture: 'wood' as const,
      ceiling_color: '#F8FBFF',
      theme: 'aurora',
      sunlight: true,
    };
    
    // We combine doors, windows, furniture
    return {
      version: '2.0',
      units: 'meters',
      bounds: state.bounds,
      wallHeight: 3.0,
      wallThickness: 0.18,
      walls: state.walls,
      rooms: state.rooms,
      doors: state.doors,
      windows: state.windows,
      materials,
      features: {
        orbit: true,
        firstPerson: true,
        collision: true,
        sunlight: true,
        exportReady: true,
      }
    };
  }
}));
