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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-mono">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          className="w-full max-w-sm border-2 p-6 rounded-sm shadow-2xl relative overflow-hidden text-center tactical-card"
          style={{
            backgroundColor: "var(--color-brand-card)",
            borderColor: "var(--color-brand-green, #00ff9d)",
            boxShadow: "0 0 30px color-mix(in srgb, var(--color-brand-green, #00ff9d) 25%, transparent)"
          }}
        >
          {/* Top Green Accent Line */}
          <div 
            className="absolute top-0 left-0 w-full h-1 animate-pulse" 
            style={{ backgroundColor: "var(--color-brand-green, #00ff9d)" }}
          />

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
            onClick={onDismiss}
            className="w-full py-3.5 font-black text-xs uppercase tracking-[0.2em] transition-all cursor-pointer rounded-sm shadow-md border outline-none mt-2"
            style={{
              backgroundColor: "var(--color-brand-green, #00ff9d)",
              borderColor: "var(--color-brand-green, #00ff9d)",
              color: "#0a0a0a"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#ffffff";
              e.currentTarget.style.borderColor = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-brand-green, #00ff9d)";
              e.currentTarget.style.borderColor = "var(--color-brand-green, #00ff9d)";
            }}
          >
            Acknowledge & Collect ↗
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}