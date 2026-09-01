"use client";

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Edges, Float } from '@react-three/drei';
import * as THREE from 'three';

// --- SHARED IMPORTS ---
import { COLOR_GLOW, COLOR_EDGE, XRayGlassMaterial, SolidInternalMaterial } from './ahu-blueprint/shared/materials';
import { FluidAirflowStream } from './ahu-blueprint/shared/fluid-shaders';

// --- AIR HANDLER IMPORTS ---
import { ExteriorDoghouseLouvers } from './ahu-blueprint/air-handler/exterior-louvers';
import { VBankFilters } from './ahu-blueprint/air-handler/v-bank-filters';
import { HeatExchangerCoil } from './ahu-blueprint/air-handler/heat-exchanger-coil';
import { DirectDriveBlower } from './ahu-blueprint/air-handler/direct-drive-blower';
import { PenthouseStructure } from './ahu-blueprint/air-handler/penthouse-structure';

// --- PIPING IMPORTS ---
import { ProcessPipingSystem } from './ahu-blueprint/piping/process-piping-system';

// --- PRODUCTION LINE IMPORTS ---
import { UShapeConveyorFrame, DriveMotorAssembly } from './ahu-blueprint/production-line/u-shape-conveyor';
import { StationLasagnaRobot } from './ahu-blueprint/production-line/station-lasagna-robot';
import { StationSauceFiller } from './ahu-blueprint/production-line/station-sauce-filler';
import { StationTraySealer } from './ahu-blueprint/production-line/station-tray-sealer';
import { StationCoolingTunnel } from './ahu-blueprint/production-line/station-cooling-tunnel';
import { StationSpiralTower } from './ahu-blueprint/production-line/station-spiral-tower';

// ============================================================================
// --- LOCAL HELPER COMPONENTS ---
// ============================================================================

interface SafeOrbitControlsProps {
  interactive?: boolean;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  [key: string]: any;
}

function SafeOrbitControls({ 
  interactive = false, 
  autoRotate = true, 
  autoRotateSpeed = 0.5, 
  ...props 
}: SafeOrbitControlsProps) {
  const { gl } = useThree();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (gl?.domElement) {
      setMounted(true);
    }
  }, [gl]);

  if (!mounted) return null;

  return (
    <OrbitControls 
      enabled={true}
      enableRotate={interactive}
      enableZoom={interactive} 
      enablePan={interactive} 
      autoRotate={autoRotate}
      autoRotateSpeed={autoRotateSpeed}
      maxPolarAngle={Math.PI / 1.5} 
      minPolarAngle={Math.PI / 4} 
      {...props} 
    />
  );
}

function TurningVaneArray() {
  const radii = [0.12, 0.22, 0.32, 0.42];
  return (
    <group position={[0.24, 0.24, 0]}>
      {radii.map((r, i) => (
        <group key={`vane-${i}`} position={[-r, -r, 0]}>
          <mesh rotation={[Math.PI / 2, Math.PI / 2, 0]}>
            <cylinderGeometry args={[r, r, 0.46, 16, 1, true, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} side={THREE.DoubleSide} transparent opacity={0.85} />
            <Edges color={COLOR_EDGE} />
          </mesh>
        </group>
      ))}
      {[-0.22, 0.22].map((z, i) => (
        <mesh key={`rail-${i}`} position={[-0.25, -0.25, z]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.55, 0.015, 0.02]} />
          <SolidInternalMaterial />
          <Edges color={COLOR_EDGE} />
        </mesh>
      ))}
    </group>
  );
}

function RectangularDuctReducer({ position, length, w1, h1, w2, h2 }: { position: [number, number, number], length: number, w1: number, h1: number, w2: number, h2: number }) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      0, h1/2, -w1/2,   length, h2/2, -w2/2,  length, h2/2, w2/2,
      0, h1/2, -w1/2,   length, h2/2, w2/2,   0, h1/2, w1/2,
      0, -h1/2, -w1/2,  0, -h1/2, w1/2,       length, -h2/2, w2/2,
      0, -h1/2, -w1/2,  length, -h2/2, w2/2,  length, -h2/2, -w2/2,
      0, h1/2, w1/2,    length, h2/2, w2/2,   length, -h2/2, w2/2,
      0, h1/2, w1/2,    length, -h2/2, w2/2,  0, -h1/2, w1/2,
      0, h1/2, -w1/2,   0, -h1/2, -w1/2,      length, -h2/2, -w2/2,
      0, h1/2, -w1/2,   length, -h2/2, -w2/2, length, h2/2, -w2/2,
    ]);
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
  }, [length, w1, h1, w2, h2]);

  return (
    <group position={position}>
      <mesh geometry={geometry}><XRayGlassMaterial /></mesh>
      <lineSegments><wireframeGeometry args={[geometry]} /><lineBasicMaterial color={COLOR_EDGE} linewidth={1.5} /></lineSegments>
    </group>
  );
}

