// lib/reports/safetyMeetingPrint.ts

export interface SafetyMeetingPrintEmployeeStat {
  fullName: string;
  status: "CURRENT" | "REFRESHER_DUE" | "NOT_TRAINED";
  latestDate: string | null;
  totalCompletions: number;
  history: {
    id?: string;
    completed_at: string;
    location?: string;
  }[];
  user: {
    location?: string;
  };
}

export interface SafetyMeetingPrintSubcontractorLog {
  company_name?: string;
  completed_at: string;
  attendee_names?: string[];
  location?: string;
}

export interface SafetyMeetingPrintTopicSummary {
  topic: {
    id: string;
    title: string;
    category?: string;
  };
  complianceRate: number;
  currentCount: number;
  totalCrew: number;
  employeeBreakdown: SafetyMeetingPrintEmployeeStat[];
  subcontractorLogs?: SafetyMeetingPrintSubcontractorLog[];
}

export interface SafetyMeetingPrintPayload {
  activeSite: string;
  scopeLabel: string;
  currentDateString: string;
  printTimeframe: "1M" | "1Y" | "ALL";
  printDetailLevel: "SUMMARY" | "FULL_AUDIT";
  topics: SafetyMeetingPrintTopicSummary[];
}

/**
 * Shared HTML renderer for Safety Meeting & Training Compliance Topics.
 * Used identically by single-form print runs and the multi-form Master Binder.
 */
