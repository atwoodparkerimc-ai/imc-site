// lib/db/dailySafetyCheckOperations.ts
import { SupabaseClient } from "@supabase/supabase-js";
import { UserProfile } from "@/lib/db/operations";
import { SAFETY_BRIEFINGS } from "@/lib/data/safetyBriefings";

export interface SafetyCheckWindowDef {
  id: string;
  label: string;
  start_time: string;
  end_time: string;
}

export const BASE_STANDARD_WINDOWS: SafetyCheckWindowDef[] = [
  { id: "w1", label: "06:00 – 07:30", start_time: "06:00", end_time: "07:30" },
  { id: "w2", label: "07:30 – 09:00", start_time: "07:30", end_time: "09:00" },
  { id: "w3", label: "09:30 – 11:00", start_time: "09:30", end_time: "11:00" },
  { id: "w4", label: "11:00 – 12:00", start_time: "11:00", end_time: "12:00" },
  { id: "w5", label: "12:30 – 02:00", start_time: "12:30", end_time: "02:00" },
  { id: "w6", label: "02:00 – 03:30", start_time: "02:00", end_time: "03:30" },
];

export const OPTIONAL_OT_WINDOW: SafetyCheckWindowDef = {
  id: "w7",
  label: "03:30 – 05:00",
  start_time: "03:30",
  end_time: "05:00",
};

export type WindowStatus = "FIT" | "OFF";

export interface SafetyCheckEntryRecord {
  id?: string;
  sheet_id?: string;
  worker_type: "EMPLOYEE" | "SUB";
  worker_id?: string;
  worker_name: string;
  craft_role?: string;
  window_checks: Record<string, WindowStatus>;
  comments?: string;
  sort_order?: number;
}

export interface SafetyCheckSheetRecord {
  id?: string;
  check_date: string;
  location: string;
  safety_topic: string;
  auditor_id?: string;
  auditor_name?: string;
  active_window_keys: string[];
  custom_windows: SafetyCheckWindowDef[];
  general_comments?: string;
  entries?: SafetyCheckEntryRecord[];
}

export interface CellSpan {
  type: "FIT" | "OFF";
  windowId?: string;
  colSpan: number;
}

export function computeRowSpans(
  orderedWindows: SafetyCheckWindowDef[],
  windowChecks: Record<string, WindowStatus>
): CellSpan[] {
  const result: CellSpan[] = [];
  let currentOffCount = 0;

  for (let i = 0; i < orderedWindows.length; i++) {
    const w = orderedWindows[i];
    const status = windowChecks[w.id] || "OFF";

    if (status === "FIT") {
      if (currentOffCount > 0) {
        result.push({ type: "OFF", colSpan: currentOffCount });
        currentOffCount = 0;
      }
      result.push({ type: "FIT", windowId: w.id, colSpan: 1 });
    } else {
      currentOffCount++;
    }
  }

  if (currentOffCount > 0) {
    result.push({ type: "OFF", colSpan: currentOffCount });
  }

  return result;
}

export function formatUserProfileName(user: Partial<UserProfile>): string {
  const primaryName = user.nickname?.trim() || user.first_name?.trim() || "";
  const last = user.last_name?.trim() || "";
  return last ? `${primaryName} ${last}`.trim() : primaryName.trim();
}

function getRoleWeight(roleRaw?: string): number {
  const r = (roleRaw || "").toLowerCase().trim();
  if (r.includes("manager")) return 1;
  if (r.includes("foreman") || r.includes("lead")) return 2;
  return 3;
}

function isSubcontractorProfile(user: any): boolean {
  const role = (user.role || "").toLowerCase().trim();
  const empType = (user.employment_type || "").toLowerCase().trim();
  const craft = (user.craft || "").toLowerCase().trim();

  return (
    role.includes("sub") ||
    role.includes("contractor") ||
    empType.includes("sub") ||
    empType.includes("contractor") ||
    empType.includes("temp") ||
    craft.includes("sub")
  );
}

/**
 * Resolves a briefing ID (e.g. 'briefing-004' or 'tbt-ladder') to its official title in SAFETY_BRIEFINGS
 */
