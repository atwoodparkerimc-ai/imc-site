// app/(dashboard)/manager/_components/MasterComplianceBinder.tsx
"use client";

import { useState } from "react";
import {
  printMasterComplianceBinder,
  buildMasterBinderHtml,
  JhaSignatureScope,
} from "@/lib/reports/masterBinderPrint";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface MasterComplianceBinderProps {
  supabase: any;
  currentUserId: string;
  currentUserName: string;
  selectedLocation?: string;
  locations?: string[];
}

interface FormTypeOption {
  id: string;
  label: string;
  category: "Personnel & Pre-Task" | "Tools & Hot Work" | "Powered Access & Rigging";
}

const AVAILABLE_FORMS: FormTypeOption[] = [
  // Category 1: Personnel & Pre-Task
  { id: "safety_checks", label: "Daily Safety Checks & Shift Rosters", category: "Personnel & Pre-Task" },
  { id: "jhas", label: "Job Hazard Analyses (JHA) & Crew Sign-Offs", category: "Personnel & Pre-Task" },
  { id: "risk_predictions", label: "Risk Prediction Paperwork Quality Audits", category: "Personnel & Pre-Task" },

  // Category 2: Tools & Hot Work
  { id: "tool_checks", label: "Hand & Power Tool Pre-Use Inspections (5959)", category: "Tools & Hot Work" },
  { id: "grinders", label: "Portable Grinder Shift Monitoring Logs", category: "Tools & Hot Work" },

  // Category 3: Powered Access & Rigging
  { id: "forklifts", label: "Driver's Daily Forklift / PIT Inspections", category: "Powered Access & Rigging" },
  { id: "scissor_lifts", label: "Daily Scissor Lift Pre-Use Inspections", category: "Powered Access & Rigging" },
  { id: "boom_lifts", label: "Daily Boom Lift Pre-Use Inspections", category: "Powered Access & Rigging" },
  { id: "ladders", label: "Work-Area Ladder Pre-Use Inspections", category: "Powered Access & Rigging" },
  { id: "fall_protection", label: "Personal Fall Arrest System (PFAS) Logs", category: "Powered Access & Rigging" },
];

