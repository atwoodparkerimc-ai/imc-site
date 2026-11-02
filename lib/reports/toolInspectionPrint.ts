// lib/reports/toolInspectionPrint.ts
import { DailyToolInspectionRecord } from "@/lib/db/operations";
import { isToolPowered } from "@/lib/data/toolCatalog";

export function printToolInspectionLedger(
  records: DailyToolInspectionRecord[],
  timeframeLabel: string
) {
  const printDocHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>IMC-SAF-0022 Hand and Power Tool Inspection Checklist</title>
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
          page-break-after: auto;
        }

        /* HARD COPY HEADER BOX */
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

        /* BASIC RULES */
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

        /* CRITERIA TWO-COLUMN BOX */
        .criteria-box {
          border: 1px solid #333;
          background-color: #fafafa;
          padding: 6px 8px;
          margin-bottom: 10px;
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

        /* EMPLOYEE & AUDIT INFO BAR */
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

        /* INDIVIDUAL TOOL LIST RUNNING DOWN THE PAGE */
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
        table.tools-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 8pt;
        }
        table.tools-table th {
          border-bottom: 1.5px solid #000;
          border-top: 1.5px solid #000;
          padding: 4px 6px;
          text-align: left;
          font-weight: 800;
          font-size: 7.5pt;
          text-transform: uppercase;
          background: #e2e8f0;
        }
        table.tools-table td {
          border-bottom: 1px solid #e2e8f0;
          padding: 4px 6px;
          vertical-align: middle;
        }
        table.tools-table tr:nth-child(even) td {
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

        /* ATTESTATION & SIGN-OFF BOX */
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

        /* CORPORATE COMPLIANCE FOOTER */
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
      ${records
        .map((r) => {
          const tools = r.tools_inspected || [];
          const signedDate = r.inspection_date || new Date().toISOString().split("T")[0];
          const signedTime = r.signed_at
            ? new Date(r.signed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "--";

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
                  <div class="check-item"><span class="check-box">☑</span> The outside of the tool is free of grease, oil and accumulated foreign matter</div>
                  <div class="check-item"><span class="check-box">☑</span> Tool power-source shows no damage (cord, airline, battery, etc.)</div>
                  <div class="check-item"><span class="check-box">☑</span> Tool is double insulated (ground prong on cord) and tool housing is not damaged</div>
                  <div class="check-item"><span class="check-box">☑</span> If so equipped, electrical cord third prong (ground) is intact</div>
                  <div class="check-item"><span class="check-box">☑</span> All shields, guards or attachments required by OSHA or manufacturer are present</div>
                  <div class="check-item"><span class="check-box">☑</span> Make sure the trigger locks and guards are functioning to prevent accidental activation</div>
                  <div class="check-item"><span class="check-box">☑</span> Rotating or moving parts of tool are guarded to prevent physical contact</div>
                  <div class="check-item"><span class="check-box">☑</span> Tool is not leaking fluid such as oil etc.</div>
                  <div class="check-item"><span class="check-box">☑</span> Blades or bits are not damaged, cracked, excessively worn, etc.</div>
                  <div class="check-item"><span class="check-box">☑</span> Tool appears to be in generally good condition</div>
                  <div class="check-item"><span class="check-box">☑</span> Proper PPE is available</div>
                </div>

                <div>
                  <div class="criteria-header">Before checking out hand tools inspect for:</div>
                  <div class="check-item"><span class="check-box">☑</span> The outside of the tool is free of grease, oil and accumulated foreign matter</div>
                  <div class="check-item"><span class="check-box">☑</span> The tool has no visible cracks in jaws or handle</div>
                  <div class="check-item"><span class="check-box">☑</span> Blades or bits are not damaged, cracked, etc.</div>
                  <div class="check-item"><span class="check-box">☑</span> Handles are not cracked, damaged or loose from heads of hammers, and other similar tools</div>
                  <div class="check-item"><span class="check-box">☑</span> Tips of screwdrivers, chisels or other similar tools show no excessive wear</div>
                  <div class="check-item"><span class="check-box">☑</span> Gripping surfaces of pliers, wrenches or other similar tools are not worn</div>
                  <div class="check-item"><span class="check-box">☑</span> Tools such as chisels and punches do not have mushroomed heads</div>
                  <div class="check-item"><span class="check-box">☑</span> Cutting tools such as chisels are sharp</div>
                  <div class="check-item"><span class="check-box">☑</span> Tool appears to be in generally good condition</div>
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

            <!-- ITEMIZED TOOL CHECKOFF LIST RUNNING DOWN THE PAGE -->
            <div class="tool-list-container">
              <div class="tool-list-title">
                <span>Verified Equipment Roster (${tools.length} Tools Inspected)</span>
                <span style="font-size: 7pt; font-weight: 700;">INDIVIDUAL PRE-USE COMPLIANCE</span>
              </div>

              <table class="tools-table">
                <thead>
                  <tr>
                    <th style="width: 6%;">#</th>
                    <th style="width: 52%;">Tool Description & Specification</th>
                    <th style="width: 22%;">Monthly Color Tape</th>
                    <th style="width: 20%; text-align: right;">Inspection Status</th>
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
                          <td style="font-weight: 700; color: ${powered ? "#92400e" : "#64748b"}; font-size: 7pt;">
                            ${powered ? `${(r.tape_color_verified || "VERIFIED").toUpperCase()} TAPE VERIFIED` : "N/A (NON-POWERED)"}
                          </td>
                          <td style="text-align: right;">
                            <span class="status-badge">✓ PASSED / COMPLIANT</span>
                          </td>
                        </tr>
                      `;
                          })
                          .join("")
                      : `
                        <tr>
                          <td colspan="4" style="text-align: center; padding: 12px; color: #64748b;">
                            [ No individual tools selected for this inspection session ]
                          </td>
                        </tr>
                      `
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- BOTTOM ATTESTATION & COMPLIANCE FOOTER -->
          <div>
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
                  <strong>Status:</strong> <span style="color: #065f46; font-weight: 800;">VERIFIED & RECORDED</span>
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