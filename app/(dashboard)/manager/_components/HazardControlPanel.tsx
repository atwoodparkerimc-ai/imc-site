"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";

// --- CENTRAL DATA SERVICE IMPORT ---
import { 
  getLatestHazardScore, 
  updateDailyHazardScore 
} from "@/lib/db/operations";

const DEFAULT_LOCATIONS = ["Springville Shop", "Nestle Springville", "Nestle Jonesboro"];

interface HazardControlPanelProps {
  selectedLocation?: string;
  locations?: string[];
}

// Maps hazard levels (0-5) across master palette using CSS Tokens: Green -> Cyan -> Amber -> Red
function getHazardColor(level: number): string {
  if (level <= 1) return "var(--color-metric-meetings)";     // Level 0-1: Normal / Safe (Green/Teal)
  if (level === 2) return "var(--color-metric-safe-acts)";    // Level 2: Caution (Cyan/Blue)
  if (level === 3) return "var(--color-metric-observation)";  // Level 3: Elevated (Amber/Gold)
  return "var(--color-brand-red)";                            // Level 4-5: Critical Hazard (Alert Red)
}

export default function HazardControlPanel({ 
  selectedLocation = "Springville Shop",
  locations = DEFAULT_LOCATIONS
}: HazardControlPanelProps) {
  const [supabase] = useState(() => createClient());

  // Guarantee valid site list even if empty array passed from parent
  const activeLocationsList = locations && locations.length > 0 ? locations : DEFAULT_LOCATIONS;

  const [targetSite, setTargetSite] = useState<string>(
    selectedLocation !== "ALL" ? selectedLocation : DEFAULT_LOCATIONS[0]
  );
  const [hazardCount, setHazardCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Compute yesterday's date string YYYY-MM-DD
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  // Sync active site selection with global header selector (unless "ALL" is selected)
  useEffect(() => {
    if (selectedLocation && selectedLocation !== "ALL") {
      setTargetSite(selectedLocation);
    }
  }, [selectedLocation]);

  // Re-fetch score whenever targetSite changes
  useEffect(() => {
    async function loadCurrentHazard() {
      setIsLoading(true);
      // Fetch current broadcast level for the specific site location
      const score = await getLatestHazardScore(supabase, targetSite);
      setHazardCount(score);
      setIsLoading(false);
    }

    loadCurrentHazard();
  }, [supabase, targetSite]);

  const handleSave = async (selectedLevel: number) => {
    setIsSaving(true);
    setStatusMessage(null);

    const { data: { user } } = await supabase.auth.getUser();

    // Upsert record for specific site location via central operations
    const result = await updateDailyHazardScore(supabase, {
      recordedDate: yesterdayStr,
      hazardCount: selectedLevel,
      updatedBy: user?.id || null,
      location: targetSite
    });

    setIsSaving(false);

    if (!result.success) {
      setStatusMessage(`ERROR: ${result.error?.toUpperCase()}`);
    } else {
      setHazardCount(selectedLevel);
      setStatusMessage(`HAZARD METRIC UPDATED FOR [${targetSite.toUpperCase()}]`);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 border rounded-sm font-mono text-slate-100 bg-[var(--color-brand-card)] border-[var(--color-brand-border)]">
        <p className="animate-pulse uppercase tracking-widest text-xs font-bold text-[var(--color-brand-blue)]">
          Loading Site Hazard Controls...
        </p>
      </div>
    );
  }

  const activeColor = getHazardColor(hazardCount);

  return (
    <div className="p-4 sm:p-6 border rounded-sm font-mono text-slate-100 shadow-2xl relative overflow-hidden group bg-[var(--color-brand-card)] border-[var(--color-brand-border)]">
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-border)] group-hover:bg-[var(--color-brand-blue)] transition-colors duration-300" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 mb-6 border-[var(--color-brand-border)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-[var(--color-brand-blue)]">
            <span className="w-2 h-2 rounded-none animate-pulse bg-[var(--color-brand-blue)]" />
            Safety Operations Broadcast
          </div>
          <h2 className="text-sm sm:text-base font-black text-slate-100 uppercase tracking-widest">
            Site Hazard Level Control
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            Target Date: <span className="text-slate-200 font-black">{yesterdayStr}</span> (Yesterday)
          </p>
        </div>

        {/* MOBILE RESPONSIVE SITE SELECTOR & CURRENT BADGE */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="flex flex-col text-left sm:text-right flex-1 sm:flex-initial">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Target Location:</span>
            <select
              value={targetSite}
              onChange={(e) => setTargetSite(e.target.value)}
              className="text-xs font-bold uppercase text-slate-200 p-2.5 sm:p-2 outline-none transition-colors cursor-pointer w-full sm:w-auto rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)]"
            >
              {(activeLocationsList || []).map((loc) => (
                <option key={loc} value={loc} className="bg-[var(--color-brand-card)]">
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 px-4 py-2.5 sm:py-2 rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)]">
            <div className="text-left sm:text-right">
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Current Broadcast</p>
              <p className="text-xs font-bold uppercase text-slate-200">
                {hazardCount === 0 && "Level 0 — Safe"}
                {hazardCount === 1 && "Level 1 — Low Risk"}
                {hazardCount === 2 && "Level 2 — Caution"}
                {hazardCount === 3 && "Level 3 — Elevated"}
                {hazardCount === 4 && "Level 4 — High Hazard"}
                {hazardCount >= 5 && "Level 5 — Critical"}
              </p>
            </div>
            <span 
              className="text-3xl font-black leading-none tabular-nums transition-colors duration-500 drop-shadow-md"
              style={{ color: activeColor }}
            >
              {hazardCount}
            </span>
          </div>
        </div>
      </div>

      {/* Level Selection Matrix Buttons (0 to 5) */}
      <div className="space-y-3 mb-4">
        <label className="text-xs uppercase font-bold tracking-widest text-slate-300 block">
          Select & Update Active Level for <span className="text-slate-100 font-black">[{targetSite.toUpperCase()}]</span>:
        </label>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {[0, 1, 2, 3, 4, 5].map((level) => {
            const btnColor = getHazardColor(level);
            const isSelected = hazardCount === level;

            return (
              <motion.button
                key={level}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSave(level)}
                disabled={isSaving}
                className={`p-3 sm:p-3 border font-black rounded-sm transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                  isSelected
                    ? "bg-[var(--color-brand-bg)] border-2 shadow-md"
                    : "bg-[var(--color-brand-bg)]/60 border-[var(--color-brand-border)] hover:border-slate-700"
                }`}
                style={{
                  borderColor: isSelected ? btnColor : undefined,
                  color: isSelected ? btnColor : "#f8fafc",
                }}
              >
                <span className="text-lg font-black tabular-nums">{level}</span>
                <span className="text-[9px] tracking-wider uppercase font-bold text-slate-400">
                  {level === 0 ? "SAFE" : level === 5 ? "CRIT" : `LVL ${level}`}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Feedback Notification Banner */}
      {statusMessage && (
        <div className="mt-4 p-3 border rounded-sm text-center text-xs font-bold text-slate-200 tracking-wider uppercase bg-[var(--color-brand-bg)] border-[var(--color-brand-border)]">
          {statusMessage}
        </div>
      )}
    </div>
  );
}