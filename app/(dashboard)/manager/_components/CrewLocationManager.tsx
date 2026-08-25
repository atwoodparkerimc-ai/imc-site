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
    <div className="border p-4 sm:p-6 shadow-2xl relative overflow-hidden group font-mono rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)]">
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-border)] group-hover:bg-[var(--color-brand-blue)] transition-colors duration-300" />
      
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--color-brand-border)]">
        <div>
          <h2 className="text-slate-100 font-black uppercase tracking-widest text-sm sm:text-base flex items-center gap-2">
            <span className="w-2 h-2 rounded-none animate-pulse bg-[var(--color-brand-blue)]" />
            Crew Site Location Assignments
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            Reassign employees to active job sites (Points & historical logs remain untouched)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
        {(allUsers || []).map((user) => (
          <div 
            key={user.id} 
            className="p-3 border flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-3 transition-colors duration-150 rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] hover:border-[var(--color-brand-blue)]/50"
          >
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-100 text-xs uppercase truncate">
                {user.nickname || user.first_name} {user.role === 'manager' ? '(Manager)' : ''}
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                PTS: <span className="font-black tabular-nums text-[var(--color-metric-meetings)]">{user.points_balance || 0}</span>
              </p>
            </div>

            <select
              value={user.location || locations[0] || 'Main Yard'}
              disabled={updatingId === user.id}
              onChange={(e) => handleTransfer(user.id, e.target.value)}
              className="text-xs text-slate-200 font-bold uppercase py-2 px-3 outline-none transition-colors cursor-pointer disabled:opacity-50 w-full xs:w-auto rounded-sm border bg-[var(--color-brand-card)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)]"
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