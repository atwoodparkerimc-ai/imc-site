"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { SafetyBriefing, BriefingSection } from "@/lib/data/safetyBriefings";

interface DailyBriefingModalProps {
  briefing: SafetyBriefing;
  isOpen: boolean;
  onComplete: () => void;
}

const REQUIRED_READ_SECONDS = 60;

export default function DailyBriefingModal({ briefing, isOpen, onComplete }: DailyBriefingModalProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(REQUIRED_READ_SECONDS);
  const [isTabActive, setIsTabActive] = useState<boolean>(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<"unanswered" | "correct" | "incorrect">("unanswered");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Active Screen Time Detection (Pauses if user leaves tab or minimizes)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabActive(document.visibilityState === "visible");
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    return () => window.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;

    if (isTabActive && secondsRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen, isTabActive, secondsRemaining]);

  if (!isOpen) return null;

  const isTimerComplete = secondsRemaining === 0;

  const handleSelectOption = (index: number) => {
    setSelectedOption(index);
    if (index === briefing.question.correct_index) {
      setAnswerState("correct");
    } else {
      setAnswerState("incorrect");
    }
  };

  const formatTimer = (sec: number): string => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Helper to cleanly render bullet titles with distinct contrast
  const renderBullet = (bullet: string) => {
    const cleanText = bullet.replace(/\*\*/g, "");
    const colonIndex = cleanText.indexOf(":");

    if (colonIndex !== -1) {
      const label = cleanText.substring(0, colonIndex);
      const text = cleanText.substring(colonIndex + 1);
      return (
        <span className="leading-relaxed">
          <strong className="text-white font-mono text-xs sm:text-sm uppercase tracking-wide font-bold mr-1.5">
            {label}:
          </strong>
          <span className="text-slate-300 font-sans text-xs sm:text-sm font-normal">
            {text}
          </span>
        </span>
      );
    }

    return <span className="text-slate-300 font-sans text-xs sm:text-sm leading-relaxed">{cleanText}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl h-full sm:h-auto sm:max-h-[92vh] flex flex-col rounded-none sm:rounded-sm shadow-2xl overflow-hidden relative border-0 sm:border bg-[var(--color-brand-card,#0f172a)] border-[var(--color-brand-border,#1e293b)] text-slate-100"
      >
        {/* Accent Top Blueprint Line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[var(--color-brand-blue,#0088ff)] via-[var(--color-brand-blue,#0088ff)] to-emerald-500" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 md:p-6 border-b border-[var(--color-brand-border,#1e293b)] flex flex-col sm:flex-row justify-between sm:items-center gap-3.5 shrink-0 bg-[var(--color-brand-bg,#080e1a)]">
          <div className="flex items-center gap-3 sm:gap-4">
            <img 
              src="/imclogo.svg" 
              alt="IMC Logo" 
              className="h-7 sm:h-8 md:h-9 w-auto object-contain max-w-[100px] sm:max-w-[120px] shrink-0" 
            />
            
            <div className="border-l border-[var(--color-brand-border,#1e293b)] pl-3 sm:pl-4">
              <div className="flex items-center gap-2 font-mono">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[var(--color-brand-blue,#0088ff)]">
                  {briefing.category}
                </span>
                <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-wider hidden xs:inline">
                  • DAILY COMPLIANCE
                </span>
              </div>
              <h2 className="text-base sm:text-lg md:text-xl font-black uppercase text-white tracking-tight mt-0.5 leading-snug">
                {briefing.title}
              </h2>
            </div>
          </div>

          {/* Dynamic Status Timer Pill */}
          <div className="flex items-center gap-2 font-mono self-start sm:self-center shrink-0">
            {!isTabActive && (
              <span className="text-[9px] sm:text-[10px] text-amber-400 font-bold uppercase tracking-wider animate-pulse border border-amber-500/40 bg-amber-500/10 px-2 py-1 rounded-sm">
                ⚠ PAUSED
              </span>
            )}
            <div className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-sm border text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
              isTimerComplete 
                ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]" 
                : "bg-[var(--color-brand-card,#0f172a)] border-[var(--color-brand-border,#1e293b)] text-slate-300"
            }`}>
              <span className={`w-2 h-2 rounded-full ${isTimerComplete ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
              {isTimerComplete ? "VERIFIED" : `READ LOCK: ${formatTimer(secondsRemaining)}`}
            </div>
          </div>
        </div>

        {/* Modal Body - Policy Content */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-5 sm:space-y-6 text-sm text-slate-200 leading-relaxed custom-scrollbar flex-1">
          
          {/* Briefing Intro */}
          <div className="p-3.5 sm:p-4 rounded-sm bg-[var(--color-brand-bg,#080e1a)] border-l-2 border-[var(--color-brand-blue,#0088ff)] border-t border-r border-b border-[var(--color-brand-border,#1e293b)]">
            <p className="text-slate-200 font-sans text-xs sm:text-sm md:text-base leading-relaxed">
              {briefing.intro}
            </p>
          </div>

          {/* Core Policy Highlight Card (Centered Directive Pill) */}
          {briefing.core_reminder && (
            <div className="p-4 sm:p-5 rounded-sm border border-[var(--color-brand-border,#1e293b)] bg-[var(--color-brand-bg,#080e1a)]/80 relative overflow-hidden shadow-sm flex flex-col items-center text-center space-y-3">
              <div className="flex justify-center w-full">
                <span className="font-mono text-[10px] sm:text-xs font-black uppercase tracking-widest px-3 py-1 rounded-xs border border-amber-500/40 bg-amber-500/10 text-amber-300">
                  CORE POLICY DIRECTIVE
                </span>
              </div>
              <p className="font-sans font-bold text-xs sm:text-sm md:text-base text-white leading-relaxed max-w-2xl">
                {briefing.core_reminder}
              </p>
            </div>
          )}

          {/* Policy Sections */}
          <div className="space-y-4">
            {briefing.sections.map((sec: BriefingSection, idx: number) => (
              <div 
                key={idx} 
                className="space-y-3 bg-[var(--color-brand-bg,#080e1a)]/50 p-4 sm:p-5 border border-[var(--color-brand-border,#1e293b)] rounded-sm"
              >
                <h3 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2 pb-2 border-b border-[var(--color-brand-border,#1e293b)]">
                  <span className="w-1.5 h-1.5 bg-[var(--color-brand-blue,#0088ff)] rounded-none" />
                  {sec.heading}
                </h3>
                <ul className="space-y-2.5">
                  {sec.bullets.map((bullet: string, bIdx: number) => (
                    <li key={bIdx} className="flex items-start gap-2.5">
                      <span className="text-[var(--color-brand-blue,#0088ff)] font-mono text-sm leading-none mt-1 shrink-0">›</span>
                      <div className="flex-1">
                        {renderBullet(bullet)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Comprehension Check Section */}
          <div className="pt-5 border-t border-[var(--color-brand-border,#1e293b)] font-mono">
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 mb-3">
              <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-slate-200 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[var(--color-brand-blue,#0088ff)]" />
                Comprehension Verification
              </h4>
              {!isTimerComplete && (
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  Unlocks in {formatTimer(secondsRemaining)}
                </span>
              )}
            </div>

            <div className={`p-4 sm:p-5 rounded-sm border transition-all ${
              isTimerComplete 
                ? "bg-[var(--color-brand-bg,#080e1a)] border-[var(--color-brand-blue,#0088ff)]/40 shadow-lg" 
                : "bg-black/30 border-[var(--color-brand-border,#1e293b)] opacity-50 pointer-events-none"
            }`}>
              <p className="font-sans font-bold text-xs sm:text-sm text-white mb-4 leading-relaxed">
                {briefing.question.prompt}
              </p>

              <div className="space-y-2.5 font-sans">
                {briefing.question.options.map((opt: string, oIdx: number) => {
                  const isSelected = selectedOption === oIdx;
                  const isCorrect = oIdx === briefing.question.correct_index;

                  let optionStyle = "border-[var(--color-brand-border,#1e293b)] bg-[var(--color-brand-card,#0f172a)] hover:border-slate-500 text-slate-200";
                  if (answerState !== "unanswered" && isSelected) {
                    optionStyle = isCorrect 
                      ? "border-emerald-500 bg-emerald-950/30 text-emerald-300 font-bold" 
                      : "border-red-500 bg-red-950/30 text-red-300 font-bold";
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={!isTimerComplete}
                      onClick={() => handleSelectOption(oIdx)}
                      className={`w-full text-left p-3 sm:p-3.5 rounded-sm border text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer gap-3 ${optionStyle}`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-xs border border-[var(--color-brand-border,#1e293b)] bg-[var(--color-brand-bg,#080e1a)] flex items-center justify-center font-mono text-[10px] font-black text-slate-300 shrink-0">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{opt}</span>
                      </span>
                      {answerState !== "unanswered" && isSelected && (
                        <span className="font-mono text-[10px] sm:text-xs font-black uppercase shrink-0">
                          {isCorrect ? "✓ CORRECT" : "✕ INCORRECT"}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Notifications */}
              {answerState === "incorrect" && (
                <div className="mt-3.5 p-3 bg-red-950/30 border border-red-500/40 rounded-sm text-xs font-sans text-red-200 flex items-start gap-2.5">
                  <span className="font-mono text-sm font-black">⚠</span>
                  <span>Incorrect selection. Review the policy above and choose the correct answer to unlock the checklist.</span>
                </div>
              )}

              {answerState === "correct" && (
                <div className="mt-3.5 p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-sm text-xs font-sans text-emerald-200 flex items-start gap-2.5">
                  <span className="font-mono text-sm font-black text-emerald-400">✓</span>
                  <span>{briefing.question.explanation}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 md:p-5 border-t border-[var(--color-brand-border,#1e293b)] bg-[var(--color-brand-bg,#080e1a)] flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0 font-mono">
          <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider text-center sm:text-left hidden xs:block">
            Verification required to complete shift sign-in.
          </p>

          <button
            type="button"
            disabled={!isTimerComplete || answerState !== "correct"}
            onClick={onComplete}
            className={`w-full sm:w-auto px-6 py-3 rounded-sm text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              isTimerComplete && answerState === "correct"
                ? "bg-[var(--color-brand-blue,#0088ff)] hover:bg-white hover:text-black text-white shadow-[0_0_15px_rgba(0,136,255,0.35)]"
                : "bg-[var(--color-brand-card,#0f172a)] border border-[var(--color-brand-border,#1e293b)] text-slate-500 cursor-not-allowed opacity-50"
            }`}
          >
            {answerState === "correct" 
              ? "Continue To Checklist ↗" 
              : !isTimerComplete 
              ? `Read Required (${secondsRemaining}s)` 
              : "Answer Verification"}
          </button>
        </div>

      </motion.div>
    </div>
  );
}