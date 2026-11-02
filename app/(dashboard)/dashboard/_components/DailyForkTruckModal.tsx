// app/(dashboard)/dashboard/_components/DailyForkTruckModal.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  VISUAL_CHECK_ITEMS,
  OPERATIONAL_CHECK_ITEMS,
  ForkTruckInspectionRecord,
  getEmployeeForkliftLicenseExpiration,
  saveForkTruckInspection,
} from "@/lib/db/forkTruckOperations";

interface DailyForkTruckModalProps {
  supabase: any;
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userRole?: string;
  location: string;
  existingRecord?: ForkTruckInspectionRecord | null;
  mode?: "create" | "view";
}

export default function DailyForkTruckModal({
  supabase,
  isOpen,
  onClose,
  userId,
  userName,
  userRole = "employee",
  location,
  existingRecord = null,
  mode = "create",
}: DailyForkTruckModalProps) {
  const todayStr = new Date().toISOString().split("T")[0];

  const isReadOnly = mode === "view" && Boolean(existingRecord);

  const [liftNumber, setLiftNumber] = useState("");
  const [licenseExp, setLicenseExp] = useState("");
  const [certStatus, setCertStatus] = useState<string>("VALID");

  const [visualChecks, setVisualChecks] = useState<Record<string, "YES" | "NO" | "N/A">>({});
  const [operationalChecks, setOperationalChecks] = useState<Record<string, "YES" | "NO" | "N/A">>({});

  const [awareHazards, setAwareHazards] = useState(false);
  const [noHorseplay, setNoHorseplay] = useState(false);
  const [initials, setInitials] = useState("");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (isReadOnly && existingRecord) {
      setLiftNumber(existingRecord.lift_number || "");
      setVisualChecks(existingRecord.visual_checks || {});
      setOperationalChecks(existingRecord.operational_checks || {});
      setAwareHazards(Boolean(existingRecord.aware_hazards));
      setNoHorseplay(Boolean(existingRecord.no_horseplay));
      setInitials(existingRecord.operator_initials || "");
      setComments(existingRecord.comments || "");
      setLicenseExp(existingRecord.license_expiration_date || "");
      setCertStatus("VALID");
    } else {
      setLiftNumber("");
      setVisualChecks({});
      setOperationalChecks({});
      setAwareHazards(false);
      setNoHorseplay(false);
      setComments("");

      const parts = (userName || "").trim().split(" ");
      const autoInit = parts.map((p) => p[0]?.toUpperCase()).join("");
      setInitials(autoInit || "OP");

      async function fetchLiveCert() {
        const { expirationDate, status } = await getEmployeeForkliftLicenseExpiration(
          supabase,
          userId,
          userRole
        );
        setLicenseExp(expirationDate);
        setCertStatus(status);
      }

      fetchLiveCert();
    }
  }, [isOpen, isReadOnly, existingRecord, supabase, userId, userName, userRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isReadOnly) return;

    if (!liftNumber.trim()) {
      alert("Please enter the Lift / Unit #.");
      return;
    }

    const missingVisual = VISUAL_CHECK_ITEMS.some((item) => !visualChecks[item.id]);
    if (missingVisual) {
      alert("Please manually select YES, NO, or N/A for every item under Visual Walkaround Inspection.");
      return;
    }

    const missingOp = OPERATIONAL_CHECK_ITEMS.some((item) => !operationalChecks[item.id]);
    if (missingOp) {
      alert("Please manually select YES, NO, or N/A for every item under Functional & Operational Checks.");
      return;
    }

    if (!awareHazards || !noHorseplay) {
      alert("Please verify both safe condition statements.");
      return;
    }

    if (!initials.trim()) {
      alert("Please verify your operator initials.");
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const record: ForkTruckInspectionRecord = {
      employee_id: userId,
      operator_name: userName,
      location: location || "Nestle Springville",
      inspection_date: todayStr,
      license_expiration_date: licenseExp,
      lift_number: liftNumber.trim(),
      visual_checks: visualChecks,
      operational_checks: operationalChecks,
      aware_hazards: awareHazards,
      no_horseplay: noHorseplay,
      operator_initials: initials.trim(),
      comments: comments.trim(),
    };

    const res = await saveForkTruckInspection(supabase, record);
    setIsSubmitting(false);

    if (res.success) {
      setFeedback("Pre-use inspection recorded for shift.");
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
              <span
                className={`w-2 h-2 ${
                  isReadOnly ? "bg-emerald-400" : "bg-[var(--color-brand-blue)] animate-pulse"
                }`}
              />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand-blue)]">
                IMC-SAF-0015 {isReadOnly ? "• Verified On-Site Permit Record" : "• New Shift Inspection"}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black uppercase text-white mt-0.5">
              Forklift &amp; PIT Daily Operator Check
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

        {/* Scrollable Document Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 pb-10 space-y-4 custom-scrollbar text-xs">
            {feedback && (
              <div
                className={`p-3 rounded-sm text-xs font-bold uppercase ${
                  feedback.startsWith("Pre-use")
                    ? "bg-emerald-500/10 border border-emerald-500/40 text-emerald-300"
                    : "bg-red-500/10 border border-red-500/40 text-red-300"
                }`}
              >
                {feedback}
              </div>
            )}

            {/* Operator & Unit Card */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3.5 rounded-sm bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)]">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Certified Operator
                </span>
                <span className="text-xs font-black uppercase text-white truncate block">
                  {isReadOnly ? existingRecord?.operator_name : userName}
                </span>
                <span className="text-[9px] text-slate-500 uppercase">Assigned Driver</span>
              </div>

              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Inspection Date
                </span>
                <span className="text-xs font-mono font-bold text-white block">
                  {isReadOnly ? existingRecord?.inspection_date : todayStr}
                </span>
                <span className="text-[9px] text-slate-500 uppercase">Operating Shift</span>
              </div>

              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  License Expiration
                </span>
                <span
                  className={`text-xs font-mono font-black block ${
                    certStatus === "EXPIRED"
                      ? "text-red-400"
                      : certStatus === "EXPIRING_SOON"
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  {licenseExp || "Verified On File"}
                </span>
                <span className="text-[9px] text-slate-500 uppercase">
                  {certStatus === "VALID" ? "Active Credential" : certStatus}
                </span>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-cyan-400 block mb-0.5">
                  Lift / Unit # *
                </label>
                {isReadOnly ? (
                  <span className="text-sm font-black font-mono text-cyan-400 block py-1">
                    {liftNumber || "--"}
                  </span>
                ) : (
                  <input
                    type="text"
                    required
                    value={liftNumber}
                    onChange={(e) => setLiftNumber(e.target.value)}
                    placeholder="e.g. FL-01, Hyster 50"
                    className="w-full bg-[var(--color-brand-card)] border border-cyan-500/40 focus:border-cyan-400 text-white font-black px-2.5 py-1.5 rounded-sm uppercase outline-none text-xs"
                  />
                )}
              </div>
            </div>

            {/* Checklist Guide Banner */}
            <div className="p-2.5 rounded-sm bg-slate-900/60 border border-[var(--color-brand-border)] flex items-center justify-between text-[11px] text-slate-300">
              <span>
                <strong>Inspection Key:</strong> <span className="text-emerald-400 font-bold">YES</span> = Passed / No Defects • <span className="text-red-400 font-bold">NO</span> = Discovered Defect • <span className="text-slate-400 font-bold">N/A</span> = Not Equipped
              </span>
            </div>

            {/* Two Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Visual Checks Column */}
              <div className="p-3.5 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] space-y-2">
                <div className="flex justify-between items-center border-b border-[var(--color-brand-border)] pb-2">
                  <span className="text-xs font-black uppercase text-white tracking-wide">
                    1. Visual Walkaround Inspection
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Engine Off</span>
                </div>

                <div className="space-y-1.5">
                  {VISUAL_CHECK_ITEMS.map((item) => {
                    const activeChoice = visualChecks[item.id];
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 p-2 rounded-sm bg-[var(--color-brand-card)]/50 border border-slate-900"
                      >
                        <span className="text-xs text-slate-200 font-sans leading-tight flex-1">
                          {item.label}
                        </span>
                        <div className="flex items-center rounded-xs border border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] overflow-hidden shrink-0">
                          {(["YES", "NO", "N/A"] as const).map((choice) => (
                            <button
                              key={choice}
                              type="button"
                              disabled={isReadOnly}
                              onClick={() => {
                                if (!isReadOnly) {
                                  setVisualChecks((prev) => ({ ...prev, [item.id]: choice }));
                                }
                              }}
                              className={`px-2.5 py-1 text-[10px] font-black uppercase transition-all ${
                                isReadOnly ? "cursor-default" : "cursor-pointer"
                              } ${
                                activeChoice === choice
                                  ? choice === "YES"
                                    ? "bg-emerald-500 text-black font-black"
                                    : choice === "NO"
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

              {/* Operational Checks Column */}
              <div className="p-3.5 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] space-y-2">
                <div className="flex justify-between items-center border-b border-[var(--color-brand-border)] pb-2">
                  <span className="text-xs font-black uppercase text-white tracking-wide">
                    2. Functional &amp; Operational Checks
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Running In-Gear</span>
                </div>

                <div className="space-y-1.5">
                  {OPERATIONAL_CHECK_ITEMS.map((item) => {
                    const activeChoice = operationalChecks[item.id];
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 p-2 rounded-sm bg-[var(--color-brand-card)]/50 border border-slate-900"
                      >
                        <span className="text-xs text-slate-200 font-sans leading-tight flex-1">
                          {item.label}
                        </span>
                        <div className="flex items-center rounded-xs border border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] overflow-hidden shrink-0">
                          {(["YES", "NO", "N/A"] as const).map((choice) => (
                            <button
                              key={choice}
                              type="button"
                              disabled={isReadOnly}
                              onClick={() => {
                                if (!isReadOnly) {
                                  setOperationalChecks((prev) => ({ ...prev, [item.id]: choice }));
                                }
                              }}
                              className={`px-2.5 py-1 text-[10px] font-black uppercase transition-all ${
                                isReadOnly ? "cursor-default" : "cursor-pointer"
                              } ${
                                activeChoice === choice
                                  ? choice === "YES"
                                    ? "bg-emerald-500 text-black font-black"
                                    : choice === "NO"
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

            {/* Workplace Condition & Awareness Verification */}
            <div className="p-4 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] space-y-3">
              <span className="text-xs font-black uppercase text-amber-300 block tracking-wide">
                Workplace Condition &amp; Safety Attestation
              </span>

              <label className={`flex items-start gap-3 p-2 rounded-sm ${isReadOnly ? "cursor-default" : "cursor-pointer hover:bg-white/[0.02]"}`}>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={awareHazards}
                  onChange={(e) => {
                    if (!isReadOnly) setAwareHazards(e.target.checked);
                  }}
                  className="mt-0.5 cursor-pointer disabled:cursor-default"
                />
                <span className="text-xs text-slate-200 font-sans leading-relaxed">
                  As a licensed operator I am aware of the potential hazards and will continually evaluate site conditions throughout my shift.
                </span>
              </label>

              <label className={`flex items-start gap-3 p-2 rounded-sm ${isReadOnly ? "cursor-default" : "cursor-pointer hover:bg-white/[0.02]"}`}>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={noHorseplay}
                  onChange={(e) => {
                    if (!isReadOnly) setNoHorseplay(e.target.checked);
                  }}
                  className="mt-0.5 cursor-pointer disabled:cursor-default"
                />
                <span className="text-xs text-slate-200 font-sans leading-relaxed">
                  Stunt driving and horseplay is strictly prohibited and will result in disciplinary action or immediate credential revocation.
                </span>
              </label>

              <div className="pt-2 border-t border-[var(--color-brand-border)] flex items-center gap-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Operator Initials:
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
                Discovered Defects or Maintenance Notes
              </label>
              {isReadOnly ? (
                <div className="w-full p-2.5 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] text-slate-300 rounded-sm text-xs font-sans">
                  {comments || "[ No defects or operational comments noted ]"}
                </div>
              ) : (
                <textarea
                  rows={2}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Describe any minor fluid drips, cosmetic defects, or upcoming maintenance required..."
                  className="w-full p-2.5 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] text-slate-100 rounded-sm outline-none text-xs"
                />
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-3.5 sm:p-4 border-t border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] flex justify-between items-center gap-2 shrink-0">
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              Keep verified form with equipment during shift operations.
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