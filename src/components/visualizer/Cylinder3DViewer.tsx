import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import type { Group, Mesh, Object3D } from 'three';

const PART_NAMES: Record<string, { zh: string; en: string }> = {
  body: { zh: '电缸本体', en: 'Cylinder Body' },
  body_1: { zh: '前端盖', en: 'Front Cover' },
  motor: { zh: 'P400 伺服电机', en: 'P400 Servo Motor' },
  rod: { zh: '活塞杆', en: 'Piston Rod' },
};

function identifyPart(name: string): string | null {
  if (name.includes('motor')) return 'motor';
  if (name.includes('rod')) return 'rod';
  if (name.includes('body_1') || name.includes('body1')) return 'body_1';
  if (name.includes('body')) return 'body';
  return null;
}

interface PartInfo {
  node: Object3D;
  mesh: Mesh;
  partKey: string;
  originalPos: THREE.Vector3;
  meshOriginalPos: THREE.Vector3;
}

function CylinderModel({
  exploded,
  selectedPart,
  onSelectPart,
  strokeMm,
  onDebug,
}: {
  exploded: boolean;
  selectedPart: string | null;
  onSelectPart: (part: string | null) => void;
  strokeMm: number;
  onDebug: (lines: string[]) => void;
}) {
  const group = useRef<Group>(null);
  const partsRef = useRef<PartInfo[]>([]);
  const { scene } = useGLTF(import.meta.env.BASE_URL + 'models/electric-cylinder.glb?v=8');

  useEffect(() => {
    partsRef.current = [];
    const lines: string[] = [];
    scene.traverse((obj) => {
      for (const child of obj.children) {
        const mesh = child as Mesh;
        if (mesh.isMesh) {
          const key = identifyPart(mesh.name);
          if (key && !partsRef.current.find((p) => p.partKey === key)) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            if (mat && !mat.emissive) mat.emissive = new THREE.Color(0x000000);
            partsRef.current.push({
              node: obj,
              mesh,
              partKey: key,
              originalPos: obj.position.clone(),
              meshOriginalPos: mesh.position.clone(),
            });
            lines.push(`${key}: node.pos=(${obj.position.x.toFixed(3)},${obj.position.y.toFixed(3)},${obj.position.z.toFixed(3)}) mesh.pos=(${mesh.position.x.toFixed(3)},${mesh.position.y.toFixed(3)},${mesh.position.z.toFixed(3)}) parent=${obj.name || 'unnamed'}`);
            const meshAny = mesh as unknown as { onPointerDown?: (e: { stopPropagation: () => void }) => void };
            meshAny.onPointerDown = (e: { stopPropagation: () => void }) => {
              e.stopPropagation();
              onSelectPart(selectedPart === key ? null : key);
            };
          }
        }
      }
    });
    onDebug(lines);
    return () => {
      partsRef.current.forEach(({ mesh }) => {
        (mesh as unknown as { onPointerDown?: unknown }).onPointerDown = null;
      });
    };
  }, [scene, selectedPart, onSelectPart, onDebug]);

  useFrame((_, delta) => {
    if (group.current && !selectedPart) {
      group.current.rotation.y += delta * 0.15;
    }
    partsRef.current.forEach(({ node, partKey, originalPos }) => {
      let offsetX = 0;
      if (exploded) {
        if (partKey === 'rod') offsetX = 0.15;
        if (partKey === 'motor') offsetX = -0.12;
        if (partKey === 'body_1') offsetX = 0.06;
      }
      const targetX = originalPos.x + offsetX;
      node.position.x += (targetX - node.position.x) * Math.min(1, delta * 5);
    });
    // Parametric stroke: extend rod
    const rodPart = partsRef.current.find((p) => p.partKey === 'rod');
    if (rodPart) {
      const strokeOffset = (strokeMm / 1000) * 0.3; // scale: 100mm stroke → 30mm visual extension
      const targetRodX = rodPart.originalPos.x + strokeOffset;
      rodPart.node.position.x += (targetRodX - rodPart.node.position.x) * Math.min(1, delta * 5);
    }
    // Highlight
    partsRef.current.forEach(({ mesh, partKey }) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (!mat || !mat.emissive) return;
      if (selectedPart === partKey) {
        mat.emissive.setHex(0xff6b35);
        mat.emissiveIntensity = 0.45;
      } else {
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
      }
    });
  });

  return (
    <group ref={group}>
      <group position={[-0.051, 0, 0.0065]}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

export function Cylinder3DViewer() {
  const [exploded, setExploded] = useState(false);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [strokeMm, setStrokeMm] = useState(100);
  const [showDebug, setShowDebug] = useState(false);
  const [debugLines, setDebugLines] = useState<string[]>([]);

  return (
    <div className="relative h-[460px] w-full overflow-hidden rounded-card border border-line bg-gradient-to-b from-[#f8f8f6] to-[#e8e8e5]">
      {/* Toolbar */}
      <div className="absolute top-2 left-2 z-10 flex flex-wrap gap-1.5">
        <button
          onClick={() => setExploded(!exploded)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            exploded ? 'bg-accent text-white' : 'bg-white/80 text-ink hover:bg-white border border-line'
          }`}
        >
          {exploded ? '合拢' : '爆炸视图'}
        </button>
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="rounded-md bg-white/80 px-2.5 py-1 text-xs font-medium text-ink border border-line hover:bg-white"
        >
          调试
        </button>
      </div>

      {/* Stroke slider */}
      <div className="absolute bottom-2 left-2 right-2 z-10 flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 border border-line">
        <span className="text-xs text-muted whitespace-nowrap">行程</span>
        <input
          type="range"
          min={50}
          max={500}
          step={50}
          value={strokeMm}
          onChange={(e) => setStrokeMm(Number(e.target.value))}
          className="flex-1 accent-accent"
        />
        <span className="text-xs font-semibold text-ink num whitespace-nowrap">{strokeMm} mm</span>
      </div>

      {selectedPart && PART_NAMES[selectedPart] && (
        <div className="absolute top-2 right-2 z-10 rounded-lg bg-white/90 px-3 py-2 text-xs shadow-sm border border-line">
          <div className="font-semibold text-ink">{PART_NAMES[selectedPart].zh}</div>
          <div className="text-muted">{PART_NAMES[selectedPart].en}</div>
        </div>
      )}

      {showDebug && debugLines.length > 0 && (
        <div className="absolute top-10 right-2 z-10 rounded-lg bg-black/80 px-3 py-2 text-xs text-green-300 font-mono max-w-xs">
          {debugLines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}

      <Canvas
        camera={{ position: [0.3, 0.2, 0.9], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[0.5, 1, 0.8]} intensity={1.5} />
        <directionalLight position={[-0.5, 0.3, -0.4]} intensity={0.5} />
        <pointLight position={[0, 0.3, 0.3]} intensity={0.3} />
        <Suspense fallback={null}>
          <CylinderModel
            exploded={exploded}
            selectedPart={selectedPart}
            onSelectPart={setSelectedPart}
            strokeMm={strokeMm}
            onDebug={setDebugLines}
          />
        </Suspense>
        <ContactShadows position={[0, -0.05, 0]} opacity={0.4} scale={0.6} blur={2.5} />
        <OrbitControls
          enablePan={false}
          minDistance={0.3}
          maxDistance={2.0}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload(import.meta.env.BASE_URL + 'models/electric-cylinder.glb?v=8');
