"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion, Variants } from "framer-motion";

export interface VelocityDataPoint {
  name: string;
  briefings: number;
  safeActs: number;
  safetyObservation: number;
  teamAssistance: number;
  ppeDiscipline: number;
  processImprovement: number;
  value: number;
}

interface VelocityChartProps {
  velocityData: VelocityDataPoint[];
  tfVelocity: string;
  setTfVelocity: (tf: string) => void;
  CustomTooltip: React.ComponentType<any>;
  itemVariants: Variants;
}

export default function VelocityChart({ 
  velocityData = [], 
  tfVelocity, 
  setTfVelocity, 
  CustomTooltip, 
  itemVariants 
}: VelocityChartProps) {
  
  const metrics = useMemo(() => {
    if (!velocityData || velocityData.length === 0) return { total: 0, today: 0 };
    
    const total = velocityData.reduce((acc, curr) => acc + (curr?.value || 0), 0);
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayName = days[new Date().getDay()];
    const todayBucket = velocityData.find(d => d.name.toUpperCase() === todayName.toUpperCase());
    const today = todayBucket ? todayBucket.value : 0;

    return { total, today };
  }, [velocityData]);

  const hasData = (velocityData || []).some(d => (d?.value || 0) > 0);

  return (
    <motion.div 
      variants={itemVariants} 
      className="xl:col-span-2 border p-4 sm:p-6 shadow-2xl flex flex-col relative overflow-hidden group font-mono text-slate-100 rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)]"
    >
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-blue)]" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-[var(--color-brand-border)] pb-4">
        <div>
          <h2 className="text-slate-100 font-black uppercase tracking-widest text-sm sm:text-base flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-[var(--color-brand-blue)] animate-pulse rounded-none" />
            Safety Engagement Velocity Breakdown
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            Operational Activity Stream (All 6 Primary Categories)
          </p>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 self-stretch sm:self-auto justify-between sm:justify-start w-full sm:w-auto">
          {hasData && (
            <div className="flex gap-3 sm:gap-4 border-r border-[var(--color-brand-border)] pr-3 sm:pr-4 text-xs font-bold">
              <div>
                <span className="text-slate-400 uppercase tracking-wider block text-[10px]">TIMEFRAME TOTAL:</span>
                <span className="text-slate-100 font-black text-xs sm:text-sm tabular-nums">{metrics.total}</span>
              </div>
              {tfVelocity === 'week' && (
                <div>
                  <span className="text-slate-400 uppercase tracking-wider block text-[10px]">TODAY:</span>
                  <span className="font-black text-xs sm:text-sm tabular-nums text-[var(--color-metric-meetings)]">
                    {metrics.today}
                  </span>
                </div>
              )}
            </div>
          )}
          
          <div className="relative">
            <select 
              value={tfVelocity} 
              onChange={(e) => setTfVelocity(e.target.value)} 
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

      {/* Main Chart Canvas Area */}
      <div className="w-full h-[240px] sm:h-[280px] min-h-[240px] relative">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={velocityData} 
              margin={{ top: 15, right: 0, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="glowMeetings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-metric-meetings)" stopOpacity={0.35}/>
                  <stop offset="100%" stopColor="var(--color-metric-meetings)" stopOpacity={0.00}/>
                </linearGradient>

                <linearGradient id="glowPPE" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-metric-ppe)" stopOpacity={0.35}/>
                  <stop offset="100%" stopColor="var(--color-metric-ppe)" stopOpacity={0.00}/>
                </linearGradient>

                <linearGradient id="glowImprovement" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-metric-process)" stopOpacity={0.35}/>
                  <stop offset="100%" stopColor="var(--color-metric-process)" stopOpacity={0.00}/>
                </linearGradient>

                <linearGradient id="glowSafeActs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-metric-safe-acts)" stopOpacity={0.35}/>
                  <stop offset="100%" stopColor="var(--color-metric-safe-acts)" stopOpacity={0.00}/>
                </linearGradient>

                <linearGradient id="glowObservation" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-metric-observation)" stopOpacity={0.35}/>
                  <stop offset="100%" stopColor="var(--color-metric-observation)" stopOpacity={0.00}/>
                </linearGradient>

                <linearGradient id="glowAssistance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-metric-assistance)" stopOpacity={0.35}/>
                  <stop offset="100%" stopColor="var(--color-metric-assistance)" stopOpacity={0.00}/>
                </linearGradient>
              </defs>

              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="var(--color-brand-border)" 
                strokeOpacity={0.5} 
                vertical={false} 
              />
              
              <XAxis 
                dataKey="name" 
                stroke="rgb(148, 163, 184)" 
                fontSize={10} 
                fontFamily="ui-monospace, monospace"
                fontWeight="700"
                tickLine={false} 
                axisLine={false} 
                dy={10} 
                tickFormatter={(val) => String(val).toUpperCase()}
              />
              
              <YAxis 
                stroke="rgb(148, 163, 184)" 
                fontSize={10} 
                fontFamily="ui-monospace, monospace"
                fontWeight="700"
                tickLine={false} 
                axisLine={false} 
                allowDecimals={false}
                domain={[0, 'auto']}
              />
              
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ 
                  fontSize: '11px', 
                  fontWeight: '800', 
                  textTransform: 'uppercase', 
                  color: 'rgb(248, 250, 252)', 
                  paddingTop: '12px' 
                }} 
              />

              {/* 1. Meetings & Briefings */}
              <Area 
                type="monotone" 
                name="Meetings & Briefings" 
                dataKey="briefings" 
                stroke="var(--color-metric-meetings)" 
                strokeWidth={2.5} 
                fill="url(#glowMeetings)"
                activeDot={{ r: 5, fill: "var(--color-metric-meetings)" }}
                isAnimationActive={false}
              />

              {/* 2. PPE Discipline */}
              <Area 
                type="monotone" 
                name="PPE Discipline" 
                dataKey="ppeDiscipline" 
                stroke="var(--color-metric-ppe)" 
                strokeWidth={2.5} 
                fill="url(#glowPPE)"
                activeDot={{ r: 5, fill: "var(--color-metric-ppe)" }}
                isAnimationActive={false}
              />

              {/* 3. Process Improvement */}
              <Area 
                type="monotone" 
                name="Process Improvement" 
                dataKey="processImprovement" 
                stroke="var(--color-metric-process)" 
                strokeWidth={2.5} 
                fill="url(#glowImprovement)"
                activeDot={{ r: 5, fill: "var(--color-metric-process)" }}
                isAnimationActive={false}
              />

              {/* 4. Safe Acts */}
              <Area 
                type="monotone" 
                name="Safe Acts" 
                dataKey="safeActs" 
                stroke="var(--color-metric-safe-acts)" 
                strokeWidth={2.5} 
                fill="url(#glowSafeActs)"
                activeDot={{ r: 5, fill: "var(--color-metric-safe-acts)" }}
                isAnimationActive={false}
              />

              {/* 5. Safety Observation */}
              <Area 
                type="monotone" 
                name="Safety Observation" 
                dataKey="safetyObservation" 
                stroke="var(--color-metric-observation)" 
                strokeWidth={2.5} 
                fill="url(#glowObservation)"
                activeDot={{ r: 5, fill: "var(--color-metric-observation)" }}
                isAnimationActive={false}
              />

              {/* 6. Team Assistance */}
              <Area 
                type="monotone" 
                name="Team Assistance" 
                dataKey="teamAssistance" 
                stroke="var(--color-metric-assistance)" 
                strokeWidth={2.5} 
                fill="url(#glowAssistance)"
                activeDot={{ r: 5, fill: "var(--color-metric-assistance)" }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest border border-dashed border-[var(--color-brand-border)] bg-[var(--color-brand-bg)]/50 text-center p-4 rounded-sm">
            [ NO DATA CAPTURED IN SELECTED TIMEFRAME ]
          </div>
        )}
      </div>
    </motion.div>
  );
}