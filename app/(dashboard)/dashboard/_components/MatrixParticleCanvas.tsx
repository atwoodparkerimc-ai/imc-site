"use client";

import { motion } from "framer-motion";

export interface Particle {
  id: number;
  angle: number;
  radius: number;
  size: number;
  duration: number;
  color: string;
}

interface MatrixParticleCanvasProps {
  particles: Particle[];
  sliceCount?: number;
  multiplier?: number;
  rotateX: number;
  rotateY: number;
  duration?: number;
}

export function MatrixParticleCanvas({
  particles,
  sliceCount,
  multiplier = 1,
  rotateX,
  rotateY,
  duration = 25
}: MatrixParticleCanvasProps) {
  const activeParticles = sliceCount ? particles.slice(0, sliceCount) : particles;

  return (
    <div className="absolute inset-0 pointer-events-none z-0" style={{ perspective: "400px" }}>
      <motion.div 
        className="w-full h-full absolute inset-0" 
        style={{ rotateX, rotateY }} 
        animate={{ rotateZ: 360 }} 
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {activeParticles.map((p) => {
          const x = 50 + (p.radius * multiplier) * Math.cos((p.angle * Math.PI) / 180);
          const y = 50 + (p.radius * multiplier) * Math.sin((p.angle * Math.PI) / 180);

          // Dynamic glow evaluation for system blue, safe acts, or legacy brand accents
          const isSystemBlue = p.color === "var(--color-system-blue)" || p.color === "#117AE0" || p.color.includes("brand-accent");
          const isSafeActColor = p.color === "var(--color-safe-acts)" || p.color === "#40FF00" || p.color.includes("brand-success");

          const particleGlow = isSystemBlue
            ? "0 0 8px rgba(17, 122, 224, 0.6)"
            : isSafeActColor
            ? "0 0 6px rgba(64, 255, 0, 0.6)"
            : "none";

          return (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                left: `${x}%`,
                top: `${y}%`,
                backgroundColor: p.color,
                boxShadow: particleGlow
              }}
              animate={{ opacity: [0, 0.9, 0], scale: [0.5, 1.2, 0.5] }}
              transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 }}
            />
          );
        })}
      </motion.div>
    </div>
  );
}