import { Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Html, OrbitControls, PointerLockControls, Sky, Text } from '@react-three/drei';
import { Color, DoubleSide, Vector3 } from 'three';
import { Eye, Footprints, Maximize2 } from 'lucide-react';
import type { MaterialSettings, Point2D, Room, ScenePayload, Wall } from '../../types/metanest';

export type ViewMode = 'orbit' | 'first-person' | 'top';

interface HouseViewerProps {
  scene: ScenePayload;
  viewMode: ViewMode;
  materials: MaterialSettings;
  onViewModeChange: (mode: ViewMode) => void;
}

export function HouseViewer({ scene, viewMode, materials, onViewModeChange }: HouseViewerProps) {
  return (
    <section className="glass min-h-[680px] overflow-hidden rounded-lg">
      <div className="flex flex-col gap-3 border-b border-white/10 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-mint">Interactive Metaverse</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">Generated 3D House</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <ModeButton active={viewMode === 'orbit'} icon={<Eye className="h-4 w-4" />} label="Orbit" onClick={() => onViewModeChange('orbit')} />
          <ModeButton active={viewMode === 'first-person'} icon={<Footprints className="h-4 w-4" />} label="Walk" onClick={() => onViewModeChange('first-person')} />
          <ModeButton active={viewMode === 'top'} icon={<Maximize2 className="h-4 w-4" />} label="Top" onClick={() => onViewModeChange('top')} />
        </div>
      </div>

      <div className="h-[620px] w-full">
        <Canvas shadows camera={{ position: [8, 7, 12], fov: 55 }} dpr={[1, 1.6]}>
          <color attach="background" args={['#071013']} />
          <Suspense fallback={<Html center className="text-sm text-white">Building scene...</Html>}>
            <SceneContent scene={scene} materials={materials} viewMode={viewMode} />
          </Suspense>
        </Canvas>
      </div>
    </section>
  );
}

function SceneContent({ scene, materials, viewMode }: { scene: ScenePayload; materials: MaterialSettings; viewMode: ViewMode }) {
  const bounds = useMemo(() => scene.bounds, [scene.bounds]);
  const floorColor = textureColor(materials.floor_texture);
  const wallColor = new Color(materials.wall_color);

  return (
    <>
      <CameraRig scene={scene} mode={viewMode} />
      <ambientLight intensity={0.42} />
      <directionalLight
        castShadow
        position={[bounds.center[0] + 5, 10, bounds.center[1] - 4]}
        intensity={materials.sunlight ? 2.2 : 0.7}
        shadow-mapSize={[2048, 2048]}
      />
      {materials.sunlight ? <Sky sunPosition={[4, 7, 2]} turbidity={6} rayleigh={0.8} /> : null}
      <Floor scene={scene} color={floorColor} />
      <Ceiling scene={scene} color={materials.ceiling_color} />
      {scene.walls.map((wall, index) => (
        <WallMesh key={`${wall.start.join('-')}-${wall.end.join('-')}-${index}`} wall={wall} height={scene.wallHeight} color={wallColor} />
      ))}
      {scene.rooms.map((room) => (
        <RoomLabel key={room.id} room={room} />
      ))}
      {scene.doors.map((door) => (
        <mesh key={door.id} position={[door.center[0], 1.05, door.center[1]]}>
          <boxGeometry args={[door.width, 2.1, 0.08]} />
          <meshStandardMaterial color="#111827" transparent opacity={0.36} />
        </mesh>
      ))}
      {scene.windows.map((window) => (
        <mesh key={window.id} position={[window.center[0], 1.65, window.center[1]]}>
          <boxGeometry args={[window.width, 0.9, 0.06]} />
          <meshPhysicalMaterial color="#8DEBFF" transparent opacity={0.45} roughness={0.08} transmission={0.2} />
        </mesh>
      ))}
      <Furniture rooms={scene.rooms} />
      <ContactShadows position={[0, 0.02, 0]} scale={50} blur={2.5} opacity={0.35} />
      {viewMode === 'orbit' || viewMode === 'top' ? <OrbitControls makeDefault enablePan enableZoom enableRotate={viewMode !== 'top'} /> : <PointerLockControls />}
      {viewMode === 'first-person' ? <WalkController scene={scene} /> : null}
    </>
  );
}

function WallMesh({ wall, height, color }: { wall: Wall; height: number; color: Color }) {
  const [sx, sy] = wall.start;
  const [ex, ey] = wall.end;
  const dx = ex - sx;
  const dz = ey - sy;
  const length = Math.hypot(dx, dz);
  const angle = -Math.atan2(dz, dx);

  return (
    <mesh castShadow receiveShadow position={[sx + dx / 2, height / 2, sy + dz / 2]} rotation={[0, angle, 0]}>
      <boxGeometry args={[length, height, wall.thickness ?? 0.18]} />
      <meshStandardMaterial color={color} roughness={0.62} metalness={0.02} />
    </mesh>
  );
}

