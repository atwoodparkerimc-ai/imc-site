"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Edges, Float, Html } from "@react-three/drei";
import * as THREE from "three";

// --- COLOR TOKENS MATCHING HERO GRAPHIC ---
const GL_LINE_COLOR = "#727578";   // Mapped to var(--color-brand-muted-dark)
const GL_ACCENT_COLOR = "#e63925"; // Mapped to var(--color-brand-accent)

// --- SHARED FROSTED BLUEPRINT MATERIAL ---
function SkidBlueprintMaterial() {
  return (
    <meshPhysicalMaterial 
      color="#dcd7d7" 
      transparent 
      opacity={0.8}   
      roughness={0.2}
      metalness={0.8}
    />
  );
}

// --- 1. BASE SKID FRAME & LEVELING FEET ---
function SkidBaseFrame() {
  return (
    <group position={[0, -2, 0]}>
      {/* 6'x6' Square Base Outer Perimeter Tubes */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3.2, 0.12, 3.2]} />
        <SkidBlueprintMaterial />
        <Edges color={GL_LINE_COLOR} />
      </mesh>
      
      {/* Structural Cross Members */}
      {[-0.8, 0.8].map((x, i) => (
        <mesh key={`cross-${i}`} position={[x, 0, 0]}>
          <boxGeometry args={[0.1, 0.12, 3.2]} />
          <SkidBlueprintMaterial />
          <Edges color={GL_LINE_COLOR} />
        </mesh>
      ))}

      {/* 4 Corner Leveling Stanchions & Base Anchor Feet */}
      {[
        [-1.5, -1.5],
        [1.5, -1.5],
        [-1.5, 1.5],
        [1.5, 1.5],
      ].map(([x, z], i) => (
        <group key={`stanchion-${i}`} position={[x, 0, z]}>
          {/* Vertical Stanchion Tube */}
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.7, 12]} />
            <SkidBlueprintMaterial />
            <Edges color={GL_LINE_COLOR} />
          </mesh>
          {/* Threaded Leveling Foot Pad */}
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.08, 16]} />
            <SkidBlueprintMaterial />
            <Edges color={GL_ACCENT_COLOR} />
          </mesh>
          {/* Jack Crank Handle Accent */}
          <mesh position={[0, 0.65, 0]}>
            <boxGeometry args={[0.04, 0.1, 0.2]} />
            <SkidBlueprintMaterial />
            <Edges color={GL_ACCENT_COLOR} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// --- 2. POWER ENCLOSURE & ELECTRICAL CABINETS ---
function EquipmentCabinets() {
  return (
    <group position={[0, -1.55, 0.5]}>
      {/* Main Lockable NEMA Equipment Cabinet */}
      <mesh position={[0.5, 0, 0]}>
        <boxGeometry args={[1.1, 0.8, 0.9]} />
        <SkidBlueprintMaterial />
        <Edges color={GL_LINE_COLOR} />
      </mesh>
      
      {/* Door Hinge & Latch Accents */}
      <mesh position={[0.5, 0, 0.46]}>
        <boxGeometry args={[0.9, 0.65, 0.02]} />
        <SkidBlueprintMaterial />
        <Edges color={GL_ACCENT_COLOR} />
      </mesh>

      {/* Powder Coated Steel Battery Box (2x 12V Batteries Inside) */}
      <mesh position={[-0.6, -0.05, 0]}>
        <boxGeometry args={[0.9, 0.7, 0.8]} />
        <SkidBlueprintMaterial />
        <Edges color={GL_LINE_COLOR} />
      </mesh>

      {/* Charge Controller / Inverter Mount Housing */}
      <mesh position={[-0.6, 0.4, -0.1]}>
        <boxGeometry args={[0.6, 0.3, 0.4]} />
        <SkidBlueprintMaterial />
        <Edges color={GL_LINE_COLOR} />
      </mesh>
    </group>
  );
}

