import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLOR_GLOW } from './materials';

export function LiquidStream({ path, color, speed = 1, reverse = false, radius = 0.02 }: { path: THREE.Curve<THREE.Vector3>, color: string, speed?: number, reverse?: boolean, radius?: number }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime() * speed * (reverse ? -1 : 1);
    }
  });

  return (
    <mesh>
      <tubeGeometry args={[path, 128, radius, 16, false]} />
      <shaderMaterial
        ref={materialRef}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{ uTime: { value: 0 }, uColor: { value: new THREE.Color(color) } }}
        vertexShader={`
          varying vec2 vUv;
          void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uColor;
          varying vec2 vUv;
          void main() {
            // Creates distinct moving liquid segments/pulses
            float flow = sin(vUv.x * 40.0 - uTime * 15.0);
            float energy = smoothstep(0.1, 0.9, max(0.0, flow));
            // Fades the edges of the liquid core
            float edgeFade = pow(sin(vUv.y * 3.14159), 2.0);
            gl_FragColor = vec4(uColor, energy * edgeFade * 0.85);
          }
        `}
      />
    </mesh>
  );
}

export function FluidAirflowStream() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.4, 0.1, 0),    
    new THREE.Vector3(-1.0, 0.1, 0),
    new THREE.Vector3(0.4, 0.1, 0),    
    new THREE.Vector3(1.5, 0.1, 0),    
    new THREE.Vector3(2.49, 0.1, 0),    
    new THREE.Vector3(2.49, -1.4, 0)   
  ]), []);

  useFrame((state) => {
    if (materialRef.current) materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
  });

  return (
    <mesh>
      <tubeGeometry args={[curve, 120, 0.12, 24, false]} />
      <shaderMaterial
        ref={materialRef}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{ uTime: { value: 0 }, uColor: { value: new THREE.Color(COLOR_GLOW) } }}
        vertexShader={`
          varying vec2 vUv;
          void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uColor;
          varying vec2 vUv;
          void main() {
            float speed = uTime * 0.5;
            float streak = sin((vUv.x * 4.0 - speed) * 10.0 + vUv.y * 20.0) * cos((vUv.x * 2.0 - speed * 1.5) * 15.0);
            float energy = smoothstep(0.1, 0.9, max(0.0, streak));
            float edgeFade = pow(sin(vUv.y * 3.14159), 2.0);
            float endFade = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.8, vUv.x);
            gl_FragColor = vec4(uColor, energy * edgeFade * endFade * 0.8);
          }
        `}
      />
    </mesh>
  );
}