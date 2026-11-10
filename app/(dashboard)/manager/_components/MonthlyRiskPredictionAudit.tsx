"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getMonthlyAuditRosterStatus, 
  submitRiskPredictionAudit, 
  getAuditsForMonth,
  EmployeeMonthlyAuditStatus 
} from "@/lib/db/riskPredictionOperations";
import { printRiskPredictionAudits } from "@/lib/reports/riskPredictionAuditPrint";

interface MonthlyRiskPredictionAuditProps {
  supabase: any;
  currentUserId: string;
  currentUserName: string;
}

export default function MonthlyRiskPredictionAudit({
  supabase,
  currentUserId,
  currentUserName,
}: MonthlyRiskPredictionAuditProps) {
  const currentMonthStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [loading, setLoading] = useState<boolean>(true);
  const [roster, setRoster] = useState<EmployeeMonthlyAuditStatus[]>([]);
  const [searchFilter, setSearchFilter] = useState<string>("");

  // Modal State
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [targetEmployee, setTargetEmployee] = useState<{ id: string; name: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form Fields
  const [auditDate, setAuditDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [targetWorkDate, setTargetWorkDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [auditedLocation, setAuditedLocation] = useState<string>("Nestle Springville");

  // Part 1: Sections 1-2
  const [preChecksSelected, setPreChecksSelected] = useState<boolean>(false);
  const [completedByLocation, setCompletedByLocation] = useState<boolean>(false);
  const [othersInvolved, setOthersInvolved] = useState<boolean>(false);
  const [specificHazards, setSpecificHazards] = useState<boolean>(false);
  const [precautionsChecked, setPrecautionsChecked] = useState<boolean>(false);

  // Part 1: Section 3
  const [eliminateHazardStatus, setEliminateHazardStatus] = useState<"Complete & Detailed" | "Vague / Generic" | "Blank (Non-Compliant)">("Complete & Detailed");
  const [eliminateHazardNotes, setEliminateHazardNotes] = useState<string>("");
  const [additionalThoughtsStatus, setAdditionalThoughtsStatus] = useState<"Meaningful Context Provided" | "Minimal / One-word" | "Blank (Non-Compliant)">("Meaningful Context Provided");
  const [additionalThoughtsNotes, setAdditionalThoughtsNotes] = useState<string>("");

  // Part 1: Section 4
  const [jobDescRequired, setJobDescRequired] = useState<boolean>(false);
  const [task1Breakdown, setTask1Breakdown] = useState<boolean>(false);
  const [task2Breakdown, setTask2Breakdown] = useState<boolean>(false);
  const [task3Breakdown, setTask3Breakdown] = useState<boolean>(false);
  const [specificityScore, setSpecificityScore] = useState<"High Detail (Actionable)" | "Moderate Detail" | "Unacceptable (Check-the-box only)">("High Detail (Actionable)");

  // Part 1: Section 5
  const [unexpectedEvents, setUnexpectedEvents] = useState<boolean>(false);
  const [reactPromptStatus, setReactPromptStatus] = useState<"Specific, actionable response detailed" | "Incomplete / Vague">("Specific, actionable response detailed");
  const [reactPromptNotes, setReactPromptNotes] = useState<string>("");
  const [auditQualityScore, setAuditQualityScore] = useState<"Meets Standards (Detailed & Complete)" | "Needs Improvement" | "Unsatisfactory">("Meets Standards (Detailed & Complete)");

  // Part 2: Feedback & Coaching
  const [strengthsNotes, setStrengthsNotes] = useState<string>("");
  const [improvementsNotes, setImprovementsNotes] = useState<string>("");
  const [coachingCompleted, setCoachingCompleted] = useState<boolean>(false);
  const [reAuditScheduled, setReAuditScheduled] = useState<boolean>(false);

  // Signatures
  const [employeeSignature, setEmployeeSignature] = useState<string>("");
  const [employeeSigDate, setEmployeeSigDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [auditorSignature, setAuditorSignature] = useState<string>(currentUserName);
  const [auditorSigDate, setAuditorSigDate] = useState<string>(new Date().toISOString().split("T")[0]);

  const loadRoster = async () => {
    setLoading(true);
    const data = await getMonthlyAuditRosterStatus(supabase, selectedMonth);
    setRoster(data);
    setLoading(false);
  };

  useEffect(() => {
    loadRoster();
  }, [selectedMonth]);

  const filteredRoster = useMemo(() => {
    if (!searchFilter.trim()) return roster;
    return roster.filter((r) =>
      r.employee_name.toLowerCase().includes(searchFilter.toLowerCase().trim())
    );
  }, [roster, searchFilter]);

  const completedCount = useMemo(() => roster.filter((r) => r.hasAuditThisMonth).length, [roster]);

  const handleOpenNewAudit = (emp: { id: string; name: string }) => {
    setTargetEmployee(emp);
    setEmployeeSignature(emp.name);
    setAuditorSignature(currentUserName);
    setFeedback(null);
    setIsAuditModalOpen(true);
  };

  const handleResetForm = () => {
    setPreChecksSelected(false);
    setCompletedByLocation(false);
    setOthersInvolved(false);
    setSpecificHazards(false);
    setPrecautionsChecked(false);
    setEliminateHazardStatus("Complete & Detailed");
    setEliminateHazardNotes("");
    setAdditionalThoughtsStatus("Meaningful Context Provided");
    setAdditionalThoughtsNotes("");
    setJobDescRequired(false);
    setTask1Breakdown(false);
    setTask2Breakdown(false);
    setTask3Breakdown(false);
    setSpecificityScore("High Detail (Actionable)");
    setUnexpectedEvents(false);
    setReactPromptStatus("Specific, actionable response detailed");
    setReactPromptNotes("");
    setAuditQualityScore("Meets Standards (Detailed & Complete)");
    setStrengthsNotes("");
    setImprovementsNotes("");
    setCoachingCompleted(false);
    setReAuditScheduled(false);
    setTargetEmployee(null);
  };

  const handleSubmitAudit = async () => {
    if (!targetEmployee) return;
    if (!employeeSignature.trim() || !auditorSignature.trim()) {
      setFeedback("Both Employee and Auditor signatures are required.");
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const payload = {
      employee_id: targetEmployee.id,
      employee_name: targetEmployee.name,
      auditor_id: currentUserId,
      auditor_name: currentUserName,
      audit_date: auditDate,
      target_work_date: targetWorkDate,
      audited_location: auditedLocation,
      pre_checks_selected: preChecksSelected,
      completed_by_location: completedByLocation,
      others_involved: othersInvolved,
      specific_hazards: specificHazards,
      precautions_checked: precautionsChecked,
      eliminate_hazard_status: eliminateHazardStatus,
      eliminate_hazard_notes: eliminateHazardNotes,
      additional_thoughts_status: additionalThoughtsStatus,
      additional_thoughts_notes: additionalThoughtsNotes,
      job_desc_required: jobDescRequired,
      task1_breakdown: task1Breakdown,
      task2_breakdown: task2Breakdown,
      task3_breakdown: task3Breakdown,
      specificity_score: specificityScore,
      unexpected_events: unexpectedEvents,
      react_prompt_status: reactPromptStatus,
      react_prompt_notes: reactPromptNotes,
      audit_quality_score: auditQualityScore,
      strengths_notes: strengthsNotes,
      improvements_notes: improvementsNotes,
      coaching_completed: coachingCompleted,
      re_audit_scheduled: reAuditScheduled,
      employee_signature: employeeSignature,
      employee_signature_date: employeeSigDate,
      auditor_signature: auditorSignature,
      auditor_signature_date: auditorSigDate,
    };

    const res = await submitRiskPredictionAudit(supabase, payload);

    if (res.success) {
      setIsAuditModalOpen(false);
      handleResetForm();
      loadRoster();
    } else {
      setFeedback(`Failed to save audit: ${res.error || "Unknown error"}`);
    }

    setIsSubmitting(false);
  };

  const handleBatchPrintMonth = async () => {
    const audits = await getAuditsForMonth(supabase, selectedMonth);
    if (audits.length === 0) {
      alert(`No completed audits found for ${selectedMonth} to print.`);
      return;
    }
    printRiskPredictionAudits(audits);
  };

  return (
    <div className="space-y-4 font-mono text-slate-100 select-none">
      {/* Top Header Card */}
      <div className="p-4 rounded-sm border bg-[var(--color-brand-card)] border-[var(--color-brand-border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-none bg-[var(--color-brand-blue,#0088ff)] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-blue,#0088ff)]">
              Quality Compliance Roster
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black uppercase text-white">
            Monthly Risk Prediction Paperwork Quality Audit
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Conduct and record monthly evaluations for all personnel working at Nestlé Springville.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5 border px-2.5 py-1.5 rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)]">
            <span className="text-[10px] font-bold uppercase text-slate-400">Month:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer uppercase"
            />
          </div>

          <button
            type="button"
            onClick={handleBatchPrintMonth}
            className="px-4 py-2 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] hover:border-white text-slate-200 text-xs font-bold uppercase rounded-sm cursor-pointer transition-colors"
          >
            🖨️ Batch Print Month
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3 border rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Springville Crew</span>
            <span className="text-xl font-black text-white">{roster.length}</span>
          </div>
          <span className="text-2xl opacity-60">👷</span>
        </div>

        <div className="p-3 border rounded-sm bg-[var(--color-brand-card)] border-emerald-500/40 bg-emerald-500/5 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase block">Completed This Month</span>
            <span className="text-xl font-black text-emerald-400">{completedCount}</span>
          </div>
          <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-sm bg-emerald-500/20 text-emerald-300">
            {roster.length ? Math.round((completedCount / roster.length) * 100) : 0}%
          </span>
        </div>

        <div className="p-3 border rounded-sm bg-[var(--color-brand-card)] border-amber-500/40 bg-amber-500/5 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase block">Audits Pending</span>
            <span className="text-xl font-black text-amber-400">{roster.length - completedCount}</span>
          </div>
          <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-sm bg-amber-500/20 text-amber-300">
            Action Required
          </span>
        </div>
      </div>

      {/* Search Input */}
      <input
        type="text"
        value={searchFilter}
        onChange={(e) => setSearchFilter(e.target.value)}
        placeholder="FILTER EMPLOYEE BY NAME..."
        className="w-full px-3.5 py-2.5 text-xs uppercase bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] text-white rounded-sm outline-none focus:border-[var(--color-brand-blue,#0088ff)]"
      />

      {/* Roster Ledger */}
      <div className="border rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] overflow-hidden shadow-xl">
        <div className="p-3 bg-[var(--color-brand-bg)] border-b border-[var(--color-brand-border)] flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Employee Audit Ledger ({filteredRoster.length})
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Period: {selectedMonth}</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[var(--color-brand-blue,#0088ff)] animate-pulse">
            LOADING ROSTER RECORDS...
          </div>
        ) : filteredRoster.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500 uppercase font-bold">
            [ No matching personnel assigned to Nestlé Springville ]
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-brand-border)]">
            {filteredRoster.map((emp) => (
              <div
                key={emp.employee_id}
                className="p-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black uppercase text-white">
                      {emp.employee_name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      ({emp.role})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                    Location: {emp.location} • Status:{" "}
                    <strong className={emp.hasAuditThisMonth ? "text-emerald-400" : "text-amber-400"}>
                      {emp.hasAuditThisMonth ? `Completed on ${emp.latestAudit?.audit_date}` : "Audit Pending"}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {emp.hasAuditThisMonth && emp.latestAudit ? (
                    <>
                      <button
                        type="button"
                        onClick={() => printRiskPredictionAudits([emp.latestAudit!])}
                        className="px-3 py-1.5 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] hover:border-white text-slate-200 text-xs font-bold uppercase rounded-sm cursor-pointer transition-colors"
                      >
                        🖨️ Print Form
                      </button>
                      <span className="px-3 py-1 text-[10px] font-black uppercase rounded-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                        ✓ Certified
                      </span>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenNewAudit({ id: emp.employee_id, name: emp.employee_name })}
                      className="px-4 py-1.5 bg-[var(--color-brand-blue,#0088ff)] hover:bg-white hover:text-black text-white text-xs font-black uppercase rounded-sm cursor-pointer shadow-md transition-all"
                    >
                      + Conduct Audit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FULL MODAL */}
      <AnimatePresence>
        {isAuditModalOpen && targetEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-sm bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] shadow-2xl overflow-hidden font-mono"
            >
              <div className="p-4 border-b border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] flex justify-between items-start shrink-0">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-blue,#0088ff)] block">
                    Quality Audit Evaluation
                  </span>
                  <h3 className="text-sm sm:text-base font-black uppercase text-white">
                    Monthly Risk Prediction Paperwork Quality Audit
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Target Employee: <strong className="text-white">{targetEmployee.name}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAuditModalOpen(false)}
                  className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs custom-scrollbar">
                {feedback && (
                  <div className="p-2.5 rounded-sm bg-red-500/10 border border-red-500/40 text-red-300 font-bold uppercase">
                    {feedback}
                  </div>
                )}

                {/* DETAILS GRID */}
                <div className="p-3 rounded-sm bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Audit Date</label>
                    <input
                      type="date"
                      value={auditDate}
                      onChange={(e) => setAuditDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-white text-xs rounded-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Target Work Date Audited</label>
                    <input
                      type="date"
                      value={targetWorkDate}
                      onChange={(e) => setTargetWorkDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-white text-xs rounded-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Auditor Name</label>
                    <input
                      type="text"
                      value={auditorSignature}
                      onChange={(e) => setAuditorSignature(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-white text-xs uppercase rounded-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Audited Location / Area</label>
                    <input
                      type="text"
                      value={auditedLocation}
                      onChange={(e) => setAuditedLocation(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-white text-xs uppercase rounded-sm outline-none"
                    />
                  </div>
                </div>

                {/* PART 1 */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-amber-300 border-b border-[var(--color-brand-border)] pb-1">
                    PART 1: DAILY RISK PREDICTION QUALITY AUDIT
                  </h4>

                  {/* 1. Basic Info */}
                  <div className="space-y-2">
                    <span className="font-bold uppercase text-white block">1. Basic Information & Pre-Checks</span>
                    <label className="flex items-start gap-2 cursor-pointer text-slate-300 font-sans">
                      <input
                        type="checkbox"
                        checked={preChecksSelected}
                        onChange={(e) => setPreChecksSelected(e.target.checked)}
                        className="mt-0.5 rounded-none cursor-pointer"
                      />
                      <span><strong>Pre-Checks Selected (Required *):</strong> LOTO, evacuation routes, safety shower, required tools verified.</span>
                    </label>

                    <label className="flex items-start gap-2 cursor-pointer text-slate-300 font-sans">
                      <input
                        type="checkbox"
                        checked={completedByLocation}
                        onChange={(e) => setCompletedByLocation(e.target.checked)}
                        className="mt-0.5 rounded-none cursor-pointer"
                      />
                      <span><strong>Risk Prediction Completed By & Location (Required *):</strong> Name and site/room accurately recorded.</span>
                    </label>

                    <label className="flex items-start gap-2 cursor-pointer text-slate-300 font-sans">
                      <input
                        type="checkbox"
                        checked={othersInvolved}
                        onChange={(e) => setOthersInvolved(e.target.checked)}
                        className="mt-0.5 rounded-none cursor-pointer"
                      />
                      <span><strong>Others Involved in Risk Prediction:</strong> Names of coworkers/crew members listed if working in teams.</span>
                    </label>
                  </div>

                  {/* 2. Alignment */}
                  <div className="space-y-2 pt-2 border-t border-[var(--color-brand-border)]">
                    <span className="font-bold uppercase text-white block">2. Initial Hazards & Precautions Alignment</span>
                    <label className="flex items-start gap-2 cursor-pointer text-slate-300 font-sans">
                      <input
                        type="checkbox"
                        checked={specificHazards}
                        onChange={(e) => setSpecificHazards(e.target.checked)}
                        className="mt-0.5 rounded-none cursor-pointer"
                      />
                      <span><strong>Specific Hazards Identified (Required *):</strong> Hazards checked match the actual work environment and task.</span>
                    </label>

                    <label className="flex items-start gap-2 cursor-pointer text-slate-300 font-sans">
                      <input
                        type="checkbox"
                        checked={precautionsChecked}
                        onChange={(e) => setPrecautionsChecked(e.target.checked)}
                        className="mt-0.5 rounded-none cursor-pointer"
                      />
                      <span><strong>Precautions Checked (Required *):</strong> Specific PPE and controls checked directly correspond to the selected hazards.</span>
                    </label>
                  </div>

                  {/* 3. Mandatory Sections */}
                  <div className="space-y-3 pt-2 border-t border-[var(--color-brand-border)]">
                    <span className="font-bold uppercase text-white block">3. Mandatory Sections</span>
                    <p className="text-[11px] text-slate-400 font-sans">Evaluate the depth and quality of written mitigation strategies:</p>

                    <div className="p-3 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] rounded-sm space-y-2">
                      <span className="font-bold text-white text-[11px] block">
                        &quot;Eliminate Hazard by (identify additional precautions to control hazards identified above)&quot;:
                      </span>
                      <div className="flex flex-wrap gap-3 text-[11px]">
                        {(["Complete & Detailed", "Vague / Generic", "Blank (Non-Compliant)"] as const).map((opt) => (
                          <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="eliminateHazard"
                              checked={eliminateHazardStatus === opt}
                              onChange={() => setEliminateHazardStatus(opt)}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={eliminateHazardNotes}
                        onChange={(e) => setEliminateHazardNotes(e.target.value)}
                        placeholder="Notes / Comments..."
                        className="w-full px-2.5 py-1 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-white text-xs rounded-sm outline-none"
                      />
                    </div>

                    <div className="p-3 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] rounded-sm space-y-2">
                      <span className="font-bold text-white text-[11px] block">
                        &quot;ADDITIONAL THOUGHTS&quot;:
                      </span>
                      <div className="flex flex-wrap gap-3 text-[11px]">
                        {(["Meaningful Context Provided", "Minimal / One-word", "Blank (Non-Compliant)"] as const).map((opt) => (
                          <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="additionalThoughts"
                              checked={additionalThoughtsStatus === opt}
                              onChange={() => setAdditionalThoughtsStatus(opt)}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={additionalThoughtsNotes}
                        onChange={(e) => setAdditionalThoughtsNotes(e.target.value)}
                        placeholder="Notes / Comments..."
                        className="w-full px-2.5 py-1 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-white text-xs rounded-sm outline-none"
                      />
                    </div>
                  </div>

                  {/* 4. Detailed Breakdown */}
                  <div className="space-y-3 pt-2 border-t border-[var(--color-brand-border)]">
                    <span className="font-bold uppercase text-white block">
                      4. Detailed Job Task Breakdown (Specific Hazards & Precautions)
                    </span>
                    <label className="flex items-start gap-2 cursor-pointer text-slate-300 font-sans">
                      <input
                        type="checkbox"
                        checked={jobDescRequired}
                        onChange={(e) => setJobDescRequired(e.target.checked)}
                        className="mt-0.5 rounded-none cursor-pointer"
                      />
                      <span><strong>Job Description For Above (Required *):</strong> Detailed scope of the day&apos;s work (not just 1-2 words).</span>
                    </label>

                    <label className="flex items-start gap-2 cursor-pointer text-slate-300 font-sans">
                      <input
                        type="checkbox"
                        checked={task1Breakdown}
                        onChange={(e) => setTask1Breakdown(e.target.checked)}
                        className="mt-0.5 rounded-none cursor-pointer"
                      />
                      <span><strong>Job Task #1 Breakdown (Required *):</strong> High-hazard task named with specific hazards/precautions (1a, 1b, 1c).</span>
                    </label>

                    <label className="flex items-start gap-2 cursor-pointer text-slate-300 font-sans">
                      <input
                        type="checkbox"
                        checked={task2Breakdown}
                        onChange={(e) => setTask2Breakdown(e.target.checked)}
                        className="mt-0.5 rounded-none cursor-pointer"
                      />
                      <span><strong>Job Task #2 Breakdown:</strong> Clear secondary task defined with corresponding hazard/precaution entries.</span>
                    </label>

                    <label className="flex items-start gap-2 cursor-pointer text-slate-300 font-sans">
                      <input
                        type="checkbox"
                        checked={task3Breakdown}
                        onChange={(e) => setTask3Breakdown(e.target.checked)}
                        className="mt-0.5 rounded-none cursor-pointer"
                      />
                      <span><strong>Job Task #3 Breakdown:</strong> Third high-hazard task detailed if applicable to full shift scope.</span>
                    </label>

                    <div className="pt-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        Specificity Score:
                      </span>
                      <div className="flex flex-wrap gap-3">
                        {(["High Detail (Actionable)", "Moderate Detail", "Unacceptable (Check-the-box only)"] as const).map((sc) => (
                          <label key={sc} className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="specificityScore"
                              checked={specificityScore === sc}
                              onChange={() => setSpecificityScore(sc)}
                            />
                            <span>{sc}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 5. STOP & RE-EVALUATE */}
                  <div className="space-y-3 pt-2 border-t border-[var(--color-brand-border)]">
                    <span className="font-bold uppercase text-white block">
                      5. Prompts to STOP and RE-EVALUATE
                    </span>
                    <label className="flex items-start gap-2 cursor-pointer text-slate-300 font-sans">
                      <input
                        type="checkbox"
                        checked={unexpectedEvents}
                        onChange={(e) => setUnexpectedEvents(e.target.checked)}
                        className="mt-0.5 rounded-none cursor-pointer"
                      />
                      <span><strong>2-3 Unexpected Events Identified (Required *):</strong> Realistic scenarios checked (e.g., stuck, rush, line of fire).</span>
                    </label>

                    <div className="p-3 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] rounded-sm space-y-2">
                      <span className="font-bold text-white text-[11px] block">
                        &quot;Now list how you will react to each prompt you checked&quot; (Required *):
                      </span>
                      <div className="flex gap-4">
                        {(["Specific, actionable response detailed", "Incomplete / Vague"] as const).map((st) => (
                          <label key={st} className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="reactPrompt"
                              checked={reactPromptStatus === st}
                              onChange={() => setReactPromptStatus(st)}
                            />
                            <span>{st}</span>
                          </label>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={reactPromptNotes}
                        onChange={(e) => setReactPromptNotes(e.target.value)}
                        placeholder="Notes..."
                        className="w-full px-2.5 py-1 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-white text-xs rounded-sm outline-none"
                      />
                    </div>

                    <div className="pt-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        Audit Quality Score:
                      </span>
                      <div className="flex flex-wrap gap-3">
                        {(["Meets Standards (Detailed & Complete)", "Needs Improvement", "Unsatisfactory"] as const).map((qs) => (
                          <label key={qs} className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="auditQuality"
                              checked={auditQualityScore === qs}
                              onChange={() => setAuditQualityScore(qs)}
                            />
                            <span>{qs}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* PART 2 */}
                <div className="space-y-4 pt-2 border-t border-[var(--color-brand-border)]">
                  <h4 className="text-xs font-black uppercase text-amber-300 border-b border-[var(--color-brand-border)] pb-1">
                    PART 2: EMPLOYEE FEEDBACK & COACHING
                  </h4>

                  <div className="space-y-1.5">
                    <span className="font-bold text-white block">
                      1. What the Employee Did Well (Quality Strengths)
                    </span>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Highlight strong areas of detail, thorough task breakdown, or proactive risk thinking:
                    </p>
                    <textarea
                      rows={2}
                      value={strengthsNotes}
                      onChange={(e) => setStrengthsNotes(e.target.value)}
                      placeholder="Enter strengths observed..."
                      className="w-full p-2 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] text-white rounded-sm outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-bold text-white block">
                      2. Areas for Improvement (Missing Fields & Detail Gaps)
                    </span>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Address vague descriptions, unchecked required items, or omitted custom fields:
                    </p>
                    <textarea
                      rows={2}
                      value={improvementsNotes}
                      onChange={(e) => setImprovementsNotes(e.target.value)}
                      placeholder="Enter coaching notes and gaps..."
                      className="w-full p-2 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] text-white rounded-sm outline-none"
                    />
                  </div>

                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Corrective Action / Coaching Required:
                    </span>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 cursor-pointer font-sans">
                        <input
                          type="checkbox"
                          checked={coachingCompleted}
                          onChange={(e) => setCoachingCompleted(e.target.checked)}
                          className="rounded-none cursor-pointer"
                        />
                        <span>Paperwork Coaching Completed During Audit</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer font-sans">
                        <input
                          type="checkbox"
                          checked={reAuditScheduled}
                          onChange={(e) => setReAuditScheduled(e.target.checked)}
                          className="rounded-none cursor-pointer"
                        />
                        <span>Re-audit Scheduled Within 7 Days</span>
                      </label>
                    </div>
                  </div>

                  {/* SIGNATURES */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[var(--color-brand-border)]">
                    <div className="p-2.5 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400 block">Employee Signature:</label>
                      <input
                        type="text"
                        value={employeeSignature}
                        onChange={(e) => setEmployeeSignature(e.target.value)}
                        className="w-full px-2 py-1 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-white font-bold"
                      />
                      <input
                        type="date"
                        value={employeeSigDate}
                        onChange={(e) => setEmployeeSigDate(e.target.value)}
                        className="w-full px-2 py-1 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-white text-[11px]"
                      />
                    </div>

                    <div className="p-2.5 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400 block">Auditor Signature:</label>
                      <input
                        type="text"
                        value={auditorSignature}
                        onChange={(e) => setAuditorSignature(e.target.value)}
                        className="w-full px-2 py-1 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-white font-bold"
                      />
                      <input
                        type="date"
                        value={auditorSigDate}
                        onChange={(e) => setAuditorSigDate(e.target.value)}
                        className="w-full px-2 py-1 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-white text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4 border-t border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAuditModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold uppercase text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitAudit}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-[var(--color-brand-blue,#0088ff)] hover:bg-white hover:text-black text-white text-xs font-black uppercase rounded-sm cursor-pointer disabled:opacity-40 transition-all shadow-md"
                >
                  {isSubmitting ? "Submitting Audit..." : "Save & Complete Audit"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}