function resolveBriefingTitle(briefingIdOrTitle: string): string {
  if (!briefingIdOrTitle) return "";
  const cleaned = briefingIdOrTitle.trim().toLowerCase();

  const found = SAFETY_BRIEFINGS.find(
    (b) =>
      b.id.toLowerCase() === cleaned ||
      b.id.toLowerCase().replace(/^briefing-/, "") === cleaned.replace(/^briefing-/, "") ||
      b.title.toLowerCase() === cleaned
  );

  if (found) {
    return `${found.id.toUpperCase()} — ${found.title}`;
  }
  return briefingIdOrTitle.trim();
}

/**
 * Searches the manager broadcast table AND employee completion logs for today's meeting topic.
 */
export async function getDayMeetingTopic(
  supabase: SupabaseClient,
  dateStr: string,
  location: string
): Promise<string> {
  const targetLoc = (location || "").trim().toLowerCase();

  // 1. Check Manager Broadcast Override Table (setSiteBriefingOverride)
  const overrideTables = [
    "site_briefing_overrides",
    "site_briefings",
    "briefing_overrides",
    "site_settings",
  ];

  for (const table of overrideTables) {
    try {
      const { data, error } = await supabase.from(table).select("*");
      if (!error && Array.isArray(data) && data.length > 0) {
        const match = data.find((row: any) => {
          const rowLoc = (row.location || row.site || "").toLowerCase().trim();
          return rowLoc === targetLoc || rowLoc.includes(targetLoc) || targetLoc.includes(rowLoc);
        });

        if (match) {
          const briefingId = match.briefing_id || match.selected_id || match.topic_id || match.current_briefing_id;
          if (briefingId) {
            const resolved = resolveBriefingTitle(briefingId);
            if (resolved) return resolved;
          }
        }
      }
    } catch {
      // Continue to next table
    }
  }

  // 2. Check Employee Meeting Completion Logs for this date (as seen in SafetyMeetingComplianceLog)
  const completionTables = ["meeting_completions", "meeting_completion_logs", "briefing_completions"];

  for (const table of completionTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select("briefing_id, briefing_title, location, completed_at")
        .gte("completed_at", `${dateStr}T00:00:00`)
        .lte("completed_at", `${dateStr}T23:59:59`)
        .order("completed_at", { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        const match = data.find((log: any) => {
          const logLoc = (log.location || "").toLowerCase().trim();
          return !logLoc || logLoc === targetLoc || logLoc.includes(targetLoc) || targetLoc.includes(logLoc);
        }) || data[0];

        if (match) {
          if (match.briefing_title && match.briefing_title.trim()) {
            return match.briefing_title.trim();
          }
          if (match.briefing_id && match.briefing_id.trim()) {
            return resolveBriefingTitle(match.briefing_id);
          }
        }
      }
    } catch {
      // Continue to next table
    }
  }

  // 3. Fallback: Check JHA Meeting Records
  try {
    const { data: jhaMatch } = await supabase
      .from("daily_jhas")
      .select("safety_topic, meeting_topic, title, location")
      .eq("date", dateStr)
      .ilike("location", `%${location.trim()}%`)
      .maybeSingle();

    if (jhaMatch?.safety_topic || jhaMatch?.meeting_topic) {
      return (jhaMatch.safety_topic || jhaMatch.meeting_topic).trim();
    }
  } catch {
    // Continue
  }

  return "";
}

/**
 * Loads or initializes the Safety Check Sheet for a specific date and location.
 */
