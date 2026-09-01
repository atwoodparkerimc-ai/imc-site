"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion, Variants } from "framer-motion";

export interface ComplianceRecord {
  name: string;
  value: number;
  acts: number;
  meetings: number;
}

export interface UserProfileRecord {
  id: string;
  first_name: string;
  nickname: string | null;
  role: string;
}

interface ComplianceTrackerProps {
  complianceData: ComplianceRecord[];
  allUsers: UserProfileRecord[];
  compUser: string;
  setCompUser: (userId: string) => void;
  tfComp: string;
  setTfComp: (tf: string) => void;
  CustomTooltip: React.ComponentType<any>;
  itemVariants: Variants;
}

export default function ComplianceTracker({
  complianceData = [],
  allUsers = [],
  compUser,
  setCompUser,
  tfComp,
  setTfComp,
  CustomTooltip,
  itemVariants
}: ComplianceTrackerProps) {
  const hasData = (complianceData || []).some(d => (d?.acts || 0) > 0 || (d?.meetings || 0) > 0);

  return (
    <motion.div 
      variants={itemVariants} 
      className="border p-4 sm:p-6 shadow-2xl relative overflow-hidden group font-mono rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] select-none"
    >
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-border)] group-hover:bg-[var(--color-brand-blue)] transition-colors duration-300" />
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 border-b pb-4 gap-4 border-[var(--color-brand-border)]">
        <div>
          <h2 className="text-slate-100 font-black uppercase tracking-widest text-sm sm:text-base flex items-center gap-2">
            <span className="w-2 h-2 rounded-none animate-pulse bg-[var(--color-brand-blue)]" />
            Employee Compliance Tracker
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 uppercase tracking-wider mt-0.5 font-bold">
            Individual Performance & Engagement Metrics
          </p>
        </div>

        {/* MOBILE RESPONSIVE DROPDOWN CONTROLS */}
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
          <select 
            value={compUser} 
            onChange={(e) => setCompUser(e.target.value)} 
            className="w-full sm:w-auto min-h-[44px] px-3 py-2 text-xs text-slate-200 uppercase font-bold outline-none cursor-pointer rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] transition-all touch-manipulation"
          >
            {(allUsers || []).map(emp => (
              <option key={emp.id} value={emp.id} className="bg-[var(--color-brand-card)] text-slate-200">
                {emp.nickname || emp.first_name} {emp.role === 'manager' ? '(Manager)' : ''}
              </option>
            ))}
          </select>

          <select 
            value={tfComp} 
            onChange={(e) => setTfComp(e.target.value)} 
            className="w-full sm:w-auto min-w-[110px] min-h-[44px] px-3 py-2 text-xs text-slate-200 uppercase font-bold outline-none cursor-pointer rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] transition-all touch-manipulation"
          >
            <option value="week" className="bg-[var(--color-brand-card)]">1 Week</option>
            <option value="month" className="bg-[var(--color-brand-card)]">1 Month</option>
            <option value="year" className="bg-[var(--color-brand-card)]">1 Year</option>
          </select>
        </div>
      </div>

      {/* GRAPH CONTAINER */}
      <div className="w-full h-[250px] sm:h-[280px] min-h-[250px] relative">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={complianceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-brand-border)" strokeOpacity={0.5} vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8" 
                fontSize={11} 
                fontFamily="ui-monospace, monospace"
                fontWeight="700"
                tickLine={false} 
                axisLine={false} 
                dy={10} 
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={11} 
                fontFamily="ui-monospace, monospace"
                fontWeight="700"
                tickLine={false} 
                axisLine={false} 
                allowDecimals={false} 
                domain={[0, 'auto']} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-brand-bg)', opacity: 0.8 }} />
              <Legend 
                wrapperStyle={{ 
                  fontSize: '11px', 
                  fontWeight: '800', 
                  textTransform: 'uppercase', 
                  color: '#f8fafc',
                  paddingTop: '12px' 
                }} 
              />
              <Bar name="Safe Acts" dataKey="acts" fill="var(--color-metric-safe-acts)" radius={[2, 2, 0, 0]} isAnimationActive={false} />
              <Bar name="Safety Meetings" dataKey="meetings" fill="var(--color-metric-meetings)" radius={[2, 2, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest border border-dashed border-[var(--color-brand-border)] bg-[var(--color-brand-bg)]/50 text-center p-4 rounded-sm">
            [ NO REPORTS FILED IN TIMEFRAME ]
          </div>
        )}
      </div>
    </motion.div>
  );
}