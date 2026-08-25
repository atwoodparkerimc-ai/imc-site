import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import { COLOR_EDGE, MachineCasingMaterial, AirHandlerCasingMaterial, XRayPipeMaterial } from '../shared/materials';

// ============================================================================
// --- STATION 2: SAUCE PISTON FILLER (CONICAL HOPPER & FLEX HOSE) ---
// ============================================================================
export function StationSauceFiller({ position }: { position: [number, number, number] }) {
  // Animation Refs
  const sauceManifoldRef = useRef<THREE.Group>(null);
  const sauceAgitatorRef = useRef<THREE.Mesh>(null);
  const sauceHoseRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // --- ANIMATE SAUCE FILLER (SYNCHRONIZED SPEED & TRAY CENTERING) ---
    if (sauceAgitatorRef.current) {
      sauceAgitatorRef.current.rotation.y = time * 2.5; 
    }

    if (sauceManifoldRef.current) {
      const cycleTime = 4.1666; 
      
      const saucePhaseOffset = 1.2; 
      const phase = ((time + saucePhaseOffset) % cycleTime) / cycleTime; 
      
      const travelDist = 0.5525; // Matches exact 4-tray span
      let xOffset = 0;

      if (phase < 0.5) {
        const trackProgress = phase / 0.5;
        xOffset = (-travelDist / 2) + (trackProgress * travelDist);
      } else {
        const returnProgress = (phase - 0.5) / 0.5;
        xOffset = (travelDist / 2) - (returnProgress * travelDist);
      }

      sauceManifoldRef.current.position.x = xOffset;
      sauceManifoldRef.current.position.y = 0.4; 

      // ANIMATE FLEXIBLE HOSE DYNAMICS (PERFECT CAPSULE ALIGNMENT)
      if (sauceHoseRef.current) {
        const topY = 0.68; // Exact global height of top sphere center
        const bottomY = 0.45; // Exact global height of bottom sphere center
        
        const dx = xOffset; 
        const dy = topY - bottomY; 
        
        const hoseLength = Math.sqrt(dx * dx + dy * dy);
        const hoseAngle = Math.atan2(dx, dy); 

        // Lock hose top to the top sphere
        sauceHoseRef.current.position.set(0, topY, 0); 
        // Pivot outward tracking the manifold
        sauceHoseRef.current.rotation.z = hoseAngle; 
        // Stretch exactly to the bottom sphere center
        sauceHoseRef.current.scale.set(1, hoseLength, 1); 
      }
    }
  });

  return (
    <group name="station-sauce-filler" position={position}>
        
      {/* --- MAIN STRUCTURAL FRAME --- */}
      <group name="sauce-frame">
        {[-0.35, 0.35].map(x => [-0.35, 0.35].map(z => (
          <group key={`sauce-post-${x}-${z}`}>
            <mesh position={[x, 0.05, z]}>
              <boxGeometry args={[0.05, 1.5, 0.05]} />
              <MachineCasingMaterial />
              <Edges color={COLOR_EDGE} />
            </mesh>
            <mesh position={[x, -0.7, z]}>
              <cylinderGeometry args={[0.06, 0.08, 0.05, 16]} />
              <XRayPipeMaterial />
            </mesh>
          </group>
        )))}
        <mesh position={[0, 0.78, 0]}>
          <boxGeometry args={[0.75, 0.05, 0.75]} />
          <MachineCasingMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>
      </group>

      {/* --- CONICAL SAUCE RESERVOIR & FIXED TANK STUB --- */}
      <group name="sauce-tank" position={[0, 1.1, 0]}>
        {/* Main Conical Hopper Body */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.45, 0.05, 0.7, 32]} />
          <MachineCasingMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>
        
        {/* Flat Hopper Lid */}
        <mesh position={[0, 0.36, 0]}>
          <cylinderGeometry args={[0.47, 0.47, 0.02, 32]} />
          <MachineCasingMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>
        
        {/* --- DETAILED AGITATOR MOTOR ASSEMBLY --- */}
        <group position={[0, 0.445, 0]}>
          {/* Static Mounting Flange (Doesn't spin) */}
          <mesh position={[0, -0.065, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.02, 16]} />
            <MachineCasingMaterial />
            <Edges color={COLOR_EDGE} />
          </mesh>

          {/* Spinning Motor Components */}
          <group ref={sauceAgitatorRef}>
            {/* Main Motor Housing */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.12, 16]} />
              <MachineCasingMaterial />
              <Edges color={COLOR_EDGE} />
            </mesh>
            
            {/* Vertical Cooling Fins (Makes rotation highly visible) */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
              <mesh key={`motor-fin-${i}`} position={[0, 0, 0]} rotation={[0, (i * Math.PI) / 4, 0]}>
                <boxGeometry args={[0.19, 0.1, 0.01]} />
                <MachineCasingMaterial />
                <Edges color={COLOR_EDGE} />
              </mesh>
            ))}
            
            {/* Top Fan Shroud / Cap */}
            <mesh position={[0, 0.07, 0]}>
              <cylinderGeometry args={[0.095, 0.095, 0.03, 16]} />
              <MachineCasingMaterial />
              <Edges color={COLOR_EDGE} />
            </mesh>
            
            {/* Glowing Indicator Hub */}
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 0.03, 16]} />
              <meshStandardMaterial color="#00f0ff" emissive="#00ffff" emissiveIntensity={2.0} />
            </mesh>
            
            {/* Contrast Bar across indicator to visually track rotation speed */}
            <mesh position={[0, 0.11, 0]}>
              <boxGeometry args={[0.095, 0.02, 0.02]} />
              <MachineCasingMaterial />
              <Edges color={COLOR_EDGE} />
            </mesh>
          </group>
        </group>

        {/* Fixed Tank Bottom Discharge Stub */}
        <mesh position={[0, -0.385, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.07, 16]} />
          <MachineCasingMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>
        
        {/* TOP BALL-AND-SOCKET JOINT */}
        <mesh position={[0, -0.42, 0]}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <MachineCasingMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>
        {/* Top Sanitary Clamp */}
        <mesh position={[0, -0.42, 0]}>
          <cylinderGeometry args={[0.055, 0.055, 0.015, 16]} />
          <MachineCasingMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>
      </group>

      {/* --- DYNAMIC FLEXIBLE SANITARY HOSE --- */}
      <group ref={sauceHoseRef} position={[0, 0.68, 0]}>
        <group position={[0, -0.5, 0]}>
          <mesh>
            <cylinderGeometry args={[0.045, 0.045, 1, 16]} /> 
            {/* Keeping the hose slightly translucent so it looks like rubber/silicone */}
            <AirHandlerCasingMaterial />
            <Edges color={COLOR_EDGE} />
          </mesh>
          {/* Subtle Flexible Wire Ribbing */}
          {[-0.4, -0.2, 0, 0.2, 0.4].map(y => (
            <mesh key={`hose-rib-${y}`} position={[0, y, 0]}>
              <torusGeometry args={[0.046, 0.002, 8, 16]} />
              <XRayPipeMaterial />
            </mesh>
          ))}
        </group>
      </group>

      {/* --- ANIMATED DISPENSING MANIFOLD & SHORT INLET STUB --- */}
      <group ref={sauceManifoldRef} name="sauce-manifold" position={[0, 0.4, 0]}>
        {/* BOTTOM BALL-AND-SOCKET JOINT */}
        <mesh position={[0, 0.05, 0]}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <MachineCasingMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>
        {/* Bottom Sanitary Clamp */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.055, 0.055, 0.015, 16]} />
          <MachineCasingMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* Shortened Inlet Connection Stub */}
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.04, 16]} />
          <MachineCasingMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* Horizontal Distribution Manifold Bar */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 1.1, 16]} />
          <MachineCasingMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>
        
        {/* 4 Dispensing Nozzles */}
        {[ -0.42, -0.14, 0.14, 0.42 ].map((x, i) => (
          <mesh key={`sauce-nozzle-${i}`} position={[x, -0.15, 0]}>
            <cylinderGeometry args={[0.02, 0.01, 0.3, 16]} />
            <XRayPipeMaterial />
            <Edges color={COLOR_EDGE} />
          </mesh>
        ))}
      </group>

     {/* --- INBOUND PROCESS SANITARY PIPE (FIXED ELBOW ALIGNMENT) --- */}
      <group name="sauce-process-pipe" position={[0, 1.46, -0.25]}>
        
        {/* Vertical Inlet Tank Ferrule / Base Flange */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.02, 16]} />
          <MachineCasingMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>
        <mesh position={[0, 0.065, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.07, 16]} />
          <MachineCasingMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* Lower Tri-Clamp Connector (Meets the elbow) */}
        <mesh position={[0, 0.10, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.025, 16]} />
          <MachineCasingMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>
        
        {/* CORRECTED 90-Degree Sanitary Elbow */}
        {/* Locked at Y=0.15. The arc sweeps flawlessly from Y=0.10 to Z=-0.05 */}
        <mesh position={[0, 0.11, -0.051]} rotation={[Math.PI, Math.PI / 2, -1.58]}>
          <torusGeometry args={[0.05, 0.045, 16, 32, Math.PI / 2]} />
          <MachineCasingMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* Horizontal Tri-Clamp Connector (Meets the elbow) */}
        <mesh position={[0, 0.15, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.025, 16]} />
          <MachineCasingMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>
        
        {/* Main Horizontal Pipe Run Heading Out Back */}
        <mesh position={[0, 0.15, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.9, 16]} />
          <MachineCasingMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>
        
        {/* Line Flanges */}
        {[ -0.35, -0.65 ].map(z => (
          <mesh key={`proc-flange-${z}`} position={[0, 0.15, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.065, 0.065, 0.03, 16]} />
            <MachineCasingMaterial />
            <Edges color={COLOR_EDGE} />
          </mesh>
        ))}
        
        {/* Capped End */}
        <mesh position={[0, 0.15, -0.95]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.05, 16]} />
          <MachineCasingMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>
      </group>

      {/* --- SWING-ARM HMI CONTROL PANEL --- */}
      <group name="sauce-hmi" position={[0.4, 0.6, 0.3]} rotation={[0, -Math.PI / 4, 0]}>
         <mesh position={[-0.15, 0, -0.1]} rotation={[0, 0, Math.PI/2]}>
           <cylinderGeometry args={[0.02, 0.02, 0.3, 16]}/>
           <XRayPipeMaterial/>
         </mesh>
         <mesh position={[-0.3, 0, -0.1]}>
           <cylinderGeometry args={[0.03, 0.03, 0.08, 16]}/>
           <MachineCasingMaterial/>
         </mesh>
         <mesh>
           <boxGeometry args={[0.25, 0.2, 0.05]} />
           <MachineCasingMaterial/>
           <Edges color={COLOR_EDGE}/>
         </mesh>
         <mesh position={[0, 0, 0.026]}>
           <planeGeometry args={[0.2, 0.12]} />
           <meshStandardMaterial color="#00f0ff" emissive="#00ffff" emissiveIntensity={1.2} />
         </mesh>
      </group>

    </group>
  );
}