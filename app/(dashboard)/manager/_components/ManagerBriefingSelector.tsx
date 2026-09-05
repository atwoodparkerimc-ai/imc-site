"use client";

import { useState, useEffect } from "react";
import { SAFETY_BRIEFINGS } from "@/lib/data/safetyBriefings";
import { setSiteBriefingOverride } from "@/lib/db/operations";
import { createClient } from "@/utils/supabase/client";
import { CalendarCheck, Loader2 } from "lucide-react";

interface ManagerBriefingSelectorProps {
  locations: string[];
}

export default function ManagerBriefingSelector({ locations }: ManagerBriefingSelectorProps) {
  const [supabase] = useState(() => createClient());
  const [selectedId, setSelectedId] = useState(SAFETY_BRIEFINGS[0].id);
  const [selectedLoc, setSelectedLoc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedStatus, setSavedStatus] = useState(false);

  // Split the briefings into two categorized arrays for clean dropdown grouping
  const policies = SAFETY_BRIEFINGS.filter(b => !b.id.startsWith("tbt-"));
  const toolboxTalks = SAFETY_BRIEFINGS.filter(b => b.id.startsWith("tbt-"));

  useEffect(() => {
    if (locations && locations.length > 0 && !selectedLoc) {
      setSelectedLoc(locations[0]);
    }
  }, [locations, selectedLoc]);

  const handleSaveOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoc) return;
    
    setIsSubmitting(true);
    setSavedStatus(false);
    
    try {
      const result = await setSiteBriefingOverride(supabase, selectedLoc, selectedId);
      
      if (result.success) {
        setSavedStatus(true);
        setTimeout(() => setSavedStatus(false), 3000);
      } else {
        alert(`DATABASE REJECTION: ${result.error}`);
      }
    } catch (error: any) {
      alert(`CRITICAL FAULT: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] p-4 sm:p-6 rounded-sm shadow-xl w-full font-mono text-slate-100 select-none">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2 h-2 rounded-none animate-pulse bg-[var(--color-brand-blue)] flex-shrink-0" />
        <h3 className="font-mono text-xs sm:text-base font-black text-slate-100 uppercase tracking-widest flex items-center gap-2">
          Site-Specific Briefing Control
        </h3>
      </div>

      <p className="text-slate-400 text-xs uppercase tracking-wider mb-6 font-mono leading-relaxed">
        Send a specific safety meeting to all employees at a work location. This overrides their automated calendar rotation for the current day.
      </p>

      <form onSubmit={handleSaveOverride} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              IMC Work Location
            </label>
            <select
              value={selectedLoc}
              onChange={(e) => setSelectedLoc(e.target.value)}
              className="w-full min-h-[44px] bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] rounded-sm px-4 py-2.5 text-xs text-white font-mono uppercase tracking-wide focus:outline-none transition-all cursor-pointer touch-manipulation"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc} className="bg-[var(--color-brand-card)] text-white">{loc}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-mono text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Safety Policy Module
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full min-h-[44px] bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] rounded-sm px-4 py-2.5 text-xs text-white font-mono uppercase tracking-wide focus:outline-none transition-all cursor-pointer touch-manipulation"
            >
              <optgroup label="Company Safety Policies" className="bg-[var(--color-brand-bg)] text-[var(--color-brand-blue)] font-black uppercase">
                {policies.map((briefing) => (
                  <option key={briefing.id} value={briefing.id} className="bg-[var(--color-brand-card)] text-white font-normal">
                    {briefing.id.toUpperCase()} — {briefing.title}
                  </option>
                ))}
              </optgroup>

              {toolboxTalks.length > 0 && (
                <optgroup label="Toolbox Talks" className="bg-[var(--color-brand-bg)] text-[#eab308] font-black uppercase mt-2">
                  {toolboxTalks.map((briefing) => (
                    <option key={briefing.id} value={briefing.id} className="bg-[var(--color-brand-card)] text-white font-normal">
                      {briefing.id.toUpperCase()} — {briefing.title}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !selectedLoc}
            className="w-full min-h-[44px] bg-[var(--color-brand-blue)] hover:bg-white active:bg-slate-200 hover:text-black disabled:bg-slate-800 disabled:text-slate-500 text-white font-mono text-xs sm:text-sm font-black uppercase tracking-widest py-3 px-6 rounded-sm transition-all shadow-[0_0_20px_rgba(0,136,255,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed active:scale-[0.98] touch-manipulation focus:outline-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Broadcasting Module...
              </>
            ) : (
              "Broadcast To Site ↗"
            )}
          </button>
        </div>

        {savedStatus && (
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-brand-green,#00ff9d)] pt-1">
            <CalendarCheck className="w-4 h-4 text-[var(--color-brand-green,#00ff9d)]" /> Overridden and broadcasting to all devices at {selectedLoc}.
          </div>
        )}
      </form>
    </div>
  );
}