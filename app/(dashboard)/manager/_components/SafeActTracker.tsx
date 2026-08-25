"use client";

import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion, Variants } from "framer-motion";
import { SafeActRecord, PointLedgerEntry, UserProfile } from "@/lib/db/operations";

interface SafeActTrackerProps {
  rawSafeActs: SafeActRecord[];
  rawAwards: PointLedgerEntry[];
  allUsers: UserProfile[];
  CustomTooltip: React.ComponentType<any>;
  itemVariants: Variants;
}

export default function SafeActTracker({
  rawSafeActs = [],
  rawAwards = [],
  allUsers = [],
  CustomTooltip,
  itemVariants
}: SafeActTrackerProps) {
  const [selectedUser, setSelectedUser] = useState<string>("ALL");
  const [timeframe, setTimeframe] = useState<string>("month");
  const [logTimeframe, setLogTimeframe] = useState<string>("month");
  const [showFullHistory, setShowFullHistory] = useState<boolean>(false);

  // --- TIMEFRAME FILTERING ENGINE (GRAPH) ---
  const filteredActs = useMemo(() => {
    const now = new Date();
    const cutoff = new Date();

    if (timeframe === "week") {
      cutoff.setDate(now.getDate() - 6);
      cutoff.setHours(0, 0, 0, 0);
    } else if (timeframe === "month") {
      cutoff.setDate(now.getDate() - 28);
      cutoff.setHours(0, 0, 0, 0);
    } else if (timeframe === "year") {
      cutoff.setFullYear(now.getFullYear() - 1);
    }

    return (rawSafeActs || []).filter((act) => {
      if (!act.created_at) return false;
      if (timeframe === "all") return true;
      const actDate = new Date(act.created_at);
      return !isNaN(actDate.getTime()) && actDate >= cutoff;
    });
  }, [rawSafeActs, timeframe]);

  // --- TIMEFRAME FILTERING ENGINE (TRANSACTION LOG) ---
  const logActsFiltered = useMemo(() => {
    const now = new Date();
    const cutoff = new Date();

    if (logTimeframe === "week") {
      cutoff.setDate(now.getDate() - 6);
      cutoff.setHours(0, 0, 0, 0);
    } else if (logTimeframe === "month") {
      cutoff.setDate(now.getDate() - 28);
      cutoff.setHours(0, 0, 0, 0);
    } else if (logTimeframe === "year") {
      cutoff.setFullYear(now.getFullYear() - 1);
    }

    return (rawSafeActs || []).filter((act) => {
      if (!act.created_at) return false;
      if (logTimeframe === "all") return true;
      const actDate = new Date(act.created_at);
      return !isNaN(actDate.getTime()) && actDate >= cutoff;
    });
  }, [rawSafeActs, logTimeframe]);

  // --- USER FILTERED & DATE-SORTED LOG TRANSACTIONS ---
  const filteredLog = useMemo(() => {
    const userFiltered = logActsFiltered.filter((act) => {
      if (selectedUser === "ALL") return true;
      return act.reporter_id === selectedUser || act.recipient_id === selectedUser;
    });

    return userFiltered.sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });
  }, [logActsFiltered, selectedUser]);

  const displayedLog = useMemo(() => {
    if (showFullHistory) return filteredLog;
    return filteredLog.slice(0, 6);
  }, [filteredLog, showFullHistory]);

  // --- CHART BUCKET GENERATOR ---
  const chartData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const now = new Date();
    const buckets: { name: string; reported: number; received: number }[] = [];

    if (timeframe === "week") {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        buckets.push({ name: days[d.getDay()], reported: 0, received: 0 });
      }
    } else if (timeframe === "month") {
      ["Week 1", "Week 2", "Week 3", "Week 4"].forEach((name) =>
        buckets.push({ name, reported: 0, received: 0 })
      );
    } else if (timeframe === "year" || timeframe === "all") {
      ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].forEach(
        (name) => buckets.push({ name, reported: 0, received: 0 })
      );
    }

    filteredActs.forEach((act) => {
      const d = new Date(act.created_at);
      if (isNaN(d.getTime())) return;

      let idx = 0;
      if (timeframe === "week") {
        const dayName = days[d.getDay()];
        const target = buckets.find((b) => b.name === dayName);
        if (target) {
          if (selectedUser === "ALL" || act.reporter_id === selectedUser) target.reported += 1;
          if (selectedUser === "ALL" || act.recipient_id === selectedUser) target.received += 1;
        }
        return;
      } else if (timeframe === "month") {
        const dateNum = d.getDate();
        idx = dateNum <= 7 ? 0 : dateNum <= 14 ? 1 : dateNum <= 21 ? 2 : 3;
      } else {
        idx = d.getMonth();
      }

      if (buckets[idx]) {
        if (selectedUser === "ALL" || act.reporter_id === selectedUser) buckets[idx].reported += 1;
        if (selectedUser === "ALL" || act.recipient_id === selectedUser) buckets[idx].received += 1;
      }
    });

    return buckets;
  }, [filteredActs, timeframe, selectedUser]);

  const stats = useMemo(() => {
    const totalActs = filteredLog.length;
    const totalPointsAwarded = totalActs * 15;
    return { totalActs, totalPointsAwarded };
  }, [filteredLog]);

  const getUserName = (id?: string) => {
    if (!id) return "N/A";
    const u = (allUsers || []).find((user) => user.id === id);
    return u ? u.nickname || u.first_name : "Unknown User";
  };

  return (
    <motion.div variants={itemVariants} className="space-y-6 font-mono text-slate-100">
      
      {/* HEADER & CONTROL MATRIX */}
      <div className="border p-4 sm:p-6 shadow-2xl relative overflow-hidden group rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)]">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-border)] group-hover:bg-[var(--color-brand-blue)] transition-colors duration-300" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 border-b border-[var(--color-brand-border)] pb-4">
          <div>
            <h2 className="text-slate-100 font-black uppercase tracking-widest text-sm sm:text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-none bg-[var(--color-brand-blue)] animate-pulse" />
              Safe Act Peer Recognition Audit
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Cross-User Peer Award Telemetry & Transaction Records
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex flex-col flex-1 sm:flex-initial">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Filter Employee
              </span>
              <div className="relative">
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="py-2 px-3 pr-8 text-xs text-slate-200 uppercase font-bold outline-none cursor-pointer w-full sm:w-auto appearance-none rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] transition-colors truncate"
                >
                  <option value="ALL" className="bg-[var(--color-brand-card)] text-slate-200">-- ALL TEAM MEMBERS --</option>
                  {(allUsers || []).map((emp) => (
                    <option key={emp.id} value={emp.id} className="bg-[var(--color-brand-card)] text-slate-200">
                      {emp.nickname || emp.first_name} {emp.role === "manager" ? "(Manager)" : ""}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col flex-1 sm:flex-initial">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Timeframe
              </span>
              <div className="relative">
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="py-2 px-3 pr-8 text-xs text-slate-200 uppercase font-bold outline-none cursor-pointer w-full sm:w-auto appearance-none rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] transition-colors"
                >
                  <option value="week" className="bg-[var(--color-brand-card)]">1 Week</option>
                  <option value="month" className="bg-[var(--color-brand-card)]">1 Month</option>
                  <option value="year" className="bg-[var(--color-brand-card)]">1 Year</option>
                  <option value="all" className="bg-[var(--color-brand-card)]">All Time</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SUMMARY STATS BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="p-3 rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)]">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Total Safe Acts</span>
            <span className="text-lg sm:text-xl font-black tabular-nums text-[var(--color-metric-safe-acts)]">{stats.totalActs}</span>
          </div>
          <div className="p-3 rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)]">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Points Generated</span>
            <span className="text-lg sm:text-xl font-black tabular-nums text-[var(--color-metric-safe-acts)]">+{stats.totalPointsAwarded} PTS</span>
          </div>
          <div className="p-3 rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)]">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Active Filter</span>
            <span className="text-xs font-bold text-slate-200 truncate block uppercase">
              {selectedUser === "ALL" ? "All Staff" : getUserName(selectedUser)}
            </span>
          </div>
          <div className="p-3 rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)]">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Time Span</span>
            <span className="text-xs font-bold uppercase block text-[var(--color-metric-safe-acts)]">
              {timeframe.toUpperCase()}
            </span>
          </div>
        </div>

        {/* GRAPH CANVAS WITH VIBRANT SWATCH STREAMS */}
        <div className="w-full h-[240px] sm:h-[280px] min-h-[240px] relative">
          {chartData.some((d) => d.reported > 0 || d.received > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 15, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="glowReportedActs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-metric-safe-acts)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-metric-safe-acts)" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="glowReceivedActs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-metric-observation)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-metric-observation)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-brand-border)" strokeOpacity={0.5} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  fontFamily="ui-monospace, monospace" 
                  fontWeight="700"
                  tickLine={false} 
                  axisLine={false} 
                  dy={10} 
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  fontFamily="ui-monospace, monospace" 
                  fontWeight="700"
                  tickLine={false} 
                  axisLine={false} 
                  allowDecimals={false} 
                  domain={[0, "auto"]} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ 
                    fontSize: "11px", 
                    fontWeight: "800", 
                    textTransform: "uppercase", 
                    color: "#f8fafc", 
                    paddingTop: "12px" 
                  }} 
                />

                <Area
                  type="monotone"
                  name="Acts Reported (Given)"
                  dataKey="reported"
                  stroke="var(--color-metric-safe-acts)"
                  strokeWidth={2.5}
                  fill="url(#glowReportedActs)"
                  isAnimationActive={false}
                  activeDot={{ r: 5, fill: "var(--color-metric-safe-acts)" }}
                />
                <Area
                  type="monotone"
                  name="Acts Received"
                  dataKey="received"
                  stroke="var(--color-metric-observation)"
                  strokeWidth={2.5}
                  strokeDasharray="3 3"
                  fill="url(#glowReceivedActs)"
                  isAnimationActive={false}
                  activeDot={{ r: 5, fill: "var(--color-metric-observation)" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest border border-dashed border-[var(--color-brand-border)] bg-[var(--color-brand-bg)]/50 text-center p-4 rounded-sm">
              [ NO SAFE ACT DATA FOUND FOR SELECTED SELECTION ]
            </div>
          )}
        </div>
      </div>

      {/* TRANSACTION LOG */}
      <div className="border p-4 sm:p-6 shadow-2xl relative overflow-hidden group rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)]">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-border)] group-hover:bg-[var(--color-brand-blue)] transition-colors duration-300" />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-[var(--color-brand-border)]">
          <div>
            <h3 className="text-slate-100 font-black uppercase tracking-widest text-sm sm:text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-none animate-pulse bg-[var(--color-brand-blue)]" />
              Transaction Log & Description History
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Verifiable Peer Recognition Audit Trail
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs font-bold text-slate-400 uppercase hidden md:inline">
              Showing {displayedLog.length} of {filteredLog.length} Records
            </span>

            <div className="relative">
              <select
                value={logTimeframe}
                onChange={(e) => setLogTimeframe(e.target.value)}
                className="py-2 px-3 pr-8 text-xs text-slate-200 uppercase font-bold outline-none cursor-pointer appearance-none rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] transition-colors"
              >
                <option value="week" className="bg-[var(--color-brand-card)]">1 Week</option>
                <option value="month" className="bg-[var(--color-brand-card)]">1 Month</option>
                <option value="year" className="bg-[var(--color-brand-card)]">1 Year</option>
                <option value="all" className="bg-[var(--color-brand-card)]">All Time</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[340px]">
            <thead>
              <tr className="border-b text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-[var(--color-brand-bg)] border-[var(--color-brand-border)]">
                <th className="p-3 hidden md:table-cell">Timestamp</th>
                <th className="p-3">Reporter</th>
                <th className="p-3">Recipient</th>
                <th className="p-3">Observation Details</th>
                <th className="p-3 text-right hidden sm:table-cell">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-brand-border)]">
              {displayedLog.length > 0 ? (
                displayedLog.map((act) => (
                  <tr key={act.id} className="transition-colors hover:bg-[var(--color-brand-bg)]/50">
                    <td className="p-3 text-slate-400 whitespace-nowrap text-xs font-bold tabular-nums hidden md:table-cell">
                      {act.created_at ? new Date(act.created_at).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="p-3 font-bold uppercase whitespace-nowrap text-xs text-[var(--color-metric-meetings)]">
                      {getUserName(act.reporter_id)}
                    </td>
                    <td className="p-3 font-bold uppercase whitespace-nowrap text-xs text-[var(--color-metric-ppe)]">
                      {getUserName(act.recipient_id)}
                    </td>
                    <td className="p-3 text-slate-200 max-w-xs md:max-w-md break-words text-xs font-medium">
                      {act.reason || (act as any).description || "[ No Description Provided ]"}
                    </td>
                    <td className="p-3 text-right font-bold whitespace-nowrap text-xs tabular-nums hidden sm:table-cell text-[var(--color-metric-safe-acts)]">
                      +10 / +5 PTS
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 uppercase text-xs font-bold tracking-widest">
                    [ NO SAFE ACT TRANSACTIONS RECORDED IN SELECTED TIMEFRAME ]
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredLog.length > 6 && (
          <div className="mt-4 pt-3 border-t flex justify-center border-[var(--color-brand-border)]">
            <button
              onClick={() => setShowFullHistory(!showFullHistory)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase transition-all cursor-pointer rounded-sm shadow-md border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] text-[var(--color-brand-blue)] hover:text-white hover:border-[var(--color-brand-blue)]"
            >
              <span>
                {showFullHistory
                  ? "[ COLLAPSE TO RECENT 6 RECORDS ]"
                  : `[ SHOW FULL HISTORY (${filteredLog.length} TOTAL RECORDS) ]`}
              </span>
              <span className={`text-xs transition-transform duration-200 ${showFullHistory ? "rotate-180" : "rotate-0"}`}>
                ▼
              </span>
            </button>
          </div>
        )}
      </div>

    </motion.div>
  );
}

