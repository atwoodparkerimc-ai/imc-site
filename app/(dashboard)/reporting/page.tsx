"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

// --- CENTRAL DATA SERVICE IMPORT ---
import { 
  getEmployeeProfile,
  getPeerProfiles, 
  submitSafeActReport, 
  UserProfile 
} from "@/lib/db/operations";

type MinimalUserRecord = Pick<UserProfile, 'id' | 'first_name' | 'nickname'>;

export default function ReportingPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<MinimalUserRecord[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [report, setReport] = useState<string>("");
  const [hasCompletedToday, setHasCompletedToday] = useState<boolean>(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [recipientBonusGranted, setRecipientBonusGranted] = useState<boolean>(false);
  const [formFeedback, setFormFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const userProfile = await getEmployeeProfile(supabase, user.id);
        if (userProfile) {
          setProfile(userProfile);
          
          const todayDate = new Date().toISOString().split('T')[0];
          if (userProfile.last_safe_act_date === todayDate) {
            setHasCompletedToday(true);
          }
        }
        
        const peerList = await getPeerProfiles(supabase, user.id, userProfile?.location);
        setUsers(peerList);
      } catch (err) {
        console.error("Failed to load user reporting profile:", err);
      } finally {
        setIsLoadingStatus(false);
      }
    }
    fetchUserData();
  }, [supabase]);

  const handleSubmit = async () => {
    if (!selectedUser || !report || isSubmitting || hasCompletedToday) return;
    
    setIsSubmitting(true);
    setFormFeedback(null);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user?.id) {
      setFormFeedback({ message: "Authentication validation failure. Re-login required.", isError: true });
      setIsSubmitting(false);
      return;
    }
    
    const result = await submitSafeActReport(supabase, {
      reporterId: user.id,
      recipientId: selectedUser,
      reason: report
    });

    if (!result.success) {
      if (result.alreadyReportedToday) {
        setHasCompletedToday(true);
        setFormFeedback({ message: "Transaction Denied: You have already filed a Safe Act today.", isError: true });
      } else {
        setFormFeedback({ message: `Database Exception: ${result.error}`, isError: true });
      }
      setIsSubmitting(false);
      return;
    }

    setHasCompletedToday(true);
    setRecipientBonusGranted(!!result.recipientBonusGranted);
    setShowCelebration(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 2500);
  };

  const inputStyle = {
    backgroundColor: "var(--color-brand-bg)",
    borderColor: "var(--color-brand-border)",
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    if (hasCompletedToday) return;
    e.currentTarget.style.borderColor = "var(--color-brand-blue)";
    e.currentTarget.style.boxShadow = "0 0 10px color-mix(in srgb, var(--color-brand-blue) 30%, transparent)";
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = "var(--color-brand-border)";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <div className="w-full relative min-h-[100dvh] flex flex-col justify-start sm:justify-center py-4 sm:py-12 pb-28 sm:pb-12 font-mono text-slate-100">
      {/* Blueprint Grid Background Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_right,var(--color-brand-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-brand-border)_1px,transparent_1px)] bg-[size:32px_32px] z-0" />

      <div className="flex-1 p-3.5 sm:p-6 max-w-6xl mx-auto w-full relative z-10 flex flex-col justify-center">
        
        {/* PAGE HEADER BANNER */}
        <motion.header 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6 border border-[var(--color-brand-border)] tactical-card p-4 sm:p-6 rounded-sm relative overflow-hidden shadow-lg"
        >
          <div 
            className="absolute top-0 left-0 w-full h-[2px] transition-colors duration-300" 
            style={{ backgroundColor: hasCompletedToday ? "var(--color-metric-meetings, #10b981)" : "var(--color-brand-blue)" }}
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-3xl font-black text-slate-100 uppercase tracking-tighter flex items-center gap-2">
                <span 
                  className="w-2 h-2 animate-pulse rounded-none flex-shrink-0" 
                  style={{ backgroundColor: hasCompletedToday ? "var(--color-metric-meetings, #10b981)" : "var(--color-brand-blue)" }}
                />
                Report Safe Act
              </h1>
              <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] mt-1">
                Peer Safety Recognition
              </p>
            </div>

            {/* DYNAMIC STATUS BADGE */}
            {isLoadingStatus ? (
              <div className="inline-block self-start sm:self-auto px-2.5 py-1 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider rounded-sm animate-pulse">
                Checking...
              </div>
            ) : hasCompletedToday ? (
              <div className="inline-block self-start sm:self-auto px-2.5 py-1 bg-emerald-950/40 border border-[var(--color-metric-meetings,#10b981)] text-[10px] sm:text-xs font-black text-[var(--color-metric-meetings,#10b981)] uppercase tracking-wider rounded-sm shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                [COMPLETED TODAY]
              </div>
            ) : (
              <div className="inline-block self-start sm:self-auto px-2.5 py-1 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] text-[10px] sm:text-xs font-bold text-[var(--color-brand-blue)] uppercase tracking-wider rounded-sm">
                Status: [Pending]
              </div>
            )}
          </div>
        </motion.header>

        {/* MAIN SPLIT CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* RECOGNITION RULES & TELEMETRY: ORDER-1 ON MOBILE, RIGHT COL ON DESKTOP */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="order-1 lg:order-2 border p-4 sm:p-6 rounded-sm shadow-xl relative overflow-hidden flex flex-col justify-between bg-[var(--color-brand-card)] border-[var(--color-brand-border)]"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-brand-border)]" />
            
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-slate-200 font-bold uppercase tracking-widest text-[11px] sm:text-xs border-b pb-3 sm:pb-4 border-[var(--color-brand-border)]">
                Peer Recognition Telemetry
              </h2>

              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
                <div className="p-3.5 sm:p-4 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] space-y-1">
                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">REPORTER BONUS</p>
                  <p className="text-2xl sm:text-3xl font-black text-[var(--color-brand-blue)] tabular-nums">+5 PTS</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-300 mt-1 sm:mt-2 leading-relaxed hidden sm:block font-sans">
                    Earned immediately upon filing a verified peer safe act report.
                  </p>
                </div>

                <div className="p-3.5 sm:p-4 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] space-y-1">
                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">RECIPIENT BONUS</p>
                  <p className="text-2xl sm:text-3xl font-black text-[var(--color-metric-meetings,#10b981)] tabular-nums">+10 PTS</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-300 mt-1 sm:mt-2 leading-relaxed hidden sm:block font-sans">
                    Granted directly to your recognized peer's reward balance.
                  </p>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] space-y-1 sm:space-y-2">
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">DAILY LIMIT</p>
                <p className="text-[11px] sm:text-xs font-bold text-slate-200 font-sans">
                  1 Safe Act report permitted per employee per calendar day.
                </p>
              </div>
            </div>

            <div className="pt-4 sm:pt-6 mt-4 border-t border-[var(--color-brand-border)]">
              <p className="text-[8px] sm:text-[9px] text-slate-500 uppercase tracking-widest font-mono text-center">
                INDUSTRIAL SAFETY SYSTEM 
              </p>
            </div>
          </motion.div>

          {/* SAFE ACT FORM: ORDER-2 ON MOBILE, LEFT 2 COLS ON DESKTOP */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="order-2 lg:order-1 lg:col-span-2 border p-4 sm:p-8 rounded-sm shadow-xl relative overflow-hidden flex flex-col justify-between"
            style={{
              backgroundColor: "var(--color-brand-card)",
              borderColor: "var(--color-brand-border)"
            }}
          >
            <div 
              className="absolute top-0 left-0 w-full h-1" 
              style={{ backgroundColor: hasCompletedToday ? "var(--color-metric-meetings, #10b981)" : "var(--color-brand-blue)" }}
            />

            <div>
              <h2 className="text-slate-200 font-bold uppercase tracking-widest text-[11px] sm:text-xs mb-4 sm:mb-6 border-b pb-3 sm:pb-4 border-[var(--color-brand-border)] flex items-center justify-between">
                <span>Safe Observation Details</span>
                <span className="text-[9px] sm:text-[10px] text-[var(--color-brand-blue)] font-black uppercase tracking-wider truncate max-w-[150px] sm:max-w-none text-right">
                  {profile?.location ? profile.location.toUpperCase() : "SPRINGVILLE SHOP"}
                </span>
              </h2>

              {formFeedback && (
                <div 
                  className="mb-4 sm:mb-6 p-3 text-[10px] font-bold uppercase tracking-wider border rounded-sm"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--color-brand-red, #f87171) 10%, transparent)",
                    borderColor: "color-mix(in srgb, var(--color-brand-red, #f87171) 40%, transparent)",
                    color: "var(--color-brand-red, #f87171)"
                  }}
                >
                  [TRANSACTION FAULT] {formFeedback.message}
                </div>
              )}

              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="text-slate-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider block mb-2">
                    Select Coworker <span className="text-slate-500 text-[9px] sm:text-[10px]">(Assigned to your location)</span>
                  </label>
                  <div className="relative">
                    <select 
                      disabled={hasCompletedToday}
                      className="w-full border p-3 sm:p-3.5 text-slate-100 uppercase font-bold text-xs sm:text-sm outline-none cursor-pointer appearance-none rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
                      style={inputStyle}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      value={selectedUser}
                    >
                      <option value="" style={{ backgroundColor: "var(--color-brand-card)" }}>
                        {hasCompletedToday ? "Safe Act Logged for Today" : "Choose a team member..."}
                      </option>
                      {users.map(u => (
                        <option key={u.id} value={u.id} style={{ backgroundColor: "var(--color-brand-card)" }}>
                          {u.nickname || u.first_name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider block mb-2">
                    Observation Description
                  </label>
                  <textarea 
                    disabled={hasCompletedToday}
                    className="w-full border p-3 sm:p-4 text-slate-100 h-32 sm:h-40 outline-none resize-none text-xs sm:text-sm leading-relaxed rounded-sm font-sans transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={inputStyle}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder={hasCompletedToday ? "You have completed your peer safe act submission for today." : "Describe the safe behavior, hazard mitigation, or peer assistance observed on site..."}
                    onChange={(e) => setReport(e.target.value)}
                    value={report}
                  />
                </div>
              </div>
            </div>

            {hasCompletedToday ? (
              <div className="w-full mt-6 sm:mt-8 py-3.5 sm:py-4 font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-xs flex justify-center items-center rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] text-slate-400">
                ✓ REPORT LOGGED FOR TODAY
              </div>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={!selectedUser || !report || isSubmitting}
                className="w-full mt-6 sm:mt-8 py-3.5 sm:py-4 font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer rounded-sm shadow-md border outline-none bg-[var(--color-brand-blue)] border-[var(--color-brand-blue)] text-white hover:bg-white hover:text-black shadow-[0_0_20px_rgba(0,136,255,0.3)] active:scale-[0.99] min-h-[48px]"
              >
                {isSubmitting ? "Submitting Ledger Entry..." : "Submit & Award Points ↗"}
              </button>
            )}
          </motion.div>

        </div>
      </div>

      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.8 }} 
              animate={{ scale: 1 }} 
              className="text-center p-6 sm:p-8 border rounded-sm shadow-2xl max-w-sm w-full bg-[var(--color-brand-card)] border-[var(--color-metric-meetings,#10b981)]"
            >
              <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter drop-shadow-md text-[var(--color-metric-meetings,#10b981)]">
                AWARDED
              </h2>
              
              <div className="mt-5 sm:mt-6 space-y-2 font-mono">
                <p className="text-slate-100 font-bold tracking-widest uppercase text-xs sm:text-sm">
                  {recipientBonusGranted 
                    ? "Recipient: +5 PTS (Multi-Bonus)" 
                    : "Recipient: +10 PTS"}
                </p>
                <p className="text-slate-100 font-bold tracking-widest uppercase text-xs sm:text-sm">
                  Reporter: +5 PTS
                </p>
              </div>

              <div className="mt-6 sm:mt-8 w-44 sm:w-48 h-1 mx-auto rounded-full overflow-hidden bg-[var(--color-brand-border)]">
                <motion.div 
                  animate={{ width: "100%" }} 
                  transition={{ duration: 2.5, ease: "linear" }} 
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