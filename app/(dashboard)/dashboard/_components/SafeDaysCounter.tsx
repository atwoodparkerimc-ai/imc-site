"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MatrixParticleCanvas, Particle } from "./MatrixParticleCanvas";

export interface SafeDaysCounterProps {
  particles?: Particle[];
  /** Baseline incident date in YYYY-MM-DD format. Defaults to 11/27/2025 */
  incidentFreeDate?: string;
}

const DEFAULT_INCIDENT_DATE = "2025-11-27T00:00:00";
const CYCLE_DAYS = 365;

export function SafeDaysCounter({
  particles = [],
  incidentFreeDate = DEFAULT_INCIDENT_DATE,
}: SafeDaysCounterProps) {
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  const safeDaysCount = useMemo(() => {
    const startDate = new Date(incidentFreeDate);
    const now = new Date();
    if (isNaN(startDate.getTime())) return 0;
    
    const diffTime = now.getTime() - startDate.getTime();
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  }, [incidentFreeDate]);

  const daysInCurrentCycle = useMemo(() => {
    return safeDaysCount % CYCLE_DAYS;
  }, [safeDaysCount]);

  const dashOffset = useMemo(() => {
    const CIRCUMFERENCE = 314.16;
    if (safeDaysCount > 0 && daysInCurrentCycle === 0) {
      return 0;
    }
    const ratio = daysInCurrentCycle / CYCLE_DAYS;
    return CIRCUMFERENCE - (CIRCUMFERENCE * ratio);
  }, [daysInCurrentCycle, safeDaysCount]);

  // Brand Blue Particles Alignment
  const brandParticles = useMemo(() => {
    return particles.map((p) => ({
      ...p,
      color: p.color === "var(--color-brand-accent)" || p.color === "#117AE0" 
        ? "var(--color-brand-blue)" 
        : p.color,
    }));
  }, [particles]);

  useEffect(() => {
    const timer = setTimeout(() => setIsSpinning(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-28 h-28 flex items-center justify-center shrink-0 font-mono">
      
      {/* Background Track Ring - Thicker Stroke */}
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

      {/* Animated Brand Blue Progress Arc - Thicker Stroke */}
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
          stroke="var(--color-brand-blue)" 
          strokeWidth="6" 
          fill="none" 
          strokeDasharray="314.16" 
          strokeDashoffset={dashOffset} 
          strokeLinecap="round" 
        />
      </motion.svg>

      {/* Solid Inner Card Container (Snug 5px inset) */}
      <div className="absolute inset-[5px] rounded-full bg-[var(--color-brand-card)] overflow-hidden shadow-inner border border-[var(--color-brand-border)]">
        <MatrixParticleCanvas 
          particles={brandParticles} 
          rotateX={65} 
          rotateY={-15} 
          duration={25} 
        />
      </div>

      {/* Core Readout Numbers & Label Layout */}
      <div className="relative z-10 text-center flex flex-col items-center">
        <span className="text-3xl font-black text-[var(--color-brand-blue)] leading-none tabular-nums drop-shadow-md">
          {safeDaysCount}
        </span>
        <span className="text-[8px] font-bold uppercase text-slate-200 tracking-widest mt-1 border-t border-[var(--color-brand-border)] pt-1 px-2 whitespace-nowrap">
          Safe Days
        </span>
      </div>

    </div>
  );
}