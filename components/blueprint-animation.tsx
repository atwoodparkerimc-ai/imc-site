"use client";

import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Edges, Float, Html } from '@react-three/drei';
import * as THREE from 'three';

// ============================================================================
// --- WEBGL ENGINE CONTROLS --- (EDIT THESE TO TWEAK THE ENTIRE DESIGN)
// ============================================================================

// 1. BRAND COLORS (Lines and Accents)
const GL_LINE_COLOR = "#64748b";     // Muted slate lines (Eliminates line-glitch & glare)
const GL_ACCENT_COLOR = "#e63925";   // Brand red for valves and actuators

// 2. MATERIAL PROPERTIES (Subtle Industrial Steel)
const MAT_BASE_COLOR = "#475569";    // Muted dark slate body (Keeps background clean)
const MAT_ROUGHNESS = 0.50;          // Soft, non-reflective matte sheen
const MAT_METALNESS = 0.65;          // Medium steel weight
const MAT_OPACITY = 0.65;            // Higher translucency to let dark site blend through

// 3. SCENE LIGHTING
const KEY_LIGHT_INTENSITY = 0.6;     // Toned-down key light (No bright hot spots)
const AMBIENT_LIGHT_INTENSITY = 0.6; // Muted fill light
const RED_UNDERGLOW_INTENSITY = 1.0; // Subtle red accent glow
// ============================================================================

// --- PRODUCTION DESIGN MATRIX MATERIAL NODE ---
function SolidBlueprintMaterial() {
  return (
    <meshPhysicalMaterial 
      color={MAT_BASE_COLOR} 
      transparent={true} 
      opacity={MAT_OPACITY}   
      roughness={MAT_ROUGHNESS}
      metalness={MAT_METALNESS}
      // Increased depth offset to completely kill line flickering
      polygonOffset={true}
      polygonOffsetFactor={2}
      polygonOffsetUnits={2}
    />
  );
}

