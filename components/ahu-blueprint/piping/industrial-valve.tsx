import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import { COLOR_EDGE, COLOR_HOT, COLOR_GLOW, SolidInternalMaterial } from '../shared/materials';

// ============================================================================
// --- PROCESS PIPEFITTING: HIGH-DETAIL FLANGED VALVE (WITH MOTION) ---
// ============================================================================
export function IndustrialValve({ position, rotation = [0, 0, 0], type = "gate" }: { position: [number, number, number]; rotation?: [number, number, number]; type?: "gate" | "control" }) {
  const isControl = type === "control";
  const movingPartRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!movingPartRef.current) return;
    if (isControl) {
      movingPartRef.current.position.y = 0.2 + Math.sin(state.clock.elapsedTime * 2) * 0.015;
    } else {
      movingPartRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * Math.PI;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Central Valve Body */}
      <mesh>
        <sphereGeometry args={[0.065, 24, 24]} />
        <SolidInternalMaterial color="#334155" />
        <Edges color={COLOR_EDGE} />
      </mesh>
      {[-0.07, 0.07].map((zOffset, i) => (
        <group key={`flange-${i}`} position={[0, 0, zOffset]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.08, 0.08, 0.018, 24]} />
            <SolidInternalMaterial />
            <Edges color={COLOR_EDGE} />
          </mesh>
          {[0, Math.PI/2, Math.PI, Math.PI*1.5].map((angle, bIdx) => (
             <mesh key={`bolt-${bIdx}`} position={[Math.cos(angle)*0.058, 0, Math.sin(angle)*0.058]}>
               <cylinderGeometry args={[0.007, 0.007, 0.022, 8]} />
               <meshStandardMaterial color="#94a3b8" />
             </mesh>
          ))}
        </group>
      ))}
      <group rotation={[Math.PI, 0, 0]}>
        {/* Valve Bonnet & Static Stem */}
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.02, 0.03, 0.1, 16]} />
          <SolidInternalMaterial color="#475569" />
          <Edges color={COLOR_EDGE} />
        </mesh>
        <mesh position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.06, 12]} />
          <SolidInternalMaterial color="#94a3b8" />
        </mesh>
        {isControl ? (
          <group ref={movingPartRef} position={[0, 0.2, 0]}>
            <mesh>
              <cylinderGeometry args={[0.055, 0.055, 0.1, 24]} />
              <meshStandardMaterial color={COLOR_HOT} emissive={COLOR_HOT} emissiveIntensity={0.3} />
              <Edges color="#ffffff" />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
               <cylinderGeometry args={[0.015, 0.015, 0.025, 16]} />
               <meshStandardMaterial color={COLOR_GLOW} emissive={COLOR_GLOW} />
            </mesh>
          </group>
        ) : (
          <group ref={movingPartRef} position={[0, 0.18, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.08, 0.01, 12, 32]} />
              <meshStandardMaterial color={COLOR_HOT} emissive={COLOR_HOT} emissiveIntensity={0.5} />
              <Edges color="#ffffff" />
            </mesh>
            {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, idx) => (
              <mesh key={`spoke-${idx}`} rotation={[0, angle, 0]} position={[Math.cos(angle)*0.04, 0, Math.sin(angle)*0.04]}>
                <boxGeometry args={[0.08, 0.01, 0.01]} />
                <SolidInternalMaterial color={COLOR_HOT} />
              </mesh>
            ))}
          </group>
        )}
      </group>
    </group>
  );
}