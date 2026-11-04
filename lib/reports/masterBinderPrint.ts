// lib/reports/masterBinderPrint.ts

import { DailyJhaRecord, JhaAcknowledgmentRecord } from "@/lib/db/operations";
import { SafetyCheckSheetRecord } from "@/lib/db/dailySafetyCheckOperations";
import { BoomLiftInspectionRecord } from "@/lib/db/boomLiftOperations";
import { ScissorLiftInspectionRecord } from "@/lib/db/scissorLiftOperations";
import { ForkTruckInspectionRecord } from "@/lib/db/forkTruckOperations";
import { LadderInspectionRecord } from "@/lib/db/ladderOperations";
import { FallProtectionRecord } from "@/lib/db/fallProtectionOperations";
import { JhaGrinderInspectionRecord } from "@/lib/db/grinderInspectionOperations";
import { DailyToolInspectionRecord } from "@/lib/db/operations";
import { RiskPredictionAuditRecord } from "@/lib/db/riskPredictionOperations";

// 100% UNIFIED IMPORTS FROM REAL SOURCE FILES
import { renderToolInspectionHtml, TOOL_INSPECTION_PRINT_CSS } from "@/lib/reports/toolInspectionPrint";
import { renderJhaHtml, JHA_PRINT_CSS } from "@/lib/reports/dailyJhaPrint";
import { renderSafetyCheckHtml, SAFETY_CHECK_PRINT_CSS } from "@/lib/reports/dailySafetyCheckPrint";
import { renderBoomLiftHtml, BOOM_LIFT_PRINT_CSS } from "@/lib/reports/boomLiftInspectionPrint";
import { renderScissorLiftHtml, SCISSOR_LIFT_PRINT_CSS } from "@/lib/reports/scissorLiftInspectionPrint";
import { renderForkliftHtml, FORK_TRUCK_PRINT_CSS } from "@/lib/reports/forkTruckInspectionPrint";
import { renderFallProtectionHtml, FALL_PROTECTION_PRINT_CSS } from "@/lib/reports/fallProtectionPrint";
import { renderGrinderHtml, GRINDER_PRINT_CSS } from "@/lib/reports/grinderInspectionPrint";
import { renderLadderHtml, LADDER_PRINT_CSS } from "@/lib/reports/ladderInspectionPrint";
import { renderRiskPredictionHtml, RISK_PREDICTION_PRINT_CSS } from "@/lib/reports/riskPredictionAuditPrint";

export type JhaSignatureScope = "WINDOW" | "DAILY" | "ALL_TIME";

export interface MasterBinderPayload {
  location: string;
  startDate: string;
  endDate: string;
  compilingManager: string;
  selectedFormTypes: string[];
  jhaSignatureScope?: JhaSignatureScope;
  records: {
    safetyChecks?: SafetyCheckSheetRecord[];
    jhas?: { jha: DailyJhaRecord; acks: JhaAcknowledgmentRecord[] }[];
    toolChecks?: DailyToolInspectionRecord[];
    grinders?: JhaGrinderInspectionRecord[];
    forklifts?: ForkTruckInspectionRecord[];
    scissorLifts?: ScissorLiftInspectionRecord[];
    boomLifts?: BoomLiftInspectionRecord[];
    ladders?: LadderInspectionRecord[];
    fallProtections?: FallProtectionRecord[];
    riskPredictions?: RiskPredictionAuditRecord[];
  };
}

