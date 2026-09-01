"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Edges, Float } from "@react-three/drei";
import * as THREE from "three";
import { Flame, Wind, Factory, CheckCircle2, ChevronRight, DraftingCompass } from "lucide-react";

// ============================================================================
// --- DATA & CONTENT ---
// ============================================================================
const capabilitiesData = [
  {
    id: "piping",
    navTitle: "Process & Sanitary Piping",
    headerTitle: "Process & Utility Piping Systems",
    accent: "#ea1f27", // Standard Brand Red
    glow: "rgba(234, 31, 39, 0.15)",
    icon: Flame,
    description: "Full-bore process and high-pressure utility piping engineered for extreme operational tolerances, aggressive chemistry, and sterile environments. Installations are backed by certified weld procedures.",
    specs: [
      { label: "Weld Standards", val: "High-Purity Orbital GTAW & Certified Manual TIG" },
      { label: "Pressure Class", val: "Full Vacuum through High-Pressure Steam (150#+)" },
      { label: "Critical Media", val: "Ammonia (NH3), Steam, CIP, Acids, Cryogenics" },
      { label: "Hygienic Spec", val: "ASME BPE Compliant / Ra 15–20 µin Finishes" },
    ],
    materials: [
      "304L & 316L Sanitary Stainless",
      "High-Pressure Carbon (Sch 40/80)",
      "Industrial Ammonia (NH3) Piping",
      "PVDF & Fused Polypropylene",
      "Schedule 80 PVC / CPVC",
      "Heavy Cast Iron Drain & Waste"
    ]
  },
  {
    id: "hvac",
    navTitle: "Industrial HVAC & Cleanrooms",
    headerTitle: "Heavy HVAC & Environmental Control",
    accent: "#64748b", // Slate Gray
    glow: "rgba(100, 116, 139, 0.15)",
    icon: Wind,
    description: "Engineered atmospheric containment, heavy particulate dust extraction, and hygienic cleanroom enclosures built to strict SMACNA standards with validated pressure integrity.",
    specs: [
      { label: "Duct Fabrication", val: "Heavy-Gauge Galvanized & Welded Stainless" },
      { label: "Dust Extraction", val: "Cyclone Separators, Baghouses & Cartridge Filters" },
      { label: "Cleanroom Spec", val: "ISO Class 5–8 Controlled Environments" },
      { label: "Ceiling Systems", val: "Walk-on Structural T-Grid & Insulated Panels" },
    ],
    materials: [
      "Welded Stainless Steel Duct",
      "Heavy-Gauge Galvanized Systems",
      "High-Efficiency HEPA Filtration",
      "Hygienic Cleanroom Enclosures",
      "Walk-on Structural Ceilings",
      "Chemical Fume Extraction Stacks"
    ]
  },
  {
    id: "fab",
    navTitle: "Custom Fab & Modular Skids",
    headerTitle: "Industrial Fabrication & Modular Skids",
    accent: "#0088ff", // Electric Blue
    glow: "rgba(0, 136, 255, 0.15)",
    icon: Factory,
    description: "Shop-built process skids, custom production line conveyance, and OSHA-compliant physical guarding. Pre-engineered in Springville, UT to drastically compress plant downtime.",
    specs: [
      { label: "Skid Architecture", val: "Modular CIP, Heat Exchanger & Process Valve Manifolds" },
      { label: "Machine Guarding", val: "Interlocked Heavy Mesh & Polycarbonate Safety Cages" },
      { label: "Line Conveyance", val: "Custom Belt, Sanitary Roller & Transfer Assemblies" },
      { label: "Structural Access", val: "Catwalks, Mezzanines, Multi-Tier Platforms & Stairs" },
    ],
    materials: [
      "Structural Heavy Carbon Steel",
      "304 / 316 Stainless Sanitary Frames",
      "Perforated Safety Mesh Guarding",
      "Diamond Plate & Non-Slip Grating",
      "Drop-In Process Modules",
      "Custom Hoppers & Chutes"
    ]
  }
];

// ============================================================================
// --- WEBGL ENGINE CONTROLS --- 
// ============================================================================
const GL_LINE_COLOR = "#64748b";     
const MAT_BASE_COLOR = "#475569";    
const MAT_ROUGHNESS = 0.50;          
const MAT_METALNESS = 0.65;          
const MAT_OPACITY = 0.65;            
const KEY_LIGHT_INTENSITY = 0.6;     
const AMBIENT_LIGHT_INTENSITY = 0.6; 
const RED_UNDERGLOW_INTENSITY = 1.0; 

function SolidBlueprintMaterial() {
  return (
    <meshPhysicalMaterial 
      color={MAT_BASE_COLOR} 
      transparent={true} 
      opacity={MAT_OPACITY}   
      roughness={MAT_ROUGHNESS}
      metalness={MAT_METALNESS}
      polygonOffset={true}
      polygonOffsetFactor={2}
      polygonOffsetUnits={2}
    />
  );
}

