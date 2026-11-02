// app/(dashboard)/manager/_components/FallProtectionAuditPanel.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  FallProtectionRecord,
  getFallProtectionHistory,
  saveFallProtectionInspection,
  SRL_CHECK_ITEMS,
  HARNESS_CHECK_ITEMS,
} from "@/lib/db/fallProtectionOperations";
import { printFallProtectionReport } from "@/lib/reports/fallProtectionPrint";
import { motion, AnimatePresence } from "framer-motion";

interface FallProtectionAuditPanelProps {
  supabase: any;
  selectedLocation: string;
}

type TimelineScope = "DAY" | "WEEK" | "MONTH" | "CUSTOM";

export default function FallProtectionAuditPanel({
  supabase,
  selectedLocation,
}: FallProtectionAuditPanelProps) {
  const todayStr = useMemo(() => new Date().toLocaleDateString("en-CA"), []);

  const [records, setRecords] = useState<FallProtectionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [editingRecord, setEditingRecord] = useState<FallProtectionRecord | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [timelineScope, setTimelineScope] = useState<TimelineScope>("DAY");
  const [singleDate, setSingleDate] = useState<string>(todayStr);
  const [customRangeStart, setCustomRangeStart] = useState<string>(todayStr);
  const [customRangeEnd, setCustomRangeEnd] = useState<string>(todayStr);
  const [isExporting, setIsExporting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const data = await getFallProtectionHistory(supabase, selectedLocation);
    setRecords(data);
    setIsLoading(false);
  }, [supabase, selectedLocation]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return records;
    return records.filter(
      (r) =>
        (r.employee_name || "").toLowerCase().includes(q) ||
        (r.equipment_number || "").toLowerCase().includes(q) ||
        (r.inspection_date || "").includes(q)
    );
  }, [records, searchQuery]);

  const handleSaveManagerEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    setIsSavingEdit(true);

    const res = await saveFallProtectionInspection(supabase, editingRecord);
    setIsSavingEdit(false);

    if (res.success) {
      setEditingRecord(null);
      await loadData();
    } else {
      alert(`Error saving updates: ${res.error}`);
    }
  };

  const handleDeleteRecord = async (id?: string) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this harness inspection record?")) return;

    const { error } = await supabase
      .from("daily_fall_protection_inspections")
      .delete()
      .eq("id", id);

    if (error) {
      alert(`Failed to delete record: ${error.message}`);
    } else {
      setRecords((prev) => prev.filter((r) => r.id !== id));
      if (editingRecord?.id === id) setEditingRecord(null);
    }
  };

  const handleExecuteBatchPrint = async () => {
    setIsExporting(true);
    try {
      let query = supabase
        .from("daily_fall_protection_inspections")
        .select("*")
        .ilike("location", `%${selectedLocation === "ALL" ? "" : selectedLocation.trim()}%`);

      const now = new Date();
      if (timelineScope === "DAY") {
        query = query.eq("inspection_date", singleDate);
      } else if (timelineScope === "WEEK") {
        const pastWeek = new Date();
        pastWeek.setDate(now.getDate() - 7);
        query = query.gte("inspection_date", pastWeek.toISOString().split("T")[0]);
      } else if (timelineScope === "MONTH") {
        const pastMonth = new Date();
        pastMonth.setDate(now.getDate() - 30);
        query = query.gte("inspection_date", pastMonth.toISOString().split("T")[0]);
      } else if (timelineScope === "CUSTOM") {
        query = query
          .gte("inspection_date", customRangeStart)
          .lte("inspection_date", customRangeEnd);
      }

      const { data, error } = await query.order("inspection_date", { ascending: false });

      if (error || !data || data.length === 0) {
        alert("No harness inspection records found within this timeframe.");
        setIsExporting(false);
        return;
      }

      printFallProtectionReport(data as FallProtectionRecord[]);
      setIsExportModalOpen(false);
    } catch (err: any) {
      alert(`Export error: ${err?.message || err}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4 font-mono text-slate-100 select-none">
      <div className="border p-4 sm:p-5 rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand-blue)]">
            Fall Protection Standard (OSHA 1926.502)
          </span>
          <h2 className="text-base sm:text-lg font-black uppercase text-white mt-0.5">
            Harness &amp; SRL Inspection Ledger
          </h2>
          <p className="text-xs text-slate-400">
            Worksite: <strong className="text-white">{selectedLocation}</strong> • Total Records: {records.length}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search User / Harness #..."
            className="px-3 py-2 text-xs bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] rounded-sm text-white uppercase outline-none min-w-[200px]"
          />

          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="px-4 py-2 bg-[var(--color-brand-blue)] hover:bg-white hover:text-black text-white text-xs font-black uppercase rounded-sm cursor-pointer shadow-md transition-all flex items-center gap-1.5"
          >
            <span>⎙</span>
            <span>Batch Export Reports</span>
          </button>
        </div>
      </div>

      <div className="border rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">
            Loading fall protection archives...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-10 text-center border border-dashed border-[var(--color-brand-border)] text-slate-500 text-xs font-bold uppercase">
            [ No fall protection inspection logs found matching query ]
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-[var(--color-brand-bg)] border-b border-[var(--color-brand-border)] text-slate-300 uppercase text-[10px]">
                  <th className="p-3 text-left">Shift Date</th>
                  <th className="p-3 text-left">Employee Legal Name</th>
                  <th className="p-3 text-left">Dept</th>
                  <th className="p-3 text-left">Harness / Unit #</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-brand-border)]">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-mono font-bold text-white">{r.inspection_date}</td>
                    <td className="p-3 font-bold uppercase text-slate-200">{r.employee_name}</td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">IMC</td>
                    <td className="p-3 font-mono text-cyan-400 font-bold">{r.equipment_number}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-xs bg-emerald-500/10 border border-emerald-500/40 text-emerald-300">
                        ✓ PASSED
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingRecord({ ...r })}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold uppercase rounded-sm cursor-pointer"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => printFallProtectionReport([r])}
                          className="px-2.5 py-1 bg-[var(--color-brand-blue)] hover:bg-white hover:text-black text-white text-[10px] font-bold uppercase rounded-sm cursor-pointer"
                          title="Print single permit"
                        >
                          🖨️
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRecord(r.id)}
                          className="px-2 py-1 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/30 text-red-400 text-[10px] font-bold uppercase rounded-sm cursor-pointer"
                          title="Delete record"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MANAGER EDIT MODAL */}
      <AnimatePresence>
        {editingRecord && (
          <div className="fixed inset-0 z-[10002] flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md select-none font-mono">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full max-w-3xl h-[88vh] max-h-[88vh] flex flex-col border rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] flex justify-between items-center shrink-0">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[var(--color-brand-blue)] tracking-wider">
                    Manager Override &amp; Review
                  </span>
                  <h3 className="text-sm font-black uppercase text-white">
                    Edit Harness Check: {editingRecord.employee_name} ({editingRecord.inspection_date})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveManagerEdit} className="flex-1 flex flex-col min-h-0 overflow-hidden text-xs">
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] rounded-sm">
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Harness/Unit #</label>
                      <input
                        type="text"
                        value={editingRecord.equipment_number}
                        onChange={(e) => setEditingRecord({ ...editingRecord, equipment_number: e.target.value })}
                        className="w-full bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] p-1.5 rounded-sm text-white font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Department</label>
                      <span className="block p-1.5 font-bold text-emerald-400 font-mono">IMC</span>
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Initials</label>
                      <input
                        type="text"
                        value={editingRecord.operator_initials}
                        onChange={(e) => setEditingRecord({ ...editingRecord, operator_initials: e.target.value.toUpperCase() })}
                        className="w-full bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] p-1.5 rounded-sm text-white font-bold uppercase outline-none"
                      />
                    </div>
                  </div>

                  {/* Comments */}
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-slate-400 block">Manager / Inspection Notes:</label>
                    <textarea
                      rows={3}
                      value={editingRecord.comments || ""}
                      onChange={(e) => setEditingRecord({ ...editingRecord, comments: e.target.value })}
                      className="w-full p-2 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] text-white rounded-sm outline-none text-xs"
                    />
                  </div>
                </div>

                <div className="p-3.5 border-t border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] flex justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingRecord(null)}
                    className="px-4 py-2 border border-[var(--color-brand-border)] text-slate-400 hover:text-white uppercase font-bold text-xs rounded-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="px-6 py-2 bg-[var(--color-brand-blue)] hover:bg-white hover:text-black text-white uppercase font-black text-xs rounded-sm cursor-pointer transition-all"
                  >
                    {isSavingEdit ? "Saving..." : "Save Changes ↗"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BATCH EXPORT MODAL */}
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
                  Batch Export Fall Protection Reports
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
                    { id: "DAY", label: "Single Day" },
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

                {timelineScope === "DAY" && (
                  <div className="p-3 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] rounded-sm">
                    <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Target Date</label>
                    <input
                      type="date"
                      value={singleDate}
                      onChange={(e) => setSingleDate(e.target.value)}
                      className="w-full bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] p-1.5 text-xs text-white rounded-sm outline-none cursor-pointer"
                    />
                  </div>
                )}

                {timelineScope === "CUSTOM" && (
                  <div className="p-3 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] rounded-sm grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">From Date</label>
                      <input
                        type="date"
                        value={customRangeStart}
                        onChange={(e) => setCustomRangeStart(e.target.value)}
                        className="w-full bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] p-1.5 text-xs text-white rounded-sm outline-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">To Date</label>
                      <input
                        type="date"
                        value={customRangeEnd}
                        onChange={(e) => setCustomRangeEnd(e.target.value)}
                        className="w-full bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] p-1.5 text-xs text-white rounded-sm outline-none cursor-pointer"
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
                  disabled={isExporting}
                  onClick={handleExecuteBatchPrint}
                  className="px-6 py-2 bg-[var(--color-brand-blue)] text-white hover:bg-white hover:text-black uppercase font-black text-xs rounded-sm cursor-pointer transition-all disabled:opacity-50"
                >
                  {isExporting ? "Generating PDF..." : "Print Batch Reports ↗"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}