// ============================================================================
// --- U-SHAPE PRODUCTION LINE MASTER ASSEMBLY ---
// ============================================================================
function UShapeProductionLine({ position = [-0.5, -8.5, 0] }: { position?: [number, number, number] }) {
  const trayCount = 120; 
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const uCurve = useMemo(() => {
    const p = new THREE.CurvePath<THREE.Vector3>();
    p.add(new THREE.LineCurve3(new THREE.Vector3(-3.5, 0, 0.6), new THREE.Vector3(4.5, 0, 0.6)));

    const arcPoints = [];
    for(let i = 0; i <= 16; i++) {
       const a = Math.PI / 2 - (i / 16) * Math.PI; 
       arcPoints.push(new THREE.Vector3(4.5 + Math.cos(a) * 0.6, 0, Math.sin(a) * 0.6));
    }
    p.add(new THREE.CatmullRomCurve3(arcPoints));

    p.add(new THREE.LineCurve3(new THREE.Vector3(4.5, 0, -0.6), new THREE.Vector3(-3.5, 0, -0.6)));

    const spiralPoints = [];
    for(let i = 0; i <= 128; i++) {
        const t = i / 128;
        const a = Math.PI / 2 + t * 4 * Math.PI * 2; 
        spiralPoints.push(new THREE.Vector3(-3.5 + Math.cos(a) * 0.6, t * 2.4, -1.2 + Math.sin(a) * 0.6));
    }
    p.add(new THREE.CatmullRomCurve3(spiralPoints));
    return p;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    const speed = 0.008; 

    for (let i = 0; i < trayCount; i++) {
      const offset = i / trayCount;
      const t = (time * speed + offset) % 1.0;
      const pos = uCurve.getPointAt(t);
      const tangent = uCurve.getTangentAt(t);

      dummy.position.copy(pos);
      dummy.lookAt(pos.clone().add(tangent));
      dummy.position.y += 0.05; 
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group position={position}>
      <UShapeConveyorFrame position={[0, 0, 0]} />
      <DriveMotorAssembly position={[-3.5, -0.05, 0.6]} />

      <StationLasagnaRobot position={[-1.5, 0, 0.6]} />
      <StationSauceFiller position={[1.0, 0, 0.6]} />
      <StationTraySealer position={[3.1, 0, 0.6]} />
      <StationCoolingTunnel position={[1.5, 0.15, -0.6]} />
      <StationSpiralTower position={[-3.5, 0, -1.2]} />

      <instancedMesh ref={meshRef} args={[undefined, undefined, trayCount]} renderOrder={10}>
        <boxGeometry args={[0.22, 0.06, 0.16]} />
        <shaderMaterial
          transparent={true}
          depthTest={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={{ uColor: { value: new THREE.Color("#00f0ff") } }}
          vertexShader={`
            varying vec2 vUv;
            void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0); }
          `}
          fragmentShader={`
            uniform vec3 uColor; varying vec2 vUv;
            void main() {
              float edge = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x) * smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
              gl_FragColor = vec4(uColor * 2.0, 0.5 + edge * 0.5);
            }
          `}
        />
        <Edges color="#00ffff" />
      </instancedMesh>
    </group>
  );
}

// ============================================================================
// --- MAIN AHU ASSEMBLY TIER ---
// ============================================================================
function CommercialAHUSystem() {
  return (
    <group position={[0, 0, 0]}>
      <PenthouseStructure />
      <ExteriorDoghouseLouvers position={[-3.0, 0.1, 0]} />

      <group position={[-2.45, 0.1, 0]}><VBankFilters position={[0, 0, 0]} /></group>
      <group position={[-1.7, 0.1, 0]}><HeatExchangerCoil position={[0, 0, 0]} /></group>
      <group position={[-0.5, 0.1, 0]}><DirectDriveBlower position={[0, 0, 0]} /></group>

      <ProcessPipingSystem />

      <RectangularDuctReducer position={[0.4, 0.1, 0]} length={0.5} w1={1.2} h1={1.2} w2={0.5} h2={0.5} />
      <mesh position={[0.92, 0.1, 0]}>
        <boxGeometry args={[0.04, 0.54, 0.54]} />
        <meshBasicMaterial color="#1e293b" />
        <Edges color={COLOR_EDGE} />
      </mesh>

      <group position={[0, 0, 0]}>
        <group position={[1.24, 0.1, 0]}>
          <mesh><boxGeometry args={[0.6, 0.5, 0.5]} /><XRayGlassMaterial /><Edges color={COLOR_EDGE} /></mesh>
          <mesh position={[0.32, 0, 0]}><boxGeometry args={[0.04, 0.54, 0.54]} /><SolidInternalMaterial /><Edges color={COLOR_EDGE} /></mesh>
          <group position={[0, 0, 0]}>
            <mesh position={[0, -0.28, 0]}><boxGeometry args={[0.08, 0.04, 0.7]} /><SolidInternalMaterial /><Edges color={COLOR_EDGE} /></mesh>
            {[-0.3, 0.3].map((z) => (
              <mesh key={`rod-1-${z}`} position={[0, 0.4, z]}><cylinderGeometry args={[0.01, 0.01, 1.3, 4]} /><SolidInternalMaterial /></mesh>
            ))}
          </group>
        </group>
        <group position={[1.88, 0.1, 0]}>
          <mesh><boxGeometry args={[0.6, 0.5, 0.5]} /><XRayGlassMaterial /><Edges color={COLOR_EDGE} /></mesh>
          <mesh position={[0.32, 0, 0]}><boxGeometry args={[0.04, 0.54, 0.54]} /><SolidInternalMaterial /><Edges color={COLOR_EDGE} /></mesh>
          <group position={[0, 0, 0]}>
            <mesh position={[0, -0.28, 0]}><boxGeometry args={[0.08, 0.04, 0.7]} /><SolidInternalMaterial /><Edges color={COLOR_EDGE} /></mesh>
            {[-0.3, 0.3].map((z) => (
              <mesh key={`rod-2-${z}`} position={[0, 0.4, z]}><cylinderGeometry args={[0.01, 0.01, 1.3, 4]} /><SolidInternalMaterial /></mesh>
            ))}
          </group>
        </group>
      </group>

      <group position={[2.49, 0.1, 0]}>
         <mesh><boxGeometry args={[0.5, 0.5, 0.5]} /><XRayGlassMaterial /><Edges color={COLOR_EDGE} /></mesh>
         <TurningVaneArray />
      </group>
      <mesh position={[2.49, -0.55, 0]}><boxGeometry args={[0.5, 0.8, 0.5]} /><XRayGlassMaterial /><Edges color={COLOR_EDGE} /></mesh>

      <FluidAirflowStream />
      <UShapeProductionLine position={[-0.5, -8.5, 0]} />
    </group>
  );
}

// ============================================================================
// --- VIEWPORT STAGE ---
// ============================================================================
interface BlueprintAnimationProps {
  interactive?: boolean;
}

export default function BlueprintAnimation({ interactive = false }: BlueprintAnimationProps) {
  return (
    <div 
      className={`w-full h-full flex items-center justify-center relative overflow-visible bg-transparent ${
        interactive ? "cursor-grab active:cursor-grabbing" : "cursor-default"
      }`}
    >
      <Canvas camera={{ position: [0, 8, 30], fov: 25 }} gl={{ antialias: true, alpha: true }}>
        <directionalLight position={[10, 20, 15]} intensity={1.5} color="#ffffff" />
        <ambientLight intensity={1.0} />
        <pointLight position={[-2, 0, 2]} intensity={2.0} color={COLOR_GLOW} distance={10} />

        <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.1}>
          <group position={[0, 4, 0]}>
            <CommercialAHUSystem />
          </group>
        </Float>

        <SafeOrbitControls 
          interactive={interactive} 
          autoRotate={true} 
          autoRotateSpeed={interactive ? 0.15 : 0.5} 
        />
      </Canvas>
    </div>
  );
} 

