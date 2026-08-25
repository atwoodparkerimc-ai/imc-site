import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import { COLOR_EDGE, MachineCasingMaterial, AirHandlerCasingMaterial, XRayPipeMaterial } from '../shared/materials';

// ============================================================================
// --- STATION 5: SPIRAL FREEZER TOWER (EXACT FLOOR MATCH: Y = -0.725) ---
// ============================================================================
export function StationSpiralTower({ position }: { position: [number, number, number] }) {
  return (
    <group name="spiral-tower" position={position}>
      
      {/* --- HIGH-DETAIL CENTRAL COOLING DRUM & DRIVE CAGE --- */}
      <group name="center-post-core" position={[0, 0, 0]}>
        
        {/* Heavy Base Flange (Center Y = -0.7, Height = 0.05 -> Bottom exactly at -0.725) */}
        <mesh position={[0, -0.7, 0]}>
          <cylinderGeometry args={[0.45, 0.45, 0.05, 32]} />
          <MachineCasingMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* Main Inner Cooling Drum (Height 3.1, Center Y = 0.875 -> Bottom exactly on flange at -0.675) */}
        <mesh position={[0, 0.875, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 3.1, 32]} />
          <MachineCasingMaterial />
        </mesh>

        {/* Horizontal Evaporator Coil Ribbing */}
        {Array.from({ length: 30 }).map((_, i) => (
          <mesh key={`drum-rib-${i}`} position={[0, -0.5 + (i * 0.1), 0]}>
            <torusGeometry args={[0.35, 0.008, 8, 32]} />
            <XRayPipeMaterial />
          </mesh>
        ))}

        {/* Vertical Friction Drive Bars (Matches Drum Height & Center) */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => {
          const angle = (i / 12) * Math.PI * 2;
          return (
            <mesh key={`drive-bar-${i}`} position={[Math.cos(angle) * 0.38, 0.875, Math.sin(angle) * 0.38]}>
              <boxGeometry args={[0.02, 3.1, 0.02]} />
              <MachineCasingMaterial />
              <Edges color={COLOR_EDGE} />
            </mesh>
          );
        })}

        {/* Top-Mounted Main Drive Motor Assembly (Stacked directly on top of drum at 2.425) */}
        <group position={[0, 2.475, 0]}>
          <mesh><cylinderGeometry args={[0.4, 0.4, 0.1, 32]} /><MachineCasingMaterial /><Edges color={COLOR_EDGE} /></mesh>
          <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[0.15, 0.2, 0.2, 16]} /><MachineCasingMaterial /><Edges color={COLOR_EDGE} /></mesh>
          <mesh position={[0, 0.35, 0]}><cylinderGeometry args={[0.1, 0.1, 0.2, 16]} /><AirHandlerCasingMaterial /><Edges color={COLOR_EDGE} /></mesh>
        </group>
      </group>

      {/* --- OUTER STRUCTURAL CAGE & CANTILEVER BRACKETS --- */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
        const base_a = Math.PI / 2 + (i * Math.PI) / 4;
        
        // STRICT COLLISION FILTER: Remove the exact post (index 7) that pierces the incoming U-Line conveyor
        if (i === 7) {
          return null;
        }

        const px = Math.cos(base_a) * 0.88; 
        const pz = Math.sin(base_a) * 0.88;

        return (
          <group key={`outer-post-group-${i}`}>
            {/* Vertical Pillar (Matches Drum Height & Center: 3.1 tall, Y = 0.875) */}
            <mesh position={[px, 0.875, pz]}>
              <cylinderGeometry args={[0.025, 0.025, 3.1, 16]} />
              <MachineCasingMaterial />
              <Edges color={COLOR_EDGE} />
            </mesh>

            {/* Flared Feet (Center Y = -0.7, Height = 0.05 -> Bottom exactly at -0.725 to perfectly match the U-line legs) */}
            <mesh position={[px, -0.7, pz]}>
               <cylinderGeometry args={[0.04, 0.06, 0.05, 16]} />
               <XRayPipeMaterial />
               <Edges color={COLOR_EDGE} />
            </mesh>

            {/* Cantilever Support Brackets */}
            {[0, 1, 2, 3].map(wrap => {
              const y = (i * 0.075) + (wrap * 0.6); 
              const bracketCenterR = (0.88 + 0.55) / 2; 
              const bx = Math.cos(base_a) * bracketCenterR;
              const bz = Math.sin(base_a) * bracketCenterR;

              return (
                <mesh key={`bracket-${i}-${wrap}`} position={[bx, y - 0.015, bz]} rotation={[0, -base_a, 0]}>
                  <boxGeometry args={[0.33, 0.02, 0.02]} />
                  <MachineCasingMaterial />
                  <Edges color={COLOR_EDGE} />
                </mesh>
              );
            })}
          </group>
        );
      })}

      {/* --- ZERO-PITCH OVERLAPPING SCALE BELT --- */}
      <group position={[0, 0, 0]}>
        {Array.from({ length: 600 }).map((_, i) => {
           const t = i / 600;
           const a = Math.PI / 2 + t * 4 * Math.PI * 2;
           
           const x = Math.cos(a) * 0.6;
           const y = t * 2.4;
           const z = Math.sin(a) * 0.6;
           
           return (
             <mesh key={`spiral-belt-${i}`} position={[x, y, z]} rotation={[0, -a, 0]}>
               <boxGeometry args={[0.32, 0.005, 0.035]} />
               <AirHandlerCasingMaterial />
             </mesh>
           );
        })}
      </group>

    </group>
  );
}