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
  UserProfile,
  DailyJhaRecord
} from "@/lib/db/operations";
import { getDailyBriefing, getBriefingById, SafetyBriefing } from "@/lib/data/safetyBriefings";
import DailyBriefingModal from "./_components/DailyBriefingModal";

interface ChecklistItem {
  id: number;
  text: string;
}

const checks: ChecklistItem[] = [
  { id: 1, text: "I have inspected my PPE for defects." },
  { id: 2, text: "I have verified all paperwork." },
  { id: 3, text: "I have reviewed the daily safety meeting." },
  { id: 4, text: "I am fit for work." },
];

export default function SafetyMeetingPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [mounted, setMounted] = useState<boolean>(false);

  const [acknowledged, setAcknowledged] = useState<number[]>([]);
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [hasCompletedToday, setHasCompletedToday] = useState<boolean>(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [terminalFeedback, setTerminalFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  // User Profile State
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);

  // Daily Briefing Interactive Gate State
  const [dailyBriefing, setDailyBriefing] = useState<SafetyBriefing>(() => getDailyBriefing());
  const [showBriefingModal, setShowBriefingModal] = useState<boolean>(false);
  const [hasCompletedBriefing, setHasCompletedBriefing] = useState<boolean>(false);

  // --- NESTLE SPRINGVILLE JHA GATE STATES ---
  const [activeJhas, setActiveJhas] = useState<DailyJhaRecord[]>([]);
  const [showJobListModal, setShowJobListModal] = useState<boolean>(false);
  const [selectedJha, setSelectedJha] = useState<DailyJhaRecord | null>(null);
  const [showJhaDetailModal, setShowJhaDetailModal] = useState<boolean>(false);
  const [hasSignedJha, setHasSignedJha] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Background scroll lock when either JHA modal is active
  useEffect(() => {
    if (showJobListModal || showJhaDetailModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showJobListModal, showJhaDetailModal]);

  useEffect(() => {
    async function checkTodayStatus() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const userProfile = await getEmployeeProfile(supabase, user.id);
        setCurrentUserProfile(userProfile);
        const todayDate = new Date().toISOString().split('T')[0];

        // --- CHECK FOR MANAGER SITE OVERRIDE ---
        if (userProfile?.location) {
          const safeLocation = userProfile.location.trim();
          const overrideId = await getActiveSiteBriefingId(supabase, safeLocation);
          if (overrideId) {
            const siteBriefing = getBriefingById(overrideId);
            if (siteBriefing) {
              setDailyBriefing(siteBriefing);
            }
          }

          // Fetch active daily JHAs if assigned to Nestle Springville
          if (safeLocation.toLowerCase() === "nestle springville") {
            const jhaRecords = await getActiveDailyJhas(supabase, "Nestle Springville");
            setActiveJhas(jhaRecords);
          }
        }

        if (userProfile?.last_safety_check === todayDate) {
          setHasCompletedToday(true);
          setHasCompletedBriefing(true);
          setHasSignedJha(true);
          setAcknowledged(checks.map(c => c.id));
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

  const isNestleSpringville =
    currentUserProfile?.location?.trim().toLowerCase() === "nestle springville";

  const handleBriefingComplete = () => {
    setShowBriefingModal(false);
    setHasCompletedBriefing(true);
    setAcknowledged(prev => (prev.includes(3) ? prev : [...prev, 3]));
  };

  // Open Stage 1: Job List Modal
  const handleOpenJhaFlow = () => {
    if (acknowledged.length !== checks.length || isSigning || hasCompletedToday) return;

    if (activeJhas.length === 0) {
      // If no manager has published a JHA today, unblock standard sign-in
      executeSignCommit();
      return;
    }

    setShowJobListModal(true);
  };

  // Pick a job -> Open Stage 2: Full Document Modal
  const handleSelectJob = (jha: DailyJhaRecord) => {
    setSelectedJha(jha);
    setShowJobListModal(false);
    setShowJhaDetailModal(true);
  };

  const executeSignCommit = async () => {
    setIsSigning(true);
    setTerminalFeedback(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTerminalFeedback({
          message: "Authentication Validation Fault. Re-login required.",
          isError: true,
        });
        setIsSigning(false);
        return;
      }

      // If at Nestle Springville and a JHA is selected, record digital acknowledgment
      if (isNestleSpringville && selectedJha) {
        const empName = formatEmployeeName(currentUserProfile) || "IMC Employee";
        const jhaRes = await signDailyJha(
          supabase,
          selectedJha.id,
          user.id,
          empName,
          currentUserProfile?.location || "Nestle Springville"
        );
        if (!jhaRes.success) {
          console.warn("JHA sign error notice:", jhaRes.error);
        }
      }

      const activeBriefingId = dailyBriefing?.id || "briefing-001";
      const activeBriefingTitle = dailyBriefing?.title || "Daily Safety Briefing";
      const userLocation = currentUserProfile?.location?.trim() || "Springville Shop";

      const result = await completeDailySafetyBriefing(supabase, user.id, {
        briefingId: activeBriefingId,
        briefingTitle: activeBriefingTitle,
        location: userLocation,
      });

      if (!result.success) {
        if (result.alreadyCheckedIn) {
          setHasCompletedToday(true);
          setAcknowledged(checks.map(c => c.id));
          setTerminalFeedback({ message: "Briefing signature already logged for today.", isError: false });
        } else {
          setTerminalFeedback({ message: `Database Exception: ${result.error}`, isError: true });
        }
        setIsSigning(false);
        return;
      }

      setHasCompletedToday(true);
      setHasSignedJha(true);
      setShowJhaDetailModal(false);
      setShowCelebration(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      console.error("Safety briefing ledger logging failure:", err);
      setTerminalFeedback({
        message: `Critical routing breakdown: ${err?.message || "Check network/permissions"}`,
        isError: true,
      });
      setIsSigning(false);
    }
  };

  const allChecksComplete = acknowledged.length === checks.length;

  return (
    <div className="w-full relative flex-1 flex flex-col justify-start sm:justify-center py-4 sm:py-8 pb-12 sm:pb-16 font-mono text-slate-100 select-none">
      
      {/* 60-SECOND MANDATORY BRIEFING MODAL */}
      <DailyBriefingModal
        briefing={dailyBriefing}
        isOpen={showBriefingModal}
        onComplete={handleBriefingComplete}
      />

      {/* Blueprint Grid Background Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_right,var(--color-brand-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-brand-border)_1px,transparent_1px)] bg-[size:32px_32px] z-0" />

      <div className="flex-1 p-3.5 sm:p-6 max-w-6xl mx-auto w-full relative z-10 flex flex-col justify-center">
        
        {/* PAGE HEADER BANNER */}
        <motion.header 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6 border border-[var(--color-brand-border)] p-4 sm:p-6 rounded-sm relative overflow-hidden shadow-lg bg-[var(--color-brand-card)]"
        >
          <div 
            className={`absolute top-0 left-0 w-full h-[2px] transition-colors duration-300 ${
              hasCompletedToday ? "bg-[var(--color-brand-green,#00ff9d)]" : "bg-[var(--color-brand-blue,#0088ff)]"
            }`} 
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-3xl font-black text-slate-100 uppercase tracking-tighter flex items-center gap-2">
                <span 
                  className={`w-2 h-2 animate-pulse rounded-none flex-shrink-0 ${
                    hasCompletedToday ? "bg-[var(--color-brand-green,#00ff9d)]" : "bg-[var(--color-brand-blue,#0088ff)]"
                  }`} 
                />
                Daily Safety Checklist
              </h1>
              <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] mt-1">
                Mandatory Pre-Shift Verification • {currentUserProfile?.location || "Site"}
              </p>
            </div>

            {/* DYNAMIC STATUS BADGE */}
            {isLoadingStatus ? (
              <div className="inline-block self-start sm:self-auto px-2.5 py-1 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider rounded-sm animate-pulse">
                Checking...
              </div>
            ) : hasCompletedToday ? (
              <div className="inline-block self-start sm:self-auto px-2.5 py-1 bg-[var(--color-brand-green,#00ff9d)]/10 border border-[var(--color-brand-green,#00ff9d)]/50 text-[10px] sm:text-xs font-black text-[var(--color-brand-green,#00ff9d)] uppercase tracking-wider rounded-sm shadow-[0_0_10px_rgba(0,255,157,0.2)]">
                [COMPLETED TODAY]
              </div>
            ) : (
              <div className="inline-block self-start sm:self-auto px-2.5 py-1 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] text-[var(--color-brand-blue,#0088ff)] uppercase tracking-wider rounded-sm">
                Status: [{hasCompletedBriefing ? "Briefing Verified" : "Briefing Pending"}]
              </div>
            )}
          </div>
        </motion.header>

        {/* MAIN SPLIT CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* TOPIC SPOTLIGHT */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="order-1 lg:order-2 border p-4 sm:p-6 rounded-sm shadow-xl relative overflow-hidden flex flex-col justify-between bg-[var(--color-brand-card)] border-[var(--color-brand-border)]"
          >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-border)]" />
            
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-slate-200 font-bold uppercase tracking-widest text-xs border-b pb-3 sm:pb-4 border-[var(--color-brand-border)]">
                Today's Safety Briefing
              </h2>

              <div className="p-3.5 sm:p-4 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)]">
                <span className="text-[10px] sm:text-[11px] font-bold text-[var(--color-brand-blue,#0088ff)] uppercase tracking-wider block">
                  {dailyBriefing.category}
                </span>
                <p className="text-xs sm:text-sm font-black text-white uppercase mt-1">
                  {dailyBriefing.title}
                </p>
                <p className="text-[10px] sm:text-xs text-slate-400 font-sans mt-2 line-clamp-3 leading-relaxed">
                  {dailyBriefing.intro}
                </p>
                <button
                  type="button"
                  onClick={() => setShowBriefingModal(true)}
                  className="min-h-[44px] mt-2 text-xs font-bold text-[var(--color-brand-blue,#0088ff)] hover:text-white uppercase underline flex items-center cursor-pointer touch-manipulation focus:outline-none"
                >
                  View Full Briefing Document ↗
                </button>
              </div>

              {/* JHA STATUS INDICATOR (Visible only at Nestle Springville) */}
              {isNestleSpringville && (
                <div className="p-3.5 sm:p-4 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] space-y-1.5">
                  <span className="text-[10px] font-bold text-[var(--color-brand-blue,#0088ff)] uppercase tracking-wider block">
                    Pre-Task JHA Requirement
                  </span>
                  <p className="text-xs font-black uppercase text-white">
                    {activeJhas.length} Active Job{activeJhas.length === 1 ? "" : "s"} Available
                  </p>
                  <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                    Select your assigned job to review hazard controls and sign off on your task plan.
                  </p>
                </div>
              )}

              <div className="p-3.5 sm:p-4 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)]">
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-wider">COMPLETION AWARD</p>
                <p className="text-2xl sm:text-3xl font-black text-[var(--color-brand-green,#00ff9d)] tabular-nums mt-0.5 sm:mt-1">+10 PTS</p>
                <p className="text-[10px] sm:text-xs text-slate-300 mt-1.5 sm:mt-2 leading-relaxed font-sans">
                  Submitting your daily check-in logs your compliance status directly to the job site safety log.
                </p>
              </div>
            </div>

            <div className="pt-4 sm:pt-6 mt-4 border-t border-[var(--color-brand-border)]">
              <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest font-mono text-center font-bold">
                INDUSTRIAL SAFETY SYSTEM
              </p>
            </div>
          </motion.div>

          {/* CHECKLIST FORM */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="order-2 lg:order-1 lg:col-span-2 border p-4 sm:p-8 rounded-sm shadow-xl relative overflow-hidden flex flex-col justify-between bg-[var(--color-brand-card)] border-[var(--color-brand-border)]"
          >
            <div 
              className={`absolute top-0 left-0 w-full h-[2px] transition-colors duration-300 ${
                hasCompletedToday ? "bg-[var(--color-brand-green,#00ff9d)]" : "bg-[var(--color-brand-blue,#0088ff)]"
              }`} 
            />
            
            <div>
              <div className="mb-4 sm:mb-6 border-b pb-3 sm:pb-4 border-[var(--color-brand-border)] flex flex-row justify-between items-center gap-2">
                <h2 className="text-slate-200 font-bold uppercase tracking-widest text-xs">
                  Daily Verification
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] sm:text-xs text-slate-400 tabular-nums font-bold">
                    {acknowledged.length} / {checks.length} COMPLETE
                  </span>
                </div>
              </div>

              {terminalFeedback && (
                <div className={`mb-4 sm:mb-6 p-3 font-mono text-xs font-bold uppercase tracking-wider border rounded-sm ${
                  terminalFeedback.isError 
                    ? "bg-[var(--color-brand-red,#ff3b5c)]/10 border-[var(--color-brand-red,#ff3b5c)]/40 text-[var(--color-brand-red,#ff3b5c)]"
                    : "bg-[var(--color-brand-green,#00ff9d)]/10 border-[var(--color-brand-green,#00ff9d)]/50 text-[var(--color-brand-green,#00ff9d)]"
                }`}>
                  [{terminalFeedback.isError ? "VERIFICATION FAULT" : "VERIFIED"}] {terminalFeedback.message}
                </div>
              )}
              
              <div className="space-y-2.5 sm:space-y-3.5">
                {checks.map((check) => {
                  const isChecked = acknowledged.includes(check.id);
                  return (
                    <button
                      key={check.id}
                      type="button"
                      disabled={hasCompletedToday || (!hasCompletedBriefing && check.id !== 3)}
                      onClick={() => {
                        if (hasCompletedToday) return;
                        if (!hasCompletedBriefing && check.id === 3) {
                          setShowBriefingModal(true);
                          return;
                        }
                        setAcknowledged(prev => isChecked ? prev.filter(i => i !== check.id) : [...prev, check.id]);
                      }}
                      className={`w-full min-h-[48px] p-3.5 sm:p-4.5 border transition-all flex items-center gap-3.5 sm:gap-4 text-left rounded-sm outline-none disabled:cursor-default cursor-pointer active:scale-[0.98] touch-manipulation focus:outline-none ${
                        isChecked 
                          ? "bg-[var(--color-brand-green,#00ff9d)]/10 border-[var(--color-brand-green,#00ff9d)]" 
                          : "bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] hover:border-[var(--color-brand-blue,#0088ff)]/50"
                      }`}
                    >
                      <div 
                        className={`w-5 h-5 sm:w-5.5 sm:h-5.5 flex-shrink-0 border-2 flex items-center justify-center transition-all rounded-xs ${
                          isChecked 
                            ? "bg-[var(--color-brand-green,#00ff9d)] border-[var(--color-brand-green,#00ff9d)]" 
                            : "border-[var(--color-brand-blue,#0088ff)] bg-transparent"
                        }`}
                      >
                        {isChecked && <span className="text-black font-black text-xs">✓</span>}
                      </div>
                      <span 
                        className={`text-xs sm:text-sm font-black uppercase tracking-wide transition-colors font-sans ${
                          isChecked ? "text-[var(--color-brand-green,#00ff9d)]" : "text-white"
                        }`}
                      >
                        {check.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {hasCompletedToday ? (
              <div className="w-full min-h-[48px] mt-6 sm:mt-8 py-3.5 sm:py-4 font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-xs flex justify-center items-center rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] text-slate-400">
                ✓ SIGNATURE RECORDED FOR TODAY
              </div>
            ) : !hasCompletedBriefing ? (
              <button 
                type="button"
                onClick={() => setShowBriefingModal(true)}
                className="w-full min-h-[48px] mt-6 sm:mt-8 py-3.5 sm:py-4 font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-xs transition-all flex justify-center items-center cursor-pointer rounded-sm border bg-[#eab308]/10 border-[#eab308]/50 text-[#eab308] hover:bg-[#eab308] hover:text-black shadow-[0_0_15px_rgba(234,179,8,0.2)] active:scale-[0.98] touch-manipulation focus:outline-none"
              >
                ⚠ Complete 60s Briefing Policy Check ↗
              </button>
            ) : isNestleSpringville && activeJhas.length > 0 && !hasSignedJha ? (
              <button 
                type="button"
                onClick={handleOpenJhaFlow}
                disabled={!allChecksComplete || isSigning}
                className={`w-full min-h-[48px] mt-6 sm:mt-8 py-3.5 sm:py-4 font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-xs transition-all flex justify-center items-center cursor-pointer rounded-sm border outline-none active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation focus:outline-none ${
                  allChecksComplete 
                    ? "bg-[var(--color-brand-blue,#0088ff)] border-[var(--color-brand-blue,#0088ff)] text-white shadow-[0_0_20px_rgba(0,136,255,0.4)] hover:bg-white hover:text-black" 
                    : "bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] text-slate-500"
                }`}
              >
                Step 2: Select Job & Review JHA ({activeJhas.length} Active) ↗
              </button>
            ) : (
              <button 
                type="button"
                onClick={executeSignCommit}
                disabled={!allChecksComplete || isSigning}
                className={`w-full min-h-[48px] mt-6 sm:mt-8 py-3.5 sm:py-4 font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-xs transition-all flex justify-center items-center cursor-pointer rounded-sm border outline-none active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation focus:outline-none ${
                  allChecksComplete 
                    ? "bg-[var(--color-brand-blue,#0088ff)] border-[var(--color-brand-blue,#0088ff)] text-white shadow-[0_0_20px_rgba(0,136,255,0.4)] hover:bg-white hover:text-black" 
                    : "bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] text-slate-500"
                }`}
              >
                {isSigning ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    Verifying Credentials...
                  </span>
                ) : "Sign & Earn 10 Points ↗"}
              </button>
            )}
          </motion.div>

        </div>
      </div>

      {/* =========================================================================
          STAGE 1 MODAL: CLEAN JOB SELECTION LIST (ONLY SHOWS JOB & SUPERVISOR)
      ========================================================================= */}
      {mounted && createPortal(
        <AnimatePresence>
          {showJobListModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/95 backdrop-blur-md font-mono text-slate-100 select-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full max-w-2xl max-h-[88vh] flex flex-col border shadow-2xl rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] flex justify-between items-center shrink-0">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-brand-blue,#0088ff)] block">
                      Nestle Springville • Daily Pre-Task Assignment
                    </span>
                    <h2 className="text-sm sm:text-base font-black uppercase text-white mt-0.5">
                      Select Your Assigned Job For Today
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowJobListModal(false)}
                    className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Body: Clean Job Cards List */}
                <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
                  <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                    Click your assigned task to review hazard controls and sign off:
                  </p>

                  <div className="space-y-2.5">
                    {activeJhas.map((jha) => (
                      <div
                        key={jha.id}
                        onClick={() => handleSelectJob(jha)}
                        className="p-4 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] hover:border-[var(--color-brand-blue,#0088ff)] hover:bg-[var(--color-brand-card)] transition-all cursor-pointer group space-y-2"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-sm bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-[var(--color-brand-blue,#0088ff)]">
                            {jha.location}
                          </span>
                          <span className="text-[10px] font-bold uppercase text-[var(--color-brand-blue,#0088ff)] group-hover:underline">
                            Review & Sign ↗
                          </span>
                        </div>

                        <div>
                          <h3 className="text-xs sm:text-sm font-black uppercase text-white leading-snug group-hover:text-[var(--color-brand-blue,#0088ff)] transition-colors">
                            {jha.title}
                          </h3>
                          <p className="text-[11px] text-slate-400 font-mono mt-1">
                            In Charge / Supervisor: <strong className="text-slate-100">{jha.supervisor}</strong>
                          </p>
                        </div>

                        <div className="pt-2 border-t border-[var(--color-brand-border)]/50 flex justify-between items-center text-[10px] text-slate-400">
                          <span>{jha.steps.length} Steps Defined</span>
                          <span>Click to Inspect Full Document</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-3.5 border-t border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] flex justify-end shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowJobListModal(false)}
                    className="min-h-[40px] px-5 border border-[var(--color-brand-border)] text-slate-400 hover:text-white rounded-sm font-bold uppercase text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* =========================================================================
          STAGE 2 MODAL: FULL JHA DOCUMENT REVIEW & SIGN-OFF (AFTER JOB SELECTED)
      ========================================================================= */}
      {mounted && createPortal(
        <AnimatePresence>
          {showJhaDetailModal && selectedJha && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-md font-mono text-slate-100 select-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full max-w-4xl h-[92vh] max-h-[92vh] flex flex-col border shadow-2xl rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-[var(--color-brand-border)] flex justify-between items-start bg-[var(--color-brand-bg)] shrink-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-[var(--color-brand-blue,#0088ff)] animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-brand-blue,#0088ff)]">
                        Nestle Springville • Pre-Task JHA Document
                      </span>
                    </div>
                    <h2 className="text-sm sm:text-lg font-black uppercase text-white mt-1">
                      {selectedJha.title}
                    </h2>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Lead / Supervisor in Charge: <strong className="text-slate-100">{selectedJha.supervisor}</strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowJhaDetailModal(false)}
                    className="min-h-[38px] min-w-[38px] flex items-center justify-center text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Scrollable Document Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs custom-scrollbar">
                  {/* Scope Overview Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] rounded-sm">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Required Training:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedJha.training_required.length > 0 ? (
                          selectedJha.training_required.map((t, idx) => (
                            <span key={idx} className="px-2 py-0.5 text-[9px] font-bold uppercase bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-slate-200 rounded-sm">
                              {t}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">-- Standard Craft Training --</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Permits Required:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedJha.permits_required.length > 0 ? (
                          selectedJha.permits_required.map((p, idx) => (
                            <span key={idx} className="px-2 py-0.5 text-[9px] font-bold uppercase bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-amber-400 rounded-sm">
                              {p}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">-- Standard Operations --</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Equipment & Tools Assigned:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedJha.equipment_used.length > 0 ? (
                          selectedJha.equipment_used.map((e, idx) => (
                            <span key={idx} className="px-2 py-0.5 text-[9px] font-bold uppercase bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-slate-300 rounded-sm">
                              {e}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">-- Hand Tools --</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Certifications Tracked:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedJha.certifications_required.length > 0 ? (
                          selectedJha.certifications_required.map((c, idx) => (
                            <span key={idx} className="px-2 py-0.5 text-[9px] font-bold uppercase bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-cyan-400 rounded-sm">
                              {c}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">-- Standard Craft --</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step Sequence Table */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Work Sequence, Potential Hazards & Control Measures ({selectedJha.steps.length} Steps)
                    </h3>

                    <div className="space-y-2.5">
                      {selectedJha.steps.map((st, idx) => (
                        <div
                          key={st.id || idx}
                          className="p-3.5 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 flex items-center justify-center rounded-xs bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-[10px] font-black text-slate-300">
                              {idx + 1}
                            </span>
                            <p className="text-xs font-black uppercase text-white">
                              {st.step}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                            <div className="p-2.5 bg-[var(--color-brand-card)] rounded-sm border border-red-500/20">
                              <span className="text-[9px] font-bold uppercase text-red-400 block mb-0.5">
                                Potential Hazards:
                              </span>
                              <p className="text-slate-300 font-sans text-xs leading-relaxed">
                                {st.hazards}
                              </p>
                            </div>

                            <div className="p-2.5 bg-[var(--color-brand-card)] rounded-sm border border-emerald-500/20">
                              <span className="text-[9px] font-bold uppercase text-emerald-400 block mb-0.5">
                                Hazard Control Measures:
                              </span>
                              <p className="text-slate-300 font-sans text-xs leading-relaxed">
                                {st.controls}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Modal Sign-Off Footer */}
                <div className="p-4 border-t border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] flex flex-col sm:flex-row justify-between items-center gap-2.5 shrink-0">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider text-center sm:text-left">
                    By signing, I attest that I have reviewed the hazard controls for this job.
                  </p>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setShowJhaDetailModal(false);
                        setShowJobListModal(true);
                      }}
                      className="w-1/2 sm:w-auto min-h-[44px] px-5 border border-[var(--color-brand-border)] text-slate-400 hover:text-white rounded-sm font-bold uppercase text-xs cursor-pointer"
                    >
                      ← Back To Jobs
                    </button>
                    <button
                      type="button"
                      onClick={executeSignCommit}
                      disabled={isSigning}
                      className="w-1/2 sm:w-auto min-h-[44px] px-6 bg-[var(--color-brand-blue,#0088ff)] text-white hover:bg-white hover:text-black rounded-sm font-black uppercase text-xs cursor-pointer transition-all shadow-[0_0_15px_rgba(0,136,255,0.3)] disabled:opacity-50"
                    >
                      {isSigning ? "Signing..." : "Acknowledge & Sign JHA (+10 PTS) ↗"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Celebration Log Screen Overlay */}
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
                Verified. Returning to Dashboard...
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