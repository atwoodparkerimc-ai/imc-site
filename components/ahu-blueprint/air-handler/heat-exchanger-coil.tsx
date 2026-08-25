import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import { COLOR_EDGE, COLOR_GLOW, SolidInternalMaterial } from '../shared/materials';

// ============================================================================
// --- INTERNAL MECHANICAL COMPONENTS: HEAT EXCHANGER COIL ---
// ============================================================================
export function HeatExchangerCoil({ position }: { position: [number, number, number] }) {
  const coilRef = useRef<THREE.MeshStandardMaterial>(null);
  
  useFrame((state) => { 
    if (coilRef.current) {
      coilRef.current.emissiveIntensity = Math.sin(state.clock.getElapsedTime() * 2) * 0.4 + 1.2; 
    }
  });

  const rows = useMemo(() => Array.from({ length: 12 }).map((_, i) => -0.55 + i * 0.1), []);
  const cols = [-0.22, -0.07, 0.07, 0.22];
  
  const tubeLength = 1.2;
  const tubeRadius = 0.012;
  const frontZ = tubeLength / 2;
  const backZ = -tubeLength / 2;
  const protrusion = 0.05;

  return (
    <group position={position}>
      {[-tubeLength / 2, tubeLength / 2].map((z, i) => (
        <mesh key={`endplate-${i}`} position={[0, 0, z]}>
          <boxGeometry args={[0.6, 1.3, 0.02]} />
          <SolidInternalMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>
      ))}

      {Array.from({ length: 36 }).map((_, i) => {
        const zPos = (-tubeLength / 2 + 0.02) + (i / 35) * (tubeLength - 0.04);
        return (
          <mesh key={`fin-${i}`} position={[0, 0, zPos]}>
            <boxGeometry args={[0.55, 1.25, 0.002]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} transparent opacity={0.25} />
          </mesh>
        );
      })}

      {rows.map((y, rowIdx) => (
        <group key={`row-${rowIdx}`} position={[0, y, 0]}>
          {cols.map((x, colIdx) => (
            <mesh key={`tube-${colIdx}`} position={[x, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[tubeRadius, tubeRadius, tubeLength, 12]} />
              <meshStandardMaterial ref={coilRef} color={COLOR_GLOW} emissive={COLOR_GLOW} toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}

      {cols.map((x, colIdx) => (
        <group key={`f-hairpins-${colIdx}`}>
          {[0, 2, 4, 6, 8, 10].map((rIdx) => {
            const y1 = rows[rIdx];
            const y2 = rows[rIdx + 1];
            const midY = (y1 + y2) / 2;
            const loopRadius = Math.abs(y2 - y1) / 2;
            return (
              <group key={`f-ubend-${rIdx}`} position={[x, midY, frontZ]}>
                <mesh position={[0, loopRadius, protrusion / 2]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[tubeRadius, tubeRadius, protrusion, 12]} />
                  <meshStandardMaterial color={COLOR_GLOW} emissive={COLOR_GLOW} emissiveIntensity={0.9} />
                </mesh>
                <mesh position={[0, -loopRadius, protrusion / 2]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[tubeRadius, tubeRadius, protrusion, 12]} />
                  <meshStandardMaterial color={COLOR_GLOW} emissive={COLOR_GLOW} emissiveIntensity={0.9} />
                </mesh>
                <mesh position={[0, 0, protrusion]} rotation={[0, Math.PI / 2, Math.PI / 2]}>
                  <torusGeometry args={[loopRadius, tubeRadius, 12, 24, Math.PI]} />
                  <meshStandardMaterial color={COLOR_GLOW} emissive={COLOR_GLOW} emissiveIntensity={0.9} />
                </mesh>
              </group>
            );
          })}
        </group>
      ))}

      {cols.map((x, colIdx) => (
        <group key={`b-hairpins-${colIdx}`}>
          {[1, 3, 5, 7, 9].map((rIdx) => {
            const y1 = rows[rIdx];
            const y2 = rows[rIdx + 1];
            const midY = (y1 + y2) / 2;
            const loopRadius = Math.abs(y2 - y1) / 2;
            return (
              <group key={`b-ubend-${rIdx}`} position={[x, midY, backZ]}>
                <mesh position={[0, loopRadius, -protrusion / 2]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[tubeRadius, tubeRadius, protrusion, 12]} />
                  <meshStandardMaterial color={COLOR_GLOW} emissive={COLOR_GLOW} emissiveIntensity={0.9} />
                </mesh>
                <mesh position={[0, -loopRadius, -protrusion / 2]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[tubeRadius, tubeRadius, protrusion, 12]} />
                  <meshStandardMaterial color={COLOR_GLOW} emissive={COLOR_GLOW} emissiveIntensity={0.9} />
                </mesh>
                <mesh position={[0, 0, -protrusion]} rotation={[0, -Math.PI / 2, Math.PI / 2]}>
                  <torusGeometry args={[loopRadius, tubeRadius, 12, 24, Math.PI]} />
                  <meshStandardMaterial color={COLOR_GLOW} emissive={COLOR_GLOW} emissiveIntensity={0.9} />
                </mesh>
              </group>
            );
          })}
        </group>
      ))}
    </group>
  );
}