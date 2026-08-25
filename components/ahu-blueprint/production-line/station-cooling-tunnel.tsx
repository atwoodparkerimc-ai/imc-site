import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import { COLOR_EDGE, AirHandlerCasingMaterial, XRayPipeMaterial } from '../shared/materials';

// ============================================================================
// --- STATION 4: MODULAR CHILLING TUNNEL (CLEAN JSX & HIGH SHEEN) ---
// ============================================================================
export function StationCoolingTunnel({ position }: { position: [number, number, number] }) {
  return (
    <group name="station-cooling-tunnel" position={position}>
      
      {/* --- HEAVY TUNNEL LEGS TO FLOOR --- */}
      <group name="tunnel-supports">
        {[-2.0, -1.0, 0, 1.0, 2.0].map((x, i) => (
          <group key={`tunnel-leg-${i}`} position={[x, 0, 0]}>
            {/* Front Leg */}
            <mesh position={[0, -0.55, 0.35]}>
              <cylinderGeometry args={[0.03, 0.03, 0.6, 16]} />
              <meshStandardMaterial color="#020a14" roughness={0.1} metalness={0.95} depthWrite={true} transparent={false} />
              <Edges color={COLOR_EDGE} />
            </mesh>
            <mesh position={[0, -0.85, 0.35]}>
              <cylinderGeometry args={[0.05, 0.07, 0.05, 16]} />
              <XRayPipeMaterial />
            </mesh>
            {/* Back Leg */}
            <mesh position={[0, -0.55, -0.35]}>
              <cylinderGeometry args={[0.03, 0.03, 0.6, 16]} />
              <meshStandardMaterial color="#020a14" roughness={0.1} metalness={0.95} depthWrite={true} transparent={false} />
              <Edges color={COLOR_EDGE} />
            </mesh>
            <mesh position={[0, -0.85, -0.35]}>
              <cylinderGeometry args={[0.05, 0.07, 0.05, 16]} />
              <XRayPipeMaterial />
            </mesh>
            {/* Crossbeam under the tunnel body */}
            <mesh position={[0, -0.3, 0]}>
              <boxGeometry args={[0.08, 0.05, 0.76]} />
              <meshStandardMaterial color="#020a14" roughness={0.1} metalness={0.95} depthWrite={true} transparent={false} />
              <Edges color={COLOR_EDGE} />
            </mesh>
          </group>
        ))}
      </group>

      {/* --- MODULAR INSULATED SEGMENTS --- */}
      <group name="tunnel-segments">
        {[-1.5, -0.5, 0.5, 1.5].map((x, i) => (
          <group key={`tunnel-module-${i}`} position={[x, 0.05, 0]}>
            {/* Solid Front Wall Panel (Completely occludes background legs) */}
            <mesh position={[0, 0, 0.25]}>
              <boxGeometry args={[0.96, 0.5, 0.15]} />
              <meshStandardMaterial color="#020a14" roughness={0.1} metalness={0.95} depthWrite={true} transparent={false} />
              <Edges color={COLOR_EDGE} />
            </mesh>
            
            {/* Rear Wall Frame (Holds the clear window) */}
            {/* Top Sill */}
            <mesh position={[0, 0.2, -0.25]}>
              <boxGeometry args={[0.96, 0.1, 0.15]} />
              <meshStandardMaterial color="#020a14" roughness={0.1} metalness={0.95} depthWrite={true} transparent={false} />
              <Edges color={COLOR_EDGE} />
            </mesh>
            {/* Bottom Sill */}
            <mesh position={[0, -0.225, -0.25]}>
              <boxGeometry args={[0.96, 0.05, 0.15]} />
              <meshStandardMaterial color="#020a14" roughness={0.1} metalness={0.95} depthWrite={true} transparent={false} />
              <Edges color={COLOR_EDGE} />
            </mesh>

            {/* Solid Reflective Roof Panel */}
            <mesh position={[0, 0.28, 0]}>
              <boxGeometry args={[0.96, 0.1, 0.65]} />
              <meshStandardMaterial color="#020a14" roughness={0.1} metalness={0.95} depthWrite={true} transparent={false} />
              <Edges color={COLOR_EDGE} />
            </mesh>
            
            {/* Clear Blueprint Window */}
            <mesh position={[0, -0.025, -0.26]}>
              <boxGeometry args={[0.96, 0.35, 0.02]} />
              <meshStandardMaterial 
                color="#00aaff" 
                emissive="#0088ff" 
                emissiveIntensity={0.2} 
                transparent={true} 
                opacity={0.3} 
                depthWrite={false} 
                blending={THREE.AdditiveBlending} 
              />
              <Edges color={COLOR_EDGE} />
            </mesh>
            {/* Door Handles */}
            <mesh position={[0.2, 0, -0.28]}><boxGeometry args={[0.02, 0.08, 0.02]} /><XRayPipeMaterial /></mesh>
          </group>
        ))}

        {/* Heavy Connecting Flanges / Ribs */}
        {[-2.0, -1.0, 0, 1.0, 2.0].map((x, i) => (
          <mesh key={`tunnel-flange-${i}`} position={[x, 0.05, 0]}>
            <boxGeometry args={[0.1, 0.6, 0.7]} />
            <meshStandardMaterial color="#020a14" roughness={0.1} metalness={0.95} depthWrite={true} transparent={false} />
            <Edges color={COLOR_EDGE} />
          </mesh>
        ))}
      </group>

      {/* --- TOP-MOUNTED REFRIGERATION UNITS --- */}
      <group name="tunnel-refrigeration">
        {[-1.0, 1.0].map((x, i) => (
          <group key={`evap-unit-${i}`} position={[x, 0.33, 0]}>
            {/* Main Compressor/Blower Housing */}
            <mesh position={[0, 0.15, 0]}>
              <boxGeometry args={[0.8, 0.3, 0.5]} />
              <meshStandardMaterial color="#020a14" roughness={0.1} metalness={0.95} depthWrite={true} transparent={false} />
              <Edges color={COLOR_EDGE} />
            </mesh>
            {/* Angled Exhaust Vents */}
            <mesh position={[0, 0.35, 0]} rotation={[Math.PI / 8, 0, 0]}>
              <boxGeometry args={[0.6, 0.05, 0.3]} />
              <AirHandlerCasingMaterial />
              <Edges color={COLOR_EDGE} />
            </mesh>
            {/* Dual Fan Cowlings */}
            {[-0.2, 0.2].map(fx => (
              <mesh key={`fan-${fx}`} position={[fx, 0.15, -0.26]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 0.02, 16]} />
                <XRayPipeMaterial />
                <Edges color={COLOR_EDGE} />
              </mesh>
            ))}

            {/* Standoff Mounting Brackets holding pipes to the INSIDE back face (+Z = +0.27) */}
            {[-0.3, 0.3].map(bx => (
              <mesh key={`pipe-bracket-${bx}`} position={[bx, 0.2, 0.27]}>
                <boxGeometry args={[0.03, 0.12, 0.04]} />
                <meshStandardMaterial color="#020a14" roughness={0.1} metalness={0.95} depthWrite={true} transparent={false} />
                <Edges color={COLOR_EDGE} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Coolant Piping / Manifold - Mounted on the INSIDE back face of housings (+Z = +0.29) */}
        <mesh position={[0, 0.58, 0.29]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 3.8, 16]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>
        <mesh position={[0, 0.52, 0.29]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 3.8, 16]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>
      </group>

      {/* --- ELECTRICAL / CONTROL CABINET --- */}
      <group name="tunnel-controls" position={[-2.1, 0, 0.38]}>
        <mesh>
          <boxGeometry args={[0.15, 0.5, 0.3]} />
          <meshStandardMaterial color="#020a14" roughness={0.1} metalness={0.95} depthWrite={true} transparent={false} />
          <Edges color={COLOR_EDGE} />
        </mesh>
        <mesh position={[-0.08, 0, 0]}>
          <boxGeometry args={[0.02, 0.4, 0.2]} />
          <AirHandlerCasingMaterial />
        </mesh>
      </group>

      {/* --- INTERNAL VOLUMETRIC FROST GLOW --- */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[4.4, 0.2, 0.3]} />
        <meshStandardMaterial 
          color="#0088ff" 
          emissive="#00ccff" 
          emissiveIntensity={2.5} 
          transparent={true} 
          opacity={0.35} 
          depthWrite={false} 
          blending={THREE.AdditiveBlending} 
        />
      </mesh>

    </group>
  );
}