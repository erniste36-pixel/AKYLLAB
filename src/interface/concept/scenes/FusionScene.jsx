import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Torus } from '@react-three/drei';
import * as THREE from 'three';

function PlasmaFilament({ index, speedFactor, intensity }) {
  const meshRef = useRef(null);
  const offset = index * 0.7;
  const color = useMemo(() => new THREE.Color().setHSL(0.55 + index * 0.02, 0.9, 0.6), [index]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime() * speedFactor + offset;
    meshRef.current.rotation.x = Math.sin(time) * 0.8;
    meshRef.current.rotation.y = time * 0.6;
    meshRef.current.position.z = Math.sin(time * 1.8) * 0.22;
  });

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[1.3 + index * 0.08, 0.015, 16, 140]} />
      <meshBasicMaterial color={color} transparent opacity={Math.min(1, 0.4 + intensity * 0.35)} />
    </mesh>
  );
}

function TokamakCore({ speedFactor, intensity }) {
  const coreRef = useRef(null);

  useFrame(({ clock }) => {
    if (!coreRef.current) return;
    const t = clock.getElapsedTime() * speedFactor;
    coreRef.current.rotation.z = t * 0.35;
    coreRef.current.rotation.x = Math.sin(t * 0.35) * 0.15;
  });

  return (
    <group ref={coreRef}>
      <Torus args={[1.35, 0.34, 32, 120]}>
        <meshStandardMaterial color="#1e293b" roughness={0.35} metalness={0.85} />
      </Torus>
      {Array.from({ length: 7 }).map((_, idx) => (
        <PlasmaFilament key={idx} index={idx} speedFactor={speedFactor} intensity={intensity} />
      ))}
      <mesh>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshBasicMaterial color="#67e8f9" transparent opacity={Math.min(0.45, 0.08 + intensity * 0.2)} />
      </mesh>
    </group>
  );
}

export default function FusionScene({
  qualityTier,
  speedMultiplier = 1,
  intensity = 1,
  isPaused = false,
  resetSignal = 0,
  autoRotate = true,
}) {
  const starsCount = qualityTier === 'low' ? 1500 : qualityTier === 'medium' ? 2400 : 3600;
  const speedFactor = (qualityTier === 'low' ? 0.7 : 1) * speedMultiplier * (isPaused ? 0 : 1);

  return (
    <Canvas key={resetSignal} camera={{ position: [0, 0, 4.6], fov: 48 }}>
      <color attach="background" args={['#020617']} />
      <ambientLight intensity={0.18 + intensity * 0.25} />
      <pointLight position={[3, 2, 2]} intensity={1.3 + intensity * 1.6} color="#60a5fa" />
      <pointLight position={[-3, -2, -1]} intensity={0.8 + intensity * 0.8} color="#22d3ee" />
      <Stars radius={30} depth={40} count={starsCount} factor={4} saturation={0.6} fade speed={0.4} />
      <TokamakCore speedFactor={speedFactor} intensity={intensity} />
      <OrbitControls
        enablePan={false}
        maxDistance={6}
        minDistance={3.4}
        autoRotate={autoRotate && !isPaused}
        autoRotateSpeed={0.45 * speedMultiplier}
      />
    </Canvas>
  );
}
