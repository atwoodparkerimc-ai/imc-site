// lib/db/scissorLiftOperations.ts
import { SupabaseClient } from "@supabase/supabase-js";
import { getEmployeeCertifications, EvaluatedCert } from "@/lib/db/operations";

export interface ScissorLiftInspectionRecord {
  id?: string;
  employee_id: string;
  operator_name: string;
  department: string;
  location: string;
  inspection_date: string;
  model: string;
  serial_number: string;
  license_expiration_date: string;
  buddy_id: string;
  buddy_name: string;
  buddy_license_expiration?: string;
  equipment_checks: Record<string, "YES" | "NO">;
  workplace_checks: Record<string, "YES" | "NO">;
  elevation_agreements: Record<string, "YES" | "NO">;
  operator_initials: string;
  signed_at?: string;
  comments?: string;
}

// Side 1: Equipment Checks
export const SCISSOR_EQUIPMENT_CHECKS = [
  { id: "ppe", label: "PPE Inspected (Harness, lanyard, or head protection)" },
  { id: "estops", label: "E-Stops (Emergency stop switches responsive at base & platform)" },
  { id: "decals", label: "Decals & Placards Legible and Intact" },
  { id: "parts", label: "Structure Free of Damaged, Loose, or Missing Parts" },
  { id: "tires", label: "Tires & Wheels in Good Operating Condition" },
  { id: "leaks", label: "Hydraulic System Free of Fluid Leaks" },
  { id: "controls", label: "Platform & Ground Controls Return to Neutral" },
  { id: "low_speed", label: "Low Speed Engages Automatically When Unit Elevated" },
  { id: "batteries", label: "Batteries (Power indicators, cables, and retainers secure)" },
  { id: "horn", label: "Audible Warning Horn Operational" },
  { id: "foot_switch", label: "Foot Switch (Dead Man) Operates Correctly" },
  { id: "brakes", label: "Drive Brakes Engage Positively" },
  { id: "cylinder", label: "Main Scissor Lift Cylinder & Scissors Free of Defects" },
];

// Side 1: Workplace Area Checks
export const SCISSOR_WORKPLACE_CHECKS = [
  { id: "drop_offs", label: "Drop-Offs, Holes, or Unsecured Drain Covers Checked" },
  { id: "slopes", label: "Slopes & Grade Limits Within Manufacturer Specifications" },
  { id: "debris", label: "Floor Surface Clean and Free of Obstructions / Debris" },
  { id: "power_lines", label: "Overhead Obstructions & High-Voltage Electric Lines Cleared" },
  { id: "hazardous_locs", label: "Hazardous Locations & Explosive / Flammable Atmospheres" },
  { id: "surface_support", label: "Ground Support Adequate to Withstand Aerial Platform Forces" },
  { id: "wind_weather", label: "Wind & Severe Weather Evaluated (When Working Outdoors)" },
  { id: "unauthorized", label: "Presence of Unauthorized Personnel Controlled with Barricades" },
  { id: "other_hazards", label: "Other Possible Unsafe Workplace Conditions Evaluated" },
];

// Side 2: Prior to Reach Elevations Agreements
export const SCISSOR_ELEVATION_AGREEMENTS = [
  { id: "no_horseplay_1", label: "Stunt driving and horseplay is not permitted and will result in corrective action" },
  { id: "outriggers", label: "Outriggers, stabilizers, or extendible axles are used as required by manufacturer" },
  { id: "no_modifications", label: "Modifications or framework alterations to platform have written approval" },
  { id: "guardrails", label: "Guardrails installed and access gates/openings closed per instructions" },
  { id: "load_distribution", label: "Load and distribution on platform and extensions match rated capacity" },
  { id: "clearance", label: "Adequate clearance is maintained from overhead obstacles & energized lines" },
  { id: "repair_prior", label: "Malfunctions affecting platform safety repaired prior to use" },
  { id: "rated_capacities", label: "Rated capacities will not be exceeded with combined load and operator" },
  { id: "tie_off_note", label: "All personnel equipped with required PPE; 100% tie-off if feet leave platform floor" },
];

export async function getEmployeeScissorLiftLicense(
  supabase: SupabaseClient,
  userId: string,
  userRole: string = "employee"
): Promise<{ expirationDate: string; status: string }> {
  try {
    const certList: EvaluatedCert[] = await getEmployeeCertifications(supabase, userId, userRole);
    if (Array.isArray(certList) && certList.length > 0) {
      const match = certList.find((c) => {
        const key = (c.typeKey || "").toLowerCase();
        const title = (c.title || "").toLowerCase();
        return (
          key.includes("scissor") ||
          title.includes("scissor lift") ||
          title.includes("scissor")
        );
      });

      if (match) {
        return {
          expirationDate: match.expirationDate || "",
          status: match.status || "VALID",
        };
      }
    }
  } catch (err) {
    console.warn("Could not query scissor lift certifications:", err);
  }
  return { expirationDate: "", status: "NOT_TRAINED" };
}

export async function getTodayScissorLiftInspections(
  supabase: SupabaseClient,
  userId: string,
  dateStr?: string
): Promise<ScissorLiftInspectionRecord[]> {
  try {
    const today = dateStr || new Date().toLocaleDateString("en-CA");
    const { data, error } = await supabase
      .from("daily_scissor_lift_inspections")
      .select("*")
      .eq("inspection_date", today)
      .or(`employee_id.eq.${userId},buddy_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      return data as ScissorLiftInspectionRecord[];
    }
  } catch (err) {
    console.error("Error retrieving today's scissor lift inspections:", err);
  }
  return [];
}

export async function saveScissorLiftInspection(
  supabase: SupabaseClient,
  record: ScissorLiftInspectionRecord
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const payload = {
      employee_id: record.employee_id,
      operator_name: record.operator_name,
      department: "IMC",
      location: record.location || "Nestle Springville",
      inspection_date: record.inspection_date,
      model: record.model.trim().toUpperCase(),
      serial_number: record.serial_number.trim().toUpperCase(),
      license_expiration_date: record.license_expiration_date || "",
      buddy_id: record.buddy_id,
      buddy_name: record.buddy_name.trim(),
      buddy_license_expiration: (record.buddy_license_expiration || "").trim(),
      equipment_checks: record.equipment_checks,
      workplace_checks: record.workplace_checks,
      elevation_agreements: record.elevation_agreements,
      operator_initials: record.operator_initials.trim().toUpperCase(),
      comments: record.comments || "",
      signed_at: record.signed_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let result;
    if (record.id) {
      result = await supabase
        .from("daily_scissor_lift_inspections")
        .update(payload)
        .eq("id", record.id)
        .select("id")
        .single();
    } else {
      result = await supabase
        .from("daily_scissor_lift_inspections")
        .insert(payload)
        .select("id")
        .single();
    }

    if (result.error) {
      return { success: false, error: result.error.message };
    }
    return { success: true, id: result.data.id };
  } catch (err: any) {
    return { success: false, error: err?.message || "Unknown error" };
  }
}

export async function getScissorLiftInspectionHistory(
  supabase: SupabaseClient,
  location: string
): Promise<ScissorLiftInspectionRecord[]> {
  const cleanLoc = location === "ALL" ? "" : location.trim();
  let query = supabase
    .from("daily_scissor_lift_inspections")
    .select("*")
    .order("inspection_date", { ascending: false });

  if (cleanLoc) {
    query = query.ilike("location", `%${cleanLoc}%`);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as ScissorLiftInspectionRecord[];
}