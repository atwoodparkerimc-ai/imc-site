"use client";

import { useState, useEffect, useRef } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { 
  UserProfile, 
  getEmployeeCertifications, 
  upsertEmployeeCertification,
  EvaluatedCert 
} from "@/lib/db/operations";

interface EmployeeCertManagerProps {
  supabase: SupabaseClient;
  allUsers: UserProfile[];
}

export default function EmployeeCertManager({ supabase, allUsers = [] }: EmployeeCertManagerProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [certs, setCerts] = useState<EvaluatedCert[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ key: string; msg: string; isError: boolean } | null>(null);

  // Form edit state map: { [cert_type]: { issueDate: string, expirationDate: string } }
  const [editDates, setEditDates] = useState<Record<string, { issueDate: string; expirationDate: string }>>({});

  // Input refs for picker triggers
  const issueInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const expInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (allUsers.length > 0 && !selectedUserId) {
      setSelectedUserId(allUsers[0].id);
    }
  }, [allUsers, selectedUserId]);

  useEffect(() => {
    async function loadUserCerts() {
      if (!selectedUserId) return;
      setLoading(true);
      const selectedUser = allUsers.find(u => u.id === selectedUserId);
      const userRole = selectedUser?.role || 'employee';
      const userCerts = await getEmployeeCertifications(supabase, selectedUserId, userRole);
      setCerts(userCerts);

      const dateMap: Record<string, { issueDate: string; expirationDate: string }> = {};
      userCerts.forEach(c => {
        dateMap[c.typeKey] = {
          issueDate: c.issueDate || "",
          expirationDate: c.expirationDate || ""
        };
      });
      setEditDates(dateMap);
      setLoading(false);
    }
    loadUserCerts();
  }, [selectedUserId, supabase, allUsers]);

  const handleSaveCert = async (certKey: string) => {
    if (!selectedUserId) return;
    setSavingKey(certKey);
    setFeedback(null);

    const dates = editDates[certKey] || { issueDate: "", expirationDate: "" };

    const res = await upsertEmployeeCertification(supabase, {
      employee_id: selectedUserId,
      cert_type: certKey,
      issue_date: dates.issueDate || null,
      expiration_date: dates.expirationDate || null
    });

    if (res.success) {
      setFeedback({ key: certKey, msg: "Saved", isError: false });
      const selectedUser = allUsers.find(u => u.id === selectedUserId);
      const userCerts = await getEmployeeCertifications(supabase, selectedUserId, selectedUser?.role || 'employee');
      setCerts(userCerts);
    } else {
      setFeedback({ key: certKey, msg: res.error || "Failed", isError: true });
    }

    setSavingKey(null);
  };

  const openPicker = (ref: HTMLInputElement | null) => {
    if (ref && 'showPicker' in ref && typeof ref.showPicker === 'function') {
      try {
        ref.showPicker();
      } catch (err) {
        ref.focus();
      }
    } else if (ref) {
      ref.focus();
    }
  };

  return (
    <div className="border p-4 sm:p-6 shadow-2xl relative overflow-hidden group font-mono rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)]">
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-border)] group-hover:bg-[var(--color-brand-blue)] transition-colors duration-300" />
      
      {/* Header & Target User Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--color-brand-border)]">
        <div>
          <h2 className="text-slate-100 font-black uppercase tracking-widest text-sm sm:text-base flex items-center gap-2">
            <span className="w-2 h-2 rounded-none animate-pulse bg-[var(--color-brand-blue)]" />
            Employee Training & Certifications
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            Update certification audit records and compliance dates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest">SELECT:</span>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="text-xs text-slate-200 font-bold uppercase py-2 px-3 outline-none transition-colors cursor-pointer rounded-sm border bg-[var(--color-brand-card)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)]"
          >
            {(allUsers || []).map((u) => (
              <option key={u.id} value={u.id} className="bg-[var(--color-brand-card)]">
                {u.nickname || (u as any).full_name || u.first_name || "User"} {u.role === 'manager' ? '(Manager)' : ''} ({u.location || "Shop"})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs font-bold text-[var(--color-brand-blue)] uppercase animate-pulse">
          Loading Certification Matrix...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {certs.map((cert) => {
            const currentDates = editDates[cert.typeKey] || { issueDate: "", expirationDate: "" };
            const isSaving = savingKey === cert.typeKey;
            const certFeedback = feedback?.key === cert.typeKey ? feedback : null;

            return (
              <div 
                key={cert.typeKey} 
                className="p-3 border flex flex-col justify-between gap-3 transition-colors duration-150 rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] hover:border-[var(--color-brand-blue)]/50"
              >
                {/* Title & Badge */}
                <div className="flex justify-between items-start gap-2">
                  <p className="font-bold text-slate-100 text-xs uppercase truncate">
                    {cert.title}
                  </p>
                  <span 
                    className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-none flex-shrink-0 ${
                      cert.status === 'VALID' 
                        ? 'text-[var(--color-brand-green,#00ff9d)] border-[var(--color-brand-green,#00ff9d)]/40 bg-[var(--color-brand-green,#00ff9d)]/10'
                        : cert.status === 'EXPIRING_SOON'
                        ? 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10'
                        : cert.status === 'EXPIRED'
                        ? 'text-[var(--color-brand-red,#f87171)] border-[var(--color-brand-red,#f87171)]/40 bg-[var(--color-brand-red,#f87171)]/10'
                        : 'text-slate-400 border-[var(--color-brand-border)] bg-[var(--color-brand-card)]'
                    }`}
                  >
                    {cert.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Date Inputs with Hidden Browser Indicator & Single White Calendar Trigger */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--color-brand-border)]/50">
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                      Issue Date
                    </label>
                    <div className="relative flex items-center">
                      <input 
                        ref={(el) => { issueInputRefs.current[cert.typeKey] = el; }}
                        type="date"
                        value={currentDates.issueDate}
                        onChange={(e) => setEditDates({
                          ...editDates,
                          [cert.typeKey]: { ...currentDates, issueDate: e.target.value }
                        })}
                        style={{ colorScheme: 'dark' }}
                        className="w-full text-[10px] font-mono p-1.5 pr-7 rounded-sm border bg-[var(--color-brand-card)] border-[var(--color-brand-border)] text-slate-100 outline-none focus:border-[var(--color-brand-blue)] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:w-0 [&::-webkit-calendar-picker-indicator]:p-0"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => openPicker(issueInputRefs.current[cert.typeKey])}
                        className="absolute right-1.5 text-slate-300 hover:text-white cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                          <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                      Expiration Date
                    </label>
                    <div className="relative flex items-center">
                      <input 
                        ref={(el) => { expInputRefs.current[cert.typeKey] = el; }}
                        type="date"
                        value={currentDates.expirationDate}
                        onChange={(e) => setEditDates({
                          ...editDates,
                          [cert.typeKey]: { ...currentDates, expirationDate: e.target.value }
                        })}
                        style={{ colorScheme: 'dark' }}
                        className="w-full text-[10px] font-mono p-1.5 pr-7 rounded-sm border bg-[var(--color-brand-card)] border-[var(--color-brand-border)] text-slate-100 outline-none focus:border-[var(--color-brand-blue)] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:w-0 [&::-webkit-calendar-picker-indicator]:p-0"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => openPicker(expInputRefs.current[cert.typeKey])}
                        className="absolute right-1.5 text-slate-300 hover:text-white cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                          <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Feedback Indicator */}
                {certFeedback && (
                  <p className={`text-[9px] font-bold uppercase tracking-wider text-center ${certFeedback.isError ? 'text-[var(--color-brand-red,#f87171)]' : 'text-[var(--color-brand-green,#00ff9d)]'}`}>
                    [{certFeedback.isError ? 'ERROR' : 'SUCCESS'}] {certFeedback.msg}
                  </p>
                )}

                {/* Save Record Action Button */}
                <button
                  onClick={() => handleSaveCert(cert.typeKey)}
                  disabled={isSaving}
                  className="w-full py-1.5 text-[10px] font-bold uppercase tracking-widest border border-[var(--color-brand-blue)] bg-[var(--color-brand-blue)]/10 text-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue)] hover:text-black transition-colors disabled:opacity-50 cursor-pointer rounded-sm"
                >
                  {isSaving ? "Saving..." : "Save Record"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}