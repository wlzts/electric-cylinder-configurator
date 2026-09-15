import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, ContactShadows } from '@react-three/drei';
import type { Group } from 'three';

function CylinderModel() {
  const group = useRef<Group>(null);
  const { scene } = useGLTF(import.meta.env.BASE_URL + 'models/electric-cylinder.glb?v=2');

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  // Model bounds: X[-0.1585, 0.261] Y[-0.03, 0.03] Z[-0.043, 0.03]
  // Centroid: (0.051, 0, -0.0065) — horizontal cylinder
  return (
    <group ref={group}>
      <group position={[-0.051, 0, 0.0065]}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

export function Cylinder3DViewer() {
  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-card border border-line bg-gradient-to-b from-[#f8f8f6] to-[#e8e8e5]">
      <Canvas
        camera={{ position: [0, 0.15, 0.45], fov: 35 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[0.5, 1, 0.8]} intensity={1.6} />
        <directionalLight position={[-0.5, 0.3, -0.4]} intensity={0.4} />
        <pointLight position={[0, 0.3, 0.3]} intensity={0.3} />
        <Suspense fallback={null}>
          <CylinderModel />
        </Suspense>
        <ContactShadows position={[0, -0.04, 0]} opacity={0.4} scale={0.5} blur={2.5} />
        <OrbitControls
          enablePan={false}
          minDistance={0.15}
          maxDistance={1.0}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload(import.meta.env.BASE_URL + 'models/electric-cylinder.glb?v=2');
