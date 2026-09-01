"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { completePasswordChange } from "@/lib/db/operations";

interface FirstLoginPasswordModalProps {
  userId: string;
  onPasswordChanged: () => void;
}

export default function FirstLoginPasswordModal({
  userId,
  onPasswordChanged,
}: FirstLoginPasswordModalProps) {
  const [supabase] = useState(() => createClient());
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    if (newPassword === "Imc123") {
      setErrorMsg("Please choose a new password different from 'Imc123'.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    // 1. Update Supabase Auth Password
    const { error: authError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (authError) {
      setErrorMsg(authError.message.toUpperCase());
      setIsSubmitting(false);
      return;
    }

    // 2. Clear first-login flag in profiles
    const res = await completePasswordChange(supabase, userId);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg("PASSWORD UPDATED SUCCESSFULLY! INITIALIZING SYSTEM...");
      
      // Brief delay to let the user read the success message before closing modal
      setTimeout(() => {
        onPasswordChanged();
      }, 1500);
    } else {
      setErrorMsg("Password updated, but system failed to set profile flag. Please refresh.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-mono select-none">
      <div className="w-full max-w-md bg-[var(--color-brand-card)] border-2 border-[#eab308] p-5 sm:p-6 shadow-[0_0_25px_rgba(234,179,8,0.2)] relative overflow-hidden rounded-sm">
        
        {/* Animated Amber Accent Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[#eab308] animate-pulse" />

        {/* Modal Header */}
        <div className="border-b border-[var(--color-brand-border)] pb-4 mb-5">
          <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[#eab308] mb-1">
            <span className="w-2 h-2 rounded-full bg-[#eab308] animate-ping" />
            Security Protocol Required
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-100 uppercase tracking-tight">
            Initial Password Change
          </h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1 leading-relaxed">
            You are currently using a temporary default password. Please choose a new password to continue.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 border border-[var(--color-brand-red,#ff3b5c)]/40 bg-[var(--color-brand-red,#ff3b5c)]/10 text-[var(--color-brand-red,#ff3b5c)] text-xs font-bold uppercase rounded-sm leading-relaxed">
            [FAULT] {errorMsg}
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3 border border-[var(--color-brand-green,#00ff9d)]/40 bg-[var(--color-brand-green,#00ff9d)]/10 text-[var(--color-brand-green,#00ff9d)] text-xs font-bold uppercase rounded-sm leading-relaxed">
            [SUCCESS] {successMsg}
          </div>
        )}

        {/* Password Reset Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              disabled={isSubmitting || !!successMsg}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full min-h-[44px] bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] p-3 text-xs text-slate-100 font-mono outline-none rounded-sm disabled:opacity-50 transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              disabled={isSubmitting || !!successMsg}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full min-h-[44px] bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] p-3 text-xs text-slate-100 font-mono outline-none rounded-sm disabled:opacity-50 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !!successMsg}
            className="w-full min-h-[44px] py-3.5 px-4 bg-[#eab308] hover:bg-white active:bg-slate-200 text-[#0a0a0a] font-black text-xs uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50 mt-2 rounded-sm shadow-md active:scale-[0.98] touch-manipulation focus:outline-none select-none"
          >
            {isSubmitting
              ? "Updating Password..."
              : successMsg
              ? "Redirecting..."
              : "Set Password & Enter System"}
          </button>
        </form>
      </div>
    </div>
  );
}