export function renderSafetyMeetingHtml(
  data: SafetyMeetingPrintPayload
): string {
  const {
    activeSite,
    scopeLabel,
    currentDateString,
    printTimeframe,
    printDetailLevel,
    topics,
  } = data;

  if (!topics || topics.length === 0) return "";

  const timeframeLabel =
    printTimeframe === "1Y"
      ? "365-Day Validity (OSHA Standard)"
      : printTimeframe === "1M"
      ? "Past 30 Days"
      : "Complete History";

  return topics
    .map((m) => {
      return `
        <div class="document-container safety-meeting-doc">
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
            <div class="doc-id-title">IMC-SAF-0012 Safety Meeting Compliance &amp; Training Audit Record</div>
            <div class="doc-meta">
              Regulatory Training Standard: OSHA 29 CFR 1926.21(b)(2) &amp; 1910 &nbsp;|&nbsp; <strong>UNCONTROLLED IF PRINTED</strong>
            </div>
          </div>

          <!-- STRUCTURED AUDIT INFO BAR -->
          <div class="audit-info-bar">
            <div class="info-cell" style="grid-column: span 2;">
              <span class="info-label">Report Scope / Subject</span>
              <span class="info-value">${scopeLabel}</span>
            </div>
            <div class="info-cell">
              <span class="info-label">Audit Date</span>
              <span class="info-value">${currentDateString}</span>
            </div>
            <div class="info-cell">
              <span class="info-label">Facility / Location</span>
              <span class="info-value">${activeSite === "ALL" ? "COMPANY-WIDE MASTER" : activeSite.toUpperCase()}</span>
            </div>

            <div class="info-cell" style="grid-column: span 2;">
              <span class="info-label">Compliance Period</span>
              <span class="info-value" style="color: #0369a1;">${timeframeLabel}</span>
            </div>
            <div class="info-cell">
              <span class="info-label">Active Crew</span>
              <span class="info-value">${m.totalCrew} EMPLOYEES</span>
            </div>
            <div class="info-cell">
              <span class="info-label">Compliance Status</span>
              <span class="info-value" style="color: #065f46;">${m.complianceRate}% (${m.currentCount} PASS)</span>
            </div>
          </div>

          <!-- TOPIC BAR -->
          <div class="topic-header-bar">
            <div>
              <span class="topic-code-badge">${m.topic.id}</span>
              <span style="font-size: 7.5pt; font-weight: 700; color: #475569; text-transform: uppercase; margin-left: 6px;">
                ${m.topic.category || "General Safety Directive"}
              </span>
              <h2 class="topic-heading">${m.topic.title}</h2>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 11pt; font-weight: 900; color: #065f46;">${m.complianceRate}%</span>
              <div style="font-size: 6.5pt; font-weight: 700; color: #64748b; text-transform: uppercase;">
                ${m.currentCount} / ${m.totalCrew} Verified
              </div>
            </div>
          </div>

          <!-- ROSTER AUDIT TABLE -->
          <div class="table-container">
            <div class="table-section-title">
              <span>Verified Personnel Attendance &amp; Refresher Tracking</span>
              <span style="font-size: 7pt; font-weight: 700;">
                ${printDetailLevel === "FULL_AUDIT" ? "COMPLETE SESSION AUDIT TRAIL" : "ROSTER OVERVIEW"}
              </span>
            </div>

            <table class="audit-table">
              <thead>
                <tr>
                  <th style="width: 32%;">Employee Legal Name</th>
                  <th style="width: 22%;">Assigned Worksite</th>
                  <th style="width: 20%; text-align: center;">Compliance Status</th>
                  <th style="width: 14%; text-align: right;">Latest Session</th>
                  <th style="width: 12%; text-align: right;">Total Logs</th>
                </tr>
              </thead>
              <tbody>
                ${m.employeeBreakdown
                  .map((emp) => {
                    const filteredHistory = (emp.history || []).filter((h) => {
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
                      <td style="font-size: 7pt; text-transform: uppercase; color: #475569;">
                        ${emp.user.location || activeSite.toUpperCase()}
                      </td>
                      <td style="text-align: center;">
                        ${
                          emp.status === "CURRENT"
                            ? `<span class="status-tag status-current">✓ CURRENT</span>`
                            : emp.status === "REFRESHER_DUE"
                            ? `<span class="status-tag status-due">⚠ REFRESHER DUE</span>`
                            : `<span class="status-tag status-not">✕ NOT COMPLETED</span>`
                        }
                      </td>
                      <td style="text-align: right; font-family: monospace; font-size: 7pt;">
                        ${emp.latestDate ? new Date(emp.latestDate).toLocaleDateString() : "--"}
                      </td>
                      <td style="text-align: right; font-family: monospace; font-size: 7.5pt; font-weight: 800;">
                        ${emp.totalCompletions}x
                      </td>
                    </tr>
                    ${
                      printDetailLevel === "FULL_AUDIT" && filteredHistory.length > 0
                        ? `
                      <tr class="history-subrow">
                        <td colspan="5">
                          <div class="history-chip-list">
                            <span style="font-weight: 800; margin-right: 6px; text-transform: uppercase;">Sign-Off Sessions:</span>
                            ${filteredHistory
                              .map(
                                (h) => `
                              <span class="history-chip">
                                ${new Date(h.completed_at).toLocaleString([], {
                                  month: "2-digit",
                                  day: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })} (${(h.location || "On-Site").toUpperCase()})
                              </span>
                            `
                              )
                              .join("")}
                          </div>
                        </td>
                      </tr>
                    `
                        : ""
                    }
                  `;
                  })
                  .join("")}

                <!-- SUBCONTRACTORS -->
                ${
                  m.subcontractorLogs && m.subcontractorLogs.length > 0
                    ? `
                  <tr class="sub-header-row">
                    <td colspan="5">VERIFIED SUBCONTRACTOR &amp; THIRD-PARTY ATTENDANCE (${m.subcontractorLogs.length} LOGGED)</td>
                  </tr>
                  ${m.subcontractorLogs
                    .map(
                      (sub) => `
                    <tr>
                      <td style="font-weight: 800; text-transform: uppercase; color: #92400e;">
                        ${sub.company_name || "Subcontractor Vendor"}
                      </td>
                      <td style="font-size: 7pt; text-transform: uppercase; color: #475569;">
                        ${(sub.location || activeSite).toUpperCase()}
                      </td>
                      <td colspan="2" style="font-size: 7pt; font-weight: 600;">
                        ${
                          sub.attendee_names && sub.attendee_names.length > 0
                            ? sub.attendee_names.join(", ")
                            : "[ Roster Verified ]"
                        }
                      </td>
                      <td style="text-align: right; font-family: monospace; font-size: 7pt;">
                        ${new Date(sub.completed_at).toLocaleDateString()}
                      </td>
                    </tr>
                  `
                    )
                    .join("")}
                `
                    : ""
                }
              </tbody>
            </table>
          </div>

          <!-- BOTTOM ATTESTATION & SIGN-OFF BOX -->
          <div class="signoff-wrapper">
            <div class="signoff-box">
              <div class="attestation-statement">
                I hereby attest that this compliance ledger accurately reflects verified worker completion of the safety training modules administered in accordance with OSHA 29 CFR 1926.21 and Interwest Mechanical Contractors Environmental Health &amp; Safety guidelines.
              </div>
              <div class="signature-grid">
                <div>
                  <strong>Safety Director / Auditor:</strong> ___________________________
                </div>
                <div>
                  <strong>Audit Date:</strong> ${currentDateString}
                </div>
                <div style="text-align: right;">
                  <strong>Status:</strong> <span style="color: #065f46; font-weight: 800;">VERIFIED &amp; COMPLIANT</span>
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
}

/**
 * Shared CSS rules for Safety Meeting print formatting.
 */
