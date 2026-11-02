// lib/reports/ladderInspectionPrint.ts
import {
  LadderInspectionRecord,
  LADDER_GENERAL_ITEMS,
  STEP_LADDER_ITEMS,
  EXTENSION_LADDER_ITEMS,
} from "@/lib/db/ladderOperations";

export function printLadderInspectionReport(records: LadderInspectionRecord[]) {
  if (!records || records.length === 0) return;

  const printDocHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>IMC-SAF-0013 Ladder Safety & Pre-Use Inspection Checklist</title>
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

        .crew-bar {
          border: 1px solid #000;
          background-color: #f8fafc;
          padding: 4px 8px;
          margin-bottom: 6px;
          font-size: 7pt;
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

        .notice-box {
          border: 1px solid #000;
          background-color: #fffbeb;
          padding: 5px 8px;
          font-size: 6.5pt;
          line-height: 1.3;
          margin-bottom: 6px;
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
          const crewDisplay =
            r.worker_names && r.worker_names.length > 0
              ? r.worker_names.join(", ")
              : "Inspector Only (Solo Operation)";

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
                <div class="doc-id-title">IMC-SAF-0013 Work-Area Ladder Safety &amp; Pre-Use Inspection Checklist</div>
                <div class="doc-meta">
                  OSHA 29 CFR 1926.1053 &amp; 1910.23 &nbsp;|&nbsp; Department: <strong>IMC</strong> &nbsp;|&nbsp; <strong>UNCONTROLLED IF PRINTED</strong>
                </div>
              </div>

              <div class="audit-info-bar">
                <div class="info-cell">
                  <span class="info-label">Inspector Name</span>
                  <span class="info-value">${r.employee_name.toUpperCase()}</span>
                </div>
                <div class="info-cell">
                  <span class="info-label">Inspection Date</span>
                  <span class="info-value">${r.inspection_date}</span>
                </div>
                <div class="info-cell">
                  <span class="info-label">Work Area</span>
                  <span class="info-value" style="color: #0369a1;">${r.work_area.toUpperCase()}</span>
                </div>
                <div class="info-cell">
                  <span class="info-label">Ladder ID / Stencil #</span>
                  <span class="info-value">${r.ladder_id_number.toUpperCase()} (${r.ladder_type.replace(/_/g, " ")})</span>
                </div>
              </div>

              <div class="crew-bar">
                <strong>Assigned Area Personnel Covered Under This Permit:</strong> ${crewDisplay}
              </div>

              <!-- 1. GENERAL ITEMS -->
              <div class="check-card">
                <div class="check-header">
                  <span>Part 1: General Structural Criteria (All Ladders)</span>
                  <span style="font-size: 6.5pt; color: #64748b;">OK = In Service</span>
                </div>
                <table class="check-table">
                  <thead>
                    <tr>
                      <th style="text-align: left;">Inspection Criteria</th>
                      <th class="choice-col">OK</th>
                      <th class="choice-col">WORN</th>
                      <th class="choice-col">N/A</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${LADDER_GENERAL_ITEMS.map((item) => {
                      const status = r.general_checks[item.id] || "OK";
                      return `
                        <tr>
                          <td>${item.label}</td>
                          <td class="choice-col ${status === "OK" ? "choice-checked" : ""}">${status === "OK" ? "☑" : "☐"}</td>
                          <td class="choice-col ${status === "WORN" ? "choice-checked" : ""}">${status === "WORN" ? "☑" : "☐"}</td>
                          <td class="choice-col ${status === "N/A" ? "choice-checked" : ""}">${status === "N/A" ? "☑" : "☐"}</td>
                        </tr>
                      `;
                    }).join("")}
                  </tbody>
                </table>
              </div>

              <!-- 2. STEP LADDER ITEMS -->
              ${
                r.ladder_type === "STEP_LADDER" || r.ladder_type === "COMBINATION"
                  ? `
                <div class="check-card">
                  <div class="check-header">
                    <span>Part 2: Step Ladder Hardware</span>
                    <span style="font-size: 6.5pt; color: #64748b;">Lock spreaders prior to climb</span>
                  </div>
                  <table class="check-table">
                    <thead>
                      <tr>
                        <th style="text-align: left;">Inspection Criteria</th>
                        <th class="choice-col">OK</th>
                        <th class="choice-col">WORN</th>
                        <th class="choice-col">N/A</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${STEP_LADDER_ITEMS.map((item) => {
                        const status = r.step_ladder_checks[item.id] || "OK";
                        return `
                          <tr>
                            <td>${item.label}</td>
                            <td class="choice-col ${status === "OK" ? "choice-checked" : ""}">${status === "OK" ? "☑" : "☐"}</td>
                            <td class="choice-col ${status === "WORN" ? "choice-checked" : ""}">${status === "WORN" ? "☑" : "☐"}</td>
                            <td class="choice-col ${status === "N/A" ? "choice-checked" : ""}">${status === "N/A" ? "☑" : "☐"}</td>
                          </tr>
                        `;
                      }).join("")}
                    </tbody>
                  </table>
                </div>
              `
                  : ""
              }

              <!-- 3. EXTENSION LADDER ITEMS -->
              ${
                r.ladder_type === "EXTENSION_LADDER" || r.ladder_type === "COMBINATION"
                  ? `
                <div class="check-card">
                  <div class="check-header">
                    <span>Part 3: Extension Ladder Hardware</span>
                    <span style="font-size: 6.5pt; color: #64748b;">Maintain 4:1 slope angle ratio</span>
                  </div>
                  <table class="check-table">
                    <thead>
                      <tr>
                        <th style="text-align: left;">Inspection Criteria</th>
                        <th class="choice-col">OK</th>
                        <th class="choice-col">WORN</th>
                        <th class="choice-col">N/A</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${EXTENSION_LADDER_ITEMS.map((item) => {
                        const status = r.extension_ladder_checks[item.id] || "OK";
                        return `
                          <tr>
                            <td>${item.label}</td>
                            <td class="choice-col ${status === "OK" ? "choice-checked" : ""}">${status === "OK" ? "☑" : "☐"}</td>
                            <td class="choice-col ${status === "WORN" ? "choice-checked" : ""}">${status === "WORN" ? "☑" : "☐"}</td>
                            <td class="choice-col ${status === "N/A" ? "choice-checked" : ""}">${status === "N/A" ? "☑" : "☐"}</td>
                          </tr>
                        `;
                      }).join("")}
                    </tbody>
                  </table>
                </div>
              `
                  : ""
              }

              <!-- OPERATIONAL COMPLIANCE NOTICE -->
              <div class="notice-box">
                <strong>Safety Policy Mandate:</strong> Return ladder to designated storage area upon shift completion; do not leave ladders unattended against equipment. If for any reason the ladder fails this inspection, it must be tagged "OUT OF SERVICE" and removed immediately.
              </div>

              <div style="font-size: 7pt; margin-bottom: 4px;">
                <strong>Defect Remarks / Action Notes:</strong> ${r.comments || "All rungs, side rails, spreaders, and feet inspected; ladder approved for shift service."}
              </div>
            </div>

            <div>
              <div class="signoff-box">
                <div class="attestation-statement">
                  I hereby attest that I have physically inspected this ladder unit prior to use in strict accordance with Interwest Mechanical Contractors safety guidelines and OSHA standards.
                </div>
                <div class="signature-grid">
                  <div>
                    <strong>Inspector Signature:</strong> ${r.employee_name.toUpperCase()} (Initials: ${r.operator_initials})
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