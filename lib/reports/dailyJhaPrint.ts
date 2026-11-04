// lib/reports/dailyJhaPrint.ts
import { DailyJhaRecord, JhaAcknowledgmentRecord } from "@/lib/db/operations";

export interface PrintJhaSingleOptions {
  jha: DailyJhaRecord;
  acks: JhaAcknowledgmentRecord[];
  mode: "TODAY_ONLY" | "MASTER_HISTORY";
}

export interface PrintJhaBatchOptions {
  reports: { jha: DailyJhaRecord; acks: JhaAcknowledgmentRecord[] }[];
  reportTitle: string;
}

function formatDateTime(dateString: string) {
  if (!dateString) return "--";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "--";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Shared HTML renderer for a Job Hazard Analysis (JHA) document.
 * Used identically by single-form print runs and the Master Binder.
 */
export function renderJhaHtml(
  jha: DailyJhaRecord,
  acks: JhaAcknowledgmentRecord[],
  scopeLabel: string = "Daily Shift Roster"
): string {
  const supervisorName =
    jha.supervisor && jha.supervisor.trim().length > 0
      ? jha.supervisor.trim().toUpperCase()
      : "UNASSIGNED";

  const trainingList = jha.training_required || [];
  const permitsList = jha.permits_required || [];
  const equipmentList = jha.equipment_used || [];
  const certsList = jha.certifications_required || [];
  const stepsList = jha.steps || [];

  return `
    <div class="document-container jha-doc">
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
        <div class="doc-id-title">IMC-SAF-0004 Job Hazard Analysis (JHA) &amp; Pre-Task Safety Plan</div>
        <div class="doc-meta">
          Mandatory Operating Standard: OSHA 29 CFR 1926.21(b)(2) &nbsp;|&nbsp; <strong>UNCONTROLLED IF PRINTED</strong>
        </div>
      </div>

      <!-- STRUCTURED AUDIT INFO BAR -->
      <div class="audit-info-bar">
        <div class="info-cell" style="grid-column: span 2;">
          <span class="info-label">Task Scope / Job Description</span>
          <span class="info-value">${(jha.title || "DAILY MECHANICAL SCOPE").toUpperCase()}</span>
        </div>
        <div class="info-cell">
          <span class="info-label">Initiated Date</span>
          <span class="info-value">${jha.date || "--"}</span>
        </div>
        <div class="info-cell">
          <span class="info-label">Worksite Location</span>
          <span class="info-value">${(jha.location || "IMC WORKSITE").toUpperCase()}</span>
        </div>

        <div class="info-cell" style="grid-column: span 2;">
          <span class="info-label">Designated Supervisor / Lead</span>
          <span class="info-value" style="color: #0369a1;">${supervisorName}</span>
        </div>
        <div class="info-cell">
          <span class="info-label">Audit Scope</span>
          <span class="info-value">${scopeLabel.toUpperCase()}</span>
        </div>
        <div class="info-cell">
          <span class="info-label">Current Job Status</span>
          <span class="info-value" style="color: #065f46;">${jha.status}</span>
        </div>
      </div>

      <!-- PRE-TASK REQUIREMENTS CALLOUT GRID -->
      <div class="req-box">
        <div class="req-grid">
          <div>
            <span class="req-label">Required Training:</span>
            <div class="pill-wrap">
              ${
                trainingList.length > 0
                  ? trainingList.map((t) => `<span class="pill">${t}</span>`).join("")
                  : `<span class="none-text">None Specified</span>`
              }
            </div>
          </div>
          <div>
            <span class="req-label">Permits Required:</span>
            <div class="pill-wrap">
              ${
                permitsList.length > 0
                  ? permitsList.map((p) => `<span class="pill pill-amber">${p}</span>`).join("")
                  : `<span class="none-text">Standard Operations (No Permit Required)</span>`
              }
            </div>
          </div>
          <div>
            <span class="req-label">Equipment &amp; Tools Used:</span>
            <div class="pill-wrap">
              ${
                equipmentList.length > 0
                  ? equipmentList.map((e) => `<span class="pill">${e}</span>`).join("")
                  : `<span class="none-text">Standard Hand Tools</span>`
              }
            </div>
          </div>
          <div>
            <span class="req-label">Certifications Tracked:</span>
            <div class="pill-wrap">
              ${
                certsList.length > 0
                  ? certsList.map((c) => `<span class="pill pill-cyan">${c}</span>`).join("")
                  : `<span class="none-text">Standard Craft Qualification</span>`
              }
            </div>
          </div>
        </div>
      </div>

      <!-- WORK STEP SEQUENCE TABLE -->
      <div class="section-container">
        <div class="section-title">
          <span>Work Step Sequence, Potential Hazards &amp; Control Measures (${stepsList.length} Steps)</span>
          <span style="font-size: 7pt; font-weight: 700;">JOB EXECUTION SEQUENCE</span>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 5%; text-align: center;">Seq</th>
              <th style="width: 32%;">Step Description</th>
              <th style="width: 31%;">Potential Hazards</th>
              <th style="width: 32%;">Hazard Control Measures</th>
            </tr>
          </thead>
          <tbody>
            ${
              stepsList.length === 0
                ? `<tr><td colspan="4" style="text-align: center; padding: 12px; color: #64748b;">[ No specific work steps configured for this scope ]</td></tr>`
                : stepsList
                    .map(
                      (s, idx) => `
                  <tr>
                    <td style="text-align: center; font-weight: 800; font-family: monospace;">${idx + 1}</td>
                    <td style="font-weight: 700; text-transform: uppercase;">${s.step}</td>
                    <td style="color: #991b1b; font-weight: 600;">${s.hazards}</td>
                    <td style="color: #065f46; font-weight: 600;">${s.controls}</td>
                  </tr>
                `
                    )
                    .join("")
            }
          </tbody>
        </table>
      </div>

      <!-- ATTENDANCE & SIGN-OFF ROSTER -->
      <div class="section-container">
        <div class="section-title">
          <span>Verified Crew Acknowledgment &amp; Attendance (${acks.length} Sign-Offs Logged)</span>
          <span style="font-size: 7pt; font-weight: 700;">WORKER VERIFICATION</span>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 5%; text-align: center;">#</th>
              <th style="width: 38%;">Worker Legal Name</th>
              <th style="width: 27%;">Assigned Worksite</th>
              <th style="width: 30%; text-align: right;">Verified Date &amp; Time</th>
            </tr>
          </thead>
          <tbody>
            ${
              acks.length === 0
                ? `<tr><td colspan="4" style="text-align: center; padding: 10px; color: #64748b; font-style: italic;">[ No crew sign-offs recorded within this scope window ]</td></tr>`
                : acks
                    .map(
                      (a, idx) => `
                  <tr>
                    <td style="text-align: center; font-family: monospace; font-weight: 700;">${idx + 1}</td>
                    <td style="font-weight: 700; text-transform: uppercase;">${a.employee_name}</td>
                    <td style="font-size: 7pt; text-transform: uppercase; color: #475569;">${a.location || jha.location}</td>
                    <td style="text-align: right; font-family: monospace; font-size: 7.5pt; font-weight: 700;">${formatDateTime(a.signed_at)}</td>
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
            I hereby attest and certify that all personnel listed above have reviewed and acknowledged the specific hazards, safety controls, required personal protective equipment, and scope of work identified in this Job Hazard Analysis prior to commencement of work activities.
          </div>
          <div class="signature-grid">
            <div>
              <strong>Supervisor / Lead:</strong> ${supervisorName}
            </div>
            <div>
              <strong>Audit Scope:</strong> ${scopeLabel.toUpperCase()}
            </div>
            <div style="text-align: right;">
              <strong>Status:</strong> <span style="color: #065f46; font-weight: 800;">VERIFIED &amp; LOGGED</span>
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

export const JHA_PRINT_CSS = `
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
    margin-top: 8px;
  }

  /* HEADER BOX */
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
  .company-division {
    font-size: 7.5pt;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    margin-top: 1px;
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

  /* AUDIT INFO BAR */
  .audit-info-bar {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1.5fr;
    border: 1.5px solid #000;
    background-color: #f1f5f9;
    padding: 5px 8px;
    margin-bottom: 7px;
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

  /* REQ BOX */
  .req-box {
    border: 1px solid #333;
    background-color: #fafafa;
    padding: 5px 8px;
    margin-bottom: 8px;
  }
  .req-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 12px;
  }
  .req-label {
    font-size: 6.5pt;
    font-weight: 800;
    text-transform: uppercase;
    color: #334155;
    display: block;
    margin-bottom: 2px;
  }
  .pill-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
  }
  .pill {
    display: inline-block;
    font-size: 6.5pt;
    font-weight: 700;
    text-transform: uppercase;
    background: #e2e8f0;
    border: 1px solid #cbd5e1;
    padding: 1px 5px;
    border-radius: 2px;
    color: #0f172a;
  }
  .pill-amber {
    background: #fef3c7;
    border-color: #f59e0b;
    color: #b45309;
  }
  .pill-cyan {
    background: #ecfeff;
    border-color: #06b6d4;
    color: #0891b2;
  }
  .none-text {
    font-size: 7pt;
    color: #64748b;
    font-style: italic;
  }

  /* SECTION TABLES */
  .section-container {
    margin-bottom: 8px;
  }
  .section-title {
    font-size: 8pt;
    font-weight: 800;
    text-transform: uppercase;
    border-bottom: 1.5px solid #000;
    padding-bottom: 2px;
    margin-bottom: 4px;
    display: flex;
    justify-content: space-between;
  }
  table.data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 7.5pt;
    margin-bottom: 4px;
  }
  table.data-table th {
    border-bottom: 1.5px solid #000;
    border-top: 1.5px solid #000;
    padding: 3.5px 5px;
    text-align: left;
    font-weight: 800;
    font-size: 7pt;
    text-transform: uppercase;
    background: #e2e8f0;
  }
  table.data-table td {
    border-bottom: 1px solid #cbd5e1;
    border-left: 1px solid #e2e8f0;
    border-right: 1px solid #e2e8f0;
    padding: 3.5px 5px;
    vertical-align: top;
  }
  table.data-table tr:nth-child(even) td {
    background-color: #f8fafc;
  }

  /* ATTESTATION SIGN-OFF BOX */
  .signoff-box {
    border: 1.5px solid #000;
    padding: 5px 8px;
    background: #fff;
  }
  .attestation-statement {
    font-size: 6.5pt;
    line-height: 1.25;
    margin-bottom: 4px;
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

function triggerIframePrint(sheetsHtml: string) {
  const fullHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>IMC - Job Hazard Analysis Report</title>
      <style>
        ${JHA_PRINT_CSS}
      </style>
    </head>
    <body>
      ${sheetsHtml}
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
  }, 500);
}

export function printSingleJhaReport({ jha, acks, mode }: PrintJhaSingleOptions) {
  const todayStr = new Date().toISOString().split("T")[0];

  const rosterToPrint =
    mode === "TODAY_ONLY"
      ? acks.filter((a) => {
          const aDate = a.signed_at ? new Date(a.signed_at).toISOString().split("T")[0] : "";
          return aDate === todayStr;
        })
      : acks;

  const scopeLabel = mode === "TODAY_ONLY" ? "Daily Shift Roster" : "Master Project History";
  const sheetHtml = renderJhaHtml(jha, rosterToPrint, scopeLabel);
  triggerIframePrint(sheetHtml);
}

export function printBatchJhaReport({ reports, reportTitle }: PrintJhaBatchOptions) {
  const combinedHtml = reports
    .map(({ jha, acks }) => renderJhaHtml(jha, acks, reportTitle))
    .join("");

  triggerIframePrint(combinedHtml);
}