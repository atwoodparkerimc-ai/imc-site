// lib/reports/grinderInspectionPrint.ts
import { GrinderInspectionWindow, JhaGrinderInspectionRecord } from "@/lib/db/grinderInspectionOperations";

export interface PrintJobGrinderPayload {
  job_title?: string;
  job_number?: string;
  supervisor?: string;
  inspection_date: string;
  location?: string;
  inspector_name?: string;
  windows?: GrinderInspectionWindow[];
  // Fallbacks if a raw database record is passed
  jha_id?: string;
  last_inspected_by_name?: string;
}

/**
 * Shared HTML renderer for a Portable Grinder In-Process Monitoring Log.
 * Accepts either the UI job payload or raw database record and generates the identical document.
 */
export function renderGrinderHtml(data: PrintJobGrinderPayload | JhaGrinderInspectionRecord): string {
  const supervisorName =
    "supervisor" in data && data.supervisor && data.supervisor !== "N/A" && data.supervisor.trim().length > 0
      ? data.supervisor.trim().toUpperCase()
      : "UNASSIGNED";

  const inspectorName =
    ("inspector_name" in data && data.inspector_name)
      ? data.inspector_name.toUpperCase()
      : ("last_inspected_by_name" in data && data.last_inspected_by_name)
      ? data.last_inspected_by_name.toUpperCase()
      : "SAFETY COORDINATOR";

  const titleDisplay =
    ("job_title" in data && data.job_title)
      ? `${data.job_title} ${data.job_number ? `(#${data.job_number})` : ""}`
      : `JHA ID: ${("jha_id" in data && data.jha_id) ? data.jha_id.toUpperCase() : "GENERAL SCOPE"}`;

  const locationDisplay = (data.location || "NESTLE SPRINGVILLE").toUpperCase();
  const windowsList = data.windows || [];

  return `
    <div class="document-container grinder-doc">
      <!-- IMC HARD COPY HEADER BOX -->
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
            <div class="criteria-header">Electrical &amp; Operational Checks:</div>
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
          <span class="info-value">${titleDisplay}</span>
        </div>
        <div class="info-cell">
          <span class="info-label">Inspection Date</span>
          <span class="info-value">${data.inspection_date}</span>
        </div>
        <div class="info-cell">
          <span class="info-label">Facility / Worksite</span>
          <span class="info-value">${locationDisplay}</span>
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
          <span>Shift In-Process Monitoring Log (${windowsList.length} Intervals Recorded)</span>
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
              windowsList.length === 0
                ? `<tr><td colspan="7" style="padding: 16px; color: #64748b; font-style: italic;">[ No inspection intervals logged for this shift yet ]</td></tr>`
                : windowsList
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

      <!-- ATTESTATION & SIGN-OFF BOX -->
      <div class="signoff-wrapper">
        <div class="signoff-box">
          <div class="attestation-statement">
            I hereby attest and certify under corporate safety policy that each in-use portable grinder active under this Job Hazard Analysis has been verified at the specified intervals, all guards were adjusted, side handles were secured for two-handed control, rated wheel RPM complied with motor ratings, and cords/deadman switches functioned properly.
          </div>
          <div class="signature-grid">
            <div>
              <strong>Digital Signature:</strong> ${inspectorName} (IMC Authorized Inspector)
            </div>
            <div>
              <strong>Inspection Date:</strong> ${data.inspection_date}
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
}

/**
 * Shared CSS rules for Grinder inspection print formatting.
 */
export const GRINDER_PRINT_CSS = `
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
`;

/**
 * Standalone trigger to print the Grinder inspection report.
 */
export function printGrinderInspectionReport(data: PrintJobGrinderPayload | JhaGrinderInspectionRecord) {
  const innerHtml = renderGrinderHtml(data);

  const printDocHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>IMC - Portable Grinder Safety Inspection Checklist</title>
      <style>
        ${GRINDER_PRINT_CSS}
      </style>
    </head>
    <body>
      ${innerHtml}
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