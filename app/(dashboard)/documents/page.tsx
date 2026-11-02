// app/(dashboard)/documents/page.tsx
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { 
  getTodayToolInspection, 
  getEmployeeToolbox,
  getEmployeeProfile,
  getLocationPaperworkUrl,
  EmployeeToolboxItem,
  DailyToolInspectionRecord,
  UserProfile
} from "@/lib/db/operations";
import { 
  getCurrentMonthTapeColor, 
  isToolPowered,
  isNestleSpringville 
} from "@/lib/data/toolCatalog";
import {
  ForkTruckInspectionRecord,
  getTodayForkTruckInspections
} from "@/lib/db/forkTruckOperations";
import {
  ScissorLiftInspectionRecord,
  getTodayScissorLiftInspections
} from "@/lib/db/scissorLiftOperations";
import {
  BoomLiftInspectionRecord,
  getTodayBoomLiftInspections
} from "@/lib/db/boomLiftOperations";
import {
  FallProtectionRecord,
  getTodayFallProtectionInspections
} from "@/lib/db/fallProtectionOperations";
import {
  LadderInspectionRecord,
  getTodayLadderInspections
} from "@/lib/db/ladderOperations";

import DailyJobsPage from "../daily-jobs/page";
import MiddayToolAddModal from "../dashboard/_components/MiddayToolAddModal";
import DailyForkTruckModal from "../dashboard/_components/DailyForkTruckModal";
import DailyScissorLiftModal from "../dashboard/_components/DailyScissorLiftModal";
import DailyBoomLiftModal from "../dashboard/_components/DailyBoomLiftModal";
import DailyFallProtectionModal from "../dashboard/_components/DailyFallProtectionModal";
import DailyLadderModal from "../dashboard/_components/DailyLadderModal";