export function buildMasterBinderHtml(payload: MasterBinderPayload): string {
  const {
    location,
    startDate,
    endDate,
    compilingManager,
    selectedFormTypes,
    records,
    jhaSignatureScope = "WINDOW",
  } = payload;

  const contentPagesHtml: string[] = [];
  const tocEntries: { section: string; count: number; dateRange: string }[] = [];

  // ==========================================
  // DUPLEX ISOLATION PAGE-MATH ENGINE
  // ==========================================
  const BLANK_BACK_PAGE = `<div class="duplex-blank-page"></div>`;
  
  // FIXED SINGLE PAGE FORMS: Always 1 page, always gets a blank back.
  const pushFixedSinglePage = (html: string) => {
    contentPagesHtml.push(html);
    contentPagesHtml.push(BLANK_BACK_PAGE);
  };

  // DYNAMIC JHA FORMS: Simple Math
  const pushDynamicJha = (html: string, stepCount: number, ackCount: number) => {
    contentPagesHtml.push(html);
    
    // THRESHOLD: If 4 or fewer steps AND 4 or fewer signatures, it fits on ONE PAGE.
    // Adjust these numbers if you need the cutoff to be slightly higher (e.g. 5 and 5).
    const isOnePage = stepCount <= 4 && ackCount <= 4;

    if (isOnePage) {
      contentPagesHtml.push(BLANK_BACK_PAGE); // 1-page gets blank back
    }
    // 2-page documents get nothing, printing naturally front & back.
  };

  // DYNAMIC TOOL CHECKS: Simple Math
  const pushDynamicToolCheck = (html: string, toolCount: number) => {
    contentPagesHtml.push(html);
    
    // THRESHOLD: ~22 tools fit on the front page.
    if (toolCount <= 22) {
      contentPagesHtml.push(BLANK_BACK_PAGE); // 1-page gets blank back
    } else if (toolCount > 44) {
      // If it spills over to a 3rd page, it needs a blank back for the 4th side.
      contentPagesHtml.push(BLANK_BACK_PAGE); 
    }
    // If between 23 and 44, it is 2 pages (Front & Back) and gets NO blank page.
  };

  // --- 1. JHA CONSOLIDATED (WEEKLY TURNOVER WINDOW OR ALL-TIME) ---
  let jhasCount = 0;
  if (selectedFormTypes.includes("jhas") && records.jhas && records.jhas.length > 0) {
    if (jhaSignatureScope === "WINDOW" || jhaSignatureScope === "ALL_TIME") {
      records.jhas.forEach(({ jha, acks }) => {
        let filteredAcks: JhaAcknowledgmentRecord[] = [];

        if (jhaSignatureScope === "WINDOW") {
          filteredAcks = acks.filter((a) => {
            if (!a.signed_at) return false;
            const signDate = a.signed_at.split("T")[0];
            return signDate >= startDate && signDate <= endDate;
          });
        } else {
          filteredAcks = acks;
        }

        const jhaDate = jha.date || "";
        const isJhaInWindow = jhaDate >= startDate && jhaDate <= endDate;
        if (isJhaInWindow || filteredAcks.length > 0) {
          const scopeLabel =
            jhaSignatureScope === "WINDOW"
              ? `Weekly Turnover Audit (${startDate} to ${endDate})`
              : "Cumulative Project Life";

          const stepCount = jha.steps ? jha.steps.length : 0;
          pushDynamicJha(renderJhaHtml(jha, filteredAcks, scopeLabel), stepCount, filteredAcks.length);
          jhasCount++;
        }
      });
    }
  }

  // --- 2. CHRONOLOGICAL DAILY DOCKET ---
  const dateSet = new Set<string>();
  (records.safetyChecks || []).forEach((r) => dateSet.add(r.check_date));
  (records.toolChecks || []).forEach((r) => dateSet.add(r.inspection_date));
  (records.grinders || []).forEach((r) => dateSet.add(r.inspection_date));
  (records.forklifts || []).forEach((r) => dateSet.add(r.inspection_date));
  (records.scissorLifts || []).forEach((r) => dateSet.add(r.inspection_date));
  (records.boomLifts || []).forEach((r) => dateSet.add(r.inspection_date));
  (records.ladders || []).forEach((r) => dateSet.add(r.inspection_date));
  (records.fallProtections || []).forEach((r) => dateSet.add(r.inspection_date));
  (records.riskPredictions || []).forEach((r) => dateSet.add(r.audit_date));

  if (jhaSignatureScope === "DAILY" && selectedFormTypes.includes("jhas")) {
    (records.jhas || []).forEach(({ jha, acks }) => {
      acks.forEach((a) => {
        const signDate = a.signed_at ? a.signed_at.split("T")[0] : jha.date;
        if (signDate >= startDate && signDate <= endDate) dateSet.add(signDate);
      });
    });
  }

  if (dateSet.size === 0) dateSet.add(startDate);
  const sortedDates = Array.from(dateSet).sort();

  let safetyChecksCount = 0;
  let toolChecksCount = 0;
  let grindersCount = 0;
  let forkliftsCount = 0;
  let scissorLiftsCount = 0;
  let boomLiftsCount = 0;
  let laddersCount = 0;
  let fallProtectionsCount = 0;
  let riskPredictionsCount = 0;

  sortedDates.forEach((date) => {
    // DAILY JHAs
    if (jhaSignatureScope === "DAILY" && selectedFormTypes.includes("jhas")) {
      const match = (records.jhas || []).filter(({ jha, acks }) => {
        const hasAckToday = acks.some(
          (a) => a.signed_at && a.signed_at.split("T")[0] === date
        );
        return hasAckToday || jha.date === date;
      });

      match.forEach(({ jha, acks }) => {
        const dayAcks = acks.filter(
          (a) => a.signed_at && a.signed_at.split("T")[0] === date
        );
        const finalAcks = dayAcks.length > 0 ? dayAcks : acks;
        const stepCount = jha.steps ? jha.steps.length : 0;
        
        pushDynamicJha(renderJhaHtml(jha, finalAcks, `Daily Docket: ${date}`), stepCount, finalAcks.length);
        jhasCount++;
      });
    }

    // SAFETY CHECKS
    if (selectedFormTypes.includes("safety_checks")) {
      const match = (records.safetyChecks || []).filter((r) => r.check_date === date);
      match.forEach((sheet) => {
        pushFixedSinglePage(renderSafetyCheckHtml(sheet));
        safetyChecksCount++;
      });
    }

    // TOOL CHECKS
    if (selectedFormTypes.includes("tool_checks")) {
      const match = (records.toolChecks || []).filter((r) => r.inspection_date === date);
      match.forEach((tool: any) => {
        const itemsArr = tool.tools || tool.items || tool.inspections || tool.inspected_tools || [];
        pushDynamicToolCheck(renderToolInspectionHtml(tool), itemsArr.length);
        toolChecksCount++;
      });
    }

    // GRINDERS
    if (selectedFormTypes.includes("grinders")) {
      const match = (records.grinders || []).filter((r) => r.inspection_date === date);
      match.forEach((g) => {
        pushFixedSinglePage(renderGrinderHtml(g));
        grindersCount++;
      });
    }

    // FORKLIFTS
    if (selectedFormTypes.includes("forklifts")) {
      const match = (records.forklifts || []).filter((r) => r.inspection_date === date);
      match.forEach((f) => {
        pushFixedSinglePage(renderForkliftHtml(f));
        forkliftsCount++;
      });
    }

    // SCISSOR LIFTS
    if (selectedFormTypes.includes("scissor_lifts")) {
      const match = (records.scissorLifts || []).filter((r) => r.inspection_date === date);
      match.forEach((s) => {
        pushFixedSinglePage(renderScissorLiftHtml(s));
        scissorLiftsCount++;
      });
    }

    // BOOM LIFTS
    if (selectedFormTypes.includes("boom_lifts")) {
      const match = (records.boomLifts || []).filter((r) => r.inspection_date === date);
      match.forEach((b) => {
        pushFixedSinglePage(renderBoomLiftHtml(b));
        boomLiftsCount++;
      });
    }

    // LADDERS
    if (selectedFormTypes.includes("ladders")) {
      const match = (records.ladders || []).filter((r) => r.inspection_date === date);
      match.forEach((l) => {
        pushFixedSinglePage(renderLadderHtml(l));
        laddersCount++;
      });
    }

    // FALL PROTECTION
    if (selectedFormTypes.includes("fall_protection")) {
      const match = (records.fallProtections || []).filter((r) => r.inspection_date === date);
      match.forEach((fp) => {
        pushFixedSinglePage(renderFallProtectionHtml(fp));
        fallProtectionsCount++;
      });
    }

    // RISK PREDICTIONS
    if (selectedFormTypes.includes("risk_predictions")) {
      const match = (records.riskPredictions || []).filter((r) => r.audit_date === date);
      match.forEach((rp) => {
        // Always 2 pages minimum (Front & Back), so no spacer
        contentPagesHtml.push(renderRiskPredictionHtml(rp));
        riskPredictionsCount++;
      });
    }
  });

  // Table of Contents
  if (selectedFormTypes.includes("jhas") && jhasCount > 0) {
    tocEntries.push({ section: "Job Hazard Analyses (JHA) & Crew Sign-Offs", count: jhasCount, dateRange: `${startDate} to ${endDate}` });
  }
  if (selectedFormTypes.includes("safety_checks") && safetyChecksCount > 0) {
    tocEntries.push({ section: "Daily Safety Checks & Shift Rosters", count: safetyChecksCount, dateRange: `${startDate} to ${endDate}` });
  }
  if (selectedFormTypes.includes("tool_checks") && toolChecksCount > 0) {
    tocEntries.push({ section: "Hand & Power Tool Pre-Use Inspections", count: toolChecksCount, dateRange: `${startDate} to ${endDate}` });
  }
  if (selectedFormTypes.includes("grinders") && grindersCount > 0) {
    tocEntries.push({ section: "Portable Grinder Shift Monitoring Logs", count: grindersCount, dateRange: `${startDate} to ${endDate}` });
  }
  if (selectedFormTypes.includes("forklifts") && forkliftsCount > 0) {
    tocEntries.push({ section: "Driver's Daily Forklift / PIT Inspections", count: forkliftsCount, dateRange: `${startDate} to ${endDate}` });
  }
  if (selectedFormTypes.includes("scissor_lifts") && scissorLiftsCount > 0) {
    tocEntries.push({ section: "Daily Scissor Lift Pre-Use Inspections", count: scissorLiftsCount, dateRange: `${startDate} to ${endDate}` });
  }
  if (selectedFormTypes.includes("boom_lifts") && boomLiftsCount > 0) {
    tocEntries.push({ section: "Daily Boom Lift Pre-Use Inspections", count: boomLiftsCount, dateRange: `${startDate} to ${endDate}` });
  }
  if (selectedFormTypes.includes("ladders") && laddersCount > 0) {
    tocEntries.push({ section: "Ladder Safety & Structural Condition Logs", count: laddersCount, dateRange: `${startDate} to ${endDate}` });
  }
  if (selectedFormTypes.includes("fall_protection") && fallProtectionsCount > 0) {
    tocEntries.push({ section: "Personal Fall Arrest System (PFAS) Logs", count: fallProtectionsCount, dateRange: `${startDate} to ${endDate}` });
  }
  if (selectedFormTypes.includes("risk_predictions") && riskPredictionsCount > 0) {
    tocEntries.push({ section: "Risk Prediction Paperwork Quality Audits", count: riskPredictionsCount, dateRange: `${startDate} to ${endDate}` });
  }

  // Cover Sheet (1 page, gets a blank reverse page before audit documents begin)
  const coverSheetHtml = `
    <div class="document-container" style="page-break-before: avoid; break-before: auto;">
      <div class="doc-header-box" style="margin-bottom: 12px; padding: 12px 16px;">
        <div class="header-top">
          <div>
            <div class="company-name" style="font-size: 15pt;">Interwest Mechanical Contractors</div>
            <div style="font-size: 8.5pt; font-weight: 700; color: #475569; text-transform: uppercase; margin-top: 2px;">
              Environmental Health &amp; Safety Division
            </div>
          </div>
          <div class="imc-logo" style="font-size: 26pt;">
            IMC
            <div class="imc-sub" style="font-size: 7.5pt;">Safety Compliance</div>
          </div>
        </div>
        <div class="doc-id-title" style="font-size: 12pt; margin-top: 6px;">Master Safety Compliance Audit Binder</div>
        <div class="doc-meta" style="font-size: 8pt;">
          Official Regulatory Ledger &nbsp;|&nbsp; <strong>UNCONTROLLED IF PRINTED</strong>
        </div>
      </div>

      <div class="audit-info-bar" style="padding: 8px 12px; font-size: 8.5pt; gap: 6px 12px; margin-bottom: 12px;">
        <div class="info-cell" style="grid-column: span 2;">
          <span class="info-label">Assigned Worksite / Facility</span>
          <span class="info-value" style="font-size: 9.5pt;">${location.toUpperCase()}</span>
        </div>
        <div class="info-cell">
          <span class="info-label">Audit Window</span>
          <span class="info-value">${startDate} to ${endDate}</span>
        </div>
        <div class="info-cell">
          <span class="info-label">Sorting Sequence</span>
          <span class="info-value">WEEKLY DOSSIER / CHRONOLOGICAL</span>
        </div>
        <div class="info-cell" style="grid-column: span 2;">
          <span class="info-label">Compiling Safety Lead / Manager</span>
          <span class="info-value" style="color: #0369a1;">${compilingManager.toUpperCase()}</span>
        </div>
        <div class="info-cell">
          <span class="info-label">Generated Timestamp</span>
          <span class="info-value">${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
        <div class="info-cell">
          <span class="info-label">Total Verified Records</span>
          <span class="info-value" style="color: #065f46;">${(records.jhas?.length || 0) + (records.toolChecks?.length || 0) + (records.ladders?.length || 0) + (records.fallProtections?.length || 0) + (records.forklifts?.length || 0) + (records.scissorLifts?.length || 0) + (records.boomLifts?.length || 0)} ITEMS COMPILED</span>
        </div>
      </div>

      <div style="border: 1.5px solid #000; padding: 10px 14px; background: #fafafa; margin-bottom: 12px;">
        <div style="font-size: 9.5pt; font-weight: 900; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 4px; margin-bottom: 8px; display: flex; justify-content: space-between;">
          <span>Binder Table of Contents</span>
          <span style="font-size: 7.5pt; color: #64748b;">ACTIVE VERIFIED FORMS ONLY</span>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 8pt;">
          <thead>
            <tr style="border-bottom: 1.5px solid #000; background: #e2e8f0;">
              <th style="padding: 5px; text-align: left;">Section / Document Title</th>
              <th style="padding: 5px; text-align: center;">Audit Date Window</th>
              <th style="padding: 5px; text-align: right;">Compiled Count</th>
            </tr>
          </thead>
          <tbody>
            ${
              tocEntries.length > 0
                ? tocEntries
                    .map(
                      (entry, idx) => `
                <tr style="border-bottom: 1px solid #cbd5e1;">
                  <td style="padding: 6px; font-weight: 700; text-transform: uppercase;">${idx + 1}. ${entry.section}</td>
                  <td style="padding: 6px; text-align: center; font-family: monospace;">${entry.dateRange}</td>
                  <td style="padding: 6px; text-align: right; font-weight: 900; color: #065f46;">${entry.count} Records</td>
                </tr>
              `
                    )
                    .join("")
                : `<tr><td colspan="3" style="text-align: center; padding: 14px; color: #64748b;">[ No matching records found for the selected dates and forms ]</td></tr>`
            }
          </tbody>
        </table>

        <div style="font-size: 6.5pt; color: #64748b; font-style: italic; margin-top: 10px; border-top: 1px dashed #999; padding-top: 5px;">
          * Operational Footnote: Specialized equipment forms omitted from this index were inactive, unenergized, or not checked out on this worksite during the specified audit window.
        </div>
      </div>

      <div class="signoff-wrapper">
        <div class="signoff-box">
          <div class="attestation-statement">
            I hereby certify as designated Safety Administrator that the compliance records compiled within this binder represent true, unaltered field documentation executed by Interwest Mechanical Contractors craft personnel.
          </div>
          <div class="signature-grid">
            <div>
              <strong>Certified Safety Administrator:</strong> ${compilingManager.toUpperCase()}
            </div>
            <div>
              <strong>Date Certified:</strong> ${new Date().toLocaleDateString()}
            </div>
            <div style="text-align: right;">
              <strong>Audit State:</strong> <span style="color: #065f46; font-weight: 800;">OFFICIAL BINDER AUDITED</span>
            </div>
          </div>
        </div>
        <div class="doc-footer">
          INTERWEST MECHANICAL CONTRACTORS — ENVIRONMENTAL HEALTH &amp; SAFETY MANAGEMENT SYSTEM — STRICT COMPLIANCE
        </div>
      </div>
    </div>
    ${BLANK_BACK_PAGE}
  `;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>IMC Master Safety Compliance Binder - ${location} (${startDate} to ${endDate})</title>
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
          margin: 0;
          padding: 0;
          background: #fff;
          color: #000;
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

        /* EXPLICIT BLANK PAGE SPACER */
        .duplex-blank-page {
          page-break-before: always !important;
          break-before: page !important;
          height: 1px;
          min-height: 1px;
          visibility: hidden;
          display: block;
        }

        tr {
          break-inside: avoid;
          page-break-inside: avoid;
        }
        thead {
          display: table-header-group;
        }
        .signoff-wrapper {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        /* ALL OFFICIAL STYLESHEETS FROM INDIVIDUAL FORMS */
        ${TOOL_INSPECTION_PRINT_CSS}
        ${JHA_PRINT_CSS}
        ${SAFETY_CHECK_PRINT_CSS}
        ${BOOM_LIFT_PRINT_CSS}
        ${SCISSOR_LIFT_PRINT_CSS}
        ${FORK_TRUCK_PRINT_CSS}
        ${FALL_PROTECTION_PRINT_CSS}
        ${GRINDER_PRINT_CSS}
        ${LADDER_PRINT_CSS}
        ${RISK_PREDICTION_PRINT_CSS}
      </style>
    </head>
    <body>
      ${coverSheetHtml}
      ${contentPagesHtml.join("")}
    </body>
    </html>
  `;
}

// Browser Print Dispatcher
export function printMasterComplianceBinder(payload: MasterBinderPayload) {
  const masterHtml = buildMasterBinderHtml(payload);

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
  doc.write(masterHtml);
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