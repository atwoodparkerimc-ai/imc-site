"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion, animate, Variants } from "framer-motion"; 
import { getDisplayName } from "@/utils/display"; 

// --- CENTRAL DATA OPERATIONS ---
import { 
  getEmployeeProfile, 
  getUserLedgerActivity, 
  getLatestHazardScore,
  completeDailySafetyBriefing,
  UserProfile 
} from "@/lib/db/operations";

// --- COMPONENT IMPORTS ---
import { MatrixParticleCanvas, Particle } from "./_components/MatrixParticleCanvas";
import { TelemetryRing } from "./_components/TelemetryRing";
import { SafeDaysCounter } from "./_components/SafeDaysCounter";
import { HazardsCounter } from "./_components/HazardsCounter";
import FirstLoginPasswordModal from "./_components/FirstLoginPasswordModal";

interface ActivityLogItem {
  id: string;
  action: string;
  points: string;
  color: string;
  time: string;
  timestamp: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } }
};

// Configurable System Constants
const DEFAULT_NEXT_GOAL = 250;
const DEFAULT_LOCATION = "Springville Shop";
const ARC_CIRCUMFERENCE = 816;

const SAFETY_BRIEFINGS = [
  "UPDATE 1926.501: Fall protection is required at elevations of 6 feet or greater. Verify tie-off points before shift start.",
  "PPE REMINDER: High-visibility safety apparel is mandatory when working near heavy equipment or active traffic.",
  "HAZCOM PREP: Ensure all chemical containers are properly labeled and Safety Data Sheets (SDS) are accessible.",
  "TOOL INSPECTION: Check all power cords for fraying or damage before use. Tag out defective equipment immediately.",
  "LADDER SAFETY: Always maintain three points of contact when ascending or descending. Do not stand on the top step.",
  "HEAT STRESS PREPAREDNESS: Hydrate continuously. Follow the work/rest cycles mandated for today's temperature index.",
  "TRENCHING & EXCAVATION: Any trench 5 feet or deeper requires a protective system. Inspect daily before entry.",
  "SCAFFOLDING CHECK: Ensure all scaffolds are fully planked and equipped with guardrails and toeboards.",
  "LOCKOUT/TAGOUT (LOTO): Never bypass a lock. Verify zero energy state before performing maintenance on machinery.",
  "FIRE EXTINGUISHER PROTOCOL: Know the locations of the nearest fire extinguishers and keep pathways to them clear."
];