// ============================================================================
// --- 1. HVAC / SHEET METAL STRUCTURAL TIER ---
// ============================================================================
function HVACSystem({ accent }: { accent: string }) {
  return (
    <group position={[0, 2.5, -1]}>
      <mesh position={[-2, -0.6, 0]}>
        <boxGeometry args={[1.7, 0.2, 1.1]} />
        <SolidBlueprintMaterial />
        <Edges color={GL_LINE_COLOR} />
      </mesh>

      <mesh position={[-2, 0, 0]}>
        <boxGeometry args={[1.8, 1, 1.2]} />
        <SolidBlueprintMaterial />
        <Edges color={GL_LINE_COLOR} />
      </mesh>

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
            <Edges color={accent} />
          </mesh>
        </group>
      ))}

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
            <Edges color={accent} />
          </mesh>
        </group>
      ))}

      <group>
        <mesh position={[-1.075, 0, 0]}>
          <boxGeometry args={[0.05, 0.6, 0.6]} />
          <SolidBlueprintMaterial />
          <Edges color={GL_LINE_COLOR} />
        </mesh>
        <mesh position={[-0.9, 0, 0]}>
          <boxGeometry args={[0.3, 0.48, 0.48]} />
          <SolidBlueprintMaterial />
          <Edges color={accent} />
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
            <Edges color={accent} />
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

// ============================================================================
// --- 2. PIPEFITTING TIER ASSEMBLY ---
// ============================================================================
function PlumbingManifold({ accent }: { accent: string }) {
  return (
    <group position={[-1, 0.5, 1.5]}>
      
      <group position={[0.5, -0.4, 0.1]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.2, 0.05, 1.0]} />
          <SolidBlueprintMaterial />
          <Edges color={GL_LINE_COLOR} />
        </mesh>
        {[-0.4, 0.4].map(z => (
          <mesh key={`beam-${z}`} position={[0, -0.075, z]}>
            <boxGeometry args={[2.2, 0.1, 0.1]} />
            <SolidBlueprintMaterial />
            <Edges color={GL_LINE_COLOR} />
          </mesh>
        ))}
      </group>

      <group position={[1.5, -0.8, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.18, 4.5, 16]} />
          <SolidBlueprintMaterial />
          <Edges color={GL_LINE_COLOR} />
        </mesh>
        {[-2.2, 0, 2.2].map((x) => (
          <mesh key={`big-flange-${x}`} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.22, 0.22, 0.08, 16]} />
            <SolidBlueprintMaterial />
            <Edges color={accent} />
          </mesh>
        ))}
        <mesh position={[1.0, 0.2, 0]}>
          <cylinderGeometry args={[0.05, 0.12, 0.15, 12]} />
          <SolidBlueprintMaterial />
          <Edges color={GL_LINE_COLOR} />
        </mesh>
      </group>

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
            <Edges color={accent} />
          </mesh>
        )), [accent])}
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
            <mesh position={[0, 0, 0.28]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.12, 0.015, 8, 16]}/><SolidBlueprintMaterial/><Edges color={accent}/></mesh>
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

// ============================================================================
// --- 3. CUSTOM FAB SHOP PRODUCTION TIER ---
// ============================================================================
function FabProductionLine({ accent }: { accent: string }) {
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
            <Edges color={accent} />
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
          <Edges color={accent} />
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
            <Edges color={accent} />
          </mesh>
        )), [accent])}
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
            <Edges color={accent} />
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
            <Edges color={accent} />
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

// ============================================================================
// --- STAGE COORDINATOR ---
// ============================================================================
function ActiveBlueprintStage({ activeId, accent }: { activeId: string, accent: string }) {
  return (
    <Float speed={1.5} rotationIntensity={0.02} floatIntensity={0.05}>
      <group position={[0, -0.2, 0]}>
        
        {activeId === "piping" && (
          <group position={[0.6, -0.8, -1]} rotation={[0., -Math.PI / 6, 0]} scale={1.2}>
            <PlumbingManifold accent={accent} />
          </group>
        )}
        
        {activeId === "hvac" && (
          <group position={[0.5, -2.0, 2.8]} rotation={[0.2, Math.PI / 9, 0]} scale={0.9}>
            <HVACSystem accent={accent} />
          </group>
        )}
        
        {activeId === "fab" && (
          <group position={[-2, 0.8, 2.5]} rotation={[-0.08, -Math.PI / 10, 0]} scale={0.75}>
            <FabProductionLine accent={accent} />
          </group>
        )}

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, 0]}>
          <ringGeometry args={[4.5, 4.52, 64]} />
          <meshBasicMaterial color={accent} transparent opacity={0.25} side={THREE.DoubleSide} />
        </mesh>
        
      </group>
    </Float>
  );
}

