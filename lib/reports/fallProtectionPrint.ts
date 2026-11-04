// lib/reports/fallProtectionPrint.ts
import {
  FallProtectionRecord,
  SRL_CHECK_ITEMS,
  HARNESS_CHECK_ITEMS,
} from "@/lib/db/fallProtectionOperations";

/**
 * Shared HTML renderer for a single Fall Protection Harness & SRL Checklist.
 * Used identically by single-form print runs and the multi-form Master Binder.
 */
export function renderFallProtectionHtml(r: FallProtectionRecord): string {
  return `
    <div class="document-container fall-protection-doc">
      <!-- HARD COPY IMC HEADER BOX -->
      <div class="doc-header-box">
        <div class="header-top">
          <div>
            <div class="company-name">Interwest Mechanical Contractors</div>
            <div style="font-size: 7pt; font-weight: 700; color: #475569; text-transform: uppercase;">
              Environmental Health &amp; Safety Division
            </div>
          </div>
          <div class="imc-logo">
            IMC
            <div class="imc-sub">Safety Compliance</div>
          </div>
        </div>
        <div class="doc-id-title">IMC-SAF-0016 Fall Protection Harness &amp; Self-Retracting Lifeline (SRL) Checklist</div>
        <div class="doc-meta">
          OSHA 29 CFR 1926.502 / 1910.140 &nbsp;|&nbsp; Department: <strong>IMC</strong> &nbsp;|&nbsp; <strong>UNCONTROLLED IF PRINTED</strong>
        </div>
      </div>

      <!-- AUDIT INFO BAR -->
      <div class="audit-info-bar">
        <div class="info-cell">
          <span class="info-label">Employee Legal Name</span>
          <span class="info-value">${r.employee_name.toUpperCase()}</span>
        </div>
        <div class="info-cell">
          <span class="info-label">Date</span>
          <span class="info-value">${r.inspection_date}</span>
        </div>
        <div class="info-cell">
          <span class="info-label">Department</span>
          <span class="info-value">IMC</span>
        </div>
        <div class="info-cell">
          <span class="info-label">Lanyard / Harness Unit #</span>
          <span class="info-value" style="color: #0369a1;">${r.equipment_number.toUpperCase()}</span>
        </div>
      </div>

      <!-- SECTION 1: SRL & LANYARD CHECK -->
      <div class="check-card">
        <div class="check-header">
          <span>Part 1: Self-Retracting Lifeline (SRL) &amp; Lanyards Inspection</span>
          <span style="font-size: 6.5pt; color: #64748b; text-transform: uppercase;">Wear gloves to avoid cuts &amp; scrapes</span>
        </div>
        <table class="check-table">
          <thead>
            <tr>
              <th style="text-align: left;">Inspection Criteria</th>
              <th class="choice-col">PASS</th>
              <th class="choice-col">FAIL</th>
              <th class="choice-col">N/A</th>
            </tr>
          </thead>
          <tbody>
            ${SRL_CHECK_ITEMS.map((item) => {
              const status = (r.srl_checks || {})[item.id] || "PASS";
              return `
                <tr>
                  <td>${item.label}</td>
                  <td class="choice-col ${status === "PASS" ? "choice-checked" : ""}">${status === "PASS" ? "☑" : "☐"}</td>
                  <td class="choice-col ${status === "FAIL" ? "choice-checked" : ""}">${status === "FAIL" ? "☑" : "☐"}</td>
                  <td class="choice-col ${status === "N/A" ? "choice-checked" : ""}">${status === "N/A" ? "☑" : "☐"}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>

      <!-- SECTION 2: HARNESS CONDITION -->
      <div class="check-card">
        <div class="check-header">
          <span>Part 2: Body Harness &amp; Hardware Inspection</span>
          <span style="font-size: 6.5pt; color: #64748b; text-transform: uppercase;">Never punch additional holes in straps</span>
        </div>
        <table class="check-table">
          <thead>
            <tr>
              <th style="text-align: left;">Inspection Criteria</th>
              <th class="choice-col">PASS</th>
              <th class="choice-col">FAIL</th>
              <th class="choice-col">N/A</th>
            </tr>
          </thead>
          <tbody>
            ${HARNESS_CHECK_ITEMS.map((item) => {
              const status = (r.harness_checks || {})[item.id] || "PASS";
              return `
                <tr>
                  <td>${item.label}</td>
                  <td class="choice-col ${status === "PASS" ? "choice-checked" : ""}">${status === "PASS" ? "☑" : "☐"}</td>
                  <td class="choice-col ${status === "FAIL" ? "choice-checked" : ""}">${status === "FAIL" ? "☑" : "☐"}</td>
                  <td class="choice-col ${status === "N/A" ? "choice-checked" : ""}">${status === "N/A" ? "☑" : "☐"}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>

      <!-- WEBBING DAMAGE REFERENCE CRITERIA -->
      <table class="webbing-ref-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Heat Damage</th>
            <th>Chemical Exposure</th>
            <th>Molten Metal / Flame</th>
            <th>Oil, Paint, Solvents</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Nylon / Cordura</strong></td>
            <td>Scorches at 200°–250°F; turns brown/brittle. Will break when flexed.</td>
            <td>Color change, brownish smear, transverse cracks when bent. Loss of elasticity.</td>
            <td>Webbing strands fuse together. Hard, shiny brittle spots.</td>
            <td>Penetrates and dries, restricting movement of fibers and causing brittleness.</td>
          </tr>
        </tbody>
      </table>

      <div style="font-size: 7pt; margin-bottom: 6px;">
        <strong>Comments / Defect Observations:</strong> ${r.comments || "Equipment verified free of damage, cuts, burns, or chemical degradation; approved for active shift duty."}
      </div>

      <!-- ATTESTATION SIGN-OFF BOX -->
      <div class="signoff-wrapper">
        <div class="signoff-box">
          <div class="attestation-statement">
            I hereby certify that I have conducted an end-to-end tactile and visual inspection of this harness and lifeline assembly prior to use. Any equipment failing these requirements has been removed from service.
          </div>
          <div class="signature-grid">
            <div>
              <strong>Inspector / User:</strong> ${r.employee_name.toUpperCase()} (Initials: ${r.operator_initials || "--"})
            </div>
            <div>
              <strong>Shift Date:</strong> ${r.inspection_date}
            </div>
            <div style="text-align: right;">
              <strong>Clearance:</strong> <span style="color: #065f46; font-weight: 800;">VERIFIED SAFE</span>
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
 * Shared CSS rules for Fall Protection print formatting.
 */
export const FALL_PROTECTION_PRINT_CSS = `
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
    font-size: 7.5pt;
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
    font-size: 6.5pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 700;
    color: #475569;
  }
  .doc-id-title {
    font-size: 9pt;
    font-weight: 800;
    margin-top: 4px;
    border-top: 1px solid #000;
    padding-top: 3px;
    text-transform: uppercase;
  }
  .doc-meta {
    font-size: 7pt;
    color: #334155;
    margin-top: 1px;
  }

  .audit-info-bar {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1.5fr;
    border: 1.5px solid #000;
    background-color: #f1f5f9;
    padding: 4px 8px;
    margin-bottom: 6px;
    gap: 4px 8px;
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

  .check-card {
    border: 1px solid #000;
    padding: 4px 6px;
    background: #fafafa;
    margin-bottom: 6px;
  }
  .check-header {
    font-size: 7.5pt;
    font-weight: 800;
    text-transform: uppercase;
    border-bottom: 1px solid #000;
    padding-bottom: 2px;
    margin-bottom: 4px;
    display: flex;
    justify-content: space-between;
  }
  table.check-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 7pt;
  }
  table.check-table th {
    border-bottom: 1px solid #000;
    font-weight: 800;
    font-size: 6pt;
    text-transform: uppercase;
    padding: 2px;
    text-align: center;
  }
  table.check-table td {
    border-bottom: 1px solid #e2e8f0;
    padding: 2.5px 2px;
  }
  .choice-col {
    width: 28px;
    text-align: center;
    font-weight: 800;
  }
  .choice-checked {
    font-weight: 900;
    color: #065f46;
  }

  .webbing-ref-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 6.5pt;
    border: 1px solid #000;
    margin-bottom: 6px;
  }
  .webbing-ref-table th, .webbing-ref-table td {
    border: 1px solid #cbd5e1;
    padding: 3px;
  }
  .webbing-ref-table th {
    background-color: #e2e8f0;
    text-align: center;
    font-weight: 800;
    text-transform: uppercase;
  }

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
    padding-top: 3px;
    font-size: 7pt;
  }
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
 * Standalone trigger to print one or multiple Fall Protection reports.
 */
export function printFallProtectionReport(records: FallProtectionRecord[]) {
  if (!records || records.length === 0) return;

  const innerHtml = records.map((r) => renderFallProtectionHtml(r)).join("");

  const printDocHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>IMC-SAF-0016 Fall Protection Harness &amp; SRL Checklist</title>
      <style>
        ${FALL_PROTECTION_PRINT_CSS}
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