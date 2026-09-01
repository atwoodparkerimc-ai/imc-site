"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion, Variants } from "framer-motion";

// --- CENTRAL DATA SERVICE IMPORT ---
import { 
  getManagerMasterData, 
  getInventoryItems,
  getJobLocations,
  UserProfile,
  PointLedgerEntry,
  SafeActRecord,
  SafetyMeetingRecord,
  InventoryItem
} from "@/lib/db/operations";

// --- COMPONENT IMPORTS ---
import RecognitionForm from "./_components/RecognitionForm";
import VelocityChart from "./_components/VelocityChart";
import TelemetryBreakdown from "./_components/TelemetryBreakdown";
import ComplianceTracker from "./_components/ComplianceTracker";
import SafeActTracker from "./_components/SafeActTracker";
import PrizeInventory from "./_components/PrizeInventory";
import FulfillmentBoard from "./_components/FulfillmentBoard";
import DailyAuditSheet from "./_components/DailyAuditSheet";
import HazardControlPanel from "./_components/HazardControlPanel";
import CrewLocationManager from "./_components/CrewLocationManager";
import EmployeeCertManager from "./_components/EmployeeCertManager";
import AddEmployeeModal from "../dashboard/_components/AddEmployeeModal";
import ManagerBriefingSelector from "./_components/ManagerBriefingSelector";

interface DataBucket {
  name: string;
  value: number;
  acts: number;
  meetings: number;
  briefings: number;
  safeActs: number;
  recognitions: number;
  safetyObservation: number;
  teamAssistance: number;
  ppeDiscipline: number;
  processImprovement: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

// --- ANIMATION CONFIGURATIONS ---
const containerVariants: Variants = { 
  hidden: { opacity: 0 }, 
  show: { opacity: 1, transition: { staggerChildren: 0.08 } } 
};

const itemVariants: Variants = { 
  hidden: { opacity: 0, y: 15 }, 
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 15 } } 
};

// Strict 4 Core Recognition Categories
const REWARD_CATEGORIES = [
  "Safety Observation", 
  "Team Assistance", 
  "PPE Discipline", 
  "Process Improvement"
];

// Master Color Palette Assignment Map
const CATEGORY_COLOR_MAP: Record<string, string> = {
  "Safety Observation": "var(--color-metric-observation)",
  "Team Assistance": "var(--color-metric-assistance)",
  "PPE Discipline": "var(--color-metric-ppe)",
  "Process Improvement": "var(--color-metric-process)"
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 shadow-2xl backdrop-blur-md z-50 relative font-mono rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)]">
        <p className="text-slate-300 text-[11px] font-bold uppercase tracking-widest mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p 
            key={`tooltip-line-${index}`} 
            className="text-xs font-bold tabular-nums" 
            style={{ color: entry.color || entry.stroke || 'var(--color-metric-safe-acts)' }}
          >
            {entry.name.toUpperCase()}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// --- TIMEFRAME TRANSFORMERS ---
const filterByTime = <T extends Record<string, any>>(data: T[], tf: string, dateCol: string): T[] => {
  const now = new Date();
  const cutoff = new Date();
  
  if (tf === 'week') {
    cutoff.setDate(now.getDate() - 6);
    cutoff.setHours(0, 0, 0, 0);
  } else if (tf === 'month') {
    cutoff.setDate(now.getDate() - 27);
    cutoff.setHours(0, 0, 0, 0);
  } else if (tf === 'year') {
    cutoff.setFullYear(now.getFullYear() - 1);
  }
  
  return (data || []).filter(d => {
    if (!d || !d[dateCol]) return false;
    const targetDate = new Date(d[dateCol]);
    return !isNaN(targetDate.getTime()) && targetDate >= cutoff;
  });
};

