// lib/db/ladderOperations.ts
import { SupabaseClient } from "@supabase/supabase-js";

export interface LadderInspectionRecord {
  id?: string;
  employee_id: string;
  employee_name: string;
  department: string;
  location: string;
  work_area: string;
  inspection_date: string;
  ladder_id_number: string;
  ladder_type: "STEP_LADDER" | "EXTENSION_LADDER" | "COMBINATION";
  worker_ids: string[];
  worker_names: string[];
  general_checks: Record<string, "OK" | "WORN" | "N/A">;
  step_ladder_checks: Record<string, "OK" | "WORN" | "N/A">;
  extension_ladder_checks: Record<string, "OK" | "WORN" | "N/A">;
  verified_safe: boolean;
  operator_initials: string;
  signed_at?: string;
  comments?: string;
}

export const LADDER_GENERAL_ITEMS = [
  { id: "side_rails", label: "Side Rails (Free from cracks, dents, bends, or blemishes)" },
  { id: "rungs_steps", label: "Rungs / Steps (Ensure tightness and no rotation)" },
  { id: "fasteners", label: "Fasteners (Rivets, nuts, and bolts all tight)" },
  { id: "feet", label: "Feet (Check for tread wear, missing grips, or loose rivets)" },
];

export const STEP_LADDER_ITEMS = [
  { id: "top_cap", label: "Top Cap (Free from cracks, warping, and dents)" },
  { id: "spreader_arms", label: "Spreader Arms (Tight, move freely, lock securely)" },
  { id: "horizontal_braces", label: "Horizontal Braces (Ensure full rigidity & tightness)" },
  { id: "step_braces", label: "Step Braces (Ensure secure fastening under rungs)" },
  { id: "pail_tray", label: "Pail Tray (Moves freely, tight, and sets up properly)" },
];

export const EXTENSION_LADDER_ITEMS = [
  { id: "end_caps", label: "End Caps (Tight, intact, free from cracks and chips)" },
  { id: "rope_pulley", label: "Rope & Pulley (Rope unfrayed/not knotted, pulley free)" },
  { id: "gravity_locks", label: "Gravity Locks (Rung latches pivot freely, springs engage)" },
  { id: "slide_guides", label: "Slide Guides (Free from cracks, chips, and excess wear)" },
  { id: "base_fly_section", label: "Base & Fly Sections (Straight, true, and not warped)" },
];

/**
 * Returns all ladder inspections valid for TODAY where the user is EITHER:
 * 1. The primary inspector who filled it out (employee_id)
 * 2. An assigned crew worker selected in the shared work-area (worker_ids)
 */
export async function getTodayLadderInspections(
  supabase: SupabaseClient,
  userId: string,
  dateStr?: string
): Promise<LadderInspectionRecord[]> {
  try {
    const today = dateStr || new Date().toLocaleDateString("en-CA");

    const { data, error } = await supabase
      .from("daily_ladder_inspections")
      .select("*")
      .eq("inspection_date", today)
      .or(`employee_id.eq.${userId},worker_ids.cs.{${userId}}`)
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      return data as LadderInspectionRecord[];
    }
  } catch (err) {
    console.error("Error retrieving today's ladder inspections:", err);
  }
  return [];
}

export async function saveLadderInspection(
  supabase: SupabaseClient,
  record: LadderInspectionRecord
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const payload = {
      employee_id: record.employee_id,
      employee_name: record.employee_name,
      department: "IMC",
      location: record.location || "Nestle Springville",
      work_area: record.work_area.trim(),
      inspection_date: record.inspection_date,
      ladder_id_number: record.ladder_id_number.trim().toUpperCase(),
      ladder_type: record.ladder_type,
      worker_ids: record.worker_ids || [],
      worker_names: record.worker_names || [],
      general_checks: record.general_checks,
      step_ladder_checks: record.step_ladder_checks,
      extension_ladder_checks: record.extension_ladder_checks,
      verified_safe: record.verified_safe,
      operator_initials: record.operator_initials.trim().toUpperCase(),
      comments: record.comments || "",
      signed_at: record.signed_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let result;
    if (record.id) {
      result = await supabase
        .from("daily_ladder_inspections")
        .update(payload)
        .eq("id", record.id)
        .select("id")
        .single();
    } else {
      result = await supabase
        .from("daily_ladder_inspections")
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

export async function getLadderInspectionHistory(
  supabase: SupabaseClient,
  location: string
): Promise<LadderInspectionRecord[]> {
  const cleanLoc = location === "ALL" ? "" : location.trim();
  let query = supabase
    .from("daily_ladder_inspections")
    .select("*")
    .order("inspection_date", { ascending: false });

  if (cleanLoc) {
    query = query.ilike("location", `%${cleanLoc}%`);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as LadderInspectionRecord[];
}