// --- 1. HVAC / SHEET METAL STRUCTURAL TIER ---
function HVACSystem() {
  return (
    <group position={[0, 2.5, -1]}>
      {/* Roof Curb */}
      <mesh position={[-2, -0.6, 0]}>
        <boxGeometry args={[1.7, 0.2, 1.1]} />
        <SolidBlueprintMaterial />
        <Edges color={GL_LINE_COLOR} />
      </mesh>

      {/* Main RTU Cabinet */}
      <mesh position={[-2, 0, 0]}>
        <boxGeometry args={[1.8, 1, 1.2]} />
        <SolidBlueprintMaterial />
        <Edges color={GL_LINE_COLOR} />
      </mesh>

      {/* Detailed Exhaust Fans */}
      {[-2.4, -1.6].map((x, i) => (
        <group key={`fan-${i}`} position={[x, 0.52, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.05, 12]} />
            <SolidBlueprintMaterial />
            <Edges color={GL_LINE_COLOR} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.1, 8]} />
            <SolidBlueprintMaterial />
            <Edges color={GL_ACCENT_COLOR} />
          </mesh>
        </group>
      ))}

      {/* Filter Access Panels with Latches */}
      {[-0.4, 0.4].map((x, i) => (
        <group key={`panel-${i}`} position={[-2 + x, 0, 0.61]}>
          <mesh>
            <boxGeometry args={[0.6, 0.7, 0.05]} />
            <SolidBlueprintMaterial />
            <Edges color={GL_LINE_COLOR} />
          </mesh>
          <mesh position={[0.2, 0, 0.05]}>
            <boxGeometry args={[0.05, 0.15, 0.02]} />
            <SolidBlueprintMaterial />
            <Edges color={GL_ACCENT_COLOR} />
          </mesh>
        </group>
      ))}

      {/* RTU DISCHARGE TRANSITION & VIBRATION ISOLATOR */}
      <group>
        <mesh position={[-1.075, 0, 0]}>
          <boxGeometry args={[0.05, 0.6, 0.6]} />
          <SolidBlueprintMaterial />
          <Edges color={GL_LINE_COLOR} />
        </mesh>
        <mesh position={[-0.9, 0, 0]}>
          <boxGeometry args={[0.3, 0.48, 0.48]} />
          <SolidBlueprintMaterial />
          <Edges color={GL_ACCENT_COLOR} />
        </mesh>
        <mesh position={[-0.725, 0, 0]}>
          <boxGeometry args={[0.05, 0.54, 0.54]} />
          <SolidBlueprintMaterial />
          <Edges color={GL_LINE_COLOR} />
        </mesh>
        <mesh position={[-0.6, 0, 0]}>
          <boxGeometry args={[0.2, 0.5, 0.5]} />
          <SolidBlueprintMaterial />
          <Edges color={GL_LINE_COLOR} />
        </mesh>
      </group>

      {/* Segmented Duct Trunk with Unistrut Hangers */}
      <group position={[0.5, 0, 0]}>
        {useMemo(() => [...Array(4)].map((_, i) => (
          <group key={`duct-seg-${i}`} position={[(i * 0.8) - 1.0, 0, 0]}>
            <mesh position={[0.4, 0, 0]}>
              <boxGeometry args={[0.8, 0.5, 0.5]} />
              <SolidBlueprintMaterial />
              <Edges color={GL_LINE_COLOR} />
            </mesh>
            <mesh position={[0.8, 0, 0]}>
              <boxGeometry args={[0.05, 0.54, 0.54]} />
              <SolidBlueprintMaterial />
              <Edges color={GL_LINE_COLOR} />
            </mesh>
            
            {/* Trapeze Hangers */}
            {(i === 1 || i === 3) && (
              <group position={[i === 3 ? -0.1 : 0.4, 0, 0]}>
                <mesh position={[0, -0.3, 0]}>
                  <boxGeometry args={[0.1, 0.05, 0.7]} />
                  <SolidBlueprintMaterial />
                  <Edges color={GL_LINE_COLOR} />
                </mesh>
                {[-0.3, 0.3].map((z) => (
                  <mesh key={`rod-${z}`} position={[0, 0.3, z]}>
                    <cylinderGeometry args={[0.01, 0.01, 1.2, 4]} />
                    <SolidBlueprintMaterial />
                    <Edges color={GL_LINE_COLOR} />
                  </mesh>
                ))}
              </group>
            )}
          </group>
        )), [])}
      </group>

      {/* Vertical Supply Drop & Elbow with Turning Vanes */}
      <group position={[2.1, -0.25, 0]}>
         <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <SolidBlueprintMaterial />
            <Edges color={GL_LINE_COLOR} />
         </mesh>
         {[-0.1, 0.1].map(z => (
           <mesh key={`vane-${z}`} position={[0, 0, z]} rotation={[0, 0, -Math.PI/4]}>
             <boxGeometry args={[0.02, 0.6, 0.4]} />
             <SolidBlueprintMaterial />
             <Edges color={GL_ACCENT_COLOR} />
           </mesh>
         ))}
      </group>
      <mesh position={[2.1, -0.9, 0]}>
        <boxGeometry args={[0.5, 0.8, 0.5]} />
        <SolidBlueprintMaterial />
        <Edges color={GL_LINE_COLOR} />
      </mesh>
    </group>
  );
}