function Floor({ scene, color }: { scene: ScenePayload; color: string }) {
  const [minX, minY] = scene.bounds.min;
  const [maxX, maxY] = scene.bounds.max;
  const width = Math.max(maxX - minX, 4);
  const depth = Math.max(maxY - minY, 4);
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[minX + width / 2, 0, minY + depth / 2]}>
      <planeGeometry args={[width + 1.5, depth + 1.5, 24, 24]} />
      <meshStandardMaterial color={color} roughness={0.48} metalness={0.04} side={DoubleSide} />
    </mesh>
  );
}

function Ceiling({ scene, color }: { scene: ScenePayload; color: string }) {
  const [minX, minY] = scene.bounds.min;
  const [maxX, maxY] = scene.bounds.max;
  const width = Math.max(maxX - minX, 4);
  const depth = Math.max(maxY - minY, 4);
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[minX + width / 2, scene.wallHeight, minY + depth / 2]}>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial color={color} transparent opacity={0.28} side={DoubleSide} />
    </mesh>
  );
}

function RoomLabel({ room }: { room: Room }) {
  const center = polygonCenter(room.polygon);
  return (
    <Text position={[center[0], 0.04, center[1]]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.28} color="#041014" anchorX="center" anchorY="middle">
      {room.label}
    </Text>
  );
}

function Furniture({ rooms }: { rooms: Room[] }) {
  return (
    <>
      {rooms.slice(0, 8).map((room, index) => {
        const center = polygonCenter(room.polygon);
        const color = ['#14B8A6', '#F59E0B', '#F472B6', '#A3E635'][index % 4];
        return (
          <mesh key={room.id} castShadow receiveShadow position={[center[0], 0.22, center[1]]}>
            <boxGeometry args={[1.2, 0.44, 0.72]} />
            <meshStandardMaterial color={color} roughness={0.55} />
          </mesh>
        );
      })}
    </>
  );
}

function CameraRig({ scene, mode }: { scene: ScenePayload; mode: ViewMode }) {
  const { camera } = useThree();
  useEffect(() => {
    const [cx, cy] = scene.bounds.center;
    const [minX, minY] = scene.bounds.min;
    const [maxX, maxY] = scene.bounds.max;
    const span = Math.max(maxX - minX, maxY - minY, 8);
    if (mode === 'top') {
      camera.position.set(cx, span * 1.4, cy + 0.01);
      camera.lookAt(cx, 0, cy);
    } else if (mode === 'orbit') {
      camera.position.set(cx + span * 0.75, span * 0.55, cy + span * 0.85);
      camera.lookAt(cx, 1.2, cy);
    } else {
      camera.position.set(cx, 1.65, cy);
      camera.lookAt(cx + 1, 1.65, cy);
    }
    camera.updateProjectionMatrix();
  }, [camera, mode, scene.bounds]);
  return null;
}

function WalkController({ scene }: { scene: ScenePayload }) {
  const keys = useRef<Record<string, boolean>>({});
  const { camera } = useThree();
  const bounds = scene.bounds;

  useEffect(() => {
    const onDown = (event: KeyboardEvent) => {
      keys.current[event.code] = true;
    };
    const onUp = (event: KeyboardEvent) => {
      keys.current[event.code] = false;
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  useFrame((_, delta) => {
    const speed = 3.4 * delta;
    const direction = new Vector3();
    camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();
    const strafe = new Vector3().crossVectors(direction, camera.up).normalize();
    const move = new Vector3();
    if (keys.current.KeyW) move.add(direction);
    if (keys.current.KeyS) move.sub(direction);
    if (keys.current.KeyA) move.sub(strafe);
    if (keys.current.KeyD) move.add(strafe);
    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(speed);
      camera.position.add(move);
      camera.position.x = clamp(camera.position.x, bounds.min[0] + 0.45, bounds.max[0] - 0.45);
      camera.position.z = clamp(camera.position.z, bounds.min[1] + 0.45, bounds.max[1] - 0.45);
      camera.position.y = 1.65;
    }
  });

  return null;
}

function ModeButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm transition ${
        active ? 'border-teal-300 bg-teal-300/15 text-white' : 'border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/24'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function polygonCenter(points: Point2D[]): Point2D {
  if (!points.length) return [0, 0];
  const total = points.reduce((acc, point) => [acc[0] + point[0], acc[1] + point[1]] as Point2D, [0, 0]);
  return [total[0] / points.length, total[1] / points.length];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function textureColor(texture: MaterialSettings['floor_texture']) {
  return {
    wood: '#A8763E',
    marble: '#E7EDF4',
    tiles: '#9AB8C2',
    concrete: '#737B82',
    paint: '#C7F9CC',
  }[texture];
}
