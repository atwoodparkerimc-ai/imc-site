"use client";

import { useState, useMemo } from "react";
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
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Calculate live headcount for each site
  const siteCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: allUsers.length };
    locations.forEach((loc) => {
      counts[loc] = 0;
    });

    allUsers.forEach((user) => {
      const userLoc = user.location || locations[0] || "Unassigned";
      counts[userLoc] = (counts[userLoc] || 0) + 1;
    });

    return counts;
  }, [allUsers, locations]);

  // Filter users by selected Site Tab and Search Query
  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      const userLoc = user.location || locations[0] || "Unassigned";
      const matchesTab = activeTab === "ALL" || userLoc === activeTab;

      const primaryName = user.nickname?.trim() || user.first_name?.trim() || "";
      const last = user.last_name?.trim() || "";
      const fullName = `${primaryName} ${last}`.toLowerCase();
      const matchesSearch = !searchQuery.trim() || fullName.includes(searchQuery.trim().toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [allUsers, activeTab, searchQuery, locations]);

  const handleTransfer = async (userId: string, newLocation: string) => {
    setUpdatingId(userId);
    const result = await updateUserLocation(supabase, userId, newLocation);
    if (result.success) {
      onLocationUpdated();
    }
    setUpdatingId(null);
  };

  return (
    <div className="border p-3.5 sm:p-6 shadow-2xl relative overflow-hidden group font-mono rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] select-none">
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-border)] group-hover:bg-[var(--color-brand-blue)] transition-colors duration-300" />
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-[var(--color-brand-border)]">
        <div>
          <h2 className="text-slate-100 font-black uppercase tracking-widest text-xs sm:text-base flex items-center gap-2">
            <span className="w-2 h-2 rounded-none animate-pulse bg-[var(--color-brand-blue)] flex-shrink-0" />
            Crew Site Location Assignments
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            Reassign employees to active job sites (Points & historical logs remain untouched)
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="w-full md:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employee..."
            className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] px-3 py-2 text-xs text-slate-100 outline-none rounded-sm transition-all"
          />
        </div>
      </div>

      {/* LOCATION TABS WITH HEADCOUNT BADGES */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-4">
        {/* ALL TAB */}
        <button
          type="button"
          onClick={() => setActiveTab("ALL")}
          className={`px-3 py-1.5 min-h-[36px] text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-sm transition-all flex items-center gap-2 border cursor-pointer ${
            activeTab === "ALL"
              ? "bg-[var(--color-brand-blue)] border-[var(--color-brand-blue)] text-white shadow-sm"
              : "bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] text-slate-400 hover:text-slate-200 hover:border-slate-500"
          }`}
        >
          <span>All Sites</span>
          <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-sm tabular-nums ${
            activeTab === "ALL" ? "bg-black/30 text-white" : "bg-slate-800 text-slate-300"
          }`}>
            {siteCounts["ALL"] || 0}
          </span>
        </button>

        {/* INDIVIDUAL SITE TABS */}
        {(locations || []).map((loc) => {
          const isActive = activeTab === loc;
          const count = siteCounts[loc] || 0;

          return (
            <button
              key={loc}
              type="button"
              onClick={() => setActiveTab(loc)}
              className={`px-3 py-1.5 min-h-[36px] text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-sm transition-all flex items-center gap-2 border cursor-pointer ${
                isActive
                  ? "bg-[var(--color-brand-blue)] border-[var(--color-brand-blue)] text-white shadow-sm"
                  : "bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] text-slate-400 hover:text-slate-200 hover:border-slate-500"
              }`}
            >
              <span className="truncate max-w-[150px] sm:max-w-none">{loc}</span>
              <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-sm tabular-nums ${
                isActive ? "bg-black/30 text-white" : "bg-slate-800 text-slate-300"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* CREW GRID */}
      {filteredUsers.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-[var(--color-brand-border)] rounded-sm">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            No personnel found matching the selected filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
          {filteredUsers.map((user) => {
            const isUpdating = updatingId === user.id;
            const primaryName = user.nickname?.trim() || user.first_name?.trim() || "";
            const last = user.last_name?.trim() || "";
            const fullName = last ? `${primaryName} ${last}` : primaryName;
            const managerTag = user.role === "manager" ? " (Manager)" : "";
            const currentLoc = user.location || locations[0] || "Springville Shop";

            return (
              <div 
                key={user.id} 
                className={`p-2.5 sm:p-3 border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 transition-all rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] ${
                  isUpdating 
                    ? "border-[var(--color-brand-blue)] bg-[var(--color-brand-blue)]/5 animate-pulse" 
                    : "hover:border-[var(--color-brand-blue)]/50"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {isUpdating && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-blue)] animate-ping flex-shrink-0" />
                    )}
                    <p className="font-bold text-slate-100 text-[11px] sm:text-xs uppercase truncate">
                      {fullName}{managerTag}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      PTS: <span className="font-black tabular-nums text-[var(--color-metric-meetings)]">{user.points_balance || 0}</span>
                    </p>
                    <span className="text-[9px] px-1.5 py-0.5 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-slate-300 font-bold uppercase truncate max-w-[130px]">
                      {currentLoc}
                    </span>
                  </div>
                </div>

                <select
                  value={currentLoc}
                  disabled={isUpdating}
                  onChange={(e) => handleTransfer(user.id, e.target.value)}
                  className="min-h-[40px] text-[10px] sm:text-xs text-slate-200 font-bold uppercase px-2 sm:px-3 py-1.5 outline-none transition-all cursor-pointer disabled:opacity-50 w-full sm:w-auto rounded-sm border bg-[var(--color-brand-card)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] touch-manipulation"
                >
                  {(locations || []).map((loc) => (
                    <option key={loc} value={loc} className="bg-[var(--color-brand-card)] text-white">
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}