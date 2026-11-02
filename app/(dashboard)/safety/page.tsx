"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

// --- CENTRAL DATA SERVICE & BRIEFING IMPORTS ---
import { 
  getEmployeeProfile, 
  completeDailySafetyBriefing,
  getActiveSiteBriefingId,
  getActiveDailyJhas,
  signDailyJha,
  formatEmployeeName,
  getEmployeeToolbox,
  EmployeeToolboxItem,
  UserProfile,
  DailyJhaRecord
} from "@/lib/db/operations";
import { getDailyBriefing, getBriefingById, SafetyBriefing } from "@/lib/data/safetyBriefings";
import { isNestleSpringville } from "@/lib/data/toolCatalog";
import DailyBriefingModal from "./_components/DailyBriefingModal";
import DailyToolCheckModule from "./_components/DailyToolCheckModule";

type WorkflowStep = "BRIEFING" | "JHA" | "TOOL_CHECK" | "CHECKLIST";

export default function SafetyMeetingPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [mounted, setMounted] = useState<boolean>(false);

  // Workflow State Machine
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("BRIEFING");
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);
  const [hasCompletedToday, setHasCompletedToday] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [terminalFeedback, setTerminalFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  // User Profile
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);

  // Location isolation check
  const isSpringvilleSite = isNestleSpringville(currentUserProfile?.location);

  // Step 1: Briefing States
  const [dailyBriefing, setDailyBriefing] = useState<SafetyBriefing>(() => getDailyBriefing());
  const [showBriefingModal, setShowBriefingModal] = useState<boolean>(false);
  const [hasCompletedBriefing, setHasCompletedBriefing] = useState<boolean>(false);

  // Step 2: Multi-JHA States
  const [activeJhas, setActiveJhas] = useState<DailyJhaRecord[]>([]);
  const [selectedJhaIds, setSelectedJhaIds] = useState<string[]>([]);
  const [inspectedJha, setInspectedJha] = useState<DailyJhaRecord | null>(null);
  const [hasSignedJhas, setHasSignedJhas] = useState<boolean>(false);

  // Step 3: Tool Check States
  const [userToolbox, setUserToolbox] = useState<EmployeeToolboxItem[]>([]);
  const [inspectedToolsSummary, setInspectedToolsSummary] = useState<string[]>([]);
  const [verifiedTapeColor, setVerifiedTapeColor] = useState<string>("");
  const [hasCompletedToolCheck, setHasCompletedToolCheck] = useState<boolean>(false);

  // Step 4: Final Attestations
  const [ppeDefectsChecked, setPpeDefectsChecked] = useState<boolean>(false);
  const [paperworkCertified, setPaperworkCertified] = useState<boolean>(false);
  const [fitForWorkChecked, setFitForWorkChecked] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Modal scroll lock
  useEffect(() => {
    if (inspectedJha) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [inspectedJha]);

  useEffect(() => {
    async function checkTodayStatus() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const userProfile = await getEmployeeProfile(supabase, user.id);
        setCurrentUserProfile(userProfile);
        const todayDate = new Date().toISOString().split("T")[0];

        const isSpringville = isNestleSpringville(userProfile?.location);

        // Site briefing override & data fetches
        if (userProfile?.location) {
          const safeLocation = userProfile.location.trim();
          const overrideId = await getActiveSiteBriefingId(supabase, safeLocation);
          if (overrideId) {
            const siteBriefing = getBriefingById(overrideId);
            if (siteBriefing) setDailyBriefing(siteBriefing);
          }

          // Fetch active JHAs only if assigned to Springville
          if (isSpringville) {
            const jhaRecords = await getActiveDailyJhas(supabase, "Nestle Springville");
            setActiveJhas(jhaRecords);
          }
        }

        // Fetch employee digital toolbox only if at Springville
        if (isSpringville) {
          const toolboxItems = await getEmployeeToolbox(supabase, user.id);
          setUserToolbox(toolboxItems);
        }

        if (userProfile?.last_safety_check === todayDate) {
          setHasCompletedToday(true);
          setHasCompletedBriefing(true);
          setHasSignedJhas(true);
          setHasCompletedToolCheck(true);
          setPpeDefectsChecked(true);
          setPaperworkCertified(true);
          setFitForWorkChecked(true);
          setCurrentStep("CHECKLIST");
        } else {
          setShowBriefingModal(true);
        }
      } catch (err) {
        console.error("Failed to check daily safety status:", err);
      } finally {
        setIsLoadingStatus(false);
      }
    }

    checkTodayStatus();
  }, [supabase]);

  // Step 1 Completed Handler
  const handleBriefingComplete = () => {
    setShowBriefingModal(false);
    setHasCompletedBriefing(true);
    if (isSpringvilleSite) {
      setCurrentStep("JHA");
    } else {
      setCurrentStep("CHECKLIST");
    }
  };

  // Step 2 Multi-JHA Selection Handlers
  const toggleJhaSelection = (id: string) => {
    setSelectedJhaIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllJhas = () => {
    if (selectedJhaIds.length === activeJhas.length) {
      setSelectedJhaIds([]);
    } else {
      setSelectedJhaIds(activeJhas.map((j) => j.id));
    }
  };

  const handleConfirmJhaStep = async () => {
    if (activeJhas.length > 0 && selectedJhaIds.length === 0) {
      setTerminalFeedback({
        message: "Please select at least one assigned JHA before continuing.",
        isError: true,
      });
      return;
    }

    setTerminalFeedback(null);
    setHasSignedJhas(true);
    setCurrentStep("TOOL_CHECK");
  };

  // Step 3 Tool Check Completed Handler
  const handleToolCheckCompleted = (selectedToolNames: string[], tapeColor: string) => {
    setInspectedToolsSummary(selectedToolNames);
    setVerifiedTapeColor(tapeColor);
    setHasCompletedToolCheck(true);
    setCurrentStep("CHECKLIST");
  };

  // Refresh user toolbox from DB
  const refreshToolbox = async () => {
    if (currentUserProfile?.id && isSpringvilleSite) {
      const updated = await getEmployeeToolbox(supabase, currentUserProfile.id);
      setUserToolbox(updated);
    }
  };

  // Step 4 Final Execution & 10 Points Award
  const handleFinalSignSubmit = async () => {
    if (!ppeDefectsChecked || !paperworkCertified || !fitForWorkChecked) {
      setTerminalFeedback({
        message: "Please acknowledge all final certifications before submitting.",
        isError: true,
      });
      return;
    }

    setIsSubmitting(true);
    setTerminalFeedback(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTerminalFeedback({ message: "Authentication timeout. Please re-login.", isError: true });
        setIsSubmitting(false);
        return;
      }

      const empName = currentUserProfile 
        ? formatEmployeeName(currentUserProfile) 
        : "IMC Employee";
      const userLoc = currentUserProfile?.location?.trim() || "Nestle Springville";

      // 1. Batch-sign all selected JHAs (Springville only)
      if (isSpringvilleSite && selectedJhaIds.length > 0) {
        await Promise.all(
          selectedJhaIds.map((jhaId) =>
            signDailyJha(supabase, jhaId, user.id, empName, userLoc)
          )
        );
      }

      // 2. Log Daily Safety Briefing & Award 10 Points
      const activeBriefingId = dailyBriefing?.id || "briefing-001";
      const activeBriefingTitle = dailyBriefing?.title || "Daily Safety Briefing";

      const result = await completeDailySafetyBriefing(supabase, user.id, {
        briefingId: activeBriefingId,
        briefingTitle: activeBriefingTitle,
        location: userLoc,
      });

      if (!result.success) {
        if (result.alreadyCheckedIn) {
          setHasCompletedToday(true);
          setTerminalFeedback({ message: "Check-in already logged for today.", isError: false });
        } else {
          setTerminalFeedback({ message: `Database Exception: ${result.error}`, isError: true });
        }
        setIsSubmitting(false);
        return;
      }

      setHasCompletedToday(true);
      setShowCelebration(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setTerminalFeedback({
        message: `Execution fault: ${err?.message || "Check network/permissions"}`,
        isError: true,
      });
      setIsSubmitting(false);
    }
  };

  // Define steps dynamically based on location
  const stepsList: { key: WorkflowStep; label: string; number: number }[] = isSpringvilleSite
    ? [
        { key: "BRIEFING", label: "Meeting Briefing", number: 1 },
        { key: "JHA", label: "Select JHAs", number: 2 },
        { key: "TOOL_CHECK", label: "Tool Check", number: 3 },
        { key: "CHECKLIST", label: "Final Checkoff", number: 4 },
      ]
    : [
        { key: "BRIEFING", label: "Meeting Briefing", number: 1 },
        { key: "CHECKLIST", label: "Final Checkoff", number: 2 },
      ];

  const currentStepIndex = stepsList.findIndex((s) => s.key === currentStep);

  return (
    <div className="w-full relative flex-1 flex flex-col justify-start py-4 sm:py-8 pb-16 font-mono text-slate-100 select-none">
      
      {/* MANDATORY BRIEFING MODAL */}
      <DailyBriefingModal
        briefing={dailyBriefing}
        isOpen={showBriefingModal}
        onComplete={handleBriefingComplete}
      />

      {/* Blueprint Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_right,var(--color-brand-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-brand-border)_1px,transparent_1px)] bg-[size:32px_32px] z-0" />

      <div className="flex-1 p-3.5 sm:p-6 max-w-5xl mx-auto w-full relative z-10 space-y-5">
        
        {/* HEADER & STEPPER BAR */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-[var(--color-brand-border)] p-4 sm:p-5 rounded-sm relative overflow-hidden shadow-lg bg-[var(--color-brand-card)] space-y-4"
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-blue,#0088ff)]" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-none bg-[var(--color-brand-blue,#0088ff)] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-brand-blue,#0088ff)]">
                  Pre-Task Safety Pipeline {isSpringvilleSite ? "• Nestle 5959 Standard" : ""}
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-slate-100 uppercase tracking-tight mt-0.5">
                Daily Shift Verification & Sign-Off
              </h1>
            </div>

            {hasCompletedToday ? (
              <span className="self-start sm:self-auto px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-sm bg-emerald-500/10 border border-emerald-500/40 text-emerald-400">
                ✓ Completed For Today (+10 PTS)
              </span>
            ) : (
              <span className="self-start sm:self-auto text-xs font-mono font-bold text-slate-400">
                Site: <strong className="text-white">{currentUserProfile?.location || "Springville"}</strong>
              </span>
            )}
          </div>

          {/* Stepper Breadcrumbs */}
          <div className={`grid gap-2 pt-2 border-t border-[var(--color-brand-border)] ${
            isSpringvilleSite ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2"
          }`}>
            {stepsList.map((step, idx) => {
              const isPast = idx < currentStepIndex || hasCompletedToday;
              const isCurrent = idx === currentStepIndex && !hasCompletedToday;

              return (
                <div
                  key={step.key}
                  className={`p-2 border rounded-sm flex items-center gap-2 transition-all ${
                    isCurrent
                      ? "border-[var(--color-brand-blue,#0088ff)] bg-[var(--color-brand-blue,#0088ff)]/10 text-white"
                      : isPast
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                      : "border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] text-slate-500 opacity-60"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-xs text-[10px] font-black flex items-center justify-center ${
                      isPast
                        ? "bg-emerald-400 text-black"
                        : isCurrent
                        ? "bg-[var(--color-brand-blue,#0088ff)] text-white"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {isPast ? "✓" : step.number}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider truncate">
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.header>

        {/* FEEDBACK BANNER */}
        {terminalFeedback && (
          <div
            className={`p-3 font-mono text-xs font-bold uppercase tracking-wider border rounded-sm ${
              terminalFeedback.isError
                ? "bg-red-500/10 border-red-500/40 text-red-400"
                : "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
            }`}
          >
            [{terminalFeedback.isError ? "ACTION_ERROR" : "CONFIRMED"}] {terminalFeedback.message}
          </div>
        )}

        {/* =========================================================================
            STAGE 1: DAILY BRIEFING SPOTLIGHT & REVIEW
        ========================================================================= */}
        {currentStep === "BRIEFING" && !hasCompletedToday && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border p-5 sm:p-6 rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] space-y-4 shadow-xl"
          >
            <div className="flex justify-between items-center border-b border-[var(--color-brand-border)] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-[var(--color-brand-blue,#0088ff)] tracking-wider">
                  Step 1 of {stepsList.length} • Daily Safety Meeting
                </span>
                <h2 className="text-sm sm:text-base font-black uppercase text-white mt-0.5">
                  Review Today&apos;s Safety Briefing
                </h2>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                {dailyBriefing.category}
              </span>
            </div>

            <div className="p-4 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] space-y-2">
              <h3 className="text-base font-black uppercase text-white">
                {dailyBriefing.title}
              </h3>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {dailyBriefing.intro}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowBriefingModal(true)}
                className="w-full sm:w-auto min-h-[44px] px-5 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] hover:border-white text-slate-200 text-xs font-bold uppercase rounded-sm cursor-pointer transition-colors"
              >
                📖 Read Full Briefing Document ↗
              </button>

              <button
                type="button"
                onClick={handleBriefingComplete}
                className="w-full sm:w-auto min-h-[44px] px-8 bg-[var(--color-brand-blue,#0088ff)] text-white hover:bg-white hover:text-black text-xs font-black uppercase rounded-sm cursor-pointer transition-all shadow-md active:scale-[0.98]"
              >
                {isSpringvilleSite ? "Acknowledge Briefing & Next Step ➔" : "Acknowledge Briefing & Final Sign-Off ➔"}
              </button>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            STAGE 2: MULTI-JHA SELECTION (NESTLÉ SPRINGVILLE ONLY)
        ========================================================================= */}
        {isSpringvilleSite && currentStep === "JHA" && !hasCompletedToday && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border p-5 sm:p-6 rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] space-y-4 shadow-xl"
          >
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[var(--color-brand-border)] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-[var(--color-brand-blue,#0088ff)] tracking-wider">
                  Step 2 of 4 • Pre-Task Job Assignment
                </span>
                <h2 className="text-sm sm:text-base font-black uppercase text-white mt-0.5">
                  Select All JHAs You Are Working On Today
                </h2>
              </div>

              {activeJhas.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAllJhas}
                  className="self-start sm:self-auto text-[11px] font-bold uppercase text-[var(--color-brand-blue,#0088ff)] hover:text-white cursor-pointer underline"
                >
                  {selectedJhaIds.length === activeJhas.length ? "Deselect All" : "Select All Active Jobs"}
                </button>
              )}
            </div>

            <p className="text-xs text-slate-400">
              Check every job you know you will touch today. You can inspect any card before proceeding:
            </p>

            {activeJhas.length === 0 ? (
              <div className="p-8 border border-dashed border-[var(--color-brand-border)] text-center text-slate-500 uppercase text-xs font-bold rounded-sm space-y-2">
                <p>[ No active JHAs currently published for this worksite ]</p>
                <p className="text-[10px] text-slate-600 font-normal">
                  You may proceed directly to the tool inspection step.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeJhas.map((jha) => {
                  const isChecked = selectedJhaIds.includes(jha.id);

                  return (
                    <div
                      key={jha.id}
                      onClick={() => toggleJhaSelection(jha.id)}
                      className={`p-4 border rounded-sm cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                        isChecked
                          ? "bg-[var(--color-brand-blue,#0088ff)]/10 border-[var(--color-brand-blue,#0088ff)]"
                          : "bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] hover:border-slate-500"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-sm bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-[var(--color-brand-blue,#0088ff)]">
                            {jha.location}
                          </span>
                          <div
                            className={`w-5 h-5 rounded-xs border-2 flex items-center justify-center transition-all ${
                              isChecked
                                ? "bg-[var(--color-brand-blue,#0088ff)] border-[var(--color-brand-blue,#0088ff)] text-white"
                                : "border-slate-500 bg-transparent"
                            }`}
                          >
                            {isChecked && <span className="text-xs font-black">✓</span>}
                          </div>
                        </div>

                        <h3 className="text-sm font-black uppercase text-white leading-snug">
                          {jha.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-mono mt-1">
                          Lead / Supervisor: <strong className="text-slate-200">{jha.supervisor}</strong>
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[var(--color-brand-border)]/60 flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 font-mono">
                          {jha.steps.length} Steps Sequence
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectedJha(jha);
                          }}
                          className="text-[var(--color-brand-blue,#0088ff)] font-bold uppercase hover:underline cursor-pointer"
                        >
                          Inspect Controls ↗
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-[var(--color-brand-border)]">
              <span className="text-xs font-mono text-slate-400 font-bold">
                {selectedJhaIds.length} Job{selectedJhaIds.length === 1 ? "" : "s"} Selected For Today
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setCurrentStep("BRIEFING")}
                  className="w-1/2 sm:w-auto min-h-[44px] px-5 border border-[var(--color-brand-border)] text-slate-400 hover:text-white rounded-sm font-bold uppercase text-xs cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmJhaStep}
                  className="w-1/2 sm:w-auto min-h-[44px] px-8 bg-[var(--color-brand-blue,#0088ff)] text-white hover:bg-white hover:text-black text-xs font-black uppercase rounded-sm cursor-pointer transition-all shadow-md active:scale-[0.98]"
                >
                  Confirm Jobs & Tool Check ➔
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            STAGE 3: NESTLÉ 5959-SHE-INS-0022 TOOL CHECK (NESTLÉ SPRINGVILLE ONLY)
        ========================================================================= */}
        {isSpringvilleSite && currentStep === "TOOL_CHECK" && !hasCompletedToday && (
          <DailyToolCheckModule
            supabase={supabase}
            userId={currentUserProfile?.id || ""}
            employeeName={currentUserProfile ? (formatEmployeeName(currentUserProfile) || "IMC Employee") : "IMC Employee"}
            userLocation="Nestle Springville"
            toolbox={userToolbox}
            onToolboxUpdated={refreshToolbox}
            onComplete={handleToolCheckCompleted}
            onBack={() => setCurrentStep("JHA")}
          />
        )}

        {/* =========================================================================
            STAGE 4: FINAL CHECKOFF & 10-POINT EXECUTION
        ========================================================================= */}
        {(currentStep === "CHECKLIST" || hasCompletedToday) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border p-5 sm:p-8 rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] space-y-6 shadow-xl"
          >
            <div className="flex justify-between items-center border-b border-[var(--color-brand-border)] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">
                  Step {stepsList.length} of {stepsList.length} • Final Shift Attestation
                </span>
                <h2 className="text-sm sm:text-base font-black uppercase text-white mt-0.5">
                  Confirm Daily Verifications
                </h2>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                Award: +10 PTS
              </span>
            </div>

            <div className="space-y-3">
              {/* 1. Daily Meeting Checkbox (Auto-checked from Step 1) */}
              <div className="w-full min-h-[48px] p-3.5 border rounded-sm flex items-center gap-3.5 bg-emerald-500/10 border-emerald-500 text-emerald-300">
                <div className="w-5 h-5 flex-shrink-0 border-2 bg-emerald-500 border-emerald-500 rounded-xs flex items-center justify-center text-black font-black text-xs">
                  ✓
                </div>
                <span className="text-xs sm:text-sm font-black uppercase tracking-wide">
                  1. I have reviewed the daily safety meeting briefing.
                </span>
              </div>

              {/* 2. JHA Sign-Off Checkbox (Springville Only) */}
              {isSpringvilleSite && (
                <div className="w-full min-h-[48px] p-3.5 border rounded-sm flex items-center gap-3.5 bg-emerald-500/10 border-emerald-500 text-emerald-300">
                  <div className="w-5 h-5 flex-shrink-0 border-2 bg-emerald-500 border-emerald-500 rounded-xs flex items-center justify-center text-black font-black text-xs">
                    ✓
                  </div>
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wide">
                    2. I have selected and signed off on today&apos;s assigned JHA documents ({selectedJhaIds.length} Selected).
                  </span>
                </div>
              )}

              {/* 3. Tool Check Checkbox (Springville Only) */}
              {isSpringvilleSite && (
                <div className="w-full min-h-[48px] p-3.5 border rounded-sm flex items-center gap-3.5 bg-emerald-500/10 border-emerald-500 text-emerald-300">
                  <div className="w-5 h-5 flex-shrink-0 border-2 bg-emerald-500 border-emerald-500 rounded-xs flex items-center justify-center text-black font-black text-xs">
                    ✓
                  </div>
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wide">
                    3. I have verified {inspectedToolsSummary.length} tools against Nestlé 5959-SHE-INS-0022 {verifiedTapeColor ? `(${verifiedTapeColor} Tape)` : ""}.[cite: 2]
                  </span>
                </div>
              )}

              {/* PPE Inspection Checkbox (Manual check) */}
              <button
                type="button"
                disabled={hasCompletedToday}
                onClick={() => setPpeDefectsChecked((prev) => !prev)}
                className={`w-full min-h-[48px] p-3.5 border rounded-sm flex items-center gap-3.5 text-left transition-all cursor-pointer ${
                  ppeDefectsChecked
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-300"
                    : "bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] hover:border-slate-400 text-white"
                }`}
              >
                <div
                  className={`w-5 h-5 flex-shrink-0 border-2 rounded-xs flex items-center justify-center ${
                    ppeDefectsChecked
                      ? "bg-emerald-500 border-emerald-500 text-black font-black text-xs"
                      : "border-[var(--color-brand-blue,#0088ff)] bg-transparent"
                  }`}
                >
                  {ppeDefectsChecked && "✓"}
                </div>
                <span className="text-xs sm:text-sm font-black uppercase tracking-wide">
                  {isSpringvilleSite ? "4." : "2."} I have inspected my PPE for defects.
                </span>
              </button>

              {/* Paperwork Certification Checkbox (Manual check) */}
              <button
                type="button"
                disabled={hasCompletedToday}
                onClick={() => setPaperworkCertified((prev) => !prev)}
                className={`w-full min-h-[48px] p-3.5 border rounded-sm flex items-center gap-3.5 text-left transition-all cursor-pointer ${
                  paperworkCertified
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-300"
                    : "bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] hover:border-slate-400 text-white"
                }`}
              >
                <div
                  className={`w-5 h-5 flex-shrink-0 border-2 rounded-xs flex items-center justify-center ${
                    paperworkCertified
                      ? "bg-emerald-500 border-emerald-500 text-black font-black text-xs"
                      : "border-[var(--color-brand-blue,#0088ff)] bg-transparent"
                  }`}
                >
                  {paperworkCertified && "✓"}
                </div>
                <span className="text-xs sm:text-sm font-black uppercase tracking-wide">
                  {isSpringvilleSite ? "5." : "3."} I have verified all paperwork and permits.
                </span>
              </button>

              {/* Fit for Work Checkbox (Manual check) */}
              <button
                type="button"
                disabled={hasCompletedToday}
                onClick={() => setFitForWorkChecked((prev) => !prev)}
                className={`w-full min-h-[48px] p-3.5 border rounded-sm flex items-center gap-3.5 text-left transition-all cursor-pointer ${
                  fitForWorkChecked
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-300"
                    : "bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] hover:border-slate-400 text-white"
                }`}
              >
                <div
                  className={`w-5 h-5 flex-shrink-0 border-2 rounded-xs flex items-center justify-center ${
                    fitForWorkChecked
                      ? "bg-emerald-500 border-emerald-500 text-black font-black text-xs"
                      : "border-[var(--color-brand-blue,#0088ff)] bg-transparent"
                  }`}
                >
                  {fitForWorkChecked && "✓"}
                </div>
                <span className="text-xs sm:text-sm font-black uppercase tracking-wide">
                  {isSpringvilleSite ? "6." : "4."} I am fit for work.
                </span>
              </button>
            </div>

            {hasCompletedToday ? (
              <div className="w-full min-h-[48px] py-3.5 font-bold uppercase tracking-widest text-xs flex justify-center items-center rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] text-slate-400">
                ✓ ALL VERIFICATIONS LOGGED FOR TODAY
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-[var(--color-brand-border)]">
                {isSpringvilleSite ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep("TOOL_CHECK")}
                    className="w-full sm:w-auto min-h-[44px] px-5 border border-[var(--color-brand-border)] text-slate-400 hover:text-white rounded-sm font-bold uppercase text-xs cursor-pointer"
                  >
                    ← Back to Tool Check
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCurrentStep("BRIEFING")}
                    className="w-full sm:w-auto min-h-[44px] px-5 border border-[var(--color-brand-border)] text-slate-400 hover:text-white rounded-sm font-bold uppercase text-xs cursor-pointer"
                  >
                    ← Back to Briefing
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleFinalSignSubmit}
                  disabled={!ppeDefectsChecked || !paperworkCertified || !fitForWorkChecked || isSubmitting}
                  className="w-full sm:w-auto min-h-[48px] px-10 bg-[var(--color-brand-blue,#0088ff)] text-white hover:bg-white hover:text-black rounded-sm font-black uppercase text-xs cursor-pointer transition-all shadow-[0_0_20px_rgba(0,136,255,0.4)] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {isSubmitting ? "Logging Shift Ledger..." : "Sign & Earn 10 Points ↗"}
                </button>
              </div>
            )}
          </motion.div>
        )}

      </div>

      {/* JHA DOCUMENT INSPECTION MODAL */}
      {mounted && createPortal(
        <AnimatePresence>
          {inspectedJha && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-md font-mono text-slate-100 select-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full max-w-4xl h-[92vh] max-h-[92vh] flex flex-col border shadow-2xl rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] overflow-hidden"
              >
                <div className="p-4 sm:p-5 border-b border-[var(--color-brand-border)] flex justify-between items-start bg-[var(--color-brand-bg)] shrink-0">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-brand-blue,#0088ff)] block">
                      JHA Scope & Risk Prediction Audit
                    </span>
                    <h2 className="text-sm sm:text-lg font-black uppercase text-white mt-1">
                      {inspectedJha.title}
                    </h2>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Designated Lead / Supervisor: <strong className="text-slate-100">{inspectedJha.supervisor}</strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setInspectedJha(null)}
                    className="min-h-[38px] min-w-[38px] flex items-center justify-center text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs custom-scrollbar">
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Work Sequence, Potential Hazards & Control Measures ({inspectedJha.steps.length} Steps)
                    </h3>
                    <div className="space-y-2.5">
                      {inspectedJha.steps.map((st, idx) => (
                        <div
                          key={st.id || idx}
                          className="p-3.5 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 flex items-center justify-center rounded-xs bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-[10px] font-black text-slate-300">
                              {idx + 1}
                            </span>
                            <p className="text-xs font-black uppercase text-white">{st.step}</p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                            <div className="p-2.5 bg-[var(--color-brand-card)] rounded-sm border border-red-500/20">
                              <span className="text-[9px] font-bold uppercase text-red-400 block mb-0.5">
                                Potential Hazards:
                              </span>
                              <p className="text-slate-300 font-sans text-xs leading-relaxed">{st.hazards}</p>
                            </div>
                            <div className="p-2.5 bg-[var(--color-brand-card)] rounded-sm border border-emerald-500/20">
                              <span className="text-[9px] font-bold uppercase text-emerald-400 block mb-0.5">
                                Hazard Control Measures:
                              </span>
                              <p className="text-slate-300 font-sans text-xs leading-relaxed">{st.controls}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] flex justify-between items-center shrink-0">
                  <span className="text-xs text-slate-400 font-mono">
                    Status: {selectedJhaIds.includes(inspectedJha.id) ? "Selected for Sign-Off" : "Not Selected"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      toggleJhaSelection(inspectedJha.id);
                      setInspectedJha(null);
                    }}
                    className="min-h-[40px] px-6 bg-[var(--color-brand-blue,#0088ff)] text-white hover:bg-white hover:text-black font-bold uppercase text-xs rounded-sm cursor-pointer"
                  >
                    {selectedJhaIds.includes(inspectedJha.id) ? "Deselect Job" : "Select Job ✓"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Celebration +10 PTS Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="text-center flex flex-col items-center p-6 sm:p-8 border rounded-sm shadow-2xl max-w-sm w-full bg-[var(--color-brand-card)] border-[var(--color-brand-green,#00ff9d)]"
            >
              <div 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 flex items-center justify-center mb-5 sm:mb-6 shadow-2xl bg-[var(--color-brand-green,#00ff9d)]/15 border-[var(--color-brand-green,#00ff9d)]"
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-green, #00ff9d)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h2 className="text-5xl sm:text-6xl font-black tracking-tighter drop-shadow-md font-mono text-[var(--color-brand-green,#00ff9d)]">
                +10 PTS
              </h2>
              <p className="text-slate-300 mt-4 sm:mt-6 text-xs font-bold tracking-[0.2em] uppercase">
                {isSpringvilleSite ? "All 4 Steps Completed." : "Safety Check Completed."} Returning to Dashboard...
              </p>
              <div className="mt-6 sm:mt-8 w-44 sm:w-48 h-1 rounded-full overflow-hidden bg-[var(--color-brand-border)]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "linear" }}
                  className="h-full bg-[var(--color-brand-green,#00ff9d)]"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}