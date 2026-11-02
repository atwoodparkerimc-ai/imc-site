// app/(dashboard)/dashboard/_components/DailyBoomLiftModal.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BOOM_EQUIPMENT_CHECKS,
  BOOM_WORKPLACE_CHECKS,
  BOOM_ELEVATION_AGREEMENTS,
  BoomLiftInspectionRecord,
  getEmployeeBoomLiftLicense,
  saveBoomLiftInspection,
} from "@/lib/db/boomLiftOperations";
import { getPeerProfiles, formatEmployeeName } from "@/lib/db/operations";

interface DailyBoomLiftModalProps {
  supabase: any;
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userRole?: string;
  location: string;
  existingRecord?: BoomLiftInspectionRecord | null;
  mode?: "create" | "view";
}

export default function DailyBoomLiftModal({
  supabase,
  isOpen,
  onClose,
  userId,
  userName,
  userRole = "employee",
  location,
  existingRecord = null,
  mode = "create",
}: DailyBoomLiftModalProps) {
  const todayStr = new Date().toLocaleDateString("en-CA");
  const isReadOnly = mode === "view" && Boolean(existingRecord);

  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [licenseExp, setLicenseExp] = useState("");
  const [certStatus, setCertStatus] = useState<string>("VALID");

  // Watcher / Buddy Peer State (Mandatory)
  const [availablePeers, setAvailablePeers] = useState<{ id: string; name: string }[]>([]);
  const [selectedBuddyId, setSelectedBuddyId] = useState<string>("");
  const [buddyName, setBuddyName] = useState("");
  const [buddyExp, setBuddyExp] = useState("");
  const [loadingBuddyLicense, setLoadingBuddyLicense] = useState(false);

  const [equipmentChecks, setEquipmentChecks] = useState<Record<string, "YES" | "NO" | "N/A">>({});
  const [workplaceChecks, setWorkplaceChecks] = useState<Record<string, "YES" | "NO" | "N/A">>({});
  const [elevationAgreements, setElevationAgreements] = useState<Record<string, "YES" | "NO">>({});

  const [initials, setInitials] = useState("");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    async function loadPeers() {
      const peers = await getPeerProfiles(supabase, userId, location);
      setAvailablePeers(
        peers.map((p) => ({
          id: p.id,
          name: formatEmployeeName(p),
        }))
      );
    }
    loadPeers();

    if (isReadOnly && existingRecord) {
      setModel(existingRecord.model || "");
      setSerialNumber(existingRecord.serial_number || "");
      setLicenseExp(existingRecord.license_expiration_date || "");
      setSelectedBuddyId(existingRecord.buddy_id || "");
      setBuddyName(existingRecord.buddy_name || "");
      setBuddyExp(existingRecord.buddy_license_expiration || "");
      setEquipmentChecks(existingRecord.equipment_checks || {});
      setWorkplaceChecks(existingRecord.workplace_checks || {});
      setElevationAgreements(existingRecord.elevation_agreements || {});
      setInitials(existingRecord.operator_initials || "");
      setComments(existingRecord.comments || "");
    } else {
      setModel("");
      setSerialNumber("");
      setSelectedBuddyId("");
      setBuddyName("");
      setBuddyExp("");
      setEquipmentChecks({});
      setWorkplaceChecks({});
      setElevationAgreements({});
      setComments("");

      const parts = (userName || "").trim().split(" ");
      const autoInit = parts.map((p) => p[0]?.toUpperCase()).join("");
      setInitials(autoInit || "OP");

      async function fetchLicense() {
        const { expirationDate, status } = await getEmployeeBoomLiftLicense(
          supabase,
          userId,
          userRole
        );
        setLicenseExp(expirationDate);
        setCertStatus(status);
      }
      fetchLicense();
    }
  }, [isOpen, isReadOnly, existingRecord, userName, supabase, userId, userRole, location]);

  const handleBuddySelect = async (peerId: string) => {
    setSelectedBuddyId(peerId);
    if (!peerId) {
      setBuddyName("");
      setBuddyExp("");
      return;
    }

    const matched = availablePeers.find((p) => p.id === peerId);
    const chosenName = matched?.name || "";
    setBuddyName(chosenName);

    setLoadingBuddyLicense(true);
    const { expirationDate } = await getEmployeeBoomLiftLicense(supabase, peerId, "employee");
    setBuddyExp(expirationDate || "Verified On File");
    setLoadingBuddyLicense(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (!model.trim()) {
      alert("Please enter the Boom Lift Model (e.g. S-60, 450AJ).");
      return;
    }

    if (!serialNumber.trim()) {
      alert("Please enter the Boom Lift Serial Number or Unit ID.");
      return;
    }

    if (!selectedBuddyId || !buddyName.trim()) {
      alert("A designated ground watcher/spotter is mandatory for boom lift operations. Please select a watcher from the list.");
      return;
    }

    const missingEquip = BOOM_EQUIPMENT_CHECKS.some((i) => !equipmentChecks[i.id]);
    if (missingEquip) {
      alert("Please mark YES, NO, or N/A for all Pre-Work Equipment inspection items.");
      return;
    }

    const missingWorkplace = BOOM_WORKPLACE_CHECKS.some((i) => !workplaceChecks[i.id]);
    if (missingWorkplace) {
      alert("Please mark YES, NO, or N/A for all Workplace Environment items.");
      return;
    }

    const missingAgreements = BOOM_ELEVATION_AGREEMENTS.some((i) => !elevationAgreements[i.id]);
    if (missingAgreements) {
      alert("Please confirm agreement with all Prior to Reach Elevation safety mandates.");
      return;
    }

    if (!initials.trim()) {
      alert("Please enter your operator initials.");
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const record: BoomLiftInspectionRecord = {
      employee_id: userId,
      operator_name: userName,
      department: "IMC",
      location: location || "Nestle Springville",
      inspection_date: todayStr,
      model: model.trim(),
      serial_number: serialNumber.trim(),
      license_expiration_date: licenseExp,
      buddy_id: selectedBuddyId,
      buddy_name: buddyName.trim(),
      buddy_license_expiration: buddyExp.trim(),
      equipment_checks: equipmentChecks,
      workplace_checks: workplaceChecks,
      elevation_agreements: elevationAgreements,
      operator_initials: initials.trim(),
      comments: comments.trim(),
    };

    const res = await saveBoomLiftInspection(supabase, record);
    setIsSubmitting(false);

    if (res.success) {
      setFeedback("Boom lift inspection recorded. Shift clearance active for operator and watcher.");
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
                IMC-SAF-0012 {isReadOnly ? "• Verified Permit Record" : "• Boom Lift Pre-Use Inspection"}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black uppercase text-white mt-0.5">
              Boom Lift Pre-Work Inspection Report
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

        {/* Form Body - Constrained height */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 pb-10 space-y-4 custom-scrollbar text-xs">
            {feedback && (
              <div className={`p-3 rounded-sm text-xs font-bold uppercase ${
                feedback.startsWith("Boom")
                  ? "bg-emerald-500/10 border border-emerald-500/40 text-emerald-300"
                  : "bg-red-500/10 border border-red-500/40 text-red-300"
              }`}>
                {feedback}
              </div>
            )}

            {/* Operator & Lift Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3.5 rounded-sm bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)]">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Certified Operator
                </span>
                <span className="text-xs font-black uppercase text-white truncate block">
                  {isReadOnly ? existingRecord?.operator_name : userName}
                </span>
                <span className="text-[9px] text-slate-500 uppercase">Primary Driver</span>
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
                  Operator License Exp
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
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Department
                </span>
                <span className="text-xs font-mono font-black text-emerald-400 block">
                  IMC
                </span>
              </div>
            </div>

            {/* Model & Serial Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-sm bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)]">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                  Boom Lift Model *
                </label>
                {isReadOnly ? (
                  <span className="text-sm font-black font-mono text-cyan-400 block">
                    {model || "--"}
                  </span>
                ) : (
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. S-60, 450AJ"
                    className="w-full bg-[var(--color-brand-card)] border border-cyan-500/40 focus:border-cyan-400 text-white font-black px-2.5 py-1.5 rounded-sm uppercase outline-none text-xs"
                  />
                )}
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                  Serial Number / Unit ID *
                </label>
                {isReadOnly ? (
                  <span className="text-sm font-black font-mono text-cyan-400 block">
                    {serialNumber || "--"}
                  </span>
                ) : (
                  <input
                    type="text"
                    required
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="e.g. BL-08, 0300184729"
                    className="w-full bg-[var(--color-brand-card)] border border-cyan-500/40 focus:border-cyan-400 text-white font-black px-2.5 py-1.5 rounded-sm uppercase outline-none text-xs"
                  />
                )}
              </div>
            </div>

            {/* Mandatory Watcher / Buddy Peer Selector & Auto-License Retrieval */}
            <div className="p-3.5 rounded-sm bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] space-y-2.5">
              <div className="border-b border-[var(--color-brand-border)] pb-2">
                <span className="text-xs font-black uppercase text-amber-300 tracking-wide block">
                  Mandatory Ground Watcher / Spotter Assignment *
                </span>
                <span className="text-[10px] text-slate-400">
                  Select your ground spotter. Their credentials will be retrieved automatically and this clearance will be shared to their daily binder.
                </span>
              </div>

              {isReadOnly ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block mb-0.5">Assigned Watcher</span>
                    <strong className="text-white text-xs block uppercase">
                      {existingRecord?.buddy_name || "--"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block mb-0.5">Watcher License Exp</span>
                    <span className="text-emerald-400 font-mono text-xs block">
                      {existingRecord?.buddy_license_expiration || "Verified On File"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                      Select Worksite Watcher *
                    </label>
                    <select
                      required
                      value={selectedBuddyId}
                      onChange={(e) => handleBuddySelect(e.target.value)}
                      className="w-full bg-[var(--color-brand-card)] border border-cyan-500/40 focus:border-cyan-400 text-white px-2.5 py-2 rounded-sm text-xs uppercase outline-none cursor-pointer"
                    >
                      <option value="">-- SELECT REQUIRED GROUND WATCHER --</option>
                      {availablePeers.map((peer) => (
                        <option key={peer.id} value={peer.id} className="bg-[var(--color-brand-bg)]">
                          {peer.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Auto-Verified License Expiration
                    </label>
                    <div className="w-full bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] p-2 rounded-sm text-xs font-mono">
                      {loadingBuddyLicense ? (
                        <span className="text-amber-400 animate-pulse">Querying credentials...</span>
                      ) : buddyExp ? (
                        <span className="text-emerald-400 font-bold">{buddyExp}</span>
                      ) : (
                        <span className="text-slate-500">Auto-filled upon watcher selection</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Checklist Guide Banner */}
            <div className="p-2.5 rounded-sm bg-slate-900/60 border border-[var(--color-brand-border)] flex items-center justify-between text-[11px] text-slate-300">
              <span>
                <strong>Evaluation Key:</strong> <span className="text-emerald-400 font-bold">YES</span> = Passed • <span className="text-red-400 font-bold">NO</span> = Discovered Defect (Do Not Operate) • <span className="text-slate-400 font-bold">N/A</span> = Not Equipped
              </span>
            </div>

            {/* Two-Column Grid: Equipment Checks & Workplace Inspection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Part 1: Equipment Visual & Functional */}
              <div className="p-3.5 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] space-y-2">
                <div className="flex justify-between items-center border-b border-[var(--color-brand-border)] pb-2">
                  <span className="text-xs font-black uppercase text-white tracking-wide">
                    1. Machine Pre-Use Inspection
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">13 Inspection Criteria</span>
                </div>

                <div className="space-y-1.5">
                  {BOOM_EQUIPMENT_CHECKS.map((item) => {
                    const activeChoice = equipmentChecks[item.id];
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
                                  setEquipmentChecks((prev) => ({ ...prev, [item.id]: choice }));
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

              {/* Part 2: Workplace Environment */}
              <div className="p-3.5 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] space-y-2">
                <div className="flex justify-between items-center border-b border-[var(--color-brand-border)] pb-2">
                  <span className="text-xs font-black uppercase text-white tracking-wide">
                    2. Workplace Environment Inspection
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">360° Site Walk</span>
                </div>

                <div className="space-y-1.5">
                  {BOOM_WORKPLACE_CHECKS.map((item) => {
                    const activeChoice = workplaceChecks[item.id];
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
                                  setWorkplaceChecks((prev) => ({ ...prev, [item.id]: choice }));
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

            {/* Part 3: Prior to Reach Elevations Agreements */}
            <div className="p-3.5 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] space-y-2.5">
              <div className="flex justify-between items-center border-b border-[var(--color-brand-border)] pb-2">
                <span className="text-xs font-black uppercase text-amber-300 tracking-wide">
                  3. Prior to Reach Elevations (Safe Operating Agreements)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">YES = I Agree</span>
              </div>

              <div className="space-y-1.5">
                {BOOM_ELEVATION_AGREEMENTS.map((item) => {
                  const activeChoice = elevationAgreements[item.id];
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-2 rounded-sm bg-[var(--color-brand-card)]/50 border border-slate-900"
                    >
                      <span className="text-xs text-slate-200 font-sans leading-tight flex-1">
                        {item.label}
                      </span>
                      <div className="flex items-center rounded-xs border border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] overflow-hidden shrink-0">
                        {(["YES", "NO"] as const).map((choice) => (
                          <button
                            key={choice}
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => {
                              if (!isReadOnly) {
                                setElevationAgreements((prev) => ({ ...prev, [item.id]: choice }));
                              }
                            }}
                            className={`px-3 py-1 text-[10px] font-black uppercase transition-all ${
                              isReadOnly ? "cursor-default" : "cursor-pointer"
                            } ${
                              activeChoice === choice
                                ? choice === "YES"
                                  ? "bg-emerald-500 text-black font-black"
                                  : "bg-red-500 text-white font-black"
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

            {/* Operator Signature & Initial Verification */}
            <div className="p-4 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] space-y-3">
              <span className="text-xs font-black uppercase text-slate-300 block tracking-wide">
                Operator Attestation &amp; LOTO Rule Compliance
              </span>

              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Failure to perform pre-work inspection and maintain this form with equipment during operation is treated the same as a Lockout / Tagout violation. As a licensed operator, I am responsible for having mechanical issues assessed by maintenance and proper notations made.
              </p>

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

            {/* Defect Remarks */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Discovered Defects or Maintenance Notes
              </label>
              {isReadOnly ? (
                <div className="w-full p-2.5 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] text-slate-300 rounded-sm text-xs font-sans">
                  {comments || "[ No defects noted; boom lift approved for shift ]"}
                </div>
              ) : (
                <textarea
                  rows={2}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Describe any hydraulic drips, tire blemishes, or mechanical notes..."
                  className="w-full p-2.5 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] text-slate-100 rounded-sm outline-none text-xs"
                />
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-3.5 sm:p-4 border-t border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] flex justify-between items-center gap-2 shrink-0">
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              Keep verified form with equipment during work activity.
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