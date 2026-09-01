"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";

export default function ChangePasswordCard() {
  const [supabase] = useState(() => createClient());
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    // 1. Validation checks
    if (newPassword.length < 6) {
      setStatus({ type: "error", msg: "PASSWORD MUST BE AT LEAST 6 CHARACTERS" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", msg: "PASSWORDS DO NOT MATCH" });
      return;
    }

    setIsSaving(true);

    // 2. Call Supabase Auth to update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setIsSaving(false);

    if (error) {
      setStatus({ type: "error", msg: error.message.toUpperCase() });
    } else {
      setStatus({ type: "success", msg: "PASSWORD UPDATED SUCCESSFULLY" });
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setStatus(null), 4000);
    }
  };

  return (
    <div className="border p-4 sm:p-6 rounded-sm font-mono shadow-xl relative overflow-hidden bg-[var(--color-brand-card)] border-[var(--color-brand-border)] select-none">
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-blue,#0088ff)]" />

      <div className="border-b pb-4 mb-6 border-[var(--color-brand-border)]">
        <h2 className="text-xs sm:text-base font-black text-slate-100 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-none animate-pulse bg-[var(--color-brand-blue,#0088ff)] flex-shrink-0" />
          Security & Password Settings
        </h2>
        <p className="text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
          Update your account authentication credentials
        </p>
      </div>

      <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
        <div>
          <label className="text-[10px] sm:text-[11px] uppercase font-bold tracking-widest text-slate-400 block mb-1.5">
            New Password
          </label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full min-h-[44px] border p-2.5 sm:p-3 text-xs text-slate-100 font-mono outline-none rounded-sm transition-all bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue,#0088ff)] touch-manipulation"
          />
        </div>

        <div>
          <label className="text-[10px] sm:text-[11px] uppercase font-bold tracking-widest text-slate-400 block mb-1.5">
            Confirm New Password
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full min-h-[44px] border p-2.5 sm:p-3 text-xs text-slate-100 font-mono outline-none rounded-sm transition-all bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue,#0088ff)] touch-manipulation"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 font-black text-xs uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50 rounded-sm shadow-md border outline-none bg-[var(--color-brand-blue,#0088ff)] border-[var(--color-brand-blue,#0088ff)] text-white hover:bg-white hover:text-black active:scale-[0.98] touch-manipulation focus:outline-none"
        >
          {isSubmitting ? "Updating..." : "Update Password"}
        </button>
      </form>

      {/* Feedback Banner */}
      {status && (
        <div
          className={`mt-4 p-3 border rounded-sm text-center text-xs font-black tracking-wider uppercase ${
            status.type === "success"
              ? "bg-[var(--color-brand-green,#00ff9d)]/10 border-[var(--color-brand-green,#00ff9d)]/40 text-[var(--color-brand-green,#00ff9d)]"
              : "bg-[var(--color-brand-red,#ff3b5c)]/10 border-[var(--color-brand-red,#ff3b5c)]/40 text-[var(--color-brand-red,#ff3b5c)]"
          }`}
        >
          [{status.type === "success" ? "SUCCESS" : "FAULT"}] {status.msg}
        </div>
      )}
    </div>
  );
}