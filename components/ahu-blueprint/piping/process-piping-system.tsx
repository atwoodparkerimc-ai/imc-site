import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import { COLOR_EDGE, XRayPipeMaterial } from '../shared/materials';
import { IndustrialValve } from './industrial-valve';
import { PipeElbow } from './pipe-elbow';

// ============================================================================
// --- MAIN ASSEMBLY PIPING ROUTE & HEADER MANIFOLD SYSTEM ---
// ============================================================================
export function ProcessPipingSystem() {
  const r = 0.045;      // 4.5" Feeder Lines
  const R = 0.15;       // Elbow Bend Radius
  const mainR = 0.22;   // 16" Main Header Radius
  
  // =========================================================================
  // 1. LOCKED PENTHOUSE DROPS
  // =========================================================================
  const sX1 = -1.7, sY1 = 0.35, sZ1 = -1.55;  
  const sX2 = -2.6;                           

  const rX1 = -1.7, rY1 = -0.15, rZ1 = -1.85; 
  const rX2 = -2.2;                           

  // =========================================================================
  // 2. MAIN LINE COMMON COORDINATES
  // =========================================================================
  const mainY = -4.0;         
  const mainStartX = -4.5;
  const mainEndX = 1.8;
  const mainLength = Math.abs(mainEndX - mainStartX);
  const mainCenterX = (mainStartX + mainEndX) / 2;

  const riserX = 0.2;         
  const branchY = -3.5;       
  const bypassY = -2.8;       
  const tee1X = -0.2;         
  const tee2X = -1.2;         
  const branchEndX = -2.6;    

  // Z-Depths for both headers
  const mainZ1 = -0.5;   // Front Header (Supply Line 1)
  const mainZ2 = -1.5;   // Rear Header (Return Line 2 - Matched to sketch)

  return (
    <group>

      {/* ========================================================================= */}
      {/* 1. UPPER DROPS (Supply Tied to Line 1, Return Shortened Standalone) */}
      {/* ========================================================================= */}
      <group>
        {/* --- SUPPLY UPPER DROP --- */}
        <mesh position={[sX1, sY1, (sZ1 + R) / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[r, r, Math.abs(sZ1 + R), 24]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>
        <PipeElbow position={[sX1 - R, sY1, sZ1 + R]} rotation={[-Math.PI / 2, 0, 0]} radius={R} tubeRadius={r} />
        <mesh position={[(sX1 - R + sX2 + R) / 2, sY1, sZ1]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[r, r, Math.abs((sX1 - R) - (sX2 + R)), 24]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>
        <PipeElbow position={[sX2 + R, sY1 - R, sZ1]} rotation={[0, 0, Math.PI / 2]} radius={R} tubeRadius={r} />

        {/* Top Segment down to Gate Valve */}
        <mesh position={[sX2, (sY1 - R + -0.1) / 2, sZ1]}>
          <cylinderGeometry args={[r, r, Math.abs((sY1 - R) - -0.1), 24]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* Upper Service Gate Valve */}
        <IndustrialValve position={[sX2, -0.1, sZ1]} rotation={[Math.PI / 2, 0, 0]} type="gate" />

        {/* Segment between Gate Valve and Control Valve */}
        <mesh position={[sX2, (-0.1 + -0.55) / 2, sZ1]}>
          <cylinderGeometry args={[r, r, Math.abs(-0.1 - -0.55), 24]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* Lower Modulating Control Valve */}
        <IndustrialValve position={[sX2, -0.55, sZ1]} rotation={[Math.PI / 2, 0, 0]} type="control" />

        {/* Vertical Drop down to Branch Level */}
        <mesh position={[sX2, (-0.55 + branchY + R) / 2, sZ1]}>
          <cylinderGeometry args={[r, r, Math.abs(-0.55 - (branchY + R)), 24]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* Elbow turning Supply Drop forward (+Z) toward Main Branch line */}
        <PipeElbow position={[sX2, branchY + R, sZ1 + R]} rotation={[0, -Math.PI / 2, Math.PI]} radius={R} tubeRadius={r} />

        {/* Horizontal Z-Axis Tie-in Pipe */}
        <mesh position={[sX2, branchY, (sZ1 + R + mainZ1 - R) / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[r, r, Math.abs((sZ1 + R) - (mainZ1 - R)), 24]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* TIE-IN ELBOW FOR MAIN LINE 1: Fixed rotation to turn cleanly from Z into X */}
        <PipeElbow position={[sX2 + R, branchY, mainZ1 - R]} rotation={[Math.PI / 2, 0, Math.PI / 2]} radius={R} tubeRadius={r} />


        {/* --- RETURN UPPER DROP --- */}
        {/* 1. Horizontal Z-Axis Pipe coming out from the penthouse coil */}
        <mesh position={[rX1, rY1, (0 + (rZ1 + R)) / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[r, r, Math.abs(rZ1 + R), 24]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>
        <PipeElbow position={[rX1 - R, rY1, rZ1 + R]} rotation={[-Math.PI / 2, 0, 0]} radius={R} tubeRadius={r} />
        <mesh position={[(rX1 - R + rX2 + R) / 2, rY1, rZ1]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[r, r, Math.abs((rX1 - R) - (rX2 + R)), 24]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>
        <PipeElbow position={[rX2 + R, rY1 - R, rZ1]} rotation={[0, 0, Math.PI / 2]} radius={R} tubeRadius={r} />

        {/* Top Segment down to Gate Valve */}
        <mesh position={[rX2, (rY1 - R + -0.3) / 2, rZ1]}>
          <cylinderGeometry args={[r, r, Math.abs((rY1 - R) - -0.3), 24]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* Upper Service Gate Valve */}
        <IndustrialValve position={[rX2, -0.3, rZ1]} rotation={[Math.PI / 2, 0, 0]} type="gate" />

        {/* Segment between Gate Valve and Control Valve */}
        <mesh position={[rX2, (-0.3 + -0.7) / 2, rZ1]}>
          <cylinderGeometry args={[r, r, Math.abs(-0.3 - -0.7), 24]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* Lower Modulating Control Valve */}
        <IndustrialValve position={[rX2, -0.7, rZ1]} rotation={[Math.PI / 2, 0, 0]} type="control" />

        {/* Lower Drop Segment Cutoff */}
        <mesh position={[rX2, (-0.7 + -2.0) / 2, rZ1]}>
          <cylinderGeometry args={[r, r, Math.abs(-0.7 - -2.0), 24]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 2. MAIN LINE 1 (SUPPLY - UNTOUCHED) */}
      {/* ========================================================================= */}
      <group>
        {/* 16" Main Header */}
        <mesh position={[mainCenterX, mainY, mainZ1]} rotation={[0, 0, Math.PI / 2]}>
           <cylinderGeometry args={[mainR, mainR, mainLength, 24]} />
           <XRayPipeMaterial />
           <Edges color={COLOR_EDGE} threshold={10} />
        </mesh>
        
        {/* Weld Flanges at Main Header Ends */}
        {[mainStartX, mainEndX].map((x, i) => (
          <mesh key={`iso-flange1-${i}`} position={[x, mainY, mainZ1]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[mainR + 0.05, mainR + 0.05, 0.06, 32]} />
            <XRayPipeMaterial />
            <Edges color={COLOR_EDGE} threshold={10} />
          </mesh>
        ))}

        {/* Welded Reducer Tee into Main Header */}
        <mesh position={[riserX, mainY + mainR / 2 + 0.05, mainZ1]}>
          <cylinderGeometry args={[r * 1.5, r, 0.12, 24]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* Vertical Riser UP from Main Header */}
        <mesh position={[riserX, (mainY + mainR + branchY - R) / 2, mainZ1]}>
          <cylinderGeometry args={[r, r, Math.abs((branchY - R) - (mainY + mainR)), 24]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* Elbow turning LEFT (-X) into Horizontal Branch */}
        <PipeElbow position={[riserX - R, branchY - R, mainZ1]} rotation={[0, 0, 0]} radius={R} tubeRadius={r} />

        {/* Horizontal Branch Segment 1 (To Tee 1) */}
        <mesh position={[(riserX - R + tee1X) / 2, branchY, mainZ1]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[r, r, Math.abs((riserX - R) - tee1X), 24]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* Bypass Tee 1 */}
        <mesh position={[tee1X, branchY, mainZ1]}>
          <sphereGeometry args={[r + 0.01, 24, 24]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* Horizontal Branch Segment 2 (Between Tees) */}
        <mesh position={[(tee1X + tee2X) / 2, branchY, mainZ1]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[r, r, Math.abs(tee1X - tee2X), 24]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* Bypass Tee 2 */}
        <mesh position={[tee2X, branchY, mainZ1]}>
          <sphereGeometry args={[r + 0.01, 24, 24]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* Horizontal Branch Segment 3 (To Gate Valve) */}
        <mesh position={[(tee2X + -1.8) / 2, branchY, mainZ1]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[r, r, Math.abs(tee2X - -1.8), 24]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* Horizontal Branch Gate Valve (Handwheel facing OUTWARD -Z) */}
        <IndustrialValve position={[-1.8, branchY, mainZ1]} rotation={[Math.PI / 2, -Math.PI / 2, 0]} type="gate" />

        {/* Horizontal Branch Segment 4 (From Valve to Drop Tie-In) */}
        <mesh position={[(-1.8 + (branchEndX + R)) / 2, branchY, mainZ1]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[r, r, Math.abs(-1.8 - (branchEndX + R)), 24]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* INVERTED U-BYPASS LOOP LINE 1 */}
        <group>
          {/* Loop Riser UP (Right Leg) */}
          <mesh position={[tee1X, (branchY + -3.15) / 2, mainZ1]}>
            <cylinderGeometry args={[r, r, Math.abs(branchY - -3.15), 24]} />
            <XRayPipeMaterial />
            <Edges color={COLOR_EDGE} />
          </mesh>
          <IndustrialValve position={[tee1X, -3.15, mainZ1]} rotation={[Math.PI / 2, 0, 0]} type="gate" />
          <mesh position={[tee1X, (-3.15 + bypassY - R) / 2, mainZ1]}>
            <cylinderGeometry args={[r, r, Math.abs(-3.15 - (bypassY - R)), 24]} />
            <XRayPipeMaterial />
            <Edges color={COLOR_EDGE} />
          </mesh>

          {/* Top Horizontal Bypass */}
          <PipeElbow position={[tee1X - R, bypassY - R, mainZ1]} rotation={[0, 0, 0]} radius={R} tubeRadius={r} />
          <mesh position={[(tee1X - R + -0.7) / 2, bypassY, mainZ1]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[r, r, Math.abs((tee1X - R) - -0.7), 24]} />
            <XRayPipeMaterial />
            <Edges color={COLOR_EDGE} />
          </mesh>
          <IndustrialValve position={[-0.7, bypassY, mainZ1]} rotation={[0, Math.PI / 2, Math.PI]} type="control" />
          <mesh position={[(-0.7 + tee2X + R) / 2, bypassY, mainZ1]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[r, r, Math.abs(-0.7 - (tee2X + R)), 24]} />
            <XRayPipeMaterial />
            <Edges color={COLOR_EDGE} />
          </mesh>
          <PipeElbow position={[tee2X + R, bypassY - R, mainZ1]} rotation={[0, 0, Math.PI / 2]} radius={R} tubeRadius={r} />

          {/* Loop Drop DOWN (Left Leg) */}
          <mesh position={[tee2X, (bypassY - R + -3.15) / 2, mainZ1]}>
            <cylinderGeometry args={[r, r, Math.abs((bypassY - R) - -3.15), 24]} />
            <XRayPipeMaterial />
            <Edges color={COLOR_EDGE} />
          </mesh>
          <IndustrialValve position={[tee2X, -3.15, mainZ1]} rotation={[Math.PI / 2, 0, 0]} type="gate" />
          <mesh position={[tee2X, (-3.15 + branchY) / 2, mainZ1]}>
            <cylinderGeometry args={[r, r, Math.abs(-3.15 - branchY), 24]} />
            <XRayPipeMaterial />
            <Edges color={COLOR_EDGE} />
          </mesh>
        </group>
      </group>

      {/* ========================================================================= */}
      {/* 3. SECOND MAIN LINE ASSEMBLY (Wrapped in a Parent Offset Group) */}
      {/* ========================================================================= */}
      <group position={[.5, 0, 1.5]}>
        {/* 16" Main Header #2 */}
        <mesh position={[mainCenterX, mainY, mainZ1]} rotation={[0, 0, Math.PI / 2]}>
           <cylinderGeometry args={[mainR, mainR, mainLength, 24]} />
           <XRayPipeMaterial />
           <Edges color={COLOR_EDGE} threshold={10} />
        </mesh>
        
        {/* Weld Flanges at Main Header Ends */}
        {[mainStartX, mainEndX].map((x, i) => (
          <mesh key={`iso-flange2-${i}`} position={[x, mainY, mainZ1]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[mainR + 0.05, mainR + 0.05, 0.06, 32]} />
            <XRayPipeMaterial />
            <Edges color={COLOR_EDGE} threshold={10} />
          </mesh>
        ))}

        {/* Welded Reducer Tee into Main Header */}
        <mesh position={[riserX, mainY + mainR / 2 + 0.05, mainZ1]}>
          <cylinderGeometry args={[r * 1.5, r, 0.12, 24]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* Vertical Riser UP from Main Header */}
        <mesh position={[riserX, (mainY + mainR + branchY - R) / 2, mainZ1]}>
          <cylinderGeometry args={[r, r, Math.abs((branchY - R) - (mainY + mainR)), 24]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* Elbow turning LEFT (-X) into Horizontal Branch */}
        <PipeElbow position={[riserX - R, branchY - R, mainZ1]} rotation={[0, 0, 0]} radius={R} tubeRadius={r} />

        {/* Horizontal Branch Segment 1 (To Tee 1) */}
        <mesh position={[(riserX - R + tee1X) / 2, branchY, mainZ1]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[r, r, Math.abs((riserX - R) - tee1X), 24]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* Bypass Tee 1 */}
        <mesh position={[tee1X, branchY, mainZ1]}>
          <sphereGeometry args={[r + 0.01, 24, 24]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* Horizontal Branch Segment 2 (Between Tees) */}
        <mesh position={[(tee1X + tee2X) / 2, branchY, mainZ1]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[r, r, Math.abs(tee1X - tee2X), 24]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* Bypass Tee 2 */}
        <mesh position={[tee2X, branchY, mainZ1]}>
          <sphereGeometry args={[r + 0.01, 24, 24]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* Horizontal Branch Segment 3 (To Gate Valve) */}
        <mesh position={[(tee2X + -1.8) / 2, branchY, mainZ1]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[r, r, Math.abs(tee2X - -1.8), 24]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* Horizontal Branch Gate Valve (Handwheel facing REAR +Z) */}
        <IndustrialValve position={[-1.8, branchY, mainZ1]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]} type="gate" />

        {/* Horizontal Branch Segment 4: Trimmed flush to the new elbow inlet at local X = -2.55 */}
        <mesh position={[(-1.8 + (-2.7 + R)) / 2, branchY, mainZ1]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[r, r, Math.abs(-1.8 - (-2.7 + R)), 24]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* ========================================================================= */}
        {/* RETURN LINE TIE-IN RUN TO UPPER RETURN DROP (FULLY ALIGNED MATH)          */}
        {/* ========================================================================= */}
        
        {/* 1. FIRST ELBOW: Turns horizontal branch (-X) straight UP (+Y) */}
        <PipeElbow 
          position={[-2.7 + R, branchY + R, mainZ1]} 
          rotation={[0, 0, Math.PI]} 
          radius={R} 
          tubeRadius={r} 
        />

        {/* 2. VERTICAL RISER PIPE 1: Climbs up to cross over Line 1 safely */}
        <mesh 
          position={[-2.7, branchY + 0.25, mainZ1]}
        >
          <cylinderGeometry args={[r, r, Math.abs(0.5 - 2 * R), 24]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* 3. SECOND ELBOW: Turns from UP (+Y) to BACK (-Z) */}
        <PipeElbow 
          position={[-2.7, branchY + 0.5 - R, mainZ1 - R]} 
          rotation={[0, -Math.PI / 2, 0]} 
          radius={R} 
          tubeRadius={r} 
        />

        {/* 4. HORIZONTAL Z-BRIDGE PIPE: Spans back into alignment with Return Drop depth */}
        <mesh 
          position={[-2.7, branchY + 0.5, (mainZ1 - R + -3.35 + R) / 2]} 
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[r, r, Math.abs((mainZ1 - R) - (-3.35 + R)), 24]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* 5. THIRD ELBOW (YOUR LOCKED-IN WORKING ELBOW) */}
        <PipeElbow 
          position={[-2.7, branchY + 0.65, -3.35 + R]} 
          rotation={[Math.PI / 1, -Math.PI / 2, 0]} 
          radius={R} 
          tubeRadius={r} 
        />

        {/* 6. FINAL VERTICAL RISER: Connects perfectly flush to the Return Drop Cutoff */}
        <mesh 
          position={[-2.7, (branchY + 0.5 + R + -2.0) / 2, -3.35]}
        >
          <cylinderGeometry args={[r, r, Math.abs((branchY + 0.5 + R) - -2.0), 24]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>

        {/* INVERTED U-BYPASS LOOP LINE 2 (REVERSED VALVES) */}
        <group>
          {/* Loop Riser UP (Right Leg) */}
          <mesh position={[tee1X, (branchY + -3.15) / 2, mainZ1]}>
            <cylinderGeometry args={[r, r, Math.abs(branchY - -3.15), 24]} />
            <XRayPipeMaterial />
            <Edges color={COLOR_EDGE} />
          </mesh>
          {/* Right Leg Gate Valve (Handwheel facing REAR +Z) */}
          <IndustrialValve position={[tee1X, -3.15, mainZ1]} rotation={[-Math.PI / 2, 0, 0]} type="gate" />
          <mesh position={[tee1X, (-3.15 + bypassY - R) / 2, mainZ1]}>
            <cylinderGeometry args={[r, r, Math.abs(-3.15 - (bypassY - R)), 24]} />
            <XRayPipeMaterial />
            <Edges color={COLOR_EDGE} />
          </mesh>

          {/* Top Horizontal Bypass */}
          <PipeElbow position={[tee1X - R, bypassY - R, mainZ1]} rotation={[0, 0, 0]} radius={R} tubeRadius={r} />
          <mesh position={[(tee1X - R + -0.7) / 2, bypassY, mainZ1]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[r, r, Math.abs((tee1X - R) - -0.7), 24]} />
            <XRayPipeMaterial />
            <Edges color={COLOR_EDGE} />
          </mesh>
          {/* Control Valve (Actuator facing UP +Y) */}
          <IndustrialValve position={[-0.7, bypassY, mainZ1]} rotation={[0, Math.PI / 2, Math.PI]} type="control" />
          <mesh position={[(-0.7 + tee2X + R) / 2, bypassY, mainZ1]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[r, r, Math.abs(-0.7 - (tee2X + R)), 24]} />
            <XRayPipeMaterial />
            <Edges color={COLOR_EDGE} />
          </mesh>
          <PipeElbow position={[tee2X + R, bypassY - R, mainZ1]} rotation={[0, 0, Math.PI / 2]} radius={R} tubeRadius={r} />

          {/* Loop Drop DOWN (Left Leg) */}
          <mesh position={[tee2X, (bypassY - R + -3.15) / 2, mainZ1]}>
            <cylinderGeometry args={[r, r, Math.abs((bypassY - R) - -3.15), 24]} />
            <XRayPipeMaterial />
            <Edges color={COLOR_EDGE} />
          </mesh>
          {/* Left Leg Gate Valve (Handwheel facing REAR +Z) */}
          <IndustrialValve position={[tee2X, -3.15, mainZ1]} rotation={[-Math.PI / 2, 0, 0]} type="gate" />
          <mesh position={[tee2X, (-3.15 + branchY) / 2, mainZ1]}>
            <cylinderGeometry args={[r, r, Math.abs(-3.15 - branchY), 24]} />
            <XRayPipeMaterial />
            <Edges color={COLOR_EDGE} />
          </mesh>
        </group>
      </group>

      {/* ============================================================================ */}
      {/* --- INLINED COLD WATER SUPPLY CORE (FULL CONTINUOUS FLOW: MAIN TO COIL) --- */}
      {/* ============================================================================ */}
      {(() => {
        const matRef = useRef<THREE.ShaderMaterial>(null);

        useFrame((state) => {
          if (matRef.current) {
            matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
          }
        });

        // ONE unbroken continuous path starting from the main header tee up to the coil
        const path = useMemo(() => {
          const p = new THREE.CurvePath<THREE.Vector3>();

          // 1. Vertical Riser UP from Main Header
          p.add(new THREE.LineCurve3(
            new THREE.Vector3(riserX, mainY + mainR, mainZ1),
            new THREE.Vector3(riserX, branchY - R, mainZ1)
          ));

          // 2. Riser Elbow Arc: Turn UP (+Y) -> LEFT (-X) into Horizontal Branch
          p.add(new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(riserX, branchY - R, mainZ1),
            new THREE.Vector3(riserX, branchY, mainZ1),
            new THREE.Vector3(riserX - R, branchY, mainZ1)
          ));

          // 3. Horizontal Branch Run (-X toward sX2)
          p.add(new THREE.LineCurve3(
            new THREE.Vector3(riserX - R, branchY, mainZ1),
            new THREE.Vector3(sX2 + R, branchY, mainZ1)
          ));

          // 4. Elbow: Turn -X -> -Z
          p.add(new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(sX2 + R, branchY, mainZ1),
            new THREE.Vector3(sX2, branchY, mainZ1),
            new THREE.Vector3(sX2, branchY, mainZ1 - R)
          ));

          // 5. Lower Z-Axis Bridge
          p.add(new THREE.LineCurve3(
            new THREE.Vector3(sX2, branchY, mainZ1 - R),
            new THREE.Vector3(sX2, branchY, sZ1 + R)
          ));

          // 6. Elbow: Turn -Z -> +Y (Up)
          p.add(new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(sX2, branchY, sZ1 + R),
            new THREE.Vector3(sX2, branchY, sZ1),
            new THREE.Vector3(sX2, branchY + R, sZ1)
          ));

          // 7. Main Vertical Riser
          p.add(new THREE.LineCurve3(
            new THREE.Vector3(sX2, branchY + R, sZ1),
            new THREE.Vector3(sX2, sY1 - R, sZ1)
          ));

          // 8. Elbow: Turn +Y -> +X
          p.add(new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(sX2, sY1 - R, sZ1),
            new THREE.Vector3(sX2, sY1, sZ1),
            new THREE.Vector3(sX2 + R, sY1, sZ1)
          ));

          // 9. Top Horizontal Cross Bridge
          p.add(new THREE.LineCurve3(
            new THREE.Vector3(sX2 + R, sY1, sZ1),
            new THREE.Vector3(sX1 - R, sY1, sZ1)
          ));

          // 10. Elbow: Turn +X -> -Z (Into Coil)
          p.add(new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(sX1 - R, sY1, sZ1),
            new THREE.Vector3(sX1, sY1, sZ1),
            new THREE.Vector3(sX1, sY1, sZ1 + R)
          ));

          // 11. Final Connection into Penthouse Coil
          p.add(new THREE.LineCurve3(
            new THREE.Vector3(sX1, sY1, sZ1 + R),
            new THREE.Vector3(sX1, sY1, (sZ1 + R) / 2)
          ));

          return p;
        }, [riserX, mainY, mainR, mainZ1, branchY, R, sX2, sY1, sZ1, sX1]);

        return (
          <group name="cold-water-supply-core">
            <mesh renderOrder={10}>
              <tubeGeometry args={[path, 384, 0.032, 16, false]} />
              <shaderMaterial
                ref={matRef}
                transparent={true}
                depthTest={true}
                depthWrite={false}
                polygonOffset={true}
                polygonOffsetFactor={-10}
                polygonOffsetUnits={-10}
                blending={THREE.AdditiveBlending}
                uniforms={{
                  uTime: { value: 0 },
                  uColorCore: { value: new THREE.Color("#00e1ff") },
                  uColorGlow: { value: new THREE.Color("#0011bb") },
                }}
                vertexShader={`
                  varying vec2 vUv;
                  void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                  }
                `}
                fragmentShader={`
                  uniform float uTime;
                  uniform vec3 uColorCore;
                  uniform vec3 uColorGlow;
                  varying vec2 vUv;

                  void main() {
                    float wave = sin(vUv.x * 140.0 - uTime * 2.5) * 0.5 + 0.5;
                    float pulse = pow(wave, 3.0);
                    float edge = sin(vUv.y * 3.14159);

                    vec3 color = mix(uColorGlow, uColorCore, pulse) * 3.0;
                    float alpha = (pulse * 0.75 + 0.25) * edge;

                    gl_FragColor = vec4(color, alpha);
                  }
                `}
              />
            </mesh>
          </group>
        );
      })()}

      {/* ============================================================================ */}
      {/* --- MAIN HEADER WATER SUPPLY CORE (EXACT PARAMETER MATCH: -4.5 TO 1.8) --- */}
      {/* ============================================================================ */}
      {(() => {
        const matRef = useRef<THREE.ShaderMaterial>(null);

        useFrame((state) => {
          if (matRef.current) {
            matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
          }
        });

        const fullHeaderPath = useMemo(() => {
          const p = new THREE.CurvePath<THREE.Vector3>();
          p.add(new THREE.LineCurve3(
            new THREE.Vector3(mainEndX, mainY, mainZ1),   // 1.8 (Right Flange)
            new THREE.Vector3(mainStartX, mainY, mainZ1)  // -4.5 (Left Flange)
          ));
          return p;
        }, [mainEndX, mainStartX, mainY, mainZ1]);

        return (
          <group name="main-header-water-core">
            <mesh renderOrder={10}>
              <tubeGeometry args={[fullHeaderPath, 256, 0.18, 24, false]} />
              <shaderMaterial
                ref={matRef}
                transparent={true}
                depthTest={true}
                depthWrite={false}
                polygonOffset={true}
                polygonOffsetFactor={-10}
                polygonOffsetUnits={-10}
                blending={THREE.AdditiveBlending}
                uniforms={{
                  uTime: { value: 0 },
                  uColorCore: { value: new THREE.Color("#00e1ff") },
                  uColorGlow: { value: new THREE.Color("#0011bb") },
                }}
                vertexShader={`
                  varying vec2 vUv;
                  void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                  }
                `}
                fragmentShader={`
                  uniform float uTime;
                  uniform vec3 uColorCore;
                  uniform vec3 uColorGlow;
                  varying vec2 vUv;

                  void main() {
                    float streak1 = sin(vUv.x * 60.0 + uTime * 1.8) * 0.5 + 0.5;
                    float streak2 = sin(vUv.x * 110.0 + uTime * 3.0 + vUv.y * 6.28) * 0.5 + 0.5;
                    float flow = pow(mix(streak1, streak2, 0.5), 2.0);

                    float edge = sin(vUv.y * 3.14159);

                    vec3 color = mix(uColorGlow, uColorCore, flow) * 3.0;
                    float alpha = (flow * 0.75 + 0.3) * edge;

                    gl_FragColor = vec4(color, alpha);
                  }
                `}
              />
            </mesh>
          </group>
        );
      })()}

      {/* ============================================================================ */}
      {/* --- BYPASS LOOP WATER SUPPLY CORE (TEE 1 -> LOOP TOP -> TEE 2) --- */}
      {/* ============================================================================ */}
      {(() => {
        const matRef = useRef<THREE.ShaderMaterial>(null);

        useFrame((state) => {
          if (matRef.current) {
            matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
          }
        });

        const bypassPath = useMemo(() => {
          const p = new THREE.CurvePath<THREE.Vector3>();

          p.add(new THREE.LineCurve3(
            new THREE.Vector3(tee1X, branchY, mainZ1),
            new THREE.Vector3(tee1X, bypassY - R, mainZ1)
          ));

          p.add(new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(tee1X, bypassY - R, mainZ1),
            new THREE.Vector3(tee1X, bypassY, mainZ1),
            new THREE.Vector3(tee1X - R, bypassY, mainZ1)
          ));

          p.add(new THREE.LineCurve3(
            new THREE.Vector3(tee1X - R, bypassY, mainZ1),
            new THREE.Vector3(tee2X + R, bypassY, mainZ1)
          ));

          p.add(new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(tee2X + R, bypassY, mainZ1),
            new THREE.Vector3(tee2X, bypassY, mainZ1),
            new THREE.Vector3(tee2X, bypassY - R, mainZ1)
          ));

          p.add(new THREE.LineCurve3(
            new THREE.Vector3(tee2X, bypassY - R, mainZ1),
            new THREE.Vector3(tee2X, branchY, mainZ1)
          ));

          return p;
        }, [tee1X, branchY, mainZ1, bypassY, R, tee2X]);

        return (
          <group name="bypass-loop-water-core">
            <mesh renderOrder={10}>
              <tubeGeometry args={[bypassPath, 128, 0.032, 16, false]} />
              <shaderMaterial
                ref={matRef}
                transparent={true}
                depthTest={true}
                depthWrite={false}
                polygonOffset={true}
                polygonOffsetFactor={-10}
                polygonOffsetUnits={-10}
                blending={THREE.AdditiveBlending}
                uniforms={{
                  uTime: { value: 0 },
                  uColorCore: { value: new THREE.Color("#00e1ff") },
                  uColorGlow: { value: new THREE.Color("#0011bb") },
                }}
                vertexShader={`
                  varying vec2 vUv;
                  void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                  }
                `}
                fragmentShader={`
                  uniform float uTime;
                  uniform vec3 uColorCore;
                  uniform vec3 uColorGlow;
                  varying vec2 vUv;

                  void main() {
                    float wave = sin(vUv.x * 120.0 - uTime * 2.5) * 0.5 + 0.5;
                    float pulse = pow(wave, 3.0);
                    float edge = sin(vUv.y * 3.14159);

                    vec3 color = mix(uColorGlow, uColorCore, pulse) * 3.0;
                    float alpha = (pulse * 0.75 + 0.25) * edge;

                    gl_FragColor = vec4(color, alpha);
                  }
                `}
              />
            </mesh>
          </group>
        );
      })()}

      {/* ============================================================================ */}
      {/* --- HOT WATER RETURN CORE 1: BALANCED VIBRANT CRIMSON GLOW --- */}
      {/* ============================================================================ */}
      {(() => {
        const matRef = useRef<THREE.ShaderMaterial>(null);

        useFrame((state) => {
          if (matRef.current) {
            matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
          }
        });

        const returnPath = useMemo(() => {
          const p = new THREE.CurvePath<THREE.Vector3>();

          p.add(new THREE.LineCurve3(
            new THREE.Vector3(rX1, rY1, (rZ1 + R) / 2),
            new THREE.Vector3(rX1, rY1, rZ1 + R)
          ));

          p.add(new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(rX1, rY1, rZ1 + R),
            new THREE.Vector3(rX1, rY1, rZ1),
            new THREE.Vector3(rX1 - R, rY1, rZ1)
          ));

          p.add(new THREE.LineCurve3(
            new THREE.Vector3(rX1 - R, rY1, rZ1),
            new THREE.Vector3(rX2 + R, rY1, rZ1)
          ));

          p.add(new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(rX2 + R, rY1, rZ1),
            new THREE.Vector3(rX2, rY1, rZ1),
            new THREE.Vector3(rX2, rY1 - R, rZ1)
          ));

          p.add(new THREE.LineCurve3(
            new THREE.Vector3(rX2, rY1 - R, rZ1),
            new THREE.Vector3(rX2, -2.0, rZ1)
          ));

          p.add(new THREE.LineCurve3(
            new THREE.Vector3(rX2, -2.0, rZ1),
            new THREE.Vector3(rX2, branchY + 0.5 + R, rZ1)
          ));

          p.add(new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(rX2, branchY + 0.5 + R, rZ1),
            new THREE.Vector3(rX2, branchY + 0.5, rZ1),
            new THREE.Vector3(rX2, branchY + 0.5, rZ1 + R)
          ));

          p.add(new THREE.LineCurve3(
            new THREE.Vector3(rX2, branchY + 0.5, rZ1 + R),
            new THREE.Vector3(rX2, branchY + 0.5, mainZ1 + 1.5 - R)
          ));

          p.add(new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(rX2, branchY + 0.5, mainZ1 + 1.5 - R),
            new THREE.Vector3(rX2, branchY + 0.5, mainZ1 + 1.5),
            new THREE.Vector3(rX2, branchY + 0.5 - R, mainZ1 + 1.5)
          ));

          p.add(new THREE.LineCurve3(
            new THREE.Vector3(rX2, branchY + 0.5 - R, mainZ1 + 1.5),
            new THREE.Vector3(rX2, branchY + R, mainZ1 + 1.5)
          ));

          p.add(new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(rX2, branchY + R, mainZ1 + 1.5),
            new THREE.Vector3(rX2, branchY, mainZ1 + 1.5),
            new THREE.Vector3(rX2 + R, branchY, mainZ1 + 1.5)
          ));

          p.add(new THREE.LineCurve3(
            new THREE.Vector3(rX2 + R, branchY, mainZ1 + 1.5),
            new THREE.Vector3((riserX + 0.5) - R, branchY, mainZ1 + 1.5)
          ));

          p.add(new THREE.QuadraticBezierCurve3(
            new THREE.Vector3((riserX + 0.5) - R, branchY, mainZ1 + 1.5),
            new THREE.Vector3(riserX + 0.5, branchY, mainZ1 + 1.5),
            new THREE.Vector3(riserX + 0.5, branchY - R, mainZ1 + 1.5)
          ));

          p.add(new THREE.LineCurve3(
            new THREE.Vector3(riserX + 0.5, branchY - R, mainZ1 + 1.5),
            new THREE.Vector3(riserX + 0.5, mainY + mainR, mainZ1 + 1.5)
          ));

          return p;
        }, [rX1, rY1, rZ1, R, rX2, branchY, mainZ1, riserX, mainY, mainR]);

        return (
          <group name="hot-water-return-core">
            <mesh renderOrder={10}>
              <tubeGeometry args={[returnPath, 384, 0.032, 16, false]} />
              <shaderMaterial
                ref={matRef}
                transparent={true}
                depthTest={true}
                depthWrite={false}
                polygonOffset={true}
                polygonOffsetFactor={-10}
                polygonOffsetUnits={-10}
                blending={THREE.AdditiveBlending}
                uniforms={{
                  uTime: { value: 0 },
                  uColorCore: { value: new THREE.Color("#cc0000") }, // Rich Deep Crimson
                  uColorGlow: { value: new THREE.Color("#220000") }, // Shadow Maroon Base
                }}
                vertexShader={`
                  varying vec2 vUv;
                  void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                  }
                `}
                fragmentShader={`
                  uniform float uTime;
                  uniform vec3 uColorCore;
                  uniform vec3 uColorGlow;
                  varying vec2 vUv;

                  void main() {
                    float wave = sin(vUv.x * 140.0 - uTime * 2.5) * 0.5 + 0.5;
                    float pulse = pow(wave, 2.5);
                    float edge = sin(vUv.y * 3.14159);

                    vec3 color = mix(uColorGlow, uColorCore, pulse) * 3.0;
                    float alpha = (pulse * 0.75 + 0.25) * edge;

                    gl_FragColor = vec4(color, alpha);
                  }
                `}
              />
            </mesh>
          </group>
        );
      })()}

      {/* ============================================================================ */}
      {/* --- HOT WATER SECOND MAIN HEADER CORE --- */}
      {/* ============================================================================ */}
      {(() => {
        const matRef = useRef<THREE.ShaderMaterial>(null);

        useFrame((state) => {
          if (matRef.current) {
            matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
          }
        });

        const fullHeaderPath2 = useMemo(() => {
          const p = new THREE.CurvePath<THREE.Vector3>();
          p.add(new THREE.LineCurve3(
            new THREE.Vector3(mainStartX, mainY, mainZ1),
            new THREE.Vector3(mainEndX, mainY, mainZ1)
          ));
          return p;
        }, [mainStartX, mainEndX, mainY, mainZ1]);

        return (
          <group name="main-header-2-hot-water-core" position={[0.5, 0, 1.5]}>
            <mesh renderOrder={10}>
              <tubeGeometry args={[fullHeaderPath2, 256, 0.18, 24, false]} />
              <shaderMaterial
                ref={matRef}
                transparent={true}
                depthTest={true}
                depthWrite={false}
                polygonOffset={true}
                polygonOffsetFactor={-10}
                polygonOffsetUnits={-10}
                blending={THREE.AdditiveBlending}
                uniforms={{
                  uTime: { value: 0 },
                  uColorCore: { value: new THREE.Color("#cc0000") },
                  uColorGlow: { value: new THREE.Color("#220000") },
                }}
                vertexShader={`
                  varying vec2 vUv;
                  void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                  }
                `}
                fragmentShader={`
                  uniform float uTime;
                  uniform vec3 uColorCore;
                  uniform vec3 uColorGlow;
                  varying vec2 vUv;

                  void main() {
                    float streak1 = sin(vUv.x * 60.0 + uTime * 1.8) * 0.5 + 0.5;
                    float streak2 = sin(vUv.x * 110.0 + uTime * 3.0 + vUv.y * 6.28) * 0.5 + 0.5;
                    float flow = pow(mix(streak1, streak2, 0.5), 2.0);

                    float edge = sin(vUv.y * 3.14159);

                    vec3 color = mix(uColorGlow, uColorCore, flow) * 3.0;
                    float alpha = (flow * 0.75 + 0.3) * edge;

                    gl_FragColor = vec4(color, alpha);
                  }
                `}
              />
            </mesh>
          </group>
        );
      })()}

      {/* ============================================================================ */}
      {/* --- SECOND LINE BYPASS LOOP HOT WATER CORE --- */}
      {/* ============================================================================ */}
      {(() => {
        const matRef = useRef<THREE.ShaderMaterial>(null);

        useFrame((state) => {
          if (matRef.current) {
            matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
          }
        });

        const bypassPath2 = useMemo(() => {
          const p = new THREE.CurvePath<THREE.Vector3>();

          p.add(new THREE.LineCurve3(
            new THREE.Vector3(tee2X, branchY, mainZ1),
            new THREE.Vector3(tee2X, bypassY - R, mainZ1)
          ));

          p.add(new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(tee2X, bypassY - R, mainZ1),
            new THREE.Vector3(tee2X, bypassY, mainZ1),
            new THREE.Vector3(tee2X + R, bypassY, mainZ1)
          ));

          p.add(new THREE.LineCurve3(
            new THREE.Vector3(tee2X + R, bypassY, mainZ1),
            new THREE.Vector3(tee1X - R, bypassY, mainZ1)
          ));

          p.add(new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(tee1X - R, bypassY, mainZ1),
            new THREE.Vector3(tee1X, bypassY, mainZ1),
            new THREE.Vector3(tee1X, bypassY - R, mainZ1)
          ));

          p.add(new THREE.LineCurve3(
            new THREE.Vector3(tee1X, bypassY - R, mainZ1),
            new THREE.Vector3(tee1X, branchY, mainZ1)
          ));

          return p;
        }, [tee2X, branchY, mainZ1, bypassY, R, tee1X]);

        return (
          <group name="bypass-loop-2-hot-water-core" position={[0.5, 0, 1.5]}>
            <mesh renderOrder={10}>
              <tubeGeometry args={[bypassPath2, 128, 0.032, 16, false]} />
              <shaderMaterial
                ref={matRef}
                transparent={true}
                depthTest={true}
                depthWrite={false}
                polygonOffset={true}
                polygonOffsetFactor={-10}
                polygonOffsetUnits={-10}
                blending={THREE.AdditiveBlending}
                uniforms={{
                  uTime: { value: 0 },
                  uColorCore: { value: new THREE.Color("#cc0000") },
                  uColorGlow: { value: new THREE.Color("#220000") },
                }}
                vertexShader={`
                  varying vec2 vUv;
                  void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                  }
                `}
                fragmentShader={`
                  uniform float uTime;
                  uniform vec3 uColorCore;
                  uniform vec3 uColorGlow;
                  varying vec2 vUv;

                  void main() {
                    float wave = sin(vUv.x * 120.0 - uTime * 2.5) * 0.5 + 0.5;
                    float pulse = pow(wave, 2.5);
                    float edge = sin(vUv.y * 3.14159);

                    vec3 color = mix(uColorGlow, uColorCore, pulse) * 3.0;
                    float alpha = (pulse * 0.75 + 0.25) * edge;

                    gl_FragColor = vec4(color, alpha);
                  }
                `}
              />
            </mesh>
          </group>
        );
      })()}

    </group>
  );
}