export default function MasterComplianceBinder({
  supabase,
  currentUserId,
  currentUserName,
  selectedLocation = "Nestle Springville",
  locations = ["Nestle Springville", "Springville Shop"],
}: MasterComplianceBinderProps) {
  const todayStr = new Date().toISOString().split("T")[0];

  // Config States
  const [activeLocation, setActiveLocation] = useState<string>(selectedLocation);
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(todayStr);
  const [jhaSignatureScope, setJhaSignatureScope] = useState<JhaSignatureScope>("WINDOW");
  const [selectedFormIds, setSelectedFormIds] = useState<string[]>(
    AVAILABLE_FORMS.map((f) => f.id)
  );

  // Email Tray States
  const [showEmailTray, setShowEmailTray] = useState<boolean>(false);
  const [emailRecipients, setEmailRecipients] = useState<string>("");
  const [customEmailNote, setCustomEmailNote] = useState<string>("");
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [emailProgressStep, setEmailProgressStep] = useState<string>("");

  // Status & Feedback States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  // Date Range Quick Preset Handlers
  const handleSetPreset = (preset: "TODAY" | "YESTERDAY" | "THIS_WEEK" | "PAST_30") => {
    const now = new Date();
    if (preset === "TODAY") {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === "YESTERDAY") {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().split("T")[0];
      setStartDate(yStr);
      setEndDate(yStr);
    } else if (preset === "THIS_WEEK") {
      const d = new Date(now);
      const day = d.getDay();
      const diffToMon = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diffToMon));
      const friday = new Date(monday);
      friday.setDate(friday.getDate() + 4);

      setStartDate(monday.toISOString().split("T")[0]);
      setEndDate(friday.toISOString().split("T")[0]);
      setJhaSignatureScope("WINDOW"); // Automatically set to weekly consolidated mode
    } else if (preset === "PAST_30") {
      const past = new Date(now);
      past.setDate(past.getDate() - 30);
      setStartDate(past.toISOString().split("T")[0]);
      setEndDate(todayStr);
    }
  };

  const toggleForm = (id: string) => {
    setSelectedFormIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedFormIds.length === AVAILABLE_FORMS.length) {
      setSelectedFormIds([]);
    } else {
      setSelectedFormIds(AVAILABLE_FORMS.map((f) => f.id));
    }
  };

  // Batched Supabase Data Fetcher
  const fetchAllSelectedRecords = async () => {
    const cleanLoc = activeLocation.trim();
    const locPattern = `%${cleanLoc}%`;

    const tasks: Record<string, Promise<any>> = {};

    if (selectedFormIds.includes("safety_checks")) {
      tasks.safetyChecks = supabase
        .from("daily_safety_check_sheets")
        .select("*, entries:daily_safety_check_entries(*)")
        .gte("check_date", startDate)
        .lte("check_date", endDate)
        .ilike("location", locPattern);
    }

    if (selectedFormIds.includes("jhas")) {
      tasks.jhas = (async () => {
        const startIso = `${startDate}T00:00:00.000Z`;
        const endIso = `${endDate}T23:59:59.999Z`;

        let acksQuery = supabase
          .from("jha_acknowledgments")
          .select("*")
          .ilike("location", locPattern);

        if (jhaSignatureScope !== "ALL_TIME") {
          acksQuery = acksQuery.gte("signed_at", startIso).lte("signed_at", endIso);
        }

        const { data: windowAcks } = await acksQuery;

        const signedJhaIds = Array.from(new Set((windowAcks || []).map((a: any) => a.jha_id)));

        let jhasQuery = supabase.from("daily_jhas").select("*").ilike("location", locPattern);

        if (signedJhaIds.length > 0) {
          jhasQuery = jhasQuery.or(`id.in.(${signedJhaIds.join(",")}),and(date.gte.${startDate},date.lte.${endDate})`);
        } else {
          jhasQuery = jhasQuery.gte("date", startDate).lte("date", endDate);
        }

        const { data: jhasData } = await jhasQuery;
        if (!jhasData || jhasData.length === 0) return [];

        const acksMap = new Map<string, any[]>();
        (windowAcks || []).forEach((a: any) => {
          if (!acksMap.has(a.jha_id)) acksMap.set(a.jha_id, []);
          acksMap.get(a.jha_id)!.push(a);
        });

        return jhasData.map((j: any) => ({
          jha: j,
          acks: acksMap.get(j.id) || [],
        }));
      })();
    }

    if (selectedFormIds.includes("tool_checks")) {
      tasks.toolChecks = supabase
        .from("daily_tool_inspections")
        .select("*")
        .gte("inspection_date", startDate)
        .lte("inspection_date", endDate)
        .ilike("location", locPattern);
    }

    if (selectedFormIds.includes("grinders")) {
      tasks.grinders = supabase
        .from("jha_grinder_inspections")
        .select("*")
        .gte("inspection_date", startDate)
        .lte("inspection_date", endDate)
        .ilike("location", locPattern);
    }

    if (selectedFormIds.includes("forklifts")) {
      tasks.forklifts = supabase
        .from("daily_fork_truck_inspections")
        .select("*")
        .gte("inspection_date", startDate)
        .lte("inspection_date", endDate)
        .ilike("location", locPattern);
    }

    if (selectedFormIds.includes("scissor_lifts")) {
      tasks.scissorLifts = supabase
        .from("daily_scissor_lift_inspections")
        .select("*")
        .gte("inspection_date", startDate)
        .lte("inspection_date", endDate)
        .ilike("location", locPattern);
    }

    if (selectedFormIds.includes("boom_lifts")) {
      tasks.boomLifts = supabase
        .from("daily_boom_lift_inspections")
        .select("*")
        .gte("inspection_date", startDate)
        .lte("inspection_date", endDate)
        .ilike("location", locPattern);
    }

    if (selectedFormIds.includes("ladders")) {
      tasks.ladders = supabase
        .from("daily_ladder_inspections")
        .select("*")
        .gte("inspection_date", startDate)
        .lte("inspection_date", endDate)
        .ilike("location", locPattern);
    }

    if (selectedFormIds.includes("fall_protection")) {
      tasks.fallProtections = supabase
        .from("daily_fall_protection_inspections")
        .select("*")
        .gte("inspection_date", startDate)
        .lte("inspection_date", endDate)
        .ilike("location", locPattern);
    }

    if (selectedFormIds.includes("risk_predictions")) {
      tasks.riskPredictions = supabase
        .from("risk_prediction_audits")
        .select("*")
        .gte("audit_date", startDate)
        .lte("audit_date", endDate)
        .ilike("audited_location", locPattern);
    }

    const results: any = {};
    const keys = Object.keys(tasks);
    const resolved = await Promise.all(Object.values(tasks));

    keys.forEach((key, idx) => {
      const res = resolved[idx];
      results[key] = Array.isArray(res) ? res : res?.data || [];
    });

    return results;
  };

  // Action 1: Print Binder Native
  const handlePrintBinder = async () => {
    if (selectedFormIds.length === 0) {
      setFeedback({ message: "Select at least one form type to compile.", isError: true });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const records = await fetchAllSelectedRecords();
      printMasterComplianceBinder({
        location: activeLocation,
        startDate,
        endDate,
        compilingManager: currentUserName || "Authorized Safety Lead",
        selectedFormTypes: selectedFormIds,
        jhaSignatureScope,
        records,
      });
      setFeedback({ message: "Print preview generated successfully.", isError: false });
    } catch (err: any) {
      console.error("Failed to compile master binder:", err);
      setFeedback({ message: `Compilation fault: ${err.message || "Network issue"}`, isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  // True 1-to-1 PDF Match Generator
  const generatePdfBlob = async (htmlString: string): Promise<Blob> => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.left = "-9999px";
    iframe.style.top = "0";
    iframe.style.width = "836px";
    iframe.style.height = "12000px";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    try {
      const doc = iframe.contentWindow?.document;
      if (!doc) throw new Error("Could not initialize rendering sandbox.");

      doc.open();
      doc.write(htmlString);
      doc.close();

      await new Promise((resolve) => setTimeout(resolve, 800));

      const pageElements = Array.from(doc.querySelectorAll(".document-container")) as HTMLElement[];
      if (pageElements.length === 0) throw new Error("No document sheets found in report.");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "letter",
        compress: true,
      });

      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i];
        setEmailProgressStep(`Compiling page ${i + 1} of ${pageElements.length}...`);

        const canvas = await html2canvas(pageEl, {
          scale: 1.5,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.85);
        if (i > 0) pdf.addPage("letter", "portrait");
        pdf.addImage(imgData, "JPEG", 0, 0, 612, 792, undefined, "FAST");
      }

      return pdf.output("blob");
    } finally {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }
  };

  // Action 2: Email Dispatch with Attached PDF
  const handleSendEmail = async () => {
    if (!emailRecipients.trim()) {
      setFeedback({ message: "Please provide at least one recipient email address.", isError: true });
      return;
    }

    setIsSendingEmail(true);
    setEmailProgressStep("Fetching verified database records...");
    setFeedback(null);

    try {
      const records = await fetchAllSelectedRecords();

      const sectionsList: { section: string; count: number }[] = [];
      let total = 0;

      if (records.safetyChecks?.length) {
        sectionsList.push({ section: "Daily Safety Checks", count: records.safetyChecks.length });
        total += records.safetyChecks.length;
      }
      if (records.jhas?.length) {
        sectionsList.push({ section: "Daily JHAs & Signatures", count: records.jhas.length });
        total += records.jhas.length;
      }
      if (records.toolChecks?.length) {
        sectionsList.push({ section: "Daily Tool Checks", count: records.toolChecks.length });
        total += records.toolChecks.length;
      }
      if (records.grinders?.length) {
        sectionsList.push({ section: "Grinder Logs", count: records.grinders.length });
        total += records.grinders.length;
      }
      if (records.forklifts?.length) {
        sectionsList.push({ section: "Forklift Inspections", count: records.forklifts.length });
        total += records.forklifts.length;
      }
      if (records.scissorLifts?.length) {
        sectionsList.push({ section: "Scissor Lift Inspections", count: records.scissorLifts.length });
        total += records.scissorLifts.length;
      }
      if (records.boomLifts?.length) {
        sectionsList.push({ section: "Boom Lift Inspections", count: records.boomLifts.length });
        total += records.boomLifts.length;
      }
      if (records.ladders?.length) {
        sectionsList.push({ section: "Ladder Inspections", count: records.ladders.length });
        total += records.ladders.length;
      }
      if (records.fallProtections?.length) {
        sectionsList.push({ section: "Fall Protection Logs", count: records.fallProtections.length });
        total += records.fallProtections.length;
      }
      if (records.riskPredictions?.length) {
        sectionsList.push({ section: "Risk Prediction Audits", count: records.riskPredictions.length });
        total += records.riskPredictions.length;
      }

      setEmailProgressStep("Compiling PDF binder...");

      const binderHtmlDocument = buildMasterBinderHtml({
        location: activeLocation,
        startDate,
        endDate,
        compilingManager: currentUserName || "Authorized Safety Lead",
        selectedFormTypes: selectedFormIds,
        jhaSignatureScope,
        records,
      });

      const pdfBlob = await generatePdfBlob(binderHtmlDocument);

      setEmailProgressStep("Dispatching secure PDF via Resend...");

      const formData = new FormData();
      formData.append(
        "pdfFile",
        pdfBlob,
        `IMC-Safety-Binder-${activeLocation.replace(/\s+/g, "_")}-${startDate}-to-${endDate}.pdf`
      );
      formData.append("recipients", JSON.stringify(emailRecipients.split(",").map((e) => e.trim())));
      formData.append("location", activeLocation);
      formData.append("startDate", startDate);
      formData.append("endDate", endDate);
      formData.append("compilingManager", currentUserName || "Authorized Safety Lead");
      formData.append("totalRecords", String(total));
      formData.append("sectionsList", JSON.stringify(sectionsList));
      formData.append("customNote", customEmailNote);

      const res = await fetch("/api/admin/email-binder", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Email failed to send.");

      setFeedback({ message: `Audit PDF attached & dispatched successfully to ${emailRecipients}!`, isError: false });
      setShowEmailTray(false);
      setEmailRecipients("");
      setCustomEmailNote("");
    } catch (err: any) {
      console.error("Email dispatch failed:", err);
      setFeedback({ message: `Dispatch fault: ${err.message || "Failed to dispatch email"}`, isError: true });
    } finally {
      setIsSendingEmail(false);
      setEmailProgressStep("");
    }
  };

  return (
    <div className="border p-4 sm:p-6 rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] space-y-6 shadow-2xl">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[var(--color-brand-border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-none bg-[var(--color-brand-blue,#0088ff)] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-brand-blue,#0088ff)]">
              Official Regulatory Audit Engine
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black uppercase text-white mt-0.5">
            Master Compliance Binder Exporter
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Compile complete multi-day audit dossiers grouped chronologically into a single print or digital dispatch.
          </p>
        </div>

        <div className="px-3 py-1.5 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] text-right">
          <span className="text-[9px] uppercase font-bold text-slate-400 block">JHA Signature Scope</span>
          <span className="text-xs font-black uppercase text-amber-300">
            {jhaSignatureScope === "WINDOW"
              ? "Weekly (Consolidated Window)"
              : jhaSignatureScope === "DAILY"
              ? "Daily Shift Split"
              : "Full Project Life"}
          </span>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 text-xs font-bold uppercase rounded-sm border ${
            feedback.isError
              ? "bg-red-500/10 border-red-500/40 text-red-400"
              : "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
          }`}
        >
          {feedback.isError ? "[ERROR] " : "✓ "} {feedback.message}
        </div>
      )}

      {/* TOP CONFIGURATION: LOCATION & DATE RANGE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Location Selector */}
        <div className="p-3.5 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-300 tracking-wider block">
            1. Select Assigned Worksite / Facility
          </label>
          <select
            value={activeLocation}
            onChange={(e) => setActiveLocation(e.target.value)}
            className="w-full min-h-[40px] px-3 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-white text-xs font-bold uppercase rounded-sm outline-none cursor-pointer focus:border-[var(--color-brand-blue,#0088ff)]"
          >
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc.toUpperCase()}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-slate-500 font-mono block">
            Isolates forms strictly to {activeLocation}.
          </span>
        </div>

        {/* Date Engine & Presets */}
        <div className="p-3.5 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black uppercase text-slate-300 tracking-wider">
              2. Audit Date Window
            </label>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handleSetPreset("TODAY")}
                className="px-2 py-0.5 text-[9px] font-bold uppercase bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] hover:border-white text-slate-300 rounded-xs cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleSetPreset("YESTERDAY")}
                className="px-2 py-0.5 text-[9px] font-bold uppercase bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] hover:border-white text-slate-300 rounded-xs cursor-pointer"
              >
                Yesterday
              </button>
              <button
                type="button"
                onClick={() => handleSetPreset("THIS_WEEK")}
                className="px-2 py-0.5 text-[9px] font-bold uppercase bg-amber-400/20 border border-amber-400 text-amber-300 rounded-xs cursor-pointer"
              >
                This Week
              </button>
              <button
                type="button"
                onClick={() => handleSetPreset("PAST_30")}
                className="px-2 py-0.5 text-[9px] font-bold uppercase bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] hover:border-white text-slate-300 rounded-xs cursor-pointer"
              >
                30 Days
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[9px] font-mono uppercase text-slate-400 block mb-0.5">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full min-h-[38px] px-2 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-white text-xs font-mono rounded-sm outline-none cursor-pointer"
              />
            </div>
            <div>
              <span className="text-[9px] font-mono uppercase text-slate-400 block mb-0.5">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full min-h-[38px] px-2 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-white text-xs font-mono rounded-sm outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* JHA Signature Scope Selection Pills */}
          <div className="pt-2 border-t border-[var(--color-brand-border)] mt-2">
            <span className="text-[9px] font-bold uppercase text-slate-400 block mb-1">
              JHA Signature Compilation Mode:
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setJhaSignatureScope("WINDOW")}
                className={`py-1 text-[10px] font-bold uppercase rounded-xs border cursor-pointer transition-all ${
                  jhaSignatureScope === "WINDOW"
                    ? "bg-amber-400 border-amber-400 text-black font-black"
                    : "bg-[var(--color-brand-card)] border-[var(--color-brand-border)] text-slate-400 hover:text-white"
                }`}
                title="Consolidates all signatures in the selected date window onto a single JHA document"
              >
                Weekly Window
              </button>
              <button
                type="button"
                onClick={() => setJhaSignatureScope("DAILY")}
                className={`py-1 text-[10px] font-bold uppercase rounded-xs border cursor-pointer transition-all ${
                  jhaSignatureScope === "DAILY"
                    ? "bg-amber-400 border-amber-400 text-black font-black"
                    : "bg-[var(--color-brand-card)] border-[var(--color-brand-border)] text-slate-400 hover:text-white"
                }`}
                title="Splits JHAs day by day with only that day's signatures"
              >
                Daily Split
              </button>
              <button
                type="button"
                onClick={() => setJhaSignatureScope("ALL_TIME")}
                className={`py-1 text-[10px] font-bold uppercase rounded-xs border cursor-pointer transition-all ${
                  jhaSignatureScope === "ALL_TIME"
                    ? "bg-amber-400 border-amber-400 text-black font-black"
                    : "bg-[var(--color-brand-card)] border-[var(--color-brand-border)] text-slate-400 hover:text-white"
                }`}
                title="Includes all historical signatures logged for this JHA"
              >
                All-Time
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DOCUMENT SELECTION MATRIX */}
      <div className="space-y-3">
        <div className="flex justify-between items-center border-b border-[var(--color-brand-border)] pb-2">
          <div>
            <span className="text-xs font-black uppercase text-white tracking-wider">
              3. Forms To Include In Binder ({selectedFormIds.length} Selected)
            </span>
            <p className="text-[11px] text-slate-400">
              Only forms checked below will be fetched and printed on the Cover Table of Contents.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-[11px] font-bold uppercase text-[var(--color-brand-blue,#0088ff)] hover:text-white cursor-pointer underline"
          >
            {selectedFormIds.length === AVAILABLE_FORMS.length ? "Deselect All" : "Select All 10 Forms"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(["Personnel & Pre-Task", "Tools & Hot Work", "Powered Access & Rigging"] as const).map(
            (cat) => {
              const formsInCat = AVAILABLE_FORMS.filter((f) => f.category === cat);
              return (
                <div
                  key={cat}
                  className="p-3 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] space-y-2"
                >
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block border-b border-[var(--color-brand-border)] pb-1.5">
                    {cat}
                  </span>
                  <div className="space-y-1.5">
                    {formsInCat.map((form) => {
                      const isChecked = selectedFormIds.includes(form.id);
                      return (
                        <div
                          key={form.id}
                          onClick={() => toggleForm(form.id)}
                          className={`p-2 rounded-sm border cursor-pointer transition-all flex items-center gap-2 ${
                            isChecked
                              ? "bg-[var(--color-brand-blue,#0088ff)]/15 border-[var(--color-brand-blue,#0088ff)] text-white"
                              : "border-[var(--color-brand-border)] hover:border-slate-500 text-slate-400"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-xs border flex items-center justify-center flex-shrink-0 ${
                              isChecked
                                ? "bg-[var(--color-brand-blue,#0088ff)] border-[var(--color-brand-blue,#0088ff)] text-white"
                                : "border-slate-500 bg-transparent"
                            }`}
                          >
                            {isChecked && <span className="text-[10px] font-black">✓</span>}
                          </div>
                          <span className="text-xs font-bold uppercase leading-snug">{form.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* EMAIL DISPATCH INLINE TRAY */}
      {showEmailTray && (
        <div className="p-4 rounded-sm border border-emerald-500/50 bg-emerald-500/5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black uppercase text-emerald-300 tracking-wider">
              ✉ Dispatch Official Compliance Binder PDF
            </span>
            <button
              type="button"
              disabled={isSendingEmail}
              onClick={() => setShowEmailTray(false)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              ✕ Cancel
            </button>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-300 block mb-1">
                Recipient Email(s) — Separate multiple with commas:
              </span>
              <input
                type="text"
                disabled={isSendingEmail}
                value={emailRecipients}
                onChange={(e) => setEmailRecipients(e.target.value)}
                placeholder="safety@nestle.com, manager@interwestmechanical.com"
                className="w-full px-3 py-2 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-white text-xs font-mono rounded-sm outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-300 block mb-1">
                Auditor Direct Note / Dispatch Message:
              </span>
              <textarea
                disabled={isSendingEmail}
                value={customEmailNote}
                onChange={(e) => setCustomEmailNote(e.target.value)}
                placeholder="Attached is the audited safety compliance binder for Line 5 work activities..."
                rows={2}
                className="w-full px-3 py-2 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-white text-xs font-sans rounded-sm outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {emailProgressStep && (
            <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-2 pt-1">
              <span className="animate-spin text-sm">⚙</span>
              <span>{emailProgressStep}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              disabled={isSendingEmail || !emailRecipients.trim()}
              onClick={handleSendEmail}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-white text-black font-black uppercase text-xs rounded-sm cursor-pointer shadow-md disabled:opacity-40"
            >
              {isSendingEmail ? "Generating PDF & Dispatching..." : "Send Audit PDF ➔"}
            </button>
          </div>
        </div>
      )}

      {/* MASTER ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-[var(--color-brand-border)]">
        <span className="text-xs text-slate-400 font-mono">
          Ready to compile {selectedFormIds.length} forms for <strong>{activeLocation}</strong> ({startDate} to {endDate}) with{" "}
          <span className="text-amber-300 font-bold">{jhaSignatureScope}</span> JHA scope.
        </span>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowEmailTray((prev) => !prev)}
            className="w-1/2 sm:w-auto min-h-[44px] px-5 border border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-300 font-black uppercase text-xs rounded-sm cursor-pointer transition-all flex items-center justify-center gap-1.5"
          >
            <span>✉</span>
            <span>Email PDF</span>
          </button>

          <button
            type="button"
            disabled={isLoading || selectedFormIds.length === 0}
            onClick={handlePrintBinder}
            className="w-1/2 sm:w-auto min-h-[44px] px-8 bg-[var(--color-brand-blue,#0088ff)] text-white hover:bg-white hover:text-black font-black uppercase text-xs rounded-sm cursor-pointer transition-all shadow-[0_0_15px_rgba(0,136,255,0.35)] disabled:opacity-40 flex items-center justify-center gap-1.5"
          >
            <span>🖨</span>
            <span>{isLoading ? "Compiling Binder..." : "Print Master Binder ➔"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}