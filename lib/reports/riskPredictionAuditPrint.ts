// lib/reports/riskPredictionPrint.ts
import { RiskPredictionAuditRecord } from "@/lib/db/riskPredictionOperations";
import { isNestleSpringville } from "@/lib/data/toolCatalog";

export function printRiskPredictionAudits(records: RiskPredictionAuditRecord[]) {
  if (!records || records.length === 0) return;

  // STRICT NESTLÉ SPRINGVILLE FILTER
  const validRecords = records.filter((r) => isNestleSpringville(r.audited_location));

  if (validRecords.length === 0) {
    alert("No audit records found matching the Nestlé Springville facility.");
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Monthly Risk Prediction Paperwork Quality Audit</title>
      <style>
        @page {
          size: letter portrait;
          margin: 0.32in 0.42in 0.32in 0.42in;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          color: #000;
          background: #fff;
          margin: 0;
          padding: 0;
          font-size: 8.5pt;
          line-height: 1.25;
        }
        .page-sheet {
          page-break-after: always;
          height: 100%;
          min-height: 97vh;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding-bottom: 4px;
        }
        .page-sheet:last-child {
          page-break-after: auto;
        }

        /* HARD COPY IMC HEADER BOX */
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

        .purpose-text {
          font-size: 7.2pt;
          margin-bottom: 6px;
          line-height: 1.25;
        }

        /* SECTION HEADERS */
        .section-bar {
          text-align: center;
          font-size: 8.5pt;
          font-weight: 800;
          text-transform: uppercase;
          background: #f1f5f9;
          border: 1px solid #000;
          padding: 2px 4px;
          margin: 5px 0 4px 0;
        }

        /* GRID INFO */
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px 14px;
          font-size: 7.5pt;
          margin-bottom: 5px;
        }
        .info-row {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .info-label {
          font-weight: 700;
          white-space: nowrap;
        }
        .info-val {
          border-bottom: 1px solid #333;
          flex: 1;
          font-weight: 600;
          padding-left: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* AUDIT QUESTION SECTIONS */
        .audit-item {
          margin-bottom: 4px;
        }
        .audit-item-title {
          font-size: 8pt;
          font-weight: 800;
          margin-bottom: 1px;
        }
        .check-line {
          display: flex;
          align-items: flex-start;
          gap: 5px;
          font-size: 7.5pt;
          margin-bottom: 1px;
          line-height: 1.2;
        }
        .check-symbol {
          font-weight: 900;
          font-size: 8.5pt;
          line-height: 1;
        }
        .sub-field {
          margin-left: 18px;
          font-size: 7pt;
          margin-top: 1px;
        }

        .line-notes {
          border-bottom: 1px solid #666;
          display: block;
          min-height: 12px;
          margin-top: 1px;
          font-style: italic;
          padding-left: 4px;
          font-size: 7pt;
        }

        /* PART 2 */
        .notes-box {
          border: 1px solid #cbd5e1;
          padding: 3px 6px;
          min-height: 28px;
          max-height: 36px;
          font-size: 7pt;
          background: #f8fafc;
          margin-top: 1px;
          margin-bottom: 4px;
          line-height: 1.2;
          overflow: hidden;
        }

        /* SIGNATURES */
        .sig-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 10px 14px;
          margin-top: 6px;
          border-top: 1px solid #cbd5e1;
          padding-top: 4px;
        }
        .sig-cell {
          border-bottom: 1px solid #000;
          padding-bottom: 2px;
          font-size: 7.5pt;
          font-weight: 700;
        }
      </style>
    </head>
    <body>
      ${validRecords
        .map((r) => {
          return `
        <div class="page-sheet">
          <div>
            <!-- HARD COPY IMC HEADER BOX -->
            <div class="doc-header-box">
              <div class="header-top">
                <div>
                  <div class="company-name">Interwest Mechanical Contractors</div>
                  <div style="font-size: 7pt; font-weight: 700; color: #475569; text-transform: uppercase; margin-top: 1px;">
                    Environmental Health &amp; Safety Division
                  </div>
                </div>
                <div class="imc-logo">
                  IMC
                  <div class="imc-sub">Safety Compliance</div>
                </div>
              </div>
              <div class="doc-id-title">MONTHLY RISK PREDICTION PAPERWORK QUALITY AUDIT</div>
              <div class="doc-meta">
                Workplace Safety Audit &nbsp;|&nbsp; Operating Standard: OSHA 29 CFR 1926.21 &nbsp;|&nbsp; <strong>UNCONTROLLED IF PRINTED</strong>
              </div>
            </div>

            <div class="purpose-text">
              <strong>Purpose:</strong> This audit evaluates how thoroughly and specifically an employee/contractor completes their Daily Risk Prediction paperwork in myCority. Audits are conducted monthly per employee/contractor to verify that fields are completed with sufficient detail rather than generic check-the-box answers.
            </div>

            <!-- DETAILS -->
            <div class="section-bar">EMPLOYEE &amp; AUDIT DETAILS</div>
            <div class="info-grid">
              <div class="info-row">
                <span class="info-label">Employee Name:</span>
                <span class="info-val">${(r.employee_name || "").toUpperCase()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Audit Date:</span>
                <span class="info-val">${r.audit_date || ""}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Auditor Name:</span>
                <span class="info-val">${(r.auditor_name || "").toUpperCase()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Audited Location / Area:</span>
                <span class="info-val">${(r.audited_location || "Nestle Springville").toUpperCase()}</span>
              </div>
              <div class="info-row" style="grid-column: span 2;">
                <span class="info-label">Target Work Date Audited:</span>
                <span class="info-val">${r.target_work_date || ""}</span>
              </div>
            </div>

            <!-- PART 1 -->
            <div class="section-bar">PART 1: DAILY RISK PREDICTION QUALITY AUDIT</div>

            <!-- 1. Basic Info & Pre-Checks -->
            <div class="audit-item">
              <div class="audit-item-title">1. Basic Information &amp; Pre-Checks</div>
              <div class="check-line">
                <span class="check-symbol">${r.pre_checks_selected ? "☑" : "☐"}</span>
                <span><strong>Pre-Checks Selected (Required *):</strong> LOTO, evacuation routes, safety shower, required tools verified.</span>
              </div>
              <div class="check-line">
                <span class="check-symbol">${r.completed_by_location ? "☑" : "☐"}</span>
                <span><strong>Risk Prediction Completed By &amp; Location (Required *):</strong> Name and site/room accurately recorded.</span>
              </div>
              <div class="check-line">
                <span class="check-symbol">${r.others_involved ? "☑" : "☐"}</span>
                <span><strong>Others Involved in Risk Prediction:</strong> Names of coworkers/crew members listed if working in teams.</span>
              </div>
            </div>

            <!-- 2. Initial Hazards & Precautions Alignment -->
            <div class="audit-item">
              <div class="audit-item-title">2. Initial Hazards &amp; Precautions Alignment</div>
              <div class="check-line">
                <span class="check-symbol">${r.specific_hazards ? "☑" : "☐"}</span>
                <span><strong>Specific Hazards Identified (Required *):</strong> Hazards checked match the actual work environment and task.</span>
              </div>
              <div class="check-line">
                <span class="check-symbol">${r.precautions_checked ? "☑" : "☐"}</span>
                <span><strong>Precautions Checked (Required *):</strong> Specific PPE and controls checked directly correspond to the selected hazards.</span>
              </div>
            </div>

            <!-- 3. Mandatory Sections -->
            <div class="audit-item">
              <div class="audit-item-title">3. Mandatory Sections</div>
              <div style="font-size: 7pt; font-style: italic; margin-bottom: 2px;">Evaluate the depth and quality of written mitigation strategies:</div>
              
              <div class="check-line">
                <span class="check-symbol">▪</span>
                <span><strong>"Eliminate Hazard by (identify additional precautions to control hazards identified above)":</strong></span>
              </div>
              <div class="sub-field">
                Status: <strong>${r.eliminate_hazard_status || "Blank (Non-Compliant)"}</strong>
                <span class="line-notes">Notes: ${r.eliminate_hazard_notes || "None"}</span>
              </div>

              <div class="check-line" style="margin-top: 2px;">
                <span class="check-symbol">▪</span>
                <span><strong>"ADDITIONAL THOUGHTS":</strong></span>
              </div>
              <div class="sub-field">
                Status: <strong>${r.additional_thoughts_status || "Blank (Non-Compliant)"}</strong>
                <span class="line-notes">Notes: ${r.additional_thoughts_notes || "None"}</span>
              </div>
            </div>

            <!-- 4. Detailed Job Task Breakdown -->
            <div class="audit-item">
              <div class="audit-item-title">4. Detailed Job Task Breakdown (Specific Hazards &amp; Precautions)</div>
              <div class="check-line">
                <span class="check-symbol">${r.job_desc_required ? "☑" : "☐"}</span>
                <span><strong>Job Description For Above (Required *):</strong> Detailed scope of the day's work (not just 1-2 words).</span>
              </div>
              <div class="check-line">
                <span class="check-symbol">${r.task1_breakdown ? "☑" : "☐"}</span>
                <span><strong>Job Task #1 Breakdown (Required *):</strong> High-hazard task named with specific hazards/precautions (1a, 1b, 1c).</span>
              </div>
              <div class="check-line">
                <span class="check-symbol">${r.task2_breakdown ? "☑" : "☐"}</span>
                <span><strong>Job Task #2 Breakdown:</strong> Clear secondary task defined with corresponding hazard/precaution entries.</span>
              </div>
              <div class="check-line">
                <span class="check-symbol">${r.task3_breakdown ? "☑" : "☐"}</span>
                <span><strong>Job Task #3 Breakdown:</strong> Third high-hazard task detailed if applicable to full shift scope.</span>
              </div>
              <div class="sub-field" style="margin-top: 1px;">
                Specificity Score: <strong>${r.specificity_score || "Unacceptable (Check-the-box only)"}</strong>
              </div>
            </div>

            <!-- 5. Prompts to STOP and RE-EVALUATE -->
            <div class="audit-item">
              <div class="audit-item-title">5. Prompts to STOP and RE-EVALUATE</div>
              <div class="check-line">
                <span class="check-symbol">${r.unexpected_events ? "☑" : "☐"}</span>
                <span><strong>2-3 Unexpected Events Identified (Required *):</strong> Realistic scenarios checked (e.g., stuck, rush, line of fire).</span>
              </div>
              <div class="check-line">
                <span class="check-symbol">▪</span>
                <span><strong>"Now list how you will react to each prompt you checked" (Required *):</strong></span>
              </div>
              <div class="sub-field">
                Status: <strong>${r.react_prompt_status || "Incomplete / Vague"}</strong>
                <span class="line-notes">Notes: ${r.react_prompt_notes || "None"}</span>
              </div>
              <div class="sub-field" style="margin-top: 2px;">
                Audit Quality Score: <strong>${r.audit_quality_score || "Unsatisfactory"}</strong>
              </div>
            </div>

            <!-- PART 2 -->
            <div class="section-bar">PART 2: EMPLOYEE FEEDBACK &amp; COACHING</div>

            <div class="audit-item">
              <div class="audit-item-title">1. What the Employee Did Well (Quality Strengths)</div>
              <div style="font-size: 7pt; color: #475569;">Highlight strong areas of detail, thorough task breakdown, or proactive risk thinking:</div>
              <div class="notes-box">${r.strengths_notes || "None noted."}</div>
            </div>

            <div class="audit-item">
              <div class="audit-item-title">2. Areas for Improvement (Missing Fields &amp; Detail Gaps)</div>
              <div style="font-size: 7pt; color: #475569;">Address vague descriptions, unchecked required items, or omitted custom fields:</div>
              <div class="notes-box">${r.improvements_notes || "None noted."}</div>
            </div>

            <div style="margin: 3px 0 5px 0; font-size: 7.5pt;">
              <strong>Corrective Action / Coaching Required:</strong><br>
              <span style="margin-right: 16px;">[${r.coaching_completed ? "X" : " "}] Paperwork Coaching Completed During Audit</span>
              <span>[${r.re_audit_scheduled ? "X" : " "}] Re-audit Scheduled Within 7 Days</span>
            </div>
          </div>

          <!-- SIGNATURES -->
          <div>
            <div class="sig-grid">
              <div>
                <div class="sig-cell">Employee Signature: ${r.employee_signature || ""}</div>
              </div>
              <div>
                <div class="sig-cell">Date: ${r.employee_signature_date || ""}</div>
              </div>
              <div>
                <div class="sig-cell">Auditor Signature: ${r.auditor_signature || ""}</div>
              </div>
              <div>
                <div class="sig-cell">Date: ${r.auditor_signature_date || ""}</div>
              </div>
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
  doc.write(html);
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