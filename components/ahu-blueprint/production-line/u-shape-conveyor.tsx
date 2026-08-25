import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import { COLOR_EDGE, AirHandlerCasingMaterial, MachineCasingMaterial, XRayPipeMaterial } from '../shared/materials';

// ============================================================================
// --- PHYSICAL CONVEYOR STRUCTURE ---
// ============================================================================
export function UShapeConveyorFrame({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  return (
    <group position={position} name="u-conveyor-frame">
      <mesh position={[0.5, -0.05, 0.6]}><boxGeometry args={[8.0, 0.1, 0.4]} /><AirHandlerCasingMaterial /><Edges color={COLOR_EDGE} /></mesh>
      <mesh position={[0.5, -0.05, -0.6]}><boxGeometry args={[8.0, 0.1, 0.4]} /><AirHandlerCasingMaterial /><Edges color={COLOR_EDGE} /></mesh>
      <mesh position={[4.5, -0.05, 0]} rotation={[Math.PI / 2, 0, -Math.PI / 2]} scale={[1, 1, 0.25]}><torusGeometry args={[0.6, 0.2, 8, 32, Math.PI]} /><AirHandlerCasingMaterial /><Edges color={COLOR_EDGE} /></mesh>

      {Array.from({ length: 8 }).map((_, i) => {
        const xPos = -3.0 + i * 1.0;
        return (
          <group key={`leg-pair-${i}`}>
            <mesh position={[xPos, -0.4, 0.8]}><cylinderGeometry args={[0.03, 0.03, 0.6, 16]} /><XRayPipeMaterial /><Edges color={COLOR_EDGE} /></mesh>
            <mesh position={[xPos, -0.7, 0.8]}><cylinderGeometry args={[0.06, 0.08, 0.05, 16]} /><XRayPipeMaterial /></mesh>
            <mesh position={[xPos, -0.4, 0.4]}><cylinderGeometry args={[0.03, 0.03, 0.6, 16]} /><XRayPipeMaterial /><Edges color={COLOR_EDGE} /></mesh>
            <mesh position={[xPos, -0.7, 0.4]}><cylinderGeometry args={[0.06, 0.08, 0.05, 16]} /><XRayPipeMaterial /></mesh>
            <mesh position={[xPos, -0.15, 0.6]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.02, 0.02, 0.4, 16]} /><XRayPipeMaterial /></mesh>

            <mesh position={[xPos, -0.4, -0.4]}><cylinderGeometry args={[0.03, 0.03, 0.6, 16]} /><XRayPipeMaterial /><Edges color={COLOR_EDGE} /></mesh>
            <mesh position={[xPos, -0.7, -0.4]}><cylinderGeometry args={[0.06, 0.08, 0.05, 16]} /><XRayPipeMaterial /></mesh>
            <mesh position={[xPos, -0.4, -0.8]}><cylinderGeometry args={[0.03, 0.03, 0.6, 16]} /><XRayPipeMaterial /><Edges color={COLOR_EDGE} /></mesh>
            <mesh position={[xPos, -0.7, -0.8]}><cylinderGeometry args={[0.06, 0.08, 0.05, 16]} /><XRayPipeMaterial /></mesh>
            <mesh position={[xPos, -0.15, -0.6]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.02, 0.02, 0.4, 16]} /><XRayPipeMaterial /></mesh>
          </group>
        );
      })}
      <group position={[5.1, 0, 0]}>
        <mesh position={[0, -0.4, -0.2]}><cylinderGeometry args={[0.03, 0.03, 0.6, 16]} /><XRayPipeMaterial /><Edges color={COLOR_EDGE} /></mesh>
        <mesh position={[0, -0.7, -0.2]}><cylinderGeometry args={[0.06, 0.08, 0.05, 16]} /><XRayPipeMaterial /></mesh>
        <mesh position={[0, -0.4, 0.2]}><cylinderGeometry args={[0.03, 0.03, 0.6, 16]} /><XRayPipeMaterial /><Edges color={COLOR_EDGE} /></mesh>
        <mesh position={[0, -0.7, 0.2]}><cylinderGeometry args={[0.06, 0.08, 0.05, 16]} /><XRayPipeMaterial /></mesh>
        <mesh position={[0, -0.15, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.02, 0.02, 0.4, 16]} /><XRayPipeMaterial /></mesh>
      </group>
    </group>
  );
}

// ============================================================================
// --- DRIVE MOTOR ASSEMBLY (DETAILED) ---
// ============================================================================
export function DriveMotorAssembly({ position }: { position: [number, number, number] }) {
  const driveMotorRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (driveMotorRef.current) {
      // Continuously spin the cross-bar roller and drive shaft
      driveMotorRef.current.rotation.z = state.clock.elapsedTime * -4.0; 
    }
  });

  return (
    <group name="drive-motor-assembly" position={position}>
      
      {/* --- SPINNING COMPONENTS --- */}
      <group ref={driveMotorRef}>
        {/* The Cross-Bar / Conveyor Drive Roller */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.32, 24]} />
          <MachineCasingMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>
        
        {/* Main Drive Shaft connecting roller to gearbox */}
        <mesh position={[0, 0, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.12, 16]} />
          <XRayPipeMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>
      </group>

      {/* --- STATIONARY COMPONENTS --- */}
      {/* Heavy Gearbox / Transmission Housing */}
      <mesh position={[0, 0, 0.25]}>
        <boxGeometry args={[0.18, 0.22, 0.18]} />
        <MachineCasingMaterial />
        <Edges color={COLOR_EDGE} />
      </mesh>

      {/* Main Electric Motor Body */}
      <mesh position={[0, 0, 0.45]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.22, 24]} />
        <MachineCasingMaterial />
        <Edges color={COLOR_EDGE} />
      </mesh>

      {/* Motor Cooling Fins */}
      {[0.38, 0.42, 0.46, 0.50, 0.54].map((z, i) => (
        <mesh key={`motor-fin-${i}`} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.015, 24]} />
          <MachineCasingMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>
      ))}

      {/* Rear Fan Shroud / End Cap */}
      <mesh position={[0, 0, 0.58]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.075, 0.075, 0.04, 24]} />
        <AirHandlerCasingMaterial />
        <Edges color={COLOR_EDGE} />
      </mesh>
      
      {/* Power Junction Box */}
      <mesh position={[0.09, 0.05, 0.45]}>
        <boxGeometry args={[0.06, 0.08, 0.08]} />
        <MachineCasingMaterial />
        <Edges color={COLOR_EDGE} />
      </mesh>
      
    </group>
  );
}