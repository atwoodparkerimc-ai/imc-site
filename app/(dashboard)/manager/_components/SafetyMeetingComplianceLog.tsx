"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

export interface SafetyBriefingTopic {
  id: string;
  title: string;
  category: string;
}

export interface MeetingCompletionLogEntry {
  id: string;
  user_id: string;
  briefing_id: string;
  briefing_title?: string;
  location?: string;
  completed_at: string;
}

interface UserProfileSubset {
  id: string;
  first_name?: string;
  last_name?: string;
  nickname?: string;
  location?: string;
  role?: string;
}

interface SafetyMeetingComplianceLogProps {
  briefings: SafetyBriefingTopic[];
  completions: MeetingCompletionLogEntry[];
  allUsers: UserProfileSubset[];
  activeSite: string;
  formatEmployeeName: (u: any) => string;
  itemVariants?: Variants;
}

type ComplianceStatus = "CURRENT" | "REFRESHER_DUE" | "NOT_TRAINED";

interface EmployeeMeetingStat {
  user: UserProfileSubset;
  fullName: string;
  status: ComplianceStatus;
  latestDate: string | null;
  latestTimestamp: number;
  totalCompletions: number;
  history: MeetingCompletionLogEntry[];
}

export default function SafetyMeetingComplianceLog({
  briefings = [],
  completions = [],
  allUsers = [],
  activeSite = "ALL",
  formatEmployeeName,
  itemVariants,
}: SafetyMeetingComplianceLogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [expandedUserIds, setExpandedUserIds] = useState<Record<string, boolean>>({});
  
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printScope, setPrintScope] = useState<string>("ALL");
  const [printTimeframe, setPrintTimeframe] = useState<"1M" | "1Y" | "ALL">("1Y");
  const [printDetailLevel, setPrintDetailLevel] = useState<"SUMMARY" | "FULL_AUDIT">("SUMMARY");
  const [currentDateString, setCurrentDateString] = useState("");

  // Grouped lists for the dropdowns
  const policies = briefings.filter(b => !b.id.startsWith("tbt-"));
  const toolboxTalks = briefings.filter(b => b.id.startsWith("tbt-"));

  useEffect(() => {
    setCurrentDateString(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  const siteUsers = useMemo(() => {
    return (allUsers || []).filter((u) => {
      if (activeSite === "ALL") return true;
      return (u.location || "").trim().toLowerCase() === activeSite.trim().toLowerCase();
    });
  }, [allUsers, activeSite]);

  const oneYearAgoMs = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 365);
    return d.getTime();
  }, []);

  const meetingSummaries = useMemo(() => {
    return briefings.map((topic) => {
      const topicLogs = completions.filter(
        (c) => c.briefing_id === topic.id || c.briefing_title === topic.title
      );

      const siteFilteredLogs = topicLogs.filter((log) => {
        if (activeSite === "ALL") return true;
        const matchingUser = allUsers.find((u) => u.id === log.user_id);
        const logLoc = log.location || matchingUser?.location || "";
        return logLoc.trim().toLowerCase() === activeSite.trim().toLowerCase();
      });

      let latestDateOverall: string | null = null;
      let latestOverallTimestamp = 0;

      siteFilteredLogs.forEach((l) => {
        const time = new Date(l.completed_at).getTime();
        if (time > latestOverallTimestamp) {
          latestOverallTimestamp = time;
          latestDateOverall = l.completed_at;
        }
      });

      const employeeBreakdown: EmployeeMeetingStat[] = siteUsers.map((user) => {
        const userLogs = topicLogs.filter((l) => l.user_id === user.id);
        const sortedUserLogs = [...userLogs].sort(
          (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
        );

        const latest = sortedUserLogs[0];
        const latestTime = latest ? new Date(latest.completed_at).getTime() : 0;
        const total = sortedUserLogs.length;

        let status: ComplianceStatus = "NOT_TRAINED";
        if (latest) {
          status = latestTime >= oneYearAgoMs ? "CURRENT" : "REFRESHER_DUE";
        }

        return {
          user,
          fullName: formatEmployeeName(user),
          status,
          latestDate: latest?.completed_at || null,
          latestTimestamp: latestTime,
          totalCompletions: total,
          history: sortedUserLogs,
        };
      }).sort((a, b) => {
        const statusWeight = { CURRENT: 1, REFRESHER_DUE: 2, NOT_TRAINED: 3 };
        if (statusWeight[a.status] !== statusWeight[b.status]) {
          return statusWeight[a.status] - statusWeight[b.status];
        }
        return a.fullName.localeCompare(b.fullName);
      });

      const currentCount = employeeBreakdown.filter((e) => e.status === "CURRENT").length;
      const totalCrew = siteUsers.length;
      const complianceRate = totalCrew > 0 ? Math.round((currentCount / totalCrew) * 100) : 0;

      return {
        topic,
        latestDateOverall,
        employeeBreakdown,
        currentCount,
        totalCrew,
        complianceRate,
      };
    });
  }, [briefings, completions, siteUsers, allUsers, activeSite, oneYearAgoMs, formatEmployeeName]);

  const filteredSummaries = useMemo(() => {
    if (!searchQuery.trim()) return meetingSummaries;
    const q = searchQuery.toLowerCase();
    return meetingSummaries.filter(
      (m) =>
        m.topic.title.toLowerCase().includes(q) ||
        m.topic.id.toLowerCase().includes(q) ||
        m.topic.category?.toLowerCase().includes(q)
    );
  }, [meetingSummaries, searchQuery]);

  const activeMeetingDetail = useMemo(() => {
    if (!selectedMeetingId) return null;
    return meetingSummaries.find((m) => m.topic.id === selectedMeetingId) || null;
  }, [selectedMeetingId, meetingSummaries]);

  const toggleUserExpanded = (userId: string) => {
    setExpandedUserIds((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  // --- PROFESSIONAL EXECUTIVE DOCUMENT PRINT ENGINE ---
  const handleExecutePrint = () => {
    setIsPrintModalOpen(false);

    // Filter which topics to print based on the new broad scopes
    let topicsToPrint: typeof meetingSummaries = [];
    let scopeLabel = `Topic ${printScope}`;

    if (printScope === "ALL") {
      topicsToPrint = meetingSummaries;
      scopeLabel = `Master Catalog (${topicsToPrint.length} Topics)`;
    } else if (printScope === "POLICIES_ONLY") {
      topicsToPrint = meetingSummaries.filter((m) => !m.topic.id.startsWith("tbt-"));
      scopeLabel = `Formal Policies Only (${topicsToPrint.length} Topics)`;
    } else if (printScope === "TBT_ONLY") {
      topicsToPrint = meetingSummaries.filter((m) => m.topic.id.startsWith("tbt-"));
      scopeLabel = `Toolbox Talks Only (${topicsToPrint.length} Topics)`;
    } else {
      topicsToPrint = meetingSummaries.filter((m) => m.topic.id === printScope);
    }

    // Build the clean HTML document
    const printDocHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>IMC OSHA Safety Compliance Report</title>
        <style>
          @page {
            size: letter portrait;
            margin: 0.5in 0.5in 0.6in 0.5in;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            color: #111827;
            background: #ffffff;
            margin: 0;
            padding: 0;
            font-size: 9pt;
            line-height: 1.35;
          }
          .header-table {
            width: 100%;
            border-bottom: 2.5px solid #0f172a;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          .logo {
            height: 38px;
            width: auto;
            display: block;
          }
          .company-title {
            font-size: 15pt;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #0f172a;
            margin: 0;
          }
          .report-subtitle {
            font-size: 10pt;
            font-weight: 700;
            text-transform: uppercase;
            color: #334155;
            margin: 2px 0 0 0;
          }
          .osha-ref {
            font-size: 7.5pt;
            font-family: monospace;
            font-weight: 700;
            color: #475569;
            margin-top: 3px;
          }
          .meta-box {
            font-family: monospace;
            font-size: 8pt;
            text-align: right;
            line-height: 1.4;
            color: #334155;
          }
          .meta-box strong {
            color: #0f172a;
          }
          .topic-block {
            margin-bottom: 24px;
            page-break-inside: avoid;
          }
          .page-break {
            page-break-before: always;
          }
          .topic-header {
            background-color: #f8fafc;
            border: 1.5px solid #0f172a;
            border-left: 5px solid #0f172a;
            padding: 8px 12px;
            margin-bottom: 6px;
          }
          .topic-code {
            background-color: #0f172a;
            color: #ffffff;
            font-family: monospace;
            font-size: 7.5pt;
            font-weight: 900;
            padding: 2px 5px;
            border-radius: 2px;
          }
          .topic-cat {
            font-size: 7.5pt;
            font-weight: 700;
            text-transform: uppercase;
            color: #475569;
            margin-left: 6px;
          }
          .topic-title {
            font-size: 11pt;
            font-weight: 900;
            text-transform: uppercase;
            margin: 4px 0 0 0;
            color: #0f172a;
          }
          .topic-stats {
            font-family: monospace;
            text-align: right;
          }
          .topic-stats .pct {
            font-size: 13pt;
            font-weight: 900;
            color: #0f172a;
          }
          .topic-stats .lbl {
            font-size: 7.5pt;
            font-weight: 700;
            text-transform: uppercase;
            color: #475569;
          }
          .topic-submeta {
            font-size: 7pt;
            font-family: monospace;
            color: #64748b;
            text-transform: uppercase;
            margin-top: 4px;
            padding-top: 4px;
            border-top: 1px dashed #cbd5e1;
            display: flex;
            justify-content: space-between;
          }
          table.audit-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #cbd5e1;
            font-size: 8pt;
          }
          table.audit-table th {
            background-color: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 5px 8px;
            text-align: left;
            font-weight: 800;
            text-transform: uppercase;
            font-size: 7.5pt;
            color: #1e293b;
          }
          table.audit-table td {
            border: 1px solid #cbd5e1;
            padding: 4px 8px;
            color: #334155;
          }
          table.audit-table tr:nth-child(even) {
            background-color: #fafafa;
          }
          .status-tag {
            font-weight: 900;
            font-size: 7pt;
            text-transform: uppercase;
            letter-spacing: 0.2px;
          }
          .status-current { color: #047857; }
          .status-due { color: #b45309; }
          .status-not { color: #b91c1c; }
          .history-row {
            background-color: #f8fafc !important;
            font-family: monospace;
            font-size: 7pt;
            color: #475569;
          }
          .history-list {
            padding: 4px 8px 4px 16px;
            border-left: 2px solid #0f172a;
            margin: 2px 0;
          }
          .signoff-section {
            margin-top: 24px;
            padding-top: 12px;
            border-top: 1.5px solid #0f172a;
            page-break-inside: avoid;
          }
          .attestation-text {
            font-size: 7pt;
            font-family: monospace;
            color: #475569;
            text-transform: uppercase;
            line-height: 1.35;
            margin-bottom: 16px;
          }
          .sig-row {
            display: flex;
            justify-content: space-between;
            gap: 20px;
          }
          .sig-col {
            flex: 1;
          }
          .sig-line {
            border-bottom: 1.5px solid #0f172a;
            height: 28px;
            margin-bottom: 4px;
          }
          .sig-label {
            font-size: 7.5pt;
            font-weight: 800;
            text-transform: uppercase;
            color: #0f172a;
          }
          .sig-sublabel {
            font-size: 6.5pt;
            color: #64748b;
            text-transform: uppercase;
          }
        </style>
      </head>
      <body>

        <!-- DOCUMENT HEADER -->
        <table class="header-table" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width: 140px; vertical-align: top;">
              <img src="/imclogo.svg" alt="IMC Logo" class="logo" />
            </td>
            <td style="vertical-align: top; padding-left: 12px;">
              <h1 class="company-title">Interwest Mechanical Contractors</h1>
              <div class="report-subtitle">Safety Compliance & Training Audit Record</div>
              <div class="osha-ref">OSHA Standard Compliance: 29 CFR 1926.21(b)(2) & 29 CFR 1910</div>
            </td>
            <td class="meta-box" style="vertical-align: top;">
              <div><strong>AUDIT DATE:</strong> ${currentDateString}</div>
              <div><strong>PROJECT SITE:</strong> ${activeSite === "ALL" ? "COMPANY-WIDE MASTER" : activeSite.toUpperCase()}</div>
              <div><strong>RECORD SCOPE:</strong> ${scopeLabel}</div>
              <div><strong>AUDIT PERIOD:</strong> ${printTimeframe === "1Y" ? "365-Day Compliance" : printTimeframe === "1M" ? "Past 30 Days" : "Complete History"}</div>
            </td>
          </tr>
        </table>

        <!-- TOPIC CONTENT BLOCKS -->
        ${topicsToPrint.map((m, idx) => `
          <div class="topic-block ${idx > 0 && printDetailLevel === "SUMMARY" ? "page-break" : ""}">
            <div class="topic-header">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td>
                    <span class="topic-code">${m.topic.id}</span>
                    <span class="topic-cat">${m.topic.category || "General Safety Directive"}</span>
                    <h2 class="topic-title">${m.topic.title}</h2>
                  </td>
                  <td class="topic-stats" style="width: 120px;">
                    <div class="pct">${m.complianceRate}%</div>
                    <div class="lbl">${m.currentCount} / ${m.totalCrew} Compliant</div>
                  </td>
                </tr>
              </table>
              <div class="topic-submeta">
                <span>Method: 60s Policy Timed Gate + Comprehension Check</span>
                <span>Refresher Cycle: Mandatory 365-Day Validity</span>
              </div>
            </div>

            <table class="audit-table">
              <thead>
                <tr>
                  <th style="width: 32%;">Employee Legal Name</th>
                  <th style="width: 22%;">Assigned Site</th>
                  <th style="width: 22%; text-align: center;">Compliance Status</th>
                  <th style="width: 14%; text-align: right;">Latest Session</th>
                  <th style="width: 10%; text-align: right;">Total Logs</th>
                </tr>
              </thead>
              <tbody>
                ${m.employeeBreakdown.map((emp) => {
                  const historyLogs = emp.history.filter((h) => {
                    if (printTimeframe === "ALL") return true;
                    const hTime = new Date(h.completed_at).getTime();
                    const now = new Date().getTime();
                    const diffDays = (now - hTime) / (1000 * 3600 * 24);
                    if (printTimeframe === "1M") return diffDays <= 30;
                    if (printTimeframe === "1Y") return diffDays <= 365;
                    return true;
                  });

                  return `
                    <tr>
                      <td style="font-weight: 700; text-transform: uppercase;">${emp.fullName}</td>
                      <td style="font-family: monospace; font-size: 7.5pt; text-transform: uppercase;">${emp.user.location || activeSite.toUpperCase()}</td>
                      <td style="text-align: center;">
                        ${emp.status === "CURRENT" ? `<span class="status-tag status-current">✓ CURRENT / VERIFIED</span>` : ""}
                        ${emp.status === "REFRESHER_DUE" ? `<span class="status-tag status-due">⚠ REFRESHER DUE (EXPIRED)</span>` : ""}
                        ${emp.status === "NOT_TRAINED" ? `<span class="status-tag status-not">✕ NOT COMPLETED</span>` : ""}
                      </td>
                      <td style="text-align: right; font-family: monospace;">
                        ${emp.latestDate ? new Date(emp.latestDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : "--"}
                      </td>
                      <td style="text-align: right; font-family: monospace; font-weight: 700;">${emp.totalCompletions}x</td>
                    </tr>
                    ${printDetailLevel === "FULL_AUDIT" && historyLogs.length > 0 ? `
                      <tr class="history-row">
                        <td colspan="5">
                          <div class="history-list">
                            <strong>Itemized Log:</strong>
                            ${historyLogs.map(h => `
                              <span style="margin-right: 14px; display: inline-block;">
                                ${new Date(h.completed_at).toLocaleString()} (${h.location || "Site"})
                              </span>
                            `).join('')}
                          </div>
                        </td>
                      </tr>
                    ` : ""}
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `).join('')}

        <!-- LEGAL SIGN-OFF SECTION -->
        <div class="signoff-section">
          <div class="attestation-text">
            Attestation Statement: This official compliance ledger certifies that the workers identified above received and acknowledged the occupational safety briefings specified in this document in accordance with OSHA 29 CFR 1926.21 and company safety policies.
          </div>
          <div class="sig-row">
            <div class="sig-col" style="flex: 2;">
              <div class="sig-line"></div>
              <div class="sig-label">Authorized Safety Director / Manager Signature</div>
              <div class="sig-sublabel">Interwest Mechanical Contractors Compliance Authority</div>
            </div>
            <div class="sig-col">
              <div class="sig-line"></div>
              <div class="sig-label">Date</div>
              <div class="sig-sublabel">Execution Verification</div>
            </div>
            <div class="sig-col">
              <div class="sig-line"></div>
              <div class="sig-label">OSHA Audit Reference #</div>
              <div class="sig-sublabel">Job File / Project Code</div>
            </div>
          </div>
        </div>

      </body>
      </html>
    `;

    // Create an invisible iframe to print the document cleanly
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
    doc.write(printDocHTML);
    doc.close();

    // Trigger print after rendering
    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 400);
  };

  return (
    <>
      {/* 
        ========================================================
        INTERACTIVE DIGITAL DASHBOARD (Screen View)
        ========================================================
      */}
      <motion.div variants={itemVariants} className="space-y-4 sm:space-y-6 font-mono text-slate-100 select-none">
        <div className="border p-3.5 sm:p-6 shadow-2xl relative overflow-hidden group rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)]">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-border)] group-hover:bg-[var(--color-brand-blue)] transition-colors duration-300" />

          {/* HEADER */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3.5 sm:gap-4 mb-4 sm:mb-6 border-b border-[var(--color-brand-border)] pb-3.5 sm:pb-4">
            <div>
              <h2 className="text-slate-100 font-black uppercase tracking-tight text-sm sm:text-base md:text-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-none bg-[var(--color-brand-blue)] animate-pulse flex-shrink-0" />
                Safety Meeting Compliance Log
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                OSHA Training Ledger • Site:{" "}
                <span className="text-[var(--color-brand-blue)] font-bold">{activeSite.toUpperCase()}</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH TOPICS..."
                  className="w-full min-h-[44px] py-2 px-3 pl-8 text-xs text-slate-200 uppercase font-bold outline-none rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] transition-all"
                />
                <span className="absolute left-2.5 top-3.5 text-slate-500 text-xs">⌕</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPrintScope(selectedMeetingId || "ALL");
                  setIsPrintModalOpen(true);
                }}
                className="w-full sm:w-auto min-h-[44px] px-4 py-2 text-xs font-black uppercase tracking-wider border rounded-sm transition-all flex items-center justify-center gap-2 bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] text-[var(--color-brand-green,#00ff9d)] hover:border-[var(--color-brand-green,#00ff9d)] hover:bg-[var(--color-brand-green,#00ff9d)]/10 active:scale-[0.98] cursor-pointer touch-manipulation"
              >
                <span>⎙</span>
                <span>Audit Printout</span>
              </button>
            </div>
          </div>

          {/* MASTER METRICS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mb-4 sm:mb-6">
            <div className="p-3 rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] flex flex-col justify-between">
              <span className="text-[9px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-widest block mb-1 truncate">
                Catalog Topics
              </span>
              <span className="text-base sm:text-xl font-black tabular-nums text-slate-100">{briefings.length}</span>
            </div>
            <div className="p-3 rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] flex flex-col justify-between">
              <span className="text-[9px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-widest block mb-1 truncate">
                Active Crew
              </span>
              <span className="text-base sm:text-xl font-black tabular-nums text-[var(--color-brand-blue)]">
                {siteUsers.length} <span className="text-[9px] text-slate-400">EMP</span>
              </span>
            </div>
            <div className="p-3 rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] flex flex-col justify-between">
              <span className="text-[9px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-widest block mb-1 truncate">
                Total Sign-Offs
              </span>
              <span className="text-base sm:text-xl font-black tabular-nums text-[var(--color-brand-green,#00ff9d)]">
                {completions.length} <span className="text-[9px] text-slate-400">LOGS</span>
              </span>
            </div>
            <div className="p-3 rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] flex flex-col justify-between">
              <span className="text-[9px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-widest block mb-1 truncate">
                Validity
              </span>
              <span className="text-[11px] sm:text-xs font-black uppercase text-slate-300">365 DAYS</span>
            </div>
          </div>

          {/* MOBILE LIST CARDS */}
          <div className="block md:hidden space-y-3">
            {filteredSummaries.length > 0 ? (
              filteredSummaries.map((m) => {
                const isHigh = m.complianceRate >= 80;
                const isMid = m.complianceRate >= 50 && m.complianceRate < 80;

                return (
                  <div
                    key={`mobile-${m.topic.id}`}
                    onClick={() => setSelectedMeetingId(m.topic.id)}
                    className="p-3.5 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] active:scale-[0.99] transition-all space-y-3 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-sm bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-[var(--color-brand-blue)] flex-shrink-0">
                        {m.topic.id}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-right">
                        {m.topic.category || "General Safety"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xs font-black uppercase text-white leading-snug">
                        {m.topic.title}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">
                        Last Session: {m.latestDateOverall ? new Date(m.latestDateOverall).toLocaleDateString() : "No Activity"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[var(--color-brand-border)]">
                      <span
                        className={`px-2 py-0.5 border text-[10px] font-black uppercase tabular-nums rounded-sm ${
                          isHigh
                            ? "bg-[var(--color-brand-green,#00ff9d)]/10 border-[var(--color-brand-green,#00ff9d)]/40 text-[var(--color-brand-green,#00ff9d)]"
                            : isMid
                            ? "bg-[#eab308]/10 border-[#eab308]/40 text-[#eab308]"
                            : "bg-[var(--color-brand-red,#ff3b5c)]/10 border-[var(--color-brand-red,#ff3b5c)]/40 text-[var(--color-brand-red,#ff3b5c)]"
                        }`}
                      >
                        {m.currentCount} / {m.totalCrew} ({m.complianceRate}%)
                      </span>

                      <button
                        type="button"
                        className="min-h-[38px] px-3 text-[10px] font-black uppercase tracking-wider rounded-sm border bg-[var(--color-brand-card)] border-[var(--color-brand-blue)] text-[var(--color-brand-blue)] transition-all flex items-center gap-1"
                      >
                        Inspect Roster ↗
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-500 uppercase text-xs font-bold border border-dashed border-[var(--color-brand-border)]">
                [ NO SAFETY MEETINGS CONFIGURED ]
              </div>
            )}
          </div>

          {/* DESKTOP / TABLET DATA TABLE */}
          <div className="hidden md:block overflow-x-auto border border-[var(--color-brand-border)] rounded-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-wider bg-[var(--color-brand-bg)] border-[var(--color-brand-border)]">
                  <th className="p-3 w-1/3">Meeting Title & Code</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Latest Session</th>
                  <th className="p-3 text-center">Compliance Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-brand-border)] bg-[var(--color-brand-card)]">
                {filteredSummaries.length > 0 ? (
                  filteredSummaries.map((m) => {
                    const isHigh = m.complianceRate >= 80;
                    const isMid = m.complianceRate >= 50 && m.complianceRate < 80;

                    return (
                      <tr
                        key={m.topic.id}
                        onClick={() => setSelectedMeetingId(m.topic.id)}
                        className="transition-colors hover:bg-[var(--color-brand-bg)]/80 cursor-pointer group"
                      >
                        <td className="p-3 font-bold text-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-sm bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] text-[var(--color-brand-blue)] flex-shrink-0">
                              {m.topic.id}
                            </span>
                            <span className="truncate group-hover:text-[var(--color-brand-blue)] transition-colors">
                              {m.topic.title}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-[10px] text-slate-400 uppercase font-bold">{m.topic.category || "--"}</td>
                        <td className="p-3 font-bold text-slate-300 tabular-nums text-[11px]">
                          {m.latestDateOverall ? new Date(m.latestDateOverall).toLocaleDateString() : "--"}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-1 border text-[10px] font-black uppercase tabular-nums rounded-sm whitespace-nowrap ${
                              isHigh
                                ? "bg-[var(--color-brand-green,#00ff9d)]/10 border-[var(--color-brand-green,#00ff9d)]/40 text-[var(--color-brand-green,#00ff9d)]"
                                : isMid
                                ? "bg-[#eab308]/10 border-[#eab308]/40 text-[#eab308]"
                                : "bg-[var(--color-brand-red,#ff3b5c)]/10 border-[var(--color-brand-red,#ff3b5c)]/40 text-[var(--color-brand-red,#ff3b5c)]"
                            }`}
                          >
                            {m.currentCount} / {m.totalCrew} ({m.complianceRate}%)
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            className="min-h-[36px] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] group-hover:border-[var(--color-brand-blue)] group-hover:text-[var(--color-brand-blue)] text-slate-400 transition-all whitespace-nowrap"
                          >
                            View Log ↗
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-500 uppercase text-xs font-bold tracking-widest">
                      [ NO SAFETY MEETINGS CONFIGURED ]
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DRILL-DOWN ROSTER DRAWER */}
        <AnimatePresence>
          {activeMeetingDetail && (
            <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className="w-full max-w-4xl max-h-[92svh] flex flex-col border shadow-2xl rounded-t-sm sm:rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] overflow-hidden"
              >
                <div className="p-3.5 sm:p-5 border-b border-[var(--color-brand-border)] flex justify-between items-start bg-[var(--color-brand-bg)]">
                  <div className="pr-4">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-sm bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-[var(--color-brand-blue)]">
                        {activeMeetingDetail.topic.id}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                        {activeSite.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-base font-black uppercase text-slate-100 leading-snug">
                      {activeMeetingDetail.topic.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedMeetingId(null)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white text-xl font-black rounded-sm active:bg-[var(--color-brand-card)] shrink-0 touch-manipulation"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-3.5 sm:p-5 overflow-y-auto space-y-2.5 flex-1 bg-[var(--color-brand-card)] custom-scrollbar">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-[var(--color-brand-border)] pb-2 mb-2 px-1">
                    <span>Crew Member Status</span>
                    <span>Total Logs</span>
                  </div>

                  {activeMeetingDetail.employeeBreakdown.map((emp) => {
                    const isExpanded = !!expandedUserIds[emp.user.id];

                    return (
                      <div
                        key={emp.user.id}
                        className="border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] overflow-hidden"
                      >
                        <div
                          onClick={() => toggleUserExpanded(emp.user.id)}
                          className="min-h-[48px] p-2.5 sm:p-3 flex items-center justify-between cursor-pointer active:bg-[var(--color-brand-card)]/50 transition-colors touch-manipulation"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <span
                              className={`w-2.5 h-2.5 rounded-none flex-shrink-0 ${
                                emp.status === "CURRENT"
                                  ? "bg-[var(--color-brand-green,#00ff9d)]"
                                  : emp.status === "REFRESHER_DUE"
                                  ? "bg-[#eab308]"
                                  : "bg-[var(--color-brand-red,#ff3b5c)]"
                              }`}
                            />
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-black text-slate-100 uppercase truncate">
                                {emp.fullName}
                              </p>
                              <p className="text-[9px] sm:text-[10px] uppercase font-bold mt-0.5 tracking-wider truncate">
                                {emp.status === "CURRENT" && (
                                  <span className="text-[var(--color-brand-green,#00ff9d)]">
                                    CURRENT: {new Date(emp.latestDate!).toLocaleDateString()}
                                  </span>
                                )}
                                {emp.status === "REFRESHER_DUE" && (
                                  <span className="text-[#eab308]">
                                    EXPIRED ({new Date(emp.latestDate!).toLocaleDateString()})
                                  </span>
                                )}
                                {emp.status === "NOT_TRAINED" && (
                                  <span className="text-[var(--color-brand-red,#ff3b5c)]">
                                    NOT TRAINED
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            <span className="text-xs sm:text-sm font-black tabular-nums text-slate-300">
                              {emp.totalCompletions}x
                            </span>
                            <span className={`text-[10px] text-slate-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                              ▼
                            </span>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-[var(--color-brand-border)] bg-[var(--color-brand-card)] p-2.5 text-xs space-y-1"
                            >
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                                Complete Audit History
                              </span>
                              {emp.history.length > 0 ? (
                                emp.history.map((h, idx) => (
                                  <div
                                    key={h.id || idx}
                                    className="flex justify-between items-center text-[10px] font-mono text-slate-300 py-1.5 px-2 border-b border-[var(--color-brand-border)]/40 last:border-0"
                                  >
                                    <span>{new Date(h.completed_at).toLocaleString()}</span>
                                    <span className="text-slate-500 uppercase">{h.location || "On-Site"}</span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-[10px] text-slate-500 uppercase font-bold py-1">[ No Historic Sign-offs ]</p>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3.5 sm:p-4 border-t border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPrintScope(activeMeetingDetail.topic.id);
                      setIsPrintModalOpen(true);
                    }}
                    className="w-full sm:w-auto min-h-[48px] px-6 text-xs font-black uppercase tracking-wider border rounded-sm bg-[var(--color-brand-blue)] border-[var(--color-brand-blue)] text-white hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] touch-manipulation"
                  >
                    <span>⎙</span>
                    <span>Print This Topic Report</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* PRINT CONFIGURATION MODAL */}
        <AnimatePresence>
          {isPrintModalOpen && (
            <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className="w-full max-w-lg border shadow-2xl rounded-t-sm sm:rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] p-4 sm:p-6 max-h-[92svh] overflow-y-auto"
              >
                <div className="flex justify-between items-center border-b border-[var(--color-brand-border)] pb-3.5 mb-4">
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-100 flex items-center gap-2">
                    <span className="text-[var(--color-brand-blue)]">⎙</span> Generate Audit Report
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsPrintModalOpen(false)}
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs font-bold text-slate-100">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-slate-400 block mb-1.5">
                      Target Meeting Scope
                    </label>
                    <select
                      value={printScope}
                      onChange={(e) => setPrintScope(e.target.value)}
                      className="w-full min-h-[48px] p-2.5 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] text-slate-100 uppercase rounded-sm outline-none text-xs cursor-pointer"
                    >
                      <option value="ALL" className="font-black text-white bg-[var(--color-brand-card)]">All Safety Topics (Policies & TBTs)</option>
                      <option value="POLICIES_ONLY" className="font-black text-white bg-[var(--color-brand-card)]">Company Policies Only (001–026)</option>
                      <option value="TBT_ONLY" className="font-black text-white bg-[var(--color-brand-card)]">Toolbox Talks Only</option>
                      
                      <optgroup label="Single Company Policy" className="bg-[var(--color-brand-bg)] text-[var(--color-brand-blue)] mt-2">
                        {policies.map((b) => (
                          <option key={b.id} value={b.id} className="text-white bg-[var(--color-brand-card)] font-normal">
                            {b.id} — {b.title}
                          </option>
                        ))}
                      </optgroup>

                      {toolboxTalks.length > 0 && (
                        <optgroup label="Single Toolbox Talk" className="bg-[var(--color-brand-bg)] text-[#eab308] mt-2">
                          {toolboxTalks.map((b) => (
                            <option key={b.id} value={b.id} className="text-white bg-[var(--color-brand-card)] font-normal">
                              {b.id} — {b.title}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-slate-400 block mb-1.5">
                        Time Horizon
                      </label>
                      <select
                        value={printTimeframe}
                        onChange={(e) => setPrintTimeframe(e.target.value as any)}
                        className="w-full min-h-[48px] p-2.5 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] text-slate-100 uppercase rounded-sm outline-none text-xs cursor-pointer"
                      >
                        <option value="1M">Past 30 Days</option>
                        <option value="1Y">1 Year (OSHA Standard)</option>
                        <option value="ALL">Complete History</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-slate-400 block mb-1.5">
                        Report Format
                      </label>
                      <select
                        value={printDetailLevel}
                        onChange={(e) => setPrintDetailLevel(e.target.value as any)}
                        className="w-full min-h-[48px] p-2.5 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] text-slate-100 uppercase rounded-sm outline-none text-xs cursor-pointer"
                      >
                        <option value="SUMMARY">Roster Overview (1 Page per Topic)</option>
                        <option value="FULL_AUDIT">Full Sign-Off History</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[var(--color-brand-border)] flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsPrintModalOpen(false)}
                      className="w-full min-h-[48px] font-black uppercase tracking-wider border border-[var(--color-brand-border)] text-slate-400 hover:text-slate-100 rounded-sm cursor-pointer transition-colors"
                    >
                      Abort
                    </button>
                    <button
                      type="button"
                      onClick={handleExecutePrint}
                      className="w-full min-h-[48px] font-black uppercase tracking-wider bg-[var(--color-brand-blue)] border-[var(--color-brand-blue)] text-white hover:bg-white hover:text-black rounded-sm cursor-pointer transition-all active:scale-[0.98]"
                    >
                      Execute Print
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}