// app/(dashboard)/dashboard/_components/DailyFallProtectionModal.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  SRL_CHECK_ITEMS,
  HARNESS_CHECK_ITEMS,
  FallProtectionRecord,
  saveFallProtectionInspection,
} from "@/lib/db/fallProtectionOperations";

interface DailyFallProtectionModalProps {
  supabase: any;
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  location: string;
  existingRecord?: FallProtectionRecord | null;
  mode?: "create" | "view";
}

export default function DailyFallProtectionModal({
  supabase,
  isOpen,
  onClose,
  userId,
  userName,
  location,
  existingRecord = null,
  mode = "create",
}: DailyFallProtectionModalProps) {
  const todayStr = new Date().toLocaleDateString("en-CA");
  const isReadOnly = mode === "view" && Boolean(existingRecord);

  const [equipmentNumber, setEquipmentNumber] = useState("");
  const [srlChecks, setSrlChecks] = useState<Record<string, "PASS" | "FAIL" | "N/A">>({});
  const [harnessChecks, setHarnessChecks] = useState<Record<string, "PASS" | "FAIL" | "N/A">>({});
  const [verifiedNoDefects, setVerifiedNoDefects] = useState(false);
  const [initials, setInitials] = useState("");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (isReadOnly && existingRecord) {
      setEquipmentNumber(existingRecord.equipment_number || "");
      setSrlChecks(existingRecord.srl_checks || {});
      setHarnessChecks(existingRecord.harness_checks || {});
      setVerifiedNoDefects(Boolean(existingRecord.verified_no_defects));
      setInitials(existingRecord.operator_initials || "");
      setComments(existingRecord.comments || "");
    } else {
      setEquipmentNumber("");
      setSrlChecks({});
      setHarnessChecks({});
      setVerifiedNoDefects(false);
      setComments("");

      const parts = (userName || "").trim().split(" ");
      const autoInit = parts.map((p) => p[0]?.toUpperCase()).join("");
      setInitials(autoInit || "OP");
    }
  }, [isOpen, isReadOnly, existingRecord, userName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (!equipmentNumber.trim()) {
      alert("Please enter the Lanyard / Harness Unit #.");
      return;
    }

    const missingSrl = SRL_CHECK_ITEMS.some((i) => !srlChecks[i.id]);
    if (missingSrl) {
      alert("Please select PASS, FAIL, or N/A for all SRL & Lanyard items.");
      return;
    }

    const missingHarness = HARNESS_CHECK_ITEMS.some((i) => !harnessChecks[i.id]);
    if (missingHarness) {
      alert("Please select PASS, FAIL, or N/A for all Harness condition items.");
      return;
    }

    if (!verifiedNoDefects) {
      alert("Please confirm the tactile pre-use inspection verification checkbox.");
      return;
    }

    if (!initials.trim()) {
      alert("Please verify your operator initials.");
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const record: FallProtectionRecord = {
      employee_id: userId,
      employee_name: userName,
      department: "IMC",
      location: location || "Nestle Springville",
      inspection_date: todayStr,
      equipment_number: equipmentNumber.trim(),
      srl_checks: srlChecks,
      harness_checks: harnessChecks,
      verified_no_defects: verifiedNoDefects,
      operator_initials: initials.trim(),
      comments: comments.trim(),
    };

    const res = await saveFallProtectionInspection(supabase, record);
    setIsSubmitting(false);

    if (res.success) {
      setFeedback("Pre-use harness inspection recorded for shift.");
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 1200);
    } else {
      setFeedback(`Error: ${res.error}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 pb-16 sm:pb-20 bg-black/90 backdrop-blur-md font-mono text-slate-100 select-none overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="w-full max-w-4xl max-h-[80vh] h-[80vh] flex flex-col border shadow-2xl rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] flex justify-between items-center shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 ${isReadOnly ? "bg-emerald-400" : "bg-[var(--color-brand-blue)] animate-pulse"}`} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand-blue)]">
                IMC-SAF-0016 {isReadOnly ? "• Verified On-Site Permit" : "• Fall Protection Pre-Use Check"}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black uppercase text-white mt-0.5">
              Fall Protection Harness &amp; SRL Inspection
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Read-Only Status Banner */}
        {isReadOnly && (
          <div className="p-2.5 px-4 bg-emerald-500/10 border-b border-emerald-500/30 flex justify-between items-center text-xs text-emerald-300 shrink-0">
            <span className="font-bold uppercase flex items-center gap-2">
              <span>🔒</span>
              <span>Logged Clearance Permit • Read-Only Reference</span>
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              Submitted: {existingRecord?.signed_at ? new Date(existingRecord.signed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Today"}
            </span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 pb-10 space-y-4 custom-scrollbar text-xs">
            {feedback && (
              <div className={`p-3 rounded-sm text-xs font-bold uppercase ${
                feedback.startsWith("Pre-use")
                  ? "bg-emerald-500/10 border border-emerald-500/40 text-emerald-300"
                  : "bg-red-500/10 border border-red-500/40 text-red-300"
              }`}>
                {feedback}
              </div>
            )}

            {/* Auto-filled Metadata Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3.5 rounded-sm bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)]">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Employee Legal Name
                </span>
                <span className="text-xs font-black uppercase text-white truncate block">
                  {isReadOnly ? existingRecord?.employee_name : userName}
                </span>
                <span className="text-[9px] text-slate-500 uppercase">Assigned User</span>
              </div>

              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Inspection Date
                </span>
                <span className="text-xs font-mono font-bold text-white block">
                  {isReadOnly ? existingRecord?.inspection_date : todayStr}
                </span>
                <span className="text-[9px] text-slate-500 uppercase">Active Shift</span>
              </div>

              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Department
                </span>
                <span className="text-xs font-mono font-black text-emerald-400 block">
                  IMC
                </span>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-cyan-400 block mb-0.5">
                  Lanyard / Harness # *
                </label>
                {isReadOnly ? (
                  <span className="text-sm font-black font-mono text-cyan-400 block py-1">
                    {equipmentNumber || "--"}
                  </span>
                ) : (
                  <input
                    type="text"
                    required
                    value={equipmentNumber}
                    onChange={(e) => setEquipmentNumber(e.target.value)}
                    placeholder="e.g. H-04 / SRL-12"
                    className="w-full bg-[var(--color-brand-card)] border border-cyan-500/40 focus:border-cyan-400 text-white font-black px-2.5 py-1.5 rounded-sm uppercase outline-none text-xs"
                  />
                )}
              </div>
            </div>

            {/* Checklist Guide Banner */}
            <div className="p-2.5 rounded-sm bg-slate-900/60 border border-[var(--color-brand-border)] flex items-center justify-between text-[11px] text-slate-300">
              <span>
                <strong>Operating Key:</strong> <span className="text-emerald-400 font-bold">PASS</span> = Safe Condition • <span className="text-red-400 font-bold">FAIL</span> = Discovered Defect (Do Not Use) • <span className="text-slate-400 font-bold">N/A</span> = Not Equipped
              </span>
            </div>

            {/* Two-Column Grid: Side 1 and Side 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Part 1: SRL & Lanyards */}
              <div className="p-3.5 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] space-y-2">
                <div className="flex justify-between items-center border-b border-[var(--color-brand-border)] pb-2">
                  <span className="text-xs font-black uppercase text-white tracking-wide">
                    Part 1: SRL &amp; Lifelines
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Wear Gloves</span>
                </div>

                <div className="space-y-1.5">
                  {SRL_CHECK_ITEMS.map((item) => {
                    const activeChoice = srlChecks[item.id];
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 p-2 rounded-sm bg-[var(--color-brand-card)]/50 border border-slate-900"
                      >
                        <span className="text-xs text-slate-200 font-sans leading-tight flex-1">
                          {item.label}
                        </span>
                        <div className="flex items-center rounded-xs border border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] overflow-hidden shrink-0">
                          {(["PASS", "FAIL", "N/A"] as const).map((choice) => (
                            <button
                              key={choice}
                              type="button"
                              disabled={isReadOnly}
                              onClick={() => {
                                if (!isReadOnly) {
                                  setSrlChecks((prev) => ({ ...prev, [item.id]: choice }));
                                }
                              }}
                              className={`px-2.5 py-1 text-[10px] font-black uppercase transition-all ${
                                isReadOnly ? "cursor-default" : "cursor-pointer"
                              } ${
                                activeChoice === choice
                                  ? choice === "PASS"
                                    ? "bg-emerald-500 text-black font-black"
                                    : choice === "FAIL"
                                    ? "bg-red-500 text-white font-black"
                                    : "bg-slate-700 text-white font-black"
                                  : "text-slate-500 hover:text-white"
                              }`}
                            >
                              {choice}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Part 2: Harness & Hardware */}
              <div className="p-3.5 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] space-y-2">
                <div className="flex justify-between items-center border-b border-[var(--color-brand-border)] pb-2">
                  <span className="text-xs font-black uppercase text-white tracking-wide">
                    Part 2: Harness &amp; Hardware
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Inverted 'U' Flex</span>
                </div>

                <div className="space-y-1.5">
                  {HARNESS_CHECK_ITEMS.map((item) => {
                    const activeChoice = harnessChecks[item.id];
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 p-2 rounded-sm bg-[var(--color-brand-card)]/50 border border-slate-900"
                      >
                        <span className="text-xs text-slate-200 font-sans leading-tight flex-1">
                          {item.label}
                        </span>
                        <div className="flex items-center rounded-xs border border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] overflow-hidden shrink-0">
                          {(["PASS", "FAIL", "N/A"] as const).map((choice) => (
                            <button
                              key={choice}
                              type="button"
                              disabled={isReadOnly}
                              onClick={() => {
                                if (!isReadOnly) {
                                  setHarnessChecks((prev) => ({ ...prev, [item.id]: choice }));
                                }
                              }}
                              className={`px-2.5 py-1 text-[10px] font-black uppercase transition-all ${
                                isReadOnly ? "cursor-default" : "cursor-pointer"
                              } ${
                                activeChoice === choice
                                  ? choice === "PASS"
                                    ? "bg-emerald-500 text-black font-black"
                                    : choice === "FAIL"
                                    ? "bg-red-500 text-white font-black"
                                    : "bg-slate-700 text-white font-black"
                                  : "text-slate-500 hover:text-white"
                              }`}
                            >
                              {choice}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tactile Pre-Use Inspection Verification */}
            <div className="p-4 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] space-y-3">
              <span className="text-xs font-black uppercase text-amber-300 block tracking-wide">
                Tactile Pre-Use Inspection Verification
              </span>

              <label className={`flex items-start gap-3 p-2 rounded-sm ${isReadOnly ? "cursor-default" : "cursor-pointer hover:bg-white/[0.02]"}`}>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={verifiedNoDefects}
                  onChange={(e) => {
                    if (!isReadOnly) setVerifiedNoDefects(e.target.checked);
                  }}
                  className="mt-0.5 cursor-pointer disabled:cursor-default"
                />
                <span className="text-xs text-slate-200 font-sans leading-relaxed">
                  I certify that I have conducted an inch-by-inch visual and tactile inspection along the entire length of this harness/lanyard (inside and outside) by bending the strap into an inverted "U". The equipment is free of burns, tears, chemical degradation, or broken strands.
                </span>
              </label>

              <div className="pt-2 border-t border-[var(--color-brand-border)] flex items-center gap-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  User Initials:
                </label>
                {isReadOnly ? (
                  <span className="w-20 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] px-2.5 py-1 text-xs text-white font-black rounded-sm uppercase text-center font-mono">
                    {initials || "--"}
                  </span>
                ) : (
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={initials}
                    onChange={(e) => setInitials(e.target.value.toUpperCase())}
                    className="w-20 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] px-2.5 py-1 text-xs text-white font-black rounded-sm uppercase text-center outline-none"
                  />
                )}
              </div>
            </div>

            {/* Comments Box */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Equipment Observations or Defect Remarks
              </label>
              {isReadOnly ? (
                <div className="w-full p-2.5 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] text-slate-300 rounded-sm text-xs font-sans">
                  {comments || "[ No defects or remarks noted ]"}
                </div>
              ) : (
                <textarea
                  rows={2}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Note any hardware discoloration, manufacturing date, or harness wear..."
                  className="w-full p-2.5 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] text-slate-100 rounded-sm outline-none text-xs"
                />
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-3.5 sm:p-4 border-t border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] flex justify-between items-center gap-2 shrink-0">
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              Defective fall protection must be immediately tagged and taken out of service.
            </span>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              {isReadOnly ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 bg-[var(--color-brand-card)] hover:border-white border border-[var(--color-brand-border)] text-white uppercase font-black text-xs rounded-sm cursor-pointer transition-all"
                >
                  Close Document
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-[var(--color-brand-border)] text-slate-400 hover:text-white uppercase font-bold text-xs rounded-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-[var(--color-brand-blue)] hover:bg-white hover:text-black text-white uppercase font-black text-xs rounded-sm cursor-pointer transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSubmitting ? "Verifying..." : "Sign & Record Inspection ↗"}
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}