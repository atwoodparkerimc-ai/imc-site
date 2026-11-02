// lib/db/forkTruckOperations.ts
import { SupabaseClient } from "@supabase/supabase-js";
import { getEmployeeCertifications, EvaluatedCert } from "@/lib/db/operations";

export interface ForkTruckInspectionRecord {
  id?: string;
  employee_id: string;
  operator_name: string;
  location: string;
  inspection_date: string;
  license_expiration_date: string;
  lift_number: string;
  visual_checks: Record<string, "YES" | "NO" | "N/A">;
  operational_checks: Record<string, "YES" | "NO" | "N/A">;
  aware_hazards: boolean;
  no_horseplay: boolean;
  operator_initials: string;
  signed_at?: string;
  comments?: string;
}

export const VISUAL_CHECK_ITEMS = [
  { id: "tires", label: "Tires & Wheels in Working Order" },
  { id: "batteries", label: "Batteries (Indicators, Retainer, Cables)" },
  { id: "forks", label: "Forks / Platens Condition" },
  { id: "extinguisher", label: "Fire Extinguisher Charged & in Area" },
  { id: "safety_lights", label: "Blue & Red Safety Lights Operational" },
  { id: "seat_belt", label: "Seat Belt Function (If Equipped)" },
  { id: "reach_cylinders", label: "Reach Cylinders & Hoses" },
];

export const OPERATIONAL_CHECK_ITEMS = [
  { id: "horn", label: "Horn Audible & Responsive" },
  { id: "brakes", label: "Service Brakes & Foot Switches" },
  { id: "fluid_leaks", label: "Fluid Leaks (Hydraulic / Battery)" },
  { id: "chains_cables", label: "Chains & Cables Lubricated / Intact" },
  { id: "steering", label: "Steering Smoothness & Response" },
  { id: "hydraulic_controls", label: "Hydraulic Levers (Lift, Lower, Tilt)" },
  { id: "mast", label: "Mast Operation & Extension" },
];

export async function getEmployeeForkliftLicenseExpiration(
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
          key.includes("fork") ||
          key.includes("pit") ||
          title.includes("forklift") ||
          title.includes("fork truck") ||
          title.includes("powered industrial truck")
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
    console.warn("Could not query getEmployeeCertifications:", err);
  }

  return { expirationDate: "", status: "NOT_TRAINED" };
}

/**
 * Returns ALL fork truck inspections submitted by this employee for TODAY ONLY.
 * Expired days are excluded automatically by checking inspection_date = todayDateStr.
 */
export async function getTodayForkTruckInspections(
  supabase: SupabaseClient,
  userId: string,
  dateStr?: string
): Promise<ForkTruckInspectionRecord[]> {
  try {
    // Determine strict client date in YYYY-MM-DD
    const today = dateStr || new Date().toLocaleDateString("en-CA"); // en-CA gives YYYY-MM-DD

    const { data, error } = await supabase
      .from("daily_fork_truck_inspections")
      .select("*")
      .eq("employee_id", userId)
      .eq("inspection_date", today)
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      return data as ForkTruckInspectionRecord[];
    }
  } catch (err) {
    console.error("Error retrieving today's forklift inspections:", err);
  }

  return [];
}

/**
 * Backwards compatible single helper (returns the first/most recent for today)
 */
export async function getTodayForkTruckInspection(
  supabase: SupabaseClient,
  userId: string,
  dateStr?: string
): Promise<ForkTruckInspectionRecord | null> {
  const list = await getTodayForkTruckInspections(supabase, userId, dateStr);
  return list.length > 0 ? list[0] : null;
}

export async function saveForkTruckInspection(
  supabase: SupabaseClient,
  record: ForkTruckInspectionRecord
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const payload = {
      employee_id: record.employee_id,
      operator_name: record.operator_name,
      location: record.location || "Nestle Springville",
      inspection_date: record.inspection_date,
      license_expiration_date: record.license_expiration_date || "",
      lift_number: record.lift_number.trim().toUpperCase(),
      visual_checks: record.visual_checks,
      operational_checks: record.operational_checks,
      aware_hazards: record.aware_hazards,
      no_horseplay: record.no_horseplay,
      operator_initials: record.operator_initials.trim().toUpperCase(),
      comments: record.comments || "",
      signed_at: record.signed_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let result;
    if (record.id) {
      result = await supabase
        .from("daily_fork_truck_inspections")
        .update(payload)
        .eq("id", record.id)
        .select("id")
        .single();
    } else {
      result = await supabase
        .from("daily_fork_truck_inspections")
        .insert(payload)
        .select("id")
        .single();
    }

    if (result.error) {
      console.error("Database insert error:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, id: result.data.id };
  } catch (err: any) {
    return { success: false, error: err?.message || "Unknown error" };
  }
}

export async function getForkTruckInspectionHistory(
  supabase: SupabaseClient,
  location: string
): Promise<ForkTruckInspectionRecord[]> {
  const cleanLoc = location === "ALL" ? "" : location.trim();
  let query = supabase
    .from("daily_fork_truck_inspections")
    .select("*")
    .order("inspection_date", { ascending: false });

  if (cleanLoc) {
    query = query.ilike("location", `%${cleanLoc}%`);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as ForkTruckInspectionRecord[];
}