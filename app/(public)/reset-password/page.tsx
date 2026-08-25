"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (newPassword.length < 6) {
      setFeedback({ message: "PASSWORD MUST BE AT LEAST 6 CHARACTERS.", isError: true });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({ message: "PASSWORDS DO NOT MATCH.", isError: true });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsLoading(false);

    if (error) {
      setFeedback({ message: error.message.toUpperCase(), isError: true });
    } else {
      setFeedback({ message: "PASSWORD UPDATED. REDIRECTING TO DASHBOARD...", isError: false });
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col justify-center items-center px-4 font-mono relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-accent via-brand-orange to-brand-info z-20" />
      
      <div className="w-full max-w-md bg-brand-card/90 border-2 border-brand-border-dark p-8 shadow-2xl relative z-10 rounded-sm">
        <h1 className="text-2xl font-black text-brand-cream uppercase tracking-tight mb-1">Set New Password</h1>
        <p className="text-[10px] text-brand-accent uppercase tracking-widest font-black mb-6">Security Credentials Recovery</p>

        {feedback && (
          <div className={`mb-4 p-3 text-[10px] font-mono uppercase tracking-wider border text-center ${
            feedback.isError ? "bg-brand-accent/10 border-brand-accent text-brand-accent" : "bg-brand-success/10 border-brand-success text-brand-success"
          }`}>
            [{feedback.isError ? "FAULT" : "SUCCESS"}] {feedback.message}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-brand-cream/80 text-[10px] font-black uppercase tracking-widest">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-brand-dark border border-brand-border-dark text-brand-cream p-3 pr-12 text-xs outline-none focus:border-brand-accent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-brand-cream/50 hover:text-brand-cream uppercase font-black"
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-brand-cream/80 text-[10px] font-black uppercase tracking-widest">Confirm New Password</label>
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-brand-dark border border-brand-border-dark text-brand-cream p-3 text-xs outline-none focus:border-brand-accent"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-accent text-brand-dark font-black uppercase tracking-widest py-3.5 hover:bg-white transition-colors text-xs cursor-pointer disabled:opacity-50"
          >
            {isLoading ? "Updating Credentials..." : "Save New Password ↗"}
          </button>
        </form>
      </div>
    </div>
  );
}