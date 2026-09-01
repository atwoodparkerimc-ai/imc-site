"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import Link from "next/link";
import Footer from "@/components/footer";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const [hasValidSession, setHasValidSession] = useState<boolean | null>(null);

  // Verify recovery session handshake
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setHasValidSession(true);
      } else {
        // Supabase Auth Listener for recovery token exchange
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "PASSWORD_RECOVERY" || session) {
            setHasValidSession(true);
          }
        });
        return () => subscription.unsubscribe();
      }
    };
    checkSession();
  }, [supabase]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (newPassword.length < 6) {
      setFeedback({ message: "PASSWORD MUST BE AT LEAST 6 CHARACTERS.", isError: true });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({ message: "PASSWORDS DO NOT MATCH. PLEASE RE-ENTER.", isError: true });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({ 
      password: newPassword,
      data: { must_change_password: false }
    });

    setIsLoading(false);

    if (error) {
      setFeedback({ message: error.message.toUpperCase(), isError: true });
    } else {
      setFeedback({ 
        message: "PASSWORD SUCCESSFULLY UPDATED. REDIRECTING TO DASHBOARD...", 
        isError: false 
      });
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] flex flex-col justify-between relative font-mono text-slate-100 selection:bg-[#117AE0] selection:text-white overflow-hidden">
      
      {/* TACTICAL BLUEPRINT GRID BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:32px_32px] z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0A0C10_100%)] pointer-events-none" />

      {/* PORTAL FORM WRAPPER */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 sm:py-16 relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md bg-[#131720] border border-slate-800/80 border-t-slate-700/50 p-6 sm:p-10 shadow-2xl relative z-10 rounded-sm"
        >
          {/* BRIGHT NAVY ACCENT LINE ON CARD TOP */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[#117AE0]" />

          <div className="relative z-10">
            {/* HEADER */}
            <div className="mb-6 sm:mb-8 space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight uppercase flex items-center gap-2.5">
                <span className="w-2 h-2 bg-[#117AE0] animate-pulse rounded-none shrink-0" />
                Set New Password
              </h1>
              <p className="text-slate-400 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-bold">
                Security Credentials Recovery
              </p>
            </div>

            {/* FEEDBACK & FAULT BANNER */}
            {feedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`mb-6 p-3 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider border text-center ${
                  feedback.isError
                    ? "bg-red-950/30 border-red-500/50 text-red-400"
                    : "bg-emerald-950/30 border-emerald-500/50 text-emerald-400"
                }`}
              >
                [{feedback.isError ? "FAULT" : "SUCCESS"}] {feedback.message}
              </motion.div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-slate-300 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest">
                  New Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0F1115] border border-slate-800 text-slate-100 p-3 pr-14 text-xs outline-none focus:border-[#117AE0] transition-colors rounded-sm tracking-widest font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center text-[10px] text-slate-400 hover:text-slate-200 active:text-white uppercase font-bold transition-all touch-manipulation select-none cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-300 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-[#0F1115] border text-slate-100 p-3 text-xs outline-none transition-colors rounded-sm tracking-widest font-mono ${
                    confirmPassword && newPassword !== confirmPassword
                      ? "border-red-500 focus:border-red-500"
                      : "border-slate-800 focus:border-[#117AE0]"
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#117AE0] hover:bg-[#0e6bc4] active:bg-[#0c59a3] text-white font-bold uppercase tracking-[0.2em] py-3.5 mt-2 transition-all duration-200 shadow-[0_0_15px_rgba(17,122,224,0.25)] active:scale-[0.98] disabled:opacity-50 cursor-pointer text-xs touch-manipulation select-none"
              >
                {isLoading ? "Updating Credentials..." : "Save New Password ↗"}
              </button>

              <Link
                href="/login"
                className="w-full text-center text-slate-400 hover:text-[#117AE0] active:text-[#117AE0] transition-colors text-[10px] sm:text-[11px] uppercase font-bold tracking-widest py-2.5 cursor-pointer block touch-manipulation select-none"
              >
                ← Return to Personnel Login
              </Link>
            </form>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}