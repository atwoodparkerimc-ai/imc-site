// lib/db/boomLiftOperations.ts
import { SupabaseClient } from "@supabase/supabase-js";
import { getEmployeeCertifications, EvaluatedCert } from "@/lib/db/operations";

export interface BoomLiftInspectionRecord {
  id?: string;
  employee_id: string;
  operator_name: string;
  department: string;
  location: string;
  inspection_date: string;
  model: string;
  serial_number: string;
  license_expiration_date: string;
  buddy_id?: string | null;
  buddy_name?: string;
  buddy_license_expiration?: string;
  equipment_checks: Record<string, "YES" | "NO" | "N/A">;
  workplace_checks: Record<string, "YES" | "NO" | "N/A">;
  elevation_agreements: Record<string, "YES" | "NO">;
  operator_initials: string;
  signed_at?: string;
  comments?: string;
}

// Side 1: Equipment Checks
export const BOOM_EQUIPMENT_CHECKS = [
  { id: "ppe", label: "PPE Inspected (Harness / lanyard / head protection)" },
  { id: "estops", label: "E-stops (Emergency stops responsive on ground & basket)" },
  { id: "decals", label: "Decals & Placards (Legible, intact, in place)" },
  { id: "parts", label: "Machine Structure (No damaged, loose, or missing parts)" },
  { id: "tires", label: "Tires & Wheels (No lug nut loose, tire cuts or separation)" },
  { id: "leaks", label: "Hydraulic System (No hydraulic fluid leaks or hose drips)" },
  { id: "controls", label: "Platform & Ground Controls (All switches return to neutral)" },
  { id: "auxiliary", label: "Auxiliary Power (Auxiliary emergency lowering system functions)" },
  { id: "limit_switches", label: "Limit Switches (Function and stop elevation appropriately)" },
  { id: "low_speed", label: "Creep / Low Speed (Engages automatically when unit elevated)" },
  { id: "batteries", label: "Batteries / Engine (Fluid indicators, cables, retainer secure)" },
  { id: "horn", label: "Audible Horn (Loud, responsive)" },
  { id: "foot_switch", label: "Foot Switch (Dead man pedal) & Drive Brakes operate" },
];

// Side 1: Workplace Area Checks
export const BOOM_WORKPLACE_CHECKS = [
  { id: "slopes", label: "Slopes & Grade Limits (Within manufacturer limits)" },
  { id: "debris", label: "Floor Conditions (Bumps, holes, drop-offs, obstructions, debris)" },
  { id: "power_lines", label: "Overhead Obstructions & High-Voltage Electric Conductors" },
  { id: "hazardous_locs", label: "Hazardous Locations & Explosive / Flammable Atmospheres" },
  { id: "surface_support", label: "Ground Support (Adequate surface to withstand total lift load)" },
  { id: "wind_weather", label: "Wind & Severe Weather Conditions (Cease outdoor lift > 28 MPH)" },
  { id: "unauthorized", label: "Presence of Unauthorized Personnel (Drop zone barricaded)" },
  { id: "other_hazards", label: "Other Site Hazards (No other unsafe conditions discovered)" },
];

// Side 2: Prior to Reach Elevations Agreements
export const BOOM_ELEVATION_AGREEMENTS = [
  { id: "no_horseplay", label: "Stunt driving, reckless maneuvering, and horseplay is strictly prohibited" },
  { id: "outriggers", label: "Outriggers, extendable axles, and stabilizers deployed per manufacturer" },
  { id: "no_modifications", label: "No unauthorized framework or tool brackets attached without written approval" },
  { id: "guardrails", label: "Guardrails installed; mid-rails secure; access gates closed and latched" },
  { id: "load_distribution", label: "Load and tools evenly distributed in accordance with rated platform capacity" },
  { id: "clearance", label: "Adequate clearance maintained from overhead obstacles & power conductors" },
  { id: "repair_prior", label: "All malfunctions repaired & verified by technician prior to use" },
  { id: "rated_capacities", label: "Rated capacity will not be exceeded with combined worker and tool payload" },
  { id: "ppe_tied_off", label: "All occupants in aerial platform 100% tied off to certified anchor point" },
];

export async function getEmployeeBoomLiftLicense(
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
          key.includes("boom") ||
          key.includes("aerial") ||
          title.includes("boom lift") ||
          title.includes("aerial platform")
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
    console.warn("Could not query boom lift certifications:", err);
  }
  return { expirationDate: "", status: "NOT_TRAINED" };
}

/**
 * Returns all boom lift inspections for today where the user is EITHER:
 * 1. The certified operator (employee_id)
 * 2. The designated ground watcher / buddy (buddy_id)
 */
export async function getTodayBoomLiftInspections(
  supabase: SupabaseClient,
  userId: string,
  dateStr?: string
): Promise<BoomLiftInspectionRecord[]> {
  try {
    const today = dateStr || new Date().toLocaleDateString("en-CA");
    const { data, error } = await supabase
      .from("daily_boom_lift_inspections")
      .select("*")
      .eq("inspection_date", today)
      .or(`employee_id.eq.${userId},buddy_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      return data as BoomLiftInspectionRecord[];
    }
  } catch (err) {
    console.error("Error retrieving today's boom lift inspections:", err);
  }
  return [];
}

export async function saveBoomLiftInspection(
  supabase: SupabaseClient,
  record: BoomLiftInspectionRecord
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
      buddy_id: record.buddy_id || null,
      buddy_name: (record.buddy_name || "").trim(),
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
        .from("daily_boom_lift_inspections")
        .update(payload)
        .eq("id", record.id)
        .select("id")
        .single();
    } else {
      result = await supabase
        .from("daily_boom_lift_inspections")
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

export async function getBoomLiftInspectionHistory(
  supabase: SupabaseClient,
  location: string
): Promise<BoomLiftInspectionRecord[]> {
  const cleanLoc = location === "ALL" ? "" : location.trim();
  let query = supabase
    .from("daily_boom_lift_inspections")
    .select("*")
    .order("inspection_date", { ascending: false });

  if (cleanLoc) {
    query = query.ilike("location", `%${cleanLoc}%`);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as BoomLiftInspectionRecord[];
}