export default function DashboardPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [profile, setProfile] = useState<UserProfile | null>(null);  
  const [displayPoints, setDisplayPoints] = useState<number>(0);
  const [progressArc, setProgressArc] = useState<number>(ARC_CIRCUMFERENCE);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSigningBriefing, setIsSigningBriefing] = useState<boolean>(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLogItem[]>([]);
  const [dailyBriefing, setDailyBriefing] = useState<string>("");
  const [yesterdayHazards, setYesterdayHazards] = useState<number>(0);

  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      angle: Math.random() * 360,
      radius: Math.sqrt(Math.random()) * 75,
      size: Math.random() * 2 + 0.5,
      duration: Math.random() * 3 + 2,
      color: Math.random() > 0.85 ? 'var(--color-brand-blue)' : 'var(--color-brand-border)'
    }));
    setParticles(newParticles);

    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    setDailyBriefing(SAFETY_BRIEFINGS[dayOfYear % SAFETY_BRIEFINGS.length]);
  }, []);

  const refreshDashboardData = async (userId: string) => {
    const userProfile = await getEmployeeProfile(supabase, userId);
    
    if (userProfile) {
      setProfile(userProfile);

      const empLocation = userProfile.location || DEFAULT_LOCATION;
      const [ledgerData, siteHazardScore] = await Promise.all([
        getUserLedgerActivity(supabase, userId),
        getLatestHazardScore(supabase, empLocation)
      ]);

      setYesterdayHazards(siteHazardScore);

      animate(displayPoints, userProfile.points_balance || 0, {
        duration: 1.5,
        ease: "easeOut",
        onUpdate: (latest) => setDisplayPoints(Math.round(latest)),
      });

      const targetProgress = ((userProfile.points_balance || 0) / DEFAULT_NEXT_GOAL) * ARC_CIRCUMFERENCE;
      animate(progressArc, ARC_CIRCUMFERENCE - Math.min(targetProgress, ARC_CIRCUMFERENCE), {
        duration: 2,
        ease: "easeInOut",
        onUpdate: (latest) => setProgressArc(latest),
        onComplete: () => setIsSpinning(true) 
      });

      const formatTime = (isoString: string) => {
        if (!isoString) return "JUST NOW";
        const date = new Date(isoString);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ", " + date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      };

      const unifiedLog: ActivityLogItem[] = ledgerData.map((entry: any) => {
        const logTimestamp = entry.created_at ? new Date(entry.created_at).getTime() : 0;
        const isRedemption = entry.type === 'redemption';

        return {
          id: entry.id,
          action: String(entry.description).toUpperCase(),
          points: isRedemption ? `-${entry.amount}` : `+${entry.amount}`,
          color: isRedemption ? "text-slate-400" : "text-[var(--color-brand-blue)]",
          time: formatTime(entry.created_at),
          timestamp: logTimestamp
        };
      });

      unifiedLog.sort((a, b) => b.timestamp - a.timestamp);
      setRecentActivity(unifiedLog.slice(0, 4));
    }
  };

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      await refreshDashboardData(user.id);
      setIsLoading(false);
    }
    
    fetchData();
  }, [supabase, router]);

  const handleSignBriefing = async () => {
    if (!profile || isSigningBriefing) return;
    setIsSigningBriefing(true);

    const res = await completeDailySafetyBriefing(supabase, profile.id);
    if (res.success) {
      await refreshDashboardData(profile.id);
    }
    setIsSigningBriefing(false);
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col justify-center items-center px-4 relative overflow-hidden min-h-screen font-mono bg-transparent">
        <p className="text-[var(--color-brand-blue)] animate-pulse uppercase tracking-widest text-xs font-black z-10">
          Initializing System Console Terminal...
        </p>
      </div>
    );
  }

  const todayDate = new Date().toISOString().split('T')[0];
  const isSafetyComplete = profile?.last_safety_check === todayDate;
  const isReportingComplete = profile?.last_safe_act_date === todayDate;
  const assignedLocationDisplay = (profile?.location || DEFAULT_LOCATION).toUpperCase();

  return (
    <motion.div className="max-w-7xl mx-auto relative z-10 p-4 sm:p-8 pt-6 pb-20 w-full font-mono text-slate-100 bg-transparent" variants={containerVariants} initial="hidden" animate="show">
      {/* Password Reset Modal */}
      {profile && profile.must_change_password && (
        <FirstLoginPasswordModal 
          userId={profile.id} 
          onPasswordChanged={() => {
            setProfile((prev) => prev ? { ...prev, must_change_password: false } : null);
          }} 
        />
      )}

      {/* HEADER BANNER */}
      <motion.header variants={itemVariants} className="mb-8 text-center border border-[var(--color-brand-border)] tactical-card p-6 rounded-sm relative overflow-hidden shadow-lg">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-blue)]" />
        <div className="absolute top-2 right-3 text-[8px] font-black tracking-widest text-slate-500 uppercase">
          TERM_ID // 08-DASH
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-100 uppercase tracking-tighter">
          Welcome, {getDisplayName(profile)}!
        </h1>
        <p className="text-slate-400 text-xs uppercase tracking-[0.25em] font-black mt-2">
          Assigned Site Location: <span className="text-[var(--color-brand-blue)] font-black">[{assignedLocationDisplay}]</span>
        </p>
      </motion.header>

      {/* TELEMETRY METRIC GAUGES - FLOATING DIRECTLY ON GRID */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 mb-12 relative w-full px-2 bg-transparent">
        <div className="flex-1 flex justify-start">
          <div className="tactical-gauge-circle p-1 rounded-full">
            <SafeDaysCounter particles={particles} incidentFreeDate="2025-11-27T00:00:00" />
          </div>
        </div>
        <div className="flex-shrink-0 flex justify-center">
          <div className="tactical-gauge-circle p-1 rounded-full">
            <TelemetryRing 
              particles={particles} 
              displayPoints={displayPoints} 
              progressArc={progressArc} 
              isSpinning={isSpinning} 
              nextGoal={DEFAULT_NEXT_GOAL} 
            />
          </div>
        </div>
        <div className="flex-1 flex justify-end">
          <div className="tactical-gauge-circle p-1 rounded-full">
            <HazardsCounter particles={particles} hazardCount={yesterdayHazards} />
          </div>
        </div>
      </motion.div>

      {/* QUICK ACTIONS ROUTER BLOCK */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* DAILY SAFETY CARD */}
        <a 
          href="/safety" 
          className={`group p-5 tactical-card-interactive border transition-all duration-300 relative overflow-hidden rounded-sm flex flex-col justify-center shadow-md hover:-translate-y-0.5 ${
            isSafetyComplete 
              ? "border-[var(--color-brand-green,#00ff9d)]" 
              : "border-[var(--color-brand-blue)]"
          }`}
        >
          <div className={`absolute top-0 left-0 w-full h-[2px] transition-colors ${
            isSafetyComplete 
              ? "bg-[var(--color-brand-green,#00ff9d)]" 
              : "bg-[var(--color-brand-blue)]/40 group-hover:bg-[var(--color-brand-blue)]"
          }`} />
          <div className="relative z-10 flex justify-between items-center w-full">
            <div>
              <h3 className={`text-base font-black uppercase tracking-wide transition-colors ${
                isSafetyComplete 
                  ? "text-[var(--color-brand-green,#00ff9d)]" 
                  : "text-[var(--color-brand-blue)]"
              }`}>
                Daily Safety
              </h3>
              <p className={`text-[10px] uppercase tracking-wider font-black mt-1 ${
                isSafetyComplete 
                  ? "text-[var(--color-brand-green,#00ff9d)]" 
                  : "text-[var(--color-brand-blue)]"
              }`}>
                {isSafetyComplete ? "✓ Briefing Complete" : "Sign to earn 10 pts"}
              </p>
            </div>
            <div className={`w-7 h-7 border flex items-center justify-center transition-colors flex-shrink-0 ${
              isSafetyComplete 
                ? "border-[var(--color-brand-green,#00ff9d)] bg-[var(--color-brand-green,#00ff9d)]/10" 
                : "border-[var(--color-brand-blue)] bg-[var(--color-brand-blue)]/20 animate-pulse"
            }`}>
              <div className={`w-2 h-2 ${
                isSafetyComplete 
                  ? "bg-[var(--color-brand-green,#00ff9d)]" 
                  : "bg-[var(--color-brand-blue)]"
              }`} />
            </div>
          </div>
        </a>
        
        {/* REWARDS CATALOG */}
        <a href="/catalog" className="group p-5 tactical-card-interactive border border-[var(--color-brand-border)] hover:border-[var(--color-brand-blue)] transition-all duration-300 relative overflow-hidden rounded-sm flex flex-col justify-center shadow-md hover:-translate-y-0.5">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-border)] group-hover:bg-[var(--color-brand-blue)] transition-colors" />
          <MatrixParticleCanvas particles={particles} sliceCount={75} multiplier={1.5} rotateX={60} rotateY={-10} duration={40} />
          <div className="relative z-10 flex justify-between items-center w-full">
            <div>
              <h3 className="text-base font-black text-slate-100 uppercase tracking-wide">Rewards</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-black mt-1">Access Catalog</p>
            </div>
            <div className="w-8 h-8 border border-[var(--color-brand-border)] flex items-center justify-center bg-black/40 flex-shrink-0">
              <div className="w-2 h-2 bg-[var(--color-brand-blue)]" />
            </div>
          </div>
        </a>

        {/* REPORT SAFE ACT CARD */}
        <a 
          href="/reporting" 
          className={`group p-5 tactical-card-interactive border transition-all duration-300 relative overflow-hidden rounded-sm flex flex-col justify-center shadow-md hover:-translate-y-0.5 ${
            isReportingComplete 
              ? "border-[var(--color-brand-green,#00ff9d)]" 
              : "border-[var(--color-brand-blue)]"
          }`}
        >
          <div className={`absolute top-0 left-0 w-full h-[2px] transition-colors ${
            isReportingComplete 
              ? "bg-[var(--color-brand-green,#00ff9d)]" 
              : "bg-[var(--color-brand-blue)]/40 group-hover:bg-[var(--color-brand-blue)]"
          }`} />
          <div className="relative z-10 flex justify-between items-center w-full">
            <div>
              <h3 className={`text-base font-black uppercase tracking-wide transition-colors ${
                isReportingComplete 
                  ? "text-[var(--color-brand-green,#00ff9d)]" 
                  : "text-[var(--color-brand-blue)]"
              }`}>
                Report Act
              </h3>
              <p className={`text-[10px] uppercase tracking-wider font-black mt-1 ${
                isReportingComplete 
                  ? "text-[var(--color-brand-green,#00ff9d)]" 
                  : "text-[var(--color-brand-blue)]"
              }`}>
                {isReportingComplete ? "✓ Report Logged" : "Reward a coworker"}
              </p>
            </div>
            <div className={`w-7 h-7 border flex items-center justify-center transition-colors flex-shrink-0 ${
              isReportingComplete 
                ? "border-[var(--color-brand-green,#00ff9d)] bg-[var(--color-brand-green,#00ff9d)]/10" 
                : "border-[var(--color-brand-blue)] bg-[var(--color-brand-blue)]/20 animate-pulse"
            }`}>
              <div className={`w-2 h-2 ${
                isReportingComplete 
                  ? "bg-[var(--color-brand-green,#00ff9d)]" 
                  : "bg-[var(--color-brand-blue)]"
              }`} />
            </div>
          </div>
        </a>
      </motion.div>

      {/* OPERATIONAL CONSOLE FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* INTERACTIVE DAILY BRIEFING CARD */}
        <motion.div variants={itemVariants} className="p-6 tactical-card border border-[var(--color-brand-border)] rounded-sm relative flex flex-col justify-between shadow-lg overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-blue)]" />
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-[var(--color-brand-border)] pb-3">
              <h3 className="text-[var(--color-brand-blue)] text-xs uppercase font-black tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-[var(--color-brand-blue)] animate-pulse" />
                Daily Briefing
              </h3>
              {isSafetyComplete ? (
                <span className="text-[9px] font-black text-[var(--color-brand-green,#00ff9d)] border border-[var(--color-brand-green,#00ff9d)]/50 bg-[var(--color-brand-green,#00ff9d)]/10 px-2.5 py-0.5 uppercase tracking-wider">
                  [COMPLETED TODAY]
                </span>
              ) : (
                <span className="text-[9px] font-black text-[var(--color-brand-bg)] bg-[var(--color-brand-blue)] px-2.5 py-0.5 uppercase tracking-wider">
                  [ACTION REQUIRED]
                </span>
              )}
            </div>

            <p className="text-slate-100 text-sm leading-relaxed font-sans mb-6">
              {dailyBriefing}
              <span className="inline-block w-2 h-3 bg-[var(--color-brand-blue)] ml-2 animate-pulse align-middle font-mono" />
            </p>
          </div>

          {!isSafetyComplete ? (
            <button
              onClick={handleSignBriefing}
              disabled={isSigningBriefing}
              className="w-full bg-[var(--color-brand-blue)] text-[var(--color-brand-bg)] border border-[var(--color-brand-blue)] font-black uppercase tracking-widest py-3 text-xs hover:bg-white hover:text-[var(--color-brand-bg)] transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-[0_0_20px_rgba(0,136,255,0.4)]"
            >
              {isSigningBriefing ? "Recording Signature..." : "Sign Briefing (+10 PTS) ↗"}
            </button>
          ) : (
            <div className="w-full bg-black/40 border border-[var(--color-brand-border)] text-slate-300 p-3 text-center rounded-xs">
              <p className="text-[10px] font-mono uppercase tracking-wider font-black">
                ✓ Signature Recorded For Today
              </p>
            </div>
          )}
        </motion.div>

        {/* RECENT ACTIVITY CARD */}
        <motion.div variants={itemVariants} className="p-6 tactical-card border border-[var(--color-brand-border)] rounded-sm flex flex-col shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-border)]" />
          <div className="flex justify-between items-center border-b border-[var(--color-brand-border)] pb-3 mb-4">
            <h3 className="text-slate-100 text-xs uppercase font-black tracking-widest">
              Recent Activity
            </h3>
            <a href="/profile" className="text-[var(--color-brand-blue)] text-[10px] font-black uppercase tracking-widest hover:underline transition-all">
              View All ↗
            </a>
          </div>
          
          <div className="flex flex-col gap-3.5 flex-1 overflow-hidden">
            {recentActivity.length === 0 ? (
              <p className="text-[10px] font-black text-slate-500 mt-2 py-4 text-center border border-dashed border-[var(--color-brand-border)]">
                NO RECENT ACTIVITY
              </p>
            ) : recentActivity.map((log) => (
              <div key={log.id} className="flex justify-between items-start gap-3 border-b border-[var(--color-brand-border)]/50 pb-2.5 last:border-none last:pb-0">
                <div className="flex-1">
                  <p className="text-slate-100 text-xs font-black uppercase leading-snug">
                    {log.action}
                  </p>
                  <p className="text-slate-500 text-[9px] mt-0.5 tracking-wider font-black font-mono">
                    {log.time}
                  </p>
                </div>
                <div className={`text-xs font-black tabular-nums whitespace-nowrap pt-0.5 ${log.color}`}>
                  {log.points} PTS
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}