// --- 3. DUAL 400W ADJUSTABLE SOLAR PANEL ARRAY ---
function SolarArray() {
  return (
    <group position={[0, -0.5, -0.2]}>
      {/* Rear Mounting Frame A-Frame & Tilt Braces */}
      <mesh position={[0, 0.2, -0.5]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[2.8, 0.08, 0.08]} />
        <SkidBlueprintMaterial />
        <Edges color={GL_LINE_COLOR} />
      </mesh>
      {[-1.2, 1.2].map((x, i) => (
        <mesh key={`brace-${i}`} position={[x, -0.3, -0.5]} rotation={[-0.6, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 1.2, 8]} />
          <SkidBlueprintMaterial />
          <Edges color={GL_LINE_COLOR} />
        </mesh>
      ))}

      {/* Solar Panels (2x 400W Mono) Mounted at Tilted Angle */}
      <group rotation={[-0.6, 0, 0]}>
        {/* Left Solar Panel */}
        <group position={[-0.8, 0.5, 0]}>
          <mesh>
            <boxGeometry args={[1.3, 1.6, 0.06]} />
            <SkidBlueprintMaterial />
            <Edges color={GL_LINE_COLOR} />
          </mesh>
          {/* Cell Mesh Lines Accent */}
          <mesh position={[0, 0, 0.035]}>
            <boxGeometry args={[1.2, 1.5, 0.01]} />
            <SkidBlueprintMaterial />
            <Edges color={GL_ACCENT_COLOR} />
          </mesh>
        </group>

        {/* Right Solar Panel */}
        <group position={[0.8, 0.5, 0]}>
          <mesh>
            <boxGeometry args={[1.3, 1.6, 0.06]} />
            <SkidBlueprintMaterial />
            <Edges color={GL_LINE_COLOR} />
          </mesh>
          {/* Cell Mesh Lines Accent */}
          <mesh position={[0, 0, 0.035]}>
            <boxGeometry args={[1.2, 1.5, 0.01]} />
            <SkidBlueprintMaterial />
            <Edges color={GL_ACCENT_COLOR} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// --- 4. TELESCOPING MAST & SURVEILLANCE HEAD ASSEMBLY ---
function TelescopingMastAssembly() {
  return (
    <group position={[0, -2, 0]}>
      {/* Base Mast Mount Plate */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.6, 0.08, 0.6]} />
        <SkidBlueprintMaterial />
        <Edges color={GL_LINE_COLOR} />
      </mesh>

      {/* Stage 1: Base Heavy Column Tube */}
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 2.3, 16]} />
        <SkidBlueprintMaterial />
        <Edges color={GL_LINE_COLOR} />
      </mesh>

      {/* Stage 2: Mid Telescoping Extension */}
      <mesh position={[0, 3.25, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 2.3, 16]} />
        <SkidBlueprintMaterial />
        <Edges color={GL_LINE_COLOR} />
      </mesh>

      {/* Stage 3: Top Terminal Tube (Reaching 19'-0" Overall) */}
      <mesh position={[0, 5.0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 2.0, 16]} />
        <SkidBlueprintMaterial />
        <Edges color={GL_LINE_COLOR} />
      </mesh>

      {/* Hand Winch Assembly */}
      <mesh position={[0.22, 0.8, 0]}>
        <boxGeometry args={[0.2, 0.3, 0.2]} />
        <SkidBlueprintMaterial />
        <Edges color={GL_ACCENT_COLOR} />
      </mesh>

      {/* 3x 120° Guy Wire Tension Cables */}
      {useMemo(() => {
        const angles = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];
        return angles.map((angle, i) => {
          const x2 = Math.sin(angle) * 1.5;
          const z2 = Math.cos(angle) * 1.5;
          return (
            <group key={`wire-${i}`}>
              <line>
                <bufferGeometry
                  attach="geometry"
                  onUpdate={(geo) => {
                    geo.setFromPoints([
                      new THREE.Vector3(0, 3.8, 0),
                      new THREE.Vector3(x2, 0.1, z2),
                    ]);
                  }}
                />
                <lineBasicMaterial attach="material" color={GL_ACCENT_COLOR} transparent opacity={0.6} />
              </line>
            </group>
          );
        });
      }, [])}

      {/* --- TOP MAST HEAD: PTZ CAMERAS & FLOOD LIGHTS --- */}
      <group position={[0, 5.95, 0]}>
        {/* Top Cross Mount Plate */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.8, 0.06, 0.2]} />
          <SkidBlueprintMaterial />
          <Edges color={GL_LINE_COLOR} />
        </mesh>

        {/* Dual PTZ Cameras (Left & Right Pods) */}
        {[-0.35, 0.35].map((x, i) => (
          <group key={`ptz-${i}`} position={[x, -0.15, 0]}>
            <mesh>
              <sphereGeometry args={[0.12, 16, 16]} />
              <SkidBlueprintMaterial />
              <Edges color={GL_LINE_COLOR} />
            </mesh>
            <mesh position={[0, -0.08, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.1, 12]} />
              <SkidBlueprintMaterial />
              <Edges color={GL_ACCENT_COLOR} />
            </mesh>
          </group>
        ))}

        {/* Dual 100W LED Flood Lights */}
        {[-0.18, 0.18].map((x, i) => (
          <group key={`flood-${i}`} position={[x, 0.12, 0]} rotation={[0.3, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.14, 0.12, 0.08]} />
              <SkidBlueprintMaterial />
              <Edges color={GL_ACCENT_COLOR} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

// --- 5. CAD HUD LEADER LABELS ---
interface SkidLabelProps {
  position: [number, number, number];
  title: string;
  subtitle: string;
  align?: "left" | "right";
}

function SkidLabel({ position, title, subtitle, align = "right" }: SkidLabelProps) {
  const isLeft = align === "left";

  return (
    <Html position={position} className="pointer-events-none z-10">
      <div className="relative">
        <div className="absolute left-0 top-0 w-2 h-2 border-[1.5px] border-brand-accent bg-brand-dark rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute left-0 top-0 w-0.5 h-0.5 bg-brand-accent rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_8px_var(--color-brand-accent)]" />
        
        <svg className="absolute left-0 top-0 w-48 h-32 overflow-visible pointer-events-none -translate-y-[1px]">
          <polyline 
            points={isLeft ? "0,0 -16,-16 -120,-16" : "0,0 16,-16 120,-16"} 
            fill="none" 
            stroke="#727578" 
            strokeWidth="1.5" 
          />
        </svg>

        <div 
          className={`absolute top-[-34px] flex flex-col font-mono whitespace-nowrap ${
            isLeft ? 'items-end right-[20px]' : 'items-start left-[20px]'
          }`}
        >
          <div className={`font-black tracking-widest uppercase text-[11px] text-brand-cream bg-brand-dark ${isLeft ? 'pr-1 pl-2' : 'pl-1 pr-2'}`}>
            {title}
          </div>
          <div className={`text-[8px] font-bold text-brand-accent uppercase tracking-widest bg-brand-dark mt-[1px] ${isLeft ? 'pr-1 pl-2' : 'pl-1 pr-2'}`}>
            {subtitle}
          </div>
        </div>
      </div>
    </Html>
  );
}

// --- MAIN STAGE ROTATION COORDINATOR ---
function SkidAssemblyStage() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.08;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.03} floatIntensity={0.08}>
      <group ref={groupRef} position={[0, -0.5, 0]}>
        
        {/* Physical 3D Hardware Modules */}
        <SkidBaseFrame />
        <EquipmentCabinets />
        <SolarArray />
        <TelescopingMastAssembly />

        {/* CAD Leader Callout Labels */}
        <SkidLabel 
          position={[0.4, 3.8, 0]} 
          title="Pan-Tilt Cameras" 
          subtitle="Dual PTZ & 100W Floods" 
          align="right" 
        />
        <SkidLabel 
          position={[-0.2, 1.2, 0]} 
          title="3-Stage Mast" 
          subtitle="19'-0&quot; Extended Height" 
          align="left" 
        />
        <SkidLabel 
          position={[1.1, -0.2, -0.2]} 
          title="400W Mono Solar" 
          subtitle="Adjustable Tilt Frame" 
          align="right" 
        />
        <SkidLabel 
          position={[-1.2, -1.8, 1.2]} 
          title="Steel Skid Base" 
          subtitle="6'-0&quot; Square / Leveling Jacks" 
          align="left" 
        />

        {/* Ground Radial Axis Grid Circle */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -2.1, 0]}>
          <ringGeometry args={[3.2, 3.22, 64]} />
          <meshBasicMaterial color="#727578" transparent opacity={0.25} side={THREE.DoubleSide} />
        </mesh>

      </group>
    </Float>
  );
}

