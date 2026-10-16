"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  getEmployeeProfile,
  getActiveDailyJhas,
  signDailyJha,
  getUserSignedJhaIdsToday,
  formatEmployeeName,
  UserProfile,
  DailyJhaRecord,
} from "@/lib/db/operations";

export default function DailyJobsPage() {
  const [supabase] = useState(() => createClient());
  const [mounted, setMounted] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeJhas, setActiveJhas] = useState<DailyJhaRecord[]>([]);
  const [signedJhaIds, setSignedJhaIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Review & Sign Modal States
  const [selectedJha, setSelectedJha] = useState<DailyJhaRecord | null>(null);
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Background scroll lock when document modal is open
  useEffect(() => {
    if (selectedJha) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedJha]);

  const refreshData = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const profile = await getEmployeeProfile(supabase, user.id);
      setCurrentUser(profile);

      const loc = profile?.location?.trim() || "Nestle Springville";
      const [records, signedIds] = await Promise.all([
        getActiveDailyJhas(supabase, loc),
        getUserSignedJhaIdsToday(supabase, user.id),
      ]);

      setActiveJhas(records);
      setSignedJhaIds(signedIds);
    } catch (err) {
      console.error("Failed to load daily jobs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [supabase]);

  const handleSignAdditionalJob = async () => {
    if (!selectedJha || !currentUser) return;
    setIsSigning(true);
    setFeedback(null);

    try {
      const empName = formatEmployeeName(currentUser) || "IMC Employee";
      const res = await signDailyJha(
        supabase,
        selectedJha.id,
        currentUser.id,
        empName,
        currentUser.location || selectedJha.location
      );

      if (!res.success) {
        setFeedback({ message: `Signature Failed: ${res.error}`, isError: true });
        setIsSigning(false);
        return;
      }

      setSignedJhaIds((prev) => [...prev, selectedJha.id]);
      setFeedback({ message: `Successfully registered on roster for: ${selectedJha.title}`, isError: false });
      setIsSigning(false);
      setSelectedJha(null);
    } catch (err: any) {
      setFeedback({ message: err?.message || "Execution exception", isError: true });
      setIsSigning(false);
    }
  };

  return (
    <div className="w-full relative flex-1 flex flex-col py-4 sm:py-8 pb-12 sm:pb-16 font-mono text-slate-100 select-none">
      {/* Blueprint Grid Background Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_right,var(--color-brand-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-brand-border)_1px,transparent_1px)] bg-[size:32px_32px] z-0" />

      <div className="flex-1 p-3.5 sm:p-6 max-w-6xl mx-auto w-full relative z-10 space-y-6">
        
        {/* HEADER BANNER */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-[var(--color-brand-border)] p-4 sm:p-6 rounded-sm relative overflow-hidden shadow-lg bg-[var(--color-brand-card)]"
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-blue,#0088ff)]" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-none bg-[var(--color-brand-blue,#0088ff)] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-brand-blue,#0088ff)]">
                  Open Jobs
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight mt-1">
                job hazard analysis 
              </h1>
              <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mt-0.5">
                Location: <span className="text-white font-bold">{currentUser?.location || "Site Master"}</span> • Active Pre-Task Plan & Sign-Off
              </p>
            </div>

            <button
              type="button"
              onClick={refreshData}
              className="px-3.5 py-1.5 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] hover:border-white text-[11px] font-bold text-slate-200 uppercase rounded-sm cursor-pointer transition-all self-start sm:self-auto"
            >
              ↻ Refresh Jobs
            </button>
          </div>
        </motion.header>

        {feedback && (
          <div
            className={`p-3 font-mono text-xs font-bold uppercase tracking-wider border rounded-sm ${
              feedback.isError
                ? "bg-[var(--color-brand-red,#ff3b5c)]/10 border-[var(--color-brand-red,#ff3b5c)]/40 text-[var(--color-brand-red,#ff3b5c)]"
                : "bg-[var(--color-brand-green,#00ff9d)]/10 border-[var(--color-brand-green,#00ff9d)]/50 text-[var(--color-brand-green,#00ff9d)]"
            }`}
          >
            [{feedback.isError ? "ACTION_FAULT" : "CONFIRMED"}] {feedback.message}
          </div>
        )}

        {/* ACTIVE JOBS (JHAs) */}
        <div className="border rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] p-4 sm:p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-[var(--color-brand-border)] pb-3">
            <div>
              <h2 className="text-xs sm:text-sm font-black uppercase text-slate-100 flex items-center gap-2">
                <span>📋</span>
                <span>Active Task Assignments For Today</span>
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5 uppercase">
                If you are assigned to a new or additional job today, review its JHA and sign the active roster below.
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400 font-bold">
              {activeJhas.length} Active
            </span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">
              Loading active site jobs...
            </div>
          ) : activeJhas.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-[var(--color-brand-border)] rounded-sm text-slate-500 text-xs font-bold uppercase tracking-widest">
              [ No active job JHAs have been published by managers for your worksite today ]
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {activeJhas.map((jha) => {
                const isSigned = signedJhaIds.includes(jha.id);

                return (
                  <div
                    key={jha.id}
                    onClick={() => setSelectedJha(jha)}
                    className={`p-4 border rounded-sm transition-all cursor-pointer group flex flex-col justify-between space-y-3 ${
                      isSigned
                        ? "bg-[var(--color-brand-bg)] border-[var(--color-brand-green,#00ff9d)]/40 hover:border-[var(--color-brand-green,#00ff9d)]"
                        : "bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] hover:border-[var(--color-brand-blue,#0088ff)]"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-sm bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-[var(--color-brand-blue,#0088ff)]">
                          {jha.location}
                        </span>

                        {isSigned ? (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-sm bg-[var(--color-brand-green,#00ff9d)]/10 border border-[var(--color-brand-green,#00ff9d)]/50 text-[var(--color-brand-green,#00ff9d)] flex items-center gap-1">
                            <span>✓</span>
                            <span>ROSTER SIGNED</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm bg-amber-500/10 border border-amber-500/40 text-amber-300">
                            PENDING SIGN-OFF
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-black uppercase text-white leading-snug group-hover:text-[var(--color-brand-blue,#0088ff)] transition-colors">
                        {jha.title}
                      </h3>

                      <p className="text-[11px] text-slate-400 font-mono mt-1">
                        Supervisor: <strong className="text-slate-200">{jha.supervisor}</strong>
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-[var(--color-brand-border)]/60 flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 font-mono">
                        {jha.steps.length} Steps Defined
                      </span>
                      <span className="text-[var(--color-brand-blue,#0088ff)] font-bold uppercase group-hover:underline">
                        {isSigned ? "Review Document ↗" : "Review & Sign Roster ↗"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* JHA DOCUMENT REVIEW & SIGN-OFF MODAL */}
      {mounted && createPortal(
        <AnimatePresence>
          {selectedJha && (
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
                        {selectedJha.location} • Job Hazard Analysis (JHA)
                      </span>
                    </div>
                    <h2 className="text-sm sm:text-lg font-black uppercase text-white mt-1">
                      {selectedJha.title}
                    </h2>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Lead Supervisor: <strong className="text-slate-100">{selectedJha.supervisor}</strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedJha(null)}
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
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Work Sequence, Potential Hazards & Control Measures ({selectedJha.steps.length} Steps)
                    </h3>

                    <div className="space-y-2">
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
                    {signedJhaIds.includes(selectedJha.id)
                      ? "✓ You have already acknowledged and signed this task plan today."
                      : "By signing, I attest that I have reviewed the hazard controls for this specific job."}
                  </p>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedJha(null)}
                      className="w-1/2 sm:w-auto min-h-[44px] px-5 border border-[var(--color-brand-border)] text-slate-400 hover:text-white rounded-sm font-bold uppercase text-xs cursor-pointer"
                    >
                      Close
                    </button>

                    {signedJhaIds.includes(selectedJha.id) ? (
                      <div className="w-1/2 sm:w-auto min-h-[44px] px-5 flex items-center justify-center bg-[var(--color-brand-green,#00ff9d)]/10 border border-[var(--color-brand-green,#00ff9d)]/40 text-[var(--color-brand-green,#00ff9d)] font-black text-xs uppercase rounded-sm">
                        ✓ Roster Signed
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSignAdditionalJob}
                        disabled={isSigning}
                        className="w-1/2 sm:w-auto min-h-[44px] px-6 bg-[var(--color-brand-blue,#0088ff)] text-white hover:bg-white hover:text-black rounded-sm font-black uppercase text-xs cursor-pointer transition-all shadow-[0_0_15px_rgba(0,136,255,0.3)] disabled:opacity-50"
                      >
                        {isSigning ? "Signing..." : "Acknowledge & Sign Additional Job ↗"}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
}