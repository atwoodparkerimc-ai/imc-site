// lib/reports/dailySafetyCheckPrint.ts
import {
  SafetyCheckSheetRecord,
  SafetyCheckWindowDef,
  computeRowSpans,
} from "@/lib/db/dailySafetyCheckOperations";

export const DEFAULT_SAFETY_CHECK_WINDOWS: SafetyCheckWindowDef[] = [
  { id: "w1", label: "06:00 – 07:30", start_time: "06:00", end_time: "07:30" },
  { id: "w2", label: "07:30 – 09:00", start_time: "07:30", end_time: "09:00" },
  { id: "w3", label: "09:30 – 11:00", start_time: "09:30", end_time: "11:00" },
  { id: "w4", label: "11:00 – 12:00", start_time: "11:00", end_time: "12:00" },
  { id: "w5", label: "12:30 – 02:00", start_time: "12:30", end_time: "02:00" },
  { id: "w6", label: "02:00 – 03:30", start_time: "02:00", end_time: "03:30" },
];

/**
 * Shared HTML renderer for a Daily Personnel Safety Checks & Shift Monitoring Roster.
 * Used identically by single-form print runs and the Master Binder.
 */
export function renderSafetyCheckHtml(
  sheet: SafetyCheckSheetRecord,
  orderedWindows: SafetyCheckWindowDef[] = DEFAULT_SAFETY_CHECK_WINDOWS
): string {
  const entries = sheet.entries || [];
  const employees = entries.filter((e) => e.worker_type === "EMPLOYEE");
  const subs = entries.filter((e) => e.worker_type === "SUB");

  const auditorDisplay =
    sheet.auditor_name && sheet.auditor_name.trim().length > 0
      ? sheet.auditor_name.trim().toUpperCase()
      : "UNASSIGNED";

  const topicDisplay =
    sheet.safety_topic && sheet.safety_topic.trim().length > 0
      ? sheet.safety_topic.trim().toUpperCase()
      : "DAILY SAFETY BRIEFING";

  const locationDisplay = (sheet.location || "NESTLE SPRINGVILLE").toUpperCase();

  return `
    <div class="document-container safety-check-doc">
      <!-- HARD COPY IMC HEADER BOX -->
      <div class="doc-header-box">
        <div class="header-top">
          <div>
            <div class="company-name">Interwest Mechanical Contractors</div>
            <div class="company-division">Environmental Health &amp; Safety Division</div>
          </div>
          <div class="imc-logo">
            IMC
            <div class="imc-sub">Safety Compliance</div>
          </div>
        </div>
        <div class="doc-id-title">IMC-SAF-0028 Daily Personnel Safety Checks &amp; Shift Monitoring Roster</div>
        <div class="doc-meta">
          Shift Compliance Verification &nbsp;|&nbsp; Operating Standard: OSHA 29 CFR 1926.20 &nbsp;|&nbsp; <strong>UNCONTROLLED IF PRINTED</strong>
        </div>
      </div>

      <!-- STRUCTURED AUDIT INFO BAR -->
      <div class="audit-info-bar">
        <div class="info-cell" style="grid-column: span 2;">
          <span class="info-label">Daily Safety Topic / Meeting</span>
          <span class="info-value">${topicDisplay}</span>
        </div>
        <div class="info-cell">
          <span class="info-label">Shift Date</span>
          <span class="info-value">${sheet.check_date}</span>
        </div>
        <div class="info-cell">
          <span class="info-label">Worksite / Location</span>
          <span class="info-value">${locationDisplay}</span>
        </div>

        <div class="info-cell" style="grid-column: span 2;">
          <span class="info-label">Auditor / Safety Lead</span>
          <span class="info-value" style="color: #0369a1;">${auditorDisplay}</span>
        </div>
        <div class="info-cell">
          <span class="info-label">Active Windows</span>
          <span class="info-value">${orderedWindows.length} INTERVALS</span>
        </div>
        <div class="info-cell">
          <span class="info-label">Total Personnel</span>
          <span class="info-value">${entries.length} LOGGED</span>
        </div>
      </div>

      <!-- ROSTER SECTION -->
      <div class="roster-container">
        <div class="roster-title">
          <span>Verified On-Site Personnel Roster</span>
          <span style="font-size: 6.5pt; font-weight: 700;">IN-PROCESS MONITORING INTERVALS</span>
        </div>

        <table class="roster-table">
          <thead>
            <tr>
              <th rowspan="2" class="worker-name-cell">Worker Legal Name</th>
              <th colspan="${orderedWindows.length}">Break-Aligned Shift Windows</th>
              <th rowspan="2" style="width: 30%;">Shift Notes / Remarks</th>
            </tr>
            <tr>
              ${orderedWindows
                .map(
                  (w) => `
                <th style="font-size: 6pt; font-weight: 800; min-width: 44px;">
                  ${w.start_time}<br><span style="color: #64748b; font-weight: 600;">${w.end_time}</span>
                </th>
              `
                )
                .join("")}
            </tr>
          </thead>
          <tbody>
            ${employees
              .map((emp) => {
                const spans = computeRowSpans(orderedWindows, emp.window_checks || {});
                return `
                <tr>
                  <td class="worker-name-cell">${emp.worker_name}</td>
                  ${spans
                    .map((s) => {
                      if (s.type === "FIT") {
                        return `<td class="fit-cell">X</td>`;
                      }
                      return `<td colspan="${s.colSpan}" class="merged-off-cell">OFF</td>`;
                    })
                    .join("")}
                  <td style="text-align: left; padding-left: 6px; font-size: 6.5pt;">${emp.comments || ""}</td>
                </tr>
              `;
              })
              .join("")}

            <!-- SUBCONTRACTORS HEADER -->
            <tr class="sub-header-row">
              <td colspan="${orderedWindows.length + 2}">SUB'S (SUBCONTRACTORS &amp; TEMPORARY TRADES)</td>
            </tr>

            ${
              subs.length === 0
                ? `<tr><td colspan="${orderedWindows.length + 2}" style="padding: 5px; color: #64748b; font-style: italic; background: #fff;">[ No subcontractors logged on site for this shift ]</td></tr>`
                : subs
                    .map((sub) => {
                      const spans = computeRowSpans(orderedWindows, sub.window_checks || {});
                      return `
                  <tr>
                    <td class="worker-name-cell" style="color: #92400e;">${sub.worker_name}</td>
                    ${spans
                      .map((s) => {
                        if (s.type === "FIT") {
                          return `<td class="fit-cell">X</td>`;
                        }
                        return `<td colspan="${s.colSpan}" class="merged-off-cell">OFF</td>`;
                      })
                      .join("")}
                    <td style="text-align: left; padding-left: 6px; font-size: 6.5pt;">${sub.comments || ""}</td>
                  </tr>
                `;
                    })
                    .join("")
            }
          </tbody>
        </table>
      </div>

      <!-- DAILY COMMENTS BOX -->
      <div class="comments-box">
        <div class="comments-header">Daily Shift Observations, Housekeeping &amp; Site Notes:</div>
        <div class="comments-text">${sheet.general_comments || "All crews checked and verified operating in compliance with safe site protocols and authorized scope."}</div>
      </div>

      <!-- ATTESTATION & SIGN-OFF BOX -->
      <div class="signoff-wrapper">
        <div class="signoff-box">
          <div class="attestation-statement">
            I hereby attest that each worker itemized above was verified active, accounted for, and inspected in compliance with Interwest Mechanical Contractors Environmental Health &amp; Safety procedures across each designated shift window. Any absences, departures, or reassignments have been properly annotated.
          </div>
          <div class="signature-grid">
            <div>
              <strong>Safety Lead / Auditor:</strong> ${auditorDisplay}
            </div>
            <div>
              <strong>Date Verified:</strong> ${sheet.check_date}
            </div>
            <div style="text-align: right;">
              <strong>Shift Roster Status:</strong> <span style="color: #065f46; font-weight: 800;">VERIFIED &amp; RECORDED</span>
            </div>
          </div>
        </div>

        <div class="doc-footer">
          INTERWEST MECHANICAL CONTRACTORS — ENVIRONMENTAL HEALTH &amp; SAFETY MANAGEMENT SYSTEM — STRICT COMPLIANCE DOCUMENT
        </div>
      </div>
    </div>
  `;
}

