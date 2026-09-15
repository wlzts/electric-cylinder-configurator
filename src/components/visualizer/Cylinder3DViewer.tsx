import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, ContactShadows } from '@react-three/drei';
import type { Group } from 'three';

function CylinderModel() {
  const group = useRef<Group>(null);
  const { scene } = useGLTF(import.meta.env.BASE_URL + 'models/electric-cylinder.glb');

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <group ref={group}>
      <primitive object={scene} scale={1.2} />
    </group>
  );
}

export function Cylinder3DViewer() {
  return (
    <div className="relative h-[400px] w-full overflow-hidden rounded-card border border-line bg-gradient-to-b from-[#f8f8f6] to-[#e8e8e5]">
      <Canvas
        camera={{ position: [0.35, 0.25, 0.35], fov: 35 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[0.5, 1, 0.5]} intensity={1.5} />
        <directionalLight position={[-0.5, 0.5, -0.3]} intensity={0.5} />
        <pointLight position={[0, 0.5, 0.3]} intensity={0.3} />
        <Suspense fallback={null}>
          <CylinderModel />
        </Suspense>
        <ContactShadows position={[0, -0.001, 0]} opacity={0.4} scale={0.5} blur={2} />
        <OrbitControls
          enablePan={false}
          minDistance={0.2}
          maxDistance={0.8}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload(import.meta.env.BASE_URL + 'models/electric-cylinder.glb');
