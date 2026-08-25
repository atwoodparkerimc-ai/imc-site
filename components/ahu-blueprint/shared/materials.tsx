import * as THREE from 'three';

// ============================================================================
// --- ENGINE CONTROLS: THE TRUE "VINFAST X-RAY" AESTHETIC ---
// ============================================================================
export const COLOR_GLASS = "#0284c7";        
export const COLOR_EDGE = "#38bdf8";         
export const COLOR_GLOW = "#00f0ff";         
export const COLOR_HOT = "#ff2a00";          

// ============================================================================
// --- SKELETON FILM TEXTURE GENERATORS ---
// ============================================================================
const createSkeletonTexture = (repeatsY: number) => {
  if (typeof document === 'undefined') return null; 
  const canvas = document.createElement('canvas');
  canvas.width = 256; 
  canvas.height = 128; 
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = '#000000';
    ctx.fillRect(86, 32, 84, 64); 
  }
  
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, repeatsY);
  return tex;
};

const createHorizontalSkeletonTexture = (repeatsX: number) => {
  if (typeof document === 'undefined') return null; 
  const canvas = document.createElement('canvas');
  canvas.width = 128; 
  canvas.height = 256; 
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 128, 256);
    ctx.fillStyle = '#000000';
    ctx.fillRect(32, 86, 64, 84); 
  }
  
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatsX, 1);
  return tex;
};

export const skeletonRiseTex = createSkeletonTexture(1.08 / 0.28); 
export const skeletonFeedTex = createHorizontalSkeletonTexture(0.54 / 0.28);

// ============================================================================
// --- HELPER MATERIAL COMPONENTS ---
// ============================================================================
export function XRayGlassMaterial() {
  return (
    <meshStandardMaterial 
      color={COLOR_GLASS}
      transparent={true}
      opacity={0.10}          
      emissive={COLOR_GLASS}
      emissiveIntensity={0.2} 
      depthWrite={false}      
      side={THREE.DoubleSide}
      polygonOffset={true}
      polygonOffsetFactor={1}
    />
  );
}

export function SolidInternalMaterial({ color = "#334155" }: { color?: string }) {
  return (
    <meshStandardMaterial 
      color={color} 
      roughness={0.4} 
      metalness={0.8} 
      polygonOffset={true}
      polygonOffsetFactor={1}
    />
  );
}

export function XRayPipeMaterial({ color = "#334155", opacity = 0.25 }: { color?: string; opacity?: number }) {
  return (
    <meshStandardMaterial
      color={color}
      transparent={true}
      opacity={opacity}
      roughness={0.2}
      metalness={0.8}
      depthWrite={false}
      side={THREE.DoubleSide}
    />
  );
}

export function MachineCasingMaterial() {
  return (
    <meshStandardMaterial 
      color="#020a14" 
      transparent={false} 
      roughness={0.1} 
      metalness={0.95} 
      depthWrite={true} 
    />
  );
}

export function AirHandlerCasingMaterial() {
  return (
    <meshStandardMaterial 
      color="#004488" 
      emissive="#0088ff" 
      emissiveIntensity={0.1} 
      transparent={true} 
      opacity={0.25} 
      depthWrite={true} 
    />
  );
}