const getBuckets = (tf: string): DataBucket[] => {
  if (tf === 'week') {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const result: DataBucket[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const name = days[d.getDay()];
      result.push({ 
        name, 
        value: 0, 
        acts: 0, 
        meetings: 0, 
        briefings: 0, 
        safeActs: 0, 
        recognitions: 0,
        safetyObservation: 0,
        teamAssistance: 0,
        ppeDiscipline: 0,
        processImprovement: 0
      });
    }
    return result;
  }
  if (tf === 'month') return ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map(name => ({ 
    name, value: 0, acts: 0, meetings: 0, briefings: 0, safeActs: 0, recognitions: 0, safetyObservation: 0, teamAssistance: 0, ppeDiscipline: 0, processImprovement: 0 
  }));
  if (tf === 'year') return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(name => ({ 
    name, value: 0, acts: 0, meetings: 0, briefings: 0, safeActs: 0, recognitions: 0, safetyObservation: 0, teamAssistance: 0, ppeDiscipline: 0, processImprovement: 0 
  }));
  return [];
};

const populateBucket = (
  buckets: DataBucket[], 
  dateString: string, 
  tf: string, 
  field: keyof DataBucket, 
  increment = 1
) => {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return;

  if (tf === 'week') {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = days[d.getDay()];
    const target = buckets.find(b => b.name === dayName);
    if (target && typeof target[field] === 'number') {
      (target[field] as number) += increment;
    }
  } else if (tf === 'month') {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const idx = diffDays <= 7 ? 3 : diffDays <= 14 ? 2 : diffDays <= 21 ? 1 : 0;
    if (buckets[idx] && typeof buckets[idx][field] === 'number') {
      (buckets[idx][field] as number) += increment;
    }
  } else if (tf === 'year') {
    const idx = d.getMonth();
    if (buckets[idx] && typeof buckets[idx][field] === 'number') {
      (buckets[idx][field] as number) += increment;
    }
  }
};

