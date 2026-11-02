// lib/db/riskPredictionOperations.ts
import { SupabaseClient } from "@supabase/supabase-js";

export type EliminateHazardStatus = 
  | "Complete & Detailed" 
  | "Vague / Generic" 
  | "Blank (Non-Compliant)";

export type AdditionalThoughtsStatus = 
  | "Meaningful Context Provided" 
  | "Minimal / One-word" 
  | "Blank (Non-Compliant)";

export type SpecificityScore = 
  | "High Detail (Actionable)" 
  | "Moderate Detail" 
  | "Unacceptable (Check-the-box only)";

export type ReactPromptStatus = 
  | "Specific, actionable response detailed" 
  | "Incomplete / Vague";

export type AuditQualityScore = 
  | "Meets Standards (Detailed & Complete)" 
  | "Needs Improvement" 
  | "Unsatisfactory";

export interface RiskPredictionAuditRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  auditor_id: string;
  auditor_name: string;
  audit_date: string;
  target_work_date: string;
  audited_location: string;

  pre_checks_selected: boolean;
  completed_by_location: boolean;
  others_involved: boolean;

  specific_hazards: boolean;
  precautions_checked: boolean;

  eliminate_hazard_status: EliminateHazardStatus;
  eliminate_hazard_notes: string;
  additional_thoughts_status: AdditionalThoughtsStatus;
  additional_thoughts_notes: string;

  job_desc_required: boolean;
  task1_breakdown: boolean;
  task2_breakdown: boolean;
  task3_breakdown: boolean;
  specificity_score: SpecificityScore;

  unexpected_events: boolean;
  react_prompt_status: ReactPromptStatus;
  react_prompt_notes: string;
  audit_quality_score: AuditQualityScore;

  strengths_notes: string;
  improvements_notes: string;
  coaching_completed: boolean;
  re_audit_scheduled: boolean;

  employee_signature: string;
  employee_signature_date: string;
  auditor_signature: string;
  auditor_signature_date: string;
  created_at?: string;
}

export interface EmployeeMonthlyAuditStatus {
  employee_id: string;
  employee_name: string;
  role: string;
  location: string;
  hasAuditThisMonth: boolean;
  latestAudit?: RiskPredictionAuditRecord;
}

/**
 * Strict location matcher for Nestlé Springville.
 * MUST include 'nestle' AND 'springville'.
 * STRICTLY REJECTS any mention of 'shop'.
 */
export function isStrictNestleSpringville(locationStr?: string | null): boolean {
  if (!locationStr) return false;
  const loc = locationStr.toLowerCase().trim();

  // Exclude any shop assignments immediately
  if (loc.includes("shop")) return false;

  // Must match both Nestle and Springville
  const hasNestle = loc.includes("nestle") || loc.includes("nestlé");
  const hasSpringville = loc.includes("springville");

  return hasNestle && hasSpringville;
}

/**
 * Fetch Springville-associated workers and evaluate whether
 * they have a completed audit in the specified calendar month (YYYY-MM).
 * Strictly restricts queries to Nestlé Springville only.
 */
export async function getMonthlyAuditRosterStatus(
  supabase: SupabaseClient,
  yearMonth: string
): Promise<EmployeeMonthlyAuditStatus[]> {
  const [year, month] = yearMonth.split("-").map(Number);
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  // 1. Fetch active employees (excluding subcontractors)
  const { data: profiles, error: pError } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, role, location, is_active")
    .neq("role", "subcontractor")
    .eq("is_active", true)
    .order("last_name", { ascending: true });

  if (pError || !profiles) {
    console.error("Failed to load profiles for audit roster:", pError);
    return [];
  }

  // 2. Filter strictly for Nestlé Springville (excludes Springville Shop, etc.)
  const nestleProfiles = profiles.filter((p) => isStrictNestleSpringville(p.location));

  // 3. Fetch audits for this calendar month
  const { data: audits, error: aError } = await supabase
    .from("risk_prediction_audits")
    .select("*")
    .gte("audit_date", startDate)
    .lte("audit_date", endDate);

  if (aError) {
    console.error("Failed to load monthly audits:", aError);
  }

  const auditMap = new Map<string, RiskPredictionAuditRecord>();
  (audits || []).forEach((audit) => {
    if (isStrictNestleSpringville(audit.audited_location)) {
      auditMap.set(audit.employee_id, audit);
    }
  });

  return nestleProfiles.map((p) => {
    const fullName = `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Unknown Employee";
    const record = auditMap.get(p.id);

    return {
      employee_id: p.id,
      employee_name: fullName,
      role: p.role || "Trade Worker",
      location: p.location || "Nestle Springville",
      hasAuditThisMonth: Boolean(record),
      latestAudit: record,
    };
  });
}

export async function submitRiskPredictionAudit(
  supabase: SupabaseClient,
  payload: Omit<RiskPredictionAuditRecord, "id" | "created_at">
): Promise<{ success: boolean; error?: string; id?: string }> {
  const { data, error } = await supabase
    .from("risk_prediction_audits")
    .insert([payload])
    .select("id")
    .single();

  if (error) {
    console.error("Error creating risk prediction audit:", error);
    return { success: false, error: error.message };
  }

  return { success: true, id: data.id };
}

export async function getAuditsForMonth(
  supabase: SupabaseClient,
  yearMonth: string
): Promise<RiskPredictionAuditRecord[]> {
  const [year, month] = yearMonth.split("-").map(Number);
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const { data, error } = await supabase
    .from("risk_prediction_audits")
    .select("*")
    .gte("audit_date", startDate)
    .lte("audit_date", endDate)
    .order("employee_name", { ascending: true });

  if (error) {
    console.error("Error fetching audits for month:", error);
    return [];
  }

  return (data || []).filter((r) => isStrictNestleSpringville(r.audited_location));
}