"use client";

import { motion, AnimatePresence } from "framer-motion";

interface NotificationRecord {
  id: string;
  user_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface UnreadRecognitionModalProps {
  notification: NotificationRecord | null;
  onDismiss: () => void;
}

export default function UnreadRecognitionModal({
  notification,
  onDismiss,
}: UnreadRecognitionModalProps) {
  if (!notification) return null;

  // Extract points amount if present in message string (e.g. "+10 PTS" or "200 PTS")
  const pointsMatch = notification.message.match(/(\+\d+|\d+)\s*PTS/i);
  const pointsDisplay = pointsMatch ? pointsMatch[0].toUpperCase() : "POINTS AWARDED";

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-mono select-none"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full max-w-sm border-2 border-[var(--color-brand-green,#00ff9d)] bg-[var(--color-brand-card)] p-6 rounded-sm shadow-[0_0_30px_rgba(0,255,157,0.25)] relative overflow-hidden text-center tactical-card"
        >
          {/* Top Green Accent Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-brand-green,#00ff9d)] animate-pulse" />

          {/* Header Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/50 border border-[var(--color-brand-green,#00ff9d)]/40 text-[9px] font-black uppercase tracking-widest text-[var(--color-brand-green,#00ff9d)] mb-4 rounded-xs">
            <span className="w-1.5 h-1.5 bg-[var(--color-brand-green,#00ff9d)] animate-ping" />
            RECOGNITION RECEIVED
          </div>

          {/* Large Point Counter Display */}
          <div className="my-2">
            <h2 className="text-4xl sm:text-5xl font-black text-[var(--color-brand-green,#00ff9d)] tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(0,255,157,0.3)]">
              {pointsDisplay}
            </h2>
          </div>

          {/* Message Body */}
          <div className="my-4 p-3.5 border border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] rounded-sm text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              TRANSFER DETAILS //
            </p>
            <p className="text-xs sm:text-sm font-bold text-slate-100 leading-relaxed uppercase">
              {notification.message}
            </p>
          </div>

          {/* Claim / Dismiss Button */}
          <button
            type="button"
            onClick={onDismiss}
            className="w-full min-h-[44px] py-3.5 px-4 bg-[var(--color-brand-green,#00ff9d)] hover:bg-white active:bg-slate-200 border border-[var(--color-brand-green,#00ff9d)] hover:border-white text-[#0a0a0a] font-black text-xs uppercase tracking-[0.2em] transition-all cursor-pointer rounded-sm shadow-md active:scale-[0.98] touch-manipulation focus:outline-none mt-2"
          >
            Acknowledge & Collect ↗
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}