"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

import { 
  getEmployeeProfile, 
  getActiveSiteBriefingId,
  completeSubcontractorSafetyBriefing,
  UserProfile
} from "@/lib/db/operations";
import { getDailyBriefing, getBriefingById, SafetyBriefing } from "@/lib/data/safetyBriefings";
import DailyBriefingModal from "../safety/_components/DailyBriefingModal";

interface ChecklistItem {
  id: number;
  text: string;
}

const checks: ChecklistItem[] = [
  { id: 1, text: "Subcontractor crew has inspected all PPE for defects." },
  { id: 2, text: "Site permits, JHA, and work authorizations are verified." },
  { id: 3, text: "Daily safety briefing and hazards reviewed with all personnel." },
  { id: 4, text: "All listed subcontractor workers are fit for duty." },
];

interface LoggedSubmission {
  id: string;
  completed_at: string;
  attendee_names: string[];
}

export default function SubcontractorSafetyPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [acknowledged, setAcknowledged] = useState<number[]>([]);
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [terminalFeedback, setTerminalFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  // Subcontractor Company Profile & Attendance
  const [companyProfile, setCompanyProfile] = useState<UserProfile | null>(null);
  const [attendeeInput, setAttendeeInput] = useState<string>("");
  const [attendees, setAttendees] = useState<string[]>([]);
  const [todaySubmissions, setTodaySubmissions] = useState<LoggedSubmission[]>([]);

  // Daily Briefing Interactive Gate State
  const [dailyBriefing, setDailyBriefing] = useState<SafetyBriefing>(() => getDailyBriefing());
  const [showBriefingModal, setShowBriefingModal] = useState<boolean>(false);
  const [hasCompletedBriefing, setHasCompletedBriefing] = useState<boolean>(false);

  const fetchTodaySubmissions = async (userId: string) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const startOfDay = `${todayStr}T00:00:00.000Z`;

    const { data, error } = await supabase
      .from("briefing_completions")
      .select("id, completed_at, attendee_names")
      .eq("user_id", userId)
      .gte("completed_at", startOfDay)
      .order("completed_at", { ascending: false });

    if (!error && data) {
      setTodaySubmissions(data as LoggedSubmission[]);
    }
  };

  useEffect(() => {
    async function initSubcontractorSession() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const profile = await getEmployeeProfile(supabase, user.id);
        setCompanyProfile(profile);

        // Match site briefing override if configured
        if (profile?.location) {
          const safeLoc = profile.location.trim();
          const overrideId = await getActiveSiteBriefingId(supabase, safeLoc);
          if (overrideId) {
            const siteBriefing = getBriefingById(overrideId);
            if (siteBriefing) setDailyBriefing(siteBriefing);
          }
        }

        await fetchTodaySubmissions(user.id);
      } catch (err) {
        console.error("Subcontractor initialization failure:", err);
      } finally {
        setIsLoadingStatus(false);
      }
    }

    initSubcontractorSession();
  }, [supabase, router]);

  const handleBriefingComplete = () => {
    setShowBriefingModal(false);
    setHasCompletedBriefing(true);
    setAcknowledged(prev => (prev.includes(3) ? prev : [...prev, 3]));
  };

  const handleAddAttendee = () => {
    const trimmed = attendeeInput.trim();
    if (!trimmed) return;
    if (!attendees.some(a => a.toLowerCase() === trimmed.toLowerCase())) {
      setAttendees(prev => [...prev, trimmed]);
    }
    setAttendeeInput("");
  };

  const handleRemoveAttendee = (indexToRemove: number) => {
    setAttendees(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDownAttendee = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddAttendee();
    }
  };

  const handleSign = async () => {
    if (acknowledged.length !== checks.length || isSigning) return;

    if (attendees.length === 0) {
      setTerminalFeedback({
        message: "You must enter at least one worker name on the crew roster before signing.",
        isError: true,
      });
      return;
    }

    setIsSigning(true);
    setTerminalFeedback(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTerminalFeedback({ message: "Session expired. Re-login required.", isError: true });
        setIsSigning(false);
        return;
      }

      const companyName = companyProfile?.nickname || companyProfile?.first_name || "Subcontractor Vendor";
      const siteLoc = companyProfile?.location?.trim() || "Springville Shop";

      const result = await completeSubcontractorSafetyBriefing(supabase, user.id, {
        briefingId: dailyBriefing?.id || "briefing-001",
        briefingTitle: dailyBriefing?.title || "Daily Safety Briefing",
        companyName,
        location: siteLoc,
        attendeeNames: attendees,
      });

      if (!result.success) {
        setTerminalFeedback({ message: `Database Exception: ${result.error}`, isError: true });
        setIsSigning(false);
        return;
      }

      // Refresh list of logged shifts for today
      await fetchTodaySubmissions(user.id);

      setShowConfirmation(true);
      setTerminalFeedback({ message: `Roster logged successfully for ${attendees.length} worker(s).`, isError: false });

      // Reset form so another shift / group can be logged anytime
      setAttendees([]);
      setAcknowledged([]);
    } catch (err: any) {
      setTerminalFeedback({ message: `Signature failure: ${err?.message}`, isError: true });
    } finally {
      setIsSigning(false);
    }
  };

  const allChecksComplete = acknowledged.length === checks.length;
  const companyDisplayName = companyProfile?.nickname || companyProfile?.first_name || "Subcontractor";

  return (
    <div className="w-full relative flex-1 flex flex-col justify-start py-4 sm:py-8 pb-12 sm:pb-16 font-mono text-slate-100 select-none">
      
      {/* 60-SECOND MANDATORY BRIEFING MODAL */}
      <DailyBriefingModal
        briefing={dailyBriefing}
        isOpen={showBriefingModal}
        onComplete={handleBriefingComplete}
      />

      {/* Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_right,var(--color-brand-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-brand-border)_1px,transparent_1px)] bg-[size:32px_32px] z-0" />

      <div className="flex-1 p-3.5 sm:p-6 max-w-6xl mx-auto w-full relative z-10 flex flex-col justify-center">
        
        {/* HEADER */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6 border border-[var(--color-brand-border)] p-4 sm:p-6 rounded-sm relative overflow-hidden shadow-lg bg-[var(--color-brand-card)]"
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-blue,#0088ff)]" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 animate-pulse bg-[var(--color-brand-blue,#0088ff)]" />
                <span className="text-[10px] font-black uppercase text-[var(--color-brand-blue,#0088ff)] tracking-widest">
                  Third-Party Partner Compliance
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight mt-1">
                {companyDisplayName}
              </h1>
              <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mt-0.5">
                Site: <span className="text-white font-bold">{companyProfile?.location || "Springville Shop"}</span> • Multi-Shift OSHA Sign-Off
              </p>
            </div>

            <div>
              {isLoadingStatus ? (
                <div className="px-3 py-1 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] text-xs text-slate-400 font-bold uppercase rounded-sm animate-pulse">
                  Verifying...
                </div>
              ) : todaySubmissions.length > 0 ? (
                <div className="px-3 py-1 bg-[var(--color-brand-green,#00ff9d)]/10 border border-[var(--color-brand-green,#00ff9d)]/50 text-[var(--color-brand-green,#00ff9d)] text-xs font-black uppercase rounded-sm">
                  [{todaySubmissions.length} SHIFT ROSTER{todaySubmissions.length > 1 ? "S" : ""} LOGGED TODAY]
                </div>
              ) : (
                <div className="px-3 py-1 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] text-[var(--color-brand-blue,#0088ff)] text-xs font-bold uppercase rounded-sm">
                  Status: [{hasCompletedBriefing ? "Briefing Verified" : "Briefing Pending"}]
                </div>
              )}
            </div>
          </div>
        </motion.header>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* TOPIC SUMMARY & TODAY'S LOGGED LOGS */}
          <div className="space-y-4">
            <div className="border p-4 sm:p-6 rounded-sm shadow-xl bg-[var(--color-brand-card)] border-[var(--color-brand-border)] space-y-4">
              <h2 className="text-slate-200 font-bold uppercase tracking-widest text-xs border-b pb-3 border-[var(--color-brand-border)]">
                Daily Safety Briefing
              </h2>

              <div className="p-3.5 sm:p-4 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)]">
                <span className="text-[10px] font-bold text-[var(--color-brand-blue,#0088ff)] uppercase tracking-wider block">
                  {dailyBriefing.category}
                </span>
                <p className="text-xs sm:text-sm font-black text-white uppercase mt-1">
                  {dailyBriefing.title}
                </p>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {dailyBriefing.intro}
                </p>
                <button
                  type="button"
                  onClick={() => setShowBriefingModal(true)}
                  className="min-h-[44px] mt-2 text-xs font-bold text-[var(--color-brand-blue,#0088ff)] hover:text-white uppercase underline flex items-center cursor-pointer"
                >
                  Review Full Briefing Document ↗
                </button>
              </div>

              <div className="p-3.5 sm:p-4 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)]">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Multi-Shift Access</p>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  You can submit additional rosters whenever new personnel or shifts arrive on site today. All entries are preserved in the site OSHA compliance ledger.
                </p>
              </div>
            </div>

            {/* PREVIOUS SHIFT LOGS TODAY */}
            {todaySubmissions.length > 0 && (
              <div className="border p-4 sm:p-5 rounded-sm shadow-xl bg-[var(--color-brand-card)] border-[var(--color-brand-border)] space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex justify-between items-center border-b border-[var(--color-brand-border)] pb-2">
                  <span>Logged Today ({todaySubmissions.length})</span>
                  <span className="text-[var(--color-brand-green,#00ff9d)]">✓ Verified</span>
                </h3>

                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                  {todaySubmissions.map((sub, idx) => (
                    <div key={sub.id || idx} className="p-2.5 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] rounded-sm text-xs space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                        <span>Shift #{todaySubmissions.length - idx}</span>
                        <span>{new Date(sub.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-[11px] font-bold text-white uppercase">
                        {(sub.attendee_names || []).join(", ") || "Crew on site"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CHECKLIST & ROSTER FORM */}
          <div className="lg:col-span-2 border p-4 sm:p-8 rounded-sm shadow-xl bg-[var(--color-brand-card)] border-[var(--color-brand-border)] space-y-6">
            
            {/* 1. Daily Verification Checks */}
            <div>
              <div className="mb-4 border-b pb-3 border-[var(--color-brand-border)] flex justify-between items-center">
                <h2 className="text-slate-200 font-bold uppercase tracking-widest text-xs">
                  Pre-Shift Verification
                </h2>
                <span className="text-[10px] text-slate-400 tabular-nums font-bold">
                  {acknowledged.length} / {checks.length} COMPLETE
                </span>
              </div>

              {terminalFeedback && (
                <div className={`mb-4 p-3 font-mono text-xs font-bold uppercase tracking-wider border rounded-sm ${
                  terminalFeedback.isError 
                    ? "bg-[var(--color-brand-red,#ff3b5c)]/10 border-[var(--color-brand-red,#ff3b5c)]/40 text-[var(--color-brand-red,#ff3b5c)]"
                    : "bg-[var(--color-brand-green,#00ff9d)]/10 border-[var(--color-brand-green,#00ff9d)]/50 text-[var(--color-brand-green,#00ff9d)]"
                }`}>
                  [{terminalFeedback.isError ? "VERIFICATION FAULT" : "VERIFIED"}] {terminalFeedback.message}
                </div>
              )}

              <div className="space-y-2.5">
                {checks.map((check) => {
                  const isChecked = acknowledged.includes(check.id);
                  return (
                    <button
                      key={check.id}
                      type="button"
                      onClick={() => {
                        if (!hasCompletedBriefing && check.id === 3) {
                          setShowBriefingModal(true);
                          return;
                        }
                        setAcknowledged(prev => isChecked ? prev.filter(i => i !== check.id) : [...prev, check.id]);
                      }}
                      className={`w-full min-h-[44px] p-3 border transition-all flex items-center gap-3 text-left rounded-sm cursor-pointer ${
                        isChecked 
                          ? "bg-[var(--color-brand-green,#00ff9d)]/10 border-[var(--color-brand-green,#00ff9d)]" 
                          : "bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] hover:border-[var(--color-brand-blue,#0088ff)]/50"
                      }`}
                    >
                      <div className={`w-5 h-5 flex-shrink-0 border flex items-center justify-center rounded-xs ${
                        isChecked ? "bg-[var(--color-brand-green,#00ff9d)] border-[var(--color-brand-green,#00ff9d)] text-black" : "border-[var(--color-brand-blue,#0088ff)]"
                      }`}>
                        {isChecked && <span className="font-black text-xs">✓</span>}
                      </div>
                      <span className={`text-xs font-bold uppercase ${isChecked ? "text-[var(--color-brand-green,#00ff9d)]" : "text-white"}`}>
                        {check.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. On-Site Crew Roster Input */}
            <div className="pt-4 border-t border-[var(--color-brand-border)]">
              <div className="mb-2 flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200">
                  On-Site Subcontractor Personnel ({attendees.length})
                </h3>
                <span className="text-[10px] text-slate-400 uppercase font-bold">
                  Enter workers for this shift
                </span>
              </div>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={attendeeInput}
                  onChange={(e) => setAttendeeInput(e.target.value)}
                  onKeyDown={handleKeyDownAttendee}
                  placeholder="Worker Full Name (e.g., John Miller)"
                  className="flex-1 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue,#0088ff)] px-3 py-2 text-xs text-white uppercase rounded-sm outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddAttendee}
                  className="min-h-[40px] px-4 text-xs font-bold uppercase tracking-wider bg-[var(--color-brand-blue,#0088ff)] hover:bg-white hover:text-black text-white rounded-sm transition-all cursor-pointer"
                >
                  + Add Worker
                </button>
              </div>

              {/* Tag Pill Roster Display */}
              <div className="p-3 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] min-h-[56px] flex flex-wrap gap-2 items-center">
                {attendees.length === 0 ? (
                  <span className="text-[11px] text-slate-500 uppercase font-bold">
                    [ No crew members added for this sign-off yet. Type worker name and click Add ]
                  </span>
                ) : (
                  attendees.map((worker, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 text-xs font-bold uppercase rounded-sm bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-slate-200 flex items-center gap-2"
                    >
                      <span>{worker}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttendee(idx)}
                        className="text-slate-400 hover:text-[var(--color-brand-red,#ff3b5c)] font-black text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* 3. Action Button */}
            {!hasCompletedBriefing ? (
              <button
                type="button"
                onClick={() => setShowBriefingModal(true)}
                className="w-full py-4 text-xs font-bold uppercase tracking-widest text-center rounded-sm border bg-[#eab308]/10 border-[#eab308]/50 text-[#eab308] hover:bg-[#eab308] hover:text-black cursor-pointer transition-all"
              >
                ⚠ Review Mandatory Briefing Before Signing ↗
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSign}
                disabled={!allChecksComplete || attendees.length === 0 || isSigning}
                className="w-full py-4 text-xs font-bold uppercase tracking-widest text-center rounded-sm border bg-[var(--color-brand-blue,#0088ff)] border-[var(--color-brand-blue,#0088ff)] text-white hover:bg-white hover:text-black disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-md active:scale-[0.99]"
              >
                {isSigning ? "Recording Sign-Off..." : "Submit Subcontractor Sign-Off ↗"}
              </button>
            )}

          </div>

        </div>

      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          >
            <div className="text-center flex flex-col items-center p-6 sm:p-8 border rounded-sm shadow-2xl max-w-sm w-full bg-[var(--color-brand-card)] border-[var(--color-brand-green,#00ff9d)]">
              <div className="w-16 h-16 rounded-full border-2 flex items-center justify-center mb-4 bg-[var(--color-brand-green,#00ff9d)]/15 border-[var(--color-brand-green,#00ff9d)] text-[var(--color-brand-green,#00ff9d)] text-2xl font-black">
                ✓
              </div>
              <h2 className="text-lg font-black uppercase text-white font-mono">
                Roster Recorded
              </h2>
              <p className="text-slate-300 mt-2 text-xs font-sans">
                Roster registered under {companyDisplayName}. The compliance entry has been logged to the daily site record. You can submit another roster at any point today.
              </p>
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                className="mt-6 w-full py-2.5 text-xs font-bold uppercase tracking-wider bg-[var(--color-brand-green,#00ff9d)] text-black rounded-sm cursor-pointer hover:bg-white"
              >
                Dismiss & Continue
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}