// --- VIEWPORT STAGE COMPONENT ---
export default function SkidBlueprintAnimation() {
  return (
    <div className="w-full h-[500px] cursor-grab active:cursor-grabbing relative overflow-hidden bg-brand-dark/40 font-mono">
      {/* Background Reticle Details */}
      <div className="absolute top-4 left-4 text-[9px] text-brand-muted-dark uppercase tracking-widest pointer-events-none select-none z-10 space-y-0.5">
        <div>[ SYS_MODEL: IMC-MOBILE-SURVEILLANCE-SKID ]</div>
        <div>[ 3D CAD ENGINE: SPATIAL VECTOR MATRIX ]</div>
        <div className="flex items-center gap-1.5 pt-1">
          <span className="w-1.5 h-1.5 bg-brand-success rounded-full animate-ping" />
          <span className="text-brand-cream font-bold">19'-0" TELESCOPIC MAST ONLINE</span>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 text-[8px] text-brand-muted-dark uppercase text-right tracking-wider pointer-events-none select-none z-10 hidden sm:block">
        <div>WIND RATING: 90 MPH RETRACTED</div>
        <div>DESIGN: IMC / POWER SOURCE: 400W MONO</div>
      </div>

      <Canvas
        camera={{ position: [14, 4, 14], fov: 24 }}
        gl={{ antialias: true, alpha: true }}
      >
        <SkidAssemblyStage />
        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          maxPolarAngle={Math.PI / 1.5} 
          minPolarAngle={Math.PI / 4} 
        />
      </Canvas>

      {/* Structural Crosshair Corner Markers */}
      <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-brand-border-dark pointer-events-none" />
      <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-brand-border-dark pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-brand-border-dark pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-brand-border-dark pointer-events-none" />
    </div>
  );
}

