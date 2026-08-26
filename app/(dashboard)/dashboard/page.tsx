"use client";

import { useEffect, useState, useRef, useMemo } from "react";
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

import FirstLoginPasswordModal from "./_components/FirstLoginPasswordModal";
import TermsAcceptanceModal from "./_components/TermsAcceptanceModal";

// --- NEON PARTICLE CLOUD (Adapted for Dashboard) ---
const ParticleCloud = ({ r, g, b }: { r: number, g: number, b: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 240; 
    canvas.width = size * 2;
    canvas.height = size * 2;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    ctx.scale(2, 2);

    const particles: { x: number, y: number, r: number, a: number, speed: number, dist: number, baseAlpha: number, isWhite: boolean }[] = [];
    const particleCount = 200; 
    const center = size / 2;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: 0, 
        y: 0,
        r: Math.random() * 1.4 + 0.2,
        a: Math.random() * Math.PI * 2,
        dist: Math.random() * (center - 2),
        speed: (Math.random() - 0.5) * 0.008,
        baseAlpha: Math.random() * 0.85 + 0.15,
        isWhite: Math.random() > 0.7
      });
    }

    let animationId: number;
    const render = () => {
      ctx.clearRect(0, 0, size, size);
      
      particles.forEach(p => {
        p.a += p.speed;
        p.x = center + Math.cos(p.a) * p.dist;
        p.y = center + Math.sin(p.a) * p.dist;

        const distanceFromCenter = Math.sqrt(Math.pow(p.x - center, 2) + Math.pow(p.y - center, 2));
        const edgeFade = Math.max(0, 1 - (distanceFromCenter / (center - 4)));
        const finalOpacity = edgeFade * p.baseAlpha;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.isWhite ? `rgba(255, 255, 255, ${finalOpacity})` : `rgba(${r}, ${g}, ${b}, ${finalOpacity})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [r, g, b]);

  return <canvas ref={canvasRef} className="absolute inset-0 rounded-full mix-blend-screen pointer-events-none" />;
};

// --- SHARED GAUGE WIDGET (Dynamic Sizing & Branding) ---
function DashboardGauge({ 
  value, 
  label, 
  subLabel, 
  primaryColor, 
  shadowColor,
  rgb,
  sizeClasses = "w-72 h-72",
  valueClasses = "text-7xl",
  labelClasses = "text-[10px]"
}: { 
  value: string | number; 
  label: string; 
  subLabel?: string; 
  primaryColor: string; 
  shadowColor: string;
  rgb: [number, number, number];
  sizeClasses?: string;
  valueClasses?: string;
  labelClasses?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center w-full group cursor-default">
      <div className={`relative ${sizeClasses} flex items-center justify-center transition-transform duration-500 group-hover:scale-105`}>
        
        {/* Primary Neon Orbit Ring (Forward) */}
        <div 
          className="absolute -inset-1.5 rounded-full border border-transparent opacity-80 animate-[spin_8s_linear_infinite] pointer-events-none transition-all duration-300 group-hover:opacity-100"
          style={{
            borderTopColor: primaryColor,
            borderBottomColor: primaryColor,
            filter: `drop-shadow(0 0 8px ${shadowColor}) drop-shadow(0 0 16px ${shadowColor})`
          }}
        />
        
        {/* Secondary Accent Orbit Ring (Reverse) */}
        <div 
          className="absolute -inset-3.5 rounded-full border border-transparent opacity-60 animate-[spin_14s_linear_infinite_reverse] pointer-events-none transition-all duration-300 group-hover:opacity-90"
          style={{
            borderLeftColor: primaryColor,
            borderRightColor: primaryColor,
            filter: `drop-shadow(0 0 10px ${shadowColor})`
          }}
        />

        {/* Ambient Circular Backlight Glow */}
        <div 
          className="absolute inset-0 rounded-full blur-xl pointer-events-none transition-opacity duration-500 opacity-30 group-hover:opacity-60"
          style={{ backgroundColor: shadowColor }}
        />

        {/* Main Housing Container */}
        <div 
          className="relative w-full h-full flex flex-col items-center justify-center rounded-full border border-[var(--color-brand-border)] shadow-[inset_0_0_35px_rgba(0,0,0,0.4)] bg-[var(--color-brand-card)] overflow-hidden transition-colors duration-300 px-2 text-center"
        >
          <ParticleCloud r={rgb[0]} g={rgb[1]} b={rgb[2]} />

          {/* Number */}
          <div className="relative flex items-start z-10">
            <span className={`${valueClasses} font-black text-slate-100 tracking-tighter drop-shadow-md leading-none`}>
              {value}
            </span>
          </div>

          {/* Label */}
          <div className="relative z-10 mt-2">
            <span 
              className={`${labelClasses} font-black uppercase tracking-[0.14em] leading-tight block transition-colors duration-300`}
              style={{ color: primaryColor }}
            >
              {label}
            </span>
            {subLabel && (
              <span className="text-[9px] text-slate-400 mt-2 border-t border-[var(--color-brand-border)] pt-2 px-4 block tracking-widest uppercase font-bold">
                {subLabel}
              </span>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// --- CONSTANTS & VARIANTS ---
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

const DEFAULT_NEXT_GOAL = 250;
const DEFAULT_LOCATION = "Springville Shop";
const DEFAULT_INCIDENT_DATE = "2025-11-27T00:00:00";

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

// --- MAIN PAGE ---
export default function DashboardPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [profile, setProfile] = useState<UserProfile | null>(null);  
  const [displayPoints, setDisplayPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSigningBriefing, setIsSigningBriefing] = useState<boolean>(false);
  const [recentActivity, setRecentActivity] = useState<ActivityLogItem[]>([]);
  const [dailyBriefing, setDailyBriefing] = useState<string>("");
  const [yesterdayHazards, setYesterdayHazards] = useState<number>(0);

  useEffect(() => {
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

  // Safe Days Logic
  const safeDaysCount = useMemo(() => {
    const startDate = new Date(DEFAULT_INCIDENT_DATE);
    const now = new Date();
    if (isNaN(startDate.getTime())) return 0;
    const diffTime = now.getTime() - startDate.getTime();
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  }, []);

  // Hazard Color Logic dynamically linked to hazard severity
  const hazardLevel = Math.min(Math.max(yesterdayHazards, 0), 5);
  const hazardColorTokens = useMemo(() => {
    if (hazardLevel <= 1) return { p: "var(--color-brand-green, #00ff9d)", shadow: "rgba(0, 255, 157, 0.6)", rgb: [0, 255, 157] as [number, number, number] }; 
    if (hazardLevel === 2) return { p: "#eab308", shadow: "rgba(234, 179, 8, 0.6)", rgb: [234, 179, 8] as [number, number, number] }; 
    if (hazardLevel === 3) return { p: "#f97316", shadow: "rgba(249, 115, 22, 0.6)", rgb: [249, 115, 22] as [number, number, number] }; 
    return { p: "var(--color-brand-red, #ef4444)", shadow: "rgba(239, 68, 68, 0.6)", rgb: [239, 68, 68] as [number, number, number] }; 
  }, [hazardLevel]);

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
      
      {/* 1. FIRST LOGIN PASSWORD RESET MODAL */}
      {profile && profile.must_change_password && (
        <FirstLoginPasswordModal 
          userId={profile.id} 
          onPasswordChanged={() => {
            setProfile((prev) => prev ? { ...prev, must_change_password: false } : null);
          }} 
        />
      )}

      {/* 2. MANDATORY EMPLOYEE TERMS OF USE MODAL */}
      {profile && !profile.must_change_password && !profile.terms_accepted_at && (
        <TermsAcceptanceModal
          userId={profile.id}
          onAccepted={() => {
            setProfile((prev) => prev ? { ...prev, terms_accepted_at: new Date().toISOString() } : null);
          }}
        />
      )}

      {/* HEADER BANNER */}
      <motion.header variants={itemVariants} className="mb-8 text-center border border-[var(--color-brand-border)] tactical-card p-6 rounded-sm relative overflow-hidden shadow-lg">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-blue)]" />
        <h1 className="text-3xl sm:text-4xl font-black text-slate-100 uppercase tracking-tighter">
          Welcome, {getDisplayName(profile)}!
        </h1>
        <p className="text-slate-400 text-xs uppercase tracking-[0.25em] font-black mt-2">
          Assigned Site Location: <span className="text-[var(--color-brand-blue)] font-black">[{assignedLocationDisplay}]</span>
        </p>
      </motion.header>

      {/* TELEMETRY METRIC GAUGES */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 mb-12 relative w-full px-2 bg-transparent">
        
        {/* Safe Days - Small Flank */}
        <div className="flex-1 flex justify-center md:justify-start">
          <DashboardGauge 
            value={safeDaysCount} 
            label="Safe Days" 
            primaryColor="var(--color-brand-blue)" 
            shadowColor="rgba(0, 136, 255, 0.6)" 
            rgb={[0, 136, 255]}
            sizeClasses="w-32 h-32"
            valueClasses="text-3xl"
            labelClasses="text-[8px]"
          />
        </div>

        {/* Main Center Metric */}
        <div className="flex-shrink-0 flex justify-center">
          <DashboardGauge 
            value={displayPoints} 
            label="Active Balance" 
            subLabel={`Next Tier: ${DEFAULT_NEXT_GOAL}`}
            primaryColor="var(--color-brand-blue)" 
            shadowColor="rgba(0, 136, 255, 0.6)" 
            rgb={[0, 136, 255]} 
            sizeClasses="w-72 h-72"
            valueClasses="text-7xl"
            labelClasses="text-[10px]"
          />
        </div>

        {/* Hazards - Small Flank */}
        <div className="flex-1 flex justify-center md:justify-end">
          <DashboardGauge 
            value={hazardLevel} 
            label="Hazards" 
            primaryColor={hazardColorTokens.p} 
            shadowColor={hazardColorTokens.shadow} 
            rgb={hazardColorTokens.rgb}
            sizeClasses="w-32 h-32"
            valueClasses="text-3xl"
            labelClasses="text-[8px]"
          />
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
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-border)] group-hover:bg-[var(--color-brand-blue)] transition-colors z-20" />
          <div className="absolute inset-0 z-0 opacity-30 group-hover:opacity-70 transition-opacity duration-500 overflow-hidden">
             <ParticleCloud r={0} g={136} b={255} />
          </div>
          <div className="relative z-10 flex justify-between items-center w-full">
            <div>
              <h3 className="text-base font-black text-slate-100 uppercase tracking-wide">Rewards</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-black mt-1">Access Catalog</p>
            </div>
            <div className="w-8 h-8 border border-[var(--color-brand-border)] flex items-center justify-center bg-black/40 flex-shrink-0 group-hover:border-[var(--color-brand-blue)] transition-colors">
              <div className="w-2 h-2 bg-[var(--color-brand-blue)] transition-all" />
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