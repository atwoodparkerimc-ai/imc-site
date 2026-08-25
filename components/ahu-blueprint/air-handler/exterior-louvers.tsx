import { Edges } from '@react-three/drei';
import { COLOR_EDGE, SolidInternalMaterial } from '../shared/materials';

// ============================================================================
// --- EXTERIOR HEAVY-DUTY WEATHER HOOD LOUVERS (DOGHOUSE MOUNTED) ---
// ============================================================================
export function ExteriorDoghouseLouvers({ position }: { position: [number, number, number] }) {
  const hoodHeights = [0.45, 0.15, -0.15, -0.45];

  return (
    <group position={position}>
      {/* Wall opening frame */}
      <mesh position={[-0.15, 0, 0]}>
        <boxGeometry args={[0.3, 1.4, 1.42]} />
        <SolidInternalMaterial />
        <Edges color={COLOR_EDGE} />
      </mesh>

      {/* Stacked Extruded Weather Hoods */}
      {hoodHeights.map((y, i) => (
        <group key={`hood-${i}`} position={[-0.3, y, 0]}>
          <mesh position={[0, 0.08, 0]} rotation={[0, 0, Math.PI / 6]}>
            <boxGeometry args={[0.35, 0.02, 1.38]} />
            <SolidInternalMaterial />
            <Edges color={COLOR_EDGE} />
          </mesh>
          <mesh position={[-0.05, -0.02, 0]} rotation={[0, 0, Math.PI / 3]}>
            <boxGeometry args={[0.25, 0.015, 1.36]} />
            <SolidInternalMaterial />
            <Edges color={COLOR_EDGE} />
          </mesh>
          {[-0.68, 0.68].map((zSide, zIdx) => (
            <mesh key={`cap-${zIdx}`} position={[0, 0.02, zSide]}>
              <boxGeometry args={[0.3, 0.14, 0.02]} />
              <SolidInternalMaterial />
              <Edges color={COLOR_EDGE} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}