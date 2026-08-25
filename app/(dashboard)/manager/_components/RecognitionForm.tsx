"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion, Variants } from "framer-motion";

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
      className="xl:col-span-1 border p-4 sm:p-6 shadow-2xl relative overflow-hidden group font-mono text-slate-100 rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)]"
    >
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-border)] group-hover:bg-[var(--color-brand-blue)] transition-colors duration-300" />
      
      <div className="mb-6 border-b pb-4 border-[var(--color-brand-border)]">
        <h2 className="text-slate-100 font-black uppercase tracking-widest text-sm sm:text-base flex items-center gap-2">
          <span className="w-2 h-2 bg-[var(--color-brand-blue)] animate-pulse rounded-none" />
          Initiate Recognition
        </h2>
        <p className="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
          Authorize Direct Point Allocation
        </p>
      </div>

      {formFeedback && (
        <div className={`mb-4 p-3 font-mono text-xs font-bold uppercase tracking-wider border rounded-sm ${
          formFeedback.isError 
            ? 'bg-amber-500/10 border-amber-500/50 text-[var(--color-brand-red)]' 
            : 'bg-emerald-950/30 border-emerald-500/50 text-[var(--color-metric-meetings)]'
        }`}>
          [{formFeedback.isError ? 'REFUSED' : 'ACCEPTED'}] {formFeedback.message}
        </div>
      )}

      <form onSubmit={handleAwardSubmit} className="space-y-4">
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-300 tracking-widest block mb-1.5">
            Target Employee / Manager
          </label>
          <div className="relative">
            <select 
              value={selectedUser} 
              onChange={(e) => setSelectedUser(e.target.value)} 
              required 
              className="w-full py-2.5 px-3 pr-8 text-slate-100 text-xs font-bold uppercase outline-none cursor-pointer appearance-none rounded-sm truncate border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] transition-colors"
            >
              <option value="" disabled className="text-slate-500">Select Team Member</option>
              {(employees || []).map(emp => {
                const nameDisplay = emp.nickname || emp.first_name;
                const roleLabel = emp.role === 'manager' ? ' (Manager)' : '';
                return (
                  <option key={emp.id} value={emp.id} className="bg-[var(--color-brand-card)] text-slate-100">
                    {nameDisplay}{roleLabel}
                  </option>
                );
              })}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* STACKS ON MOBILE, SIDE-BY-SIDE ON TABLET/DESKTOP */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="text-[10px] font-bold uppercase text-slate-300 tracking-widest block mb-1.5">
              Category
            </label>
            <div className="relative">
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                className="w-full py-2.5 px-3 pr-8 text-slate-100 text-xs font-bold uppercase outline-none cursor-pointer appearance-none rounded-sm truncate border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] transition-colors"
              >
                {REWARD_CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="bg-[var(--color-brand-card)] text-slate-100">{cat}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="w-full sm:w-1/3">
            <label className="text-[10px] font-bold uppercase text-slate-300 tracking-widest block mb-1.5">
              Amount
            </label>
            <input 
              type="number" 
              min="1" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              required 
              placeholder="PTS" 
              className="w-full py-2.5 px-3 font-black text-xs outline-none transition-colors rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] text-[var(--color-metric-safe-acts)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase text-slate-300 tracking-widest block mb-1.5">
            Justification Note
          </label>
          <textarea 
            value={reason} 
            onChange={(e) => setReason(e.target.value)} 
            required 
            rows={3} 
            placeholder="OPERATIONAL NOTE..." 
            className="w-full p-3 text-slate-100 text-xs font-bold uppercase outline-none transition-colors resize-none placeholder-slate-500 rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)]" 
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full mt-2 text-white py-3.5 font-bold uppercase tracking-wider text-xs hover:bg-white hover:text-black transition-all duration-200 disabled:opacity-50 cursor-pointer rounded-sm bg-[var(--color-brand-blue)] shadow-[0_0_15px_rgba(0,136,255,0.25)]"
        >
          {isSubmitting ? "PROCESSING..." : "AUTHORIZE TRANSFER ↗"}
        </button>
      </form>
    </motion.div>
  );
}