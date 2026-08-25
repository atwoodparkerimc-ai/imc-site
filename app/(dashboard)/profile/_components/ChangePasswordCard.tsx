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

  const inputStyle = {
    backgroundColor: "var(--color-brand-bg)",
    borderColor: "var(--color-brand-border)",
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "var(--color-brand-blue)";
    e.currentTarget.style.boxShadow = "0 0 8px color-mix(in srgb, var(--color-brand-blue) 30%, transparent)";
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "var(--color-brand-border)";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <div 
      className="border p-6 rounded-sm font-mono shadow-lg relative overflow-hidden"
      style={{
        backgroundColor: "var(--color-brand-card)",
        borderColor: "var(--color-brand-border)"
      }}
    >
      <div 
        className="absolute top-0 left-0 w-full h-1" 
        style={{ backgroundColor: "var(--color-brand-blue)" }}
      />

      <div 
        className="border-b pb-4 mb-6"
        style={{ borderColor: "var(--color-brand-border)" }}
      >
        <h2 className="text-xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-2">
          <span 
            className="w-2 h-2 rounded-full animate-pulse" 
            style={{ backgroundColor: "var(--color-brand-blue)" }}
          />
          Security & Password Settings
        </h2>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
          Update your account authentication credentials
        </p>
      </div>

      <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
        <div>
          <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1.5">
            New Password
          </label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border p-2.5 text-xs text-slate-100 font-mono outline-none focus:outline-none focus:ring-0 transition-colors rounded-sm"
            style={inputStyle}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
        </div>

        <div>
          <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1.5">
            Confirm New Password
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border p-2.5 text-xs text-slate-100 font-mono outline-none focus:outline-none focus:ring-0 transition-colors rounded-sm"
            style={inputStyle}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
        </div>

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full sm:w-auto px-6 py-2.5 font-black text-xs uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50 rounded-sm shadow-md border outline-none focus:outline-none focus:ring-0"
          style={{
            backgroundColor: "var(--color-brand-blue)",
            borderColor: "var(--color-brand-blue)",
            color: "#ffffff"
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.backgroundColor = "#ffffff";
              e.currentTarget.style.borderColor = "#ffffff";
              e.currentTarget.style.color = "#0a0a0a";
              e.currentTarget.style.boxShadow = "0 0 12px color-mix(in srgb, #ffffff 40%, transparent)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--color-brand-blue)";
            e.currentTarget.style.borderColor = "var(--color-brand-blue)";
            e.currentTarget.style.color = "#ffffff";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {isSubmitting ? "Updating..." : "Update Password"}
        </motion.button>
      </form>

      {/* Feedback Banner */}
      {status && (
        <div
          className="mt-4 p-3 border rounded-sm text-center text-[10px] font-black tracking-wider uppercase"
          style={{
            backgroundColor: status.type === "success"
              ? "color-mix(in srgb, var(--color-brand-green) 10%, transparent)"
              : "color-mix(in srgb, var(--color-brand-red, #f87171) 10%, transparent)",
            borderColor: status.type === "success"
              ? "color-mix(in srgb, var(--color-brand-green) 40%, transparent)"
              : "color-mix(in srgb, var(--color-brand-red, #f87171) 40%, transparent)",
            color: status.type === "success"
              ? "var(--color-brand-green)"
              : "var(--color-brand-red, #f87171)"
          }}
        >
          {status.msg}
        </div>
      )}
    </div>
  );
}