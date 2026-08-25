"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "@/components/footer";

export default function EmployeeLogin() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  // Navigation Modes: "login" | "gate" | "signup" | "forgot"
  const [mode, setMode] = useState<"login" | "gate" | "signup" | "forgot">("login");

  // Gate Security Passcode State
  const [gatePasscode, setGatePasscode] = useState("");
  const [gateError, setGateError] = useState(false);

  // Form Field States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [location, setLocation] = useState("Nestle Springville");

  // Password Visibility States
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showGatePasscode, setShowGatePasscode] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback States
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  // Handle User Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setFeedback({ message: authError.message.toUpperCase(), isError: true });
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  // Handle Gate Verification Passcode (Reads from NEXT_PUBLIC_REGISTRATION_PASSCODE)
  const handleVerifyGate = (e: React.FormEvent) => {
    e.preventDefault();
    setGateError(false);

    const validPasscode = process.env.NEXT_PUBLIC_REGISTRATION_PASSCODE || "Safety123.";

    if (gatePasscode.trim() === validPasscode) {
      setFeedback(null);
      setMode("signup");
    } else {
      setGateError(true);
      setFeedback({
        message: "INVALID SITE PASSWORD. ACCESS DENIED.",
        isError: true,
      });
    }
  };

  // Handle Self Registration Signup
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    if (!firstName || !lastName) {
      setFeedback({ message: "FIRST AND LAST NAME ARE REQUIRED.", isError: true });
      setIsLoading(false);
      return;
    }

    // Check if passwords match before attempting sign-up
    if (password !== confirmPassword) {
      setFeedback({ message: "PASSWORDS DO NOT MATCH. PLEASE RE-ENTER.", isError: true });
      setIsLoading(false);
      return;
    }

    // Sign up user with metadata & explicitly set must_change_password to false
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          location: location,
          must_change_password: false, // Bypasses the password change modal
        },
      },
    });

    if (signUpError) {
      setFeedback({ message: signUpError.message.toUpperCase(), isError: true });
      setIsLoading(false);
      return;
    }

    setFeedback({
      message: "PERSONNEL ACCOUNT CREATED. LOGGING YOU IN...",
      isError: false,
    });

    // Auto-login newly registered employee
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!loginError) {
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } else {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password Request
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    const siteOrigin = typeof window !== "undefined" ? window.location.origin : "";
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteOrigin}/reset-password`,
    });

    setIsLoading(false);

    if (resetError) {
      setFeedback({ message: resetError.message.toUpperCase(), isError: true });
    } else {
      setFeedback({
        message: "PASSWORD RESET LINK SENT. CHECK YOUR EMAIL INBOX.",
        isError: false,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] flex flex-col justify-between relative font-mono text-slate-100 selection:bg-[#117AE0] selection:text-white overflow-hidden">
      
      {/* TACTICAL BLUEPRINT GRID BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:32px_32px] z-0" />
      {/* Radial Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0A0C10_100%)] pointer-events-none" />

      {/* PORTAL FORM WRAPPER */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-16 relative z-10 w-full">
        {/* MAIN CONTAINER CARD (RESIZED & ELEVATED) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-lg bg-[#131720] border border-slate-800/80 border-t-slate-700/50 p-8 sm:p-10 shadow-2xl relative z-10 rounded-sm"
        >
          {/* BRIGHT NAVY ACCENT LINE ON CARD TOP */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[#117AE0]" />

          <div className="relative z-10">
            {/* HEADER */}
            <div className="mb-8 space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight uppercase flex items-center gap-2.5">
                <span className="w-2 h-2 bg-[#117AE0] animate-pulse rounded-none" />
                {mode === "login" && "Employee Portal"}
                {mode === "gate" && "Site Authorization"}
                {mode === "signup" && "New Registration"}
                {mode === "forgot" && "Reset Access"}
              </h1>
              <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold">
                IMC Personnel Systems
              </p>
            </div>

            {/* DUAL MODE NAV TAB TOGGLE */}
            {(mode === "login" || mode === "gate" || mode === "signup") && (
              <div className="grid grid-cols-2 gap-1 bg-[#0F1115] p-1 border border-slate-800/80 mb-8 rounded-sm">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setFeedback(null);
                  }}
                  className={`py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer rounded-sm ${
                    mode === "login"
                      ? "bg-[#117AE0] text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("gate");
                    setFeedback(null);
                  }}
                  className={`py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer rounded-sm ${
                    mode === "gate" || mode === "signup"
                      ? "bg-[#117AE0] text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* FEEDBACK & FAULT BANNER */}
            {feedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`mb-6 p-3 text-[10px] font-mono uppercase tracking-wider border text-center ${
                  feedback.isError
                    ? "bg-red-950/30 border-red-500/50 text-red-400"
                    : "bg-emerald-950/30 border-emerald-500/50 text-emerald-400"
                }`}
              >
                [{feedback.isError ? "AUTH_FAULT" : "CONFIRMED"}] {feedback.message}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {/* SCREEN 1: LOGIN FORM */}
              {mode === "login" && (
                <motion.form
                  key="login-screen"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleLogin}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <label className="block text-slate-300 text-[10px] font-bold uppercase tracking-widest">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0F1115] border border-slate-800 text-slate-100 px-4 py-3 focus:outline-none focus:border-[#117AE0] transition-colors rounded-sm text-xs font-mono"
                      placeholder="Enter Your Email"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-slate-300 text-[10px] font-bold uppercase tracking-widest">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode("forgot");
                          setFeedback(null);
                        }}
                        className="text-[#117AE0] text-[9px] uppercase font-bold hover:text-white transition-colors cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#0F1115] border border-slate-800 text-slate-100 px-4 py-3 pr-12 focus:outline-none focus:border-[#117AE0] transition-colors rounded-sm tracking-widest text-xs font-mono"
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-200 uppercase font-bold px-1 transition-colors"
                      >
                        {showLoginPassword ? "HIDE" : "SHOW"}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#117AE0] text-white font-bold uppercase tracking-[0.2em] py-3.5 mt-2 hover:bg-white hover:text-black transition-all duration-200 shadow-[0_0_15px_rgba(17,122,224,0.25)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs"
                  >
                    {isLoading ? "Authenticating..." : "Sign In ↗"}
                  </button>
                </motion.form>
              )}

              {/* SCREEN 2: REGISTRATION GATE PASSCODE */}
              {mode === "gate" && (
                <motion.form
                  key="gate-screen"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleVerifyGate}
                  className="space-y-5"
                >
                  <div className="bg-[#0F1115] border border-slate-800/80 p-4 rounded-sm">
                    <p className="text-[10px] text-slate-300 uppercase tracking-wider leading-relaxed">
                      <strong className="text-[#117AE0]">RESTRICTED REGISTRATION:</strong> Enter the site authorization password provided by employer to unlock account registration.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-slate-300 text-[10px] font-bold uppercase tracking-widest">
                      Authorization Key
                    </label>
                    <div className="relative">
                      <input
                        type={showGatePasscode ? "text" : "password"}
                        value={gatePasscode}
                        onChange={(e) => setGatePasscode(e.target.value)}
                        className={`w-full bg-[#0F1115] border px-4 py-3 pr-12 focus:outline-none text-slate-100 transition-colors rounded-sm tracking-widest text-xs font-mono ${
                          gateError ? "border-red-500" : "border-slate-800 focus:border-[#117AE0]"
                        }`}
                        placeholder="Enter Authorization Passcode"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowGatePasscode(!showGatePasscode)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-200 uppercase font-bold px-1 transition-colors"
                      >
                        {showGatePasscode ? "HIDE" : "SHOW"}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#117AE0] text-white font-bold uppercase tracking-[0.2em] py-3.5 mt-2 hover:bg-white hover:text-black transition-all duration-200 shadow-[0_0_15px_rgba(17,122,224,0.25)] hover:-translate-y-0.5 cursor-pointer text-xs"
                  >
                    Verify Key & Unlock 🔓
                  </button>
                </motion.form>
              )}

              {/* SCREEN 3: EMPLOYEE REGISTRATION FORM */}
              {mode === "signup" && (
                <motion.form
                  key="signup-screen"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleSignUp}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-slate-300 text-[9px] font-bold uppercase tracking-widest">
                        First Name
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Name"
                        className="w-full bg-[#0F1115] border border-slate-800 text-slate-100 p-2.5 text-xs outline-none focus:border-[#117AE0] transition-colors rounded-sm font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-slate-300 text-[9px] font-bold uppercase tracking-widest">
                        Last Name
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                        className="w-full bg-[#0F1115] border border-slate-800 text-slate-100 p-2.5 text-xs outline-none focus:border-[#117AE0] transition-colors rounded-sm font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-300 text-[9px] font-bold uppercase tracking-widest">
                      Assigned Worksite
                    </label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-[#0F1115] border border-slate-800 text-slate-100 p-2.5 text-xs outline-none focus:border-[#117AE0] transition-colors rounded-sm cursor-pointer font-mono"
                    >
                      <option value="Nestle Springville">Nestle Springville</option>
                      <option value="Nestle Jonesboro">Nestle Jonesboro</option>
                      <option value="Springville Shop">Springville Shop</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-300 text-[9px] font-bold uppercase tracking-widest">
                      Work Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter Your Email"
                      className="w-full bg-[#0F1115] border border-slate-800 text-slate-100 p-2.5 text-xs outline-none focus:border-[#117AE0] transition-colors rounded-sm font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-300 text-[9px] font-bold uppercase tracking-widest">
                      Create Password
                    </label>
                    <div className="relative">
                      <input
                        type={showSignupPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#0F1115] border border-slate-800 text-slate-100 p-2.5 pr-12 text-xs outline-none focus:border-[#117AE0] transition-colors rounded-sm tracking-widest font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 hover:text-slate-200 uppercase font-bold px-1 transition-colors"
                      >
                        {showSignupPassword ? "HIDE" : "SHOW"}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-300 text-[9px] font-bold uppercase tracking-widest">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full bg-[#0F1115] border text-slate-100 p-2.5 pr-12 text-xs outline-none transition-colors rounded-sm tracking-widest font-mono ${
                          confirmPassword && password !== confirmPassword
                            ? "border-red-500 focus:border-red-500"
                            : "border-slate-800 focus:border-[#117AE0]"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 hover:text-slate-200 uppercase font-bold px-1 transition-colors"
                      >
                        {showConfirmPassword ? "HIDE" : "SHOW"}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#117AE0] text-white font-bold uppercase tracking-[0.2em] py-3.5 mt-2 hover:bg-white hover:text-black transition-all duration-200 shadow-[0_0_15px_rgba(17,122,224,0.25)] hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer text-xs"
                  >
                    {isLoading ? "Creating Profile..." : "Complete Registration ↗"}
                  </button>
                </motion.form>
              )}

              {/* SCREEN 4: FORGOT PASSWORD REQUEST */}
              {mode === "forgot" && (
                <motion.form
                  key="forgot-screen"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleForgotPassword}
                  className="space-y-5"
                >
                  <div className="bg-[#0F1115] border border-slate-800/80 p-4 rounded-sm">
                    <p className="text-[10px] text-slate-300 uppercase tracking-wider leading-relaxed">
                      Enter your registered work email address below. We will dispatch a secure link to reset your account password.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-slate-300 text-[10px] font-bold uppercase tracking-widest">
                      Registered Work Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter Your Email"
                      className="w-full bg-[#0F1115] border border-slate-800 text-slate-100 px-4 py-3 focus:outline-none focus:border-[#117AE0] transition-colors rounded-sm text-xs font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#117AE0] text-white font-bold uppercase tracking-[0.2em] py-3.5 mt-2 hover:bg-white hover:text-black transition-all duration-200 shadow-[0_0_15px_rgba(17,122,224,0.25)] hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer text-xs"
                  >
                    {isLoading ? "Sending Instructions..." : "Send Reset Link ✉"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setFeedback(null);
                    }}
                    className="w-full text-center text-slate-400 hover:text-[#117AE0] transition-colors text-[10px] uppercase font-bold tracking-widest pt-2 cursor-pointer block"
                  >
                    ← Return to Personnel Login
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        
        {/* FLOATING FOOTER AUDIT WARNING */}
        <div className="mt-8 text-center px-4 relative z-10">
          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">
            System IP logged. Unauthorized access is strictly prohibited.
          </p>
        </div>
      </div>

      {/* FULL SITE FOOTER */}
      <Footer />
    </div>
  );
}