// app/(dashboard)/manager/_components/EmployeeInspectionsHub.tsx
"use client";

import { useState } from "react";
import { 
  Truck, 
  ChevronsUp, 
  Maximize2, 
  ShieldAlert, 
  UtilityPole, 
  Wrench 
} from "lucide-react";

import ForkTruckAuditPanel from "./ForkTruckAuditPanel";
import ScissorLiftAuditPanel from "./ScissorLiftAuditPanel";
import BoomLiftAuditPanel from "./BoomLiftAuditPanel";
import FallProtectionAuditPanel from "./FallProtectionAuditPanel";
import LadderAuditPanel from "./LadderAuditPanel";
import ToolInspectionAuditPanel from "./ToolInspectionAuditPanel";

interface EmployeeInspectionsHubProps {
  supabase: any;
  selectedLocation: string;
}

export default function EmployeeInspectionsHub({
  supabase,
  selectedLocation,
}: EmployeeInspectionsHubProps) {
  const [subTab, setSubTab] = useState<
    "forklift" | "scissor_lift" | "boom_lift" | "fall_protection" | "ladders" | "tools"
  >("forklift");

  const tabs = [
    { id: "forklift", label: "Forklift / PIT", icon: Truck },
    { id: "scissor_lift", label: "Scissor Lift", icon: ChevronsUp },
    { id: "boom_lift", label: "Boom Lift", icon: Maximize2 },
    { id: "fall_protection", label: "Fall Protection", icon: ShieldAlert },
    { id: "ladders", label: "Ladders", icon: UtilityPole },
    { id: "tools", label: "Hand & Power Tools", icon: Wrench },
  ] as const;

  return (
    <div className="space-y-4 font-mono text-slate-100 select-none">
      {/* SUB-NAVIGATION BAR WITH VECTOR ICONS */}
      <div className="flex items-center gap-2 border-b border-[var(--color-brand-border)] pb-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-black uppercase tracking-wider rounded-sm transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-[var(--color-brand-blue)] text-white shadow-md"
                  : "bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-slate-400 hover:text-white"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {subTab === "forklift" && (
        <ForkTruckAuditPanel
          supabase={supabase}
          selectedLocation={selectedLocation}
        />
      )}

      {subTab === "scissor_lift" && (
        <ScissorLiftAuditPanel
          supabase={supabase}
          selectedLocation={selectedLocation}
        />
      )}

      {subTab === "boom_lift" && (
        <BoomLiftAuditPanel
          supabase={supabase}
          selectedLocation={selectedLocation}
        />
      )}

      {subTab === "fall_protection" && (
        <FallProtectionAuditPanel
          supabase={supabase}
          selectedLocation={selectedLocation}
        />
      )}

      {subTab === "ladders" && (
        <LadderAuditPanel
          supabase={supabase}
          selectedLocation={selectedLocation}
        />
      )}

      {subTab === "tools" && (
        <ToolInspectionAuditPanel
          supabase={supabase}
          selectedLocation={selectedLocation}
        />
      )}
    </div>
  );
}