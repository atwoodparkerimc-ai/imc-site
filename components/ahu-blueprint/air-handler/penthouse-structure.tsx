import { Edges } from '@react-three/drei';
import { COLOR_EDGE, COLOR_GLOW, SolidInternalMaterial, XRayGlassMaterial } from '../shared/materials';

// ============================================================================
// --- FULL WALK-IN PENTHOUSE / DOGHOUSE ENCLOSURE ---
// ============================================================================
export function PenthouseStructure() {
  const stairAngle = Math.PI / 4;
  const stringerLen = 1.55;

  return (
    <group position={[0, 0, 0]}>
      
      <mesh position={[-1.3, 0.1, 0]}>
        <boxGeometry args={[3.4, 1.7, 1.6]} />
        <XRayGlassMaterial />
        <Edges color={COLOR_EDGE} />
      </mesh>

      {[-2.1, -1.1].map((x, i) => (
        <mesh key={`bulkhead-${i}`} position={[x, 0.1, 0]}>
          <boxGeometry args={[0.02, 1.68, 1.58]} />
          <XRayGlassMaterial />
          <Edges color={COLOR_EDGE} opacity={0.5} transparent />
        </mesh>
      ))}

      <group position={[-1.3, 0, 0.8]}>
        {[-1.2, 1.25].map((x, i) => (
          <mesh key={`door-${i}`} position={[x, 0.1, 0.01]}>
            <boxGeometry args={[0.5, 1.2, 0.04]} />
            <SolidInternalMaterial color="#475569" />
            <Edges color={COLOR_EDGE} />
            <mesh position={[0, 0.3, 0.02]}>
              <boxGeometry args={[0.15, 0.2, 0.02]} />
              <meshBasicMaterial color={COLOR_GLOW} />
            </mesh>
          </mesh>
        ))}
      </group>

      <mesh position={[-1.5, -0.8, 0]}>
        <boxGeometry args={[4.2, 0.1, 2.8]} />
        <SolidInternalMaterial color="#1e293b" />
        <Edges color={COLOR_EDGE} />
      </mesh>

      {[-3.0, -1.5, 0.0].map((x) => (
        <group key={`legs-${x}`}>
          <mesh position={[x, -1.15, 1.2]}><cylinderGeometry args={[0.05, 0.05, 0.6, 8]} /><SolidInternalMaterial /><Edges color={COLOR_EDGE}/></mesh>
          <mesh position={[x, -1.15, -1.2]}><cylinderGeometry args={[0.05, 0.05, 0.6, 8]} /><SolidInternalMaterial /><Edges color={COLOR_EDGE}/></mesh>
        </group>
      ))}

      <group position={[-1.5, -0.75, 1.35]}>
        <mesh position={[0, 0.6, 0]}><boxGeometry args={[4.2, 0.03, 0.03]} /><SolidInternalMaterial /><Edges color={COLOR_EDGE}/></mesh>
        <mesh position={[0, 0.3, 0]}><boxGeometry args={[4.2, 0.02, 0.02]} /><SolidInternalMaterial /><Edges color={COLOR_EDGE}/></mesh>
        {[-2.1, -1.1, 0, 1.0, 2.0].map((x, i) => (
          <mesh key={`post-${i}`} position={[x, 0.3, 0]}><cylinderGeometry args={[0.015, 0.015, 0.6, 8]} /><SolidInternalMaterial /><Edges color={COLOR_EDGE}/></mesh>
        ))}
      </group>

      <group position={[-3.6, -0.75, 0]}>
        {[0.85, 1.35].map((zPos, idx) => (
          <group key={`stair-side-${idx}`} position={[0, 0, zPos]}>
            <mesh position={[-0.55, -0.55, 0]} rotation={[0, 0, stairAngle]}>
              <boxGeometry args={[stringerLen, 0.04, 0.03]} />
              <SolidInternalMaterial />
              <Edges color={COLOR_EDGE} />
            </mesh>
            <group position={[0, 0.6, 0]}>
              <mesh position={[-0.55, -0.55, 0]} rotation={[0, 0, stairAngle]}>
                <boxGeometry args={[stringerLen, 0.03, 0.03]} />
                <SolidInternalMaterial />
                <Edges color={COLOR_EDGE} />
              </mesh>
            </group>
            <group position={[0, 0.3, 0]}>
              <mesh position={[-0.55, -0.55, 0]} rotation={[0, 0, stairAngle]}>
                <boxGeometry args={[stringerLen, 0.02, 0.02]} />
                <SolidInternalMaterial />
                <Edges color={COLOR_EDGE} />
              </mesh>
            </group>
            <mesh position={[-1.1, -0.8, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.6, 8]} />
              <SolidInternalMaterial />
              <Edges color={COLOR_EDGE} />
            </mesh>
            <mesh position={[0, 0.6, 0]}>
              <boxGeometry args={[0.035, 0.035, 0.035]} />
              <SolidInternalMaterial />
              <Edges color={COLOR_EDGE} />
            </mesh>
            <mesh position={[0, 0.3, 0]}>
              <boxGeometry args={[0.03, 0.03, 0.03]} />
              <SolidInternalMaterial />
              <Edges color={COLOR_EDGE} />
            </mesh>
          </group>
        ))}
        {[0, 1, 2, 3, 4].map((step) => {
          const offset = -0.22 - (step * 0.18);
          return (
            <mesh key={`tread-${step}`} position={[offset, offset, 1.1]}>
              <boxGeometry args={[0.18, 0.02, 0.5]} />
              <SolidInternalMaterial />
              <Edges color={COLOR_EDGE} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}