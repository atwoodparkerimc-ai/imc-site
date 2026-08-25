"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// --- THE 3D ANIMATION (Tuned for Crisp White Backdrops) ---
function TechnicalNode({ delay = 0 }: { delay: number }) {
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
      {/* Outer Cage - Slate Gray for high contrast on white */}
      <mesh>
        <icosahedronGeometry args={[2.5, 1]} />
        <meshBasicMaterial color="#334155" wireframe transparent opacity={0.25} />
      </mesh>
      
      {/* Inner Core */}
      <mesh ref={coreRef}>
        <octahedronGeometry args={[1.2, 0]} />
        <meshBasicMaterial color="#475569" wireframe transparent opacity={0.35} />
      </mesh>
      
      {/* Orbiting Red Telemetry Beacon */}
      <mesh position={[2.5, 0, 0]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshBasicMaterial color="#dc2626" />
      </mesh>
    </group>
  );
}

// --- THE UI WRAPPER ---
export default function GlanceMetricAnimation({ value, label, index }: { value: string, label: string, index: number }) {
  return (
    <div className="relative w-full aspect-square flex items-center justify-center group cursor-default">
      
      {/* 1. The 3D Background Canvas */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas 
          camera={{ position: [0, 0, 9], fov: 40 }} 
          gl={{ antialias: true, alpha: true }}
        >
          <TechnicalNode delay={index * 2} />
        </Canvas>
      </div>

      {/* 2. High-Contrast Overlay Typography */}
      <div className="relative z-20 text-center pointer-events-none flex flex-col items-center justify-center px-2">
        
        {/* Metric Value */}
        <h3 className="text-[clamp(2.2rem,4.5vw,3.8rem)] font-black text-slate-900 tracking-tight group-hover:scale-105 transition-transform duration-300 leading-none">
          {value}
        </h3>
        
        {/* Metric Label */}
        <p className="text-[clamp(0.6rem,1.1vw,0.8rem)] font-mono font-bold tracking-[0.2em] uppercase text-red-600 mt-2 lg:mt-3 max-w-[180px] leading-[1.3]">
          {label}
        </p>
        
      </div>
    </div>
  );
}