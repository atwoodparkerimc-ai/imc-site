"use client";

import { useState } from "react";
import { UserProfile, updateUserLocation } from "@/lib/db/operations";
import { SupabaseClient } from "@supabase/supabase-js";

interface CrewLocationManagerProps {
  supabase: SupabaseClient;
  allUsers: UserProfile[];
  locations: string[];
  onLocationUpdated: () => void;
}

export default function CrewLocationManager({
  supabase,
  allUsers = [],
  locations = [],
  onLocationUpdated
}: CrewLocationManagerProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleTransfer = async (userId: string, newLocation: string) => {
    setUpdatingId(userId);
    const result = await updateUserLocation(supabase, userId, newLocation);
    if (result.success) {
      onLocationUpdated();
    }
    setUpdatingId(null);
  };

  return (
    <div className="border p-3.5 sm:p-6 shadow-2xl relative overflow-hidden group font-mono rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)]">
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-border)] group-hover:bg-[var(--color-brand-blue)] transition-colors duration-300" />
      
      <div className="flex justify-between items-center mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-[var(--color-brand-border)]">
        <div>
          <h2 className="text-slate-100 font-black uppercase tracking-widest text-xs sm:text-base flex items-center gap-2">
            <span className="w-2 h-2 rounded-none animate-pulse bg-[var(--color-brand-blue)] flex-shrink-0" />
            Crew Site Location Assignments
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            Reassign employees to active job sites (Points & historical logs remain untouched)
          </p>
        </div>
      </div>

      {/* Grid: 2 columns on mobile, untouched md:grid-cols-2 lg:grid-cols-3 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
        {(allUsers || []).map((user) => (
          <div 
            key={user.id} 
            className="p-2.5 sm:p-3 border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 transition-colors duration-150 rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] hover:border-[var(--color-brand-blue)]/50"
          >
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-100 text-[11px] sm:text-xs uppercase truncate">
                {user.nickname || user.first_name} {user.role === 'manager' ? '(Manager)' : ''}
              </p>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                PTS: <span className="font-black tabular-nums text-[var(--color-metric-meetings)]">{user.points_balance || 0}</span>
              </p>
            </div>

            <select
              value={user.location || locations[0] || 'Main Yard'}
              disabled={updatingId === user.id}
              onChange={(e) => handleTransfer(user.id, e.target.value)}
              className="text-[10px] sm:text-xs text-slate-200 font-bold uppercase py-1.5 sm:py-2 px-2 sm:px-3 outline-none transition-colors cursor-pointer disabled:opacity-50 w-full sm:w-auto rounded-sm border bg-[var(--color-brand-card)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] min-h-[34px] sm:min-h-0"
            >
              {(locations || []).map((loc) => (
                <option key={loc} value={loc} className="bg-[var(--color-brand-card)]">
                  {loc}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}