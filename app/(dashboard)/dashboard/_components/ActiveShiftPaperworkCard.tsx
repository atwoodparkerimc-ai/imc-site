"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  getTodayToolInspection, 
  DailyToolInspectionRecord 
} from "@/lib/db/operations";
import { getCurrentMonthTapeColor } from "@/lib/data/toolCatalog";

interface ActiveShiftPaperworkCardProps {
  supabase: any;
  userId: string;
  isSafetyComplete: boolean;
  assignedLocation: string;
}

export default function ActiveShiftPaperworkCard({
  supabase,
  userId,
  isSafetyComplete,
  assignedLocation,
}: ActiveShiftPaperworkCardProps) {
  const [inspection, setInspection] = useState<DailyToolInspectionRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const currentMonth = useMemo(() => getCurrentMonthTapeColor(), []);

  useEffect(() => {
    async function fetchActiveShiftInspection() {
      if (!userId) return;
      try {
        const record = await getTodayToolInspection(supabase, userId);
        setInspection(record);
      } catch (err) {
        console.error("Failed to load active shift inspection:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchActiveShiftInspection();
  }, [supabase, userId]);

  const toolCount = inspection?.tools_inspected?.length || 0;
  const verifiedTape = inspection?.tape_color_verified || currentMonth.color;
  const isFullyCompliant = isSafetyComplete && inspection !== null;

  return (
    <div className="w-full border rounded-sm p-4 sm:p-5 tactical-card border-[var(--color-brand-border)] relative overflow-hidden shadow-lg mb-8">
      <div 
        className={`absolute top-0 left-0 w-full h-[2px] transition-colors ${
          isFullyCompliant 
            ? "bg-[var(--color-brand-green,#00ff9d)]" 
            : "bg-[var(--color-brand-blue)]"
        }`} 
      />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Side: Telemetry Header */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span 
              className={`w-2 h-2 rounded-none flex-shrink-0 animate-pulse ${
                isFullyCompliant 
                  ? "bg-[var(--color-brand-green,#00ff9d)]" 
                  : "bg-[var(--color-brand-blue)]"
              }`} 
            />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Active Shift Paperwork & Tools • {assignedLocation}
            </span>
          </div>

          <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
            <h3 className="text-base sm:text-lg font-black uppercase text-white tracking-tight">
              {isFullyCompliant ? "Shift Compliance Verified" : "Morning Sign-In Status"}
            </h3>

            <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-none whitespace-nowrap ${
              isFullyCompliant 
                ? "bg-[var(--color-brand-green,#00ff9d)]/10 border-[var(--color-brand-green,#00ff9d)]/40 text-[var(--color-brand-green,#00ff9d)]"
                : "bg-amber-400/10 border-amber-400/40 text-amber-300"
            }`}>
              {isFullyCompliant ? "[SHIFT ACTIVE]" : "[ACTION REQUIRED]"}
            </span>
          </div>

          {/* Quick Metrics Line */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 mt-2 font-mono">
            <div>
              <span className="text-slate-500 uppercase text-[10px] font-bold">Tools Inspected: </span>
              <span className="font-black text-white">{loading ? "--" : `${toolCount} Verified`}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase text-[10px] font-bold">Active Tape: </span>
              <span className="font-black text-amber-300 uppercase">{verifiedTape}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase text-[10px] font-bold">Standard: </span>
              <span className="font-bold text-slate-400">Nestlé 5959-SHE-INS-0022</span>
            </div>
          </div>
        </div>

        {/* Right Side: Fast Action Launchers */}
        <div className="flex items-center gap-2.5 w-full md:w-auto flex-shrink-0">
          <Link
            href="/documents"
            className="flex-1 md:flex-initial min-h-[44px] px-4 py-2.5 bg-[var(--color-brand-bg)] hover:bg-white hover:text-black border border-[var(--color-brand-border)] hover:border-white text-white text-xs font-black uppercase tracking-wider rounded-sm transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] select-none touch-manipulation"
          >
            <span>+ Add Midday Tool</span>
          </Link>

          <Link
            href="/documents"
            className="flex-1 md:flex-initial min-h-[44px] px-5 py-2.5 bg-[var(--color-brand-blue)] hover:bg-white hover:text-black border border-[var(--color-brand-blue)] hover:border-white text-white text-xs font-black uppercase tracking-wider rounded-sm transition-all shadow-[0_0_15px_rgba(0,136,255,0.25)] flex items-center justify-center gap-1.5 active:scale-[0.98] select-none touch-manipulation"
          >
            <span>Open Documents Hub ↗</span>
          </Link>
        </div>
      </div>
    </div>
  );
}