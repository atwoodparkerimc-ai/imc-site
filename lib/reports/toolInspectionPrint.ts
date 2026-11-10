// lib/reports/toolInspectionPrint.ts
import { DailyToolInspectionRecord } from "@/lib/db/operations";
import { isToolPowered } from "@/lib/data/toolCatalog";

/**
 * Shared HTML renderer for a single Daily Tool Inspection Checklist.
 * Used identically by single-form print runs and the multi-form Master Binder.
 */
export function renderToolInspectionHtml(r: DailyToolInspectionRecord): string {
  const tools = r.tools_inspected || [];
  const signedDate = r.inspection_date || new Date().toISOString().split("T")[0];
  const signedTime = r.signed_at
    ? new Date(r.signed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "--";

  return `
    <div class="document-container tool-inspection-doc">
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
        <div class="doc-id-title">IMC-SAF-0022 Hand and Power Tool Pre-Use Inspection Checklist</div>
        <div class="doc-meta">
          Shift Compliance Verification &nbsp;|&nbsp; Operating Standard: OSHA 29 CFR 1926.300 &nbsp;|&nbsp; <strong>UNCONTROLLED IF PRINTED</strong>
        </div>
      </div>

      <!-- FOUR BASIC SAFETY RULES -->
      <div class="section-rules">
        <div class="rules-title">Four basic safety rules can help prevent hazards associated with the use of hand and power tools:</div>
        <ul class="rules-list">
          <li>Keep all tools in good condition with regular maintenance.</li>
          <li>Use the right tool for the job.</li>
          <li>Examine each tool for damage before use and do not use damaged tools.</li>
          <li>Operate tools strictly according to the manufacturers' instructions.</li>
        </ul>
      </div>

      <!-- FULL INSPECTION CRITERIA CALLOUTS -->
      <div class="criteria-box">
        <div class="criteria-grid">
          <div>
            <div class="criteria-header">Before checking out portable power tools inspect for:</div>
            <div class="check-item"><span class="check-box">☑</span> Outside of tool is free of grease, oil, and accumulated foreign matter</div>
            <div class="check-item"><span class="check-box">☑</span> Power source shows no damage (cord, airline, battery housing)</div>
            <div class="check-item"><span class="check-box">☑</span> Double insulated / third prong intact on electrical cord</div>
            <div class="check-item"><span class="check-box">☑</span> All shields, guards, or manufacturer attachments are installed</div>
            <div class="check-item"><span class="check-box">☑</span> Trigger locks and safety guards functional; moving parts guarded</div>
            <div class="check-item"><span class="check-box">☑</span> Blades, bits, and wheels are free of cracks, chips, and excess wear</div>
          </div>

          <div>
            <div class="criteria-header">Before checking out hand tools inspect for:</div>
            <div class="check-item"><span class="check-box">☑</span> Outside of tool is clean and free of grease or oil</div>
            <div class="check-item"><span class="check-box">☑</span> No cracks or stress fractures in jaws, blades, or frames</div>
            <div class="check-item"><span class="check-box">☑</span> Handles tight, secure, and not split or splintered</div>
            <div class="check-item"><span class="check-box">☑</span> Striking tools (punches, chisels) have no mushroomed heads</div>
            <div class="check-item"><span class="check-box">☑</span> Gripping surfaces of pliers and pipe wrenches not rounded or worn</div>
            <div class="check-item"><span class="check-box">☑</span> Cutting edges are sharp and properly dressed</div>
          </div>
        </div>
      </div>

      <!-- EMPLOYEE VERIFICATION INFO BAR -->
      <div class="audit-info-bar">
        <div class="info-cell">
          <span class="info-label">Employee Full Name</span>
          <span class="info-value">${r.employee_name.toUpperCase()}</span>
        </div>
        <div class="info-cell">
          <span class="info-label">Inspection Date</span>
          <span class="info-value">${signedDate}</span>
        </div>
        <div class="info-cell">
          <span class="info-label">Monthly Color Code Tape</span>
          <span class="info-value" style="color: #b45309;">${(r.tape_color_verified || "VERIFIED").toUpperCase()}</span>
        </div>
        <div class="info-cell">
          <span class="info-label">Facility / Worksite</span>
          <span class="info-value">${(r.location || "IMC WORKSITE").toUpperCase()}</span>
        </div>
      </div>

      <!-- ITEMIZED TOOL CHECKOFF LIST -->
      <div class="tool-list-container">
        <div class="tool-list-title">
          <span>Verified Equipment Roster (${tools.length} Tools Inspected)</span>
          <span style="font-size: 7pt; font-weight: 700;">INDIVIDUAL PRE-USE COMPLIANCE</span>
        </div>

        <table class="tools-table">
          <thead>
            <tr>
              <th style="width: 5%;">#</th>
              <th style="width: 44%;">Tool Description &amp; Specification</th>
              <th style="width: 33%;">Monthly Color Tape</th>
              <th style="width: 18%; text-align: right;">Inspection Status</th>
            </tr>
          </thead>
          <tbody>
            ${
              tools.length > 0
                ? tools
                    .map((toolName: string, idx: number) => {
                      const powered = isToolPowered(toolName);
                      return `
                  <tr>
                    <td style="font-weight: 700; color: #475569;">${idx + 1}</td>
                    <td style="font-weight: 700; text-transform: uppercase;">${toolName}</td>
                    <td style="font-weight: 700; color: ${powered ? "#92400e" : "#64748b"}; font-size: 7pt; white-space: nowrap;">
                      ${powered ? `${(r.tape_color_verified || "VERIFIED").toUpperCase()} TAPE VERIFIED` : "N/A (NON-POWERED)"}
                    </td>
                    <td style="text-align: right; white-space: nowrap;">
                      <span class="status-badge">✓ PASSED / COMPLIANT</span>
                    </td>
                  </tr>
                `;
                    })
                    .join("")
                : `
                  <tr>
                    <td colspan="4" style="text-align: center; padding: 10px; color: #64748b;">
                      [ No individual tools selected for this inspection session ]
                    </td>
                  </tr>
                `
            }
          </tbody>
        </table>
      </div>

      <!-- BOTTOM ATTESTATION & COMPLIANCE FOOTER (Forced to follow table naturally) -->
      <div class="signoff-wrapper">
        <div class="signoff-box">
          <div class="attestation-statement">
            I hereby attest and certify under Interwest Mechanical Contractors safety policy that each tool itemized above has been personally inspected prior to the start of shift, is free of defects, damaged cords, missing guards, and mushroomed heads, and all active power and shop equipment bore the designated monthly inspection tape in full accordance with IMC standard safety procedures.
          </div>
          <div class="signature-grid">
            <div>
              <strong>Digital Signature:</strong> ${r.employee_name.toUpperCase()} (IMC Authorized Employee)
            </div>
            <div>
              <strong>Signed Time:</strong> ${signedTime}
            </div>
            <div style="text-align: right;">
              <strong>Status:</strong> <span style="color: #065f46; font-weight: 800;">VERIFIED &amp; RECORDED</span>
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
 * Shared CSS rules for print formatting.
 */
export const TOOL_INSPECTION_PRINT_CSS = `
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
    line-height: 1.2;
  }

  .document-container {
    page-break-before: always;
    break-before: page;
    clear: both;
    display: block;
  }
  .document-container:first-of-type {
    page-break-before: avoid;
    break-before: auto;
  }

  tr {
    page-break-inside: avoid;
    break-inside: avoid;
    page-break-after: auto;
  }
  table.tools-table {
    page-break-inside: auto;
    break-inside: auto;
  }
  thead {
    display: table-header-group;
  }
  
  /* Forces the signoff to stay married to the final rows of the table */
  .signoff-wrapper {
    page-break-before: auto;
    page-break-inside: avoid;
    break-inside: avoid;
    margin-top: 8px;
    display: block;
    width: 100%;
  }

  /* HARD COPY HEADER BOX */
  .doc-header-box {
    border: 1.5px solid #000;
    padding: 5px 8px;
    margin-bottom: 6px;
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
    font-size: 7pt;
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

  /* BASIC RULES */
  .section-rules {
    margin-bottom: 6px;
    font-size: 7.5pt;
  }
  .rules-title {
    font-weight: 800;
    margin-bottom: 1.5px;
    text-transform: uppercase;
  }
  ul.rules-list {
    margin: 0;
    padding-left: 18px;
  }
  ul.rules-list li {
    margin-bottom: 1px;
  }

  /* CRITERIA TWO-COLUMN BOX */
  .criteria-box {
    border: 1px solid #333;
    background-color: #fafafa;
    padding: 5px 7px;
    margin-bottom: 8px;
  }
  .criteria-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .criteria-header {
    font-size: 7.5pt;
    font-weight: 800;
    margin-bottom: 3px;
    border-bottom: 1px solid #999;
    padding-bottom: 1px;
    text-transform: uppercase;
  }
  .check-item {
    display: flex;
    align-items: flex-start;
    gap: 4px;
    font-size: 7pt;
    line-height: 1.2;
    margin-bottom: 2px;
  }
  .check-box {
    font-size: 7.5pt;
    line-height: 1;
  }

  /* EMPLOYEE & AUDIT INFO BAR */
  .audit-info-bar {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1.5fr;
    border: 1.5px solid #000;
    background-color: #f1f5f9;
    padding: 4px 7px;
    margin-bottom: 8px;
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

  /* TOOL LIST TABLE */
  .tool-list-container {
    margin-bottom: 6px;
    display: block;
    width: 100%;
  }
  .tool-list-title {
    font-size: 8pt;
    font-weight: 800;
    text-transform: uppercase;
    border-bottom: 1.5px solid #000;
    padding-bottom: 2px;
    margin-bottom: 3px;
    display: flex;
    justify-content: space-between;
  }
  table.tools-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 7.5pt;
  }
  table.tools-table th {
    border-bottom: 1.5px solid #000;
    border-top: 1.5px solid #000;
    padding: 3px 5px;
    text-align: left;
    font-weight: 800;
    font-size: 7pt;
    text-transform: uppercase;
    background: #e2e8f0;
  }
  table.tools-table td {
    border-bottom: 1px solid #e2e8f0;
    padding: 2.5px 5px;
    vertical-align: middle;
  }
  table.tools-table tr:nth-child(even) td {
    background-color: #f8fafc;
  }
  .status-badge {
    display: inline-block;
    font-weight: 800;
    font-size: 6.5pt;
    color: #065f46;
    border: 1px solid #059669;
    background: #ecfdf5;
    padding: 1px 4px;
    border-radius: 2px;
  }

  /* SIGNOFF BOX */
  .signoff-box {
    border: 1.5px solid #000;
    padding: 5px 7px;
    background: #fff;
  }
  .attestation-statement {
    font-size: 6.5pt;
    line-height: 1.2;
    margin-bottom: 5px;
    font-style: italic;
  }
  .signature-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 6px;
    border-top: 1px dashed #666;
    padding-top: 4px;
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

/**
 * Standalone trigger for single or batch tool inspection ledger printing.
 */
export function printToolInspectionLedger(
  records: DailyToolInspectionRecord[],
  _timeframeLabel?: string
) {
  const innerHtml = records.map((r) => renderToolInspectionHtml(r)).join("");

  const printDocHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>IMC-SAF-0022 Hand and Power Tool Inspection Checklist</title>
      <style>
        ${TOOL_INSPECTION_PRINT_CSS}
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