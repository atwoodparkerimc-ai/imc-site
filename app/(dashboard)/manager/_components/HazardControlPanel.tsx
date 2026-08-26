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

const HAZARD_LEVELS = [
  { level: 0, tag: "SAFE", label: "Level 0 — Safe", color: "var(--color-metric-meetings, #10b981)" },
  { level: 1, tag: "LOW RISK", label: "Level 1 — Low Risk", color: "var(--color-metric-meetings, #10b981)" },
  { level: 2, tag: "CAUTION", label: "Level 2 — Caution", color: "var(--color-metric-safe-acts, #38bdf8)" },
  { level: 3, tag: "ELEVATED", label: "Level 3 — Elevated", color: "var(--color-metric-observation, #fbbf24)" },
  { level: 4, tag: "HIGH HAZARD", label: "Level 4 — High Hazard", color: "var(--color-brand-red, #f87171)" },
  { level: 5, tag: "CRITICAL", label: "Level 5 — Critical", color: "var(--color-brand-red, #f87171)" },
];

export default function HazardControlPanel({ 
  selectedLocation = "Springville Shop",
  locations = DEFAULT_LOCATIONS
}: HazardControlPanelProps) {
  const [supabase] = useState(() => createClient());

  const activeLocationsList = locations && locations.length > 0 ? locations : DEFAULT_LOCATIONS;

  const [targetSite, setTargetSite] = useState<string>(
    selectedLocation !== "ALL" ? selectedLocation : DEFAULT_LOCATIONS[0]
  );
  const [hazardCount, setHazardCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ msg: string; isError: boolean } | null>(null);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  useEffect(() => {
    if (selectedLocation && selectedLocation !== "ALL") {
      setTargetSite(selectedLocation);
    }
  }, [selectedLocation]);

  useEffect(() => {
    async function loadCurrentHazard() {
      setIsLoading(true);
      const score = await getLatestHazardScore(supabase, targetSite);
      setHazardCount(score);
      setIsLoading(false);
    }

    loadCurrentHazard();
  }, [supabase, targetSite]);

  const handleSave = async (selectedLevel: number) => {
    if (selectedLevel === hazardCount || isSaving) return;

    setIsSaving(true);
    setStatusMessage(null);

    const { data: { user } } = await supabase.auth.getUser();

    const result = await updateDailyHazardScore(supabase, {
      recordedDate: yesterdayStr,
      hazardCount: selectedLevel,
      updatedBy: user?.id || null,
      location: targetSite
    });

    setIsSaving(false);

    if (!result.success) {
      setStatusMessage({ msg: `FAILED: ${result.error?.toUpperCase()}`, isError: true });
    } else {
      setHazardCount(selectedLevel);
      setStatusMessage({ msg: `UPDATED [${targetSite.toUpperCase()}]: LEVEL ${selectedLevel}`, isError: false });
      setTimeout(() => setStatusMessage(null), 2500);
    }
  };

  const currentLevelConfig = HAZARD_LEVELS.find(h => h.level === hazardCount) || HAZARD_LEVELS[0];

  return (
    <div className="border p-4 sm:p-5 shadow-2xl relative overflow-hidden group font-mono rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)]">
      {/* Top Accent Line */}
      <div 
        className="absolute top-0 left-0 w-full h-[2px] transition-colors duration-500" 
        style={{ backgroundColor: currentLevelConfig.color }}
      />

      {/* COMPACT TOP BAR: TITLE, LOCATION SELECTOR & LIVE BROADCAST */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 mb-4 border-b border-[var(--color-brand-border)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span 
              className="w-2 h-2 rounded-none animate-pulse"
              style={{ backgroundColor: currentLevelConfig.color }}
            />
            <h2 className="text-slate-100 font-black uppercase tracking-widest text-sm sm:text-base">
              Site Hazard Control
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Location Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Site:</span>
            <select
              value={targetSite}
              onChange={(e) => setTargetSite(e.target.value)}
              className="text-xs text-slate-200 font-bold uppercase py-1.5 px-3 outline-none transition-colors cursor-pointer rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)]"
            >
              {(activeLocationsList || []).map((loc) => (
                <option key={loc} value={loc} className="bg-[var(--color-brand-card)]">
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Current Broadcast Indicator Pill */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Broadcast:</span>
            <span 
              className="text-xs font-black uppercase tracking-wider tabular-nums"
              style={{ color: currentLevelConfig.color }}
            >
              {currentLevelConfig.label}
            </span>
          </div>
        </div>
      </div>

      {/* SLIM SEGMENTED LEVEL SELECTOR */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
            Set Safety Level for <span className="text-slate-200">[{targetSite}]</span>
          </label>
          {statusMessage && (
            <span className={`text-[10px] font-bold uppercase tracking-wider ${statusMessage.isError ? 'text-[var(--color-brand-red,#f87171)]' : 'text-[var(--color-brand-green,#00ff9d)]'}`}>
              [{statusMessage.isError ? 'ERROR' : 'SYNCED'}] {statusMessage.msg}
            </span>
          )}
        </div>

        <div className="grid grid-cols-6 gap-2">
          {HAZARD_LEVELS.map((item) => {
            const isSelected = hazardCount === item.level;

            return (
              <button
                key={item.level}
                onClick={() => handleSave(item.level)}
                disabled={isSaving || isLoading}
                className={`py-2.5 px-2 border rounded-sm flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer disabled:opacity-50 ${
                  isSelected 
                    ? "bg-[var(--color-brand-bg)] shadow-[0_0_12px_rgba(0,0,0,0.5)] scale-[1.01]" 
                    : "bg-[var(--color-brand-bg)]/50 border-[var(--color-brand-border)] hover:border-slate-500 hover:bg-[var(--color-brand-bg)]"
                }`}
                style={{
                  borderColor: isSelected ? item.color : undefined,
                }}
              >
                <span 
                  className={`text-sm sm:text-base font-black tabular-nums transition-colors ${
                    isSelected ? "" : "text-slate-200"
                  }`}
                  style={{ color: isSelected ? item.color : undefined }}
                >
                  {item.level}
                </span>
                <span 
                  className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider truncate w-full text-center"
                  style={{ color: isSelected ? item.color : "rgb(148, 163, 184)" }}
                >
                  {item.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}