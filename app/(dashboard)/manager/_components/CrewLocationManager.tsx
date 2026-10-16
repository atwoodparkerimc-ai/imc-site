"use client";

import { useState, useMemo } from "react";
import { UserProfile, updateUserLocation, updateUserRole, setEmployeeActiveStatus } from "@/lib/db/operations";
import { SupabaseClient } from "@supabase/supabase-js";

interface CrewLocationManagerProps {
  supabase: SupabaseClient;
  allUsers: UserProfile[];
  locations: string[];
  onLocationUpdated: () => void;
}

const AVAILABLE_ROLES = [
  { value: "employee", label: "Employee" },
  { value: "foreman", label: "Foreman" },
  { value: "manager", label: "Manager" },
];

export default function CrewLocationManager({
  supabase,
  allUsers = [],
  locations = [],
  onLocationUpdated
}: CrewLocationManagerProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [employmentView, setEmploymentView] = useState<"ACTIVE" | "ARCHIVED">("ACTIVE");

  // Separate active and archived pools
  const activeUsersPool = useMemo(() => {
    return allUsers.filter((u) => u.is_active !== false);
  }, [allUsers]);

  const archivedUsersPool = useMemo(() => {
    return allUsers.filter((u) => u.is_active === false);
  }, [allUsers]);

  // Calculate live headcount for each site based strictly on ACTIVE crew
  const siteCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: activeUsersPool.length };
    locations.forEach((loc) => {
      counts[loc] = 0;
    });

    activeUsersPool.forEach((user) => {
      const userLoc = user.location || locations[0] || "Unassigned";
      counts[userLoc] = (counts[userLoc] || 0) + 1;
    });

    return counts;
  }, [activeUsersPool, locations]);

  // Filter users based on Active/Archived view, Location Tab, and Search Query
  const filteredUsers = useMemo(() => {
    const basePool = employmentView === "ACTIVE" ? activeUsersPool : archivedUsersPool;

    return basePool.filter((user) => {
      const userLoc = user.location || locations[0] || "Unassigned";
      const matchesTab = activeTab === "ALL" || userLoc === activeTab;

      const primaryName = user.nickname?.trim() || user.first_name?.trim() || "";
      const last = user.last_name?.trim() || "";
      const fullName = `${primaryName} ${last}`.toLowerCase();
      const matchesSearch = !searchQuery.trim() || fullName.includes(searchQuery.trim().toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [activeUsersPool, archivedUsersPool, employmentView, activeTab, searchQuery, locations]);

  const handleTransfer = async (userId: string, newLocation: string) => {
    setUpdatingId(userId);
    const result = await updateUserLocation(supabase, userId, newLocation);
    if (result.success) {
      onLocationUpdated();
    }
    setUpdatingId(null);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    const result = await updateUserRole(supabase, userId, newRole);
    if (result.success) {
      onLocationUpdated();
    }
    setUpdatingId(null);
  };

  const handleToggleStatus = async (user: UserProfile, targetActive: boolean) => {
    const primaryName = user.nickname?.trim() || user.first_name?.trim() || "Employee";
    const last = user.last_name?.trim() || "";
    const fullName = `${primaryName} ${last}`.trim();

    const confirmed = window.confirm(
      targetActive 
        ? `Reactivate ${fullName}? They will regain access to safety meetings and crew rosters.` 
        : `Deactivate ${fullName}? Their points and meeting completions will be preserved, but they will be removed from site headcounts, future meeting logs, and portal access.`
    );

    if (!confirmed) return;

    setUpdatingId(user.id);
    const res = await setEmployeeActiveStatus(supabase, user.id, targetActive);
    if (res.success) {
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
            Crew Roster, Roles & Site Assignments
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            Manage site locations, user access levels (Employee, Foreman, Manager), and active status
          </p>
        </div>

        {/* VIEW TOGGLE & SEARCH */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Active vs Archived Segmented Control */}
          <div className="flex items-center rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] p-0.5">
            <button
              type="button"
              onClick={() => setEmploymentView("ACTIVE")}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                employmentView === "ACTIVE"
                  ? "bg-[var(--color-brand-blue)] text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Active ({activeUsersPool.length})
            </button>
            <button
              type="button"
              onClick={() => setEmploymentView("ARCHIVED")}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                employmentView === "ARCHIVED"
                  ? "bg-[var(--color-brand-red,#ff3b5c)] text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Archived ({archivedUsersPool.length})
            </button>
          </div>

          {/* Search Bar */}
          <div className="w-full sm:w-56">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employee..."
              className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] px-3 py-2 text-xs text-slate-100 outline-none rounded-sm transition-all"
            />
          </div>
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
            {employmentView === "ACTIVE" ? siteCounts["ALL"] || 0 : archivedUsersPool.length}
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
              {employmentView === "ACTIVE" && (
                <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-sm tabular-nums ${
                  isActive ? "bg-black/30 text-white" : "bg-slate-800 text-slate-300"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* CREW GRID */}
      {filteredUsers.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-[var(--color-brand-border)] rounded-sm">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            {employmentView === "ACTIVE" 
              ? "No active personnel found matching the selected filter." 
              : "No archived personnel records found."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
          {filteredUsers.map((user) => {
            const isUpdating = updatingId === user.id;
            const primaryName = user.nickname?.trim() || user.first_name?.trim() || "";
            const last = user.last_name?.trim() || "";
            const fullName = last ? `${primaryName} ${last}` : primaryName;
            
            const currentRole = (user.role || "employee").toLowerCase();
            const currentLoc = user.location || locations[0] || "Springville Shop";
            const isUserActive = user.is_active !== false;

            return (
              <div 
                key={user.id} 
                className={`p-2.5 sm:p-3 border flex flex-col justify-between gap-3 transition-all rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] ${
                  isUpdating 
                    ? "border-[var(--color-brand-blue)] bg-[var(--color-brand-blue)]/5 animate-pulse" 
                    : !isUserActive 
                    ? "opacity-75 border-dashed border-slate-700"
                    : "hover:border-[var(--color-brand-blue)]/50"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {isUpdating && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-blue)] animate-ping flex-shrink-0" />
                      )}
                      <p className={`font-bold text-[11px] sm:text-xs uppercase truncate ${!isUserActive ? "text-slate-400 line-through" : "text-slate-100"}`}>
                        {fullName}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {currentRole === "manager" && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm bg-amber-500/10 border border-amber-500/40 text-amber-300">
                          Manager
                        </span>
                      )}
                      {currentRole === "foreman" && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm bg-cyan-500/10 border border-cyan-500/40 text-cyan-300">
                          Foreman
                        </span>
                      )}
                      {!isUserActive && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm bg-red-500/10 border border-red-500/30 text-[var(--color-brand-red,#ff3b5c)]">
                          Archived
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-1.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      PTS: <span className="font-black tabular-nums text-[var(--color-metric-meetings)]">{user.points_balance || 0}</span>
                    </p>
                    <span className="text-[9px] px-1.5 py-0.5 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-slate-300 font-bold uppercase truncate max-w-[130px]">
                      {currentLoc}
                    </span>
                  </div>
                </div>

                {/* DUAL ACTION CONTROLS: ROLE + SITE LOCATION */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--color-brand-border)]/50">
                  {/* Location Selector */}
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-bold uppercase text-slate-400 tracking-wider block">
                      Site Assignment
                    </span>
                    <select
                      value={currentLoc}
                      disabled={isUpdating || !isUserActive}
                      onChange={(e) => handleTransfer(user.id, e.target.value)}
                      className="w-full min-h-[34px] text-[10px] text-slate-200 font-bold uppercase px-2 py-1 outline-none transition-all cursor-pointer disabled:opacity-40 rounded-sm border bg-[var(--color-brand-card)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)]"
                    >
                      {(locations || []).map((loc) => (
                        <option key={loc} value={loc} className="bg-[var(--color-brand-card)] text-white">
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Role Selector */}
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-bold uppercase text-slate-400 tracking-wider block">
                      Access Role
                    </span>
                    <select
                      value={currentRole}
                      disabled={isUpdating || !isUserActive}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="w-full min-h-[34px] text-[10px] text-slate-200 font-bold uppercase px-2 py-1 outline-none transition-all cursor-pointer disabled:opacity-40 rounded-sm border bg-[var(--color-brand-card)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)]"
                    >
                      {AVAILABLE_ROLES.map((r) => (
                        <option key={r.value} value={r.value} className="bg-[var(--color-brand-card)] text-white">
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ARCHIVE / RESTORE TOGGLE */}
                <div className="flex justify-end pt-1">
                  {isUserActive ? (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleToggleStatus(user, false)}
                      className="w-full min-h-[28px] text-[9px] font-black uppercase tracking-wider border rounded-sm transition-all text-slate-400 border-[var(--color-brand-border)] hover:border-[var(--color-brand-red,#ff3b5c)] hover:text-[var(--color-brand-red,#ff3b5c)] hover:bg-[var(--color-brand-red,#ff3b5c)]/10 disabled:opacity-50 cursor-pointer text-center"
                      title="Deactivate employee from active roster"
                    >
                      Archive Employee
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleToggleStatus(user, true)}
                      className="w-full min-h-[28px] text-[9px] font-black uppercase tracking-wider border rounded-sm transition-all text-[var(--color-brand-blue)] border-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue)] hover:text-white disabled:opacity-50 cursor-pointer text-center"
                      title="Reactivate employee to active roster"
                    >
                      Restore to Active
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}