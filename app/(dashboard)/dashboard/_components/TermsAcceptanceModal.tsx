"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { ShieldCheck, CheckSquare, Square, AlertCircle } from "lucide-react";

interface TermsAcceptanceModalProps {
  userId: string;
  onAccepted: () => void;
}

export default function TermsAcceptanceModal({ userId, onAccepted }: TermsAcceptanceModalProps) {
  const [supabase] = useState(() => createClient());
  const [hasAgreed, setHasAgreed] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!hasAgreed || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ terms_accepted_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) throw error;
      onAccepted();
    } catch (err: any) {
      console.error("Failed to record terms acceptance:", err);
      setErrorMessage(err.message || "Failed to log agreement. Please retry.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md font-mono select-none">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl bg-[var(--color-brand-card,#070a10)] border border-[var(--color-brand-border,#1e293b)] p-6 sm:p-10 rounded-sm shadow-2xl relative overflow-hidden text-slate-100"
      >
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-blue,#0088ff)]" />

        {/* Modal Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-sm bg-[var(--color-brand-blue,#0088ff)]/15 border border-[var(--color-brand-blue,#0088ff)] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-[var(--color-brand-blue,#0088ff)]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
              Employee Incentive Program Notice
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 uppercase tracking-widest mt-1">
              Mandatory Policy Acknowledgement
            </p>
          </div>
        </div>

        {/* Highlighted Policy Summary Box */}
        <div className="bg-[var(--color-brand-bg,#030914)] border border-slate-800 p-5 rounded-sm space-y-3 my-6 text-sm text-slate-300 font-sans leading-relaxed max-h-60 overflow-y-auto">
          <ul className="list-disc list-inside space-y-2.5 text-slate-300">
            <li><strong className="text-white font-semibold">Zero Cash Value:</strong> Safety points have no monetary cash value and cannot be exchanged for currency or wages.</li>
            <li><strong className="text-white font-semibold">Active Employment Contingency:</strong> You must be an active IMC employee at the time rewards are redeemed and delivered.</li>
            <li><strong className="text-white font-semibold">Separation Policy:</strong> Points are immediately voided and forfeited upon resignation, termination, or structural layoffs.</li>
            <li><strong className="text-white font-semibold">Reporting Integrity:</strong> Submitting false checks or fraudulent peer acts will result in point cancellation and disciplinary review.</li>
          </ul>
        </div>

        {/* Checkbox Acknowledgment */}
        <button 
          type="button"
          onClick={() => setHasAgreed(!hasAgreed)}
          className="w-full min-h-[44px] flex items-center gap-3.5 p-4 bg-slate-900/60 border border-slate-800 hover:border-slate-700 active:border-slate-600 rounded-sm cursor-pointer text-left transition-all active:scale-[0.99] touch-manipulation focus:outline-none"
        >
          <div className="text-[var(--color-brand-blue,#0088ff)] shrink-0">
            {hasAgreed ? (
              <CheckSquare className="w-5 h-5 text-[#00ff9d]" />
            ) : (
              <Square className="w-5 h-5 text-slate-500" />
            )}
          </div>
          <span className="text-sm text-slate-300 font-sans leading-snug">
            I have read, understood, and agree to the{" "}
            <Link 
              href="/employee-terms" 
              target="_blank" 
              className="text-[var(--color-brand-blue,#0088ff)] underline hover:text-white inline-block py-1 touch-manipulation"
              onClick={(e) => e.stopPropagation()}
            >
              Employee Terms of Use & Incentive Guidelines
            </Link>.
          </span>
        </button>

        {errorMessage && (
          <div className="mt-5 p-3 bg-red-950/40 border border-red-800 text-red-400 text-sm font-mono flex items-center gap-2 rounded-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleConfirm}
          disabled={!hasAgreed || isSubmitting}
          className="w-full min-h-[44px] mt-8 py-4 bg-[var(--color-brand-blue,#0088ff)] hover:bg-white hover:text-black active:bg-slate-200 disabled:opacity-40 disabled:hover:bg-[var(--color-brand-blue,#0088ff)] disabled:hover:text-white text-white font-bold uppercase tracking-[0.2em] text-sm transition-all duration-200 cursor-pointer rounded-sm shadow-[0_0_15px_rgba(0,136,255,0.25)] active:scale-[0.98] touch-manipulation focus:outline-none"
        >
          {isSubmitting ? "AUTHORIZING ACCESS..." : "CONFIRM & ENTER PORTAL ↗"}
        </button>
      </motion.div>
    </div>
  );
}