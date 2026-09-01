"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion, Variants } from "framer-motion";
import { Loader2 } from "lucide-react";

// --- CENTRAL DATA SERVICE IMPORT ---
import { awardPointsToEmployee } from "@/lib/db/operations";

// STRICT 4 CORE CATEGORIES (HOUSEKEEPING REMOVED)
const REWARD_CATEGORIES = [
  "Safety Observation",
  "Team Assistance",
  "PPE Discipline",
  "Process Improvement"
];

export interface EmployeeRecord {
  id: string;
  first_name: string;
  nickname: string | null;
  role: string;
}

interface RecognitionFormProps {
  employees: EmployeeRecord[];
  onAwardSuccess: () => Promise<void>;
  itemVariants: Variants;
}

export default function RecognitionForm({ employees = [], onAwardSuccess, itemVariants }: RecognitionFormProps) {
  const [supabase] = useState(() => createClient());
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>(REWARD_CATEGORIES[0]);
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formFeedback, setFormFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  const handleAwardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormFeedback(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setFormFeedback({ message: "Authorization Failure: Session missing.", isError: true });
        setIsSubmitting(false);
        return;
      }

      const result = await awardPointsToEmployee(supabase, {
        managerId: user.id,
        employeeId: selectedUser,
        amount: parseInt(amount, 10),
        category: category,
        reason: reason
      });

      if (!result.success) {
        setFormFeedback({ message: `System Error: ${result.error}`, isError: true });
      } else {
        await onAwardSuccess();
        setAmount("");
        setReason("");
        setSelectedUser("");
        setFormFeedback({ message: "Award authorized and transferred successfully.", isError: false });
      }
    } catch (err) {
      console.error("Award transaction exceptional routing break:", err);
      setFormFeedback({ message: "Critical infrastructure failure committing transaction.", isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      variants={itemVariants} 
      className="w-full bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] p-4 sm:p-6 rounded-sm shadow-xl font-mono text-slate-100 select-none"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2 h-2 rounded-none animate-pulse bg-[var(--color-brand-blue)] flex-shrink-0" />
        <h3 className="font-mono text-xs sm:text-base font-black text-slate-100 uppercase tracking-widest flex items-center gap-2">
          Initiate Recognition
        </h3>
      </div>

      <p className="text-slate-400 text-xs uppercase tracking-wider mb-6 font-mono leading-relaxed">
        Authorize direct point allocations to reward team members for proactive safety, teamwork, and operational compliance.
      </p>

      {formFeedback && (
        <div className={`mb-6 p-3 font-mono text-xs uppercase tracking-wider font-bold rounded-sm border ${
          formFeedback.isError 
            ? 'bg-[var(--color-brand-red,#ff3b5c)]/10 border-[var(--color-brand-red,#ff3b5c)]/50 text-[var(--color-brand-red,#ff3b5c)]' 
            : 'bg-[var(--color-brand-green,#00ff9d)]/10 border-[var(--color-brand-green,#00ff9d)]/50 text-[var(--color-brand-green,#00ff9d)]'
        }`}>
          [{formFeedback.isError ? 'REFUSED' : 'ACCEPTED'}] {formFeedback.message}
        </div>
      )}

      <form onSubmit={handleAwardSubmit} className="space-y-6">
        {/* ROW 1: EMPLOYEE, CATEGORY, & AMOUNT */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5">
            <label className="block font-mono text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Target Employee / Manager
            </label>
            <div className="relative">
              <select 
                value={selectedUser} 
                onChange={(e) => setSelectedUser(e.target.value)} 
                required 
                className="w-full min-h-[44px] bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] rounded-sm px-4 py-2.5 text-xs text-white font-mono uppercase tracking-wide focus:outline-none transition-all appearance-none cursor-pointer pr-8 touch-manipulation"
              >
                <option value="" disabled className="text-slate-500">Select Team Member</option>
                {(employees || []).map(emp => {
                  const nameDisplay = emp.nickname || emp.first_name;
                  const roleLabel = emp.role === 'manager' ? ' (Manager)' : '';
                  return (
                    <option key={emp.id} value={emp.id} className="bg-[var(--color-brand-card)] text-white">
                      {nameDisplay}{roleLabel}
                    </option>
                  );
                })}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="md:col-span-4">
            <label className="block font-mono text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Category
            </label>
            <div className="relative">
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                className="w-full min-h-[44px] bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] rounded-sm px-4 py-2.5 text-xs text-white font-mono uppercase tracking-wide focus:outline-none transition-all appearance-none cursor-pointer pr-8 touch-manipulation"
              >
                {REWARD_CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="bg-[var(--color-brand-card)] text-white">{cat}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block font-mono text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Amount
            </label>
            <input 
              type="number" 
              min="1" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              required 
              placeholder="PTS" 
              className="w-full min-h-[44px] bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] rounded-sm px-4 py-2.5 text-xs text-[var(--color-brand-green,#00ff9d)] font-mono font-black uppercase tracking-wide focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none touch-manipulation" 
            />
          </div>
        </div>

        {/* ROW 2: JUSTIFICATION NOTE */}
        <div>
          <label className="block font-mono text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Justification Note
          </label>
          <textarea 
            value={reason} 
            onChange={(e) => setReason(e.target.value)} 
            required 
            rows={2} 
            placeholder="OPERATIONAL NOTE..." 
            className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] rounded-sm p-3 text-xs text-white font-mono uppercase tracking-wide placeholder-slate-500 focus:outline-none transition-all resize-none touch-manipulation" 
          />
        </div>

        {/* ROW 3: FULL WIDTH AUTHORIZE BUTTON */}
        <div className="pt-2">
          <button 
            type="submit" 
            disabled={isSubmitting || !selectedUser || !amount || !reason} 
            className="w-full min-h-[44px] bg-[var(--color-brand-blue)] hover:bg-white active:bg-slate-200 hover:text-black disabled:bg-slate-800 disabled:text-slate-500 text-white font-mono text-xs sm:text-sm font-black uppercase tracking-widest py-3 px-6 rounded-sm transition-all shadow-[0_0_20px_rgba(0,136,255,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed active:scale-[0.98] touch-manipulation focus:outline-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing Transfer...
              </>
            ) : (
              "Authorize Transfer ↗"
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}