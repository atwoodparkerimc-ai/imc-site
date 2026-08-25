"use client";

import { useMemo, useState } from "react";
import { ComposedChart, PieChart, Pie, Cell, Bar, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, Variants } from "framer-motion";

export interface CategoryDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface RhythmDataPoint {
  name: string;
  value: number;
  acts: number;
  meetings: number;
}

export interface ContributorRecord {
  name: string;
  points: number;
  count?: number;
}

type LeaderboardMode = "GENERAL" | "SAFE_ACT_RECEIVED" | "SAFE_ACT_GIFTED";

interface TelemetryBreakdownProps {
  categoryData?: CategoryDataPoint[];
  tfCategory: string;
  setTfCategory: (tf: string) => void;
  rhythmData?: RhythmDataPoint[];
  tfRhythm: string;
  setTfRhythm: (tf: string) => void;
  topGeneralContributors?: ContributorRecord[];
  topSafeActReceivedContributors?: ContributorRecord[];
  topSafeActGiftedContributors?: ContributorRecord[];
  tfTop: string;
  setTfTop: (tf: string) => void;
  CustomTooltip: React.ComponentType<any>;
  itemVariants: Variants;
}

// Solid Hex Fallback Palette to ensure SVG Pie sector paths render 100% reliably
const PALETTE = [
  "#eab308", // Safety Observation (Yellow)
  "#f97316", // Team Assistance (Orange)
  "#0088ff", // PPE Discipline (Blue)
  "#a855f7", // Process Improvement (Purple)
  "#10b981", // Meetings (Green)
  "#06b6d4", // Safe Acts (Cyan)
];

function getSliceColor(entry: CategoryDataPoint, index: number): string {
  if (entry?.color && entry.color.startsWith("#")) {
    return entry.color;
  }
  
  const upper = String(entry?.name || "").toUpperCase();
  if (upper.includes("OBSERVATION")) return "#eab308";
  if (upper.includes("ASSISTANCE") || upper.includes("TEAM")) return "#f97316";
  if (upper.includes("PPE")) return "#0088ff";
  if (upper.includes("PROCESS") || upper.includes("IMPROVEMENT")) return "#a855f7";
  if (upper.includes("MEETING")) return "#10b981";
  
  return PALETTE[index % PALETTE.length];
}

