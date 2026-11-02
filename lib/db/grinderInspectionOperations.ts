// lib/db/grinderInspectionOperations.ts
import { SupabaseClient } from "@supabase/supabase-js";
import { isStrictNestleSpringville } from "@/lib/db/riskPredictionOperations";

export interface GrinderInspectionWindow {
  window_id: string;
  label: string;
  start_time: string;
  guards_ok: boolean;
  handles_ok: boolean;
  disc_rpm_ok: boolean;
  cords_switches_ok: boolean;
  status: "FIT" | "UNFIT";
  inspected_by_name: string;
  inspected_at: string;
  remarks?: string;
}

export interface JhaGrinderInspectionRecord {
  id?: string;
  jha_id: string;
  inspection_date: string;
  location: string;
  windows: GrinderInspectionWindow[];
  overall_status: "FIT" | "UNFIT";
  last_inspected_by_id: string;
  last_inspected_by_name: string;
  last_inspected_at?: string;
}

export interface CategorizedJhasForGrinders {
  active: any[];
  paused: any[];
  hold: any[];
  closed: any[];
  todayInspectionLogs: Map<string, JhaGrinderInspectionRecord>;
}

// 6 standard working windows (03:30 PM removed)
export const STANDARD_WINDOWS = [
  { id: "w1", label: "06:00 AM", start_time: "06:00" },
  { id: "w2", label: "07:30 AM", start_time: "07:30" },
  { id: "w3", label: "09:30 AM", start_time: "09:30" },
  { id: "w4", label: "11:00 AM", start_time: "11:00" },
  { id: "w5", label: "12:30 PM", start_time: "12:30" },
  { id: "w6", label: "02:00 PM", start_time: "02:00" },
];

export function buildDefaultFitWindow(
  windowDef: { id: string; label: string; start_time: string },
  inspectorName: string
): GrinderInspectionWindow {
  return {
    window_id: windowDef.id,
    label: windowDef.label,
    start_time: windowDef.start_time,
    guards_ok: true,
    handles_ok: true,
    disc_rpm_ok: true,
    cords_switches_ok: true,
    status: "FIT",
    inspected_by_name: inspectorName,
    inspected_at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    remarks: "",
  };
}

/**
 * Fetch all Nestlé Springville JHAs grouped identically to DailyJhaManager.
 * Also retrieves today's grinder logs for instant surface status.
 */
export async function getCategorizedJhasWithGrinderStatus(
  supabase: SupabaseClient,
  todayStr: string
): Promise<CategorizedJhasForGrinders> {
  const { data: allJhas, error } = await supabase
    .from("daily_jhas")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !allJhas) {
    console.error("Error loading daily_jhas:", error?.message || error);
    return { active: [], paused: [], hold: [], closed: [], todayInspectionLogs: new Map() };
  }

  // 1. Strict Filter for Nestlé Springville (exclude Shop)
  const nestleJhas = allJhas.filter((j) => {
    const loc = j.location || "";
    if (loc.toLowerCase().includes("shop")) return false;
    return isStrictNestleSpringville(loc) || loc.toLowerCase().includes("nestle");
  });

  // 2. Client-side grouping matching DailyJhaManager
  const active: any[] = [];
  const paused: any[] = [];
  const hold: any[] = [];
  const closed: any[] = [];

  nestleJhas.forEach((item) => {
    if (item.status === "CLOSED") {
      closed.push(item);
      return;
    }

    const isManual = Boolean(item.is_manual_activation);
    const actDate = item.activation_date || null;

    if (item.status === "PAUSED") {
      paused.push(item);
    } else if (item.status === "PENDING") {
      if (!isManual && actDate && actDate <= todayStr) {
        active.push(item);
      } else {
        hold.push(item);
      }
    } else {
      if (isManual) {
        hold.push(item);
      } else if (actDate && actDate > todayStr) {
        hold.push(item);
      } else {
        active.push(item);
      }
    }
  });

  // 3. Fetch today's grinder logs
  const allIds = nestleJhas.map((j) => j.id);
  const todayLogsMap = new Map<string, JhaGrinderInspectionRecord>();

  if (allIds.length > 0) {
    const { data: logs } = await supabase
      .from("jha_grinder_inspections")
      .select("*")
      .in("jha_id", allIds)
      .eq("inspection_date", todayStr);

    (logs || []).forEach((l: JhaGrinderInspectionRecord) => {
      todayLogsMap.set(l.jha_id, l);
    });
  }

  return { active, paused, hold, closed, todayInspectionLogs: todayLogsMap };
}

/**
 * Fetch all historical grinder inspection logs for a specific JHA.
 */
export async function getGrinderHistoryForJha(
  supabase: SupabaseClient,
  jhaId: string
): Promise<JhaGrinderInspectionRecord[]> {
  const { data, error } = await supabase
    .from("jha_grinder_inspections")
    .select("*")
    .eq("jha_id", jhaId)
    .order("inspection_date", { ascending: false });

  if (error) {
    console.error("Failed to load grinder history for JHA:", error.message || error);
    return [];
  }

  return data || [];
}

/**
 * Save / Upsert grinder inspection for any date.
 */
export async function saveGrinderInspectionLog(
  supabase: SupabaseClient,
  payload: JhaGrinderInspectionRecord
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("jha_grinder_inspections")
      .upsert(
        {
          jha_id: payload.jha_id,
          inspection_date: payload.inspection_date,
          location: payload.location || "Nestle Springville",
          windows: payload.windows,
          overall_status: payload.overall_status,
          last_inspected_by_id: payload.last_inspected_by_id,
          last_inspected_by_name: payload.last_inspected_by_name,
          last_inspected_at: new Date().toISOString(),
        },
        { onConflict: "jha_id,inspection_date" }
      );

    if (error) {
      console.error("Failed to save grinder inspection:", error.message || error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Unknown error" };
  }
}