export default function ManagerDashboard() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [activeTab, setActiveTab] = useState<string>("safety"); 
  const [employees, setEmployees] = useState<UserProfile[]>([]); 
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]); 
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [consoleError, setConsoleError] = useState<string | null>(null);

  // Modal Control State
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState<boolean>(false);
  
  // Database States
  const [rawAwards, setRawAwards] = useState<PointLedgerEntry[]>([]);
  const [rawSafeActs, setRawSafeActs] = useState<SafeActRecord[]>([]);
  const [rawMeetings, setRawMeetings] = useState<SafetyMeetingRecord[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [requisitionCount, setRequisitionCount] = useState<number>(0);
  
  // Metrics Filters
  const [tfVelocity, setTfVelocity] = useState<string>('week');
  const [tfCategory, setTfCategory] = useState<string>('month');
  const [tfRhythm, setTfRhythm] = useState<string>('week');
  const [tfTop, setTfTop] = useState<string>('month');
  const [tfComp, setTfComp] = useState<string>('week');
  const [compUser, setCompUser] = useState<string>(''); 

  useEffect(() => {
    async function initDashboard() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/login"); return; }

        setCurrentUserId(user.id);
        setCurrentUserEmail(user.email || null);

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role !== 'manager') { router.push("/dashboard"); return; }

        await fetchMasterData(user.id);
        await fetchInventory();
        await fetchLocations();
      } catch (err) {
        console.error("Dashboard terminal load crash:", err);
        setConsoleError("Critical infrastructure drop parsing role authority tokens.");
      } finally {
        setIsLoading(false);
      }
    }
    initDashboard();
  }, [supabase, router]);

  const fetchMasterData = async (currentUserId: string) => {
    const masterData = await getManagerMasterData(supabase);

    setAllUsers(masterData.allUsers);
    setEmployees(masterData.activeTeam);
    
    if (masterData.allUsers.length > 0 && !compUser) {
      const userExists = masterData.allUsers.some(u => u.id === currentUserId);
      setCompUser(userExists ? currentUserId : masterData.allUsers[0].id);
    }

    setRawAwards(masterData.awards);
    setRawSafeActs(masterData.safeActs);
    setRawMeetings(masterData.safetyMeetings);
    setRequisitionCount(masterData.requisitionCount);
  };

  const fetchInventory = async () => {
    const catalog = await getInventoryItems(supabase);
    setInventory(catalog);
  };

  const fetchLocations = async () => {
    const locs = await getJobLocations(supabase);
    setLocations(locs);
  };

  // --- LOCATION FILTERED TELEMETRY STREAMS ---
  const locationFilteredUsers = useMemo(() => {
    if (selectedLocation === "ALL") return allUsers;
    return allUsers.filter(u => u.location === selectedLocation);
  }, [allUsers, selectedLocation]);

  const locationUserIds = useMemo(() => {
    return new Set(locationFilteredUsers.map(u => u.id));
  }, [locationFilteredUsers]);

  const locationFilteredAwards = useMemo(() => {
    if (selectedLocation === "ALL") return rawAwards;
    return rawAwards.filter(a => locationUserIds.has(a.receiver_id) || locationUserIds.has(a.sender_id));
  }, [rawAwards, locationUserIds, selectedLocation]);

  const locationFilteredSafeActs = useMemo(() => {
    if (selectedLocation === "ALL") return rawSafeActs;
    return rawSafeActs.filter(a => locationUserIds.has(a.reporter_id) || (a.recipient_id && locationUserIds.has(a.recipient_id)));
  }, [rawSafeActs, locationUserIds, selectedLocation]);

  // --- RUNTIME MEMOIZED CALCULATIONS ---
  const velocityData = useMemo(() => {
    const buckets = getBuckets(tfVelocity);

    const filteredBriefings = filterByTime(
      locationFilteredAwards.filter(a => {
        const str = String(a.reason || '').toUpperCase();
        return str.includes('DAILY SAFETY BRIEFING') || str.includes('SAFETY MEETING');
      }), 
      tfVelocity, 
      'created_at'
    );
    const filteredMeetings = filterByTime(rawMeetings, tfVelocity, 'meeting_date');

    filteredBriefings.forEach(b => {
      populateBucket(buckets, b.created_at, tfVelocity, 'briefings', 1);
      populateBucket(buckets, b.created_at, tfVelocity, 'value', 1);
    });

    filteredMeetings.forEach(m => {
      if (m && m.meeting_date) {
        populateBucket(buckets, m.meeting_date, tfVelocity, 'briefings', 1);
        populateBucket(buckets, m.meeting_date, tfVelocity, 'value', 1);
      }
    });

    const filteredActs = filterByTime(locationFilteredSafeActs, tfVelocity, 'created_at');
    filteredActs.forEach(a => {
      populateBucket(buckets, a.created_at, tfVelocity, 'safeActs', 1);
      populateBucket(buckets, a.created_at, tfVelocity, 'value', 1);
    });

    const filteredRecognitions = filterByTime(locationFilteredAwards, tfVelocity, 'created_at').filter(a => {
      const reasonUpper = String(a.reason || '').toUpperCase();
      return !reasonUpper.includes('DAILY SAFETY BRIEFING') && !reasonUpper.includes('REPORTED SAFE ACT');
    });

    filteredRecognitions.forEach(r => {
      const reasonUpper = String(r.reason || '').toUpperCase();
      
      if (reasonUpper.includes('OBSERVATION')) {
        populateBucket(buckets, r.created_at, tfVelocity, 'safetyObservation', 1);
      } else if (reasonUpper.includes('ASSISTANCE') || reasonUpper.includes('HOUSEKEEPING')) {
        populateBucket(buckets, r.created_at, tfVelocity, 'teamAssistance', 1);
      } else if (reasonUpper.includes('PPE') || reasonUpper.includes('DISCIPLINE')) {
        populateBucket(buckets, r.created_at, tfVelocity, 'ppeDiscipline', 1);
      } else if (reasonUpper.includes('PROCESS') || reasonUpper.includes('IMPROVEMENT')) {
        populateBucket(buckets, r.created_at, tfVelocity, 'processImprovement', 1);
      } else {
        populateBucket(buckets, r.created_at, tfVelocity, 'safetyObservation', 1);
      }
      populateBucket(buckets, r.created_at, tfVelocity, 'value', 1);
    });

    return buckets;
  }, [locationFilteredAwards, locationFilteredSafeActs, rawMeetings, tfVelocity]);

  const categoryData = useMemo(() => {
    const filtered = filterByTime(locationFilteredAwards, tfCategory, 'created_at').filter(a => {
      const reasonUpper = String(a.reason || '').toUpperCase();
      return !reasonUpper.includes('DAILY SAFETY BRIEFING') && !reasonUpper.includes('REPORTED SAFE ACT');
    });

    const map: Record<string, number> = {
      "Safety Observation": 0,
      "Team Assistance": 0,
      "PPE Discipline": 0,
      "Process Improvement": 0
    };

    filtered.forEach(a => {
      const reasonUpper = String(a.reason || '').toUpperCase();
      
      if (reasonUpper.includes('OBSERVATION') || reasonUpper.includes('SAFETY OBSERVATION')) {
        map["Safety Observation"] += 1;
      } else if (reasonUpper.includes('ASSISTANCE') || reasonUpper.includes('HOUSEKEEPING') || reasonUpper.includes('TEAM ASSISTANCE')) {
        map["Team Assistance"] += 1;
      } else if (reasonUpper.includes('PPE') || reasonUpper.includes('DISCIPLINE') || reasonUpper.includes('PPE DISCIPLINE')) {
        map["PPE Discipline"] += 1;
      } else if (reasonUpper.includes('PROCESS') || reasonUpper.includes('IMPROVEMENT') || reasonUpper.includes('PROCESS IMPROVEMENT')) {
        map["Process Improvement"] += 1;
      } else {
        map["Safety Observation"] += 1;
      }
    });

    return Object.keys(map)
      .filter(k => map[k] > 0)
      .map(k => ({ 
        name: k, 
        value: map[k],
        color: CATEGORY_COLOR_MAP[k] || "var(--color-metric-observation)"
      }));
  }, [locationFilteredAwards, tfCategory]);

  const rhythmData = useMemo(() => {
    const filteredActs = filterByTime(locationFilteredSafeActs, tfRhythm, 'created_at');
    
    const filteredBriefings = filterByTime(
      locationFilteredAwards.filter(a => String(a.reason || '').toUpperCase().includes('DAILY SAFETY BRIEFING')), 
      tfRhythm, 
      'created_at'
    );
    const filteredMeetings = filterByTime(rawMeetings, tfRhythm, 'meeting_date');

    const buckets = getBuckets(tfRhythm);
    
    filteredActs.forEach(a => { 
      populateBucket(buckets, a.created_at, tfRhythm, 'acts', 1);
    });

    filteredBriefings.forEach(b => {
      populateBucket(buckets, b.created_at, tfRhythm, 'meetings', 1);
    });

    filteredMeetings.forEach(m => {
      if (m && m.meeting_date) {
        populateBucket(buckets, m.meeting_date, tfRhythm, 'meetings', 1);
      }
    });
    
    return buckets;
  }, [locationFilteredSafeActs, locationFilteredAwards, rawMeetings, tfRhythm]);

  const topGeneralContributors = useMemo(() => {
    const timeFiltered = filterByTime(rawAwards, tfTop, 'created_at');
    const map: Record<string, { name: string; points: number }> = {};

    locationFilteredUsers.forEach(u => {
      const displayName = u.nickname || (u as any).full_name || u.first_name || "User";
      map[u.id] = { name: displayName, points: 0 };
    });

    timeFiltered.forEach(award => {
      if (award.amount > 0 && map[award.receiver_id]) {
        map[award.receiver_id].points += award.amount;
      }
    });

    return Object.values(map).sort((a, b) => b.points - a.points).slice(0, 5);
  }, [rawAwards, locationFilteredUsers, tfTop]);

  const topSafeActReceivedContributors = useMemo(() => {
    const filteredActs = filterByTime(locationFilteredSafeActs, tfTop, 'created_at');
    const map: Record<string, { name: string; points: number; count: number }> = {};

    filteredActs.forEach(act => {
      const targetUserId = act.recipient_id || act.reporter_id;
      if (!targetUserId) return;

      const matchedEmp = allUsers.find(p => p.id === targetUserId);
      if (matchedEmp) {
        const displayName = matchedEmp.nickname || (matchedEmp as any).full_name || matchedEmp.first_name || "User";
        if (!map[targetUserId]) {
          map[targetUserId] = { name: displayName, points: 0, count: 0 };
        }
        const actPoints = (act as any).points_awarded || (act as any).award_amount || 10;
        map[targetUserId].points += actPoints;
        map[targetUserId].count += 1;
      }
    });

    return Object.values(map).sort((a, b) => b.points - a.points).slice(0, 5);
  }, [locationFilteredSafeActs, allUsers, tfTop]);

  const topSafeActGiftedContributors = useMemo(() => {
    const filteredActs = filterByTime(locationFilteredSafeActs, tfTop, 'created_at');
    const map: Record<string, { name: string; points: number; count: number }> = {};

    filteredActs.forEach(act => {
      const reporterId = act.reporter_id;
      if (!reporterId) return;

      const matchedEmp = allUsers.find(p => p.id === reporterId);
      if (matchedEmp) {
        const displayName = matchedEmp.nickname || (matchedEmp as any).full_name || matchedEmp.first_name || "User";
        if (!map[reporterId]) {
          map[reporterId] = { name: displayName, points: 0, count: 0 };
        }
        const actPoints = (act as any).points_awarded || (act as any).award_amount || 10;
        map[reporterId].points += actPoints;
        map[reporterId].count += 1;
      }
    });

    return Object.values(map).sort((a, b) => b.points - a.points).slice(0, 5);
  }, [locationFilteredSafeActs, allUsers, tfTop]);

  const complianceData = useMemo(() => {
    if (!compUser) return [];
    
    const filteredActs = Array.isArray(rawSafeActs) 
      ? filterByTime(
          rawSafeActs.filter(a => a && (a.reporter_id === compUser || a.recipient_id === compUser)), 
          tfComp, 
          'created_at'
        )
      : [];
      
    const filteredBriefings = Array.isArray(rawAwards)
      ? filterByTime(
          rawAwards.filter(a => a && a.receiver_id === compUser && String(a.reason || '').toUpperCase().includes('DAILY SAFETY BRIEFING')), 
          tfComp, 
          'created_at'
        )
      : [];

    const filteredMeetings = Array.isArray(rawMeetings)
      ? filterByTime(rawMeetings.filter(m => m && m.manager_id === compUser), tfComp, 'meeting_date')
      : [];
    
    const buckets = getBuckets(tfComp);
    
    filteredActs.forEach(a => { 
      if (a && a.created_at) populateBucket(buckets, a.created_at, tfComp, 'acts', 1);
    }); 
    
    filteredBriefings.forEach(b => { 
      if (b && b.created_at) populateBucket(buckets, b.created_at, tfComp, 'meetings', 1);
    });

    filteredMeetings.forEach(m => { 
      if (m && m.meeting_date) populateBucket(buckets, m.meeting_date, tfComp, 'meetings', 1);
    });
    
    return buckets;
  }, [rawSafeActs, rawAwards, rawMeetings, compUser, tfComp]);

  const globalStats = useMemo(() => {
    const now = new Date();
    const todayLocalStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const safeActsToday = locationFilteredSafeActs.filter(act => {
      if (!act.created_at) return false;
      const actDate = new Date(act.created_at);
      const actLocalStr = `${actDate.getFullYear()}-${String(actDate.getMonth() + 1).padStart(2, '0')}-${String(actDate.getDate()).padStart(2, '0')}`;
      return actLocalStr === todayLocalStr;
    }).length;

    return {
      totalAwarded: locationFilteredAwards.reduce((acc, val) => acc + val.amount, 0),
      safeActsToday: safeActsToday,
      activeMembers: locationFilteredUsers.length,
      requisitions: requisitionCount
    };
  }, [locationFilteredAwards, locationFilteredSafeActs, locationFilteredUsers, requisitionCount]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center px-4 min-h-[100dvh] relative font-mono text-slate-100">
        <div className="w-2.5 h-2.5 animate-pulse mb-3 bg-[var(--color-brand-blue)]" />
        <p className="uppercase tracking-[0.25em] text-xs font-bold text-center text-[var(--color-brand-blue)]">
          Authenticating System Access Terminal...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-3.5 sm:p-8 pt-4 sm:pt-8 pb-28 sm:pb-24 min-h-[100dvh] w-full relative font-mono text-slate-100 select-none">
      {/* TACTICAL BLUEPRINT GRID OVERLAY */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:32px_32px] z-0" />

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="relative z-10">
        
        {/* GLOBAL COMMAND HEADER & NAVIGATION MATRIX */}
        <motion.header variants={itemVariants} className="mb-4 sm:mb-8 print:hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between md:justify-start gap-2.5 sm:gap-4">
              <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-slate-100 uppercase tracking-tighter flex items-center gap-2">
                <span className="w-2 h-2 rounded-none animate-pulse bg-[var(--color-brand-blue)]" />
                Admin Portal
              </h1>
              
              {currentUserEmail?.toLowerCase() === "atwoodparkerimc@gmail.com" && (
                <button
                  type="button"
                  onClick={() => setIsAddEmployeeOpen(true)}
                  className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 text-white font-bold text-xs uppercase tracking-wider hover:bg-white hover:text-black active:bg-slate-200 transition-all cursor-pointer rounded-sm text-center bg-[var(--color-brand-blue)] shadow-[0_0_15px_rgba(0,136,255,0.25)] active:scale-[0.98] touch-manipulation focus:outline-none"
                >
                  + Provision Employee
                </button>
              )}
            </div>
            
            {/* GLOBAL LOCATION SELECTOR */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 border p-2 sm:p-2.5 rounded-sm shadow-md w-full md:w-auto bg-[var(--color-brand-card)] border-[var(--color-brand-border)]">
              <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest pl-1 sm:pl-2">ACTIVE LOCATION:</span>
              <select 
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="text-xs font-bold uppercase text-slate-200 p-2.5 outline-none cursor-pointer w-full sm:w-auto rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] transition-colors min-h-[44px]"
              >
                <option value="ALL" className="bg-[var(--color-brand-card)]">-- ALL LOCATIONS (COMPANY-WIDE) --</option>
                {locations.map(loc => (
                  <option key={loc} value={loc} className="bg-[var(--color-brand-card)]">{loc}</option>
                ))}
              </select>
            </div>
          </div>
          
          {consoleError && (
            <div className="mb-4 p-3 font-mono text-xs uppercase tracking-wider font-bold rounded-sm border bg-amber-500/10 border-amber-500/50 text-[var(--color-metric-observation)]">
              [CRITICAL MODULE FAULT] {consoleError}
            </div>
          )}

          {/* SCROLLABLE MOBILE TAB BAR */}
          <div className="flex gap-2 sm:gap-4 pb-px overflow-x-auto -mx-3.5 px-3.5 sm:mx-0 sm:px-0 border-b border-[var(--color-brand-border)] no-scrollbar">
            {[
              { id: 'safety', label: 'Safety & Hazards' }, 
              { id: 'users', label: 'Manage Users' }, 
              { id: 'telemetry', label: 'Insights' }, 
              { id: 'inventory', label: 'Prize Inventory' }, 
              { id: 'fulfillment', label: 'Order Fulfillment' },
              { id: 'audit', label: 'Daily Roll Call' }
            ].map(tab => (
              <button 
                key={tab.id} 
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[44px] pb-2.5 sm:pb-3 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider sm:tracking-widest transition-all whitespace-nowrap border-b-2 cursor-pointer touch-manipulation active:scale-[0.98] focus:outline-none ${
                  activeTab === tab.id 
                    ? 'border-[var(--color-brand-blue)] text-[var(--color-brand-blue)]' 
                    : 'border-transparent text-slate-400 hover:text-slate-200 active:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.header>

        {/* TAB 1: SAFETY & HAZARDS CONTROL CENTER */}
        <div className={activeTab === 'safety' ? 'block print:hidden space-y-4 sm:space-y-6' : 'hidden'}>
          <HazardControlPanel selectedLocation={selectedLocation} />
          <ManagerBriefingSelector locations={locations} />
          <RecognitionForm 
            employees={allUsers} 
            onAwardSuccess={async () => {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) await fetchMasterData(user.id);
            }} 
            itemVariants={itemVariants} 
          />
        </div>

        {/* TAB 2: MANAGE USERS (CREW LOCATION ON TOP ON MOBILE, NORMAL ORDER ON DESKTOP) */}
        <div className={activeTab === 'users' ? 'flex flex-col md:block print:hidden space-y-4 sm:space-y-6' : 'hidden'}>
          <div className="order-2 md:order-1">
            <EmployeeCertManager 
              supabase={supabase} 
              allUsers={allUsers} 
            />
          </div>

          <div className="order-1 md:order-2">
            <CrewLocationManager
              supabase={supabase}
              allUsers={allUsers}
              locations={locations}
              onLocationUpdated={async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) await fetchMasterData(user.id);
              }}
            />
          </div>
        </div>

        {/* TAB 3: TELEMETRY ENGINE & ANALYTICS */}
        <div className={activeTab === 'telemetry' ? 'block print:hidden space-y-4 sm:space-y-6' : 'hidden'}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
            {[
              { label: "Total Points Awarded", value: globalStats.totalAwarded.toLocaleString(), color: "text-[var(--color-metric-safe-acts)]" },
              { label: "Total Requisitions", value: globalStats.requisitions.toString(), color: "text-[var(--color-brand-blue)]" },
              { label: "Daily Safe Acts", value: globalStats.safeActsToday.toString(), color: "text-[var(--color-metric-meetings)]" },
              { label: "Active Team Members", value: globalStats.activeMembers.toString(), color: "text-slate-100" }
            ].map((stat, i) => (
              <div key={`stat-card-${i}`} className="border p-3 sm:p-5 shadow-xl relative overflow-hidden group rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)]">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-border)] group-hover:bg-[var(--color-brand-blue)] transition-colors duration-300" />
                <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest mb-1 sm:mb-2">{stat.label}</p>
                <p className={`text-xl sm:text-3xl font-black tabular-nums tracking-tighter ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div>
            <VelocityChart 
              velocityData={velocityData} 
              tfVelocity={tfVelocity} 
              setTfVelocity={setTfVelocity} 
              CustomTooltip={CustomTooltip} 
              itemVariants={itemVariants} 
            />
          </div>

          <TelemetryBreakdown 
            categoryData={categoryData} 
            tfCategory={tfCategory} 
            setTfCategory={setTfCategory} 
            rhythmData={rhythmData} 
            tfRhythm={tfRhythm} 
            setTfRhythm={setTfRhythm} 
            topGeneralContributors={topGeneralContributors}
            topSafeActReceivedContributors={topSafeActReceivedContributors}
            topSafeActGiftedContributors={topSafeActGiftedContributors}
            tfTop={tfTop} 
            setTfTop={setTfTop} 
            CustomTooltip={CustomTooltip} 
            itemVariants={itemVariants} 
          />

          <ComplianceTracker 
            complianceData={complianceData} 
            allUsers={allUsers} 
            compUser={compUser} 
            setCompUser={setCompUser} 
            tfComp={tfComp} 
            setTfComp={setTfComp} 
            CustomTooltip={CustomTooltip} 
            itemVariants={itemVariants} 
          />

          <SafeActTracker 
            rawSafeActs={locationFilteredSafeActs}
            rawAwards={locationFilteredAwards}
            allUsers={locationFilteredUsers}
            CustomTooltip={CustomTooltip}
            itemVariants={itemVariants}
          />
        </div>

        {/* TAB 4: INVENTORY LOGISTICS HUB */}
        <div className={activeTab === 'inventory' ? 'block print:hidden' : 'hidden'}>
          <PrizeInventory 
            inventory={inventory} 
            fetchInventory={fetchInventory} 
            itemVariants={itemVariants} 
          />
        </div>

        {/* TAB 5: ORDER FULFILLMENT BOARD */}
        <div className={activeTab === 'fulfillment' ? 'block print:hidden' : 'hidden'}>
          <FulfillmentBoard 
            managers={allUsers.filter(u => u.role === 'manager')}
            itemVariants={itemVariants} 
          />
        </div>

        {/* TAB 6: CLIPBOARD AUDIT LOG SHEET */}
        <div className={activeTab === 'audit' ? 'block' : 'hidden print:block'}>
          <DailyAuditSheet 
            employees={employees} 
            itemVariants={itemVariants} 
          />
        </div>

        {/* PROVISION EMPLOYEE MODAL */}
        <AddEmployeeModal
          isOpen={isAddEmployeeOpen}
          onClose={() => setIsAddEmployeeOpen(false)}
          onSuccess={async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) await fetchMasterData(user.id);
          }}
        />

      </motion.div>
    </div>
  );
}