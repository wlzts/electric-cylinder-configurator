import { Suspense, useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import type { Group, Mesh, PerspectiveCamera } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

const PART_NAMES: Record<string, { zh: string; en: string }> = {
  body: { zh: '电缸本体', en: 'Cylinder Body' },
  body_1: { zh: '前端盖', en: 'Front Cover' },
  motor: { zh: '伺服电机', en: 'Servo Motor' },
  rod: { zh: '活塞杆', en: 'Piston Rod' },
  belt: { zh: '同步带', en: 'Timing Belt' },
  end: { zh: '端盖', en: 'End Cap' },
};

function identifyPart(name: string, modelId: string): string | null {
  const n = name.toLowerCase();
  if (modelId === 'dmc160') {
    if (n.includes('rod')) return 'rod';
    if (n.includes('ms1h3')) return 'motor';
    if (n.includes('tb-')) return 'belt';
    if (n.includes('end-')) return 'end';
    return 'body';
  }
  // COZE40
  if (n.includes('rod')) return 'rod';
  if (n.includes('motor') || n.includes('p400')) return 'motor';
  if (n.includes('body_1') || n.includes('body1')) return 'body_1';
  if (n.includes('body')) return 'body';
  return null;
}

interface PartInfo {
  mesh: Mesh;
  partKey: string;
  originalX: number;
  originalY: number;
}

// 爆炸偏移 [dx, dy]，使用各模型自身单位（COZE 为 mm，DMC160 为 m）
type ExplodeMap = Record<string, [number, number]>;

interface ModelConfig {
  id: string;
  label: string;
  file: string;
  center: [number, number, number];
  explode: ExplodeMap;
  // 行程伸长：方向符号与每 mm 行程的位移（模型自身单位）
  rodExtendSign: number;
  rodExtendPerMm: number;
}

const MODELS: ModelConfig[] = [
  {
    id: 'coze40',
    label: 'COZE40 滚珠丝杠型',
    file: 'models/electric-cylinder.glb?v=13',
    center: [-0.051, 0, 0.0065],
    // 左右分离
    explode: {
      rod: [400, 0],
      motor: [-300, 0],
      body_1: [200, 0],
    },
    rodExtendSign: 1,
    rodExtendPerMm: 0.35,
  },
  {
    id: 'dmc160',
    label: 'DMC160 同步带型',
    file: 'models/dmc160.glb?v=13',
    center: [-0.222, -0.107, 0],
    // 上下分离：电机/同步带向上，活塞杆/端盖向下
    explode: {
      motor: [0, 0.18],
      belt: [0, 0.12],
      rod: [0, -0.16],
      end: [0, -0.1],
    },
    rodExtendSign: -1,
    rodExtendPerMm: 0.00035,
  },
];

// 根据整体包围盒自动取景，保证爆炸后所有零件完整可见
function CameraRig({
  outerRef,
  model,
  exploded,
}: {
  outerRef: React.RefObject<Group>;
  model: ModelConfig;
  exploded: boolean;
}) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const controls = useThree((s) => s.controls) as (OrbitControlsImpl & { target: THREE.Vector3 }) | null;
  const size = useThree((s) => s.size);
  const goalRadius = useRef(1);
  const goalTarget = useRef(new THREE.Vector3(0, 0, 0));

  useLayoutEffect(() => {
    const g = outerRef.current;
    if (!g) return;
    // 临时归零旋转，取未旋转的包围盒
    const rot = g.rotation.y;
    g.rotation.y = 0;
    g.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(g);
    g.rotation.y = rot;
    const sz = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());

    let ex = 0;
    let ey = 0;
    let xMin = 0;
    let xMax = 0;
    let yMin = 0;
    let yMax = 0;
    if (exploded) {
      Object.values(model.explode).forEach(([dx, dy]) => {
        ex = Math.max(ex, Math.abs(dx));
        ey = Math.max(ey, Math.abs(dy));
        xMin = Math.min(xMin, dx);
        xMax = Math.max(xMax, dx);
        yMin = Math.min(yMin, dy);
        yMax = Math.max(yMax, dy);
      });
    }
    const fitX = sz.x + (exploded ? 2 * ex : 0);
    const fitY = sz.y + (exploded ? 2 * ey : 0);

    const aspect = size.width / Math.max(1, size.height);
    const fovV = THREE.MathUtils.degToRad(camera.fov);
    const fovH = 2 * Math.atan(Math.tan(fovV / 2) * aspect);
    const dist =
      Math.max(fitX / 2 / Math.tan(fovH / 2), fitY / 2 / Math.tan(fovV / 2)) * 1.25;
    goalRadius.current = dist;
    goalTarget.current.set(
      c.x + (exploded ? (xMin + xMax) / 2 : 0),
      c.y + (exploded ? (yMin + yMax) / 2 : 0),
      c.z,
    );
  }, [outerRef, model, exploded, camera.fov, size.width, size.height]);

  useFrame((_, delta) => {
    if (!controls) return;
    const ease = Math.min(1, delta * 4);
    const spherical = new THREE.Spherical().setFromVector3(
      camera.position.clone().sub(controls.target),
    );
    spherical.radius += (goalRadius.current - spherical.radius) * ease;
    controls.target.lerp(goalTarget.current, ease);
    camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
    controls.update();
  });

  return null;
}

