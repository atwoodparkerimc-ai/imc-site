// lib/db/fallProtectionOperations.ts
import { SupabaseClient } from "@supabase/supabase-js";

export interface FallProtectionRecord {
  id?: string;
  employee_id: string;
  employee_name: string;
  department: string;
  location: string;
  inspection_date: string;
  equipment_number: string;
  srl_checks: Record<string, "PASS" | "FAIL" | "N/A">;
  harness_checks: Record<string, "PASS" | "FAIL" | "N/A">;
  verified_no_defects: boolean;
  operator_initials: string;
  signed_at?: string;
  comments?: string;
}

// Side 1: SRL & Lanyards
export const SRL_CHECK_ITEMS = [
  { id: "srl_1", label: "Webbing & Stitching (Flex strap in inverted 'U')" },
  { id: "srl_2", label: "Lifeline Cable / Strands (Cuts, fraying, wear patterns)" },
  { id: "srl_3", label: "Snaphooks & Connectors (Distortion, cracks, corrosion)" },
  { id: "srl_4", label: "Housing & Fasteners (Cracked, bent, loose, or worn)" },
  { id: "srl_5", label: "Gate Strength Rating (Rated 3,600 lbs or 5,000 lbs)" },
  { id: "srl_6", label: "Webbing Load Indicator (Warning flag not exposed)" },
  { id: "srl_7", label: "Snap Hook Load Indicator (Swivel eye intact, no red exposed)" },
];

// Side 2: Harness Condition
export const HARNESS_CHECK_ITEMS = [
  { id: "harness_1", label: "Webbing Integrity (No broken strands, rotting, cuts)" },
  { id: "harness_2", label: "Tongue & Buckle Slides (Moves freely, roller turns)" },
  { id: "harness_3", label: "Grommets & Holes (No distortion, tearing, elongation)" },
  { id: "harness_4", label: "D-Ring Rivets & Pads (No loose rivets or corrosion)" },
  { id: "harness_5", label: "Tactile Strap Check (Flex entire strap in inverted 'U')" },
  { id: "harness_6", label: "Strap Buckle Friction (Overlaps frame with no bend)" },
  { id: "harness_7", label: "Forged D-Rings (90° bar pivots freely, zero cracks)" },
];

export async function getTodayFallProtectionInspections(
  supabase: SupabaseClient,
  userId: string,
  dateStr?: string
): Promise<FallProtectionRecord[]> {
  try {
    const today = dateStr || new Date().toLocaleDateString("en-CA");
    const { data, error } = await supabase
      .from("daily_fall_protection_inspections")
      .select("*")
      .eq("employee_id", userId)
      .eq("inspection_date", today)
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      return data as FallProtectionRecord[];
    }
  } catch (err) {
    console.error("Error retrieving fall protection inspections:", err);
  }
  return [];
}

export async function saveFallProtectionInspection(
  supabase: SupabaseClient,
  record: FallProtectionRecord
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const payload = {
      employee_id: record.employee_id,
      employee_name: record.employee_name,
      department: "IMC",
      location: record.location || "Nestle Springville",
      inspection_date: record.inspection_date,
      equipment_number: record.equipment_number.trim().toUpperCase(),
      srl_checks: record.srl_checks,
      harness_checks: record.harness_checks,
      verified_no_defects: record.verified_no_defects,
      operator_initials: record.operator_initials.trim().toUpperCase(),
      comments: record.comments || "",
      signed_at: record.signed_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let result;
    if (record.id) {
      result = await supabase
        .from("daily_fall_protection_inspections")
        .update(payload)
        .eq("id", record.id)
        .select("id")
        .single();
    } else {
      result = await supabase
        .from("daily_fall_protection_inspections")
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

export async function getFallProtectionHistory(
  supabase: SupabaseClient,
  location: string
): Promise<FallProtectionRecord[]> {
  const cleanLoc = location === "ALL" ? "" : location.trim();
  let query = supabase
    .from("daily_fall_protection_inspections")
    .select("*")
    .order("inspection_date", { ascending: false });

  if (cleanLoc) {
    query = query.ilike("location", `%${cleanLoc}%`);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as FallProtectionRecord[];
}