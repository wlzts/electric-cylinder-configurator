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
  partKey: string;
  originalPos: THREE.Vector3;
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
  const partsRef = useRef<PartInfo[]>([]);
  const { scene } = useGLTF(import.meta.env.BASE_URL + 'models/electric-cylinder.glb?v=5');

  useEffect(() => {
    partsRef.current = [];
    scene.traverse((child) => {
      const mesh = child as Mesh;
      if (mesh.isMesh) {
        const key = identifyPart(mesh.name);
        if (key && mesh.parent) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (mat && !mat.emissive) mat.emissive = new THREE.Color(0x000000);
          // Use parent node (scene graph node with the actual transform)
          const node = mesh.parent;
          partsRef.current.push({
            node,
            partKey: key,
            originalPos: node.position.clone(),
          });
          const meshAny = mesh as unknown as { onPointerDown?: (e: { stopPropagation: () => void }) => void };
          meshAny.onPointerDown = (e: { stopPropagation: () => void }) => {
            e.stopPropagation();
            onSelectPart(selectedPart === key ? null : key);
          };
        }
      }
    });
    return () => {
      partsRef.current.forEach(({ node }) => {
        node.traverse((c) => {
          (c as unknown as { onPointerDown?: unknown }).onPointerDown = null;
        });
      });
    };
  }, [scene, selectedPart, onSelectPart]);

  useFrame((_, delta) => {
    if (group.current && !selectedPart) {
      group.current.rotation.y += delta * 0.2;
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
    partsRef.current.forEach(({ node, partKey }) => {
      node.traverse((child) => {
        const m = child as Mesh;
        if (m.isMesh) {
          const mat = m.material as THREE.MeshStandardMaterial;
          if (!mat || !mat.emissive) return;
          if (selectedPart === partKey) {
            mat.emissive.setHex(0xff6b35);
            mat.emissiveIntensity = 0.45;
          } else {
            mat.emissive.setHex(0x000000);
            mat.emissiveIntensity = 0;
          }
        }
      });
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

  return (
    <div className="relative h-[440px] w-full overflow-hidden rounded-card border border-line bg-gradient-to-b from-[#f8f8f6] to-[#e8e8e5]">
      <div className="absolute top-2 left-2 z-10 flex gap-1.5">
        <button
          onClick={() => setExploded(!exploded)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            exploded ? 'bg-accent text-white' : 'bg-white/80 text-ink hover:bg-white border border-line'
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

      {selectedPart && PART_NAMES[selectedPart] && (
        <div className="absolute top-2 right-2 z-10 rounded-lg bg-white/90 px-3 py-2 text-xs shadow-sm border border-line">
          <div className="font-semibold text-ink">{PART_NAMES[selectedPart].zh}</div>
          <div className="text-muted">{PART_NAMES[selectedPart].en}</div>
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

useGLTF.preload(import.meta.env.BASE_URL + 'models/electric-cylinder.glb?v=5');
