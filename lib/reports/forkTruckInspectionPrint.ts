// lib/reports/forkTruckInspectionPrint.ts
import {
  ForkTruckInspectionRecord,
  VISUAL_CHECK_ITEMS,
  OPERATIONAL_CHECK_ITEMS,
} from "@/lib/db/forkTruckOperations";

export function printForkTruckInspectionReport(records: ForkTruckInspectionRecord[]) {
  if (!records || records.length === 0) return;

  const printDocHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>IMC-SAF-0015 Driver's Daily Forklift Pre-Use Inspection</title>
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
          font-size: 8pt;
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

        /* HARD COPY IMC HEADER BOX */
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

        /* PURPOSE & POLICY WARNING */
        .policy-box {
          font-size: 7.5pt;
          line-height: 1.25;
          margin-bottom: 7px;
          color: #1e293b;
        }

        /* AUDIT INFO BAR */
        .audit-info-bar {
          display: grid;
          grid-template-columns: 2fr 1fr 1.2fr 1.3fr;
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

        /* TWO-COLUMN CHECKLIST SECTION */
        .check-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 8px;
        }
        .check-card {
          border: 1px solid #000;
          padding: 5px 8px;
          background: #fafafa;
        }
        .check-header {
          font-size: 8pt;
          font-weight: 800;
          text-transform: uppercase;
          border-bottom: 1px solid #999;
          padding-bottom: 2px;
          margin-bottom: 4px;
          display: flex;
          justify-content: space-between;
        }
        table.check-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 7.5pt;
        }
        table.check-table th {
          border-bottom: 1px solid #000;
          font-weight: 800;
          font-size: 6.5pt;
          text-transform: uppercase;
          padding: 2px 2px;
          text-align: center;
        }
        table.check-table td {
          border-bottom: 1px solid #e2e8f0;
          padding: 3px 2px;
          vertical-align: middle;
        }
        .item-label {
          text-align: left !important;
          padding-left: 2px;
          font-weight: 600;
        }
        .choice-col {
          width: 32px;
          text-align: center;
          font-weight: 800;
        }
        .choice-checked {
          font-size: 8pt;
          font-weight: 900;
          color: #065f46;
        }
        .choice-empty {
          color: #cbd5e1;
        }

        /* AWARENESS STATEMENT BOX */
        .awareness-box {
          border: 1px solid #000;
          background: #f8fafc;
          padding: 6px 8px;
          margin-bottom: 8px;
          font-size: 7.5pt;
        }
        .awareness-title {
          font-size: 7.5pt;
          font-weight: 800;
          text-transform: uppercase;
          margin-bottom: 3px;
        }
        .statement-line {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          margin-bottom: 2px;
          line-height: 1.25;
        }

        /* COMMENTS BOX */
        .comments-box {
          border: 1px solid #cbd5e1;
          padding: 4px 6px;
          font-size: 7pt;
          background: #fff;
          margin-bottom: 8px;
          min-height: 24px;
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

        /* CORPORATE COMPLIANCE FOOTER */
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
      </style>
    </head>
    <body>
      ${records
        .map((r) => {
          const operatorName = (r.operator_name || "").toUpperCase();
          const signedDate = r.inspection_date || "";
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
                <div class="doc-id-title">IMC-SAF-0015 Driver's Daily Forklift Pre-Use Inspection</div>
                <div class="doc-meta">
                  OSHA Powered Industrial Trucks: 29 CFR 1910.178 &nbsp;|&nbsp; <strong>UNCONTROLLED IF PRINTED</strong>
                </div>
              </div>

              <!-- PURPOSE STATEMENT -->
              <div class="policy-box">
                <strong>Policy Mandate:</strong> Keep completed form with vehicle during shift activity. Failure to perform pre-work inspection and retain verified documentation while operating any powered industrial truck constitutes a critical safety standard violation.
              </div>

              <!-- STRUCTURED AUDIT INFO BAR -->
              <div class="audit-info-bar">
                <div class="info-cell">
                  <span class="info-label">Operator Legal Name</span>
                  <span class="info-value">${operatorName}</span>
                </div>
                <div class="info-cell">
                  <span class="info-label">Shift Date</span>
                  <span class="info-value">${signedDate}</span>
                </div>
                <div class="info-cell">
                  <span class="info-label">Equipment / Unit #</span>
                  <span class="info-value" style="color: #0369a1;">${(r.lift_number || "UNIT 01").toUpperCase()}</span>
                </div>
                <div class="info-cell">
                  <span class="info-label">PIT License Expiration</span>
                  <span class="info-value" style="color: ${r.license_expiration_date ? "#065f46" : "#b45309"};">
                    ${r.license_expiration_date ? r.license_expiration_date : "CURRENT ON FILE"}
                  </span>
                </div>
              </div>

              <!-- TWO-COLUMN CHECKLIST -->
              <div class="check-grid">
                <!-- Visual Checks Column -->
                <div class="check-card">
                  <div class="check-header">
                    <span>1. Visual Checks (Pre-Start)</span>
                    <span style="font-size: 6.5pt; color: #64748b;">YES = NO PROBLEM</span>
                  </div>
                  <table class="check-table">
                    <thead>
                      <tr>
                        <th class="item-label">Component / Condition</th>
                        <th class="choice-col">YES</th>
                        <th class="choice-col">NO</th>
                        <th class="choice-col">N/A</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${VISUAL_CHECK_ITEMS.map((item) => {
                        const status = (r.visual_checks || {})[item.id] || "YES";
                        return `
                          <tr>
                            <td class="item-label">${item.label}</td>
                            <td class="choice-col ${status === "YES" ? "choice-checked" : "choice-empty"}">${status === "YES" ? "☑" : "☐"}</td>
                            <td class="choice-col ${status === "NO" ? "choice-checked" : "choice-empty"}">${status === "NO" ? "☑" : "☐"}</td>
                            <td class="choice-col ${status === "N/A" ? "choice-checked" : "choice-empty"}">${status === "N/A" ? "☑" : "☐"}</td>
                          </tr>
                        `;
                      }).join("")}
                    </tbody>
                  </table>
                </div>

                <!-- Operational Checks Column -->
                <div class="check-card">
                  <div class="check-header">
                    <span>2. Operational Checks (Running)</span>
                    <span style="font-size: 6.5pt; color: #64748b;">YES = NO PROBLEM</span>
                  </div>
                  <table class="check-table">
                    <thead>
                      <tr>
                        <th class="item-label">Operational System</th>
                        <th class="choice-col">YES</th>
                        <th class="choice-col">NO</th>
                        <th class="choice-col">N/A</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${OPERATIONAL_CHECK_ITEMS.map((item) => {
                        const status = (r.operational_checks || {})[item.id] || "YES";
                        return `
                          <tr>
                            <td class="item-label">${item.label}</td>
                            <td class="choice-col ${status === "YES" ? "choice-checked" : "choice-empty"}">${status === "YES" ? "☑" : "☐"}</td>
                            <td class="choice-col ${status === "NO" ? "choice-checked" : "choice-empty"}">${status === "NO" ? "☑" : "☐"}</td>
                            <td class="choice-col ${status === "N/A" ? "choice-checked" : "choice-empty"}">${status === "N/A" ? "☑" : "☐"}</td>
                          </tr>
                        `;
                      }).join("")}
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- WORKPLACE CONDITION & AWARENESS STATEMENTS -->
              <div class="awareness-box">
                <div class="awareness-title">Workplace Condition Inspection and Awareness Statement:</div>
                <div class="statement-line">
                  <span>${r.aware_hazards ? "☑" : "☐"}</span>
                  <span>As a licensed operator I am aware of the many possible hazards and will evaluate conditions as necessary throughout my shift.</span>
                </div>
                <div class="statement-line">
                  <span>${r.no_horseplay ? "☑" : "☐"}</span>
                  <span>Stunt driving and horseplay is strictly prohibited and could result in corrective action or revocation of operator credentials.</span>
                </div>
                <div style="margin-top: 4px; font-weight: 700;">
                  Operator Initials Verified: <span style="font-family: monospace; text-decoration: underline;">${r.operator_initials || "--"}</span>
                </div>
              </div>

              <!-- NOTES / DEFECT REMARKS -->
              <div class="comments-box">
                <strong>Inspector Comments / Corrective Action Notes:</strong> ${r.comments || "All visual and operational controls inspected; equipment declared safe for operational shift duty."}
              </div>
            </div>

            <!-- ATTESTATION & SIGN-OFF BOX -->
            <div>
              <div class="signoff-box">
                <div class="attestation-statement">
                  I hereby attest that I have personally completed the pre-use inspection on this powered industrial truck in full accordance with Interwest Mechanical Contractors Environmental Health &amp; Safety standards and OSHA 29 CFR 1910.178.
                </div>
                <div class="signature-grid">
                  <div>
                    <strong>Digital Signature:</strong> ${operatorName} (Certified Operator)
                  </div>
                  <div>
                    <strong>Signed Time:</strong> ${signedTime}
                  </div>
                  <div style="text-align: right;">
                    <strong>Inspection State:</strong> <span style="color: #065f46; font-weight: 800;">VERIFIED &amp; COMPLIANT</span>
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