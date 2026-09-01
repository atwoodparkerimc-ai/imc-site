"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";

// --- CENTRAL DATA SERVICE IMPORT ---
import { 
  getEmployeeProfile, 
  getUserLedgerActivity, 
  updateUserProfileNickname,
  getEmployeeCertifications,
  getLocationPaperworkUrl,
  getUserLifetimePoints,
  EvaluatedCert,
  UserProfile 
} from "@/lib/db/operations";

interface ActivityLogItem {
  id: string;
  label: string;
  amountDisplay: string;
  color: string;
  timestamp: number;
}

export default function ProfilePage() {
  const [supabase] = useState(() => createClient());
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [log, setLog] = useState<ActivityLogItem[]>([]);
  const [certs, setCerts] = useState<EvaluatedCert[]>([]);
  const [paperworkUrl, setPaperworkUrl] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"overview" | "history" | "security">("overview");

  // Settings & Password States
  const [displayName, setDisplayName] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [formFeedback, setFormFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState<boolean>(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const userProfile = await getEmployeeProfile(supabase, user.id);
      
      if (userProfile) {
        setDisplayName(userProfile.nickname || userProfile.first_name || "");

        const [certList, siteUrl, ledgerData, careerPoints] = await Promise.all([
          getEmployeeCertifications(supabase, user.id, userProfile.role),
          getLocationPaperworkUrl(supabase, userProfile.location),
          getUserLedgerActivity(supabase, user.id),
          getUserLifetimePoints(supabase, user.id)
        ]);

        setProfile({
          ...userProfile,
          lifetime_points: careerPoints
        });

        setCerts(certList);
        setPaperworkUrl(siteUrl);

        const unifiedLog: ActivityLogItem[] = ledgerData.map((entry) => {
          const isRedemption = entry.type === 'redemption';
          const logTimestamp = entry.created_at ? new Date(entry.created_at).getTime() : Date.now();

          return {
            id: entry.id,
            label: String(entry.description).toUpperCase(),
            amountDisplay: isRedemption ? `-${entry.amount} PTS` : `+${entry.amount} PTS`,
            color: isRedemption ? "text-slate-400" : "text-[var(--color-brand-blue,#0088ff)]",
            timestamp: logTimestamp
          };
        });

        unifiedLog.sort((a, b) => b.timestamp - a.timestamp);
        setLog(unifiedLog);
      }

      setLoading(false);
    }

    fetchData();
  }, [supabase]);

  const handleUpdate = async () => {
    if (!profile) return;
    setIsUpdating(true);
    setFormFeedback(null);

    const result = await updateUserProfileNickname(supabase, profile.id, displayName);
    
    if (!result.success) {
      setFormFeedback({ message: `System Rejected: ${result.error}`, isError: true });
    } else {
      setFormFeedback({ message: "Personnel display preferences updated.", isError: false });
      setProfile((prev) => prev ? { ...prev, nickname: displayName } : null);
    }
    setIsUpdating(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (newPassword.length < 6) {
      setPasswordFeedback({ message: "Password must be at least 6 characters.", isError: true });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ message: "Passwords do not match.", isError: true });
      return;
    }

    setIsUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsUpdatingPassword(false);

    if (error) {
      setPasswordFeedback({ message: error.message.toUpperCase(), isError: true });
    } else {
      setPasswordFeedback({ message: "Password successfully updated.", isError: false });
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordFeedback(null), 4000);
    }
  };

  if (loading) {
    return (
      <div className="p-10 min-h-[100dvh] flex items-center justify-center font-mono text-xs uppercase tracking-widest text-[var(--color-brand-blue,#0088ff)] animate-pulse">
        INITIALIZING PERSONNEL FILE SYSTEM...
      </div>
    );
  }

  const assignedLocationDisplay = (profile?.location || "Main Yard").toUpperCase();

  return (
    <div className="w-full max-w-4xl mx-auto px-3.5 sm:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6 min-h-[100dvh] pb-32 sm:pb-16 font-mono text-slate-100 overflow-x-hidden select-none">
      
      {/* USER PASSPORT HEADER CARD */}
      <div className="w-full border p-3.5 sm:p-6 shadow-2xl relative overflow-hidden rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)]">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-[var(--color-brand-blue,#0088ff)]" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 border flex items-center justify-center text-base sm:text-xl font-black uppercase rounded-sm shrink-0 bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] text-[var(--color-brand-blue,#0088ff)]">
              {(profile?.first_name || "E").slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-3xl font-black text-slate-100 uppercase tracking-tighter truncate">
                {profile?.nickname || profile?.first_name}
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 truncate">
                ID: <span className="text-slate-100 font-bold">{profile?.id.slice(0, 8)}</span> • {profile?.role.toUpperCase()}
              </p>
            </div>
          </div>

          {/* METRIC PILLS */}
          <div className="w-full sm:w-auto grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3">
            <div className="border p-2 sm:px-4 sm:py-2 text-center sm:text-right rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)]">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 font-bold block truncate">REDEEMABLE</span>
              <span className="text-xs sm:text-lg font-black tabular-nums block text-[var(--color-brand-green,#00ff9d)]">
                {profile?.points_balance || 0} PTS
              </span>
            </div>

            <div className="border p-2 sm:px-4 sm:py-2 text-center sm:text-right rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)]">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 font-bold block truncate">CAREER TOTAL</span>
              <span className="text-xs sm:text-lg font-black tabular-nums block text-[var(--color-brand-blue,#0088ff)]">
                {profile?.lifetime_points || 0} PTS
              </span>
            </div>

            <div className="col-span-2 sm:col-auto border p-2 sm:px-4 sm:py-2 text-center sm:text-right rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)]">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 font-bold block truncate">ASSIGNED SITE</span>
              <span className="text-xs font-black uppercase truncate block text-[var(--color-brand-blue,#0088ff)]">
                {assignedLocationDisplay}
              </span>
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex gap-2 sm:gap-4 border-b mt-4 sm:mt-6 pb-px overflow-x-auto no-scrollbar -mx-3.5 px-3.5 sm:mx-0 sm:px-0 border-[var(--color-brand-border)]">
          {[
            { id: "overview", label: "Certifications & Tools" },
            { id: "history", label: "Point Ledger Activity" },
            { id: "security", label: "Profile & Security" }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`min-h-[44px] pb-2.5 sm:pb-3 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer whitespace-nowrap outline-none focus:outline-none shrink-0 touch-manipulation ${
                  isActive 
                    ? "border-[var(--color-brand-blue,#0088ff)] text-[var(--color-brand-blue,#0088ff)]" 
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: CERTIFICATIONS & FIELD TOOLS */}
      {activeTab === "overview" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-4 sm:space-y-6">
          <div className="w-full border p-3.5 sm:p-6 shadow-xl rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)]">
            <div className="flex justify-between items-center mb-3 sm:mb-6">
              <div>
                <h2 className="text-slate-100 font-black uppercase tracking-widest text-xs sm:text-base flex items-center gap-2">
                  <span className="w-2 h-2 rounded-none bg-[var(--color-brand-blue,#0088ff)] animate-pulse flex-shrink-0" />
                  Safety Certifications & Credentials
                </h2>
                <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Managed & Verified By IMC Safety.
                </p>
              </div>
            </div>

            {/* 2-COLUMN ON MOBILE & DESKTOP */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-2 sm:gap-4 w-full">
              {certs.map((cert) => {
                let badgeClasses = "bg-[var(--color-brand-green,#00ff9d)]/10 border-[var(--color-brand-green,#00ff9d)]/40 text-[var(--color-brand-green,#00ff9d)]";
                let badgeText = "VALID";

                if (cert.status === "EXPIRING_SOON") {
                  badgeClasses = "bg-[#eab308]/10 border-[#eab308]/40 text-[#eab308]";
                  badgeText = `EXP (${cert.daysRemaining}d)`;
                } else if (cert.status === "EXPIRED") {
                  badgeClasses = "bg-[var(--color-brand-red,#ff3b5c)]/10 border-[var(--color-brand-red,#ff3b5c)]/40 text-[var(--color-brand-red,#ff3b5c)]";
                  badgeText = "EXPIRED";
                } else if (cert.status === "NOT_TRAINED") {
                  badgeClasses = "bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] text-slate-400";
                  badgeText = "NOT TRAINED";
                }

                return (
                  <div 
                    key={cert.typeKey} 
                    className="w-full border p-2.5 sm:p-4 rounded-sm flex flex-col justify-between gap-2 sm:gap-3 bg-[var(--color-brand-bg)] border-[var(--color-brand-border)]"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-1 sm:gap-2">
                      <p className="text-[10px] sm:text-xs font-black text-slate-100 uppercase line-clamp-2 sm:truncate flex-1">
                        {cert.title}
                      </p>
                      <span className={`px-1.5 py-0.5 border text-[9px] sm:text-[10px] font-black uppercase tracking-wider rounded-none shrink-0 ${badgeClasses}`}>
                        {badgeText}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between text-[9px] sm:text-[10px] text-slate-400 font-bold border-t border-[var(--color-brand-border)]/60 pt-1.5 sm:pt-2 gap-0.5">
                      <span className="truncate">ISSUED: {cert.issueDate || "--"}</span>
                      <span className="truncate">EXPIRES: {cert.expirationDate || "--"}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* LOCATION SPECIFIC PAPERWORK ACTION LINK */}
            {paperworkUrl && (
              <div className="mt-4 sm:mt-8 pt-4 sm:pt-6 border-t w-full border-[var(--color-brand-border)]">
                <div className="w-full border p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-blue,#0088ff)]">
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest flex items-center gap-1.5 text-[var(--color-brand-blue,#0088ff)]">
                      <span className="w-1.5 h-1.5 rounded-full animate-ping shrink-0 bg-[var(--color-brand-blue,#0088ff)]" />
                      Required Daily Site Paperwork
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5 truncate">
                      Mandatory safety paperwork link for {assignedLocationDisplay}
                    </p>
                  </div>
                  <a
                    href={paperworkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 font-black text-xs uppercase tracking-widest transition-all text-center rounded-sm shadow-md border outline-none bg-[var(--color-brand-blue,#0088ff)] border-[var(--color-brand-blue,#0088ff)] text-white hover:bg-white hover:text-black flex items-center justify-center active:scale-[0.98] touch-manipulation"
                  >
                    Open Forms ↗
                  </a>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* TAB 2: POINT LEDGER HISTORY */}
      {activeTab === "history" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
          <div className="w-full border p-3.5 sm:p-6 shadow-xl rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)]">
            <h2 className="text-slate-100 font-black uppercase tracking-widest text-xs sm:text-base mb-3 sm:mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-none bg-[var(--color-brand-blue,#0088ff)] animate-pulse flex-shrink-0" />
              Point Activity Log
            </h2>
            <div className="flex flex-col w-full">
              {log.length === 0 ? (
                <p className="text-xs text-slate-400 font-bold tracking-wider py-8 text-center border border-dashed rounded-sm bg-[var(--color-brand-bg)]/50 border-[var(--color-brand-border)]">
                  [ NO TRANSACTION ENTRIES RECORDED ]
                </p>
              ) : (
                log.map((entry) => (
                  <div 
                    key={entry.id} 
                    className="text-xs border-b py-3 flex justify-between items-center gap-2 border-[var(--color-brand-border)]/50 last:border-0"
                  >
                    <span className={`${entry.color} font-black uppercase tracking-wide truncate flex-1`}>
                      {entry.label}
                    </span>
                    <span className="text-slate-100 font-black tabular-nums text-right whitespace-nowrap shrink-0">
                      {entry.amountDisplay}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 3: PROFILE & SECURITY SETTINGS */}
      {activeTab === "security" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-4 sm:space-y-6">
          <div className="w-full border p-3.5 sm:p-6 shadow-xl rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)]">
            <h2 className="font-black uppercase tracking-widest text-xs sm:text-sm mb-3 sm:mb-4 text-[var(--color-brand-blue,#0088ff)]">
              Display Preferences
            </h2>
            
            {formFeedback && (
              <div className={`mb-3 sm:mb-4 p-3 text-xs font-bold uppercase tracking-wider border rounded-sm ${
                formFeedback.isError 
                  ? 'bg-[var(--color-brand-red,#ff3b5c)]/10 border-[var(--color-brand-red,#ff3b5c)]/40 text-[var(--color-brand-red,#ff3b5c)]' 
                  : 'bg-[var(--color-brand-green,#00ff9d)]/10 border-[var(--color-brand-green,#00ff9d)]/40 text-[var(--color-brand-green,#00ff9d)]'
              }`}>
                [{formFeedback.isError ? "FAULT" : "LOGGED"}] {formFeedback.message}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4 items-center">
              <input 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)} 
                placeholder="Display Nickname"
                className="w-full min-h-[44px] border p-2.5 sm:p-3 text-slate-100 text-xs font-bold uppercase outline-none rounded-sm transition-all bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue,#0088ff)] touch-manipulation" 
              />
              <button 
                type="button"
                onClick={handleUpdate} 
                disabled={isUpdating}
                className="w-full min-h-[44px] border border-[var(--color-brand-border)] hover:border-[var(--color-brand-blue,#0088ff)] bg-[var(--color-brand-bg)] hover:bg-[var(--color-brand-blue,#0088ff)] text-slate-100 hover:text-white px-6 py-2.5 font-black uppercase text-xs tracking-widest transition-all rounded-sm cursor-pointer disabled:opacity-50 active:scale-[0.98] touch-manipulation focus:outline-none"
              >
                {isUpdating ? "SAVING..." : "Update Preferences"}
              </button>
            </div>
          </div>

          <div className="w-full border p-3.5 sm:p-6 shadow-xl rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)]">
            <h2 className="font-black uppercase tracking-widest text-xs sm:text-sm mb-3 sm:mb-4 text-[var(--color-brand-blue,#0088ff)]">
              Security Credentials
            </h2>

            {passwordFeedback && (
              <div className={`mb-3 sm:mb-4 p-3 text-xs font-bold uppercase tracking-wider border rounded-sm ${
                passwordFeedback.isError 
                  ? 'bg-[var(--color-brand-red,#ff3b5c)]/10 border-[var(--color-brand-red,#ff3b5c)]/40 text-[var(--color-brand-red,#ff3b5c)]' 
                  : 'bg-[var(--color-brand-green,#00ff9d)]/10 border-[var(--color-brand-green,#00ff9d)]/40 text-[var(--color-brand-green,#00ff9d)]'
              }`}>
                [{passwordFeedback.isError ? "FAULT" : "SUCCESS"}] {passwordFeedback.message}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4">
                <div>
                  <label className="text-[10px] sm:text-[11px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full min-h-[44px] border p-2.5 sm:p-3 text-xs text-slate-100 outline-none rounded-sm transition-all bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue,#0088ff)] touch-manipulation"
                  />
                </div>

                <div>
                  <label className="text-[10px] sm:text-[11px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full min-h-[44px] border p-2.5 sm:p-3 text-xs text-slate-100 outline-none rounded-sm transition-all bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue,#0088ff)] touch-manipulation"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 font-black uppercase text-xs tracking-widest transition-all rounded-sm cursor-pointer disabled:opacity-50 border bg-[var(--color-brand-blue,#0088ff)] border-[var(--color-brand-blue,#0088ff)] text-white hover:bg-white hover:text-black active:scale-[0.98] touch-manipulation focus:outline-none"
              >
                {isUpdatingPassword ? "SAVING NEW CREDENTIALS..." : "Update Password"}
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  );
}