export const SAFETY_MEETING_PRINT_CSS = `
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
    font-size: 8pt;
    line-height: 1.25;
  }
  .document-container {
    page-break-before: always;
    break-before: page;
    clear: both;
  }
  .document-container:first-of-type {
    page-break-before: avoid;
    break-before: auto;
  }
  tr {
    page-break-inside: avoid;
    break-inside: avoid;
  }
  thead {
    display: table-header-group;
  }
  .signoff-wrapper {
    page-break-inside: avoid;
    break-inside: avoid;
    margin-top: 6px;
  }

  .doc-header-box {
    border: 1.5px solid #000;
    padding: 6px 10px;
    margin-bottom: 7px;
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

  .audit-info-bar {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1.5fr;
    border: 1.5px solid #000;
    background-color: #f1f5f9;
    padding: 5px 8px;
    margin-bottom: 8px;
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

  .topic-header-bar {
    border: 1px solid #000;
    background: #f8fafc;
    padding: 5px 8px;
    margin-bottom: 5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .topic-code-badge {
    background: #0f172a;
    color: #fff;
    font-size: 7.5pt;
    font-weight: 900;
    padding: 1.5px 5px;
    border-radius: 2px;
  }
  .topic-heading {
    font-size: 9.5pt;
    font-weight: 900;
    text-transform: uppercase;
    margin: 2px 0 0 0;
  }

  .table-container {
    margin-bottom: 8px;
  }
  .table-section-title {
    font-size: 8pt;
    font-weight: 800;
    text-transform: uppercase;
    border-bottom: 1.5px solid #000;
    padding-bottom: 2px;
    margin-bottom: 4px;
    display: flex;
    justify-content: space-between;
  }
  table.audit-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 7.5pt;
    margin-bottom: 6px;
  }
  table.audit-table th {
    border-bottom: 1.5px solid #000;
    border-top: 1.5px solid #000;
    padding: 3.5px 5px;
    text-align: left;
    font-weight: 800;
    font-size: 7pt;
    text-transform: uppercase;
    background: #e2e8f0;
  }
  table.audit-table td {
    border-bottom: 1px solid #cbd5e1;
    border-left: 1px solid #e2e8f0;
    border-right: 1px solid #e2e8f0;
    padding: 3px 5px;
    vertical-align: middle;
  }
  table.audit-table tr:nth-child(even) td {
    background-color: #f8fafc;
  }

  .status-tag {
    font-weight: 900;
    font-size: 6.5pt;
    text-transform: uppercase;
    padding: 1px 4px;
    border-radius: 2px;
    display: inline-block;
  }
  .status-current {
    color: #065f46;
    background: #ecfdf5;
    border: 1px solid #059669;
  }
  .status-due {
    color: #92400e;
    background: #fef3c7;
    border: 1px solid #d97706;
  }
  .status-not {
    color: #991b1b;
    background: #fee2e2;
    border: 1px solid #dc2626;
  }

  .history-subrow td {
    background-color: #f1f5f9 !important;
    padding: 3px 6px 4px 12px !important;
  }
  .history-chip-list {
    font-size: 6.5pt;
    font-family: monospace;
    color: #334155;
  }
  .history-chip {
    display: inline-block;
    margin-right: 8px;
    background: #fff;
    border: 1px solid #cbd5e1;
    padding: 0.5px 4px;
    border-radius: 2px;
  }

  .sub-header-row td {
    background-color: #fef08a !important;
    font-weight: 900;
    text-align: center;
    letter-spacing: 1px;
    text-transform: uppercase;
    font-size: 7.5pt;
    padding: 3px !important;
    border-top: 1.5px solid #000 !important;
    border-bottom: 1.5px solid #000 !important;
    color: #000;
  }

  .signoff-box {
    border: 1.5px solid #000;
    padding: 6px 8px;
    background: #fff;
  }
  .attestation-statement {
    font-size: 7pt;
    line-height: 1.25;
    margin-bottom: 5px;
    font-style: italic;
  }
  .signature-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 8px;
    border-top: 1px dashed #666;
    padding-top: 4px;
    font-size: 7.5pt;
  }
  .doc-footer {
    text-align: center;
    font-size: 6.5pt;
    font-weight: 700;
    text-transform: uppercase;
    margin-top: 5px;
    border-top: 1px solid #000;
    padding-top: 3px;
    color: #334155;
  }
`;

/**
 * Standalone trigger to print Safety Meeting reports.
 */
export function printSafetyMeetingReport(data: SafetyMeetingPrintPayload) {
  const contentHtml = renderSafetyMeetingHtml(data);
  if (!contentHtml) return;

  const printDocHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>IMC-SAF-0012 Safety Meeting Compliance Audit</title>
      <style>
        ${SAFETY_MEETING_PRINT_CSS}
      </style>
    </head>
    <body>
      ${contentHtml}
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
  doc.write(printDocHTML);
  doc.close();

  iframe.contentWindow?.focus();
  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1000);
  }, 500);
}