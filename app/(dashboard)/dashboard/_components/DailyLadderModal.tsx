// app/(dashboard)/dashboard/_components/DailyLadderModal.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  LADDER_GENERAL_ITEMS,
  STEP_LADDER_ITEMS,
  EXTENSION_LADDER_ITEMS,
  LadderInspectionRecord,
  saveLadderInspection,
} from "@/lib/db/ladderOperations";
import { getPeerProfiles, formatEmployeeName } from "@/lib/db/operations";

interface DailyLadderModalProps {
  supabase: any;
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  location: string;
  existingRecord?: LadderInspectionRecord | null;
  mode?: "create" | "view";
}

export default function DailyLadderModal({
  supabase,
  isOpen,
  onClose,
  userId,
  userName,
  location,
  existingRecord = null,
  mode = "create",
}: DailyLadderModalProps) {
  const todayStr = new Date().toLocaleDateString("en-CA");
  const isReadOnly = mode === "view" && Boolean(existingRecord);

  // Work Area & Ladder Identification
  const [workArea, setWorkArea] = useState("");
  const [ladderIdNumber, setLadderIdNumber] = useState("");
  const [ladderType, setLadderType] = useState<"STEP_LADDER" | "EXTENSION_LADDER" | "COMBINATION">("STEP_LADDER");

  // Crew Multi-Select State
  const [availablePeers, setAvailablePeers] = useState<{ id: string; name: string }[]>([]);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);
  const [peerSearchQuery, setPeerSearchQuery] = useState("");

  // Inspection Checklist Options
  const [generalChecks, setGeneralChecks] = useState<Record<string, "OK" | "WORN" | "N/A">>({});
  const [stepLadderChecks, setStepLadderChecks] = useState<Record<string, "OK" | "WORN" | "N/A">>({});
  const [extensionLadderChecks, setExtensionLadderChecks] = useState<Record<string, "OK" | "WORN" | "N/A">>({});

  const [verifiedSafe, setVerifiedSafe] = useState(false);
  const [initials, setInitials] = useState("");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Load active coworkers at the location for the worker picker
    async function fetchPeers() {
      const peers = await getPeerProfiles(supabase, userId, location);
      const formatted = peers.map((p) => ({
        id: p.id,
        name: formatEmployeeName(p),
      }));
      setAvailablePeers(formatted);
    }
    fetchPeers();

    if (isReadOnly && existingRecord) {
      setWorkArea(existingRecord.work_area || "");
      setLadderIdNumber(existingRecord.ladder_id_number || "");
      setLadderType(existingRecord.ladder_type || "STEP_LADDER");
      setSelectedWorkerIds(existingRecord.worker_ids || []);
      setGeneralChecks(existingRecord.general_checks || {});
      setStepLadderChecks(existingRecord.step_ladder_checks || {});
      setExtensionLadderChecks(existingRecord.extension_ladder_checks || {});
      setVerifiedSafe(Boolean(existingRecord.verified_safe));
      setInitials(existingRecord.operator_initials || "");
      setComments(existingRecord.comments || "");
    } else {
      setWorkArea("");
      setLadderIdNumber("");
      setLadderType("STEP_LADDER");
      setSelectedWorkerIds([]);
      setGeneralChecks({});
      setStepLadderChecks({});
      setExtensionLadderChecks({});
      setVerifiedSafe(false);
      setComments("");

      const parts = (userName || "").trim().split(" ");
      const autoInit = parts.map((p) => p[0]?.toUpperCase()).join("");
      setInitials(autoInit || "OP");
    }
  }, [isOpen, isReadOnly, existingRecord, userName, supabase, userId, location]);

  const toggleWorkerSelection = (workerId: string) => {
    if (isReadOnly) return;
    setSelectedWorkerIds((prev) =>
      prev.includes(workerId) ? prev.filter((id) => id !== workerId) : [...prev, workerId]
    );
  };

  const filteredPeers = useMemo(() => {
    const q = peerSearchQuery.toLowerCase().trim();
    if (!q) return availablePeers;
    return availablePeers.filter((p) => p.name.toLowerCase().includes(q));
  }, [availablePeers, peerSearchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (!workArea.trim()) {
      alert("Please enter the specific Work Area (e.g. Line 4 Dry Storage, Mezzanine Tank 2).");
      return;
    }

    if (!ladderIdNumber.trim()) {
      alert("Please enter the Ladder ID / Stencil #.");
      return;
    }

    const missingGeneral = LADDER_GENERAL_ITEMS.some((i) => !generalChecks[i.id]);
    if (missingGeneral) {
      alert("Please select OK, WORN, or N/A for all General Inspection items.");
      return;
    }

    if (ladderType === "STEP_LADDER" || ladderType === "COMBINATION") {
      const missingStep = STEP_LADDER_ITEMS.some((i) => !stepLadderChecks[i.id]);
      if (missingStep) {
        alert("Please select OK, WORN, or N/A for all Step Ladder items.");
        return;
      }
    }

    if (ladderType === "EXTENSION_LADDER" || ladderType === "COMBINATION") {
      const missingExt = EXTENSION_LADDER_ITEMS.some((i) => !extensionLadderChecks[i.id]);
      if (missingExt) {
        alert("Please select OK, WORN, or N/A for all Extension Ladder items.");
        return;
      }
    }

    if (!verifiedSafe) {
      alert("Please confirm the condition verification checkbox.");
      return;
    }

    if (!initials.trim()) {
      alert("Please enter your inspector initials.");
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    // Map selected IDs to legal names for records
    const assignedNames = selectedWorkerIds
      .map((id) => availablePeers.find((p) => p.id === id)?.name)
      .filter(Boolean) as string[];

    const record: LadderInspectionRecord = {
      employee_id: userId,
      employee_name: userName,
      department: "IMC",
      location: location || "Nestle Springville",
      work_area: workArea.trim(),
      inspection_date: todayStr,
      ladder_id_number: ladderIdNumber.trim(),
      ladder_type: ladderType,
      worker_ids: selectedWorkerIds,
      worker_names: assignedNames,
      general_checks: generalChecks,
      step_ladder_checks: stepLadderChecks,
      extension_ladder_checks: extensionLadderChecks,
      verified_safe: verifiedSafe,
      operator_initials: initials.trim(),
      comments: comments.trim(),
    };

    const res = await saveLadderInspection(supabase, record);
    setIsSubmitting(false);

    if (res.success) {
      setFeedback("Ladder work-area inspection recorded. Coverage applied to all selected area workers.");
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
                IMC-SAF-0013 {isReadOnly ? "• Verified Work-Area Permit" : "• Work-Area Pre-Use Inspection"}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black uppercase text-white mt-0.5">
              Work-Area Ladder Safety &amp; Pre-Use Inspection Checklist
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
              <span>Logged Work-Area Permit • Read-Only Reference</span>
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
                feedback.startsWith("Ladder")
                  ? "bg-emerald-500/10 border border-emerald-500/40 text-emerald-300"
                  : "bg-red-500/10 border border-red-500/40 text-red-300"
              }`}>
                {feedback}
              </div>
            )}

            {/* Auto-filled Metadata Bar & Work Area Input */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3.5 rounded-sm bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)]">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Lead Inspector
                </span>
                <span className="text-xs font-black uppercase text-white truncate block">
                  {isReadOnly ? existingRecord?.employee_name : userName}
                </span>
                <span className="text-[9px] text-slate-500 uppercase">Inspected By</span>
              </div>

              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Inspection Date
                </span>
                <span className="text-xs font-mono font-bold text-white block">
                  {isReadOnly ? existingRecord?.inspection_date : todayStr}
                </span>
                <span className="text-[9px] text-slate-500 uppercase">Shift Stamped</span>
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
                  Ladder ID / Stencil # *
                </label>
                {isReadOnly ? (
                  <span className="text-sm font-black font-mono text-cyan-400 block py-1">
                    {ladderIdNumber || "--"}
                  </span>
                ) : (
                  <input
                    type="text"
                    required
                    value={ladderIdNumber}
                    onChange={(e) => setLadderIdNumber(e.target.value)}
                    placeholder="e.g. LAD-06 / 8ft Werner"
                    className="w-full bg-[var(--color-brand-card)] border border-cyan-500/40 focus:border-cyan-400 text-white font-black px-2.5 py-1.5 rounded-sm uppercase outline-none text-xs"
                  />
                )}
              </div>
            </div>

            {/* Specific Physical Work Area */}
            <div className="p-3.5 rounded-sm bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <span>📍 Specific Work Area / Location on Site *</span>
                <span className="text-[9px] text-slate-400 font-normal">
                  (e.g., Line 4 Dry Storage, Mezzanine Tank 2, Boiler Room B-3)
                </span>
              </label>
              {isReadOnly ? (
                <div className="p-2 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] rounded-sm font-bold text-white text-xs">
                  {workArea || "--"}
                </div>
              ) : (
                <input
                  type="text"
                  required
                  value={workArea}
                  onChange={(e) => setWorkArea(e.target.value)}
                  placeholder="TYPE EXACT PHYSICAL ZONE OR MACHINE LOCATION..."
                  className="w-full px-3 py-2 text-xs uppercase bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] text-white font-bold rounded-sm outline-none"
                />
              )}
            </div>

            {/* Ladder Configuration Selector */}
            <div className="p-3 rounded-sm bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase text-slate-300">
                Ladder Configuration / Type:
              </span>
              <div className="flex gap-1.5 overflow-x-auto">
                {[
                  { id: "STEP_LADDER", label: "Step Ladder" },
                  { id: "EXTENSION_LADDER", label: "Extension Ladder" },
                  { id: "COMBINATION", label: "Combination Ladder" },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => setLadderType(type.id as any)}
                    className={`px-3 py-1.5 text-[11px] font-black uppercase rounded-xs transition-all ${
                      ladderType === type.id
                        ? "bg-[var(--color-brand-blue)] text-white shadow-sm"
                        : "bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-slate-400 hover:text-white"
                    } ${isReadOnly ? "cursor-default" : "cursor-pointer"}`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Co-Workers in Work Area Multi-Select */}
            <div className="p-3.5 rounded-sm bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] space-y-2.5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 border-b border-[var(--color-brand-border)] pb-2">
                <div>
                  <span className="text-xs font-black uppercase text-white tracking-wide block">
                    Co-Workers in Work Area ({selectedWorkerIds.length} Covered)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Select personnel using this ladder in this area. This permit will appear in their completed daily clearances.
                  </span>
                </div>
                {!isReadOnly && (
                  <span className="text-[10px] text-[var(--color-brand-blue)] font-bold uppercase">
                    Site: {location}
                  </span>
                )}
              </div>

              {isReadOnly ? (
                <div className="flex flex-wrap gap-1.5">
                  {existingRecord?.worker_names && existingRecord.worker_names.length > 0 ? (
                    existingRecord.worker_names.map((name, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 text-xs font-bold uppercase rounded-sm bg-emerald-500/15 border border-emerald-500/40 text-emerald-300"
                      >
                        ✓ {name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 font-mono">
                      [ Solo operation • Inspector only ]
                    </span>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={peerSearchQuery}
                    onChange={(e) => setPeerSearchQuery(e.target.value)}
                    placeholder="FILTER CO-WORKERS BY NAME..."
                    className="w-full px-3 py-1.5 text-[11px] uppercase bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-white rounded-sm outline-none focus:border-[var(--color-brand-blue)]"
                  />

                  {/* Selected Crew Badges */}
                  {selectedWorkerIds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedWorkerIds.map((id) => {
                        const peer = availablePeers.find((p) => p.id === id);
                        return (
                          <span
                            key={id}
                            onClick={() => toggleWorkerSelection(id)}
                            className="px-2 py-0.5 text-[11px] font-bold uppercase rounded-sm bg-[var(--color-brand-blue)]/20 border border-[var(--color-brand-blue)] text-white flex items-center gap-1.5 cursor-pointer hover:bg-red-500/20 hover:border-red-500 transition-colors"
                            title="Click to remove worker"
                          >
                            <span>✓ {peer?.name || id}</span>
                            <span className="text-slate-400 text-[9px]">✕</span>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Peer Selection Grid */}
                  <div className="border rounded-sm border-[var(--color-brand-border)] max-h-36 overflow-y-auto divide-y divide-[var(--color-brand-border)] bg-[var(--color-brand-card)]">
                    {filteredPeers.length === 0 ? (
                      <div className="p-4 text-center text-[11px] text-slate-500 uppercase">
                        No matching co-workers found at this site.
                      </div>
                    ) : (
                      filteredPeers.map((peer) => {
                        const isSelected = selectedWorkerIds.includes(peer.id);
                        return (
                          <div
                            key={peer.id}
                            onClick={() => toggleWorkerSelection(peer.id)}
                            className={`p-2 px-3 flex justify-between items-center cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-[var(--color-brand-blue)]/20 text-white font-bold"
                                : "hover:bg-white/[0.03] text-slate-300"
                            }`}
                          >
                            <span className="text-xs uppercase">{peer.name}</span>
                            <span
                              className={`text-[10px] font-black uppercase ${
                                isSelected ? "text-[var(--color-brand-blue)]" : "text-slate-500"
                              }`}
                            >
                              {isSelected ? "✓ Added" : "+ Add"}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Checklist Evaluation Key */}
            <div className="p-2.5 rounded-sm bg-slate-900/60 border border-[var(--color-brand-border)] flex items-center justify-between text-[11px] text-slate-300">
              <span>
                <strong>Evaluation Key:</strong> <span className="text-emerald-400 font-bold">OK</span> = Passed (Safe) • <span className="text-red-400 font-bold">WORN</span> = Defective (Tag Out of Service) • <span className="text-slate-400 font-bold">N/A</span> = Not Applicable
              </span>
            </div>

            {/* SECTION 1: GENERAL ITEMS */}
            <div className="p-3.5 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] space-y-2">
              <div className="flex justify-between items-center border-b border-[var(--color-brand-border)] pb-2">
                <span className="text-xs font-black uppercase text-white tracking-wide">
                  1. General Structural Inspection (All Ladders)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Check Before Every Use</span>
              </div>

              <div className="space-y-1.5">
                {LADDER_GENERAL_ITEMS.map((item) => {
                  const activeChoice = generalChecks[item.id];
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-2 rounded-sm bg-[var(--color-brand-card)]/50 border border-slate-900"
                    >
                      <span className="text-xs text-slate-200 font-sans leading-tight flex-1">
                        {item.label}
                      </span>
                      <div className="flex items-center rounded-xs border border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] overflow-hidden shrink-0">
                        {(["OK", "WORN", "N/A"] as const).map((choice) => (
                          <button
                            key={choice}
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => {
                              if (!isReadOnly) {
                                setGeneralChecks((prev) => ({ ...prev, [item.id]: choice }));
                              }
                            }}
                            className={`px-2.5 py-1 text-[10px] font-black uppercase transition-all ${
                              isReadOnly ? "cursor-default" : "cursor-pointer"
                            } ${
                              activeChoice === choice
                                ? choice === "OK"
                                  ? "bg-emerald-500 text-black font-black"
                                  : choice === "WORN"
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

            {/* SECTION 2: STEP LADDER HARDWARE */}
            {(ladderType === "STEP_LADDER" || ladderType === "COMBINATION") && (
              <div className="p-3.5 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] space-y-2">
                <div className="flex justify-between items-center border-b border-[var(--color-brand-border)] pb-2">
                  <span className="text-xs font-black uppercase text-white tracking-wide">
                    2. Step Ladder Hardware &amp; Spreaders
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Lock Spreaders Fully</span>
                </div>

                <div className="space-y-1.5">
                  {STEP_LADDER_ITEMS.map((item) => {
                    const activeChoice = stepLadderChecks[item.id];
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 p-2 rounded-sm bg-[var(--color-brand-card)]/50 border border-slate-900"
                      >
                        <span className="text-xs text-slate-200 font-sans leading-tight flex-1">
                          {item.label}
                        </span>
                        <div className="flex items-center rounded-xs border border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] overflow-hidden shrink-0">
                          {(["OK", "WORN", "N/A"] as const).map((choice) => (
                            <button
                              key={choice}
                              type="button"
                              disabled={isReadOnly}
                              onClick={() => {
                                if (!isReadOnly) {
                                  setStepLadderChecks((prev) => ({ ...prev, [item.id]: choice }));
                                }
                              }}
                              className={`px-2.5 py-1 text-[10px] font-black uppercase transition-all ${
                                isReadOnly ? "cursor-default" : "cursor-pointer"
                              } ${
                                activeChoice === choice
                                  ? choice === "OK"
                                    ? "bg-emerald-500 text-black font-black"
                                    : choice === "WORN"
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
            )}

            {/* SECTION 3: EXTENSION LADDER HARDWARE */}
            {(ladderType === "EXTENSION_LADDER" || ladderType === "COMBINATION") && (
              <div className="p-3.5 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] space-y-2">
                <div className="flex justify-between items-center border-b border-[var(--color-brand-border)] pb-2">
                  <span className="text-xs font-black uppercase text-white tracking-wide">
                    3. Extension Ladder Hardware, Locks &amp; Guides
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Observe 4:1 Pitch</span>
                </div>

                <div className="space-y-1.5">
                  {EXTENSION_LADDER_ITEMS.map((item) => {
                    const activeChoice = extensionLadderChecks[item.id];
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 p-2 rounded-sm bg-[var(--color-brand-card)]/50 border border-slate-900"
                      >
                        <span className="text-xs text-slate-200 font-sans leading-tight flex-1">
                          {item.label}
                        </span>
                        <div className="flex items-center rounded-xs border border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] overflow-hidden shrink-0">
                          {(["OK", "WORN", "N/A"] as const).map((choice) => (
                            <button
                              key={choice}
                              type="button"
                              disabled={isReadOnly}
                              onClick={() => {
                                if (!isReadOnly) {
                                  setExtensionLadderChecks((prev) => ({ ...prev, [item.id]: choice }));
                                }
                              }}
                              className={`px-2.5 py-1 text-[10px] font-black uppercase transition-all ${
                                isReadOnly ? "cursor-default" : "cursor-pointer"
                              } ${
                                activeChoice === choice
                                  ? choice === "OK"
                                    ? "bg-emerald-500 text-black font-black"
                                    : choice === "WORN"
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
            )}

            {/* Condition Verification & Notice */}
            <div className="p-4 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] space-y-3">
              <span className="text-xs font-black uppercase text-amber-300 block tracking-wide">
                Ladder Condition Mandate &amp; Attestation
              </span>

              <label className={`flex items-start gap-3 p-2 rounded-sm ${isReadOnly ? "cursor-default" : "cursor-pointer hover:bg-white/[0.02]"}`}>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={verifiedSafe}
                  onChange={(e) => {
                    if (!isReadOnly) setVerifiedSafe(e.target.checked);
                  }}
                  className="mt-0.5 cursor-pointer disabled:cursor-default"
                />
                <span className="text-xs text-slate-200 font-sans leading-relaxed">
                  I certify that this ladder is in sound structural condition and safe to use in this work area. If any defects are discovered, I will immediately tag it "OUT OF SERVICE" and report it to safety/tool crib.
                </span>
              </label>

              <div className="pt-2 border-t border-[var(--color-brand-border)] flex items-center gap-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Inspector Initials:
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

            {/* Defect Remarks */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Issues Noted / Corrective Action Taken
              </label>
              {isReadOnly ? (
                <div className="w-full p-2.5 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] text-slate-300 rounded-sm text-xs font-sans">
                  {comments || "[ No issues noted; unit cleared for use ]"}
                </div>
              ) : (
                <textarea
                  rows={2}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Note any blemishes, grip wear, or location observations..."
                  className="w-full p-2.5 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] text-slate-100 rounded-sm outline-none text-xs"
                />
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-3.5 sm:p-4 border-t border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] flex justify-between items-center gap-2 shrink-0">
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              Do not leave ladders unattended or leaned improperly against equipment.
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