// --- 2. PIPEFITTING TIER ASSEMBLY ---
function PlumbingManifold() {
  return (
    <group position={[-1, 0.5, 1.5]}>
      
      {/* Heavy Steel Skidded Base Plate */}
      <group position={[0.5, -0.4, 0.1]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.2, 0.05, 1.0]} />
          <SolidBlueprintMaterial />
          <Edges color={GL_LINE_COLOR} />
        </mesh>
        {/* I-Beam Skids */}
        {[-0.4, 0.4].map(z => (
          <mesh key={`beam-${z}`} position={[0, -0.075, z]}>
            <boxGeometry args={[2.2, 0.1, 0.1]} />
            <SolidBlueprintMaterial />
            <Edges color={GL_LINE_COLOR} />
          </mesh>
        ))}
      </group>

      {/* LARGE LOWER HEADER PIPE */}
      <group position={[1.5, -0.8, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.18, 4.5, 16]} />
          <SolidBlueprintMaterial />
          <Edges color={GL_LINE_COLOR} />
        </mesh>
        {/* Massive Header Flanges */}
        {[-2.2, 0, 2.2].map((x) => (
           <mesh key={`big-flange-${x}`} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
             <cylinderGeometry args={[0.22, 0.22, 0.08, 16]} />
             <SolidBlueprintMaterial />
             <Edges color={GL_ACCENT_COLOR} />
           </mesh>
        ))}
        <mesh position={[1.0, 0.2, 0]}>
           <cylinderGeometry args={[0.05, 0.12, 0.15, 12]} />
           <SolidBlueprintMaterial />
           <Edges color={GL_LINE_COLOR} />
        </mesh>
      </group>

      {/* MAIN TRANSFER LINE & 90-DEGREE DROP */}
      <mesh position={[0.925, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 2.85, 12]} />
        <SolidBlueprintMaterial />
        <Edges color={GL_LINE_COLOR} />
      </mesh>

      <mesh position={[2.35, -0.15, 0]}>
        <torusGeometry args={[0.15, 0.08, 12, 16, Math.PI / 2]} />
        <SolidBlueprintMaterial />
        <Edges color={GL_LINE_COLOR} />
      </mesh>

      {/* Vertical Drop & Flanged Concentric Reducer */}
      <group position={[2.5, -0.275, 0]}>
        <mesh>
          <cylinderGeometry args={[0.08, 0.08, 0.25, 8]} />
          <SolidBlueprintMaterial />
          <Edges color={GL_LINE_COLOR} />
        </mesh>
        <group position={[0, -0.125, 0]}>
          <mesh position={[0, 0, 0]}>
             <cylinderGeometry args={[0.12, 0.12, 0.02, 12]} />
             <SolidBlueprintMaterial />
             <Edges color={GL_LINE_COLOR} />
          </mesh>
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.08, 0.05, 0.18, 12]} />
            <SolidBlueprintMaterial />
            <Edges color={GL_LINE_COLOR} />
          </mesh>
          <mesh position={[0, -0.2, 0]}>
             <cylinderGeometry args={[0.09, 0.09, 0.02, 12]} />
             <SolidBlueprintMaterial />
             <Edges color={GL_LINE_COLOR} />
          </mesh>
          <mesh position={[0, -0.23, 0]}>
             <cylinderGeometry args={[0.05, 0.05, 0.04, 8]} />
             <SolidBlueprintMaterial />
             <Edges color={GL_LINE_COLOR} />
          </mesh>
        </group>
      </group>

      {/* Detailed Centrifugal Pump on Steel Plinth */}
      <group position={[1.5, -0.15, 0.25]}>
        <mesh position={[0.05, -0.15, 0]}>
           <boxGeometry args={[0.8, 0.1, 0.4]} />
           <SolidBlueprintMaterial />
           <Edges color={GL_LINE_COLOR} />
        </mesh>
        <mesh position={[0.2, 0.05, 0]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.12, 0.12, 0.4, 12]} />
          <SolidBlueprintMaterial />
          <Edges color={GL_LINE_COLOR} />
        </mesh>
        {useMemo(() => [...Array(5)].map((_, i) => (
          <mesh key={`fin-${i}`} position={[0.08 + (i * 0.06), 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.14, 0.14, 0.02, 12]} />
            <SolidBlueprintMaterial />
            <Edges color={GL_ACCENT_COLOR} />
          </mesh>
        )), [])}
        <mesh position={[-0.1, 0.05, 0]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.2, 8]} />
          <SolidBlueprintMaterial />
          <Edges color={GL_LINE_COLOR} />
        </mesh>
        <mesh position={[-0.25, 0.05, 0]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.12, 16]} />
          <SolidBlueprintMaterial />
          <Edges color={GL_LINE_COLOR} />
        </mesh>
        <group position={[-0.25, 0.25, 0]}>
          <mesh>
            <cylinderGeometry args={[0.06, 0.06, 0.15, 8]} />
            <SolidBlueprintMaterial />
            <Edges color={GL_LINE_COLOR} />
          </mesh>
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.02, 12]} />
            <SolidBlueprintMaterial />
            <Edges color={GL_LINE_COLOR} />
          </mesh>
        </group>
      </group>

      {/* BYPASS LOOP WITH VALVES */}
      <group position={[0.5, 0, 0]}>
        {[0, 1].map((x) => (
          <mesh key={`tee-up-${x}`} position={[x, 0.1, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.2, 8]} />
            <SolidBlueprintMaterial />
            <Edges color={GL_LINE_COLOR} />
          </mesh>
        ))}

        {[0, 1].map((x) => (
          <group key={`valve-${x}`} position={[x, 0.3, 0]}>
            <mesh position={[0, -0.1, 0]}><cylinderGeometry args={[0.12, 0.12, 0.02, 12]}/><SolidBlueprintMaterial/><Edges color={GL_LINE_COLOR}/></mesh>
            <mesh position={[0, -0.08, 0]}><cylinderGeometry args={[0.12, 0.12, 0.02, 12]}/><SolidBlueprintMaterial/><Edges color={GL_LINE_COLOR}/></mesh>
            <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.08, 0.08, 0.14, 8]}/><SolidBlueprintMaterial/><Edges color={GL_LINE_COLOR}/></mesh>
            <mesh position={[0, 0.08, 0]}><cylinderGeometry args={[0.12, 0.12, 0.02, 12]}/><SolidBlueprintMaterial/><Edges color={GL_LINE_COLOR}/></mesh>
            <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.12, 0.12, 0.02, 12]}/><SolidBlueprintMaterial/><Edges color={GL_LINE_COLOR}/></mesh>
            <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.04, 0.08, 0.15, 8]}/><SolidBlueprintMaterial/><Edges color={GL_LINE_COLOR}/></mesh>
            <mesh position={[0, 0, 0.2]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.015, 0.015, 0.25, 6]}/><SolidBlueprintMaterial/><Edges color={GL_LINE_COLOR}/></mesh>
            <mesh position={[0, 0, 0.28]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.12, 0.015, 8, 16]}/><SolidBlueprintMaterial/><Edges color={GL_ACCENT_COLOR}/></mesh>
          </group>
        ))}

        <mesh position={[0, 0.705, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.59, 8]} />
          <SolidBlueprintMaterial />
          <Edges color={GL_LINE_COLOR} />
        </mesh>
        <mesh position={[1, 0.705, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.59, 8]} />
          <SolidBlueprintMaterial />
          <Edges color={GL_LINE_COLOR} />
        </mesh>

        <mesh position={[0.15, 1.0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.15, 0.06, 12, 16, Math.PI / 2]} />
          <SolidBlueprintMaterial />
          <Edges color={GL_LINE_COLOR} />
        </mesh>

        <mesh position={[0.5, 1.15, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.7, 8]} />
          <SolidBlueprintMaterial />
          <Edges color={GL_LINE_COLOR} />
        </mesh>

        <group position={[0.5, 1.15, 0]} rotation={[0, 0, Math.PI / 2]}>
           <mesh position={[0, -0.02, 0]}>
             <cylinderGeometry args={[0.1, 0.1, 0.02, 12]} />
             <SolidBlueprintMaterial />
             <Edges color={GL_LINE_COLOR} />
           </mesh>
           <mesh position={[0, 0.02, 0]}>
             <cylinderGeometry args={[0.1, 0.1, 0.02, 12]} />
             <SolidBlueprintMaterial />
             <Edges color={GL_LINE_COLOR} />
           </mesh>
        </group>

        <mesh position={[0.85, 1.0, 0]}>
          <torusGeometry args={[0.15, 0.06, 12, 16, Math.PI / 2]} />
          <SolidBlueprintMaterial />
          <Edges color={GL_LINE_COLOR} />
        </mesh>
      </group>
    </group>
  );
}

