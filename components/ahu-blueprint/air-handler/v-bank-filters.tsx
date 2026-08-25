import { Edges } from '@react-three/drei';
import { COLOR_EDGE } from '../shared/materials';

// ============================================================================
// --- INTERNAL MECHANICAL COMPONENTS: V-BANK FILTERS ---
// ============================================================================
export function VBankFilters({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {[-0.35, 0, 0.35].map((z, i) => (
        <group key={i} position={[0, 0, z]}>
          <mesh position={[-0.04, 0, 0.08]} rotation={[0, -Math.PI / 6, 0]}>
            <boxGeometry args={[0.03, 1.2, 0.2]} />
            <meshStandardMaterial color="#94a3b8" emissive="#ffffff" emissiveIntensity={0.1} />
            <Edges color={COLOR_EDGE} threshold={15} />
          </mesh>
          <mesh position={[-0.04, 0, -0.08]} rotation={[0, Math.PI / 6, 0]}>
            <boxGeometry args={[0.03, 1.2, 0.2]} />
            <meshStandardMaterial color="#94a3b8" emissive="#ffffff" emissiveIntensity={0.1} />
            <Edges color={COLOR_EDGE} threshold={15} />
          </mesh>
        </group>
      ))}
    </group>
  );
}