// ============================================================================
// --- MAIN COMPONENT ---
// ============================================================================
export default function CapabilitiesConsole() {
  const [activeId, setActiveId] = useState("piping");
  const [isMobile, setIsMobile] = useState(false);
  const workstationRef = useRef<HTMLDivElement>(null);
  const active = capabilitiesData.find(c => c.id === activeId) || capabilitiesData[0];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelect = (id: string) => {
    setActiveId(id);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      workstationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto text-slate-200" suppressHydrationWarning>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* DISCIPLINE SELECTOR MENU */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="flex items-center gap-3 mb-2 pl-2">
            <DraftingCompass className="w-5 h-5 text-slate-400" />
            <span className="font-mono text-xs text-slate-300 uppercase tracking-[0.15em] font-bold">
              Engineering Disciplines
            </span>
          </div>

          {capabilitiesData.map((item) => {
            const ItemIcon = item.icon;
            const isSelected = item.id === active.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`w-full text-left p-5 rounded-lg border transition-all duration-200 relative flex items-center justify-between group cursor-pointer active:scale-[0.98] active:bg-[#07172e] touch-manipulation select-none ${
                  isSelected
                    ? "bg-[#061224] border-slate-700 shadow-lg"
                    : "bg-[#050e1d] border-slate-800/80 hover:bg-[#08152b] hover:border-slate-700"
                }`}
              >
                {isSelected && (
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                    style={{ backgroundColor: item.accent, boxShadow: `0 0 10px ${item.accent}` }}
                  />
                )}

                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-md bg-[#030914] border border-slate-800 shadow-inner">
                    <ItemIcon 
                      className="w-5 h-5 transition-colors" 
                      style={{ color: isSelected ? item.accent : "#64748b" }} 
                    />
                  </div>
                  <span className={`font-bold text-base tracking-wide ${isSelected ? "text-white" : "text-slate-300 group-hover:text-white"}`}>
                    {item.navTitle}
                  </span>
                </div>

                <ChevronRight 
                  className={`w-4 h-4 transition-transform duration-300 ${isSelected ? "translate-x-1" : "opacity-0 group-hover:opacity-100 group-hover:translate-x-1"}`} 
                  style={{ color: isSelected ? item.accent : "#64748b" }} 
                />
              </button>
            );
          })}
        </div>

        {/* TECHNICAL WORKSTATION (TARGET FOR MOBILE SCROLL) */}
        <div 
          ref={workstationRef}
          className="lg:col-span-8 scroll-mt-24 h-full rounded-lg border border-slate-800 bg-[#040c1a] p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden shadow-2xl"
        >
          <div 
            className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none transition-all duration-1000 opacity-20"
            style={{ backgroundColor: active.accent }}
          />

          <div className="relative z-10 mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-3">
              {active.headerTitle}
            </h2>
            <p className="text-slate-200 text-base sm:text-lg leading-relaxed max-w-3xl font-normal">
              {active.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10 mb-6 items-center">
            
            <div className="md:col-span-5 flex flex-col justify-center">
              <div className="border-b border-slate-800 pb-2 mb-3">
                <span className="font-mono text-[11px] text-slate-400 uppercase tracking-widest font-bold">
                  Technical Specifications
                </span>
              </div>
              <div className="space-y-4 sm:space-y-5">
                {active.specs.map((spec, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-[11px] font-mono font-bold text-white uppercase tracking-widest mb-1">
                      {spec.label}
                    </span>
                    <span className="text-sm font-semibold text-slate-300 leading-relaxed">
                      {spec.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3D WORKSTATION VIEWPORT (Single Dynamic Canvas Context) */}
            <div className="md:col-span-7 h-64 sm:h-72 rounded-lg border border-slate-800 bg-[#02060d] p-3 flex flex-col relative shadow-inner overflow-hidden select-none pointer-events-none">
              
              <div className="w-full flex justify-between items-center px-1.5 mb-1.5 z-10 pointer-events-none">
                <span className="font-mono text-[10px] text-slate-300 uppercase tracking-widest font-bold">
                  Live 3D Shop Model
                </span>
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: active.accent }} />
                </div>
              </div>
              
              <div className="absolute inset-0 z-0">
                <Canvas
                  camera={{ 
                    position: isMobile ? [0, 2, 13.5] : [0, 2, 12], 
                    fov: isMobile ? 21 : 20 
                  }}
                  gl={{ antialias: true, alpha: true }}
                >
                  <directionalLight position={[10, 20, 15]} intensity={KEY_LIGHT_INTENSITY} color="#ffffff" />
                  <ambientLight intensity={AMBIENT_LIGHT_INTENSITY} />
                  <pointLight position={[0, -2, 2]} intensity={RED_UNDERGLOW_INTENSITY} color={active.accent} distance={10} />
                  
                  <ActiveBlueprintStage activeId={active.id} accent={active.accent} />
                  
                  <OrbitControls 
                    target={[0, -0.8, 0]}
                    enableZoom={false}   
                    enableRotate={false} 
                    enablePan={false}    
                  />
                </Canvas>
              </div>

              <div className="w-full flex justify-between items-center px-1.5 pt-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-t border-slate-800/60 z-10 mt-auto pointer-events-none">
                <span>WebGL Matrix Engine</span>
                <span>Interwest Springville Shop</span>
              </div>
            </div>

          </div>

          <div className="relative z-10 pt-5 border-t border-slate-800">
            <span className="font-mono text-[11px] text-slate-400 uppercase tracking-widest font-bold block mb-3">
              Supported Material Matrix
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {active.materials.map((mat, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: active.accent }} />
                  <span className="text-sm font-medium text-slate-100 leading-snug">{mat}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}