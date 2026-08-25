import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import { COLOR_EDGE, MachineCasingMaterial, AirHandlerCasingMaterial, XRayPipeMaterial } from '../shared/materials';

// ============================================================================
// --- STATION 1: ROBOTIC LASAGNA PLACER (3-AXIS CARTESIAN GANTRY) ---
// ============================================================================
export function StationLasagnaRobot({ position }: { position: [number, number, number] }) {
  // Station 1: 3-Axis Cartesian Robot Refs
  const noodleBridgeRef = useRef<THREE.Group>(null);
  const noodleCarriageRef = useRef<THREE.Group>(null);
  const noodleHeadRef = useRef<THREE.Group>(null);
  const noodlePlatesRef = useRef<THREE.Group>(null);
  const incomingNoodlesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // --- ANIMATE ROBOTIC LASAGNA PICK-AND-PLACE (3-AXIS KINEMATICS) ---
    if (noodleBridgeRef.current && noodleCarriageRef.current && noodleHeadRef.current) {
      const cycleTime = 4.1666; 
      const phaseOffset = 3.36; 
      const phase = ((time + phaseOffset) % cycleTime) / cycleTime; 
      
      const travelDist = 0.5525; 
      
      let xOffset = 0;
      let yOffset = 0.65; 
      let zOffset = 0;    
      let noodleScale = 0; 

      if (phase < 0.5) {
        const p = phase / 0.5; 
        xOffset = (-travelDist / 2) + (p * travelDist);
        zOffset = 0; 

        if (p > 0.2 && p < 0.8) {
           yOffset = 0.65 - (Math.sin(((p - 0.2) / 0.6) * Math.PI) * 0.35);
        }
        noodleScale = p < 0.5 ? 1 : 0; 

      } else {
        const p = (phase - 0.5) / 0.5; 
        
        xOffset = (travelDist / 2) - (p * travelDist);
        zOffset = 0.75 * Math.sin(p * Math.PI);

        if (p > 0.2 && p < 0.8) {
           yOffset = 0.65 - (Math.sin(((p - 0.2) / 0.6) * Math.PI) * 0.35);
        }
        noodleScale = p > 0.5 ? 1 : 0;
      }

      noodleBridgeRef.current.position.z = zOffset;
      noodleCarriageRef.current.position.x = xOffset;
      noodleHeadRef.current.position.y = yOffset - 0.86; 

      if (noodlePlatesRef.current) {
        noodlePlatesRef.current.scale.setScalar(noodleScale);
      }

      // ANIMATE INCOMING NOODLES ON PARALLEL LINE (INFINITE TREADMILL ILLUSION)
      if (incomingNoodlesRef.current) {
        let timeOffset = phase - 0.75; 
        if (timeOffset > 0) timeOffset -= 1.0; 
        
        // FIXED: 1.12 unit spacing to prevent overlapping
        incomingNoodlesRef.current.position.x = timeOffset * 1.12;

        // DYNAMIC SPATIAL CLIPPING: Make noodles appear one by one at the start of the belt
        incomingNoodlesRef.current.children.forEach((rowGroup) => {
          rowGroup.children.forEach((noodle) => {
            // Calculate this specific noodle's absolute X coordinate on the line
            const actualX = incomingNoodlesRef.current!.position.x + rowGroup.position.x + noodle.position.x;
            
            if (actualX < -5.4) {
              // Completely hidden if it's off the back edge of the belt
              noodle.scale.setScalar(0);
            } else if (actualX > -5.2) {
              // Full size once it is safely on the belt
              noodle.scale.setScalar(1);
            } else {
              // Smoothly scale up from 0 to 1 exactly as it crosses the threshold 
              // creating a seamless "extrusion" effect
              noodle.scale.setScalar((actualX + 5.4) / 0.2);
            }
          });
        });
      }
    }
  });

  return (
    <group name="station-lasagna-robot" position={position}>
        
      {/* --- MAIN WIDE-SPAN GANTRY FRAME --- */}
      <group name="gantry-frame">
        {/* Main Uprights */}
        {[-0.35, 0.35].map(x => [-0.4, 1.15].map(z => (
          <group key={`robot-post-${x}-${z}`}>
            <mesh position={[x, 0.1, z]}>
              <boxGeometry args={[0.08, 1.6, 0.08]} />
              <MachineCasingMaterial />
              <Edges color={COLOR_EDGE} />
            </mesh>
            <mesh position={[x, -0.7, z]}>
              <cylinderGeometry args={[0.07, 0.09, 0.05, 16]} />
              <XRayPipeMaterial />
            </mesh>
          </group>
        )))}
        
        {/* Top Crossbeams (X-Axis Linear Rails) */}
        {[-0.4, 1.15].map(z => (
          <mesh key={`x-rail-${z}`} position={[0, 0.86, z]}>
            <boxGeometry args={[0.8, 0.08, 0.08]} />
            <MachineCasingMaterial />
            <Edges color={COLOR_EDGE} />
          </mesh>
        ))}
        {/* Side Crossbeams (Z-Axis Linear Rails crossing both lines) */}
        {[-0.35, 0.35].map(x => (
          <mesh key={`z-rail-${x}`} position={[x, 0.86, 0.375]}>
            <boxGeometry args={[0.08, 0.08, 1.63]} />
            <MachineCasingMaterial />
            <Edges color={COLOR_EDGE} />
          </mesh>
        ))}
      </group>

      {/* --- SHORTENED PARALLEL INFEED CONVEYOR (6 METERS LONG, 3 LEGS) --- */}
      <group name="parallel-infeed-line" position={[-2.5, 0.18, 0.75]}>
        {/* Conveyor Side Rails */}
        <mesh position={[0, 0, 0.15]}>
            <boxGeometry args={[6.0, 0.1, 0.02]} />
            <MachineCasingMaterial />
            <Edges color={COLOR_EDGE} />
        </mesh>
        <mesh position={[0, 0, -0.15]}>
            <boxGeometry args={[6.0, 0.1, 0.02]} />
            <MachineCasingMaterial />
            <Edges color={COLOR_EDGE} />
        </mesh>
        
        {/* Belt Surface */}
        <mesh position={[0, 0, 0]}>
            <boxGeometry args={[6.0, 0.02, 0.28]} />
            <AirHandlerCasingMaterial />
            <Edges color={COLOR_EDGE} />
        </mesh>
        
        {/* UPDATED: 3 Conveyor Support Legs (Matched to U-Line styling) */}
        {[-2.5, 0, 2.5].map(lx => (
          <group key={`infeed-leg-${lx}`} position={[lx, -0.35, 0]}>
            
            {/* Front Leg & Flared Base */}
            <mesh position={[0, 0, 0.12]}>
              <cylinderGeometry args={[0.03, 0.03, 1.06, 16]} />
              <XRayPipeMaterial/>
              <Edges color={COLOR_EDGE} />
            </mesh>
            <mesh position={[0, -0.53, 0.12]}>
              <cylinderGeometry args={[0.05, 0.07, 0.05, 16]} />
              <XRayPipeMaterial/>
              <Edges color={COLOR_EDGE} />
            </mesh>

            {/* Back Leg & Flared Base */}
            <mesh position={[0, 0, -0.12]}>
              <cylinderGeometry args={[0.03, 0.03, 1.06, 16]} />
              <XRayPipeMaterial/>
              <Edges color={COLOR_EDGE} />
            </mesh>
            <mesh position={[0, -0.53, -0.12]}>
              <cylinderGeometry args={[0.05, 0.07, 0.05, 16]} />
              <XRayPipeMaterial/>
              <Edges color={COLOR_EDGE} />
            </mesh>
          </group>
        ))}
      </group>

      {/* --- CONTINUOUS NOODLE TRAIN (STATION-RELATIVE FOR PICK ALIGNMENT) --- */}
      <group ref={incomingNoodlesRef} position={[0, 0.195, 0.75]}>
        {[0, 1, 2, 3, 4, 5].map(row => (
          <group key={`noodle-row-${row}`} position={[-row * 1.12, 0, 0]}>
            {[ -0.42, -0.14, 0.14, 0.42 ].map((x, i) => (
              <mesh key={`incoming-noodle-${row}-${i}`} position={[x, 0, 0]}>
                <boxGeometry args={[0.14, 0.005, 0.09]} />
                <meshStandardMaterial color="#fcdb7e" roughness={0.6} /> 
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* --- TRUE 3-AXIS KINEMATIC ROBOT ASSEMBLY --- */}
      <group ref={noodleBridgeRef} position={[0, 0.86, 0]}>
        
        {/* Linear Guide Blocks riding the Z-rails */}
        <mesh position={[-0.35, 0, 0]}>
          <boxGeometry args={[0.12, 0.06, 0.12]} />
          <MachineCasingMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>
        <mesh position={[0.35, 0, 0]}>
          <boxGeometry args={[0.12, 0.06, 0.12]} />
          <MachineCasingMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* The Main Bridge Beam */}
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.78, 0.08, 0.08]} />
          <MachineCasingMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* THE CARRIAGE */}
        <group ref={noodleCarriageRef} position={[0, 0.05, 0]}>
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[0.16, 0.1, 0.16]} />
            <MachineCasingMaterial />
            <Edges color={COLOR_EDGE} />
          </mesh>
          <mesh position={[0, 0.15, 0]} rotation={[Math.PI/2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.05, 16]} />
            <meshStandardMaterial color="#00f0ff" emissive="#00ffff" emissiveIntensity={1.5} />
          </mesh>

          {/* THE TOOL HEAD */}
          <group ref={noodleHeadRef} position={[0, 0, 0]}>
            
            {/* Vertical Telescoping Guide Rods */}
            {[-0.05, 0.05].map(x => (
              <mesh key={`guide-rod-${x}`} position={[x, 0.4, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 0.8, 16]} />
                <XRayPipeMaterial />
              </mesh>
            ))}
            
            {/* Central Pneumatic Plunge Cylinder */}
            <mesh position={[0, 0.4, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.8, 16]} />
              <MachineCasingMaterial />
              <Edges color={COLOR_EDGE} />
            </mesh>

            {/* Wide Vacuum Manifold Spreader Bar */}
            <mesh position={[0, -0.06, 0]}>
              <boxGeometry args={[1.0, 0.06, 0.1]} />
              <MachineCasingMaterial />
              <Edges color={COLOR_EDGE} />
            </mesh>

            {/* 4-Point Corner Vacuum Suction Assemblies */}
            {[ -0.42, -0.14, 0.14, 0.42 ].map((x, i) => (
              <group key={`vacuum-head-${i}`} position={[x, -0.1, 0]}>
                
                {/* Main Drop Stem */}
                <mesh position={[0, 0.04, 0]}>
                  <cylinderGeometry args={[0.01, 0.01, 0.1, 16]} />
                  <MachineCasingMaterial />
                  <Edges color={COLOR_EDGE} />
                </mesh>
                
                {/* Pneumatic Air Line Fitting */}
                <mesh position={[0.01, 0.07, 0]} rotation={[0, 0, Math.PI/2]}>
                  <cylinderGeometry args={[0.005, 0.005, 0.02, 8]} />
                  <MachineCasingMaterial />
                  <Edges color={COLOR_EDGE} />
                </mesh>

                {/* Horizontal Spreader Plate */}
                <mesh position={[0, -0.01, 0]}>
                  <boxGeometry args={[0.11, 0.01, 0.07]} />
                  <MachineCasingMaterial />
                  <Edges color={COLOR_EDGE} />
                </mesh>

                {/* 4 Precision Corner Suction Cups (Calculated to rest exactly on top of the noodle) */}
                {[
                  [0.045, 0.025], 
                  [-0.045, 0.025], 
                  [0.045, -0.025], 
                  [-0.045, -0.025]
                ].map(([cx, cz], cupIdx) => (
                  <group key={`cup-${cupIdx}`} position={[cx, -0.03, cz]}>
                    {/* Cup Stem */}
                    <mesh position={[0, 0.01, 0]}>
                      <cylinderGeometry args={[0.003, 0.003, 0.02, 8]} />
                      <MachineCasingMaterial />
                      <Edges color={COLOR_EDGE} />
                    </mesh>
                    {/* Flared Suction Cup Bellows */}
                    <mesh position={[0, -0.005, 0]}>
                      <cylinderGeometry args={[0.004, 0.012, 0.015, 16]} />
                      <MachineCasingMaterial />
                      <Edges color={COLOR_EDGE} />
                    </mesh>
                  </group>
                ))}
              </group>
            ))}

            {/* Picked Noodles (Toggled on/off via scale) */}
            <group ref={noodlePlatesRef}>
              {[ -0.42, -0.14, 0.14, 0.42 ].map((x, i) => (
                <mesh key={`picked-noodle-${i}`} position={[x, -0.145, 0]}>
                  <boxGeometry args={[0.14, 0.005, 0.09]} />
                  <meshStandardMaterial color="#fcdb7e" roughness={0.6} /> 
                </mesh>
              ))}
            </group>

          </group>
        </group>
      </group>
    </group>
  );
}