"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddEmployeeModal({ isOpen, onClose, onSuccess }: AddEmployeeModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("Springville Shop");
  const [role, setRole] = useState("employee");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Initialize existing Supabase browser client
  const [supabase] = useState(() => createClient());

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

      const res = await fetch("/api/admin/create-employee", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ firstName, lastName, nickname, email, location, role }),
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
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: "var(--color-brand-bg)",
    borderColor: "var(--color-brand-border)",
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "var(--color-brand-blue)";
    e.currentTarget.style.boxShadow = "0 0 8px color-mix(in srgb, var(--color-brand-blue) 30%, transparent)";
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "var(--color-brand-border)";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-mono">
      <div 
        className="w-full max-w-md border p-6 shadow-2xl relative rounded-sm"
        style={{
          backgroundColor: "var(--color-brand-card)",
          borderColor: "var(--color-brand-border)",
        }}
      >
        {/* Top Accent Line */}
        <div 
          className="absolute top-0 left-0 w-full h-[2px]" 
          style={{ backgroundColor: "var(--color-brand-blue)" }}
        />

        <div 
          className="flex justify-between items-center border-b pb-3 mb-4"
          style={{ borderColor: "var(--color-brand-border)" }}
        >
          <h2 className="text-base font-black text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <span 
              className="w-2 h-2 animate-pulse rounded-none" 
              style={{ backgroundColor: "var(--color-brand-blue)" }}
            />
            Provision New Employee
          </h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-100 font-bold text-sm cursor-pointer outline-none focus:outline-none focus:ring-0"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div 
            className="mb-4 p-3 border text-xs font-bold uppercase rounded-sm"
            style={{
              backgroundColor: "color-mix(in srgb, var(--color-brand-red, #f87171) 10%, transparent)",
              borderColor: "color-mix(in srgb, var(--color-brand-red, #f87171) 40%, transparent)",
              color: "var(--color-brand-red, #f87171)"
            }}
          >
            [ERROR] {errorMsg}
          </div>
        )}

        {successMsg && (
          <div 
            className="mb-4 p-3 border text-xs font-bold uppercase rounded-sm"
            style={{
              backgroundColor: "color-mix(in srgb, var(--color-brand-green) 10%, transparent)",
              borderColor: "color-mix(in srgb, var(--color-brand-green) 40%, transparent)",
              color: "var(--color-brand-green)"
            }}
          >
            [SUCCESS] {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Parker"
                className="w-full border p-2 text-xs text-slate-100 outline-none focus:outline-none focus:ring-0 rounded-sm transition-colors"
                style={inputStyle}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
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
                className="w-full border p-2 text-xs text-slate-100 outline-none focus:outline-none focus:ring-0 rounded-sm transition-colors"
                style={inputStyle}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
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
              className="w-full border p-2 text-xs text-slate-100 outline-none focus:outline-none focus:ring-0 rounded-sm transition-colors"
              style={inputStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
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
              className="w-full border p-2 text-xs text-slate-100 outline-none focus:outline-none focus:ring-0 rounded-sm transition-colors"
              style={inputStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border p-2 text-xs text-slate-100 outline-none focus:outline-none focus:ring-0 cursor-pointer rounded-sm transition-colors"
                style={inputStyle}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              >
                <option value="Springville Shop" style={{ backgroundColor: "var(--color-brand-card)" }}>Springville Shop</option>
                <option value="Nestle Springville" style={{ backgroundColor: "var(--color-brand-card)" }}>Nestle Springville</option>
                <option value="Nestle Jonesboro" style={{ backgroundColor: "var(--color-brand-card)" }}>Nestle Jonesboro</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border p-2 text-xs text-slate-100 outline-none focus:outline-none focus:ring-0 cursor-pointer rounded-sm transition-colors"
                style={inputStyle}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              >
                <option value="employee" style={{ backgroundColor: "var(--color-brand-card)" }}>Employee</option>
                <option value="manager" style={{ backgroundColor: "var(--color-brand-card)" }}>Manager</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 font-black text-xs uppercase tracking-widest transition-all duration-200 disabled:opacity-50 cursor-pointer rounded-sm shadow-md outline-none focus:outline-none focus:ring-0"
              style={{
                backgroundColor: "var(--color-brand-blue)",
                color: "#ffffff"
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = "#ffffff";
                  e.currentTarget.style.color = "#0a0a0a";
                  e.currentTarget.style.boxShadow = "0 0 12px color-mix(in srgb, #ffffff 40%, transparent)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-brand-blue)";
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 border font-black text-xs uppercase transition-colors cursor-pointer rounded-sm outline-none focus:outline-none focus:ring-0"
              style={{
                backgroundColor: "var(--color-brand-bg)",
                borderColor: "var(--color-brand-border)",
                color: "rgb(148, 163, 184)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-brand-blue)";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-brand-border)";
                e.currentTarget.style.color = "rgb(148, 163, 184)";
              }}
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}