// --- 3. CUSTOM FAB SHOP PRODUCTION TIER ---
function FabProductionLine() {
  const spiralSegments = useMemo(() => {
    const segments = [];
    const numSegments = 120; 
    const radius = 0.5; 
    const height = 1.2; 
    const turns = 3.5; 

    for (let i = 0; i < numSegments; i++) {
      const t = i / numSegments;
      const angle = -Math.PI / 2 + (t * Math.PI * 2 * turns);
      
      segments.push({
        x: Math.cos(angle) * radius,
        y: (t * height) - (height / 2),
        z: Math.sin(angle) * radius,
        rotY: -angle - Math.PI / 2, 
        rotZ: (height / turns) * 0.12 
      });
    }
    return segments;
  }, []);

  return (
    <group position={[1.5, -1.2, -0.5]}>
      <group position={[1.1, -0.6, 0]}>
        <mesh>
          <boxGeometry args={[6.4, 0.15, 1.8]} />
          <SolidBlueprintMaterial />
          <Edges color={GL_LINE_COLOR} />
        </mesh>
        {[-2.8, 0, 2.8].map((x) =>
          [-0.7, 0.7].map((z) => (
            <mesh key={`foot-${x}-${z}`} position={[x, -0.15, z]}>
               <cylinderGeometry args={[0.04, 0.08, 0.15, 8]} />
               <SolidBlueprintMaterial />
               <Edges color={GL_LINE_COLOR} />
            </mesh>
          ))
        )}
      </group>

      <group position={[-1.6, 0.075, 0.6]}>
         <mesh>
            <boxGeometry args={[0.6, 1.2, 0.4]} />
            <SolidBlueprintMaterial />
            <Edges color={GL_LINE_COLOR} />
         </mesh>
         <mesh position={[0, 0.4, 0.21]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.4, 0.3, 0.05]} />
            <SolidBlueprintMaterial />
            <Edges color={GL_ACCENT_COLOR} />
         </mesh>
      </group>

      <group position={[0, -0.1, 0.5]}>
        <mesh>
          <boxGeometry args={[2.0, 0.05, 0.6]} />
          <SolidBlueprintMaterial />
          <Edges color={GL_LINE_COLOR} />
        </mesh>
        
        {[-0.9, 0.9].map((x) => (
          [-0.25, 0.25].map((z) => (
            <mesh key={`cw-leg-${x}-${z}`} position={[x, -0.25, z]}>
              <boxGeometry args={[0.04, 0.5, 0.04]} />
              <SolidBlueprintMaterial />
              <Edges color={GL_LINE_COLOR} />
            </mesh>
          ))
        ))}

        {[-0.9, 0, 0.9].map(x => (
           <mesh key={`post-${x}`} position={[x, 0.3, 0.25]}>
             <cylinderGeometry args={[0.015, 0.015, 0.6, 4]} />
             <SolidBlueprintMaterial />
             <Edges color={GL_LINE_COLOR} />
           </mesh>
        ))}
        <mesh position={[0, 0.6, 0.25]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.015, 0.015, 1.8, 4]} />
          <SolidBlueprintMaterial />
          <Edges color={GL_LINE_COLOR} />
        </mesh>
      </group>

      <group position={[-0.8, 0.5, -0.2]}>
        <mesh>
          <cylinderGeometry args={[0.45, 0.45, 1.0, 16]} />
          <SolidBlueprintMaterial />
          <Edges color={GL_LINE_COLOR} />
        </mesh>
        <mesh position={[0, -0.65, 0]}>
          <cylinderGeometry args={[0.45, 0.1, 0.3, 16]} />
          <SolidBlueprintMaterial />
          <Edges color={GL_LINE_COLOR} />
        </mesh>
        <mesh position={[0.2, 0.52, 0]} rotation={[0.2, 0, 0]}>
           <cylinderGeometry args={[0.15, 0.15, 0.02, 12]} />
           <SolidBlueprintMaterial />
           <Edges color={GL_ACCENT_COLOR} />
        </mesh>
        
        {[-0.3, 0.3].map(x => (
          [-0.3, 0.3].map(z => (
            <mesh key={`vat-leg-${x}-${z}`} position={[x, -0.55, z]}>
              <cylinderGeometry args={[0.03, 0.03, 1.0, 8]} />
              <SolidBlueprintMaterial />
              <Edges color={GL_LINE_COLOR} />
            </mesh>
          ))
        ))}
      </group>

      <group position={[0.6, 0.2, -0.2]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 2.0, 16]} />
          <SolidBlueprintMaterial />
          <Edges color={GL_LINE_COLOR} />
        </mesh>
        
        {[-0.6, 0.6].map(x => (
           <mesh key={`ext-saddle-${x}`} position={[x, -0.4, 0]}>
             <boxGeometry args={[0.1, 0.7, 0.2]} />
             <SolidBlueprintMaterial />
             <Edges color={GL_LINE_COLOR} />
           </mesh>
        ))}
        
        <group position={[-0.7, 0.5, 0]}>
          <mesh>
             <cylinderGeometry args={[0.25, 0.25, 0.4, 8]} />
             <SolidBlueprintMaterial />
             <Edges color={GL_LINE_COLOR} />
          </mesh>
          <mesh position={[0, -0.3, 0]}>
             <cylinderGeometry args={[0.25, 0.05, 0.2, 8]} />
             <SolidBlueprintMaterial />
             <Edges color={GL_LINE_COLOR} />
          </mesh>
        </group>

        {useMemo(() => [...Array(5)].map((_, i) => (
          <mesh key={`rib-${i}`} position={[(i - 1.5) * 0.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.23, 0.23, 0.05, 12]} />
            <SolidBlueprintMaterial />
            <Edges color={GL_ACCENT_COLOR} />
          </mesh>
        )), [])}
      </group>

      {/* HEAT SEAL TUNNEL & TRANSFER CONVEYOR */}
      <group position={[2.5, 0.2, -0.2]}>
        <mesh>
          <boxGeometry args={[1.8, 0.05, 0.3]} />
          <SolidBlueprintMaterial />
          <Edges color={GL_LINE_COLOR} />
        </mesh>

        {[-0.8, 0.8].map((x) => (
          [-0.1, 0.1].map((z) => (
            <mesh key={`conv-leg-${x}-${z}`} position={[x, -0.4, z]}>
              <boxGeometry args={[0.04, 0.8, 0.04]} />
              <SolidBlueprintMaterial />
              <Edges color={GL_LINE_COLOR} />
            </mesh>
          ))
        ))}
        
        <group position={[-0.4, 0.22, 0]}>
          <mesh>
            <boxGeometry args={[0.6, 0.4, 0.35]} />
            <SolidBlueprintMaterial />
            <Edges color={GL_LINE_COLOR} />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[0.4, 0.1, 0.25]} />
            <SolidBlueprintMaterial />
            <Edges color={GL_ACCENT_COLOR} />
          </mesh>
          {[-0.1, 0.1].map(x => (
             <mesh key={`actuator-${x}`} position={[x, 0.15, 0]}>
               <cylinderGeometry args={[0.02, 0.02, 0.15, 8]} />
               <SolidBlueprintMaterial />
               <Edges color={GL_LINE_COLOR} />
             </mesh>
          ))}
          
          {[-0.25, 0.25].map(x => (
             [-0.2, 0.2].map(z => (
               <mesh key={`tunnel-leg-${x}-${z}`} position={[x, -0.5, z]}>
                  <boxGeometry args={[0.04, 0.9, 0.04]} />
                  <SolidBlueprintMaterial />
                  <Edges color={GL_LINE_COLOR} />
               </mesh>
             ))
          ))}
        </group>

        <mesh position={[0, 0.05, -0.16]}>
           <boxGeometry args={[1.8, 0.05, 0.02]} />
           <SolidBlueprintMaterial />
           <Edges color={GL_LINE_COLOR} />
        </mesh>
        <mesh position={[0, 0.05, 0.16]}>
           <boxGeometry args={[1.8, 0.05, 0.02]} />
           <SolidBlueprintMaterial />
           <Edges color={GL_LINE_COLOR} />
        </mesh>
      </group>

      {/* SPIRAL COOLING CONVEYOR */}
      <group position={[3.4, 0.8, 0.3]}>
        <mesh position={[0, -0.35, 0]}>
           <cylinderGeometry args={[0.35, 0.35, 1.95, 16]} />
           <SolidBlueprintMaterial />
           <Edges color={GL_LINE_COLOR} />
        </mesh>

        <mesh position={[0, -1.3, 0]}>
           <cylinderGeometry args={[0.5, 0.5, 0.05, 16]} />
           <SolidBlueprintMaterial />
           <Edges color={GL_LINE_COLOR} />
        </mesh>

        {useMemo(() => [...Array(4)].map((_, i) => (
          <mesh key={`gusset-${i}`} position={[0, -1.15, 0]} rotation={[0, (i * Math.PI) / 2, 0]}>
             <boxGeometry args={[0.8, 0.25, 0.04]} />
             <SolidBlueprintMaterial />
             <Edges color={GL_LINE_COLOR} />
          </mesh>
        )), [])}

        <group position={[0, 0.7, 0]}>
          <mesh>
             <cylinderGeometry args={[0.15, 0.15, 0.2, 8]} />
             <SolidBlueprintMaterial />
             <Edges color={GL_ACCENT_COLOR} />
          </mesh>
          <mesh position={[0, -0.15, 0]}>
             <boxGeometry args={[0.2, 0.1, 0.2]} />
             <SolidBlueprintMaterial />
             <Edges color={GL_LINE_COLOR} />
          </mesh>
        </group>
        
        {spiralSegments.map((seg, i) => (
          <mesh 
            key={`spiral-${i}`} 
            position={[seg.x, seg.y, seg.z]} 
            rotation={[0, seg.rotY, seg.rotZ]}
          >
            <boxGeometry args={[0.15, 0.02, 0.3]} />
            <SolidBlueprintMaterial />
            <Edges color={GL_LINE_COLOR} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/// --- MAIN STAGE ROTATION COORDINATOR ---
function ContractorCapabilities() {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Smooth auto-rotation ONLY. (Mouse parallax completely removed).
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.08;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.03} floatIntensity={0.08}>
      {/* PERFECT Y-CENTER & ROTATION AXIS */}
      <group ref={groupRef} position={[0, -0.8, 0]}>
        
        {/* --- HVAC TIER --- */}
        <group 
          position={[0.5, 1, 0]}
          onPointerOver={(e) => { e.stopPropagation(); setHoveredTier("hvac"); }}
          onPointerOut={() => setHoveredTier(null)}
        >
          <HVACSystem />
          
          {hoveredTier === "hvac" && (
            <Html position={[-0.6, 2.8, 0]} className="pointer-events-none select-none">
              <div className="flex items-center font-mono whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 shadow-[0_10px_25px_rgba(0,0,0,0.8)]">
                <span className="w-1 h-7 bg-[#e63925]" />
                <div className="bg-[#080a0f]/95 border border-slate-700/80 px-3.5 py-1.5 backdrop-blur-md">
                  <span className="text-xs font-extrabold text-slate-100 uppercase tracking-widest">
                    Commercial HVAC
                  </span>
                </div>
              </div>
            </Html>
          )}

          <mesh rotation={[Math.PI / 2, 0, 0]} position={[-0.6, 2.5, 0]}>
            <ringGeometry args={[4.5, 4.52, 64]} />
            <meshBasicMaterial color={GL_ACCENT_COLOR} transparent opacity={0.25} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* --- PIPEFITTING TIER --- */}
        <group 
          position={[-0, 0.5, -1.5]}
          onPointerOver={(e) => { e.stopPropagation(); setHoveredTier("pipe"); }}
          onPointerOut={() => setHoveredTier(null)}
        >
          <PlumbingManifold />
          
          {hoveredTier === "pipe" && (
            <Html position={[0.8, 1.0, 0]} className="pointer-events-none select-none">
              <div className="flex items-center font-mono whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 shadow-[0_10px_25px_rgba(0,0,0,0.8)]">
                <span className="w-1 h-7 bg-[#e63925]" />
                <div className="bg-[#080a0f]/95 border border-slate-700/80 px-3.5 py-1.5 backdrop-blur-md">
                  <span className="text-xs font-extrabold text-slate-100 uppercase tracking-widest">
                    Pipefitting & Plumbing
                  </span>
                </div>
              </div>
            </Html>
          )}

          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0.8, 0.5, 0]}>
            <ringGeometry args={[4.5, 4.52, 64]} />
            <meshBasicMaterial color={GL_ACCENT_COLOR} transparent opacity={0.25} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* --- FAB SHOP TIER --- */}
        <group 
          position={[-2.3, -1, 1.8]}
          onPointerOver={(e) => { e.stopPropagation(); setHoveredTier("fab"); }}
          onPointerOut={() => setHoveredTier(null)}
        >
          <FabProductionLine />
          
          {hoveredTier === "fab" && (
            <Html position={[1.2, 0.8, 0]} className="pointer-events-none select-none">
              <div className="flex items-center font-mono whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 shadow-[0_10px_25px_rgba(0,0,0,0.8)]">
                <span className="w-1 h-7 bg-[#e63925]" />
                <div className="bg-[#080a0f]/95 border border-slate-700/80 px-3.5 py-1.5 backdrop-blur-md">
                  <span className="text-xs font-extrabold text-slate-100 uppercase tracking-widest">
                    Custom Fabrication
                  </span>
                </div>
              </div>
            </Html>
          )}

          <mesh rotation={[Math.PI / 2, 0, 0]} position={[1.2, -1.2, 0]}>
            <ringGeometry args={[4.5, 4.52, 64]} />
            <meshBasicMaterial color={GL_ACCENT_COLOR} transparent opacity={0.25} side={THREE.DoubleSide} />
          </mesh>
        </group>

      </group>
    </Float>
  );
}

// --- VIEWPORT STAGE ---
export function BlueprintAnimation() {
  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing relative overflow-visible">
      <Canvas
        camera={{ position: [24, 3, 24], fov: 16 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Scene lighting pulled directly from your new Master Controls */}
        <directionalLight position={[10, 20, 15]} intensity={KEY_LIGHT_INTENSITY} color="#ffffff" />
        <ambientLight intensity={AMBIENT_LIGHT_INTENSITY} />
        <pointLight position={[0, -2, 2]} intensity={RED_UNDERGLOW_INTENSITY} color="#e63925" distance={10} />
        
        <ContractorCapabilities />
        <OrbitControls 
          target={[0, -0.8, 0]}
          enableZoom={false}   
          enableRotate={false} 
          enablePan={false}    
        />
      </Canvas>
    </div>
  );
}