export default function TelemetryBreakdown({
  categoryData = [],
  tfCategory,
  setTfCategory,
  rhythmData = [],
  tfRhythm,
  setTfRhythm,
  topGeneralContributors = [],
  topSafeActReceivedContributors = [],
  topSafeActGiftedContributors = [],
  tfTop,
  setTfTop,
  CustomTooltip,
  itemVariants
}: TelemetryBreakdownProps) {

  const [leaderboardMode, setLeaderboardMode] = useState<LeaderboardMode>("GENERAL");

  const totalCategoryVolume = useMemo(() => {
    return (categoryData || []).reduce((acc, curr) => acc + (curr?.value || 0), 0);
  }, [categoryData]);

  const rhythmTotals = useMemo(() => {
    return (rhythmData || []).reduce(
      (acc, curr) => ({
        acts: acc.acts + (curr?.acts || 0),
        meetings: acc.meetings + (curr?.meetings || 0),
      }),
      { acts: 0, meetings: 0 }
    );
  }, [rhythmData]);

  const hasRhythmData = (rhythmData || []).some(t => (t?.acts || 0) > 0 || (t?.meetings || 0) > 0);

  const activeLeaderboardData = useMemo(() => {
    if (leaderboardMode === "SAFE_ACT_RECEIVED") return topSafeActReceivedContributors || [];
    if (leaderboardMode === "SAFE_ACT_GIFTED") return topSafeActGiftedContributors || [];
    return topGeneralContributors || [];
  }, [leaderboardMode, topGeneralContributors, topSafeActReceivedContributors, topSafeActGiftedContributors]);

  return (
    <div className="space-y-6 mb-6 font-mono text-slate-100">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Category Distribution Module */}
        <motion.div 
          variants={itemVariants} 
          className="border p-4 sm:p-6 shadow-2xl flex flex-col relative overflow-hidden group rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)]"
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-border)] group-hover:bg-[var(--color-brand-blue)] transition-colors duration-300" />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 border-b border-[var(--color-brand-border)] pb-4">
            <div>
              <h2 className="text-slate-100 font-black uppercase tracking-widest text-sm sm:text-base flex items-center gap-2">
                <span className="w-2 h-2 bg-[var(--color-brand-blue)] animate-pulse rounded-none" />
                Category Dist
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Incident Types Filed</p>
            </div>
            <div className="relative w-full sm:w-auto">
              <select 
                value={tfCategory} 
                onChange={(e) => setTfCategory(e.target.value)} 
                className="py-2 px-3 pr-8 text-xs text-slate-200 uppercase font-bold outline-none cursor-pointer w-full sm:w-auto appearance-none rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] transition-colors"
              >
                <option value="week" className="bg-[var(--color-brand-card)]">1 Week</option>
                <option value="month" className="bg-[var(--color-brand-card)]">1 Month</option>
                <option value="year" className="bg-[var(--color-brand-card)]">1 Year</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-between min-h-[250px]">
            {categoryData && categoryData.length > 0 ? (
              <>
                <div className="relative h-[160px] w-full flex items-center justify-center">
                  <div className="absolute flex flex-col items-center justify-center text-center z-10 pointer-events-none mt-[-4px]">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">TOTAL</span>
                    <span className="text-2xl font-black text-[var(--color-metric-safe-acts)] tabular-nums tracking-tighter">{totalCategoryVolume}</span>
                  </div>
                  
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={categoryData} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={50} 
                        outerRadius={65} 
                        paddingAngle={4} 
                        dataKey="value" 
                        stroke="#0f172a"
                        strokeWidth={2}
                        isAnimationActive={false}
                      >
                        {categoryData.map((entry, index) => {
                          const fillColor = getSliceColor(entry, index);
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={fillColor} 
                            />
                          );
                        })}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-x-4 gap-y-2 border-t border-[var(--color-brand-border)] pt-4 text-xs font-bold">
                  {categoryData.map((entry, index) => {
                    const assignedColor = getSliceColor(entry, index);
                    return (
                      <div key={`legend-${index}`} className="flex items-center gap-2 min-w-0">
                        <span 
                          className="w-2.5 h-2.5 rounded-none flex-shrink-0" 
                          style={{ backgroundColor: assignedColor }}
                        />
                        <span className="text-slate-200 uppercase truncate tracking-wide flex-1 text-xs font-bold">
                          {entry.name}
                        </span>
                        <span className="text-[var(--color-metric-safe-acts)] font-black tabular-nums ml-1 text-xs">
                          ({entry.value})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest border border-dashed border-[var(--color-brand-border)] bg-[var(--color-brand-bg)]/50 text-center p-4 rounded-sm">
                [ NO DISTRIBUTION DATA ]
              </div>
            )}
          </div>
        </motion.div>

        {/* Reporting Rhythm Module */}
        <motion.div 
          variants={itemVariants} 
          className="border p-4 sm:p-6 shadow-2xl flex flex-col relative overflow-hidden group rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)]"
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-border)] group-hover:bg-[var(--color-brand-blue)] transition-colors duration-300" />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-[var(--color-brand-border)] pb-4">
            <div>
              <h2 className="text-slate-100 font-black uppercase tracking-widest text-sm sm:text-base flex items-center gap-2">
                <span className="w-2 h-2 bg-[var(--color-brand-blue)] animate-pulse rounded-none" />
                Reporting Rhythm
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Dual Telemetry Streams</p>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              {hasRhythmData && (
                <div className="flex items-center gap-3 text-xs font-bold border-r border-[var(--color-brand-border)] pr-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-none bg-[var(--color-metric-safe-acts)]" />
                    <span className="font-black tabular-nums text-[var(--color-metric-safe-acts)]">{rhythmTotals.acts} <span className="text-slate-100 font-bold">ACTS</span></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-[3px] bg-[var(--color-metric-meetings)]" />
                    <span className="font-black tabular-nums text-[var(--color-metric-meetings)]">{rhythmTotals.meetings} <span className="text-slate-100 font-bold">MEETINGS</span></span>
                  </div>
                </div>
              )}
              
              <div className="relative">
                <select 
                  value={tfRhythm} 
                  onChange={(e) => setTfRhythm(e.target.value)} 
                  className="py-2 px-3 pr-8 text-xs text-slate-200 uppercase font-bold outline-none cursor-pointer appearance-none rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] transition-colors"
                >
                  <option value="week" className="bg-[var(--color-brand-card)]">1 Week</option>
                  <option value="month" className="bg-[var(--color-brand-card)]">1 Month</option>
                  <option value="year" className="bg-[var(--color-brand-card)]">1 Year</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full h-[250px] min-h-[250px] relative">
            {hasRhythmData ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={rhythmData} syncId="commandCenterMetrics" margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="glowSafeActsRhythm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-metric-safe-acts)" stopOpacity={0.35}/>
                      <stop offset="100%" stopColor="var(--color-metric-safe-acts)" stopOpacity={0.00}/>
                    </linearGradient>

                    <linearGradient id="glowMeetingsRhythm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-metric-meetings)" stopOpacity={0.25}/>
                      <stop offset="100%" stopColor="var(--color-metric-meetings)" stopOpacity={0.00}/>
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
                    tickFormatter={(val) => String(val).toUpperCase()}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    fontFamily="ui-monospace, monospace"
                    fontWeight="700"
                    tickLine={false} 
                    axisLine={false} 
                    allowDecimals={false}
                    domain={[0, 'auto']}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-brand-bg)', opacity: 0.8 }} />
                  
                  <Bar name="Safe Acts" dataKey="acts" fill="var(--color-metric-safe-acts)" radius={[2, 2, 0, 0]} maxBarSize={20} isAnimationActive={false} />
                  
                  <Area
                    type="monotone"
                    name="Meetings"
                    dataKey="meetings"
                    stroke="var(--color-metric-meetings)"
                    strokeWidth={2.5}
                    fill="url(#glowMeetingsRhythm)"
                    isAnimationActive={false}
                    activeDot={{ r: 4, stroke: 'var(--color-brand-bg)', strokeWidth: 1.5, fill: 'var(--color-metric-meetings)' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest border border-dashed border-[var(--color-brand-border)] bg-[var(--color-brand-bg)]/50 text-center p-4 rounded-sm">
                [ NO RHYTHM ENTRIES ]
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Multi-Mode Leaderboard Box */}
      <motion.div 
        variants={itemVariants} 
        className="border p-4 sm:p-6 shadow-2xl flex flex-col relative overflow-hidden group rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)]"
      >
        <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-border)] group-hover:bg-[var(--color-brand-blue)] transition-colors duration-300" />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-[var(--color-brand-border)] pb-4">
          <div>
            <h2 className="text-slate-100 font-black uppercase tracking-widest text-sm sm:text-base flex items-center gap-2">
              <span className="w-2 h-2 bg-[var(--color-brand-blue)] rounded-none animate-pulse" />
              {leaderboardMode === "GENERAL" && "All Points Leaders"}
              {leaderboardMode === "SAFE_ACT_RECEIVED" && "Safe Act Points Received"}
              {leaderboardMode === "SAFE_ACT_GIFTED" && "Safe Act Points Awarded / Submitted"}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              {leaderboardMode === "GENERAL" && "Includes All Entry Points Across All Users (Briefings + Safe Acts + Awards)"}
              {leaderboardMode === "SAFE_ACT_RECEIVED" && "Points Awarded To Users From Safe Acts"}
              {leaderboardMode === "SAFE_ACT_GIFTED" && "Points Granted / Submitted By Users From Safe Acts"}
            </p>
          </div>

          <div className="flex flex-col xs:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <select
                value={leaderboardMode}
                onChange={(e) => setLeaderboardMode(e.target.value as LeaderboardMode)}
                className="py-2.5 px-3 pr-8 text-xs font-bold uppercase text-slate-100 outline-none cursor-pointer w-full sm:w-auto appearance-none rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] transition-colors"
              >
                <option value="GENERAL" className="bg-[var(--color-brand-card)]">ALL POINTS LEADERS</option>
                <option value="SAFE_ACT_RECEIVED" className="bg-[var(--color-brand-card)]">SAFE ACT: POINTS RECEIVED</option>
                <option value="SAFE_ACT_GIFTED" className="bg-[var(--color-brand-card)]">SAFE ACT: POINTS AWARDED / SUBMITTED</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>

            <div className="relative">
              <select 
                value={tfTop} 
                onChange={(e) => setTfTop(e.target.value)} 
                className="py-2.5 px-3 pr-8 text-xs text-slate-200 uppercase font-bold outline-none cursor-pointer appearance-none rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] transition-colors"
              >
                <option value="week" className="bg-[var(--color-brand-card)]">1 Week</option>
                <option value="month" className="bg-[var(--color-brand-card)]">1 Month</option>
                <option value="year" className="bg-[var(--color-brand-card)]">1 Year</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col gap-2.5">
          {activeLeaderboardData.length > 0 ? (
            activeLeaderboardData.map((user, i) => (
              <div 
                key={`leaderboard-${i}`} 
                className="flex items-center justify-between p-3 border transition-colors duration-150 rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] hover:border-[var(--color-brand-blue)]/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-sm border flex items-center justify-center text-xs font-black select-none flex-shrink-0 bg-[var(--color-brand-card)] border-[var(--color-brand-border)] text-[var(--color-brand-blue)]">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-100 uppercase truncate">{user.name}</p>
                    {user.count !== undefined && (
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                        <span className="font-bold text-[var(--color-metric-meetings)]">{user.count}</span> {user.count === 1 ? "Act" : "Acts"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <p className="text-sm font-black tabular-nums text-[var(--color-metric-meetings)]">
                    {user.points} <span className="text-[10px] text-slate-400 font-bold tracking-tight">PTS</span>
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest border border-dashed border-[var(--color-brand-border)] bg-[var(--color-brand-bg)]/50 text-center p-4 rounded-sm">
              [ NO LEADERBOARD DATA FOUND FOR SELECTED MODE ]
            </div>
          )}
        </div>
      </motion.div>
      
    </div>
  );
}