export const SAFETY_CHECK_PRINT_CSS = `
  @page {
    size: letter portrait;
    margin: 0.3in 0.4in 0.3in 0.4in;
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
    line-height: 1.2;
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

  /* HEADER BOX */
  .doc-header-box {
    border: 1.5px solid #000;
    padding: 5px 8px;
    margin-bottom: 5px;
  }
  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .company-name {
    font-size: 11pt;
    font-weight: 800;
    text-transform: uppercase;
    margin: 0;
    color: #0f172a;
  }
  .company-division {
    font-size: 6.5pt;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    margin-top: 1px;
  }
  .imc-logo {
    font-size: 18pt;
    font-style: italic;
    font-weight: 900;
    letter-spacing: -1px;
    color: #d11;
    text-align: right;
    line-height: 1;
  }
  .imc-sub {
    font-size: 6pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 700;
    color: #475569;
  }
  .doc-id-title {
    font-size: 9pt;
    font-weight: 800;
    margin-top: 3px;
    border-top: 1px solid #000;
    padding-top: 2px;
    text-transform: uppercase;
  }
  .doc-meta {
    font-size: 7pt;
    color: #334155;
    margin-top: 1px;
  }

  /* AUDIT INFO BAR */
  .audit-info-bar {
    display: grid;
    grid-template-columns: 2.2fr 1fr 1fr 1.5fr;
    border: 1.5px solid #000;
    background-color: #f1f5f9;
    padding: 4px 7px;
    margin-bottom: 6px;
    font-size: 7.5pt;
    gap: 3px 6px;
  }
  .info-cell {
    display: flex;
    flex-direction: column;
  }
  .info-label {
    font-size: 6pt;
    text-transform: uppercase;
    font-weight: 800;
    color: #475569;
  }
  .info-value {
    font-size: 8pt;
    font-weight: 800;
    text-transform: uppercase;
  }

  /* MAIN ROSTER TABLE */
  .roster-container {
    margin-bottom: 5px;
  }
  .roster-title {
    font-size: 8pt;
    font-weight: 800;
    text-transform: uppercase;
    border-bottom: 1.5px solid #000;
    padding-bottom: 2px;
    margin-bottom: 3px;
    display: flex;
    justify-content: space-between;
  }
  table.roster-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 7.5pt;
  }
  table.roster-table th {
    border-bottom: 1.5px solid #000;
    border-top: 1.5px solid #000;
    padding: 3px 3px;
    text-align: center;
    font-weight: 800;
    font-size: 6.5pt;
    text-transform: uppercase;
    background: #e2e8f0;
  }
  table.roster-table td {
    border-bottom: 1px solid #cbd5e1;
    border-left: 1px solid #e2e8f0;
    border-right: 1px solid #e2e8f0;
    padding: 2.5px 4px;
    text-align: center;
    vertical-align: middle;
  }
  table.roster-table tr:nth-child(even) td {
    background-color: #f8fafc;
  }
  .worker-name-cell {
    text-align: left !important;
    padding-left: 6px !important;
    font-weight: 700;
    text-transform: uppercase;
    width: 25%;
    white-space: nowrap;
  }
  .fit-cell {
    font-weight: 900;
    color: #166534;
  }
  .merged-off-cell {
    background-color: #f1f5f9;
    color: #64748b;
    font-weight: 800;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    font-size: 6.5pt;
  }
  .sub-header-row td {
    background-color: #fef08a !important;
    font-weight: 900;
    text-align: center;
    letter-spacing: 1px;
    text-transform: uppercase;
    font-size: 7pt;
    padding: 2.5px !important;
    border-top: 1.5px solid #000 !important;
    border-bottom: 1.5px solid #000 !important;
    color: #000;
  }

  /* COMMENTS BOX */
  .comments-box {
    border: 1px solid #333;
    background: #fafafa;
    padding: 4px 6px;
    margin-bottom: 5px;
  }
  .comments-header {
    font-size: 7pt;
    font-weight: 800;
    text-transform: uppercase;
    border-bottom: 1px solid #999;
    padding-bottom: 1px;
    margin-bottom: 2px;
  }
  .comments-text {
    font-size: 7pt;
    line-height: 1.2;
    min-height: 20px;
  }

  /* ATTESTATION BOX */
  .signoff-box {
    border: 1.5px solid #000;
    padding: 5px 7px;
    background: #fff;
  }
  .attestation-statement {
    font-size: 6.5pt;
    line-height: 1.2;
    margin-bottom: 4px;
    font-style: italic;
  }
  .signature-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 6px;
    border-top: 1px dashed #666;
    padding-top: 3px;
    font-size: 7pt;
  }

  /* FOOTER */
  .doc-footer {
    text-align: center;
    font-size: 6pt;
    font-weight: 700;
    text-transform: uppercase;
    margin-top: 4px;
    border-top: 1px solid #000;
    padding-top: 2px;
    color: #334155;
  }
`;

export function printSafetyCheckLedger(
  sheets: { sheet: SafetyCheckSheetRecord; orderedWindows?: SafetyCheckWindowDef[] }[]
) {
  if (!sheets || sheets.length === 0) return;

  const contentHtml = sheets
    .map(({ sheet, orderedWindows }) => renderSafetyCheckHtml(sheet, orderedWindows))
    .join("");

  const printDocHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>IMC Daily Safety Checks Roster</title>
      <style>
        ${SAFETY_CHECK_PRINT_CSS}
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
  }, 600);
}