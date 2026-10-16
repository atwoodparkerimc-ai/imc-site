"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AddSubcontractorModalProps {
  isOpen: boolean;
  locations: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddSubcontractorModal({
  isOpen,
  locations,
  onClose,
  onSuccess,
}: AddSubcontractorModalProps) {
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState(locations[0] || "Springville Shop");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ company: string; identifier: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessInfo(null);

    try {
      const res = await fetch("/api/admin/create-subcontractor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, password, location }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to create subcontractor profile.");
      }

      setSuccessInfo({
        company: data.user.companyName,
        identifier: data.user.syntheticEmail,
      });
      setIsLoading(false);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Network error");
      setIsLoading(false);
    }
  };

  const handleDone = () => {
    setCompanyName("");
    setPassword("");
    setSuccessInfo(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm select-none font-mono">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="w-full max-w-md border shadow-2xl rounded-sm p-4 sm:p-6 bg-[var(--color-brand-card)] border-[var(--color-brand-border)] text-slate-100 relative"
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-blue)]" />

          <div className="flex justify-between items-center border-b border-[var(--color-brand-border)] pb-3 mb-4">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-[var(--color-brand-blue)] animate-pulse" />
              Provision Subcontractor Entity
            </h3>
            <button
              type="button"
              onClick={handleDone}
              className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
            >
              ✕
            </button>
          </div>

          {successInfo ? (
            <div className="space-y-4 py-2">
              <div className="p-3.5 border rounded-sm bg-[var(--color-brand-green,#00ff9d)]/10 border-[var(--color-brand-green,#00ff9d)]/40 text-[var(--color-brand-green,#00ff9d)] text-xs">
                <p className="font-bold uppercase tracking-wider">✓ Subcontractor Profile Provisioned</p>
                <p className="text-slate-200 mt-2 font-mono">
                  Company: <strong>{successInfo.company}</strong>
                </p>
                <p className="text-slate-300 text-[11px] font-mono mt-1 break-all">
                  Login Identifier: <code>{successInfo.identifier}</code>
                </p>
              </div>

              <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                This entity can now log in using the assigned identifier & password to review safety briefings and submit worker attendance rosters.
              </p>

              <button
                type="button"
                onClick={handleDone}
                className="w-full min-h-[44px] bg-[var(--color-brand-blue)] text-white font-bold uppercase tracking-wider text-xs rounded-sm hover:bg-white hover:text-black cursor-pointer transition-colors"
              >
                Close & Return
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {errorMsg && (
                <div className="p-2.5 border rounded-sm bg-red-950/40 border-red-500/50 text-red-400 text-[11px]">
                  [PROVISION_FAULT] {errorMsg}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Subcontractor Company Name
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Apex Welding & Fab"
                  className="w-full min-h-[42px] px-3 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] text-slate-100 rounded-sm outline-none uppercase font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Assigned Project Worksite
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full min-h-[42px] px-3 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] text-slate-100 rounded-sm outline-none cursor-pointer"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc} className="bg-[var(--color-brand-card)]">
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Access PIN / Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full min-h-[42px] px-3 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] text-slate-100 rounded-sm outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={handleDone}
                  className="w-1/2 min-h-[44px] border border-[var(--color-brand-border)] text-slate-400 hover:text-white rounded-sm font-bold uppercase text-[11px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-1/2 min-h-[44px] bg-[var(--color-brand-blue)] text-white font-bold uppercase text-[11px] rounded-sm hover:bg-white hover:text-black cursor-pointer disabled:opacity-50 transition-colors"
                >
                  {isLoading ? "Provisioning..." : "Provision Entity ↗"}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}