"use client";

import { useState, useEffect, useMemo } from "react";
import {
  DailyToolInspectionRecord,
  getToolInspectionsLedger,
} from "@/lib/db/operations";
import { printToolInspectionLedger } from "@/lib/reports/toolInspectionPrint";

interface ToolInspectionAuditPanelProps {
  supabase: any;
  selectedLocation: string;
}

type TimeframePreset = "TODAY" | "WEEK" | "MONTH" | "CUSTOM";

export default function ToolInspectionAuditPanel({
  supabase,
  selectedLocation,
}: ToolInspectionAuditPanelProps) {
  const [preset, setPreset] = useState<TimeframePreset>("WEEK");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [records, setRecords] = useState<DailyToolInspectionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize dates based on preset
  useEffect(() => {
    const now = new Date();
    const endStr = now.toISOString().split("T")[0];

    if (preset === "TODAY") {
      setStartDate(endStr);
      setEndDate(endStr);
    } else if (preset === "WEEK") {
      const past = new Date();
      past.setDate(now.getDate() - 7);
      setStartDate(past.toISOString().split("T")[0]);
      setEndDate(endStr);
    } else if (preset === "MONTH") {
      const past = new Date();
      past.setDate(now.getDate() - 30);
      setStartDate(past.toISOString().split("T")[0]);
      setEndDate(endStr);
    }
  }, [preset]);

  // Fetch inspections whenever date range or location changes
  useEffect(() => {
    async function fetchLedger() {
      if (!startDate || !endDate) return;
      setIsLoading(true);

      const data = await getToolInspectionsLedger(
        supabase,
        startDate,
        endDate,
        selectedLocation
      );
      setRecords(data);
      setIsLoading(false);
    }

    fetchLedger();
  }, [supabase, startDate, endDate, selectedLocation]);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return records;
    return records.filter(
      (r) =>
        r.employee_name.toLowerCase().includes(q) ||
        r.tape_color_verified.toLowerCase().includes(q) ||
        (r.tools_inspected || []).some((tool: string) => tool.toLowerCase().includes(q))
    );
  }, [records, searchQuery]);

  const handlePrint = () => {
    if (filteredRecords.length === 0) {
      alert("No inspection records found for the selected timeframe.");
      return;
    }
    const label =
      preset === "TODAY"
        ? `Shift Daily Audit (${startDate})`
        : preset === "WEEK"
        ? "Last 7 Days Ledger"
        : preset === "MONTH"
        ? "Last 30 Days Ledger"
        : `${startDate} to ${endDate}`;

    printToolInspectionLedger(filteredRecords, label);
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-mono text-slate-100 select-none">
      {/* HEADER CARD */}
      <div className="border p-4 sm:p-6 rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-none bg-[var(--color-brand-blue)] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand-blue)]">
              Equipment Compliance Verification • Nestlé Standard 5959-SHE-INS-0022
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black uppercase text-slate-100 mt-1">
            Tool Inspection Audit Logs
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-0.5">
            Site: <span className="text-white">{selectedLocation}</span> • Daily Hand & Power Tool Verification Ledgers
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          disabled={filteredRecords.length === 0 || isLoading}
          className="w-full md:w-auto min-h-[44px] px-6 py-2.5 text-xs font-black uppercase tracking-wider bg-[var(--color-brand-blue)] text-white hover:bg-white hover:text-black rounded-sm transition-all cursor-pointer shadow-[0_0_15px_rgba(0,136,255,0.25)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span>⎙</span>
          <span>Print Audit Ledger ({filteredRecords.length})</span>
        </button>
      </div>

      {/* FILTER & TIMEFRAME SELECTOR */}
      <div className="border rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          {/* Preset Buttons */}
          <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 no-scrollbar">
            {(["TODAY", "WEEK", "MONTH", "CUSTOM"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPreset(p)}
                className={`px-3 py-1.5 text-xs font-bold uppercase rounded-sm border cursor-pointer whitespace-nowrap transition-colors ${
                  preset === p
                    ? "bg-[var(--color-brand-blue)] border-[var(--color-brand-blue)] text-white font-black"
                    : "bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] text-slate-400 hover:text-white"
                }`}
              >
                {p === "TODAY" ? "Today" : p === "WEEK" ? "Past 7 Days" : p === "MONTH" ? "Past 30 Days" : "Custom Range"}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH WORKER OR TOOL..."
              className="w-full px-3 py-2 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] text-xs text-slate-100 uppercase rounded-sm outline-none"
            />
          </div>
        </div>

        {/* Custom Date Pickers */}
        {preset === "CUSTOM" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[var(--color-brand-border)]">
            <div>
              <style>{`
                input[type="date"]::-webkit-calendar-picker-indicator {
                  filter: invert(1);
                  cursor: pointer;
                }
              `}</style>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ colorScheme: "dark" }}
                className="w-full px-3 py-2 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] text-slate-100 text-xs rounded-sm outline-none font-mono cursor-pointer"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ colorScheme: "dark" }}
                className="w-full px-3 py-2 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] text-slate-100 text-xs rounded-sm outline-none font-mono cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* INSPECTION LOG TABLE */}
      <div className="border rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] overflow-hidden">
        <div className="p-4 border-b border-[var(--color-brand-border)] flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
            Recorded Shifts ({filteredRecords.length})
          </span>
          <span className="text-[10px] text-emerald-400 font-bold uppercase">
            ✓ 100% Signed & Audited
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
            Loading tool inspection ledger...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
            [ No tool inspections logged for the selected dates ]
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[var(--color-brand-bg)] text-slate-400 uppercase text-[10px] border-b border-[var(--color-brand-border)]">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Monthly Tape</th>
                  <th className="p-3">Verified Tools</th>
                  <th className="p-3 text-right">Signed Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-brand-border)]">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 font-bold text-white whitespace-nowrap">
                      {r.inspection_date}
                    </td>
                    <td className="p-3 font-bold uppercase text-slate-200 whitespace-nowrap">
                      {r.employee_name}
                    </td>
                    <td className="p-3 text-[11px] text-slate-400 whitespace-nowrap uppercase">
                      {r.location}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-sm bg-amber-400/10 border border-amber-400/40 text-amber-300 font-black text-[10px] uppercase">
                        {r.tape_color_verified}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1 max-w-xl">
                        {(r.tools_inspected || []).map((tool: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-sm bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] text-slate-300"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-400 font-bold whitespace-nowrap text-[11px]">
                      {new Date(r.signed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}