export default function DocumentsPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [activeTab, setActiveTab] = useState<"daily_permits" | "tools" | "jha" | "paperwork">("daily_permits");
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [paperworkUrl, setPaperworkUrl] = useState<string | null>(null);

  // Today's Inspection Stores
  const [todayInspection, setTodayInspection] = useState<DailyToolInspectionRecord | null>(null);
  const [todayForkliftRecords, setTodayForkliftRecords] = useState<ForkTruckInspectionRecord[]>([]);
  const [todayScissorRecords, setTodayScissorRecords] = useState<ScissorLiftInspectionRecord[]>([]);
  const [todayBoomRecords, setTodayBoomRecords] = useState<BoomLiftInspectionRecord[]>([]);
  const [todayFallRecords, setTodayFallRecords] = useState<FallProtectionRecord[]>([]);
  const [todayLadderRecords, setTodayLadderRecords] = useState<LadderInspectionRecord[]>([]);
  const [userToolbox, setUserToolbox] = useState<EmployeeToolboxItem[]>([]);
  
  // Modals
  const [isAddToolModalOpen, setIsAddToolModalOpen] = useState(false);
  
  // Forklift
  const [isForkModalOpen, setIsForkModalOpen] = useState(false);
  const [selectedForkliftToView, setSelectedForkliftToView] = useState<ForkTruckInspectionRecord | null>(null);
  const [forkModalMode, setForkModalMode] = useState<"create" | "view">("create");

  // Scissor Lift
  const [isScissorModalOpen, setIsScissorModalOpen] = useState(false);
  const [selectedScissorToView, setSelectedScissorToView] = useState<ScissorLiftInspectionRecord | null>(null);
  const [scissorModalMode, setScissorModalMode] = useState<"create" | "view">("create");

  // Boom Lift
  const [isBoomModalOpen, setIsBoomModalOpen] = useState(false);
  const [selectedBoomToView, setSelectedBoomToView] = useState<BoomLiftInspectionRecord | null>(null);
  const [boomModalMode, setBoomModalMode] = useState<"create" | "view">("create");

  // Fall Protection
  const [isFallModalOpen, setIsFallModalOpen] = useState(false);
  const [selectedFallToView, setSelectedFallToView] = useState<FallProtectionRecord | null>(null);
  const [fallModalMode, setFallModalMode] = useState<"create" | "view">("create");

  // Ladder
  const [isLadderModalOpen, setIsLadderModalOpen] = useState(false);
  const [selectedLadderToView, setSelectedLadderToView] = useState<LadderInspectionRecord | null>(null);
  const [ladderModalMode, setLadderModalMode] = useState<"create" | "view">("create");

  const currentMonth = useMemo(() => getCurrentMonthTapeColor(), []);
  const todayDateStr = useMemo(() => new Date().toLocaleDateString("en-CA"), []);

  const loadDailyPermits = useCallback(async (userId: string, loc: string) => {
    if (isNestleSpringville(loc)) {
      const [inspection, toolbox, forklifts, scissors, booms, fallProts, ladders] = await Promise.all([
        getTodayToolInspection(supabase, userId),
        getEmployeeToolbox(supabase, userId),
        getTodayForkTruckInspections(supabase, userId, todayDateStr),
        getTodayScissorLiftInspections(supabase, userId, todayDateStr),
        getTodayBoomLiftInspections(supabase, userId, todayDateStr),
        getTodayFallProtectionInspections(supabase, userId, todayDateStr),
        getTodayLadderInspections(supabase, userId, todayDateStr),
      ]);

      setTodayInspection(inspection);
      setUserToolbox(toolbox);
      setTodayForkliftRecords(forklifts);
      setTodayScissorRecords(scissors);
      setTodayBoomRecords(booms);
      setTodayFallRecords(fallProts);
      setTodayLadderRecords(ladders);

      if (loc) {
        const url = await getLocationPaperworkUrl(supabase, loc);
        setPaperworkUrl(url);
      }
    }
  }, [supabase, todayDateStr]);

  useEffect(() => {
    async function initPage() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const profile = await getEmployeeProfile(supabase, user.id);
        setUserProfile(profile);

        if (profile?.id) {
          await loadDailyPermits(profile.id, profile.location || "");
        }
      } catch (err) {
        console.error("Documents station load error:", err);
      } finally {
        setLoading(false);
      }
    }

    initPage();
  }, [supabase, router, loadDailyPermits]);

  const isSpringvilleSite = isNestleSpringville(userProfile?.location);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center font-mono text-xs text-[var(--color-brand-blue)] animate-pulse py-24">
        ACCESSING FIELD COMPLIANCE BINDER...
      </div>
    );
  }

  if (!isSpringvilleSite) {
    return (
      <div className="max-w-4xl mx-auto p-6 font-mono text-slate-100 flex-1 flex flex-col justify-center items-center text-center space-y-4">
        <div className="p-6 rounded-sm border border-amber-500/40 bg-amber-500/10 max-w-lg space-y-3 shadow-xl">
          <span className="text-3xl block">🔒</span>
          <h2 className="text-sm font-black uppercase text-amber-300">
            Location Restricted Documentation
          </h2>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            The Tool Inspection Checklist, Daily JHA Field Tasks, and Digital Safety Permit modules are currently active solely for teams operating at <strong>Nestlé Springville</strong>.
          </p>
          <div className="pt-2 border-t border-amber-500/20 text-[10px] text-slate-400 font-mono">
            Assigned Profile Worksite: <strong className="text-white">{userProfile?.location || "Unassigned"}</strong>
          </div>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="mt-2 px-5 py-2 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] hover:border-white text-xs font-bold uppercase rounded-sm text-slate-200 transition-colors cursor-pointer"
          >
            ← Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const assignedSite = (userProfile?.location || "Nestle Springville").toUpperCase();
  const operatorLegalName = userProfile
    ? `${userProfile.first_name || ""} ${userProfile.last_name || ""}`.trim() || userProfile.nickname || "Operator"
    : "Operator";

  const totalPermitsCompleted =
    (todayInspection ? 1 : 0) +
    todayForkliftRecords.length +
    todayScissorRecords.length +
    todayBoomRecords.length +
    todayFallRecords.length +
    todayLadderRecords.length;

  return (
    <div className="max-w-[1500px] w-full mx-auto p-3.5 sm:p-8 pt-4 sm:pt-8 pb-16 font-mono text-slate-100 select-none flex-1 flex flex-col space-y-4 sm:space-y-6">
      
      {/* 1. DOCUMENT HEADER & TELEMETRY BAR */}
      <div className="border p-4 sm:p-6 rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-[var(--color-brand-blue)]" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-none bg-[var(--color-brand-blue)] animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand-blue)]">
                Active Field Operations Station
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-slate-100 uppercase tracking-tighter mt-1">
              Safety Documents &amp; Field Hub
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-0.5">
              Site: <span className="text-white">{assignedSite}</span> • Shift: {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="border px-3 py-2 rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] flex-1 md:flex-initial text-center md:text-left">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Monthly Tape</span>
              <span className="text-xs font-black uppercase text-amber-300">
                {currentMonth.monthName} ({currentMonth.color})
              </span>
            </div>

            <div className="border px-3 py-2 rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] flex-1 md:flex-initial text-center md:text-left">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Shift Permitted</span>
              <span className={`text-xs font-black uppercase ${totalPermitsCompleted > 0 ? "text-emerald-400" : "text-amber-400"}`}>
                {totalPermitsCompleted > 0 ? `✓ ${totalPermitsCompleted} Active Clearances` : "Pending Action"}
              </span>
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex gap-2 sm:gap-4 border-b mt-6 pb-px overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 border-[var(--color-brand-border)]">
          {[
            { id: "daily_permits", label: `Today's Filled Permits (${totalPermitsCompleted})` },
            { id: "tools", label: `Tool Inspection (${todayInspection?.tools_inspected?.length || 0})` },
            { id: "jha", label: "Daily JHAs & Field Tasks" },
            { id: "paperwork", label: "Site Forms & Permits" }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`min-h-[44px] pb-2.5 sm:pb-3 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap outline-none focus:outline-none shrink-0 ${
                  isActive 
                    ? "border-[var(--color-brand-blue)] text-[var(--color-brand-blue)] font-black" 
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. TAB CONTENT VIEWS */}

      {/* TAB 0: TODAY'S FILLED PERMITS & SUBMITTED DOCUMENTS */}
      {activeTab === "daily_permits" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
          <div className="border rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] p-4 sm:p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-none bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  Daily Shift Paperwork Clearance ({todayDateStr})
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black uppercase text-slate-100 mt-1">
                Completed Permits &amp; Equipment Inspections
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                All daily clearances valid solely for today&apos;s shift. Permits automatically archive at midnight.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("paperwork")}
              className="w-full md:w-auto min-h-[44px] px-5 py-2.5 bg-[var(--color-brand-blue)] text-white hover:bg-white hover:text-black text-xs font-black uppercase tracking-wider rounded-sm cursor-pointer shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>+</span>
              <span>Open New Permit / Inspection</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* FORKLIFTS */}
            {todayForkliftRecords.map((forklift, idx) => (
              <div
                key={forklift.id || idx}
                className="p-4 sm:p-5 border rounded-sm flex flex-col justify-between gap-4 bg-[var(--color-brand-bg)] border-emerald-500/40 shadow-lg"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-xs bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-cyan-400">
                      IMC-SAF-0015
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-xs border bg-emerald-500/10 border-emerald-500/40 text-emerald-300">
                      ✓ In Service Today
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black uppercase text-white">
                      Forklift / PIT Unit: {forklift.lift_number}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      Daily pre-use physical clearance logged &amp; verified.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--color-brand-border)] text-[11px]">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Unit #</span>
                      <strong className="text-cyan-400 font-mono text-xs">{forklift.lift_number}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Driver License</span>
                      <span className="text-emerald-400 font-mono text-xs">
                        {forklift.license_expiration_date ? `Exp: ${forklift.license_expiration_date}` : "Current On File"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Signed Time</span>
                      <span className="text-slate-300 font-mono text-[10px]">
                        {forklift.signed_at ? new Date(forklift.signed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Operator Initials</span>
                      <span className="text-white font-mono font-bold text-xs">{forklift.operator_initials}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--color-brand-border)] flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedForkliftToView(forklift);
                      setForkModalMode("view");
                      setIsForkModalOpen(true);
                    }}
                    className="w-full px-4 py-2 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] hover:border-white text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer text-center"
                  >
                    View Submitted Permit ↗
                  </button>
                </div>
              </div>
            ))}

            {/* SCISSOR LIFTS */}
            {todayScissorRecords.map((scissor, idx) => (
              <div
                key={scissor.id || idx}
                className="p-4 sm:p-5 border rounded-sm flex flex-col justify-between gap-4 bg-[var(--color-brand-bg)] border-emerald-500/40 shadow-lg"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-xs bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-cyan-400">
                      IMC-SAF-0019
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-xs border bg-emerald-500/10 border-emerald-500/40 text-emerald-300">
                      ✓ In Service Today
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black uppercase text-white">
                      Scissor Lift: {scissor.model}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      Pre-start clearance with assigned ground watcher.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--color-brand-border)] text-[11px]">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Serial / Unit #</span>
                      <strong className="text-cyan-400 font-mono text-xs">{scissor.serial_number}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Spotter / Watcher</span>
                      <span className="text-white font-mono text-xs">{scissor.buddy_name}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Signed Time</span>
                      <span className="text-slate-300 font-mono text-[10px]">
                        {scissor.signed_at ? new Date(scissor.signed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Operator Initials</span>
                      <span className="text-white font-mono font-bold text-xs">{scissor.operator_initials}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--color-brand-border)] flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedScissorToView(scissor);
                      setScissorModalMode("view");
                      setIsScissorModalOpen(true);
                    }}
                    className="w-full px-4 py-2 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] hover:border-white text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer text-center"
                  >
                    View Submitted Permit ↗
                  </button>
                </div>
              </div>
            ))}

            {/* BOOM LIFTS */}
            {todayBoomRecords.map((boom, idx) => (
              <div
                key={boom.id || idx}
                className="p-4 sm:p-5 border rounded-sm flex flex-col justify-between gap-4 bg-[var(--color-brand-bg)] border-emerald-500/40 shadow-lg"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-xs bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-cyan-400">
                      IMC-SAF-0012
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-xs border bg-emerald-500/10 border-emerald-500/40 text-emerald-300">
                      ✓ In Service Today
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black uppercase text-white">
                      Boom Lift: {boom.model}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      Pre-work equipment and reach elevations verified.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--color-brand-border)] text-[11px]">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Serial / Unit #</span>
                      <strong className="text-cyan-400 font-mono text-xs">{boom.serial_number}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Watcher</span>
                      <span className="text-white font-mono text-xs">{boom.buddy_name || "Assigned"}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Signed Time</span>
                      <span className="text-slate-300 font-mono text-[10px]">
                        {boom.signed_at ? new Date(boom.signed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Operator Initials</span>
                      <span className="text-white font-mono font-bold text-xs">{boom.operator_initials}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--color-brand-border)] flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBoomToView(boom);
                      setBoomModalMode("view");
                      setIsBoomModalOpen(true);
                    }}
                    className="w-full px-4 py-2 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] hover:border-white text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer text-center"
                  >
                    View Submitted Permit ↗
                  </button>
                </div>
              </div>
            ))}

            {/* FALL PROTECTION HARNESSES */}
            {todayFallRecords.map((fallProt, idx) => (
              <div
                key={fallProt.id || idx}
                className="p-4 sm:p-5 border rounded-sm flex flex-col justify-between gap-4 bg-[var(--color-brand-bg)] border-emerald-500/40 shadow-lg"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-xs bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-cyan-400">
                      IMC-SAF-0016
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-xs border bg-emerald-500/10 border-emerald-500/40 text-emerald-300">
                      ✓ In Service Today
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black uppercase text-white">
                      Harness &amp; SRL: {fallProt.equipment_number}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      Tactile &amp; visual inverted "U" check complete.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--color-brand-border)] text-[11px]">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Unit #</span>
                      <strong className="text-cyan-400 font-mono text-xs">{fallProt.equipment_number}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Department</span>
                      <span className="text-emerald-400 font-mono text-xs font-bold">IMC</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Signed Time</span>
                      <span className="text-slate-300 font-mono text-[10px]">
                        {fallProt.signed_at ? new Date(fallProt.signed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">User Initials</span>
                      <span className="text-white font-mono font-bold text-xs">{fallProt.operator_initials}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--color-brand-border)] flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFallToView(fallProt);
                      setFallModalMode("view");
                      setIsFallModalOpen(true);
                    }}
                    className="w-full px-4 py-2 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] hover:border-white text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer text-center"
                  >
                    View Submitted Permit ↗
                  </button>
                </div>
              </div>
            ))}

            {/* LADDERS */}
            {todayLadderRecords.map((ladder, idx) => (
              <div
                key={ladder.id || idx}
                className="p-4 sm:p-5 border rounded-sm flex flex-col justify-between gap-4 bg-[var(--color-brand-bg)] border-emerald-500/40 shadow-lg"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-xs bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-cyan-400">
                      IMC-SAF-0013
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-xs border bg-emerald-500/10 border-emerald-500/40 text-emerald-300">
                      ✓ In Service Today
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black uppercase text-white">
                      Ladder Unit: {ladder.ladder_id_number}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      Rungs, rails, and feet verified sound.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--color-brand-border)] text-[11px]">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Stencil #</span>
                      <strong className="text-cyan-400 font-mono text-xs">{ladder.ladder_id_number}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Area</span>
                      <span className="text-emerald-400 font-mono text-xs uppercase truncate block">{ladder.work_area}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Signed Time</span>
                      <span className="text-slate-300 font-mono text-[10px]">
                        {ladder.signed_at ? new Date(ladder.signed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Inspector</span>
                      <span className="text-white font-mono font-bold text-xs">{ladder.operator_initials}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--color-brand-border)] flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLadderToView(ladder);
                      setLadderModalMode("view");
                      setIsLadderModalOpen(true);
                    }}
                    className="w-full px-4 py-2 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] hover:border-white text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer text-center"
                  >
                    View Submitted Permit ↗
                  </button>
                </div>
              </div>
            ))}

            {/* TOOL CLEARANCE */}
            {todayInspection && (
              <div className="p-4 sm:p-5 border rounded-sm flex flex-col justify-between gap-4 bg-[var(--color-brand-bg)] border-emerald-500/40 shadow-lg">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-xs bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-amber-400">
                      IMC-SAF-0022
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-xs border bg-emerald-500/10 border-emerald-500/40 text-emerald-300">
                      ✓ In Service
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black uppercase text-white">
                      Daily Tool Clearance
                    </h3>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      Shift gear inspection with {currentMonth.monthName} tape verification.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--color-brand-border)] text-[11px]">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Inspected</span>
                      <strong className="text-white font-mono text-xs">{todayInspection.tools_inspected?.length || 0} Tools</strong>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Monthly Tape</span>
                      <span className="text-amber-300 font-bold uppercase text-xs">
                        {todayInspection.tape_color_verified || currentMonth.color}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Status</span>
                      <span className="text-emerald-400 font-mono font-bold text-xs">Passed</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Date</span>
                      <span className="text-slate-300 font-mono text-xs">{todayInspection.inspection_date}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--color-brand-border)] flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab("tools")}
                    className="w-full px-4 py-2 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] hover:border-white text-slate-200 text-xs font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer text-center"
                  >
                    Inspect Tool Roster ↗
                  </button>
                </div>
              </div>
            )}

            {/* EMPTY STATE */}
            {totalPermitsCompleted === 0 && (
              <div className="col-span-full p-8 border border-dashed border-slate-700 bg-[var(--color-brand-card)]/40 rounded-sm text-center space-y-3">
                <p className="text-xs font-bold uppercase text-slate-400">
                  [ No permits or equipment inspections recorded for today ({todayDateStr}) ]
                </p>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  If operating heavy machinery, aerial lifts, working at heights, or climbing ladders today, please complete your pre-use inspection checklist.
                </p>
              </div>
            )}

          </div>
        </motion.div>
      )}

      {/* TAB A: TOOL INSPECTION */}
      {activeTab === "tools" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
          <div className="border rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] p-4 sm:p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase text-slate-100">
                Today&apos;s Inspected Equipment
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                All hand &amp; power tools certified under standard inspection protocols for this operational shift.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddToolModalOpen(true)}
              className="w-full md:w-auto min-h-[44px] px-5 py-2.5 bg-[var(--color-brand-blue)] hover:bg-white hover:text-black text-white text-xs font-black uppercase tracking-wider rounded-sm cursor-pointer shadow-[0_0_15px_rgba(0,136,255,0.25)] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <span>+</span>
              <span>Check Out Additional Tools</span>
            </button>
          </div>

          <div className="border rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] overflow-hidden shadow-xl">
            <div className="p-4 border-b border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
                Live Equipment in Service ({todayInspection?.tools_inspected?.length || 0})
              </span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase">
                Active Tape: {todayInspection?.tape_color_verified || currentMonth.color}
              </span>
            </div>

            {(!todayInspection || !todayInspection.tools_inspected || todayInspection.tools_inspected.length === 0) ? (
              <div className="p-12 text-center space-y-2">
                <p className="text-xs font-bold uppercase text-slate-400">
                  [ No tool inspections recorded for today&apos;s shift ]
                </p>
                <p className="text-[11px] text-slate-500">
                  Complete your morning safety briefing and tool check to initialize today&apos;s shift binder.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/safety")}
                  className="mt-3 px-4 py-2 bg-[var(--color-brand-blue)] text-white text-xs font-black uppercase rounded-sm hover:bg-white hover:text-black cursor-pointer"
                >
                  Go to Morning Safety Check →
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-brand-border)]">
                {todayInspection.tools_inspected.map((toolName, idx) => {
                  const powered = isToolPowered(toolName);
                  return (
                    <div key={idx} className="p-3.5 sm:px-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-slate-500 w-6">
                          #{idx + 1}
                        </span>
                        <div>
                          <span className="text-xs sm:text-sm font-bold uppercase text-white block">
                            {toolName}
                          </span>
                          <span className="text-[9px] uppercase font-mono text-slate-400">
                            {powered ? `Tape Verified (${todayInspection.tape_color_verified})` : "Non-Powered • Visual Check"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                          ✓ In Service / Passed
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* TAB B: DAILY JHA (EMPLOYEE VIEW & ROSTER SIGN-OFF) */}
      {activeTab === "jha" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <DailyJobsPage />
        </motion.div>
      )}

      {/* TAB C: SITE FORMS & PERMITS */}
      {activeTab === "paperwork" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          
          {/* 1. Daily Forklift Inspection Launcher */}
          <div className="border p-5 rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-blue)]">
                Vehicle &amp; Equipment Safety
              </span>
              <h3 className="text-sm sm:text-base font-black uppercase text-white mt-1">
                Daily Fork Truck Inspection Checklist
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Mandatory pre-use visual and operational checklist before operating any forklift or powered industrial truck.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedForkliftToView(null);
                setForkModalMode("create");
                setIsForkModalOpen(true);
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-[var(--color-brand-blue)] hover:bg-white hover:text-black text-white text-xs font-black uppercase tracking-wider rounded-sm transition-all shadow-md cursor-pointer shrink-0"
            >
              + Inspect Forklift / Unit ↗
            </button>
          </div>

          {/* 2. Scissor Lift Inspection Launcher */}
          <div className="border p-5 rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-blue)]">
                Aerial Lift &amp; Access Equipment
              </span>
              <h3 className="text-sm sm:text-base font-black uppercase text-white mt-1">
                Scissor Lift Pre-Start Inspection Checklist
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Mandatory pre-start report for scissor lifts with designated ground spotter verification.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedScissorToView(null);
                setScissorModalMode("create");
                setIsScissorModalOpen(true);
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-[var(--color-brand-blue)] hover:bg-white hover:text-black text-white text-xs font-black uppercase tracking-wider rounded-sm transition-all shadow-md cursor-pointer shrink-0"
            >
              + Inspect Scissor Lift ↗
            </button>
          </div>

          {/* 3. Boom Lift Inspection Launcher */}
          <div className="border p-5 rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-blue)]">
                Aerial Lift &amp; Access Equipment
              </span>
              <h3 className="text-sm sm:text-base font-black uppercase text-white mt-1">
                Boom Lift Pre-Work Inspection
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Mandatory pre-work report for boom lifts covering ground controls, hydraulics, and elevation agreements.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedBoomToView(null);
                setBoomModalMode("create");
                setIsBoomModalOpen(true);
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-[var(--color-brand-blue)] hover:bg-white hover:text-black text-white text-xs font-black uppercase tracking-wider rounded-sm transition-all shadow-md cursor-pointer shrink-0"
            >
              + Inspect Boom Lift ↗
            </button>
          </div>

          {/* 4. Fall Protection Harness & SRL Checklist Launcher */}
          <div className="border p-5 rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-blue)]">
                Working at Heights &amp; Fall Arrest
              </span>
              <h3 className="text-sm sm:text-base font-black uppercase text-white mt-1">
                Fall Protection Harness &amp; SRL Checklist
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Mandatory pre-use tactile &amp; visual inverted "U" check for body harnesses, lifelines, and snaphooks.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedFallToView(null);
                setFallModalMode("create");
                setIsFallModalOpen(true);
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-[var(--color-brand-blue)] hover:bg-white hover:text-black text-white text-xs font-black uppercase tracking-wider rounded-sm transition-all shadow-md cursor-pointer shrink-0"
            >
              + Inspect Harness / SRL ↗
            </button>
          </div>

          {/* 5. Ladder Safety Checklist Launcher */}
          <div className="border p-5 rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-blue)]">
                Access Equipment &amp; Working Surfaces
              </span>
              <h3 className="text-sm sm:text-base font-black uppercase text-white mt-1">
                Ladder Safety &amp; Pre-Use Checklist
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Mandatory pre-use check for step, extension, and combination ladders before climb.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedLadderToView(null);
                setLadderModalMode("create");
                setIsLadderModalOpen(true);
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-[var(--color-brand-blue)] hover:bg-white hover:text-black text-white text-xs font-black uppercase tracking-wider rounded-sm transition-all shadow-md cursor-pointer shrink-0"
            >
              + Inspect Ladder Unit ↗
            </button>
          </div>

          {/* 6. Facility Portal */}
          <div className="border p-6 rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] shadow-xl space-y-4">
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase text-white">
                Mandatory Facility Documentation
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Client-specific digital safety portals, Hot Work permits, Confined Space Entry logs, and SDS binders.
              </p>
            </div>

            {paperworkUrl ? (
              <div className="border p-4 rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-blue)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-xs font-black uppercase text-[var(--color-brand-blue)] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-blue)] animate-ping" />
                    {assignedSite} Digital Paperwork Hub
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Primary compliance URL assigned to your active work location.
                  </p>
                </div>
                <a
                  href={paperworkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-2.5 bg-[var(--color-brand-blue)] hover:bg-white hover:text-black text-white text-xs font-black uppercase tracking-wider rounded-sm transition-all text-center"
                >
                  Launch Facility Portal ↗
                </a>
              </div>
            ) : (
              <div className="p-8 border border-dashed border-[var(--color-brand-border)] rounded-sm text-center text-slate-500 text-xs font-bold uppercase">
                [ No custom paperwork URL configured for your current job site ]
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* FORKLIFT MODAL */}
      <DailyForkTruckModal
        supabase={supabase}
        isOpen={isForkModalOpen}
        onClose={async () => {
          setIsForkModalOpen(false);
          setSelectedForkliftToView(null);
          if (userProfile?.id) {
            await loadDailyPermits(userProfile.id, userProfile.location || "");
          }
        }}
        userId={userProfile?.id || ""}
        userName={operatorLegalName}
        userRole={userProfile?.role || "employee"}
        location={userProfile?.location || "Nestle Springville"}
        existingRecord={selectedForkliftToView}
        mode={forkModalMode}
      />

      {/* SCISSOR LIFT MODAL */}
      <DailyScissorLiftModal
        supabase={supabase}
        isOpen={isScissorModalOpen}
        onClose={async () => {
          setIsScissorModalOpen(false);
          setSelectedScissorToView(null);
          if (userProfile?.id) {
            await loadDailyPermits(userProfile.id, userProfile.location || "");
          }
        }}
        userId={userProfile?.id || ""}
        userName={operatorLegalName}
        userRole={userProfile?.role || "employee"}
        location={userProfile?.location || "Nestle Springville"}
        existingRecord={selectedScissorToView}
        mode={scissorModalMode}
      />

      {/* BOOM LIFT MODAL */}
      <DailyBoomLiftModal
        supabase={supabase}
        isOpen={isBoomModalOpen}
        onClose={async () => {
          setIsBoomModalOpen(false);
          setSelectedBoomToView(null);
          if (userProfile?.id) {
            await loadDailyPermits(userProfile.id, userProfile.location || "");
          }
        }}
        userId={userProfile?.id || ""}
        userName={operatorLegalName}
        userRole={userProfile?.role || "employee"}
        location={userProfile?.location || "Nestle Springville"}
        existingRecord={selectedBoomToView}
        mode={boomModalMode}
      />

      {/* FALL PROTECTION MODAL */}
      <DailyFallProtectionModal
        supabase={supabase}
        isOpen={isFallModalOpen}
        onClose={async () => {
          setIsFallModalOpen(false);
          setSelectedFallToView(null);
          if (userProfile?.id) {
            await loadDailyPermits(userProfile.id, userProfile.location || "");
          }
        }}
        userId={userProfile?.id || ""}
        userName={operatorLegalName}
        location={userProfile?.location || "Nestle Springville"}
        existingRecord={selectedFallToView}
        mode={fallModalMode}
      />

      {/* LADDER MODAL */}
      <DailyLadderModal
        supabase={supabase}
        isOpen={isLadderModalOpen}
        onClose={async () => {
          setIsLadderModalOpen(false);
          setSelectedLadderToView(null);
          if (userProfile?.id) {
            await loadDailyPermits(userProfile.id, userProfile.location || "");
          }
        }}
        userId={userProfile?.id || ""}
        userName={operatorLegalName}
        location={userProfile?.location || "Nestle Springville"}
        existingRecord={selectedLadderToView}
        mode={ladderModalMode}
      />

      {/* MIDDAY TOOL APPEND MODAL */}
      <MiddayToolAddModal
        supabase={supabase}
        isOpen={isAddToolModalOpen}
        onClose={() => setIsAddToolModalOpen(false)}
        userProfile={userProfile}
        userToolbox={userToolbox}
        todayInspection={todayInspection}
        currentMonth={currentMonth}
        onToolsAppended={(updated: string[]) => {
          setTodayInspection((prev) => (prev ? { ...prev, tools_inspected: updated } : null));
        }}
      />
    </div>
  );
}