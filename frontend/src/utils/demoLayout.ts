import type { ScenePayload } from '../types/metanest';

export const demoScene: ScenePayload = {
  version: '1.0',
  units: 'meters',
  bounds: { min: [0, 0], max: [14, 10], center: [7, 5] },
  wallHeight: 3,
  wallThickness: 0.18,
  walls: [
    { start: [0, 0], end: [14, 0], thickness: 0.18, confidence: 0.9 },
    { start: [14, 0], end: [14, 10], thickness: 0.18, confidence: 0.9 },
    { start: [14, 10], end: [0, 10], thickness: 0.18, confidence: 0.9 },
    { start: [0, 10], end: [0, 0], thickness: 0.18, confidence: 0.9 },
    { start: [6, 0], end: [6, 10], thickness: 0.16, confidence: 0.8 },
    { start: [6, 5], end: [14, 5], thickness: 0.16, confidence: 0.8 },
    { start: [0, 5], end: [6, 5], thickness: 0.16, confidence: 0.8 },
  ],
  rooms: [
    { id: 'demo-living', label: 'Living Zone', polygon: [[0, 0], [6, 0], [6, 5], [0, 5]], area: 30, confidence: 0.8 },
    { id: 'demo-kitchen', label: 'Kitchen', polygon: [[0, 5], [6, 5], [6, 10], [0, 10]], area: 30, confidence: 0.78 },
    { id: 'demo-bed', label: 'Bedroom', polygon: [[6, 0], [14, 0], [14, 5], [6, 5]], area: 40, confidence: 0.82 },
    { id: 'demo-bath', label: 'Bath / Utility', polygon: [[6, 5], [14, 5], [14, 10], [6, 10]], area: 40, confidence: 0.76 },
  ],
  doors: [{ id: 'demo-door', type: 'door', center: [6, 2.5], width: 0.9, wall_index: 4, confidence: 0.6 }],
  windows: [{ id: 'demo-window', type: 'window', center: [3, 0], width: 1.4, wall_index: 0, confidence: 0.55 }],
  materials: {
    wall_color: '#E8F3FF',
    floor_texture: 'wood',
    ceiling_color: '#F8FBFF',
    theme: 'aurora',
    sunlight: true,
  },
  features: {
    orbit: true,
    firstPerson: true,
    collision: true,
    sunlight: true,
    exportReady: true,
  },
};

