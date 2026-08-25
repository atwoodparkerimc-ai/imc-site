"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion, Variants } from "framer-motion";

// --- CENTRAL DATA SERVICE IMPORT ---
import { finalizeDailyAuditLog } from "@/lib/db/operations";

export interface EmployeeProfile {
  id: string;
  first_name: string;
  nickname: string | null;
  role: string;
}

interface TimeColumn {
  id: string;
  topTime: string;
  bottomTime: string;
}

interface GridCellState {
  [colId: string]: string | undefined; 
  comment?: string;
}

interface AuditGridData {
  [employeeId: string]: GridCellState;
}

interface DailyAuditSheetProps {
  employees: EmployeeProfile[];
  itemVariants: Variants;
}

export default function DailyAuditSheet({ employees = [], itemVariants }: DailyAuditSheetProps) {
  const [supabase] = useState(() => createClient());
  const [auditTopic, setAuditTopic] = useState<string>("Safety Audit");
  const [timeColumns, setTimeColumns] = useState<TimeColumn[]>([
    { id: `col_${Date.now()}`, topTime: '', bottomTime: '' }
  ]);
  const [auditGrid, setAuditGrid] = useState<AuditGridData>({});
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);
  const [terminalNotification, setTerminalNotification] = useState<{ message: string; isError: boolean } | null>(null);

  const addTimeColumn = () => {
    setTimeColumns([...timeColumns, { id: `col_${Date.now()}`, topTime: '', bottomTime: '' }]);
  };
  
  const updateTimeColumn = (id: string, field: 'topTime' | 'bottomTime', value: string) => {
    setTimeColumns(cols => cols.map(c => c.id === id ? { ...c, [field]: value } : c));
  };
  
  const toggleAuditStatus = (empId: string, colId: string) => {
    const employeeGrid = auditGrid[empId] || {};
    const current = employeeGrid[colId] || '';
    const next = current === '' ? 'X' : current === 'X' ? 'OFF' : current === 'OFF' ? '--' : '';
    
    setAuditGrid({
      ...auditGrid,
      [empId]: {
        ...employeeGrid,
        [colId]: next
      }
    });
  };
  
  const updateEmployeeComment = (empId: string, comment: string) => {
    const employeeGrid = auditGrid[empId] || {};
    setAuditGrid({
      ...auditGrid,
      [empId]: {
        ...employeeGrid,
        comment
      }
    });
  };
  
  const getStatusColor = (status: string | undefined) => {
    if (status === 'X') return 'bg-[var(--color-metric-safe-acts)] text-slate-950 font-black';
    if (status === 'OFF') return 'bg-[var(--color-brand-bg)] text-[var(--color-metric-observation)] border border-[var(--color-metric-observation)]/40 font-bold';
    if (status === '--') return 'bg-[var(--color-brand-card)] text-slate-300 font-bold border border-[var(--color-brand-border)]';
    return 'bg-[var(--color-brand-bg)] text-transparent hover:bg-[var(--color-brand-border)]/40';
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFinalizeAudit = async () => {
    setIsFinalizing(true);
    setTerminalNotification(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTerminalNotification({ message: "Authorization failure. User session not found.", isError: true });
        setIsFinalizing(false);
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      
      const result = await finalizeDailyAuditLog(supabase, {
        auditDate: today,
        safetyTopic: auditTopic,
        gridData: { columns: timeColumns, grid: auditGrid },
        finalizedBy: user.id
      });
      
      if (!result.success) {
        const isUniqueViolation = result.error?.includes("unique");
        setTerminalNotification({
          message: isUniqueViolation ? "Today's log sheet is already locked and finalized!" : `Error: ${result.error}`,
          isError: true
        });
      } else {
        setTerminalNotification({
          message: "Daily Roll Call Audit Locked and Archived successfully.",
          isError: false
        });
      }
    } catch (err) {
      console.error("Audit sheet compilation failure:", err);
      setTerminalNotification({ message: "Critical runtime error committing data ledger.", isError: true });
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <motion.div 
      variants={itemVariants} 
      className="border p-4 sm:p-6 shadow-2xl relative overflow-hidden group font-mono rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] print:bg-white print:text-black print:p-0 print:border-none"
    >
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-border)] group-hover:bg-[var(--color-brand-blue)] transition-colors duration-300 print:hidden" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] print:hidden" />

      {/* Interactive System Action Controls Block */}
      <div className="flex flex-col gap-4 mb-6 pb-4 border-b border-[var(--color-brand-border)] print:hidden">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-slate-100 font-black uppercase tracking-widest text-sm sm:text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-none animate-pulse bg-[var(--color-brand-blue)]" />
              Daily Roll Call & Audit
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Field Attendance & Safety Topic Verification Ledger
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={addTimeColumn} 
              className="flex-1 sm:flex-initial border border-[var(--color-brand-blue)]/50 bg-[var(--color-brand-blue)]/10 text-slate-200 px-3 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[var(--color-brand-blue)] hover:text-white transition-all cursor-pointer text-center rounded-sm"
            >
              + Add Column
            </button>
            <button 
              onClick={handlePrint} 
              className="flex-1 sm:flex-initial text-slate-200 px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] hover:border-[var(--color-brand-blue)]"
            >
              Print Sheet
            </button>
            <button 
              onClick={handleFinalizeAudit} 
              disabled={isFinalizing} 
              className="w-full sm:w-auto text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-200 shadow-[0_0_15px_rgba(0,136,255,0.25)] disabled:opacity-50 cursor-pointer text-center rounded-sm bg-[var(--color-brand-blue)]"
            >
              {isFinalizing ? "LOCKING..." : "FINALIZE & LOCK ↗"}
            </button>
          </div>
        </div>

        {/* Local Console Alert Ledger Block */}
        {terminalNotification && (
          <div className={`p-3 text-xs font-bold uppercase tracking-wider border rounded-sm ${
            terminalNotification.isError 
              ? 'bg-[var(--color-brand-bg)] border-[var(--color-brand-red)]/50 text-[var(--color-brand-red)]' 
              : 'bg-[var(--color-brand-bg)] border-[var(--color-metric-meetings)]/50 text-[var(--color-metric-meetings)]'
          }`}>
            [{terminalNotification.isError ? 'SYSTEM ERROR' : 'ARCHIVE SUCCESS'}] {terminalNotification.message}
          </div>
        )}
      </div>

      {/* MOBILE-RESPONSIVE SCROLLABLE TABLE CANVAS */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[700px]">
          {/* Clipboard Structural Print Sheet Engine */}
          <div className="w-full py-3 sm:py-4 text-center font-black text-xl sm:text-2xl uppercase tracking-widest border-2 border-[var(--color-brand-border)] print:border-black mb-1 text-slate-950 shadow-md bg-[var(--color-metric-safe-acts)]">
            IMC SAFETY
          </div>

          <div className="grid grid-cols-2 gap-0 border-2 border-[var(--color-brand-border)] print:border-black border-t-0 mb-4 text-xs font-bold uppercase text-slate-200 print:text-black">
            <div className="p-3 border-r border-[var(--color-brand-border)] print:border-black flex flex-col bg-[var(--color-brand-bg)] print:bg-transparent">
              <span className="text-[10px] text-slate-400 print:text-gray-600 mb-1 font-bold">Date:</span>
              <span className="text-xs sm:text-sm font-black tracking-tight text-slate-100 print:text-black">{new Date().toLocaleDateString()}</span>
            </div>

            <div className="p-3 flex flex-col bg-[var(--color-brand-bg)] print:bg-transparent">
              <span className="text-[10px] text-slate-400 print:text-gray-600 mb-1 font-bold">Safety Topic:</span>
              <input 
                type="text" 
                value={auditTopic} 
                onChange={(e) => setAuditTopic(e.target.value)} 
                className="w-full bg-transparent outline-none print:hidden text-slate-100 border-b border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] text-xs font-bold uppercase" 
                placeholder="Enter topic..." 
              />
              <span className="hidden print:block font-black text-xs">{auditTopic}</span>
            </div>
          </div>
          
          <table className="w-full border-collapse border-2 border-[var(--color-brand-border)] print:border-black text-xs font-bold uppercase text-slate-200 print:text-black">
            <thead>
              <tr className="bg-[var(--color-brand-bg)] print:bg-gray-100">
                <th className="border p-3 text-left w-48 sm:w-52 align-bottom text-slate-400 print:text-black tracking-wider text-[10px] font-black border-[var(--color-brand-border)] print:border-black">
                  Employee
                </th>
                {timeColumns.map(col => (
                  <th key={col.id} className="border p-1 text-center w-20 sm:w-24 align-bottom border-[var(--color-brand-border)] print:border-black">
                    <div className="flex flex-col gap-1 items-center font-mono">
                      <input 
                        type="text" 
                        placeholder="In" 
                        value={col.topTime} 
                        onChange={(e) => updateTimeColumn(col.id, 'topTime', e.target.value)} 
                        className="w-full text-center text-slate-100 outline-none focus:border-[var(--color-brand-blue)] text-[10px] font-bold uppercase p-1.5 rounded-sm border bg-[var(--color-brand-card)] border-[var(--color-brand-border)] print:bg-transparent print:border-none print:text-black" 
                      />
                      <input 
                        type="text" 
                        placeholder="Out" 
                        value={col.bottomTime} 
                        onChange={(e) => updateTimeColumn(col.id, 'bottomTime', e.target.value)} 
                        className="w-full text-center text-slate-100 outline-none focus:border-[var(--color-brand-blue)] text-[10px] font-bold uppercase p-1.5 rounded-sm border bg-[var(--color-brand-card)] border-[var(--color-brand-border)] print:bg-transparent print:border-none print:text-black" 
                      />
                    </div>
                  </th>
                ))}
                <th className="border p-3 text-left align-bottom text-slate-400 print:text-black tracking-wider text-[10px] font-black border-[var(--color-brand-border)] print:border-black">
                  Comments
                </th>
              </tr>
            </thead>

            <tbody>
              {(employees || []).map((emp, idx) => (
                <tr key={emp.id} className={`${idx % 2 === 0 ? 'bg-[var(--color-brand-card)]' : 'bg-[var(--color-brand-bg)]'} print:bg-white hover:bg-[var(--color-brand-border)]/30 transition-colors`}>
                  <td className="border p-3 truncate font-bold tracking-tight text-xs text-slate-100 border-[var(--color-brand-border)] print:border-black">
                    {emp.nickname || emp.first_name}
                  </td>

                  {timeColumns.map(col => (
                    <td key={col.id} className="border p-0 text-center relative cursor-pointer border-[var(--color-brand-border)] print:border-black" onClick={() => toggleAuditStatus(emp.id, col.id)}>
                      <div className={`w-full h-full min-h-[44px] flex items-center justify-center text-xs transition-colors ${getStatusColor(auditGrid[emp.id]?.[col.id])} print:text-black print:bg-transparent`}>
                        {auditGrid[emp.id]?.[col.id] || ''}
                      </div>
                    </td>
                  ))}

                  <td className="border p-0 border-[var(--color-brand-border)] print:border-black">
                    <input 
                      type="text" 
                      value={auditGrid[emp.id]?.comment || ''} 
                      onChange={(e) => updateEmployeeComment(emp.id, e.target.value)} 
                      className="w-full h-full min-h-[44px] px-3 bg-transparent text-slate-100 placeholder-slate-600 outline-none focus:bg-[var(--color-brand-bg)] print:hidden text-xs font-bold" 
                      placeholder="Enter notes..." 
                    />
                    <span className="hidden print:block px-3 font-normal text-xs">{auditGrid[emp.id]?.comment || ''}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}