"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  locations?: string[];
}

export default function AddEmployeeModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  locations: initialLocations 
}: AddEmployeeModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [role, setRole] = useState("employee");

  const [availableLocations, setAvailableLocations] = useState<string[]>(initialLocations || []);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [supabase] = useState(() => createClient());

  // Fetch locations from Supabase database when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (initialLocations && initialLocations.length > 0) {
      setAvailableLocations(initialLocations);
      if (!location) setLocation(initialLocations[0]);
      return;
    }

    async function fetchLocations() {
      setLoadingLocations(true);
      try {
        const { data, error } = await supabase
          .from("locations")
          .select("name")
          .order("name", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          const names = data.map((loc) => loc.name);
          setAvailableLocations(names);
          setLocation((prev) => (prev ? prev : names[0]));
        } else {
          // Fallback if table returned no rows
          const fallback = ["Springville Shop", "Nestle Gaffney", "Nestle Springville"];
          setAvailableLocations(fallback);
          setLocation((prev) => (prev ? prev : fallback[0]));
        }
      } catch (err) {
        console.error("Failed to load locations from database:", err);
        const fallback = ["Springville Shop", "Nestle Gaffney", "Nestle Springville"];
        setAvailableLocations(fallback);
        setLocation((prev) => (prev ? prev : fallback[0]));
      } finally {
        setLoadingLocations(false);
      }
    }

    fetchLocations();
  }, [isOpen, initialLocations, supabase]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Active session lost. Please log in again.");
      }

      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          firstName: firstName.trim(), 
          lastName: lastName.trim(), 
          nickname: nickname.trim(), 
          email: email.trim().toLowerCase(), 
          location, 
          role 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to provision employee.");
      }

      setSuccessMsg(`Account created for ${email}! Default login password: Imc123`);
      setFirstName("");
      setLastName("");
      setNickname("");
      setEmail("");
      
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create employee.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-mono select-none overscroll-contain">
      <div className="w-full max-w-md bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] p-5 sm:p-6 shadow-2xl relative rounded-sm">
        
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-blue)]" />

        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-[var(--color-brand-border)] pb-3 mb-4">
          <h2 className="text-sm sm:text-base font-black text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 bg-[var(--color-brand-blue)] animate-pulse rounded-none" />
            Provision New Employee
          </h2>
          <button 
            type="button"
            onClick={onClose} 
            className="text-slate-400 hover:text-white active:text-white min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 font-bold text-sm cursor-pointer transition-all active:scale-90 touch-manipulation focus:outline-none"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="mb-4 p-3 border border-[var(--color-brand-red,#ff3b5c)]/40 bg-[var(--color-brand-red,#ff3b5c)]/10 text-[var(--color-brand-red,#ff3b5c)] text-xs font-bold uppercase rounded-sm">
            [ERROR] {errorMsg}
          </div>
        )}

        {/* Success Alert Box */}
        {successMsg && (
          <div className="mb-4 p-3 border border-[var(--color-brand-green,#00ff9d)]/40 bg-[var(--color-brand-green,#00ff9d)]/10 text-[var(--color-brand-green,#00ff9d)] text-xs font-bold uppercase rounded-sm">
            [SUCCESS] {successMsg}
          </div>
        )}

        {/* Employee Provisioning Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Parker"
                className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] focus:ring-1 focus:ring-[var(--color-brand-blue)] p-3 text-[16px] sm:text-xs text-slate-100 outline-none rounded-sm transition-all touch-manipulation"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Test"
                className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] focus:ring-1 focus:ring-[var(--color-brand-blue)] p-3 text-[16px] sm:text-xs text-slate-100 outline-none rounded-sm transition-all touch-manipulation"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">Nickname (Optional)</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Parker Test"
              className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] focus:ring-1 focus:ring-[var(--color-brand-blue)] p-3 text-[16px] sm:text-xs text-slate-100 outline-none rounded-sm transition-all touch-manipulation"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="employee@domain.com"
              className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] focus:ring-1 focus:ring-[var(--color-brand-blue)] p-3 text-[16px] sm:text-xs text-slate-100 outline-none rounded-sm transition-all touch-manipulation"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">
                Location {loadingLocations && <span className="lowercase text-slate-500 font-normal">(loading...)</span>}
              </label>
              <select
                value={location}
                disabled={loadingLocations || availableLocations.length === 0}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] focus:ring-1 focus:ring-[var(--color-brand-blue)] p-3 text-[16px] sm:text-xs text-slate-100 outline-none cursor-pointer rounded-sm transition-all touch-manipulation disabled:opacity-50"
              >
                {availableLocations.map((loc) => (
                  <option key={loc} value={loc} className="bg-[var(--color-brand-card)] text-white">
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] focus:ring-1 focus:ring-[var(--color-brand-blue)] p-3 text-[16px] sm:text-xs text-slate-100 outline-none cursor-pointer rounded-sm transition-all touch-manipulation"
              >
                <option value="employee" className="bg-[var(--color-brand-card)] text-white">Employee</option>
                <option value="manager" className="bg-[var(--color-brand-card)] text-white">Manager</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              type="submit"
              disabled={loading || loadingLocations}
              className="flex-1 min-h-[44px] py-3 px-4 bg-[var(--color-brand-blue)] hover:bg-white hover:text-black active:bg-slate-200 text-white font-black text-xs uppercase tracking-widest transition-all duration-200 disabled:opacity-50 cursor-pointer rounded-sm shadow-md active:scale-[0.98] touch-manipulation focus:outline-none"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-3 bg-[var(--color-brand-bg)] hover:bg-slate-800 active:bg-slate-900 border border-[var(--color-brand-border)] hover:border-slate-500 text-slate-300 hover:text-white font-black text-xs uppercase transition-all cursor-pointer rounded-sm active:scale-[0.98] touch-manipulation focus:outline-none"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}