function CylinderModel({
  model,
  outerRef,
  exploded,
  selectedPart,
  onSelectPart,
  strokeMm,
}: {
  model: ModelConfig;
  outerRef: React.RefObject<Group>;
  exploded: boolean;
  selectedPart: string | null;
  onSelectPart: (part: string | null) => void;
  strokeMm: number;
}) {
  const partsRef = useRef<PartInfo[]>([]);
  const { scene } = useGLTF(import.meta.env.BASE_URL + model.file);

  useEffect(() => {
    partsRef.current = [];
    scene.traverse((child) => {
      const mesh = child as Mesh;
      if (mesh.isMesh) {
        const key = identifyPart(mesh.name, model.id);
        if (key) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (mat && !mat.emissive) mat.emissive = new THREE.Color(0x000000);
          partsRef.current.push({
            mesh,
            partKey: key,
            originalX: mesh.position.x,
            originalY: mesh.position.y,
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
      partsRef.current.forEach(({ mesh }) => {
        (mesh as unknown as { onPointerDown?: unknown }).onPointerDown = null;
      });
    };
  }, [scene, selectedPart, onSelectPart, model.id]);

  useFrame((_, delta) => {
    if (outerRef.current && !selectedPart) {
      outerRef.current.rotation.y += delta * 0.15;
    }

    partsRef.current.forEach(({ mesh, partKey, originalX, originalY }) => {
      let targetX = originalX;
      let targetY = originalY;

      if (exploded) {
        const offset = model.explode[partKey];
        if (offset) {
          targetX += offset[0];
          targetY += offset[1];
        }
      }

      if (partKey === 'rod' && !exploded) {
        const strokeExtend = (strokeMm - 100) * model.rodExtendPerMm * model.rodExtendSign;
        targetX = originalX + strokeExtend;
      }

      const ease = Math.min(1, delta * 5);
      mesh.position.x += (targetX - mesh.position.x) * ease;
      mesh.position.y += (targetY - mesh.position.y) * ease;
    });

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
    <group ref={outerRef}>
      <group position={model.center}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

export function Cylinder3DViewer() {
  const [modelId, setModelId] = useState(MODELS[0].id);
  const [exploded, setExploded] = useState(false);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [strokeMm, setStrokeMm] = useState(100);

  const model = MODELS.find((m) => m.id === modelId) ?? MODELS[0];
  const outerRef = useRef<Group>(null);
  const handleSelectPart = useCallback((part: string | null) => {
    setSelectedPart(part);
  }, []);

  return (
    <div className="relative h-[460px] w-full overflow-hidden rounded-card border border-line bg-gradient-to-b from-[#f8f8f6] to-[#e8e8e5]">
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

      {/* 型号切换 */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        {MODELS.map((m) => (
          <button
            key={m.id}
            onClick={() => { setModelId(m.id); setSelectedPart(null); }}
            className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              modelId === m.id ? 'bg-accent text-white' : 'bg-white/80 text-ink border border-line hover:bg-white'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {selectedPart && PART_NAMES[selectedPart] && (
        <div className="absolute top-10 right-2 z-10 rounded-lg bg-white/90 px-3 py-2 text-xs shadow-sm border border-line">
          <div className="font-semibold text-ink">{PART_NAMES[selectedPart].zh}</div>
          <div className="text-muted">{PART_NAMES[selectedPart].en}</div>
        </div>
      )}

      {/* 行程滑块 */}
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
            key={model.id}
            model={model}
            outerRef={outerRef}
            exploded={exploded}
            selectedPart={selectedPart}
            onSelectPart={handleSelectPart}
            strokeMm={strokeMm}
          />
          <CameraRig outerRef={outerRef} model={model} exploded={exploded} />
        </Suspense>
        <ContactShadows position={[0, -0.05, 0]} opacity={0.4} scale={0.6} blur={2.5} />
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.12}
          enablePan={false}
          minDistance={0.05}
          maxDistance={20}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}

MODELS.forEach((m) => {
  useGLTF.preload(import.meta.env.BASE_URL + m.file);
});
