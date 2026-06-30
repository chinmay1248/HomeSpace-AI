import { useState, useRef, MouseEvent } from 'react';
import { useBuilderStore } from '../../store/useBuilderStore';
import type { Point2D } from '../../types/metanest';
import { MousePointer2, Grid3X3, DoorOpen, Squircle, PanelTop, Armchair } from 'lucide-react';

export function FloorPlanEditor() {
  const { bounds, walls, doors, windows, furniture, mode, setMode, addWall, addOpening, removeWall, removeOpening, setBounds } = useBuilderStore();
  const [drawingWall, setDrawingWall] = useState<Point2D | null>(null);
  const [cursorPos, setCursorPos] = useState<Point2D>([0, 0]);
  const svgRef = useRef<SVGSVGElement>(null);

  const gridSize = 1; // 1 meter grid
  const viewBoxWidth = bounds.max[0] + 4;
  const viewBoxHeight = bounds.max[1] + 4;

  const getSvgCoordinates = (e: MouseEvent): Point2D => {
    if (!svgRef.current) return [0, 0];
    const point = svgRef.current.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return [0, 0];
    const svgP = point.matrixTransform(ctm.inverse());
    // Snap to grid (0.5 meter intervals)
    return [Math.round(svgP.x * 2) / 2, Math.round(svgP.y * 2) / 2];
  };

  const handlePointerDown = (e: MouseEvent) => {
    if (mode === 'wall') {
      const coords = getSvgCoordinates(e);
      setDrawingWall(coords);
    }
  };

  const handlePointerMove = (e: MouseEvent) => {
    const coords = getSvgCoordinates(e);
    setCursorPos(coords);
  };

  const handlePointerUp = (e: MouseEvent) => {
    if (mode === 'wall' && drawingWall) {
      const endCoords = getSvgCoordinates(e);
      if (drawingWall[0] !== endCoords[0] || drawingWall[1] !== endCoords[1]) {
        addWall(drawingWall, endCoords);
      }
      setDrawingWall(null);
    } else if (mode === 'door') {
      addOpening({ id: `door-${Date.now()}`, type: 'door', center: cursorPos, width: 0.9, confidence: 1 });
      setMode('select');
    } else if (mode === 'window') {
      addOpening({ id: `window-${Date.now()}`, type: 'window', center: cursorPos, width: 1.2, confidence: 1 });
      setMode('select');
    } else if (mode === 'furniture') {
      addOpening({ id: `furniture-${Date.now()}`, type: 'bed', center: cursorPos, width: 0.6, confidence: 1 });
      setMode('select');
    }
  };

  const handleWallClick = (index: number) => {
    if (mode === 'select' || mode === 'wall') {
      removeWall(index);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-slate-900">
      {/* Editor Toolbar */}
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] p-3">
        <ToolbarButton active={mode === 'select'} icon={<MousePointer2 />} label="Select" onClick={() => setMode('select')} />
        <ToolbarButton active={mode === 'wall'} icon={<Squircle />} label="Wall" onClick={() => setMode('wall')} />
        <ToolbarButton active={mode === 'door'} icon={<DoorOpen />} label="Door" onClick={() => setMode('door')} />
        <ToolbarButton active={mode === 'window'} icon={<PanelTop />} label="Window" onClick={() => setMode('window')} />
        <ToolbarButton active={mode === 'furniture'} icon={<Armchair />} label="Furniture" onClick={() => setMode('furniture')} />
        
        <div className="ml-auto flex items-center gap-2">
          <button 
            type="button"
            className="flex items-center gap-1 rounded border border-white/10 bg-slate-800 px-2 py-1 text-xs text-white"
            onClick={() => setBounds(bounds.max[0] + 5, bounds.max[1] + 5)}
          >
            <Grid3X3 className="h-3 w-3" />
            Expand Land
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="flex-1 overflow-auto bg-[#0F172A] p-4 cursor-crosshair">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`-2 -2 ${viewBoxWidth} ${viewBoxHeight}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="rounded-md border border-slate-700 bg-[#1E293B] shadow-inner"
        >
          <defs>
            <pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
              <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.05" />
            </pattern>
            <pattern id="grid-large" width={gridSize * 5} height={gridSize * 5} patternUnits="userSpaceOnUse">
              <rect width={gridSize * 5} height={gridSize * 5} fill="url(#grid)" />
              <path d={`M ${gridSize * 5} 0 L 0 0 0 ${gridSize * 5}`} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.1" />
            </pattern>
          </defs>

          {/* Grid Background */}
          <rect x={-2} y={-2} width={viewBoxWidth} height={viewBoxHeight} fill="url(#grid-large)" />

          {/* Land Boundary */}
          <rect 
            x={bounds.min[0]} 
            y={bounds.min[1]} 
            width={bounds.max[0] - bounds.min[0]} 
            height={bounds.max[1] - bounds.min[1]} 
            fill="none" 
            stroke="#4ade80" 
            strokeWidth="0.1" 
            strokeDasharray="0.4 0.4"
          />

          {/* Placed Walls */}
          {walls.map((wall, idx) => (
            <line
              key={idx}
              x1={wall.start[0]}
              y1={wall.start[1]}
              x2={wall.end[0]}
              y2={wall.end[1]}
              stroke="#E2E8F0"
              strokeWidth={wall.thickness}
              strokeLinecap="round"
              className="transition-colors hover:stroke-red-400 cursor-pointer"
              onClick={(e) => { e.stopPropagation(); handleWallClick(idx); }}
            />
          ))}

          {/* Doors */}
          {doors.map((door, idx) => (
            <rect
              key={door.id}
              x={door.center[0] - door.width / 2}
              y={door.center[1] - 0.15}
              width={door.width}
              height={0.3}
              fill="#F59E0B"
              stroke="#78350F"
              strokeWidth="0.04"
              rx="0.05"
              className="cursor-pointer hover:fill-red-400 transition-colors"
              onClick={(e) => { e.stopPropagation(); removeOpening(idx, 'door'); }}
            />
          ))}

          {/* Windows */}
          {windows.map((win, idx) => (
            <rect
              key={win.id}
              x={win.center[0] - win.width / 2}
              y={win.center[1] - 0.1}
              width={win.width}
              height={0.2}
              fill="#38BDF8"
              stroke="#0369A1"
              strokeWidth="0.04"
              rx="0.04"
              className="cursor-pointer hover:fill-red-400 transition-colors"
              onClick={(e) => { e.stopPropagation(); removeOpening(idx, 'window'); }}
            />
          ))}

          {/* Furniture */}
          {furniture.map((item, idx) => (
            <g key={item.id} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); removeOpening(idx, 'furniture'); }}>
              <rect
                x={item.center[0] - item.width / 2}
                y={item.center[1] - item.width / 2}
                width={item.width}
                height={item.width}
                fill="#A78BFA"
                stroke="#5B21B6"
                strokeWidth="0.04"
                rx="0.08"
                className="hover:fill-red-400 transition-colors"
              />
              <text
                x={item.center[0]}
                y={item.center[1] + 0.12}
                textAnchor="middle"
                fontSize="0.28"
                fill="#1E1B4B"
                className="pointer-events-none select-none"
              >
                {item.type === 'bed' ? '🛏' : item.type === 'stove' ? '🍳' : '🪑'}
              </text>
            </g>
          ))}

          {/* Wall Currently Being Drawn */}
          {drawingWall && (
            <line
              x1={drawingWall[0]}
              y1={drawingWall[1]}
              x2={cursorPos[0]}
              y2={cursorPos[1]}
              stroke="#94A3B8"
              strokeWidth="0.18"
              strokeDasharray="0.2 0.2"
              strokeLinecap="round"
            />
          )}

          {/* Grid Cursor Snapper */}
          <circle cx={cursorPos[0]} cy={cursorPos[1]} r="0.1" fill="#38BDF8" />
        </svg>
      </div>
      
      {/* Footer Info */}
      <div className="flex justify-between border-t border-white/10 bg-slate-900 p-2 text-xs text-slate-400">
        <span>Draw on the grid. 1 square = 1 meter.</span>
        <span>X: {cursorPos[0]}, Y: {cursorPos[1]}</span>
      </div>
    </div>
  );
}

function ToolbarButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 p-2 rounded w-16 transition-colors ${
        active ? 'bg-teal-500/20 text-teal-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <div className="h-5 w-5">{icon}</div>
      <span className="text-[10px] leading-none">{label}</span>
    </button>
  );
}