export async function getOrCreateDailySafetySheet(
  supabase: SupabaseClient,
  dateStr: string,
  location: string,
  fallbackAuditorName?: string
): Promise<SafetyCheckSheetRecord> {
  const cleanLoc = location?.trim() || "Nestle Springville";

  // 1. Fetch existing sheet for this date and location
  const { data: sheet } = await supabase
    .from("daily_safety_check_sheets")
    .select("*")
    .eq("check_date", dateStr)
    .eq("location", cleanLoc)
    .maybeSingle();

  // Always attempt to get today's live broadcasted meeting topic
  const liveTopic = await getDayMeetingTopic(supabase, dateStr, cleanLoc);

  if (sheet) {
    const { data: entries } = await supabase
      .from("daily_safety_check_entries")
      .select("*")
      .eq("sheet_id", sheet.id)
      .order("sort_order", { ascending: true });

    // Prefer the live broadcasted topic if current sheet topic is empty
    const finalTopic = sheet.safety_topic?.trim() ? sheet.safety_topic : (liveTopic || "");

    const sortedEntries = (entries || []).sort((a: SafetyCheckEntryRecord, b: SafetyCheckEntryRecord) => {
      if (a.worker_type !== b.worker_type) {
        return a.worker_type === "EMPLOYEE" ? -1 : 1;
      }
      if (a.worker_type === "EMPLOYEE") {
        const weightDiff = getRoleWeight(a.craft_role) - getRoleWeight(b.craft_role);
        if (weightDiff !== 0) return weightDiff;
      }
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });

    return {
      ...sheet,
      safety_topic: finalTopic,
      auditor_name: sheet.auditor_name || fallbackAuditorName || "",
      entries: sortedEntries,
    };
  }

  // 2. Query active profiles from Supabase
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .neq("is_active", false);

  if (error || !profiles) {
    console.error("Failed to load profiles for safety checks:", error?.message);
  }

  // 3. Filter strictly to COMPANY EMPLOYEES assigned to this site (exclude subs)
  const siteEmployees = (profiles || []).filter((user: UserProfile) => {
    if (isSubcontractorProfile(user)) return false;

    const userLoc = (user.location || "").trim().toLowerCase();
    const targetLoc = cleanLoc.toLowerCase();
    return userLoc === targetLoc || userLoc.includes(targetLoc) || targetLoc.includes(userLoc);
  });

  // 4. Sort: Managers -> Foremen -> Employees -> Full Name
  siteEmployees.sort((a: UserProfile, b: UserProfile) => {
    const roleA = getRoleWeight(a.role);
    const roleB = getRoleWeight(b.role);
    if (roleA !== roleB) return roleA - roleB;

    const nameA = formatUserProfileName(a);
    const nameB = formatUserProfileName(b);
    return nameA.localeCompare(nameB);
  });

  const defaultEntries: SafetyCheckEntryRecord[] = siteEmployees.map((user: UserProfile, idx: number) => {
    const fullName = formatUserProfileName(user) || "Craft Worker";
    return {
      worker_type: "EMPLOYEE" as const,
      worker_id: user.id,
      worker_name: fullName,
      craft_role: user.role ? user.role.toUpperCase() : "EMPLOYEE",
      window_checks: {},
      comments: "",
      sort_order: idx,
    };
  });

  return {
    check_date: dateStr,
    location: cleanLoc,
    safety_topic: liveTopic || "",
    auditor_name: fallbackAuditorName || "",
    active_window_keys: BASE_STANDARD_WINDOWS.map((w) => w.id),
    custom_windows: [],
    general_comments: "",
    entries: defaultEntries,
  };
}

/**
 * Saves or updates a safety check sheet and worker entries.
 */
export async function saveDailySafetySheet(
  supabase: SupabaseClient,
  sheetData: SafetyCheckSheetRecord,
  entries: SafetyCheckEntryRecord[]
): Promise<{ success: boolean; error?: string; sheetId?: string }> {
  try {
    const { data: savedSheet, error: sheetError } = await supabase
      .from("daily_safety_check_sheets")
      .upsert(
        {
          check_date: sheetData.check_date,
          location: sheetData.location,
          safety_topic: sheetData.safety_topic || "",
          auditor_id: sheetData.auditor_id || null,
          auditor_name: sheetData.auditor_name || "",
          active_window_keys: sheetData.active_window_keys,
          custom_windows: sheetData.custom_windows,
          general_comments: sheetData.general_comments || "",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "location,check_date" }
      )
      .select("id")
      .single();

    if (sheetError || !savedSheet) {
      return { success: false, error: sheetError?.message || "Failed to upsert sheet" };
    }

    const sheetId = savedSheet.id;

    await supabase.from("daily_safety_check_entries").delete().eq("sheet_id", sheetId);

    if (entries.length > 0) {
      const payload = entries.map((e, idx) => ({
        sheet_id: sheetId,
        worker_type: e.worker_type,
        worker_id: e.worker_id || null,
        worker_name: e.worker_name,
        craft_role: e.craft_role || "",
        topic_acknowledged: false,
        topic_verified: false,
        window_checks: e.window_checks || {},
        comments: e.comments || "",
        sort_order: idx,
      }));

      const { error: entriesError } = await supabase
        .from("daily_safety_check_entries")
        .insert(payload);

      if (entriesError) {
        return { success: false, error: entriesError.message };
      }
    }

    return { success: true, sheetId };
  } catch (err: any) {
    return { success: false, error: err?.message || "Unknown error" };
  }
}