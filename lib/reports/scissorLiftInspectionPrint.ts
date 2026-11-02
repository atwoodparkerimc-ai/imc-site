// lib/reports/scissorLiftInspectionPrint.ts
import {
  ScissorLiftInspectionRecord,
  SCISSOR_EQUIPMENT_CHECKS,
  SCISSOR_WORKPLACE_CHECKS,
  SCISSOR_ELEVATION_AGREEMENTS,
} from "@/lib/db/scissorLiftOperations";

export function printScissorLiftInspectionReport(records: ScissorLiftInspectionRecord[]) {
  if (!records || records.length === 0) return;

  const printDocHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>IMC-SAF-0019 Scissor Lift Pre-Use Inspection Checklist</title>
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
          font-size: 7.5pt;
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
          grid-template-columns: 2fr 1fr 1.2fr 1.5fr;
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

        .signoff-box {
          border: 1.5px solid #000;
          padding: 5px 8px;
          background: #fff;
          margin-top: auto;
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
      </style>
    </head>
    <body>
      ${records
        .map((r) => {
          return `
          <div class="page-sheet">
            <div>
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
                <div class="doc-id-title">IMC-SAF-0019 Scissor Lift Pre-Use Inspection Checklist</div>
                <div class="doc-meta">
                  OSHA 29 CFR 1926.453 &amp; ANSI A92.20 &nbsp;|&nbsp; Department: <strong>IMC</strong> &nbsp;|&nbsp; <strong>UNCONTROLLED IF PRINTED</strong>
                </div>
              </div>

              <div class="audit-info-bar">
                <div class="info-cell">
                  <span class="info-label">Certified Operator</span>
                  <span class="info-value">${r.operator_name.toUpperCase()} (License: ${r.license_expiration_date || "CURRENT"})</span>
                </div>
                <div class="info-cell">
                  <span class="info-label">Shift Date</span>
                  <span class="info-value">${r.inspection_date}</span>
                </div>
                <div class="info-cell">
                  <span class="info-label">Model / Machine</span>
                  <span class="info-value">${r.model.toUpperCase()}</span>
                </div>
                <div class="info-cell">
                  <span class="info-label">Serial / Unit #</span>
                  <span class="info-value" style="color: #0369a1;">${r.serial_number.toUpperCase()}</span>
                </div>
              </div>

              <div style="border: 1px solid #000; background: #f8fafc; padding: 3px 8px; margin-bottom: 6px; font-size: 7pt;">
                <strong>Designated Watcher / Spotter:</strong> ${r.buddy_name.toUpperCase()} &nbsp;|&nbsp; <strong>License Exp:</strong> ${r.buddy_license_expiration || "Verified"}
              </div>

              <!-- SECTION 1: EQUIPMENT CHECKS -->
              <div class="check-card">
                <div class="check-header">
                  <span>Part 1: Pre-Start Equipment Visual &amp; Functional Inspection</span>
                  <span style="font-size: 6.5pt; color: #64748b;">Engine Off &amp; Elevated Run Tests</span>
                </div>
                <table class="check-table">
                  <thead>
                    <tr>
                      <th style="text-align: left;">Inspection Criteria</th>
                      <th class="choice-col">YES</th>
                      <th class="choice-col">NO</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${SCISSOR_EQUIPMENT_CHECKS.map((item) => {
                      const status = r.equipment_checks[item.id] || "YES";
                      return `
                        <tr>
                          <td>${item.label}</td>
                          <td class="choice-col ${status === "YES" ? "choice-checked" : ""}">${status === "YES" ? "☑" : "☐"}</td>
                          <td class="choice-col ${status === "NO" ? "choice-checked" : ""}">${status === "NO" ? "☑" : "☐"}</td>
                        </tr>
                      `;
                    }).join("")}
                  </tbody>
                </table>
              </div>

              <!-- SECTION 2: WORKPLACE INSPECTION -->
              <div class="check-card">
                <div class="check-header">
                  <span>Part 2: Workplace Environment &amp; Ground Hazards</span>
                  <span style="font-size: 6.5pt; color: #64748b;">360° Site Evaluation</span>
                </div>
                <table class="check-table">
                  <thead>
                    <tr>
                      <th style="text-align: left;">Site Condition Criteria</th>
                      <th class="choice-col">YES</th>
                      <th class="choice-col">NO</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${SCISSOR_WORKPLACE_CHECKS.map((item) => {
                      const status = r.workplace_checks[item.id] || "YES";
                      return `
                        <tr>
                          <td>${item.label}</td>
                          <td class="choice-col ${status === "YES" ? "choice-checked" : ""}">${status === "YES" ? "☑" : "☐"}</td>
                          <td class="choice-col ${status === "NO" ? "choice-checked" : ""}">${status === "NO" ? "☑" : "☐"}</td>
                        </tr>
                      `;
                    }).join("")}
                  </tbody>
                </table>
              </div>

              <!-- SECTION 3: PRIOR TO REACH ELEVATIONS -->
              <div class="check-card">
                <div class="check-header">
                  <span>Part 3: Prior to Reach Elevations Agreements (Safe Operating Conditions)</span>
                  <span style="font-size: 6.5pt; color: #64748b;">YES = Operator Agrees</span>
                </div>
                <table class="check-table">
                  <thead>
                    <tr>
                      <th style="text-align: left;">Safety Mandate Statement</th>
                      <th class="choice-col">YES</th>
                      <th class="choice-col">NO</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${SCISSOR_ELEVATION_AGREEMENTS.map((item) => {
                      const status = r.elevation_agreements[item.id] || "YES";
                      return `
                        <tr>
                          <td>${item.label}</td>
                          <td class="choice-col ${status === "YES" ? "choice-checked" : ""}">${status === "YES" ? "☑" : "☐"}</td>
                          <td class="choice-col ${status === "NO" ? "choice-checked" : ""}">${status === "NO" ? "☑" : "☐"}</td>
                        </tr>
                      `;
                    }).join("")}
                  </tbody>
                </table>
              </div>

              <div style="font-size: 7pt; margin-bottom: 4px;">
                <strong>Operator / Maintenance Notes:</strong> ${r.comments || "Scissor lift operating safely; all safety interlocks, alarms, and controls certified."}
              </div>
            </div>

            <div>
              <div class="signoff-box">
                <div class="attestation-statement">
                  Failure to perform pre-work inspection and maintain this form with equipment during operation is treated the same as a Lockout / Tagout violation. As a licensed operator, I am responsible for having mechanical issues assessed by maintenance and proper notations made.
                </div>
                <div class="signature-grid">
                  <div>
                    <strong>Certified Operator:</strong> ${r.operator_name.toUpperCase()} (Initials: ${r.operator_initials})
                  </div>
                  <div>
                    <strong>Date Verified:</strong> ${r.inspection_date}
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
        })
        .join("")}
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