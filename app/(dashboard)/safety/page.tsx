"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

// --- CENTRAL DATA SERVICE IMPORT ---
import { completeDailySafetyBriefing } from "@/lib/db/operations";

interface ChecklistItem {
  id: number;
  text: string;
}

const checks: ChecklistItem[] = [
  { id: 1, text: "I have inspected my PPE for defects." },
  { id: 2, text: "I have verified all paperwork." },
  { id: 3, text: "I have reviewed the daily safety meeting." },
  { id: 4, text: "I am fit for duty and alert." },
];

export default function SafetyMeetingPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [acknowledged, setAcknowledged] = useState<number[]>([]);
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [terminalFeedback, setTerminalFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  const handleSign = async () => {
    if (acknowledged.length !== checks.length || isSigning) return;

    setIsSigning(true);
    setTerminalFeedback(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTerminalError("Authentication Validation Fault. Re-login required.");
        setIsSigning(false);
        return;
      }

      // Execute central data pipeline operation
      const result = await completeDailySafetyBriefing(supabase, user.id);

      if (!result.success) {
        if (result.alreadyCheckedIn) {
          setTerminalFeedback({ message: "Transaction Denied: Briefing signature already logged for today.", isError: true });
        } else {
          setTerminalFeedback({ message: `Database Exception: ${result.error}`, isError: true });
        }
        setIsSigning(false);
        return;
      }

      setShowCelebration(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);

    } catch (err) {
      console.error("Safety briefing ledger logging failure:", err);
      setTerminalFeedback({ message: "Critical routing breakdown committing authorization ledger.", isError: true });
      setIsSigning(false);
    }
  };

  const setTerminalError = (msg: string) => {
    setTerminalFeedback({ message: msg, isError: true });
  };

  const allChecksComplete = acknowledged.length === checks.length;

  return (
    <div className="w-full relative min-h-[calc(100vh-4rem)] flex flex-col justify-center py-6 sm:py-12 font-mono text-slate-100">
      {/* Blueprint Grid Background Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_right,var(--color-brand-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-brand-border)_1px,transparent_1px)] bg-[size:32px_32px] z-0" />

      <div className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full relative z-10 flex flex-col justify-center">
        
        {/* PAGE HEADER BANNER */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 border border-[var(--color-brand-border)] tactical-card p-6 rounded-sm relative overflow-hidden shadow-lg"
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-blue)]" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-100 uppercase tracking-tighter flex items-center gap-2">
                <span className="w-2 h-2 bg-[var(--color-brand-blue)] animate-pulse rounded-none" />
                Daily Safety Checklist
              </h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-1">
                Mandatory Pre-Shift Verification Protocol
              </p>
            </div>
            <div className="inline-block self-start sm:self-auto px-3 py-1 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] text-xs font-bold text-[var(--color-brand-blue)] uppercase tracking-wider rounded-sm">
              Status: [Pending]
            </div>
          </div>
        </motion.header>

        {/* MAIN SPLIT CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT 2 COLS: CHECKLIST FORM */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 border p-6 sm:p-8 rounded-sm shadow-xl relative overflow-hidden flex flex-col justify-between"
            style={{
              backgroundColor: "var(--color-brand-card)",
              borderColor: "var(--color-brand-border)"
            }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-brand-blue)]" />
            
            <div>
              <h2 className="text-slate-200 font-bold uppercase tracking-widest text-xs mb-6 border-b pb-4 border-[var(--color-brand-border)] flex items-center justify-between">
                <span>Protocol Verification</span>
                <span className="text-[10px] text-slate-400 tabular-nums">{acknowledged.length} / {checks.length} COMPLETE</span>
              </h2>

              {terminalFeedback && (
                <div className="mb-6 p-3 font-mono text-[10px] font-bold uppercase tracking-wider border rounded-sm bg-[var(--color-brand-red)]/10 border-[var(--color-brand-red)]/40 text-[var(--color-brand-red)]">
                  [VERIFICATION FAULT] {terminalFeedback.message}
                </div>
              )}
              
              <div className="space-y-3.5">
                {checks.map((check) => {
                  const isChecked = acknowledged.includes(check.id);
                  return (
                    <button
                      key={check.id}
                      onClick={() => setAcknowledged(prev => isChecked ? prev.filter(i => i !== check.id) : [...prev, check.id])}
                      className="w-full p-4.5 border transition-all duration-200 flex items-center gap-4 text-left cursor-pointer rounded-sm outline-none"
                      style={{
                        backgroundColor: isChecked 
                          ? "color-mix(in srgb, var(--color-metric-meetings, #10b981) 12%, transparent)" 
                          : "var(--color-brand-bg)",
                        borderColor: isChecked 
                          ? "var(--color-metric-meetings, #10b981)" 
                          : "var(--color-brand-border)"
                      }}
                    >
                      <div 
                        className="w-5.5 h-5.5 flex-shrink-0 border-2 flex items-center justify-center transition-colors rounded-xs"
                        style={{
                          borderColor: isChecked ? "var(--color-metric-meetings, #10b981)" : "var(--color-brand-blue)",
                          backgroundColor: isChecked ? "var(--color-metric-meetings, #10b981)" : "transparent"
                        }}
                      >
                        {isChecked && <span className="text-black font-black text-xs">✓</span>}
                      </div>
                      <span 
                        className="text-xs sm:text-sm font-black uppercase tracking-wide transition-colors font-sans"
                        style={{
                          color: isChecked ? "var(--color-metric-meetings, #10b981)" : "#ffffff"
                        }}
                      >
                        {check.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button 
              onClick={handleSign}
              disabled={!allChecksComplete || isSigning}
              className={`w-full mt-8 py-4 font-bold uppercase tracking-[0.2em] text-xs transition-all duration-300 flex justify-center items-center cursor-pointer rounded-sm border outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
                allChecksComplete 
                  ? "bg-[var(--color-brand-blue)] border-[var(--color-brand-blue)] text-white shadow-[0_0_20px_rgba(0,136,255,0.4)] hover:bg-white hover:text-black" 
                  : "bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] text-slate-500"
              }`}
            >
              {isSigning ? (
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  Verifying Credentials...
                </span>
              ) : "Sign & Earn 10 Points ↗"}
            </button>
          </motion.div>

          {/* RIGHT COL: TELEMETRY & INCENTIVE PANEL */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border p-6 rounded-sm shadow-xl relative overflow-hidden flex flex-col justify-between bg-[var(--color-brand-card)] border-[var(--color-brand-border)]"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-brand-border)]" />
            
            <div className="space-y-6">
              <h2 className="text-slate-200 font-bold uppercase tracking-widest text-xs border-b pb-4 border-[var(--color-brand-border)]">
                Daily Reward Telemetry
              </h2>

              <div className="p-4 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)]">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">COMPLETION AWARD</p>
                <p className="text-3xl font-black text-[var(--color-metric-meetings,#10b981)] tabular-nums mt-1">+10 PTS</p>
                <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                  Submitting your daily check-in logs your compliance status directly to the job site master safety log.
                </p>
              </div>

              <div className="p-4 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] space-y-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">COMPLIANCE RULE</p>
                <p className="text-xs font-bold text-slate-200">
                  Must be signed daily prior to starting field operations.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--color-brand-border)]">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono text-center">
                INDUSTRIAL SAFETY SYSTEM // v4.2
              </p>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Celebration Log Screen Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="text-center flex flex-col items-center p-8 border rounded-sm shadow-2xl max-w-sm w-full bg-[var(--color-brand-card)] border-[var(--color-metric-meetings,#10b981)]"
            >
              <div 
                className="w-24 h-24 rounded-full border-4 flex items-center justify-center mb-6 shadow-2xl bg-[var(--color-metric-meetings,#10b981)]/15 border-[var(--color-metric-meetings,#10b981)]"
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-metric-meetings, #10b981)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h2 className="text-6xl font-black tracking-tighter drop-shadow-md font-mono text-[var(--color-metric-meetings,#10b981)]">
                +10 PTS
              </h2>
              <p className="text-slate-300 mt-6 text-xs font-semibold tracking-[0.25em] uppercase">Verified. Returning to Dashboard...</p>
              <div className="mt-8 w-48 h-1 rounded-full overflow-hidden bg-[var(--color-brand-border)]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "linear" }}
                  className="h-full bg-[var(--color-metric-meetings,#10b981)]"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}