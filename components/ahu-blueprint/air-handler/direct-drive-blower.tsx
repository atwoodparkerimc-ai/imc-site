import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import { COLOR_EDGE, COLOR_HOT, SolidInternalMaterial } from '../shared/materials';

// ============================================================================
// --- INTERNAL MECHANICAL COMPONENTS: DIRECT DRIVE BLOWER ---
// ============================================================================
export function DirectDriveBlower({ position }: { position: [number, number, number] }) {
  const impellerRef = useRef<THREE.Group>(null);
  
  useFrame((_, delta) => { 
    if (impellerRef.current) {
      impellerRef.current.rotation.x -= delta * 3; 
    }
  });

  return (
    <group position={position}>
      <mesh position={[0.2, -0.62, 0]}>
        <boxGeometry args={[0.8, 0.08, 0.9]} />
        <SolidInternalMaterial />
        <Edges color={COLOR_EDGE} />
      </mesh>
      <mesh position={[0.4, -0.3, 0]}>
        <boxGeometry args={[0.12, 0.6, 0.4]} />
        <SolidInternalMaterial />
        <Edges color={COLOR_EDGE} />
      </mesh>
      <group position={[0.3, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.25, 0.25, 0.45, 20]} />
          <meshStandardMaterial color={COLOR_HOT} emissive={COLOR_HOT} emissiveIntensity={0.4} />
          <Edges color="#ffffff" />
        </mesh>
        <mesh position={[-0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.25, 12]} />
          <SolidInternalMaterial color="#94a3b8" />
        </mesh>
      </group>
      <mesh position={[-0.55, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.38, 0.22, 0.2, 32, 1, true]} />
        <SolidInternalMaterial />
        <Edges color={COLOR_EDGE} />
      </mesh>
      <group ref={impellerRef} position={[-0.15, 0, 0]}>
        <mesh position={[0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.42, 0.42, 0.02, 32]} />
          <SolidInternalMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>
        <mesh position={[-0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.36, 0.42, 0.02, 32]} />
          <SolidInternalMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>
        {Array.from({ length: 7 }).map((_, i) => {
          const angle = (i / 7) * Math.PI * 2;
          const radius = 0.28;
          return (
            <group key={`blade-${i}`} position={[0, Math.cos(angle) * radius, Math.sin(angle) * radius]} rotation={[angle, 0.3, 0]}>
              <mesh>
                <boxGeometry args={[0.2, 0.015, 0.18]} />
                <SolidInternalMaterial />
                <Edges color={COLOR_EDGE} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}