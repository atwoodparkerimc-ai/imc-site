// app/(dashboard)/manager/_components/GrinderInspectionManager.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getCategorizedJhasWithGrinderStatus,
  getGrinderHistoryForJha,
  saveGrinderInspectionLog,
  JhaGrinderInspectionRecord,
  GrinderInspectionWindow,
  STANDARD_WINDOWS,
  buildDefaultFitWindow,
} from "@/lib/db/grinderInspectionOperations";
import { printGrinderInspectionReport } from "@/lib/reports/grinderInspectionPrint";
import { motion, AnimatePresence } from "framer-motion";

interface GrinderInspectionManagerProps {
  supabase: any;
  currentUserId: string;
  currentUserName: string;
}

type TimelineScope = "DAY" | "WEEK" | "MONTH" | "FULL_LIFE" | "CUSTOM";

export default function GrinderInspectionManager({
  supabase,
  currentUserId,
  currentUserName,
}: GrinderInspectionManagerProps) {
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Categorized State
  const [activeJhas, setActiveJhas] = useState<any[]>([]);
  const [pausedJhas, setPausedJhas] = useState<any[]>([]);
  const [holdJhas, setHoldJhas] = useState<any[]>([]);
  const [closedJhas, setClosedJhas] = useState<any[]>([]);
  const [todayLogs, setTodayLogs] = useState<Map<string, JhaGrinderInspectionRecord>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // Active Category Tab & Search
  const [activeCategoryTab, setActiveCategoryTab] = useState<"ACTIVE" | "PAUSED" | "HOLD" | "CLOSED">("ACTIVE");
  const [searchQuery, setSearchQuery] = useState("");

  // Job History Drawer / Modal
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [jobHistoryLogs, setJobHistoryLogs] = useState<JhaGrinderInspectionRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Date Entry & Window Editor Inside Drawer
  const [entryDate, setEntryDate] = useState<string>(todayStr);
  const [editorWindows, setEditorWindows] = useState<GrinderInspectionWindow[]>([]);
  const [customTime, setCustomTime] = useState("");
  const [isSavingEntry, setIsSavingEntry] = useState(false);

  // Batch Multi-Timeline Print Modal State (Global)
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [timelineScope, setTimelineScope] = useState<TimelineScope>("DAY");
  const [batchSingleDate, setBatchSingleDate] = useState<string>(todayStr);
  const [customStartDate, setCustomStartDate] = useState<string>(todayStr);
  const [customEndDate, setCustomEndDate] = useState<string>(todayStr);
  const [isPrintingBatch, setIsPrintingBatch] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const data = await getCategorizedJhasWithGrinderStatus(supabase, todayStr);
    setActiveJhas(data.active);
    setPausedJhas(data.paused);
    setHoldJhas(data.hold);
    setClosedJhas(data.closed);
    setTodayLogs(data.todayInspectionLogs);
    setIsLoading(false);
  }, [supabase, todayStr]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Current window suggestion based on time of day
  const currentWindowSuggestion = useMemo(() => {
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    let closest = STANDARD_WINDOWS[0];
    for (const w of STANDARD_WINDOWS) {
      const [h, m] = w.start_time.split(":").map(Number);
      if (currentMins >= h * 60 + m) {
        closest = w;
      }
    }
    return closest;
  }, []);

  // Filter current tab list by search query
  const displayedJobs = useMemo(() => {
    const pool =
      activeCategoryTab === "ACTIVE"
        ? activeJhas
        : activeCategoryTab === "PAUSED"
        ? pausedJhas
        : activeCategoryTab === "HOLD"
        ? holdJhas
        : closedJhas;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return pool;

    return pool.filter(
      (j) =>
        (j.title || "").toLowerCase().includes(q) ||
        (j.supervisor || "").toLowerCase().includes(q) ||
        (j.foreman_name || "").toLowerCase().includes(q) ||
        (j.location || "").toLowerCase().includes(q)
    );
  }, [activeCategoryTab, activeJhas, pausedJhas, holdJhas, closedJhas, searchQuery]);

  // 1-Click Fast Check Current Window on a Job (Today)
  const handleQuickCheckCurrentWindow = async (job: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const existing = todayLogs.get(job.id);
    const existingWindows = existing?.windows || [];
    const alreadyLogged = existingWindows.some((w) => w.window_id === currentWindowSuggestion.id);

    const updatedWindows = alreadyLogged
      ? existingWindows
      : [...existingWindows, buildDefaultFitWindow(currentWindowSuggestion, currentUserName)];

    await saveGrinderInspectionLog(supabase, {
      jha_id: job.id,
      inspection_date: todayStr,
      location: job.location || "Nestle Springville",
      windows: updatedWindows,
      overall_status: "FIT",
      last_inspected_by_id: currentUserId,
      last_inspected_by_name: currentUserName,
    });

    loadData();
  };

  // 1-Click Fast Pass Entire Shift (All Standard Windows Today)
  const handleQuickPassEntireShift = async (job: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const allWindows = STANDARD_WINDOWS.map((def) => buildDefaultFitWindow(def, currentUserName));

    await saveGrinderInspectionLog(supabase, {
      jha_id: job.id,
      inspection_date: todayStr,
      location: job.location || "Nestle Springville",
      windows: allWindows,
      overall_status: "FIT",
      last_inspected_by_id: currentUserId,
      last_inspected_by_name: currentUserName,
    });

    loadData();
  };

  // Open Job Grinder History Ledger
  const handleOpenJobLedger = async (job: any) => {
    setSelectedJob(job);
    setEntryDate(todayStr);
    setIsLoadingHistory(true);

    const history = await getGrinderHistoryForJha(supabase, job.id);
    setJobHistoryLogs(history);

    const match = history.find((h) => h.inspection_date === todayStr);
    setEditorWindows(match?.windows ? [...match.windows] : []);

    setIsLoadingHistory(false);
  };

  // When entryDate changes inside the drawer, load that date's windows if they exist
  const handleDateChangeInDrawer = (newDate: string) => {
    setEntryDate(newDate);
    const match = jobHistoryLogs.find((h) => h.inspection_date === newDate);
    setEditorWindows(match?.windows ? [...match.windows] : []);
  };

  const handleToggleWindowInDrawer = (def: (typeof STANDARD_WINDOWS)[0]) => {
    const exists = editorWindows.some((w) => w.window_id === def.id);
    if (exists) {
      setEditorWindows(editorWindows.filter((w) => w.window_id !== def.id));
    } else {
      setEditorWindows([...editorWindows, buildDefaultFitWindow(def, currentUserName)]);
    }
  };

  const handleFillAllShiftWindowsInDrawer = () => {
    // Keep custom windows intact if already added, just populate the 6 standard ones
    const customOnly = editorWindows.filter(
      (w) => !STANDARD_WINDOWS.some((std) => std.id === w.window_id)
    );
    const standards = STANDARD_WINDOWS.map((def) => buildDefaultFitWindow(def, currentUserName));
    setEditorWindows([...standards, ...customOnly]);
  };

  const handleAddCustomWindowInDrawer = () => {
    const trimmed = customTime.trim();
    if (!trimmed) return;

    // Normalize format e.g. "800 pm" or "8:00 PM"
    const customDef = {
      id: `custom_${Date.now()}`,
      label: trimmed.toUpperCase(),
      start_time: trimmed,
    };
    setEditorWindows((prev) => [...prev, buildDefaultFitWindow(customDef, currentUserName)]);
    setCustomTime("");
  };

  const handleRemoveCustomWindowInDrawer = (windowId: string) => {
    setEditorWindows((prev) => prev.filter((w) => w.window_id !== windowId));
  };

  const handleSaveDrawerEntry = async () => {
    if (!selectedJob || !entryDate) return;
    setIsSavingEntry(true);

    await saveGrinderInspectionLog(supabase, {
      jha_id: selectedJob.id,
      inspection_date: entryDate,
      location: selectedJob.location || "Nestle Springville",
      windows: editorWindows,
      overall_status: "FIT",
      last_inspected_by_id: currentUserId,
      last_inspected_by_name: currentUserName,
    });

    const history = await getGrinderHistoryForJha(supabase, selectedJob.id);
    setJobHistoryLogs(history);
    setIsSavingEntry(false);
    loadData();
  };

  // Print Handlers
  const handlePrintSpecificLog = (log: JhaGrinderInspectionRecord) => {
    if (!selectedJob) return;
    printGrinderInspectionReport({
      job_title: selectedJob.title || selectedJob.job_title || "",
      job_number: selectedJob.job_number || "",
      supervisor: selectedJob.supervisor || selectedJob.foreman_name || selectedJob.lead || "",
      inspection_date: log.inspection_date,
      location: "Nestle Springville",
      inspector_name: log.last_inspected_by_name || currentUserName,
      windows: log.windows || [],
    });
  };

  const handleQuickPrintToday = (job: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const log = todayLogs.get(job.id);
    printGrinderInspectionReport({
      job_title: job.title || job.job_title || "",
      job_number: job.job_number || "",
      supervisor: job.supervisor || job.foreman_name || job.lead || "",
      inspection_date: todayStr,
      location: "Nestle Springville",
      inspector_name: log?.last_inspected_by_name || currentUserName,
      windows: log?.windows || [],
    });
  };

  // Direct Print: Full Life Packet for THIS SPECIFIC JOB ONLY
  const handlePrintSingleJobFullLife = async (job: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    let logsToPrint = jobHistoryLogs;
    if (!selectedJob || selectedJob.id !== job.id) {
      logsToPrint = await getGrinderHistoryForJha(supabase, job.id);
    }

    if (!logsToPrint || logsToPrint.length === 0) {
      alert(`No historical grinder logs found for "${job.title || job.job_title}".`);
      return;
    }

    const jhaMap = new Map<string, any>();
    jhaMap.set(job.id, job);

    const chronologicalLogs = [...logsToPrint].sort((a, b) =>
      a.inspection_date.localeCompare(b.inspection_date)
    );

    printBatchGrinderInspectionReports(chronologicalLogs, jhaMap);
  };

  // Multi-Timeline Batch Print Execution (Global Toolbar)
  const handleExecuteBatchPrint = async () => {
    setIsPrintingBatch(true);

    try {
      const jhaPool =
        timelineScope === "FULL_LIFE"
          ? [...activeJhas, ...pausedJhas, ...holdJhas]
          : [...activeJhas, ...pausedJhas, ...holdJhas, ...closedJhas];

      if (jhaPool.length === 0) {
        alert("No JHAs available for the requested timeline.");
        setIsPrintingBatch(false);
        return;
      }

      const jhaIds = jhaPool.map((j) => j.id);
      const jhaMap = new Map<string, any>();
      jhaPool.forEach((j) => jhaMap.set(j.id, j));

      let query = supabase
        .from("jha_grinder_inspections")
        .select("*")
        .in("jha_id", jhaIds);

      const now = new Date();
      if (timelineScope === "DAY") {
        query = query.eq("inspection_date", batchSingleDate);
      } else if (timelineScope === "WEEK") {
        const pastWeek = new Date();
        pastWeek.setDate(now.getDate() - 7);
        query = query.gte("inspection_date", pastWeek.toISOString().split("T")[0]);
      } else if (timelineScope === "MONTH") {
        const pastMonth = new Date();
        pastMonth.setDate(now.getDate() - 30);
        query = query.gte("inspection_date", pastMonth.toISOString().split("T")[0]);
      } else if (timelineScope === "CUSTOM") {
        if (!customStartDate || !customEndDate) {
          alert("Please specify both a start date and an end date.");
          setIsPrintingBatch(false);
          return;
        }
        query = query
          .gte("inspection_date", customStartDate)
          .lte("inspection_date", customEndDate);
      }

      const { data: matchedLogs, error } = await query.order("inspection_date", { ascending: true });

      if (error || !matchedLogs || matchedLogs.length === 0) {
        alert("No grinder inspection logs were recorded within this selected timeframe.");
        setIsPrintingBatch(false);
        return;
      }

      printBatchGrinderInspectionReports(matchedLogs, jhaMap);
      setIsBatchModalOpen(false);
    } catch (err: any) {
      alert(`Failed to execute batch print: ${err?.message || err}`);
    } finally {
      setIsPrintingBatch(false);
    }
  };

  // Core Multi-Sheet Print Engine
  const printBatchGrinderInspectionReports = (
    logs: JhaGrinderInspectionRecord[],
    jhaMap: Map<string, any>
  ) => {
    const pagesHtml = logs
      .map((log) => {
        const job = jhaMap.get(log.jha_id) || {};
        const supervisorName =
          job.supervisor && job.supervisor !== "N/A" && job.supervisor.trim().length > 0
            ? job.supervisor.trim().toUpperCase()
            : job.foreman_name
            ? job.foreman_name.trim().toUpperCase()
            : "UNASSIGNED";

        const inspectorName = log.last_inspected_by_name
          ? log.last_inspected_by_name.toUpperCase()
          : "SAFETY COORDINATOR";

        return `
          <div class="page-sheet">
            <div>
              <!-- HARD COPY IMC HEADER BOX -->
              <div class="doc-header-box">
                <div class="header-top">
                  <div>
                    <div class="company-name">Interwest Mechanical Contractors</div>
                    <div style="font-size: 7.5pt; font-weight: 700; color: #475569; text-transform: uppercase; margin-top: 1px;">
                      Environmental Health &amp; Safety Division
                    </div>
                  </div>
                  <div class="imc-logo">
                    IMC
                    <div class="imc-sub">Safety Compliance</div>
                  </div>
                </div>
                <div class="doc-id-title">IMC-SAF-0032 Portable Grinder In-Process Monitoring Log</div>
                <div class="doc-meta">
                  Shift Compliance Verification &nbsp;|&nbsp; Operating Standard: OSHA 29 CFR 1926.303 &nbsp;|&nbsp; <strong>UNCONTROLLED IF PRINTED</strong>
                </div>
              </div>

              <!-- BASIC RULES SECTION -->
              <div class="section-rules">
                <div class="rules-title">Mandatory Safety Controls During Portable Grinding Operations:</div>
                <ul class="rules-list">
                  <li>Inspect wheel guards prior to operation; ensure firm attachment and maximum 3mm clearance to wheel.</li>
                  <li>Always install and operate with factory side handle attached for dedicated two-handed tool control.</li>
                  <li>Confirm disc RPM meets or exceeds grinder motor nameplate rating; never mount cracked, chipped, or worn discs.</li>
                  <li>Verify power cord and trigger switch deadman mechanism are free of damage, cuts, or taped splices.</li>
                </ul>
              </div>

              <!-- TWO-COLUMN CRITERIA CALLOUTS -->
              <div class="criteria-box">
                <div class="criteria-grid">
                  <div>
                    <div class="criteria-header">Pre-Use Mechanical Controls (Every Round):</div>
                    <div class="check-item"><span class="check-box">☑</span> Wheel guard installed, adjusted to deflect sparks away from operator</div>
                    <div class="check-item"><span class="check-box">☑</span> Wheel-to-guard gap verified strictly &lt; 3 mm</div>
                    <div class="check-item"><span class="check-box">☑</span> Auxiliary side handle securely threaded into place</div>
                    <div class="check-item"><span class="check-box">☑</span> Disc rated RPM is equal to or greater than tool rating</div>
                  </div>

                  <div>
                    <div class="criteria-header">Electrical & Operational Checks:</div>
                    <div class="check-item"><span class="check-box">☑</span> Industrial cord, casing, and plug show no damage or exposed wiring</div>
                    <div class="check-item"><span class="check-box">☑</span> Paddle / deadman switch springs back to OFF when released</div>
                    <div class="check-item"><span class="check-box">☑</span> Mandatory PPE: Full face shield over safety glasses &amp; leather gloves</div>
                    <div class="check-item"><span class="check-box">☑</span> Spark containment blanket / drop zone barricade deployed</div>
                  </div>
                </div>
              </div>

              <!-- STRUCTURED AUDIT INFO BAR -->
              <div class="audit-info-bar">
                <div class="info-cell" style="grid-column: span 2;">
                  <span class="info-label">Project / JHA Job Scope</span>
                  <span class="info-value">${job.title || job.job_title || "PORTABLE GRINDER OPERATION"} ${job.job_number ? `(#${job.job_number})` : ""}</span>
                </div>
                <div class="info-cell">
                  <span class="info-label">Inspection Date</span>
                  <span class="info-value">${log.inspection_date}</span>
                </div>
                <div class="info-cell">
                  <span class="info-label">Facility / Worksite</span>
                  <span class="info-value">NESTLE SPRINGVILLE</span>
                </div>

                <div class="info-cell" style="grid-column: span 2;">
                  <span class="info-label">Designated Job Lead / Supervisor</span>
                  <span class="info-value" style="color: #0369a1;">${supervisorName}</span>
                </div>
                <div class="info-cell">
                  <span class="info-label">Contractor Organization</span>
                  <span class="info-value">INTERWEST MECHANICAL (IMC)</span>
                </div>
                <div class="info-cell">
                  <span class="info-label">Equipment Covered</span>
                  <span class="info-value">ALL PORTABLE GRINDERS ON SCOPE</span>
                </div>
              </div>

              <!-- INTERVAL MATRIX TABLE -->
              <div class="tool-list-container">
                <div class="tool-list-title">
                  <span>Shift In-Process Monitoring Log (${(log.windows || []).length} Intervals Recorded)</span>
                  <span style="font-size: 7pt; font-weight: 700;">1.5-HOUR BREAK-ALIGNED INTERVALS</span>
                </div>

                <table class="matrix-table">
                  <thead>
                    <tr>
                      <th style="width: 15%;">Window Start</th>
                      <th>1. Guards (&lt; 3mm)</th>
                      <th>2. Side Handle</th>
                      <th>3. Disc &amp; RPM</th>
                      <th>4. Cords &amp; Switch</th>
                      <th style="width: 14%;">Overall State</th>
                      <th style="width: 24%;">Inspected By</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${
                      (!log.windows || log.windows.length === 0)
                        ? `<tr><td colspan="7" style="padding: 16px; color: #64748b; font-style: italic;">[ No inspection intervals logged for this shift yet ]</td></tr>`
                        : log.windows
                            .map(
                              (w) => `
                      <tr>
                        <td><strong>${w.label}</strong></td>
                        <td style="font-weight: 800; color: #166534;">${w.guards_ok ? "YES" : "NO"}</td>
                        <td style="font-weight: 800; color: #166534;">${w.handles_ok ? "YES" : "NO"}</td>
                        <td style="font-weight: 800; color: #166534;">${w.disc_rpm_ok ? "YES" : "NO"}</td>
                        <td style="font-weight: 800; color: #166534;">${w.cords_switches_ok ? "YES" : "NO"}</td>
                        <td>
                          <span class="status-badge">✓ ${w.status}</span>
                        </td>
                        <td style="font-size: 7.5pt; font-weight: 800; text-transform: uppercase;">${w.inspected_by_name}</td>
                      </tr>
                    `
                            )
                            .join("")
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <!-- ATTESTATION & SIGN-OFF BOX -->
            <div>
              <div class="signoff-box">
                <div class="attestation-statement">
                  I hereby attest and certify under corporate safety policy that each in-use portable grinder active under this Job Hazard Analysis has been verified at the specified intervals, all guards were adjusted to under 3mm clearance, side handles were secured for two-handed control, rated wheel RPM complied with motor ratings, and cords/deadman switches functioned properly.
                </div>
                <div class="signature-grid">
                  <div>
                    <strong>Digital Signature:</strong> ${inspectorName} (IMC Authorized Inspector)
                  </div>
                  <div>
                    <strong>Inspection Date:</strong> ${log.inspection_date}
                  </div>
                  <div style="text-align: right;">
                    <strong>Assessment:</strong> <span style="color: #065f46; font-weight: 800;">[ X ] FIT &nbsp;&nbsp; [ &nbsp; ] UNFIT</span>
                  </div>
                </div>
              </div>

              <div class="doc-footer">
                INTERWEST MECHANICAL CONTRACTORS — ENVIRONMENTAL HEALTH &amp; SAFETY MANAGEMENT SYSTEM — STRICT COMPLIANCE DOCUMENT
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>IMC - Portable Grinder Inspection Packet</title>
        <style>
          @page {
            size: letter portrait;
            margin: 0.35in 0.45in 0.35in 0.45in;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 0;
            font-size: 8.5pt;
            line-height: 1.25;
          }
          .page-sheet {
            page-break-after: always;
            min-height: 98vh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .page-sheet:last-child {
            page-break-after: avoid;
          }
          .doc-header-box {
            border: 1.5px solid #000;
            padding: 6px 10px;
            margin-bottom: 8px;
          }
          .header-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .company-name {
            font-size: 11.5pt;
            font-weight: 800;
            text-transform: uppercase;
            margin: 0;
            color: #0f172a;
          }
          .imc-logo {
            font-size: 20pt;
            font-style: italic;
            font-weight: 900;
            letter-spacing: -1px;
            color: #d11;
            text-align: right;
            line-height: 1;
          }
          .imc-sub {
            font-size: 6.5pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 700;
            color: #475569;
          }
          .doc-id-title {
            font-size: 9.5pt;
            font-weight: 800;
            margin-top: 4px;
            border-top: 1px solid #000;
            padding-top: 3px;
            text-transform: uppercase;
          }
          .doc-meta {
            font-size: 7.5pt;
            color: #334155;
            margin-top: 1px;
          }
          .section-rules {
            margin-bottom: 8px;
            font-size: 8pt;
          }
          .rules-title {
            font-weight: 800;
            margin-bottom: 2px;
            text-transform: uppercase;
          }
          ul.rules-list {
            margin: 0;
            padding-left: 20px;
          }
          ul.rules-list li {
            margin-bottom: 1.5px;
          }
          .criteria-box {
            border: 1px solid #333;
            background-color: #fafafa;
            padding: 6px 8px;
            margin-bottom: 8px;
          }
          .criteria-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          .criteria-header {
            font-size: 8pt;
            font-weight: 800;
            margin-bottom: 4px;
            border-bottom: 1px solid #999;
            padding-bottom: 2px;
            text-transform: uppercase;
          }
          .check-item {
            display: flex;
            align-items: flex-start;
            gap: 5px;
            font-size: 7.5pt;
            line-height: 1.25;
            margin-bottom: 3px;
          }
          .check-box {
            font-size: 8pt;
            line-height: 1;
          }
          .audit-info-bar {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1.5fr;
            border: 1.5px solid #000;
            background-color: #f1f5f9;
            padding: 5px 8px;
            margin-bottom: 10px;
            font-size: 8pt;
            gap: 4px 8px;
          }
          .info-cell {
            display: flex;
            flex-direction: column;
          }
          .info-label {
            font-size: 6.5pt;
            text-transform: uppercase;
            font-weight: 800;
            color: #475569;
          }
          .info-value {
            font-size: 8.5pt;
            font-weight: 800;
            text-transform: uppercase;
          }
          .tool-list-container {
            flex: 1;
            margin-bottom: 10px;
          }
          .tool-list-title {
            font-size: 8.5pt;
            font-weight: 800;
            text-transform: uppercase;
            border-bottom: 1.5px solid #000;
            padding-bottom: 2px;
            margin-bottom: 4px;
            display: flex;
            justify-content: space-between;
          }
          table.matrix-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8pt;
          }
          table.matrix-table th {
            border-bottom: 1.5px solid #000;
            border-top: 1.5px solid #000;
            padding: 4px 6px;
            text-align: center;
            font-weight: 800;
            font-size: 7.5pt;
            text-transform: uppercase;
            background: #e2e8f0;
          }
          table.matrix-table td {
            border-bottom: 1px solid #cbd5e1;
            border-left: 1px solid #e2e8f0;
            border-right: 1px solid #e2e8f0;
            padding: 4.5px 6px;
            text-align: center;
            vertical-align: middle;
          }
          table.matrix-table tr:nth-child(even) td {
            background-color: #f8fafc;
          }
          .status-badge {
            display: inline-block;
            font-weight: 800;
            font-size: 7pt;
            color: #065f46;
            border: 1px solid #059669;
            background: #ecfdf5;
            padding: 1px 6px;
            border-radius: 2px;
          }
          .signoff-box {
            border: 1.5px solid #000;
            padding: 6px 8px;
            background: #fff;
            margin-top: auto;
          }
          .attestation-statement {
            font-size: 7pt;
            line-height: 1.25;
            margin-bottom: 6px;
            font-style: italic;
          }
          .signature-grid {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
            gap: 8px;
            border-top: 1px dashed #666;
            padding-top: 5px;
            font-size: 7.5pt;
          }
          .doc-footer {
            text-align: center;
            font-size: 6.5pt;
            font-weight: 700;
            text-transform: uppercase;
            margin-top: 6px;
            border-top: 1px solid #000;
            padding-top: 3px;
            color: #334155;
          }
        </style>
      </head>
      <body>
        ${pagesHtml}
      </body>
      </html>
    `;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(fullHtml);
    doc.close();

    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 600);
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-mono text-slate-100 select-none pb-8">
      {/* HEADER CARD */}
      <div className="border p-4 sm:p-6 rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-none bg-[var(--color-brand-blue)] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand-blue)]">
              Nestle Springville In-Process Compliance
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black uppercase text-slate-100 mt-1">
            Portable Grinder Safety Log & Master History
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-0.5">
            1.5-Hour Shift Monitoring across All Project Lifecycles
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setIsBatchModalOpen(true)}
            className="w-full sm:w-auto min-h-[40px] px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] hover:border-white text-slate-200 rounded-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            <span>⎙</span>
            <span>Batch Export Reports</span>
          </button>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Job Title / Lead..."
            className="w-full sm:w-64 min-h-[40px] px-3 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] text-slate-100 text-xs font-bold uppercase rounded-sm outline-none"
          />
        </div>
      </div>

      {/* CATEGORY SELECTOR TABS (Matching DailyJhaManager) */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--color-brand-border)] pb-2 text-xs">
        <button
          type="button"
          onClick={() => setActiveCategoryTab("ACTIVE")}
          className={`px-4 py-2 font-black uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
            activeCategoryTab === "ACTIVE"
              ? "bg-emerald-600 text-white shadow-md"
              : "text-slate-400 hover:text-white bg-[var(--color-brand-card)] border border-[var(--color-brand-border)]"
          }`}
        >
          🚀 Active Tasks ({activeJhas.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveCategoryTab("PAUSED")}
          className={`px-4 py-2 font-black uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
            activeCategoryTab === "PAUSED"
              ? "bg-amber-600 text-white shadow-md"
              : "text-slate-400 hover:text-white bg-[var(--color-brand-card)] border border-[var(--color-brand-border)]"
          }`}
        >
          ⏸ Standby / Paused ({pausedJhas.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveCategoryTab("HOLD")}
          className={`px-4 py-2 font-black uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
            activeCategoryTab === "HOLD"
              ? "bg-cyan-600 text-white shadow-md"
              : "text-slate-400 hover:text-white bg-[var(--color-brand-card)] border border-[var(--color-brand-border)]"
          }`}
        >
          ⏳ Hold / Scheduled ({holdJhas.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveCategoryTab("CLOSED")}
          className={`px-4 py-2 font-black uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
            activeCategoryTab === "CLOSED"
              ? "bg-slate-700 text-white shadow-md"
              : "text-slate-400 hover:text-white bg-[var(--color-brand-card)] border border-[var(--color-brand-border)]"
          }`}
        >
          📁 Closed History ({closedJhas.length})
        </button>
      </div>

      {/* JOBS ROSTER GRID */}
      <div className="border rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] p-4 sm:p-6">
        <div className="flex justify-between items-center border-b border-[var(--color-brand-border)] pb-3 mb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
            {activeCategoryTab} JHA Scopes ({displayedJobs.length})
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Today: {todayStr}</span>
        </div>

        {isLoading ? (
          <div className="p-10 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
            Loading JHA records and grinder safety status...
          </div>
        ) : displayedJobs.length === 0 ? (
          <div className="p-10 text-center border border-dashed border-[var(--color-brand-border)] rounded-sm text-slate-500 text-xs font-bold uppercase tracking-widest">
            [ No {activeCategoryTab.toLowerCase()} jobs found for Nestlé Springville ]
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {displayedJobs.map((job) => {
              const todayLog = todayLogs.get(job.id);
              const windowsLogged = todayLog?.windows || [];
              const isFullyLoggedToday = windowsLogged.length >= STANDARD_WINDOWS.length;

              // Extract custom windows logged today for this job
              const customWindowsLogged = windowsLogged.filter(
                (w) => !STANDARD_WINDOWS.some((std) => std.id === w.window_id)
              );

              return (
                <div
                  key={job.id}
                  onClick={() => handleOpenJobLedger(job)}
                  className="p-4 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] hover:border-[var(--color-brand-blue)] cursor-pointer transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-sm bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-[var(--color-brand-blue)]">
                        {job.location}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-sm border ${
                          job.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : job.status === "PAUSED"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : job.status === "CLOSED"
                            ? "bg-slate-800 text-slate-300 border-slate-700"
                            : "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-black uppercase text-white line-clamp-2">
                      {job.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Lead: <strong className="text-slate-200">{job.supervisor || job.foreman_name || "Unassigned"}</strong>
                    </p>
                  </div>

                  {/* Surface Today Status & Actions */}
                  <div className="space-y-2 pt-2 border-t border-[var(--color-brand-border)]">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Today&apos;s Logs:</span>
                      <span className={windowsLogged.length > 0 ? "text-emerald-400 font-bold" : "text-slate-500"}>
                        {windowsLogged.length} Windows Recorded
                      </span>
                    </div>

                    {/* Window Pill Strip (Shows Standard + Any Custom Added) */}
                    <div className="flex flex-wrap gap-1">
                      {STANDARD_WINDOWS.map((def) => {
                        const isLogged = windowsLogged.some((w) => w.window_id === def.id);
                        return (
                          <span
                            key={def.id}
                            className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-xs border ${
                              isLogged
                                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                                : "bg-slate-900 border-slate-800 text-slate-600"
                            }`}
                          >
                            {def.start_time}
                          </span>
                        );
                      })}

                      {customWindowsLogged.map((cw) => (
                        <span
                          key={cw.window_id}
                          className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-xs border bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                        >
                          {cw.label || cw.start_time}
                        </span>
                      ))}
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={(e) => handleQuickCheckCurrentWindow(job, e)}
                        className="flex-1 min-h-[32px] px-2 bg-[var(--color-brand-blue)] hover:bg-white hover:text-black text-white text-[10px] font-black uppercase rounded-sm cursor-pointer transition-all active:scale-[0.98]"
                      >
                        ⚡ Check ({currentWindowSuggestion.start_time})
                      </button>

                      {!isFullyLoggedToday && (
                        <button
                          type="button"
                          onClick={(e) => handleQuickPassEntireShift(job, e)}
                          className="flex-1 min-h-[32px] px-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase rounded-sm cursor-pointer transition-all active:scale-[0.98]"
                        >
                          ⚡ Pass Shift
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleQuickPrintToday(job, e)}
                        className="px-2.5 min-h-[32px] bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] hover:border-white text-slate-200 text-[10px] font-bold uppercase rounded-sm cursor-pointer transition-colors"
                        title="Print Today's Grinder Log"
                      >
                        🖨️
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handlePrintSingleJobFullLife(job, e)}
                        className="px-2.5 min-h-[32px] bg-[var(--color-brand-card)] border border-[var(--color-brand-blue)]/50 hover:border-white text-cyan-300 text-[10px] font-bold uppercase rounded-sm cursor-pointer transition-colors"
                        title="Print Entire Life Packet for this Job"
                      >
                        📚 Full
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[var(--color-brand-blue)] font-bold uppercase hover:underline">
                        Open History Ledger & Backfill ↗
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: FULL JOB GRINDER LEDGER (ANY DATE INSPECTION & PRINT) */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md font-mono text-slate-100 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full max-w-5xl h-[94vh] max-h-[94vh] flex flex-col border shadow-2xl rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] flex justify-between items-start shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-brand-blue)]">
                      {selectedJob.location} • Grinder Safety Ledger
                    </span>
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm bg-slate-800 text-slate-300">
                      {selectedJob.status}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black uppercase text-white mt-1">
                    {selectedJob.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Lead: <strong className="text-slate-100">{selectedJob.supervisor || selectedJob.foreman_name || "Unassigned"}</strong> • Initiated: {selectedJob.date || "N/A"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePrintSingleJobFullLife(selectedJob)}
                    disabled={jobHistoryLogs.length === 0}
                    className="min-h-[36px] px-3.5 bg-cyan-700 hover:bg-white hover:text-black text-white rounded-sm font-black uppercase text-[11px] transition-all cursor-pointer shadow-sm flex items-center gap-1.5 disabled:opacity-40"
                    title="Print All Historical Days for this Job into One PDF Packet"
                  >
                    <span>📚</span>
                    <span>Print Full Life ({jobHistoryLogs.length} Days)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedJob(null)}
                    className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Drawer Body (2-Column: Editor & Historical Record List) */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 custom-scrollbar text-xs">
                
                {/* Left Column: Date Inspection Editor */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="p-4 rounded-sm bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <span className="text-xs font-black uppercase text-white">
                        Log / Edit Shift Grinder Inspection
                      </span>
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Target Date:</label>
                        <input
                          type="date"
                          value={entryDate}
                          onChange={(e) => handleDateChangeInDrawer(e.target.value)}
                          className="bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] px-2 py-1 text-xs text-white font-bold rounded-sm outline-none cursor-pointer"
                        />
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400">
                      Pick any date above to review, complete, or backfill checks for that shift.
                    </p>

                    {/* Window Toggles */}
                    <div className="space-y-2 pt-2 border-t border-[var(--color-brand-border)]">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase text-slate-300">
                          Standard Shift Windows:
                        </span>
                        <button
                          type="button"
                          onClick={handleFillAllShiftWindowsInDrawer}
                          className="text-[10px] font-black uppercase text-emerald-400 hover:underline cursor-pointer"
                        >
                          ⚡ Pass All {STANDARD_WINDOWS.length} Windows (FIT)
                        </button>
                      </div>

                      {/* Standard Windows Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {STANDARD_WINDOWS.map((def) => {
                          const isLogged = editorWindows.some((w) => w.window_id === def.id);
                          return (
                            <button
                              key={def.id}
                              type="button"
                              onClick={() => handleToggleWindowInDrawer(def)}
                              className={`p-2.5 rounded-sm border text-left cursor-pointer transition-all ${
                                isLogged
                                  ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300 font-bold"
                                  : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700"
                              }`}
                            >
                              <div className="text-[11px] font-black">{def.label}</div>
                              <div className="text-[9px] uppercase mt-0.5">
                                {isLogged ? "✓ Verified FIT" : "Not Logged"}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Windows Active Section with Remove Button */}
                      {editorWindows.filter((w) => !STANDARD_WINDOWS.some((std) => std.id === w.window_id)).length > 0 && (
                        <div className="pt-2 space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                            Custom Logged Windows:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {editorWindows
                              .filter((w) => !STANDARD_WINDOWS.some((std) => std.id === w.window_id))
                              .map((cw) => (
                                <div
                                  key={cw.window_id}
                                  className="flex items-center gap-2 px-2.5 py-1 rounded-sm border bg-cyan-500/10 border-cyan-500/40 text-cyan-300 text-xs font-bold"
                                >
                                  <span>{cw.label} (FIT)</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCustomWindowInDrawer(cw.window_id)}
                                    className="text-red-400 hover:text-white font-bold ml-1 cursor-pointer transition-colors"
                                    title="Remove this custom window"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Custom Window Add Input */}
                      <div className="pt-2 flex items-center gap-2">
                        <input
                          type="text"
                          value={customTime}
                          onChange={(e) => setCustomTime(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddCustomWindowInDrawer();
                            }
                          }}
                          placeholder="Add Custom Window (e.g. 8:00 PM, 5:00 PM)..."
                          className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-white text-xs rounded-sm outline-none flex-1 focus:border-[var(--color-brand-blue)]"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomWindowInDrawer}
                          className="px-3.5 py-1.5 bg-slate-800 hover:bg-white hover:text-black text-white text-[11px] font-bold uppercase rounded-sm cursor-pointer transition-colors"
                        >
                          + Add Window
                        </button>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-3 border-t border-[var(--color-brand-border)] flex justify-between items-center">
                      <span className="text-[10px] text-slate-400">
                        {editorWindows.length} Total Windows Verified
                      </span>
                      <button
                        type="button"
                        disabled={isSavingEntry}
                        onClick={handleSaveDrawerEntry}
                        className="min-h-[40px] px-6 bg-[var(--color-brand-blue)] hover:bg-white hover:text-black text-white text-xs font-black uppercase rounded-sm cursor-pointer transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                      >
                        {isSavingEntry ? "Saving..." : `Save Inspection for ${entryDate} ↗`}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Historical Shift Log List */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex justify-between items-center border-b border-[var(--color-brand-border)] pb-2">
                    <span className="text-xs font-bold uppercase text-slate-300">
                      Recorded Shift Logs ({jobHistoryLogs.length})
                    </span>
                    <button
                      type="button"
                      disabled={jobHistoryLogs.length === 0}
                      onClick={() => handlePrintSingleJobFullLife(selectedJob)}
                      className="text-[10px] text-cyan-400 hover:underline uppercase font-bold cursor-pointer disabled:opacity-40"
                    >
                      Print All {jobHistoryLogs.length} Days ↗
                    </button>
                  </div>

                  {isLoadingHistory ? (
                    <div className="p-8 text-center text-xs text-slate-500 animate-pulse font-bold uppercase">
                      Loading history...
                    </div>
                  ) : jobHistoryLogs.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-[var(--color-brand-border)] text-slate-500 text-xs font-bold uppercase rounded-sm">
                      [ No inspection logs on record for this job ]
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                      {jobHistoryLogs.map((log) => (
                        <div
                          key={log.id || log.inspection_date}
                          className={`p-3 border rounded-sm transition-all flex justify-between items-center ${
                            log.inspection_date === entryDate
                              ? "bg-[var(--color-brand-card)] border-[var(--color-brand-blue)]"
                              : "bg-[var(--color-brand-bg)] border-[var(--color-brand-border)]"
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black uppercase text-white">
                                {log.inspection_date}
                              </span>
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                {log.windows?.length || 0} Windows
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                              Inspector: {log.last_inspected_by_name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDateChangeInDrawer(log.inspection_date)}
                              className="px-2.5 py-1 text-[10px] font-bold uppercase bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-sm cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePrintSpecificLog(log)}
                              className="px-2.5 py-1 text-[10px] font-bold uppercase bg-[var(--color-brand-blue)] text-white hover:bg-white hover:text-black rounded-sm cursor-pointer"
                            >
                              🖨️ Print
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] flex justify-between items-center shrink-0">
                <button
                  type="button"
                  onClick={() => handlePrintSingleJobFullLife(selectedJob)}
                  disabled={jobHistoryLogs.length === 0}
                  className="px-4 py-2 bg-cyan-700 hover:bg-cyan-600 text-white rounded-sm font-black uppercase text-xs cursor-pointer disabled:opacity-40"
                >
                  ⎙ Print Entire Job Grinder History ({jobHistoryLogs.length} Days)
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  className="px-6 py-2 border border-[var(--color-brand-border)] text-slate-400 hover:text-white rounded-sm font-bold uppercase text-xs cursor-pointer"
                >
                  Close Ledger
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: GLOBAL BATCH MULTI-TIMELINE EXPORT DIALOG */}
      <AnimatePresence>
        {isBatchModalOpen && (
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-3 bg-black/90 backdrop-blur-md font-mono text-slate-100 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-lg border rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] shadow-2xl p-5 sm:p-6 space-y-5"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-[var(--color-brand-border)] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[var(--color-brand-blue)] tracking-wider">
                    In-Process Monitoring Archives
                  </span>
                  <h3 className="text-sm font-black uppercase text-white mt-0.5">
                    Batch Print Portable Grinder Logs
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer px-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Timeline Option Buttons */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Choose Timeline Scope
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: "DAY", label: "Single Day" },
                      { id: "WEEK", label: "Past 7 Days" },
                      { id: "MONTH", label: "Past 30 Days" },
                      { id: "FULL_LIFE", label: "All Active Jobs" },
                      { id: "CUSTOM", label: "Custom Dates" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setTimelineScope(opt.id as TimelineScope)}
                        className={`py-2.5 px-3 border rounded-sm text-center uppercase font-bold text-xs cursor-pointer transition-colors ${
                          timelineScope === opt.id
                            ? "border-[var(--color-brand-blue)] bg-[var(--color-brand-blue)]/15 text-white font-black"
                            : "border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] text-slate-400 hover:text-white"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub-inputs based on timeline selection */}
                {timelineScope === "DAY" && (
                  <div className="p-3 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] rounded-sm space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Target Inspection Date:
                    </label>
                    <input
                      type="date"
                      value={batchSingleDate}
                      onChange={(e) => setBatchSingleDate(e.target.value)}
                      className="w-full bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] px-3 py-1.5 text-xs text-white font-bold rounded-sm outline-none cursor-pointer"
                    />
                  </div>
                )}

                {timelineScope === "CUSTOM" && (
                  <div className="p-3 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] rounded-sm space-y-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Custom Inspection Date Range:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="w-full bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] px-2.5 py-1.5 text-xs text-white font-bold rounded-sm outline-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="w-full bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] px-2.5 py-1.5 text-xs text-white font-bold rounded-sm outline-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {timelineScope === "FULL_LIFE" && (
                  <div className="p-3 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] rounded-sm text-[10px] text-slate-400 space-y-1">
                    <p className="font-bold text-cyan-400 uppercase">All Active JHAs Batch Scope:</p>
                    <p>
                      Exports every single daily grinder safety sheet ever logged across all active, paused, and hold JHAs currently in progress.
                    </p>
                  </div>
                )}

                {(timelineScope === "WEEK" || timelineScope === "MONTH") && (
                  <div className="p-3 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] rounded-sm text-[10px] text-slate-400">
                    Gathers and prints all grinder safety monitoring sheets logged within the {timelineScope === "WEEK" ? "past 7 days" : "past 30 days"} across all active and archived job scopes.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-[var(--color-brand-border)]">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 border border-[var(--color-brand-border)] text-slate-400 hover:text-white uppercase font-bold text-xs rounded-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isPrintingBatch}
                  onClick={handleExecuteBatchPrint}
                  className="px-6 py-2 bg-[var(--color-brand-blue)] text-white hover:bg-white hover:text-black uppercase font-black text-xs rounded-sm cursor-pointer transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-md active:scale-[0.98]"
                >
                  <span>⎙</span>
                  <span>{isPrintingBatch ? "Generating Multi-Page Report..." : "Generate Batch Print ↗"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}