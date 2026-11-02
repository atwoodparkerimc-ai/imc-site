// app/(dashboard)/manager/_components/AuditFormsManager.tsx
"use client";

import { useState } from "react";
import MonthlyRiskPredictionAudit from "./MonthlyRiskPredictionAudit";
import DailySafetyCheckManager from "./DailySafetyCheckManager";
import EmployeeInspectionsHub from "./EmployeeInspectionsHub";
import GrinderInspectionManager from "./GrinderInspectionManager";

interface AuditFormsManagerProps {
  supabase: any;
  currentUserId: string;
  currentUserName: string;
  selectedLocation?: string;
  locations?: string[];
}

export default function AuditFormsManager({
  supabase,
  currentUserId,
  currentUserName,
  selectedLocation = "Nestle Springville",
  locations = ["Nestle Springville", "Springville Shop"],
}: AuditFormsManagerProps) {
  const [activeFormTab, setActiveFormTab] = useState<
    "risk_prediction" | "safety_checks" | "employee_inspections" | "grinder"
  >("risk_prediction");

  return (
    <div className="space-y-4 sm:space-y-6 font-mono text-slate-100 select-none pb-12">
      {/* AUDIT FORMS NAVIGATION BAR */}
      <div className="border p-2 sm:p-2.5 rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveFormTab("risk_prediction")}
          className={`min-h-[40px] px-3.5 sm:px-4 py-2 text-xs font-black uppercase tracking-wider rounded-sm transition-all whitespace-nowrap cursor-pointer ${
            activeFormTab === "risk_prediction"
              ? "bg-[var(--color-brand-blue)] text-white shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          1. Risk Prediction Audit
        </button>

        <button
          type="button"
          onClick={() => setActiveFormTab("safety_checks")}
          className={`min-h-[40px] px-3.5 sm:px-4 py-2 text-xs font-black uppercase tracking-wider rounded-sm transition-all whitespace-nowrap cursor-pointer ${
            activeFormTab === "safety_checks"
              ? "bg-[var(--color-brand-blue)] text-white shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          2. Daily Safety Checks
        </button>

        {/* TAB 3: ALL EMPLOYEE INSPECTIONS */}
        <button
          type="button"
          onClick={() => setActiveFormTab("employee_inspections")}
          className={`min-h-[40px] px-3.5 sm:px-4 py-2 text-xs font-black uppercase tracking-wider rounded-sm transition-all whitespace-nowrap cursor-pointer ${
            activeFormTab === "employee_inspections"
              ? "bg-[var(--color-brand-blue)] text-white shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          3. All Employee Inspections
        </button>

        <button
          type="button"
          onClick={() => setActiveFormTab("grinder")}
          className={`min-h-[40px] px-3.5 sm:px-4 py-2 text-xs font-black uppercase tracking-wider rounded-sm transition-all whitespace-nowrap cursor-pointer ${
            activeFormTab === "grinder"
              ? "bg-[var(--color-brand-blue)] text-white shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          4. Grinder Safety Audits
        </button>
      </div>

      {/* FORM 1: MONTHLY RISK PREDICTION AUDIT */}
      {activeFormTab === "risk_prediction" && (
        <MonthlyRiskPredictionAudit
          supabase={supabase}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
        />
      )}

      {/* FORM 2: DAILY SAFETY CHECKS */}
      {activeFormTab === "safety_checks" && (
        <DailySafetyCheckManager
          supabase={supabase}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          selectedLocation={selectedLocation}
          locations={locations}
        />
      )}

      {/* FORM 3: ALL EMPLOYEE INSPECTIONS */}
      {activeFormTab === "employee_inspections" && (
        <EmployeeInspectionsHub
          supabase={supabase}
          selectedLocation={selectedLocation}
        />
      )}

      {/* FORM 4: GRINDER SAFETY AUDITS */}
      {activeFormTab === "grinder" && (
        <GrinderInspectionManager
          supabase={supabase}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
        />
      )}
    </div>
  );
}