"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MatrixParticleCanvas, Particle } from "./MatrixParticleCanvas";

export interface HazardsCounterProps {
  particles?: Particle[];
  /** Dynamic hazard count passed from the active dashboard/Supabase state via central ops */
  hazardCount?: number;
}

// Maps hazard levels (0-5) across central theme tokens: Lime Green -> Yellow -> Orange -> Red
function getHazardColor(level: number): string {
  if (level <= 1) return "var(--color-brand-green)"; // Level 0-1: Safe / Normal
  if (level === 2) return "#eab308";                  // Level 2: Caution (Yellow)
  if (level === 3) return "#f97316";                  // Level 3: Elevated (Orange)
  return "var(--color-brand-red)";                    // Level 4-5: Critical Hazard (Red)
}

export function HazardsCounter({
  particles = [],
  hazardCount = 0,
}: HazardsCounterProps) {
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  // Clamp hazard level strictly between 0 and 5
  const safeHazardLevel = Math.min(Math.max(hazardCount, 0), 5);
  
  // Clean active color token reference
  const activeColor = useMemo(() => getHazardColor(safeHazardLevel), [safeHazardLevel]);

  // INVERSE RING PROGRESS LOGIC:
  // Level 0 (0 Hazards) -> 100% Full Arc (Dashoffset = 0)
  // Level 5 (5 Hazards) -> 0% Empty Arc (Dashoffset = 314.16)
  const progressArc = useMemo(() => {
    const MAX_CIRCUMFERENCE = 314.16;
    const remainingRatio = (5 - safeHazardLevel) / 5;
    return MAX_CIRCUMFERENCE - (MAX_CIRCUMFERENCE * remainingRatio);
  }, [safeHazardLevel]);

  // Map internal particles to match the active color token
  const hazardParticles = useMemo(() => {
    return particles.map((p) => ({
      ...p,
      color: p.color === "var(--color-system-blue)" || p.color === "var(--color-brand-accent)" 
        ? activeColor 
        : p.color,
    }));
  }, [particles, activeColor]);

  // Start continuous spin animation loop after mount
  useEffect(() => {
    const timer = setTimeout(() => setIsSpinning(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-28 h-28 flex items-center justify-center shrink-0 font-mono">
      
      {/* Background Track Ring */}
      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
        <circle 
          cx="56" 
          cy="56" 
          r="50" 
          stroke="var(--color-brand-border)" 
          strokeWidth="5" 
          fill="none" 
        />
      </svg>

      {/* Dynamic Shrinking & Spinning Hazard Arc with Enhanced Outer Glow & Thicker Stroke */}
      <motion.svg 
        className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_20px_rgba(0,136,255,0.75)]" 
        viewBox="0 0 112 112"
        initial={{ rotate: -90 }} 
        animate={{ rotate: isSpinning ? [-90, 270] : -90 }} 
        transition={isSpinning ? { duration: 30, repeat: Infinity, ease: "linear" } : {}}
      >
        <circle 
          cx="56" 
          cy="56" 
          r="50" 
          stroke={activeColor} 
          strokeWidth="6" 
          fill="none" 
          strokeDasharray="314.16" 
          strokeDashoffset={progressArc} 
          strokeLinecap="round" 
        />
      </motion.svg>

      {/* Solid Inner Card Container (Snug 5px inset) */}
      <div className="absolute inset-[5px] rounded-full bg-[var(--color-brand-card)] overflow-hidden shadow-inner border border-[var(--color-brand-border)]">
        <MatrixParticleCanvas 
          particles={hazardParticles} 
          rotateX={65} 
          rotateY={-15} 
          duration={25} 
        />
      </div>

      {/* Core Readout Number & Label Layout */}
      <div className="relative z-10 text-center flex flex-col items-center">
        <span 
          className="text-3xl font-black leading-none tabular-nums drop-shadow-md transition-colors duration-500"
          style={{ color: activeColor }}
        >
          {safeHazardLevel}
        </span>
        <span className="text-[8px] font-bold uppercase text-slate-200 tracking-widest mt-1 border-t border-[var(--color-brand-border)] pt-1 px-1 whitespace-nowrap">
          Hazards
        </span>
      </div>

    </div>
  );
}