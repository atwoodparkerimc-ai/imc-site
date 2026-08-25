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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-mono">
      <div 
        className="w-full max-w-md border-2 p-6 shadow-2xl relative overflow-hidden rounded-sm"
        style={{
          backgroundColor: "var(--color-brand-card)",
          borderColor: "#eab308", // Yellow security alert highlight
          boxShadow: "0 0 25px color-mix(in srgb, #eab308 20%, transparent)"
        }}
      >
        <div 
          className="absolute top-0 left-0 w-full h-1 animate-pulse" 
          style={{ backgroundColor: "#eab308" }}
        />

        <div 
          className="border-b pb-4 mb-6"
          style={{ borderColor: "var(--color-brand-border)" }}
        >
          <div 
            className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest mb-1"
            style={{ color: "#eab308" }}
          >
            <span 
              className="w-2 h-2 rounded-full animate-ping" 
              style={{ backgroundColor: "#eab308" }}
            />
            Security Protocol Required
          </div>
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-tight">
            Initial Password Change
          </h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">
            You are currently using a temporary default password. Please choose a new password to continue.
          </p>
        </div>

        {errorMsg && (
          <div 
            className="mb-4 p-3 border text-[10px] uppercase font-bold tracking-wider rounded-sm"
            style={{
              backgroundColor: "color-mix(in srgb, var(--color-brand-red, #f87171) 10%, transparent)",
              borderColor: "color-mix(in srgb, var(--color-brand-red, #f87171) 40%, transparent)",
              color: "var(--color-brand-red, #f87171)"
            }}
          >
            [FAULT] {errorMsg}
          </div>
        )}

        {successMsg && (
          <div 
            className="mb-4 p-3 border text-[10px] uppercase font-bold tracking-wider rounded-sm"
            style={{
              backgroundColor: "color-mix(in srgb, var(--color-brand-green) 10%, transparent)",
              borderColor: "color-mix(in srgb, var(--color-brand-green) 40%, transparent)",
              color: "var(--color-brand-green)"
            }}
          >
            [SUCCESS] {successMsg}
          </div>
        )}

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
              className="w-full border p-3 text-xs text-slate-100 font-mono outline-none focus:outline-none focus:ring-0 rounded-sm disabled:opacity-50 transition-colors"
              style={{
                backgroundColor: "var(--color-brand-bg)",
                borderColor: "var(--color-brand-border)"
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#eab308";
                e.currentTarget.style.boxShadow = "0 0 8px color-mix(in srgb, #eab308 30%, transparent)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--color-brand-border)";
                e.currentTarget.style.boxShadow = "none";
              }}
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
              className="w-full border p-3 text-xs text-slate-100 font-mono outline-none focus:outline-none focus:ring-0 rounded-sm disabled:opacity-50 transition-colors"
              style={{
                backgroundColor: "var(--color-brand-bg)",
                borderColor: "var(--color-brand-border)"
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#eab308";
                e.currentTarget.style.boxShadow = "0 0 8px color-mix(in srgb, #eab308 30%, transparent)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--color-brand-border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !!successMsg}
            className="w-full py-3.5 font-black text-xs uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50 mt-2 rounded-sm shadow-md outline-none focus:outline-none focus:ring-0"
            style={{
              backgroundColor: "#eab308",
              color: "#0a0a0a"
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting && !successMsg) {
                e.currentTarget.style.backgroundColor = "#ffffff";
                e.currentTarget.style.boxShadow = "0 0 12px color-mix(in srgb, #ffffff 40%, transparent)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#eab308";
              e.currentTarget.style.boxShadow = "none";
            }}
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