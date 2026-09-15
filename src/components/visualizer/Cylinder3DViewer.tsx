import { Suspense, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { useGLTF, OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import type { Group, Mesh, Object3D } from 'three';

// Part name mapping
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

interface PartMesh {
  mesh: Mesh;
  partKey: string;
}

function CylinderModel({
  exploded,
  selectedPart,
  onSelectPart,
}: {
  exploded: boolean;
  selectedPart: string | null;
  onSelectPart: (part: string | null) => void;
}) {
  const group = useRef<Group>(null);
  const partsRef = useRef<PartMesh[]>([]);
  const { scene } = useGLTF(import.meta.env.BASE_URL + 'models/electric-cylinder.glb?v=3');

  // Collect parts from the GLB scene
  useMemo(() => {
    partsRef.current = [];
    scene.traverse((child: Object3D) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh;
        const key = identifyPart(mesh.name);
        if (key) {
          // Ensure material has emissive
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (mat && !mat.emissive) {
            mat.emissive = new THREE.Color(0x000000);
          }
          partsRef.current.push({ mesh, partKey: key });
        }
      }
    });
  }, [scene]);

  useFrame((_, delta) => {
    // Auto-rotate when nothing selected
    if (group.current && !selectedPart) {
      group.current.rotation.y += delta * 0.2;
    }
    // Animate exploded positions
    partsRef.current.forEach(({ mesh, partKey }) => {
      let targetX = 0;
      if (exploded) {
        if (partKey === 'rod') targetX = 0.15;
        if (partKey === 'motor') targetX = -0.12;
        if (partKey === 'body_1') targetX = 0.06;
      }
      mesh.position.x += (targetX - mesh.position.x) * Math.min(1, delta * 5);
    });
    // Highlight selected part
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

  const handleClick = (e: ThreeEvent<MouseEvent>, partKey: string) => {
    e.stopPropagation();
    onSelectPart(selectedPart === partKey ? null : partKey);
  };

  return (
    <group ref={group}>
      <group position={[-0.051, 0, 0.0065]}>
        {partsRef.current.map(({ mesh, partKey }) => (
          <primitive
            key={partKey}
            object={mesh}
            onClick={(e: ThreeEvent<MouseEvent>) => handleClick(e, partKey)}
          />
        ))}
      </group>
    </group>
  );
}

export function Cylinder3DViewer() {
  const [exploded, setExploded] = useState(false);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);

  return (
    <div className="relative h-[440px] w-full overflow-hidden rounded-card border border-line bg-gradient-to-b from-[#f8f8f6] to-[#e8e8e5]">
      {/* Toolbar */}
      <div className="absolute top-2 left-2 z-10 flex gap-1.5">
        <button
          onClick={() => setExploded(!exploded)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            exploded
              ? 'bg-accent text-white'
              : 'bg-white/80 text-ink hover:bg-white border border-line'
          }`}
        >
          {exploded ? '合拢' : '爆炸视图'}
        </button>
        {selectedPart && (
          <button
            onClick={() => setSelectedPart(null)}
            className="rounded-md bg-white/80 px-2.5 py-1 text-xs font-medium text-ink border border-line hover:bg-white"
          >
            清除选择
          </button>
        )}
      </div>

      {/* Selected part label */}
      {selectedPart && PART_NAMES[selectedPart] && (
        <div className="absolute top-2 right-2 z-10 rounded-lg bg-white/90 px-3 py-2 text-xs shadow-sm border border-line">
          <div className="font-semibold text-ink">{PART_NAMES[selectedPart].zh}</div>
          <div className="text-muted">{PART_NAMES[selectedPart].en}</div>
        </div>
      )}

      <Canvas
        camera={{ position: [0.3, 0.2, 0.8], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[0.5, 1, 0.8]} intensity={1.6} />
        <directionalLight position={[-0.5, 0.3, -0.4]} intensity={0.4} />
        <pointLight position={[0, 0.3, 0.3]} intensity={0.3} />
        <Suspense fallback={null}>
          <CylinderModel
            exploded={exploded}
            selectedPart={selectedPart}
            onSelectPart={setSelectedPart}
          />
        </Suspense>
        <ContactShadows position={[0, -0.04, 0]} opacity={0.4} scale={0.5} blur={2.5} />
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

useGLTF.preload(import.meta.env.BASE_URL + 'models/electric-cylinder.glb?v=3');
