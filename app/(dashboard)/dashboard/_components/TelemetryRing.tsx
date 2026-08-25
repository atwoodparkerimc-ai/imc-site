"use client";

import { motion } from "framer-motion";
import { MatrixParticleCanvas, Particle } from "./MatrixParticleCanvas";

export interface TelemetryRingProps {
  particles: Particle[];
  displayPoints: number;
  progressArc: number;
  isSpinning: boolean;
  nextGoal: number;
}

export function TelemetryRing({
  particles,
  displayPoints,
  progressArc,
  isSpinning,
  nextGoal
}: TelemetryRingProps) {
  return (
    <div className="relative w-72 h-72 flex items-center justify-center shrink-0 font-mono">
      {/* Background Track Ring */}
      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
        <circle cx="144" cy="144" r="130" stroke="var(--color-brand-border)" strokeWidth="4" fill="none" />
      </svg>

      {/* Animated Brand Blue Progress Arc with Enhanced Outer Glow */}
      <motion.svg 
        className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_20px_rgba(0,136,255,0.75)]" 
        initial={{ rotate: -90 }} 
        animate={{ rotate: isSpinning ? [-90, 270] : -90 }} 
        transition={isSpinning ? { duration: 30, repeat: Infinity, ease: "linear" } : {}}
      >
        <circle 
          cx="144" 
          cy="144" 
          r="130" 
          stroke="var(--color-brand-blue)" 
          strokeWidth="4" 
          fill="none" 
          strokeDasharray="816" 
          strokeDashoffset={progressArc} 
          strokeLinecap="round" 
        />
      </motion.svg>

      {/* Solid Inner Card Container (Resized inset-3.5 to line up snugly with the spinning ring) */}
      <div className="absolute inset-[14px] rounded-full bg-[var(--color-brand-card)] overflow-hidden shadow-inner border border-[var(--color-brand-border)]">
        <MatrixParticleCanvas 
          particles={particles} 
          rotateX={65} 
          rotateY={-15} 
          duration={25} 
        />
      </div>

      {/* Readout Layout */}
      <div className="relative z-10 text-center flex flex-col items-center mt-2">
        <h2 className="text-[var(--color-brand-blue)] uppercase text-[10px] tracking-[0.3em] font-bold mb-1 opacity-90">
          Active Balance
        </h2>
        <div className="flex items-start">
          <p className="text-7xl font-black text-slate-100 tracking-tighter tabular-nums drop-shadow-md leading-none">
            {displayPoints}
          </p>
        </div>
        <p className="text-slate-400 text-[9px] uppercase tracking-wider font-semibold mt-3 border-t border-[var(--color-brand-border)] pt-2 px-4">
          Next Tier: {nextGoal}
        </p>
      </div>
    </div>
  );
}