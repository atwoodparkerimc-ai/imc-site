"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function TechnicalNode({ delay = 0, color = "#0088ff" }: { delay?: number, color?: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = (state.clock.getElapsedTime() * 0.1) + delay;
      groupRef.current.rotation.z = state.clock.getElapsedTime() * 0.05;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.2;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y = -(state.clock.getElapsedTime() * 0.15) + delay;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer Cage */}
      <mesh>
        <icosahedronGeometry args={[2.5, 1]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.35} />
      </mesh>
      
      {/* Inner Core */}
      <mesh ref={coreRef}>
        <octahedronGeometry args={[1.2, 0]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.5} />
      </mesh>
      
      {/* Orbiting Red Telemetry Beacon */}
      <mesh position={[2.5, 0, 0]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
    </group>
  );
}