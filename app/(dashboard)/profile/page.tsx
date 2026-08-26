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

        // Fetch certifications, paperwork URL, ledger, AND lifetime career points concurrently
        const [certList, siteUrl, ledgerData, careerPoints] = await Promise.all([
          getEmployeeCertifications(supabase, user.id, userProfile.role),
          getLocationPaperworkUrl(supabase, userProfile.location),
          getUserLedgerActivity(supabase, user.id),
          getUserLifetimePoints(supabase, user.id)
        ]);

        // Attach calculated career total to local state
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
            color: isRedemption ? "text-slate-400" : "text-[var(--color-brand-blue)]",
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
      <div 
        className="p-10 min-h-screen flex items-center justify-center font-mono text-xs uppercase tracking-widest"
        style={{ color: "var(--color-brand-blue)" }}
      >
        INITIALIZING PERSONNEL FILE SYSTEM...
      </div>
    );
  }

  const assignedLocationDisplay = (profile?.location || "Main Yard").toUpperCase();

  const inputStyle = {
    backgroundColor: "var(--color-brand-bg)",
    borderColor: "var(--color-brand-border)",
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "var(--color-brand-blue)";
    e.currentTarget.style.boxShadow = "0 0 8px color-mix(in srgb, var(--color-brand-blue) 30%, transparent)";
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "var(--color-brand-border)";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6 min-h-screen relative z-10 font-mono text-slate-100">
      
      {/* USER PASSPORT HEADER CARD */}
      <div 
        className="border p-6 shadow-2xl relative overflow-hidden rounded-sm"
        style={{
          backgroundColor: "var(--color-brand-card)",
          borderColor: "var(--color-brand-border)"
        }}
      >
        <div 
          className="absolute top-0 left-0 w-full h-[3px]" 
          style={{ backgroundColor: "var(--color-brand-blue)" }}
        />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 border flex items-center justify-center text-xl font-black uppercase rounded-sm"
              style={{
                backgroundColor: "var(--color-brand-bg)",
                borderColor: "var(--color-brand-border)",
                color: "var(--color-brand-blue)"
              }}
            >
              {(profile?.first_name || "E").slice(0, 2)}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-100 uppercase tracking-tighter">
                {profile?.nickname || profile?.first_name}
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                ID: <span className="text-slate-100 font-bold">{profile?.id.slice(0, 8)}</span> • {profile?.role.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* CURRENT REDEEMABLE BALANCE */}
            <div 
              className="border px-4 py-2 text-right rounded-sm"
              style={{
                backgroundColor: "var(--color-brand-bg)",
                borderColor: "var(--color-brand-border)"
              }}
            >
              <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold block">REDEEMABLE</span>
              <span 
                className="text-lg font-black tabular-nums"
                style={{ color: "var(--color-brand-green)" }}
              >
                {profile?.points_balance || 0} PTS
              </span>
            </div>

            {/* LIFETIME CAREER EARNINGS */}
            <div 
              className="border px-4 py-2 text-right rounded-sm"
              style={{
                backgroundColor: "var(--color-brand-bg)",
                borderColor: "var(--color-brand-border)"
              }}
            >
              <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold block">CAREER TOTAL</span>
              <span 
                className="text-lg font-black tabular-nums"
                style={{ color: "var(--color-brand-blue)" }}
              >
                {profile?.lifetime_points || 0} PTS
              </span>
            </div>

            {/* ASSIGNED SITE */}
            <div 
              className="border px-4 py-2 text-right rounded-sm"
              style={{
                backgroundColor: "var(--color-brand-bg)",
                borderColor: "var(--color-brand-border)"
              }}
            >
              <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold block">ASSIGNED SITE</span>
              <span 
                className="text-xs font-black uppercase"
                style={{ color: "var(--color-brand-blue)" }}
              >
                {assignedLocationDisplay}
              </span>
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION HEADER */}
        <div 
          className="flex gap-2 border-b mt-6 pb-px overflow-x-auto"
          style={{ borderColor: "var(--color-brand-border)" }}
        >
          {[
            { id: "overview", label: "Certifications & Field Tools" },
            { id: "history", label: "Point Ledger Activity" },
            { id: "security", label: "Profile & Security" }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="pb-3 px-4 text-xs font-black uppercase tracking-widest border-b-2 transition-colors cursor-pointer whitespace-nowrap outline-none focus:outline-none focus:ring-0"
                style={{
                  borderColor: isActive ? "var(--color-brand-blue)" : "transparent",
                  color: isActive ? "var(--color-brand-blue)" : "rgb(148, 163, 184)"
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: CERTIFICATIONS & FIELD TOOLS */}
      {activeTab === "overview" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div 
            className="border p-6 shadow-xl rounded-sm"
            style={{
              backgroundColor: "var(--color-brand-card)",
              borderColor: "var(--color-brand-border)"
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-slate-100 font-black uppercase tracking-widest text-sm">Safety Certifications & Credentials</h2>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Managed & Verified By IMC Safety.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certs.map((cert) => {
                let badgeStyle = {
                  backgroundColor: "color-mix(in srgb, var(--color-brand-green) 15%, transparent)",
                  borderColor: "color-mix(in srgb, var(--color-brand-green) 50%, transparent)",
                  color: "var(--color-brand-green)"
                };
                let badgeText = "VALID";

                if (cert.status === "EXPIRING_SOON") {
                  badgeStyle = {
                    backgroundColor: "color-mix(in srgb, #eab308 15%, transparent)",
                    borderColor: "color-mix(in srgb, #eab308 50%, transparent)",
                    color: "#eab308"
                  };
                  badgeText = `EXPIRING SOON (${cert.daysRemaining}d)`;
                } else if (cert.status === "EXPIRED") {
                  badgeStyle = {
                    backgroundColor: "color-mix(in srgb, var(--color-brand-red, #f87171) 15%, transparent)",
                    borderColor: "color-mix(in srgb, var(--color-brand-red, #f87171) 50%, transparent)",
                    color: "var(--color-brand-red, #f87171)"
                  };
                  badgeText = "EXPIRED";
                } else if (cert.status === "NOT_TRAINED") {
                  badgeStyle = {
                    backgroundColor: "var(--color-brand-bg)",
                    borderColor: "var(--color-brand-border)",
                    color: "rgb(148, 163, 184)"
                  };
                  badgeText = "NOT TRAINED";
                }

                return (
                  <div 
                    key={cert.typeKey} 
                    className="border p-4 rounded-sm flex flex-col justify-between gap-3"
                    style={{
                      backgroundColor: "var(--color-brand-bg)",
                      borderColor: "var(--color-brand-border)"
                    }}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-xs font-black text-slate-100 uppercase">{cert.title}</p>
                      <span 
                        className="px-2 py-1 border text-[9px] font-black uppercase tracking-wider rounded-none"
                        style={badgeStyle}
                      >
                        {badgeText}
                      </span>
                    </div>

                    <div 
                      className="flex justify-between text-[10px] text-slate-400 font-bold border-t pt-2"
                      style={{ borderColor: "color-mix(in srgb, var(--color-brand-border) 60%, transparent)" }}
                    >
                      <span>ISSUED: {cert.issueDate || "--"}</span>
                      <span>EXPIRES: {cert.expirationDate || "--"}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* LOCATION SPECIFIC PAPERWORK ACTION LINK */}
            {paperworkUrl && (
              <div 
                className="mt-8 pt-6 border-t"
                style={{ borderColor: "var(--color-brand-border)" }}
              >
                <div 
                  className="border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-sm"
                  style={{
                    backgroundColor: "var(--color-brand-bg)",
                    borderColor: "var(--color-brand-blue)"
                  }}
                >
                  <div>
                    <h3 
                      className="text-xs font-black uppercase tracking-widest flex items-center gap-2"
                      style={{ color: "var(--color-brand-blue)" }}
                    >
                      <span 
                        className="w-2 h-2 rounded-full animate-ping" 
                        style={{ backgroundColor: "var(--color-brand-blue)" }}
                      />
                      Required Daily Site Paperwork
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                      Mandatory safety paperwork link for {assignedLocationDisplay}
                    </p>
                  </div>
                  <a
                    href={paperworkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-3 font-black text-xs uppercase tracking-widest transition-all duration-200 text-center rounded-sm shadow-md border outline-none focus:outline-none focus:ring-0"
                    style={{
                      backgroundColor: "var(--color-brand-blue)",
                      borderColor: "var(--color-brand-blue)",
                      color: "#ffffff"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#ffffff";
                      e.currentTarget.style.borderColor = "#ffffff";
                      e.currentTarget.style.color = "#0a0a0a";
                      e.currentTarget.style.boxShadow = "0 0 12px color-mix(in srgb, #ffffff 40%, transparent)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--color-brand-blue)";
                      e.currentTarget.style.borderColor = "var(--color-brand-blue)";
                      e.currentTarget.style.color = "#ffffff";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    Open Site Forms ↗
                  </a>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* TAB 2: POINT LEDGER HISTORY */}
      {activeTab === "history" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div 
            className="border p-6 shadow-xl rounded-sm"
            style={{
              backgroundColor: "var(--color-brand-card)",
              borderColor: "var(--color-brand-border)"
            }}
          >
            <h2 className="text-slate-100 font-black uppercase tracking-widest text-sm mb-6">Point Activity Log</h2>
            <div className="flex flex-col">
              {log.length === 0 ? (
                <p 
                  className="text-[10px] text-slate-400 font-bold tracking-wider py-8 text-center border border-dashed rounded-sm"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--color-brand-bg) 50%, transparent)",
                    borderColor: "var(--color-brand-border)"
                  }}
                >
                  NO TRANSACTION ENTRIES RECORDED
                </p>
              ) : (
                log.map((entry) => (
                  <div 
                    key={entry.id} 
                    className="text-[11px] border-b py-3.5 flex justify-between items-center group"
                    style={{ borderColor: "color-mix(in srgb, var(--color-brand-border) 50%, transparent)" }}
                  >
                    <span className={`${entry.color} font-black uppercase tracking-wide truncate pr-4 group-hover:text-white transition-colors`}>
                      {entry.label}
                    </span>
                    <span className="text-slate-100 font-black tabular-nums text-right ml-4 whitespace-nowrap">
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          
          {/* Display Settings */}
          <div 
            className="border p-6 shadow-xl rounded-sm"
            style={{
              backgroundColor: "var(--color-brand-card)",
              borderColor: "var(--color-brand-border)"
            }}
          >
            <h2 
              className="font-black uppercase tracking-widest text-xs mb-4"
              style={{ color: "var(--color-brand-blue)" }}
            >
              Display Preferences
            </h2>
            
            {formFeedback && (
              <div 
                className="mb-4 p-3 text-[10px] font-bold uppercase tracking-wider border rounded-sm"
                style={{
                  backgroundColor: formFeedback.isError 
                    ? "color-mix(in srgb, var(--color-brand-red, #f87171) 10%, transparent)" 
                    : "color-mix(in srgb, var(--color-brand-green) 10%, transparent)",
                  borderColor: formFeedback.isError 
                    ? "color-mix(in srgb, var(--color-brand-red, #f87171) 40%, transparent)" 
                    : "color-mix(in srgb, var(--color-brand-green) 40%, transparent)",
                  color: formFeedback.isError 
                    ? "var(--color-brand-red, #f87171)" 
                    : "var(--color-brand-green)"
                }}
              >
                [{formFeedback.isError ? "FAULT" : "LOGGED"}] {formFeedback.message}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4 items-center">
              <input 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)} 
                placeholder="Display Nickname"
                className="w-full border p-3 text-slate-100 text-xs font-bold outline-none focus:outline-none focus:ring-0 rounded-sm transition-colors" 
                style={inputStyle}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
              <button 
                onClick={handleUpdate} 
                disabled={isUpdating}
                className="border text-slate-100 px-6 py-3 font-black uppercase text-[10px] tracking-widest transition-all rounded-sm cursor-pointer disabled:opacity-50 shadow-md outline-none focus:outline-none focus:ring-0"
                style={{
                  backgroundColor: "var(--color-brand-bg)",
                  borderColor: "var(--color-brand-border)"
                }}
                onMouseEnter={(e) => {
                  if (!isUpdating) {
                    e.currentTarget.style.borderColor = "var(--color-brand-blue)";
                    e.currentTarget.style.color = "var(--color-brand-blue)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-brand-border)";
                  e.currentTarget.style.color = "#ffffff";
                }}
              >
                {isUpdating ? "SAVING..." : "Update Preferences"}
              </button>
            </div>
          </div>

          {/* Password Security */}
          <div 
            className="border p-6 shadow-xl rounded-sm"
            style={{
              backgroundColor: "var(--color-brand-card)",
              borderColor: "var(--color-brand-border)"
            }}
          >
            <h2 
              className="font-black uppercase tracking-widest text-xs mb-4"
              style={{ color: "var(--color-brand-blue)" }}
            >
              Security Credentials
            </h2>

            {passwordFeedback && (
              <div 
                className="mb-4 p-3 text-[10px] font-bold uppercase tracking-wider border rounded-sm"
                style={{
                  backgroundColor: passwordFeedback.isError 
                    ? "color-mix(in srgb, var(--color-brand-red, #f87171) 10%, transparent)" 
                    : "color-mix(in srgb, var(--color-brand-green) 10%, transparent)",
                  borderColor: passwordFeedback.isError 
                    ? "color-mix(in srgb, var(--color-brand-red, #f87171) 40%, transparent)" 
                    : "color-mix(in srgb, var(--color-brand-green) 40%, transparent)",
                  color: passwordFeedback.isError 
                    ? "var(--color-brand-red, #f87171)" 
                    : "var(--color-brand-green)"
                }}
              >
                [{passwordFeedback.isError ? "FAULT" : "SUCCESS"}] {passwordFeedback.message}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border p-3 text-xs text-slate-100 outline-none focus:outline-none focus:ring-0 rounded-sm transition-colors"
                    style={inputStyle}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border p-3 text-xs text-slate-100 outline-none focus:outline-none focus:ring-0 rounded-sm transition-colors"
                    style={inputStyle}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="px-6 py-3 font-black uppercase text-[10px] tracking-widest transition-all rounded-sm cursor-pointer disabled:opacity-50 shadow-md border outline-none focus:outline-none focus:ring-0"
                style={{
                  backgroundColor: "var(--color-brand-blue)",
                  borderColor: "var(--color-brand-blue)",
                  color: "#ffffff"
                }}
                onMouseEnter={(e) => {
                  if (!isUpdatingPassword) {
                    e.currentTarget.style.backgroundColor = "#ffffff";
                    e.currentTarget.style.borderColor = "#ffffff";
                    e.currentTarget.style.color = "#0a0a0a";
                    e.currentTarget.style.boxShadow = "0 0 12px color-mix(in srgb, #ffffff 40%, transparent)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-brand-blue)";
                  e.currentTarget.style.borderColor = "var(--color-brand-blue)";
                  e.currentTarget.style.color = "#ffffff";
                  e.currentTarget.style.boxShadow = "none";
                }}
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