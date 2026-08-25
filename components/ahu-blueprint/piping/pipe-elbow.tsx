import { Edges } from '@react-three/drei';
import { COLOR_EDGE, XRayPipeMaterial } from '../shared/materials';

// ============================================================================
// --- PROCESS PIPEFITTING: WELDED 90-DEGREE ELBOW ---
// ============================================================================
export function PipeElbow({ position, rotation, radius, tubeRadius }: { position: [number, number, number]; rotation: [number, number, number]; radius: number; tubeRadius: number; }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <torusGeometry args={[radius, tubeRadius, 16, 24, Math.PI / 2]} />
        <XRayPipeMaterial />
        <Edges color={COLOR_EDGE} threshold={10} />
      </mesh>
      <mesh position={[radius, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[tubeRadius + 0.002, 0.004, 8, 24]} />
        <meshStandardMaterial color={COLOR_EDGE} />
      </mesh>
      <mesh position={[0, radius, 0]} rotation={[0, 0, Math.PI/2]}>
        <torusGeometry args={[tubeRadius + 0.002, 0.004, 8, 24]} />
        <meshStandardMaterial color={COLOR_EDGE} />
      </mesh>
    </group>
  );
}