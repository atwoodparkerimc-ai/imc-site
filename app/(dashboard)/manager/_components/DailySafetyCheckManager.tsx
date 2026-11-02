// app/(dashboard)/manager/_components/DailySafetyCheckManager.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getOrCreateDailySafetySheet,
  saveDailySafetySheet,
  BASE_STANDARD_WINDOWS,
  OPTIONAL_OT_WINDOW,
  SafetyCheckSheetRecord,
  SafetyCheckEntryRecord,
  SafetyCheckWindowDef,
  computeRowSpans,
} from "@/lib/db/dailySafetyCheckOperations";
import { printSafetyCheckLedger } from "@/lib/reports/dailySafetyCheckPrint";
import { motion, AnimatePresence } from "framer-motion";

interface DailySafetyCheckManagerProps {
  supabase: any;
  currentUserId: string;
  currentUserName: string;
  selectedLocation: string;
  locations?: string[];
}

type TimelineScope = "DAY" | "WEEK" | "MONTH" | "CUSTOM";

export default function DailySafetyCheckManager({
  supabase,
  currentUserId,
  currentUserName,
  selectedLocation,
  locations = ["Nestle Springville", "Springville Shop"],
}: DailySafetyCheckManagerProps) {
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const availableLocations = useMemo(() => {
    const list = (locations || []).filter((l) => l !== "ALL");
    return list.length > 0 ? list : ["Nestle Springville", "Springville Shop"];
  }, [locations]);

  const [currentLocation, setCurrentLocation] = useState<string>(
    selectedLocation && selectedLocation !== "ALL" ? selectedLocation : availableLocations[0]
  );

  // Sheet State
  const [activeDate, setActiveDate] = useState<string>(todayStr);
  const [sheet, setSheet] = useState<SafetyCheckSheetRecord | null>(null);
  const [entries, setEntries] = useState<SafetyCheckEntryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Controlled Header Inputs (Guarantees immediate sync on print)
  const [safetyTopicInput, setSafetyTopicInput] = useState<string>("");
  const [auditorNameInput, setAuditorNameInput] = useState<string>(currentUserName);

  // Dynamic Shift Windows State
  const [isOtActive, setIsOtActive] = useState(false);
  const [customWindows, setCustomWindows] = useState<SafetyCheckWindowDef[]>([]);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // Subcontractor Add Inputs
  const [newSubName, setNewSubName] = useState("");
  const [newSubAgency, setNewSubAgency] = useState("");

  // Historical Ledger Archives State
  const [pastSheets, setPastSheets] = useState<any[]>([]);
  const [isLoadingPast, setIsLoadingPast] = useState(false);

  // Multi-Timeline Export Modal
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [timelineScope, setTimelineScope] = useState<TimelineScope>("DAY");
  const [customRangeStart, setCustomRangeStart] = useState<string>(todayStr);
  const [customRangeEnd, setCustomRangeEnd] = useState<string>(todayStr);
  const [isGeneratingExport, setIsGeneratingExport] = useState(false);

  // 1. Fetch Past Historical Sheets for Current Location
  const loadPastSheets = useCallback(async (loc: string) => {
    setIsLoadingPast(true);
    try {
      const { data, error } = await supabase
        .from("daily_safety_check_sheets")
        .select("*, entries:daily_safety_check_entries(*)")
        .ilike("location", `%${loc.trim()}%`)
        .order("check_date", { ascending: false });

      if (!error && Array.isArray(data)) {
        setPastSheets(data);
      }
    } catch (err) {
      console.error("Failed to load historical safety sheets:", err);
    } finally {
      setIsLoadingPast(false);
    }
  }, [supabase]);

  // 2. Load Sheet for Active Date
  const loadSheet = useCallback(
    async (dateToLoad: string, locToLoad: string) => {
      setIsLoading(true);
      const data = await getOrCreateDailySafetySheet(
        supabase,
        dateToLoad,
        locToLoad,
        auditorNameInput || currentUserName
      );

      setSheet(data);
      setEntries(data.entries || []);
      setSafetyTopicInput(data.safety_topic || "");
      if (data.auditor_name && data.auditor_name.trim()) {
        setAuditorNameInput(data.auditor_name);
      } else if (!auditorNameInput) {
        setAuditorNameInput(currentUserName);
      }

      const hasOt = (data.active_window_keys || []).includes(OPTIONAL_OT_WINDOW.id);
      setIsOtActive(hasOt);
      setCustomWindows(data.custom_windows || []);
      setIsLoading(false);
    },
    [supabase, auditorNameInput, currentUserName]
  );

  useEffect(() => {
    loadSheet(activeDate, currentLocation);
    loadPastSheets(currentLocation);
  }, [loadSheet, loadPastSheets, activeDate, currentLocation]);

  const orderedWindows = useMemo(() => {
    const list: SafetyCheckWindowDef[] = [...BASE_STANDARD_WINDOWS];
    if (isOtActive) {
      list.push(OPTIONAL_OT_WINDOW);
    }
    return [...list, ...customWindows];
  }, [isOtActive, customWindows]);

  const handleToggleCell = (workerIndex: number, windowId: string) => {
    setEntries((prev) => {
      const copy = [...prev];
      const target = { ...copy[workerIndex] };
      const currentStatus = target.window_checks[windowId] || "OFF";
      target.window_checks = {
        ...target.window_checks,
        [windowId]: currentStatus === "FIT" ? "OFF" : "FIT",
      };
      copy[workerIndex] = target;
      return copy;
    });
  };

  const handleUpdateComments = (workerIndex: number, value: string) => {
    setEntries((prev) => {
      const copy = [...prev];
      copy[workerIndex] = { ...copy[workerIndex], comments: value };
      return copy;
    });
  };

  const handlePassAllForWorker = (workerIndex: number) => {
    setEntries((prev) => {
      const copy = [...prev];
      const target = { ...copy[workerIndex] };
      const allFit: Record<string, "FIT"> = {};
      orderedWindows.forEach((w) => {
        allFit[w.id] = "FIT";
      });
      target.window_checks = allFit;
      copy[workerIndex] = target;
      return copy;
    });
  };

  const handleMarkOffForDay = (workerIndex: number) => {
    setEntries((prev) => {
      const copy = [...prev];
      const target = { ...copy[workerIndex] };
      target.window_checks = {};
      copy[workerIndex] = target;
      return copy;
    });
  };

  const handleMarkLeftEarlyFrom = (workerIndex: number, fromWindowId: string) => {
    const fromIdx = orderedWindows.findIndex((w) => w.id === fromWindowId);
    if (fromIdx === -1) return;

    setEntries((prev) => {
      const copy = [...prev];
      const target = { ...copy[workerIndex] };
      const updatedChecks = { ...target.window_checks };

      for (let i = fromIdx; i < orderedWindows.length; i++) {
        delete updatedChecks[orderedWindows[i].id];
      }

      target.window_checks = updatedChecks;
      target.comments = target.comments
        ? `${target.comments} | Left early`
        : `Left early at ${orderedWindows[fromIdx].start_time}`;
      copy[workerIndex] = target;
      return copy;
    });
  };

  const handlePassFullShiftAllActive = () => {
    setEntries((prev) =>
      prev.map((worker) => {
        const allFit: Record<string, "FIT"> = {};
        orderedWindows.forEach((w) => {
          allFit[w.id] = "FIT";
        });
        return {
          ...worker,
          window_checks: allFit,
        };
      })
    );
  };

  const handleAddSub = () => {
    if (!newSubName.trim()) return;
    const newEntry: SafetyCheckEntryRecord = {
      worker_type: "SUB",
      worker_name: newSubName.trim(),
      craft_role: newSubAgency.trim() || "Subcontractor",
      window_checks: {},
      comments: "",
      sort_order: entries.length,
    };
    setEntries((prev) => [...prev, newEntry]);
    setNewSubName("");
    setNewSubAgency("");
  };

  const handleRemoveSub = (index: number) => {
    setEntries((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddCustomWindow = () => {
    if (!customStart.trim() || !customEnd.trim()) return;
    const newDef: SafetyCheckWindowDef = {
      id: `w_custom_${Date.now()}`,
      label: `${customStart.trim()} – ${customEnd.trim()}`,
      start_time: customStart.trim(),
      end_time: customEnd.trim(),
    };
    setCustomWindows((prev) => [...prev, newDef]);
    setCustomStart("");
    setCustomEnd("");
  };

  const handleRemoveCustomWindow = (id: string) => {
    setCustomWindows((prev) => prev.filter((w) => w.id !== id));
  };

  const handleSaveSheet = async () => {
    if (!sheet) return;
    setIsSaving(true);

    const activeKeys = [
      ...BASE_STANDARD_WINDOWS.map((w) => w.id),
      ...(isOtActive ? [OPTIONAL_OT_WINDOW.id] : []),
      ...customWindows.map((w) => w.id),
    ];

    const res = await saveDailySafetySheet(
      supabase,
      {
        ...sheet,
        check_date: activeDate,
        location: currentLocation,
        safety_topic: safetyTopicInput,
        auditor_name: auditorNameInput,
        active_window_keys: activeKeys,
        custom_windows: customWindows,
      },
      entries
    );

    setIsSaving(false);
    if (!res.success) {
      alert(`Error saving sheet: ${res.error}`);
    } else {
      await loadSheet(activeDate, currentLocation);
      await loadPastSheets(currentLocation);
    }
  };

  // Immediate printout of current active sheet
  const handlePrintCurrentDay = () => {
    if (!sheet) return;
    printSafetyCheckLedger([
      {
        sheet: {
          ...sheet,
          check_date: activeDate,
          location: currentLocation,
          safety_topic: safetyTopicInput,
          auditor_name: auditorNameInput || currentUserName,
          entries,
        },
        orderedWindows,
      },
    ]);
  };

  // Direct print of any specific historical sheet record
  const handlePrintSpecificSheet = (pastRecord: any) => {
    const hasOt = (pastRecord.active_window_keys || []).includes(OPTIONAL_OT_WINDOW.id);
    const winList = [...BASE_STANDARD_WINDOWS];
    if (hasOt) winList.push(OPTIONAL_OT_WINDOW);
    const fullWindows = [...winList, ...(pastRecord.custom_windows || [])];

    printSafetyCheckLedger([
      {
        sheet: pastRecord,
        orderedWindows: fullWindows,
      },
    ]);
  };

  // Delete a historical sheet
  const handleDeleteSheet = async (sheetId: string, dateStr: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the Daily Safety Check log for ${dateStr} (${currentLocation})? This cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from("daily_safety_check_sheets")
        .delete()
        .eq("id", sheetId);

      if (error) {
        alert(`Failed to delete record: ${error.message}`);
      } else {
        await loadPastSheets(currentLocation);
        if (activeDate === dateStr) {
          await loadSheet(activeDate, currentLocation);
        }
      }
    } catch (err: any) {
      alert(`Delete error: ${err?.message || err}`);
    }
  };

  // Batch Export Multi-Timeline
  const handleExecuteBatchExport = async () => {
    setIsGeneratingExport(true);
    try {
      let query = supabase
        .from("daily_safety_check_sheets")
        .select("*, entries:daily_safety_check_entries(*)")
        .ilike("location", `%${currentLocation.trim()}%`);

      const now = new Date();
      if (timelineScope === "DAY") {
        query = query.eq("check_date", activeDate);
      } else if (timelineScope === "WEEK") {
        const pastWeek = new Date();
        pastWeek.setDate(now.getDate() - 7);
        query = query.gte("check_date", pastWeek.toISOString().split("T")[0]);
      } else if (timelineScope === "MONTH") {
        const pastMonth = new Date();
        pastMonth.setDate(now.getDate() - 30);
        query = query.gte("check_date", pastMonth.toISOString().split("T")[0]);
      } else if (timelineScope === "CUSTOM") {
        query = query
          .gte("check_date", customRangeStart)
          .lte("check_date", customRangeEnd);
      }

      const { data: sheetsData, error } = await query.order("check_date", { ascending: true });

      if (error || !sheetsData || sheetsData.length === 0) {
        alert(`No safety check sheets found for ${currentLocation} within this timeframe.`);
        setIsGeneratingExport(false);
        return;
      }

      const printPayload = sheetsData.map((s: any) => {
        const hasOt = (s.active_window_keys || []).includes(OPTIONAL_OT_WINDOW.id);
        const winList = [...BASE_STANDARD_WINDOWS];
        if (hasOt) winList.push(OPTIONAL_OT_WINDOW);
        const fullWindows = [...winList, ...(s.custom_windows || [])];
        return {
          sheet: s,
          orderedWindows: fullWindows,
        };
      });

      printSafetyCheckLedger(printPayload);
      setIsExportModalOpen(false);
    } catch (err: any) {
      alert(`Export failed: ${err?.message || err}`);
    } finally {
      setIsGeneratingExport(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-mono text-slate-100 select-none pb-8">
      {/* HEADER BAR */}
      <div className="border p-4 sm:p-6 rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-none animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              Shift Personnel Compliance &amp; Hazard Check
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black uppercase text-slate-100 mt-1">
            Daily Safety Checks Roster
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-0.5">
            Active Roster Date: <span className="text-white">{activeDate}</span> • Location:{" "}
            <span className="text-cyan-400">{currentLocation}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Worksite Dropdown */}
          <div className="flex items-center gap-1.5 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] px-2.5 py-1 rounded-sm">
            <label className="text-[10px] font-bold uppercase text-slate-400">Worksite:</label>
            <select
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
              className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer"
            >
              {availableLocations.map((loc) => (
                <option key={loc} value={loc} className="bg-slate-900 text-white">
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-1.5 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] px-2.5 py-1 rounded-sm">
            <label className="text-[10px] font-bold uppercase text-slate-400">Date:</label>
            <input
              type="date"
              value={activeDate}
              onChange={(e) => setActiveDate(e.target.value)}
              className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={handlePassFullShiftAllActive}
            className="px-3.5 py-2 text-xs font-black uppercase bg-emerald-600 hover:bg-emerald-500 text-white rounded-sm transition-all cursor-pointer shadow-md active:scale-[0.98]"
          >
            ⚡ Pass Shift (All Crew)
          </button>

          <button
            type="button"
            onClick={handlePrintCurrentDay}
            className="px-3 py-2 text-xs font-bold uppercase bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] hover:border-white text-slate-200 rounded-sm cursor-pointer"
            title="Print Today's Safety Check Sheet"
          >
            🖨️ Print Sheet
          </button>

          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="px-3 py-2 text-xs font-bold uppercase bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] hover:border-white text-slate-200 rounded-sm cursor-pointer"
          >
            ⎙ Batch Export
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveSheet}
            className="px-5 py-2 text-xs font-black uppercase bg-[var(--color-brand-blue)] text-white hover:bg-white hover:text-black rounded-sm cursor-pointer transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Sheet ↗"}
          </button>
        </div>
      </div>

      {/* METADATA BAR & WINDOW MANAGEMENT */}
      <div className="border p-4 rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
        <div className="md:col-span-5 space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Daily Safety Topic (Auto-Linked from Today's Meeting):
            </label>
            {safetyTopicInput && (
              <span className="text-[9px] font-bold uppercase text-emerald-400">✓ Linked</span>
            )}
          </div>
          <input
            type="text"
            value={safetyTopicInput}
            onChange={(e) => setSafetyTopicInput(e.target.value)}
            placeholder="e.g. Line 4 Process Line Isolation & Barricading Protocols"
            className="w-full px-3 py-1.5 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] text-slate-100 rounded-sm outline-none font-bold"
          />
        </div>

        <div className="md:col-span-3 space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Auditor / Safety Lead Name:
          </label>
          <input
            type="text"
            value={auditorNameInput}
            onChange={(e) => setAuditorNameInput(e.target.value)}
            className="w-full px-3 py-1.5 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] text-slate-100 rounded-sm outline-none font-bold"
          />
        </div>

        <div className="md:col-span-4 flex flex-col justify-between space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Shift Schedule Windows:
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsOtActive(!isOtActive)}
              className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-sm border cursor-pointer ${
                isOtActive
                  ? "bg-amber-500/20 border-amber-500/60 text-amber-300"
                  : "bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] text-slate-400"
              }`}
            >
              {isOtActive ? "✓ OT Window (3:30-5:00)" : "+ Enable OT (3:30-5:00)"}
            </button>

            {customWindows.map((cw) => (
              <span
                key={cw.id}
                className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm border bg-cyan-500/10 border-cyan-500/40 text-cyan-300 flex items-center gap-1"
              >
                {cw.label}
                <button
                  type="button"
                  onClick={() => handleRemoveCustomWindow(cw.id)}
                  className="text-red-400 hover:text-white ml-1 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CHECKLIST TABLE */}
      <div className="border rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
            Loading safety checks roster for {currentLocation}...
          </div>
        ) : entries.length === 0 ? (
          <div className="p-10 text-center border border-dashed border-[var(--color-brand-border)] text-slate-500 text-xs font-bold uppercase tracking-widest">
            [ No active personnel assigned to {currentLocation}. Add subcontractors or crew members below ]
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-[var(--color-brand-bg)] border-b border-[var(--color-brand-border)] text-slate-300 uppercase text-[10px]">
                  <th className="p-2.5 text-left w-64 border-r border-[var(--color-brand-border)]">Worker Legal Name</th>
                  {orderedWindows.map((w) => (
                    <th key={w.id} className="p-2 text-center border-r border-[var(--color-brand-border)] min-w-[75px]">
                      <div>{w.start_time}</div>
                      <div className="text-[9px] text-slate-500 font-normal">{w.end_time}</div>
                    </th>
                  ))}
                  <th className="p-2 text-left min-w-[220px] border-r border-[var(--color-brand-border)]">Notes / Shift Status</th>
                  <th className="p-2 text-center w-28">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-brand-border)] font-mono">
                {/* 1. EMPLOYEES */}
                {entries
                  .map((worker, idx) => ({ worker, idx }))
                  .filter(({ worker }) => worker.worker_type === "EMPLOYEE")
                  .map(({ worker, idx }) => {
                    const spans = computeRowSpans(orderedWindows, worker.window_checks || {});
                    return (
                      <tr key={worker.worker_id || idx} className="hover:bg-slate-900/40">
                        <td className="p-2.5 border-r border-[var(--color-brand-border)] font-bold text-white uppercase text-xs">
                          {worker.worker_name}
                          <span className="block text-[9px] font-normal text-slate-400">{worker.craft_role || "Crew"}</span>
                        </td>

                        {spans.map((span, spanIdx) => {
                          if (span.type === "FIT") {
                            return (
                              <td
                                key={`${span.windowId}-${spanIdx}`}
                                onClick={() => handleToggleCell(idx, span.windowId!)}
                                className="p-2 text-center border-r border-[var(--color-brand-border)] cursor-pointer bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-black text-sm select-none"
                              >
                                X
                              </td>
                            );
                          }
                          return (
                            <td
                              key={`merged-off-${spanIdx}`}
                              colSpan={span.colSpan}
                              onClick={() => {
                                const targetDef = orderedWindows[spanIdx] || orderedWindows[0];
                                handleToggleCell(idx, targetDef.id);
                              }}
                              className="p-2 text-center border-r border-[var(--color-brand-border)] cursor-pointer bg-slate-950/60 hover:bg-slate-800 text-slate-500 font-bold text-[10px] tracking-wider uppercase select-none"
                            >
                              [ OFF ]
                            </td>
                          );
                        })}

                        <td className="p-1.5 border-r border-[var(--color-brand-border)]">
                          <input
                            type="text"
                            value={worker.comments || ""}
                            onChange={(e) => handleUpdateComments(idx, e.target.value)}
                            placeholder="Inline notes..."
                            className="w-full bg-transparent px-2 py-1 text-slate-200 text-xs outline-none"
                          />
                        </td>

                        <td className="p-1.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handlePassAllForWorker(idx)}
                              className="px-2 py-0.5 text-[9px] font-black uppercase bg-emerald-600 hover:bg-emerald-500 text-white rounded-xs cursor-pointer"
                              title="Mark FIT for entire day"
                            >
                              Pass
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMarkLeftEarlyFrom(idx, "w5")}
                              className="px-2 py-0.5 text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black rounded-xs cursor-pointer"
                              title="Left early at 12:30"
                            >
                              Left 12:30
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMarkOffForDay(idx)}
                              className="px-2 py-0.5 text-[9px] font-bold uppercase bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xs cursor-pointer"
                              title="Mark Absent for entire shift"
                            >
                              Off
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                {/* 2. SUBCONTRACTORS HEADER */}
                <tr className="bg-yellow-400/90 text-black font-black uppercase tracking-widest text-xs">
                  <td colSpan={orderedWindows.length + 3} className="py-1 px-3 text-center">
                    SUB&apos;S (SUBCONTRACTORS &amp; TEMPORARY TRADES)[cite: 2]
                  </td>
                </tr>

                {/* 3. SUBCONTRACTORS LIST */}
                {entries.filter((w) => w.worker_type === "SUB").length === 0 ? (
                  <tr>
                    <td colSpan={orderedWindows.length + 3} className="p-4 text-center text-slate-500 italic text-xs">
                      [ No subcontractors logged for this shift. Add below if temp trades are on site ]
                    </td>
                  </tr>
                ) : (
                  entries
                    .map((worker, idx) => ({ worker, idx }))
                    .filter(({ worker }) => worker.worker_type === "SUB")
                    .map(({ worker, idx }) => {
                      const spans = computeRowSpans(orderedWindows, worker.window_checks || {});
                      return (
                        <tr key={`sub-${idx}`} className="bg-yellow-500/5 hover:bg-yellow-500/10">
                          <td className="p-2.5 border-r border-[var(--color-brand-border)] font-bold text-yellow-300 uppercase text-xs flex justify-between items-center">
                            <span>
                              {worker.worker_name}
                              <span className="block text-[9px] font-normal text-slate-400">{worker.craft_role}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSub(idx)}
                              className="text-red-400 hover:text-white px-1 font-bold cursor-pointer"
                              title="Remove subcontractor"
                            >
                              ✕
                            </button>
                          </td>

                          {spans.map((span, spanIdx) => {
                            if (span.type === "FIT") {
                              return (
                                <td
                                  key={`sub-${span.windowId}-${spanIdx}`}
                                  onClick={() => handleToggleCell(idx, span.windowId!)}
                                  className="p-2 text-center border-r border-[var(--color-brand-border)] cursor-pointer bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-black text-sm select-none"
                                >
                                  X
                                </td>
                              );
                            }
                            return (
                              <td
                                key={`sub-off-${spanIdx}`}
                                colSpan={span.colSpan}
                                onClick={() => {
                                  const targetDef = orderedWindows[spanIdx] || orderedWindows[0];
                                  handleToggleCell(idx, targetDef.id);
                                }}
                                className="p-2 text-center border-r border-[var(--color-brand-border)] cursor-pointer bg-slate-950/60 hover:bg-slate-800 text-slate-500 font-bold text-[10px] tracking-wider uppercase select-none"
                              >
                                [ OFF ]
                              </td>
                            );
                          })}

                          <td className="p-1.5 border-r border-[var(--color-brand-border)]">
                            <input
                              type="text"
                              value={worker.comments || ""}
                              onChange={(e) => handleUpdateComments(idx, e.target.value)}
                              placeholder="Sub notes..."
                              className="w-full bg-transparent px-2 py-1 text-slate-200 text-xs outline-none"
                            />
                          </td>

                          <td className="p-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => handlePassAllForWorker(idx)}
                              className="px-2 py-0.5 text-[9px] font-black uppercase bg-emerald-600 hover:bg-emerald-500 text-white rounded-xs cursor-pointer"
                            >
                              Pass
                            </button>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* BOTTOM SUB ADD & SHIFT EXPANSION */}
        <div className="p-3 border-t border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-yellow-400">+ Add Sub:</span>
            <input
              type="text"
              value={newSubName}
              onChange={(e) => setNewSubName(e.target.value)}
              placeholder="Subcontractor Name"
              className="px-2 py-1 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-white text-xs rounded-sm outline-none"
            />
            <input
              type="text"
              value={newSubAgency}
              onChange={(e) => setNewSubAgency(e.target.value)}
              placeholder="Agency / Trade"
              className="px-2 py-1 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-white text-xs rounded-sm outline-none"
            />
            <button
              type="button"
              onClick={handleAddSub}
              className="px-3 py-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase rounded-sm text-[10px] cursor-pointer"
            >
              Add Sub
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-cyan-400">+ Add Window:</span>
            <input
              type="text"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              placeholder="Start (e.g. 05:00)"
              className="w-24 px-2 py-1 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-white text-xs rounded-sm outline-none"
            />
            <input
              type="text"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              placeholder="End (e.g. 06:30)"
              className="w-24 px-2 py-1 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-white text-xs rounded-sm outline-none"
            />
            <button
              type="button"
              onClick={handleAddCustomWindow}
              className="px-3 py-1 bg-cyan-700 hover:bg-cyan-600 text-white font-bold uppercase rounded-sm text-[10px] cursor-pointer"
            >
              Add Window
            </button>
          </div>
        </div>
      </div>

      {/* DAILY COMMENTS */}
      <div className="border p-4 rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
          Daily Comments (Shift Hazards, Housekeeping, Site Notes):
        </label>
        <textarea
          rows={3}
          value={sheet?.general_comments || ""}
          onChange={(e) => setSheet((prev) => (prev ? { ...prev, general_comments: e.target.value } : null))}
          placeholder="Document all general workplace observations, cross-crew coordination notices, or audit notes..."
          className="w-full p-2.5 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] text-slate-100 rounded-sm outline-none text-xs"
        />
      </div>

      {/* HISTORICAL LEDGERS ARCHIVE SECTION */}
      <div className="border rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[var(--color-brand-border)] pb-2.5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand-blue)]">
              Historical Compliance Records
            </span>
            <h3 className="text-xs sm:text-sm font-black uppercase text-white">
              Past Safety Check Ledgers ({currentLocation})
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {pastSheets.length} Recorded Shift{pastSheets.length === 1 ? "" : "s"}
          </span>
        </div>

        {isLoadingPast ? (
          <div className="p-8 text-center text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">
            Loading historical archives...
          </div>
        ) : pastSheets.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-[var(--color-brand-border)] rounded-sm text-slate-500 text-xs font-bold uppercase tracking-widest">
            [ No past safety check logs recorded for {currentLocation} yet ]
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pastSheets.map((pastRecord) => {
              const isSelected = pastRecord.check_date === activeDate;
              const entriesCount = pastRecord.entries?.length || 0;
              const subCount = (pastRecord.entries || []).filter((e: any) => e.worker_type === "SUB").length;

              return (
                <div
                  key={pastRecord.id || pastRecord.check_date}
                  className={`p-3.5 border rounded-sm transition-all flex flex-col justify-between gap-3 ${
                    isSelected
                      ? "bg-[var(--color-brand-bg)] border-[var(--color-brand-blue)] shadow-md"
                      : "bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] hover:border-slate-500"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-black uppercase text-white">
                        📅 {pastRecord.check_date}
                      </span>
                      {isSelected ? (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-xs bg-[var(--color-brand-blue)]/20 border border-[var(--color-brand-blue)] text-[var(--color-brand-blue)]">
                          Active Editor
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-xs bg-slate-800 border border-slate-700 text-slate-300">
                          {entriesCount} Crew {subCount > 0 ? `(${subCount} Subs)` : ""}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] font-bold text-slate-300 line-clamp-1 uppercase">
                      Topic: <span className="font-normal text-slate-400">{pastRecord.safety_topic || "Shift Briefing"}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Lead: <strong className="text-slate-200">{pastRecord.auditor_name || "Unassigned"}</strong>
                    </p>
                  </div>

                  {/* Actions for this Historical Record */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-[var(--color-brand-border)]">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDate(pastRecord.check_date);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="flex-1 py-1 px-2 text-[10px] font-black uppercase bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-sm cursor-pointer transition-colors"
                    >
                      ✏️ Open &amp; Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePrintSpecificSheet(pastRecord)}
                      className="py-1 px-2.5 text-[10px] font-black uppercase bg-[var(--color-brand-blue)] hover:bg-white hover:text-black text-white rounded-sm cursor-pointer transition-colors"
                      title="Print this sheet"
                    >
                      🖨️
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSheet(pastRecord.id, pastRecord.check_date)}
                      className="py-1 px-2 text-[10px] font-bold uppercase bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/30 text-red-400 rounded-sm cursor-pointer transition-colors"
                      title="Delete this record"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* EXPORT MULTI-TIMELINE MODAL */}
      <AnimatePresence>
        {isExportModalOpen && (
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-3 bg-black/90 backdrop-blur-md font-mono text-slate-100 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-lg border rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] shadow-2xl p-5 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-[var(--color-brand-border)] pb-3">
                <h3 className="text-sm font-black uppercase text-white">
                  Batch Export Daily Safety Rosters ({currentLocation})
                </h3>
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer px-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Select Scope:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "DAY", label: "Selected Day" },
                    { id: "WEEK", label: "Past 7 Days" },
                    { id: "MONTH", label: "Past 30 Days" },
                    { id: "CUSTOM", label: "Custom Dates" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTimelineScope(opt.id as TimelineScope)}
                      className={`py-2 px-2 border rounded-sm text-center uppercase font-bold text-[11px] cursor-pointer transition-colors ${
                        timelineScope === opt.id
                          ? "border-[var(--color-brand-blue)] bg-[var(--color-brand-blue)]/15 text-white font-black"
                          : "border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] text-slate-400"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {timelineScope === "CUSTOM" && (
                  <div className="p-3 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] rounded-sm grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">From Date</label>
                      <input
                        type="date"
                        value={customRangeStart}
                        onChange={(e) => setCustomRangeStart(e.target.value)}
                        className="w-full bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] p-1.5 text-xs text-white rounded-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">To Date</label>
                      <input
                        type="date"
                        value={customRangeEnd}
                        onChange={(e) => setCustomRangeEnd(e.target.value)}
                        className="w-full bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] p-1.5 text-xs text-white rounded-sm outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[var(--color-brand-border)]">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="px-4 py-2 border border-[var(--color-brand-border)] text-slate-400 hover:text-white uppercase font-bold text-xs rounded-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isGeneratingExport}
                  onClick={handleExecuteBatchExport}
                  className="px-6 py-2 bg-[var(--color-brand-blue)] text-white hover:bg-white hover:text-black uppercase font-black text-xs rounded-sm cursor-pointer transition-all disabled:opacity-50"
                >
                  {isGeneratingExport ? "Generating PDF..." : "Print Batch Reports ↗"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}