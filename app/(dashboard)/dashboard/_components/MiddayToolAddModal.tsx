// app/dashboard/_components/MiddayToolAddModal.tsx
"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  appendToolsToTodayInspection,
  EmployeeToolboxItem,
  DailyToolInspectionRecord,
  UserProfile,
} from "@/lib/db/operations";
import { MASTER_TOOL_LIST } from "@/lib/data/toolCatalog";

interface MiddayToolAddModalProps {
  supabase: any;
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  userToolbox: EmployeeToolboxItem[];
  todayInspection: DailyToolInspectionRecord | null;
  currentMonth: { monthName: string; color: string };
  onToolsAppended: (updatedTools: string[]) => void;
}

export default function MiddayToolAddModal({
  supabase,
  isOpen,
  onClose,
  userProfile,
  userToolbox,
  todayInspection,
  currentMonth,
  onToolsAppended,
}: MiddayToolAddModalProps) {
  const [selectedToolsToAdd, setSelectedToolsToAdd] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [customToolInput, setCustomToolInput] = useState("");
  const [isSubmittingAppend, setIsSubmittingAppend] = useState(false);
  const [appendFeedback, setAppendFeedback] = useState<string | null>(null);
  const [complianceChecked, setComplianceChecked] = useState(false);

  // Combine user toolbox items and master catalog for checkout selector
  const availableToolsList = useMemo(() => {
    const checkedTodaySet = new Set(
      (todayInspection?.tools_inspected || []).map((t) => t.toLowerCase())
    );

    // Prioritize tools in their personal toolbox
    const personal = userToolbox
      .filter((t) => !checkedTodaySet.has(t.tool_name.toLowerCase()))
      .map((t) => ({ name: t.tool_name, category: t.category, isPersonal: true }));

    const personalNames = new Set(personal.map((p) => p.name.toLowerCase()));

    // Fallback catalog tools
    const general = MASTER_TOOL_LIST
      .filter(
        (t) =>
          !checkedTodaySet.has(t.name.toLowerCase()) &&
          !personalNames.has(t.name.toLowerCase())
      )
      .map((t) => ({ name: t.name, category: t.category, isPersonal: false }));

    const combined = [...personal, ...general];
    if (!searchQuery.trim()) return combined;

    return combined.filter((t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [userToolbox, todayInspection, searchQuery]);

  const toggleToolSelection = (toolName: string) => {
    setSelectedToolsToAdd((prev) =>
      prev.includes(toolName)
        ? prev.filter((t) => t !== toolName)
        : [...prev, toolName]
    );
  };

  const handleAddCustomTool = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customToolInput.trim();
    if (!clean) return;
    if (!selectedToolsToAdd.includes(clean)) {
      setSelectedToolsToAdd((prev) => [...prev, clean]);
    }
    setCustomToolInput("");
  };

  const handleConfirmMiddayAppend = async () => {
    if (!userProfile?.id || selectedToolsToAdd.length === 0 || !complianceChecked)
      return;

    setIsSubmittingAppend(true);
    setAppendFeedback(null);

    const result = await appendToolsToTodayInspection(
      supabase,
      userProfile.id,
      selectedToolsToAdd
    );

    if (result.success && result.updatedTools) {
      onToolsAppended(result.updatedTools);
      setAppendFeedback(
        `Successfully checked out ${selectedToolsToAdd.length} additional tool(s).`
      );
      setSelectedToolsToAdd([]);
      setComplianceChecked(false);
      setTimeout(() => {
        onClose();
        setAppendFeedback(null);
      }, 1500);
    } else {
      setAppendFeedback(`Failed: ${result.error || "Could not append tools."}`);
    }

    setIsSubmittingAppend(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm select-none font-mono">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] rounded-sm shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100"
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-[var(--color-brand-border)] flex justify-between items-center bg-[var(--color-brand-bg)] shrink-0">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-blue)] block">
                  Mid-Shift Equipment Check
                </span>
                <h3 className="text-sm font-black uppercase text-white">
                  Check Out Additional Tools
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar text-xs">
              {appendFeedback && (
                <div
                  className={`p-2.5 rounded-sm text-xs font-bold uppercase ${
                    appendFeedback.startsWith("Success")
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                      : "bg-red-500/10 border border-red-500/30 text-red-300"
                  }`}
                >
                  {appendFeedback}
                </div>
              )}

              {/* Custom Tool Input Form */}
              <form onSubmit={handleAddCustomTool} className="flex gap-2">
                <input
                  type="text"
                  value={customToolInput}
                  onChange={(e) => setCustomToolInput(e.target.value)}
                  placeholder="TYPE CUSTOM TOOL NAME..."
                  className="flex-1 px-3 py-2 text-xs uppercase bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] text-white rounded-sm outline-none focus:border-[var(--color-brand-blue)]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--color-brand-blue)] hover:bg-white hover:text-black text-white text-xs font-black uppercase rounded-sm cursor-pointer whitespace-nowrap"
                >
                  + Add
                </button>
              </form>

              {/* Search Bar */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="FILTER FROM TOOLBOX OR MASTER CATALOG..."
                className="w-full px-3 py-2 text-xs uppercase bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] text-white rounded-sm outline-none focus:border-[var(--color-brand-blue)]"
              />

              {/* Selected Queue Tags */}
              {selectedToolsToAdd.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Queue to Append ({selectedToolsToAdd.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedToolsToAdd.map((name) => (
                      <span
                        key={name}
                        onClick={() => toggleToolSelection(name)}
                        className="px-2 py-1 text-xs font-bold uppercase rounded-sm bg-[var(--color-brand-blue)]/20 border border-[var(--color-brand-blue)] text-white flex items-center gap-1.5 cursor-pointer hover:bg-red-500/20 hover:border-red-500 transition-colors"
                        title="Click to remove"
                      >
                        {name}
                        <span className="text-slate-400 text-[10px]">✕</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Tools Selection Grid */}
              <div className="border rounded-sm border-[var(--color-brand-border)] max-h-56 overflow-y-auto divide-y divide-[var(--color-brand-border)] bg-[var(--color-brand-bg)]">
                {availableToolsList.length === 0 ? (
                  <div className="p-6 text-center text-xs font-bold text-slate-500 uppercase">
                    No matching tools found. Use the custom field above.
                  </div>
                ) : (
                  availableToolsList.map((tool) => {
                    const isSelected = selectedToolsToAdd.includes(tool.name);
                    return (
                      <div
                        key={tool.name}
                        onClick={() => toggleToolSelection(tool.name)}
                        className={`p-2.5 px-3 flex justify-between items-center cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-[var(--color-brand-blue)]/15 text-white"
                            : "hover:bg-white/[0.03] text-slate-300"
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="text-xs font-bold uppercase block truncate">
                            {tool.name}
                          </span>
                          <span className="text-[9px] uppercase text-slate-500 font-mono">
                            {tool.category} {tool.isPersonal ? "• In My Toolbox" : ""}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-black uppercase ${
                            isSelected
                              ? "text-[var(--color-brand-blue)]"
                              : "text-slate-500"
                          }`}
                        >
                          {isSelected ? "✓ Queued" : "+ Select"}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Defect Attestation */}
              <div className="p-3 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={complianceChecked}
                    onChange={(e) => setComplianceChecked(e.target.checked)}
                    className="mt-0.5 rounded-none cursor-pointer"
                  />
                  <span className="text-[11px] font-bold uppercase text-slate-300 leading-tight">
                    I certify these additional tools are inspected, undamaged, have intact
                    cords/guards, and all powered items bear the active {currentMonth.monthName} (
                    {currentMonth.color}) monthly tape.
                  </span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 border-t border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold uppercase text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMiddayAppend}
                disabled={
                  selectedToolsToAdd.length === 0 ||
                  !complianceChecked ||
                  isSubmittingAppend
                }
                className="px-5 py-2 bg-[var(--color-brand-blue)] hover:bg-white hover:text-black text-white text-xs font-black uppercase rounded-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {isSubmittingAppend
                  ? "Appending to Shift..."
                  : `Verify & Add (${selectedToolsToAdd.length})`}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}