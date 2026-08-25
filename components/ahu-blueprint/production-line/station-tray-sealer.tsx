import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import { COLOR_EDGE, XRayPipeMaterial, skeletonRiseTex, skeletonFeedTex } from '../shared/materials';

// ============================================================================
// --- STATION 3: HIGH-SPEED TRAY SEALER (WIDER OPEN FRAME & NO DIVIDER) ---
// ============================================================================
export function StationTraySealer({ position }: { position: [number, number, number] }) {
  const pressGroupRef = useRef<THREE.Group>(null);
  const filmSupplyRollRef = useRef<THREE.Group>(null);
  const filmTakeupRollRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // --- ANIMATED RECIPROCATING 4-TRAY HEAT SEALER & ALL FILM ROLLERS ---
    if (pressGroupRef.current) {
      const cycleTime = 4.1666; 
      
      const phaseOffset = .59; 
      const phase = ((time + phaseOffset) % cycleTime) / cycleTime; 
      
      const travelDist = 0.5525; 
      
      let xOffset = 0;
      let yOffset = 0;

      if (phase < 0.5) {
        const dwellProgress = phase / 0.5; 
        xOffset = (-travelDist / 2) + dwellProgress * travelDist; 
        yOffset = 0.155; 
      } 
      else {
        const resetProgress = (phase - 0.5) / 0.5; 
        xOffset = (travelDist / 2) - resetProgress * travelDist; 
        yOffset = 0.155 + Math.sin(resetProgress * Math.PI) * 0.12; 
      }

      pressGroupRef.current.position.x = xOffset;
      pressGroupRef.current.position.y = yOffset;

      if (filmSupplyRollRef.current) {
        filmSupplyRollRef.current.rotation.z = time * 2.4; 
      }
      if (filmTakeupRollRef.current) {
        filmTakeupRollRef.current.rotation.z = time * 3.6; 
      }
      
      if (skeletonRiseTex && skeletonFeedTex) {
        skeletonRiseTex.offset.y = -(phase * 4); 
        skeletonFeedTex.offset.x = (phase * 4) + 0.2; 
      }
    }
  });

  return (
    <group name="station-tray-sealer" position={position}>
        
      {/* --- EXPANDED INDUSTRIAL FRAME (WIDER SO TRAVEL IS NOT CUT OFF) --- */}
      <group name="sealer-frame">
        {/* Main Lower Housings straddling line (Expanded width to 2.2) */}
        <mesh position={[0, -0.2, 0.35]}>
          <boxGeometry args={[2.2, 0.5, 0.2]} />
          <meshStandardMaterial color="#020a14" roughness={0.1} metalness={0.95} depthWrite={true} transparent={false} />
          <Edges color={COLOR_EDGE} />
        </mesh>
        <mesh position={[0, -0.2, -0.35]}>
          <boxGeometry args={[2.2, 0.5, 0.2]} />
          <meshStandardMaterial color="#020a14" roughness={0.1} metalness={0.95} depthWrite={true} transparent={false} />
          <Edges color={COLOR_EDGE} />
        </mesh>
        
        {/* Heavy Floor Support Legs (Shortened and shifted to match exact Y = -0.725 floor) */}
        {[-1.0, -0.3, 0.3, 1.0].map(x => [-0.4, 0.4].map(z => (
            <group key={`sealer-leg-${x}-${z}`}>
              <mesh position={[x, -0.4625, z]}>
                <cylinderGeometry args={[0.035, 0.035, 0.425, 16]} />
                <meshStandardMaterial color="#020a14" roughness={0.1} metalness={0.95} depthWrite={true} transparent={false} />
                <Edges color={COLOR_EDGE} />
              </mesh>
              <mesh position={[x, -0.7, z]}>
                <cylinderGeometry args={[0.05, 0.07, 0.05, 16]} />
                <XRayPipeMaterial />
              </mesh>
            </group>
        )))}

        {/* Blueprint Glass Safety Canopy (Single wide window, expanded to 2.15 width) */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[2.15, 0.9, 0.94]} />
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
        
        {/* Structural Canopy End Ribs ONLY (Middle divider removed) */}
        {[-1.075, 1.075].map((x, i) => (
          <mesh key={`canopy-rib-${i}`} position={[x, 0.5, 0]}>
            <boxGeometry args={[0.08, 0.92, 0.96]} />
            <meshStandardMaterial color="#020a14" roughness={0.1} metalness={0.95} depthWrite={true} transparent={false} />
            <Edges color={COLOR_EDGE} />
          </mesh>
        ))}

        {/* FIXED: Stationary Overhead Linear Rails to anchor the floating press */}
        {[-0.2, 0.2].map(z => (
          <mesh key={`sealer-rail-${z}`} position={[0, 0.75, z]}>
            <boxGeometry args={[2.1, 0.06, 0.06]} />
            <meshStandardMaterial color="#020a14" roughness={0.1} metalness={0.95} depthWrite={true} transparent={false} />
            <Edges color={COLOR_EDGE} />
          </mesh>
        ))}
      </group>

      {/* --- ANIMATED RECIPROCATING SEALING PRESS ASSEMBLY --- */}
      <group ref={pressGroupRef} position={[0, 0.18, 0]}>
        
        {/* FIXED: Telescoping Hanger Rods (These slide through the stationary overhead rails above) */}
        {[-0.5, 0.5].map((x, i) => [-0.2, 0.2].map((z, j) => (
          <mesh key={`hanger-rod-${i}-${j}`} position={[x, 0.55, z]}>
            <cylinderGeometry args={[0.015, 0.015, 0.4, 16]} />
            <XRayPipeMaterial />
          </mesh>
        )))}

        {/* Linear Guide Motion Gantry Carriage */}
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[1.25, 0.08, 0.5]} />
          <meshStandardMaterial color="#020a14" roughness={0.1} metalness={0.95} depthWrite={true} transparent={false} />
          <Edges color={COLOR_EDGE} />
        </mesh>
        
        {/* Quad Pneumatic Press Actuators */}
        {[-0.42, -0.14, 0.14, 0.42].map((x, i) => (
          <group key={`press-actuator-${i}`} position={[x, 0.18, 0]}>
            <mesh>
              <cylinderGeometry args={[0.04, 0.04, 0.25, 16]} />
              <meshStandardMaterial color="#020a14" roughness={0.1} metalness={0.95} depthWrite={true} transparent={false} />
              <Edges color={COLOR_EDGE}/>
            </mesh>
            <mesh position={[0, -0.12, 0]}>
              <cylinderGeometry args={[0.018, 0.018, 0.2, 16]} />
              <XRayPipeMaterial />
            </mesh>
          </group>
        ))}

        {/* 4-Package Batch Heat-Seal Platen Main Beam */}
        <mesh position={[0, -0.02, 0]}>
          <boxGeometry args={[1.18, 0.06, 0.24]} />
          <meshStandardMaterial color="#ff3300" emissive="#ff2200" emissiveIntensity={3.5} />
          <Edges color="#ffffff" />
        </mesh>
        
        {/* Individual Pressure Heads */}
        {[-0.42, -0.14, 0.14, 0.42].map((x, i) => (
          <mesh key={`seal-head-${i}`} position={[x, -0.06, 0]}>
            <boxGeometry args={[0.18, 0.02, 0.14]} />
            <meshStandardMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={2.0} />
            <Edges color="#ffff00" />
          </mesh>
        ))}
      </group>

      {/* --- DETAILED FILM UNWIND & REWIND DECK --- */}
      <group name="sealer-film-system" position={[0, 0.98, 0]}>
        
        {/* Heavy Mounting Side Plates & Crossmember */}
        <mesh position={[0, 0, -0.32]}>
          <boxGeometry args={[1.6, 0.12, 0.04]} />
          <meshStandardMaterial color="#020a14" roughness={0.1} metalness={0.95} depthWrite={true} />
          <Edges color={COLOR_EDGE} />
        </mesh>
        <mesh position={[0, 0, 0.32]}>
          <boxGeometry args={[1.6, 0.12, 0.04]} />
          <meshStandardMaterial color="#020a14" roughness={0.1} metalness={0.95} depthWrite={true} transparent={false} />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* --- PERIMETER FILM ROUTING (TANGENTIAL TO ALL ROLLERS) --- */}
        
        {/* 1. Left Outfeed */}
        <mesh position={[-0.68, 0.226, 0]} rotation={[0, 0, 0.204]}>
          <boxGeometry args={[0.54, 0.002, 0.56]} />
          <meshStandardMaterial color="#00ffff" emissive="#00f0ff" emissiveIntensity={0.8} transparent={true} opacity={0.35} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>

        {/* 2. Left Vertical Drop */}
        <mesh position={[-0.965, -0.368, 0]}>
          <boxGeometry args={[0.002, 1.08, 0.56]} />
          <meshStandardMaterial color="#00ffff" emissive="#00f0ff" emissiveIntensity={0.85} transparent={true} opacity={0.4} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>

        {/* 3. Main Sealing Web */}
        <mesh position={[0, -0.908, 0]}>
          <boxGeometry args={[1.93, 0.002, 0.56]} />
          <meshStandardMaterial color="#00ffff" emissive="#00f0ff" emissiveIntensity={1.0} transparent={true} opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>

        {/* 4. Right Vertical Rise (SKELETON SCRAP: Y-Axis Scroll) */}
        <mesh position={[0.965, -0.368, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.56, 1.08]} />
          <meshStandardMaterial 
            color="#00ffff" 
            emissive="#00f0ff" 
            emissiveIntensity={0.85} 
            transparent={true} 
            opacity={0.65} 
            depthWrite={false} 
            blending={THREE.AdditiveBlending} 
            side={THREE.DoubleSide}
            alphaMap={typeof skeletonRiseTex !== 'undefined' ? skeletonRiseTex : null}
            alphaTest={0.1}
          />
        </mesh>

        {/* 5. Right Infeed (SKELETON SCRAP: Flat plane, X-Axis Scroll) */}
        <mesh position={[0.68, 0.176, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.54, 0.56]} />
          <meshStandardMaterial 
            color="#00ffff" 
            emissive="#00f0ff" 
            emissiveIntensity={0.8} 
            transparent={true} 
            opacity={0.65} 
            depthWrite={false} 
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide} 
            alphaMap={typeof skeletonFeedTex !== 'undefined' ? skeletonFeedTex : null}
            alphaTest={0.1}
          />
        </mesh>

        {/* --- FILM SUPPLY & TAKEUP ROLLS --- */}

        {/* FILM SUPPLY ROLL ASSEMBLY (LEFT) */}
        <group ref={filmSupplyRollRef} position={[-0.42, 0.12, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.68, 16]} />
            <XRayPipeMaterial />
          </mesh>
          {[-0.31, 0.31].map((z, i) => (
            <group key={`supply-flange-${i}`} position={[0, 0, z]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.18, 0.18, 0.015, 32]} />
                <meshStandardMaterial color="#020a14" roughness={0.1} metalness={0.95} depthWrite={true} />
                <Edges color={COLOR_EDGE} />
              </mesh>
              {[0, Math.PI / 2].map((rot, k) => (
                <mesh key={`spoke-${k}`} rotation={[0, 0, rot]}>
                  <boxGeometry args={[0.34, 0.02, 0.02]} />
                  <meshStandardMaterial color="#00f0ff" emissive="#00ffff" emissiveIntensity={1.2} />
                </mesh>
              ))}
            </group>
          ))}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.6, 32]} />
            <XRayPipeMaterial />
            <Edges color={COLOR_EDGE} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.165, 0.165, 0.58, 32]} />
            <meshStandardMaterial color="#00f0ff" emissive="#00ffff" emissiveIntensity={0.8} transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} /> 
          </mesh>
        </group>

        {/* FILM TAKE-UP SCRAP ROLL ASSEMBLY (RIGHT) */}
        <group ref={filmTakeupRollRef} position={[0.42, 0.08, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.68, 16]} />
            <XRayPipeMaterial />
          </mesh>
          {[-0.31, 0.31].map((z, i) => (
            <group key={`takeup-flange-${i}`} position={[0, 0, z]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.13, 0.13, 0.015, 32]} />
                <meshStandardMaterial color="#020a14" roughness={0.1} metalness={0.95} depthWrite={true} />
                <Edges color={COLOR_EDGE} />
              </mesh>
              {[0, Math.PI / 2].map((rot, k) => (
                <mesh key={`takeup-spoke-${k}`} rotation={[0, 0, rot]}>
                  <boxGeometry args={[0.24, 0.02, 0.02]} />
                  <meshStandardMaterial color="#00f0ff" emissive="#00ffff" emissiveIntensity={1.2} />
                </mesh>
              ))}
            </group>
          ))}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.10, 0.10, 0.6, 32]} />
            <XRayPipeMaterial />
            <Edges color={COLOR_EDGE} />
          </mesh>
        </group>

        {/* --- WIDE PERIMETER GUIDE ROLLERS --- */}

        {/* UPPER OUTER ROLLERS */}
        {[-0.94, 0.94].map((x, i) => (
          <group key={`top-perimeter-roller-${i}`} position={[x, 0.15, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.022, 0.022, 0.64, 16]} />
              <XRayPipeMaterial />
              <Edges color={COLOR_EDGE} />
            </mesh>
          </group>
        ))}

        {/* LOWER OUTER PINCH ROLLERS */}
        {[-0.94, 0.94].map((x, i) => (
          <group key={`lower-perimeter-roller-${i}`} position={[x, -0.88, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.028, 0.028, 0.64, 16]} />
              <XRayPipeMaterial />
              <Edges color={COLOR_EDGE} />
            </mesh>
          </group>
        ))}

      </group>

      {/* Status Light Tower */}
      <group position={[0.95, 1.0, 0.45]}>
        <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.015, 0.015, 0.1, 16]} /><XRayPipeMaterial /></mesh>
        <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.02, 0.02, 0.06, 16]} /><meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={1.5} /></mesh>
        <mesh position={[0, 0.17, 0]}><cylinderGeometry args={[0.02, 0.02, 0.06, 16]} /><meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.2} /></mesh>
        <mesh position={[0, 0.24, 0]}><cylinderGeometry args={[0.02, 0.02, 0.06, 16]} /><meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.2} /></mesh>
      </group>

    </group>
  );
}