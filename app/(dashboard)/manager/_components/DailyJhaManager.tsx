"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getActiveDailyJhas,
  getArchivedDailyJhas,
  createDailyJha,
  updateDailyJha,
  getJhaAcknowledgments,
  DailyJhaRecord,
  JhaStep,
  JhaStepTemplate,
  JhaAcknowledgmentRecord,
} from "@/lib/db/operations";

interface DailyJhaManagerProps {
  supabase: any;
  currentUserId: string;
  selectedLocation: string;
  locations: string[];
}

// 1. Strictly tracked company certifications
const TRACKED_CERTS = [
  "Scissor Lift",
  "Boom Lift",
  "Forklift",
  "Confined Space",
  "Arc Flash",
];

// 2. Equipment categories with refined toolsets
const EQUIPMENT_CATEGORIES: { category: string; items: string[] }[] = [
  {
    category: "Hand & Power Tools",
    items: [
      "General Hand Tools",
      "Corded Grinder",
      "Battery-Operated Grinder",
      "Chipping Hammer",
      "Pneumatic Chippers",
      "Riveting Tools",
      "Portable Band Saw (Portaband)",
      "Reciprocating Saw (Sawzall)",
      "Skill Saw",
      "Jam Saw",
      "Drills",
      "Impacts",
      "Sanders",
      "Cordless Router",
      "Work Lights",
      "Air Pumps",
    ],
  },
  {
    category: "Shop Tools",
    items: [
      "Mag Drill",
      "Drill Press",
      "Pipe Cutter",
      "Cold Saw",
      "Pipe Threader",
    ],
  },
  {
    category: "Welding, Torch & Soldering",
    items: [
      "Welder",
      "Soldering Torch",
      "Soldering Equipment",
      "Plasma Cutter",
    ],
  },
  {
    category: "Lifting, Rigging & Pipe Staging",
    items: [
      "Pipe Jacks",
      "Bottle Jacks",
      "Chain Falls",
      "Rigging Straps",
    ],
  },
  {
    category: "Access, Site Utility & Heavy Equipment",
    items: [
      "Scissor Lift",
      "Boom Lift",
      "Forklift",
      "Gradall",
      "Cement Mixer",
      "Fall Protection Harnesses",
    ],
  },
];

// 3. Updated permits and field compliance checklists
const COMMON_PERMITS = [
  "Critical Lift Permit",
  "Working at Heights Permit",
  "Mode 4",
  "Ground Disturbance Permit",
  "Hazardous Line Break Permit",
  "Demolition Permit",
  "Hazardous Electrical Work Permit",
  "Hot Work Permit",
  "Confined Space Entry Permit",
  "Risk Prediction Form",
  "Boom Lift Pre-Use Checklist",
  "Scissor Lift Pre-Use Inspection",
  "Daily Forklift Inspection",
  "Ladder Inspection",
  "Hand & Power Tool Inspection",
  "Fall Protection & Harness Inspection",
];

// 4. Updated training requirements without silica or OSHA 10/30
const COMMON_TRAINING = [
  "LOTO Authorized Training",
  "Fall Protection Competent Person",
  "Confined Space Entrant / Attendant",
  "Hot Work & Fire Watch Safety",
  "Rigging & Signaling Qualified",
];

// 5. Self-contained 26-Step Mechanical Catalog
const MASTER_JHA_TEMPLATES: JhaStepTemplate[] = [
  {
    id: "tpl-1",
    category: "Mobilization & Staging",
    step_description: "Tool and gang box transport, unloading, and site staging",
    potential_hazards: "Pedestrian line traffic, slips, trips, forklift cross-traffic, pinch points",
    control_measures: "Spotter during roll-in; verify clear floor path; park carts in designated staging lanes outside fork aisles; wear composite/steel toe boots"
  },
  {
    id: "tpl-2",
    category: "Mobilization & Staging",
    step_description: "Erecting physical barricades and establishing drop / spark zones",
    potential_hazards: "Unauthorized personnel entering line break / hot work perimeter",
    control_measures: "Erect yellow caution or red danger barricade tape 35 ft around perimeter; post warning signage; verify eyewash station access"
  },
  {
    id: "tpl-3",
    category: "Lockout / Tagout (LOTO)",
    step_description: "Verification of mechanical line isolation (Steam, Water, Ammonia, Air)",
    potential_hazards: "Residual stored pressure, scalding water, hazardous chemicals, thermal burns",
    control_measures: "Follow facility energy control procedure; verify double-block-and-bleed; install red safety padlocks and lockout tags; crack bleeder slowly to test zero energy"
  },
  {
    id: "tpl-4",
    category: "Lockout / Tagout (LOTO)",
    step_description: "Electrical zero-energy isolation on pumps, drives, and motors",
    potential_hazards: "Arc flash, electrocution, accidental equipment restart",
    control_measures: "Qualified technician zero-voltage test at motor peckerhead with calibrated meter; lockout local disconnect handle with personal padlock"
  },
  {
    id: "tpl-5",
    category: "Lockout / Tagout (LOTO)",
    step_description: "Pneumatic and hydraulic supply line dump and lock",
    potential_hazards: "Sudden cylinder actuation, trapped hydraulic fluid injection",
    control_measures: "Bleed air regulators to 0 PSI; lock dump valve in exhaust position; block mechanical linkages against gravity fall"
  },
  {
    id: "tpl-6",
    category: "Demolition & Line Breaking",
    step_description: "First break on process pipe flanges and bolt loosening",
    potential_hazards: "Residual chemical wash, pressurized spray, gasket blowout, pinched fingers",
    control_measures: "Wear full face shield over safety glasses, chemical apron, and nitrile over leather; loosen flange bolts furthest away first to create hinged drainage shield"
  },
  {
    id: "tpl-7",
    category: "Demolition & Line Breaking",
    step_description: "Cutting out redundant pipe spools and hangers using band saw or sawzall",
    potential_hazards: "Sparks, blade binding/kickback, sharp metal burrs, pipe spring/deflection",
    control_measures: "Support both sides of cut with jack stands or chain fall; inspect band saw blade tension; de-burr pipe ends immediately; wear cut-level A4+ gloves"
  },
  {
    id: "tpl-8",
    category: "Demolition & Line Breaking",
    step_description: "Torch demolition or plasma cutting of structural pipe supports",
    potential_hazards: "Fire, molten slag drop, torch flashback, fume inhalation",
    control_measures: "Hot work permit signed; 35-ft spark blanket sweep; 10# ABC extinguisher within arm reach; pre-inspect flashback arrestors; 30-min continuous fire watch"
  },
  {
    id: "tpl-9",
    category: "Demolition & Line Breaking",
    step_description: "Cold cutting large-diameter pipe with clamshell / pipe cutter",
    potential_hazards: "Pinch points, rotating cutter gears, heavy tool dropped from height",
    control_measures: "Secure tool tether; keep hands clear of rotating ring gear; verify pipe is chocked and stable"
  },
  {
    id: "tpl-10",
    category: "Rigging & Hoisting",
    step_description: "Rigging and flying pipe spools, valves, and headers with chain fall or crane",
    potential_hazards: "Falling suspended load, sling failure, swing radius pinch points",
    control_measures: "Inspect synthetic web/round slings and shackles before lift; check rated capacity chart; attach tag lines to both ends; strict zero-personnel under load policy"
  },
  {
    id: "tpl-11",
    category: "Rigging & Hoisting",
    step_description: "Rigging with manual lever hoist (come-along) for horizontal alignment",
    potential_hazards: "Hook deflection, mechanical ratchet slip, sudden recoil under tension",
    control_measures: "Never tip-load hook; verify safety latch closure; inspect chain links for elongation or twist; do not use cheater bars on ratchet handles"
  },
  {
    id: "tpl-12",
    category: "Rigging & Hoisting",
    step_description: "Beam clamp installation and trolley rigging on overhead steel",
    potential_hazards: "Clamp slippage, overhead structural overload, dropped hardware",
    control_measures: "Verify beam clamp size matches flange width; tighten set screw to specified torque; attach secondary safety cable to building structural steel"
  },
  {
    id: "tpl-13",
    category: "Working at Heights",
    step_description: "Operating scissor lift for overhead pipe rack fit-up",
    potential_hazards: "Crush against overhead steel, lift tip-over, tools falling into processing lines",
    control_measures: "Pre-use lift inspection; 100% harness & lanyard tie-off to lift anchor point; tool lanyards attached; barricade lower drop zone with red danger tape"
  },
  {
    id: "tpl-14",
    category: "Working at Heights",
    step_description: "Operating articulating boom lift to access exterior utility bridges",
    potential_hazards: "Boom bounce, basket pinch points, ground slope tip hazard",
    control_measures: "Full body harness with 6-ft shock-absorbing lanyard; verify ground stability and outrigger deployment; observe 10-ft clearance from electrical lines"
  },
  {
    id: "tpl-15",
    category: "Working at Heights",
    step_description: "Working from 8ft-12ft fiberglass stepladders",
    potential_hazards: "Ladder slip, overreaching, foot slipping on rungs",
    control_measures: "Maintain 3-point contact; do not stand on top two rungs; fully lock spreader bars; assign ground spotter when working over 8 feet"
  },
  {
    id: "tpl-16",
    category: "Pipefitting & Alignment",
    step_description: "Beveling and facing pipe joints using angle grinders",
    potential_hazards: "Flying abrasive particles, wheel explosion, kickback, high noise",
    control_measures: "Verify grinding disc RPM exceeds tool rating; wheel guard installed and positioned; face shield over safety glasses; leather welding jacket"
  },
  {
    id: "tpl-17",
    category: "Pipefitting & Alignment",
    step_description: "Aligning pipe flanges and fittings using pipe clamps, pins, and wedges",
    potential_hazards: "Heavy pinch points, hammer flying fragments, strain injury",
    control_measures: "Use flange alignment pins; never place fingers inside bolt holes; use brass or dead-blow hammers to prevent spark and shrapnel"
  },
  {
    id: "tpl-18",
    category: "Pipefitting & Alignment",
    step_description: "Drilling structural base plates with magnetic drill press (mag drill)",
    potential_hazards: "Rotating cutter snag, drill motor falling if power is lost, metal chips",
    control_measures: "Attach safety lanyard to mag drill body; verify clean magnetic contact on steel; clear swarf with brush, never bare hands; unplug during cutter changes"
  },
  {
    id: "tpl-19",
    category: "Pipefitting & Alignment",
    step_description: "Threading carbon/galvanized pipe using power pipe threader",
    potential_hazards: "Rotating die entanglement, hot cutting oil splash, sharp spiral shavings",
    control_measures: "Keep foot on emergency foot pedal; no loose clothing, jewelry, or frayed gloves near rotating spindle; catch cutting oil in chip tray"
  },
  {
    id: "tpl-20",
    category: "Welding Operations",
    step_description: "GTAW (TIG) welding on stainless sanitary / utility piping",
    potential_hazards: "Arc eye flash, ergonomic strain, argon purge asphyxiation in enclosed spaces",
    control_measures: "Welding helmet shade 10-12; notify nearby workers; ensure room air circulation during continuous argon purge; wear fire-resistant goat skin gloves"
  },
  {
    id: "tpl-21",
    category: "Welding Operations",
    step_description: "SMAW (Stick) / GMAW (MIG) welding on heavy carbon structural and pipe",
    potential_hazards: "Hot slag spatter, electric shock in damp areas, fire hazards, toxic fumes",
    control_measures: "Inspect stinger lead insulation; dry welding gloves; use portable fume extractor; position spark containment curtains around joint"
  },
  {
    id: "tpl-22",
    category: "Welding Operations",
    step_description: "Back-purging piping with argon or nitrogen gas",
    potential_hazards: "Asphyxiation from displacement of breathable oxygen in high-point traps",
    control_measures: "Vent purge gas outdoors or into well-ventilated areas; verify purge bungs are seated; do not stick head into pipe opening"
  },
  {
    id: "tpl-23",
    category: "Pressure Testing",
    step_description: "Hydrostatic pressure testing of completed piping systems",
    potential_hazards: "Catastrophic rupture, high-pressure liquid jet, gasket blowout",
    control_measures: "Barricade test boundary with warning tape; install certified relief valve set to 110% of test pressure; bleed all air before pressurizing; inspect from safe distance"
  },
  {
    id: "tpl-24",
    category: "Pressure Testing",
    step_description: "Pneumatic leak check with soapy water solution",
    potential_hazards: "Compressed gas explosion risk, flying gauge fragments",
    control_measures: "Never exceed 15 PSI for initial pneumatic soap test; test slowly in small increments; wear full eye and face protection"
  },
  {
    id: "tpl-25",
    category: "Housekeeping & Closeout",
    step_description: "Slag chipping, wire wheeling, and weld pickle/passivation cleanup",
    potential_hazards: "Eye injury, chemical acid burns, respiratory irritation",
    control_measures: "Full face shield; chemical acid gloves (nitrile/butyl) for pickling paste; neutralize wash water; dispose in compliant waste drum"
  },
  {
    id: "tpl-26",
    category: "Housekeeping & Closeout",
    step_description: "End-of-shift cleanup, lead coiling, and lock removal",
    potential_hazards: "Trips, slips, premature line re-energization",
    control_measures: "Coil and store all welding leads and extension cords; sweep metal shavings; remove technician personal LOTO padlocks only after verifying all crew is accounted for"
  }
];

export default function DailyJhaManager({
  supabase,
  currentUserId,
  selectedLocation,
  locations,
}: DailyJhaManagerProps) {
  const [mounted, setMounted] = useState(false);
  const [jhas, setJhas] = useState<DailyJhaRecord[]>([]);
  const [archivedJhas, setArchivedJhas] = useState<DailyJhaRecord[]>([]);
  const [templates, setTemplates] = useState<JhaStepTemplate[]>(MASTER_JHA_TEMPLATES);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isCatalogPickerOpen, setIsCatalogPickerOpen] = useState(false);
  
  // Review & Edit States
  const [selectedJhaForReview, setSelectedJhaForReview] = useState<DailyJhaRecord | null>(null);
  const [activeAcks, setActiveAcks] = useState<JhaAcknowledgmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State (Used for both Create and Edit)
  const [editingJhaId, setEditingJhaId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [jobLocation, setJobLocation] = useState(
    selectedLocation === "ALL" ? "Nestle Springville" : selectedLocation
  );
  const [supervisor, setSupervisor] = useState("");
  const [trainingRequired, setTrainingRequired] = useState<string[]>([]);
  const [equipmentUsed, setEquipmentUsed] = useState<string[]>([]);
  const [permitsRequired, setPermitsRequired] = useState<string[]>([]);
  const [certificationsRequired, setCertificationsRequired] = useState<string[]>([]);
  const [steps, setSteps] = useState<JhaStep[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manual inputs
  const [customTraining, setCustomTraining] = useState("");
  const [customEquipment, setCustomEquipment] = useState("");
  const [customPermit, setCustomPermit] = useState("");
  const [customCert, setCustomCert] = useState("");

  // Catalog Browser Filters
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogCategory, setCatalogCategory] = useState("ALL");
  const [sessionAddedCount, setSessionAddedCount] = useState(0);

  // Archived JHA Search State
  const [archivedSearch, setArchivedSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Background scroll lock when modals are active
  useEffect(() => {
    if (isBuilderOpen || selectedJhaForReview || isCatalogPickerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isBuilderOpen, selectedJhaForReview, isCatalogPickerOpen]);

  const refreshJhas = async () => {
    setIsLoading(true);
    const loc = selectedLocation === "ALL" ? "Nestle Springville" : selectedLocation;
    const [activeRecords, closedRecords] = await Promise.all([
      getActiveDailyJhas(supabase, loc),
      getArchivedDailyJhas(supabase, loc),
    ]);
    setJhas(activeRecords);
    setArchivedJhas(closedRecords);
    setIsLoading(false);
  };

  const loadTemplatesFromDb = async () => {
    try {
      const { data, error } = await supabase
        .from("jha_step_templates")
        .select("*")
        .order("category", { ascending: true });

      if (!error && data && data.length > 0) {
        setTemplates(data as JhaStepTemplate[]);
      }
    } catch (err) {
      console.warn("Retaining static JHA template catalog:", err);
    }
  };

  useEffect(() => {
    loadTemplatesFromDb();
    refreshJhas();
  }, [supabase, selectedLocation]);

  const handleOpenReview = async (jha: DailyJhaRecord) => {
    setSelectedJhaForReview(jha);
    const acks = await getJhaAcknowledgments(supabase, jha.id);
    setActiveAcks(acks);
  };

  const handleStartEdit = (jha: DailyJhaRecord) => {
    setEditingJhaId(jha.id);
    setTitle(jha.title);
    setJobLocation(jha.location);
    setSupervisor(jha.supervisor);
    setTrainingRequired([...jha.training_required]);
    setEquipmentUsed([...jha.equipment_used]);
    setPermitsRequired([...jha.permits_required]);
    setCertificationsRequired([...jha.certifications_required]);
    setSteps([...jha.steps]);
    setSelectedJhaForReview(null);
    setIsBuilderOpen(true);
  };

  const handleStartCreateNew = () => {
    setEditingJhaId(null);
    setTitle("");
    setJobLocation(selectedLocation === "ALL" ? "Nestle Springville" : selectedLocation);
    setSupervisor("");
    setTrainingRequired([]);
    setEquipmentUsed([]);
    setPermitsRequired([]);
    setCertificationsRequired([]);
    setSteps([]);
    setIsBuilderOpen(true);
  };

  // MULTI-SELECT CATALOG INJECTION (DOES NOT CLOSE MODAL)
  const handleSelectTemplateCard = (tpl: JhaStepTemplate) => {
    const newStep: JhaStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      step: tpl.step_description,
      hazards: tpl.potential_hazards,
      controls: tpl.control_measures,
    };
    setSteps((prev) => [...prev, newStep]);
    setSessionAddedCount((prev) => prev + 1);
  };

  const handleAddCustomStep = () => {
    const newStep: JhaStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      step: "",
      hazards: "",
      controls: "",
    };
    setSteps((prev) => [...prev, newStep]);
  };

  // STEP REORDERING HANDLERS
  const handleMoveStepUp = (index: number) => {
    if (index === 0) return;
    setSteps((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
  };

  const handleMoveStepDown = (index: number) => {
    setSteps((prev) => {
      if (index === prev.length - 1) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
  };

  // DUPLICATE STEP HANDLER
  const handleDuplicateStep = (index: number) => {
    setSteps((prev) => {
      const target = prev[index];
      const cloned: JhaStep = {
        id: `step-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        step: target.step,
        hazards: target.hazards,
        controls: target.controls,
      };
      const copy = [...prev];
      copy.splice(index + 1, 0, cloned);
      return copy;
    });
  };

  const handleUpdateStep = (index: number, field: keyof JhaStep, value: string) => {
    setSteps((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveStep = (index: number) => {
    setSteps((prev) => prev.filter((_, idx) => idx !== index));
  };

  const toggleArrayItem = (list: string[], setList: (l: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleAddManualItem = (
    value: string,
    setValue: (v: string) => void,
    list: string[],
    setList: (l: string[]) => void
  ) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (!list.includes(trimmed)) {
      setList([...list, trimmed]);
    }
    setValue("");
  };

  const handleSaveJha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !supervisor.trim()) {
      alert("Please enter both the Job Title and Supervisor name.");
      return;
    }
    if (steps.length === 0) {
      alert("Please add at least one work step to the JHA.");
      return;
    }

    setIsSubmitting(true);

    if (editingJhaId) {
      const res = await updateDailyJha(supabase, editingJhaId, {
        title: title.trim(),
        location: jobLocation,
        supervisor: supervisor.trim(),
        training_required: trainingRequired,
        equipment_used: equipmentUsed,
        permits_required: permitsRequired,
        certifications_required: certificationsRequired,
        steps,
      });

      setIsSubmitting(false);

      if (res.success) {
        setIsBuilderOpen(false);
        setEditingJhaId(null);
        await refreshJhas();
      } else {
        alert(`Error updating JHA: ${res.error}`);
      }
    } else {
      const res = await createDailyJha(
        supabase,
        {
          title: title.trim(),
          location: jobLocation,
          date: new Date().toISOString().split("T")[0],
          supervisor: supervisor.trim(),
          status: "ACTIVE",
          training_required: trainingRequired,
          equipment_used: equipmentUsed,
          permits_required: permitsRequired,
          certifications_required: certificationsRequired,
          steps,
        },
        currentUserId
      );

      setIsSubmitting(false);

      if (res.success) {
        setIsBuilderOpen(false);
        await refreshJhas();
      } else {
        alert(`Error creating JHA: ${res.error}`);
      }
    }
  };

  const handleCloseOutJob = async (jhaId: string) => {
    if (!confirm("Are you sure you want to close out this JHA? This will archive the task.")) return;
    
    const res = await updateDailyJha(supabase, jhaId, { status: "CLOSED" });
    if (res.success) {
      setSelectedJhaForReview(null);
      await refreshJhas();
    } else {
      alert(`Error closing out JHA: ${res.error}`);
    }
  };

  const availableCategories = useMemo(() => {
    const cats = new Set(templates.map((t) => t.category));
    return ["ALL", ...Array.from(cats)];
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      const matchesCat = catalogCategory === "ALL" || tpl.category === catalogCategory;
      const search = catalogSearch.toLowerCase().trim();
      const matchesSearch =
        !search ||
        tpl.step_description.toLowerCase().includes(search) ||
        tpl.potential_hazards.toLowerCase().includes(search) ||
        tpl.control_measures.toLowerCase().includes(search) ||
        tpl.category.toLowerCase().includes(search);

      return matchesCat && matchesSearch;
    });
  }, [templates, catalogCategory, catalogSearch]);

  const filteredArchivedJhas = useMemo(() => {
    const q = archivedSearch.toLowerCase().trim();
    return archivedJhas
      .filter((jha) => !q || jha.title.toLowerCase().includes(q) || jha.supervisor.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [archivedJhas, archivedSearch]);

  const formatDateTime = (dateString: string) => {
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
  };

  const handlePrintJha = (jha: DailyJhaRecord, acks: JhaAcknowledgmentRecord[], mode: "TODAY_ONLY" | "MASTER_HISTORY") => {
    const todayStr = new Date().toISOString().split("T")[0];
    
    const rosterToPrint = mode === "TODAY_ONLY"
      ? acks.filter((a) => {
          const aDate = a.signed_at ? new Date(a.signed_at).toISOString().split("T")[0] : "";
          return aDate === todayStr;
        })
      : acks;

    const reportTitle = mode === "TODAY_ONLY"
      ? "Daily Pre-Task Plan & Shift Attendance"
      : "Complete Job Hazard Analysis (Master Project History)";

    const printDocHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>IMC JHA - ${jha.title}</title>
        <style>
          @page { size: letter portrait; margin: 0.5in; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #111827; background: #fff; margin: 0; padding: 0; font-size: 8.5pt; line-height: 1.35; }
          .header-table { width: 100%; border-bottom: 2.5px solid #0f172a; padding-bottom: 10px; margin-bottom: 12px; }
          .logo { height: 36px; width: auto; }
          .company-title { font-size: 14pt; font-weight: 900; text-transform: uppercase; margin: 0; color: #0f172a; }
          .report-subtitle { font-size: 9.5pt; font-weight: 700; text-transform: uppercase; color: #334155; margin: 2px 0 0 0; }
          .meta-box { font-family: monospace; font-size: 7.5pt; text-align: right; line-height: 1.4; }
          .meta-grid { width: 100%; border-collapse: collapse; margin-bottom: 14px; border: 1px solid #cbd5e1; font-size: 8pt; }
          .meta-grid td { padding: 5px 8px; border: 1px solid #cbd5e1; }
          .meta-label { font-weight: 800; text-transform: uppercase; background-color: #f8fafc; width: 18%; color: #334155; }
          .meta-value { font-weight: 600; width: 32%; }
          .pill { display: inline-block; padding: 1px 6px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 2px; font-size: 7pt; font-weight: 700; margin: 1px 3px 1px 0; text-transform: uppercase; }
          table.jha-table { width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; margin-bottom: 16px; font-size: 8pt; }
          table.jha-table th { background-color: #0f172a; color: #fff; border: 1px solid #0f172a; padding: 6px 8px; text-align: left; font-weight: 800; text-transform: uppercase; font-size: 7.5pt; }
          table.jha-table td { border: 1px solid #cbd5e1; padding: 6px 8px; vertical-align: top; }
          table.jha-table tr:nth-child(even) { background-color: #fafafa; }
          .roster-title { font-size: 8.5pt; font-weight: 900; text-transform: uppercase; margin: 16px 0 6px 0; padding-bottom: 3px; border-bottom: 1.5px solid #0f172a; display: flex; justify-content: space-between; }
          table.roster-table { width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; font-size: 8pt; }
          table.roster-table th { background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 5px 8px; text-align: left; font-weight: 800; text-transform: uppercase; font-size: 7.5pt; }
          table.roster-table td { border: 1px solid #cbd5e1; padding: 4px 8px; }
          .signoff-section { margin-top: 24px; padding-top: 12px; border-top: 1.5px solid #0f172a; page-break-inside: avoid; }
          .attestation { font-size: 7pt; font-family: monospace; color: #475569; text-transform: uppercase; margin-bottom: 16px; line-height: 1.35; }
          .sig-row { display: flex; justify-content: space-between; gap: 20px; }
          .sig-col { flex: 1; }
          .sig-line { border-bottom: 1.5px solid #0f172a; height: 26px; margin-bottom: 4px; }
          .sig-label { font-size: 7.5pt; font-weight: 800; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <table class="header-table" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width: 140px; vertical-align: top;"><img src="/imclogo.svg" alt="IMC Logo" class="logo" /></td>
            <td style="vertical-align: top; padding-left: 12px;">
              <h1 class="company-title">Interwest Mechanical Contractors</h1>
              <div class="report-subtitle">${reportTitle}</div>
              <div style="font-size: 7.5pt; font-family: monospace; font-weight: 700; color: #475569; margin-top: 2px;">
                OSHA 29 CFR 1926.21 & Site Environmental Health & Safety Standard
              </div>
            </td>
            <td class="meta-box" style="vertical-align: top;">
              <div><strong>AUDIT SCOPE:</strong> ${mode === "TODAY_ONLY" ? "DAILY SHIFT ONLY" : "FULL PROJECT HISTORY"}</div>
              <div><strong>WORKSITE:</strong> ${jha.location.toUpperCase()}</div>
              <div><strong>PROJECT STATUS:</strong> ${jha.status}</div>
            </td>
          </tr>
        </table>

        <table class="meta-grid">
          <tr>
            <td class="meta-label">Task / Job Scope:</td>
            <td class="meta-value" style="font-weight: 800; text-transform: uppercase;">${jha.title}</td>
            <td class="meta-label">Designated Supervisor:</td>
            <td class="meta-value">${jha.supervisor}</td>
          </tr>
          <tr>
            <td class="meta-label">Required Training:</td>
            <td class="meta-value">${jha.training_required.map((t) => `<span class="pill">${t}</span>`).join("") || "--"}</td>
            <td class="meta-label">Permits Required:</td>
            <td class="meta-value">${jha.permits_required.map((p) => `<span class="pill">${p}</span>`).join("") || "--"}</td>
          </tr>
          <tr>
            <td class="meta-label">Equipment Used:</td>
            <td class="meta-value">${jha.equipment_used.map((e) => `<span class="pill">${e}</span>`).join("") || "--"}</td>
            <td class="meta-label">Certifications Tracked:</td>
            <td class="meta-value">${jha.certifications_required.map((c) => `<span class="pill">${c}</span>`).join("") || "--"}</td>
          </tr>
        </table>

        <table class="jha-table">
          <thead>
            <tr>
              <th style="width: 6%; text-align: center;">Seq</th>
              <th style="width: 32%;">Work Step Sequence</th>
              <th style="width: 31%;">Potential Hazards</th>
              <th style="width: 31%;">Hazard Control Measures</th>
            </tr>
          </thead>
          <tbody>
            ${jha.steps
              .map(
                (s, idx) => `
              <tr>
                <td style="text-align: center; font-weight: 800; font-family: monospace;">${idx + 1}</td>
                <td style="font-weight: 700;">${s.step}</td>
                <td style="color: #991b1b;">${s.hazards}</td>
                <td style="color: #065f46; font-weight: 600;">${s.controls}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="roster-title">
          <span>${mode === "TODAY_ONLY" ? "Today's Verified Crew Attendance Roster" : "Master Project Signature & Shift History"} (${rosterToPrint.length} Sign-Offs Logged)</span>
          <span>${mode === "TODAY_ONLY" ? `Shift Date: ${todayStr}` : `Initiated: ${jha.date}`}</span>
        </div>
        <table class="roster-table">
          <thead>
            <tr>
              <th style="width: 6%; text-align: center;">#</th>
              <th style="width: 36%;">Employee Legal Name</th>
              <th style="width: 24%;">Assigned Worksite</th>
              <th style="width: 34%; text-align: right;">Verified Date & Time Stamp</th>
            </tr>
          </thead>
          <tbody>
            ${
              rosterToPrint.length > 0
                ? rosterToPrint
                    .map(
                      (a, idx) => `
              <tr>
                <td style="text-align: center; font-family: monospace;">${idx + 1}</td>
                <td style="font-weight: 700; text-transform: uppercase;">${a.employee_name}</td>
                <td style="font-family: monospace; font-size: 7.5pt; text-transform: uppercase;">${a.location}</td>
                <td style="text-align: right; font-family: monospace; font-size: 8pt; font-weight: 700; color: #0f172a;">
                  ${formatDateTime(a.signed_at)}
                </td>
              </tr>
            `
                    )
                    .join("")
                : `<tr><td colspan="4" style="text-align: center; font-family: monospace; padding: 10px;">[ NO CREW SIGN-OFFS RECORDED FOR THIS SCOPE ]</td></tr>`
            }
          </tbody>
        </table>

        <div class="signoff-section">
          <div class="attestation">
            Attestation Statement: All personnel listed above have reviewed and acknowledged the specific hazards, controls, and scope of work identified in this Job Hazard Analysis prior to starting work.
          </div>
          <div class="sig-row">
            <div class="sig-col" style="flex: 2;">
              <div class="sig-line"></div>
              <div class="sig-label">Supervisor / Lead Signature: ${jha.supervisor}</div>
            </div>
            <div class="sig-col">
              <div class="sig-line"></div>
              <div class="sig-label">Execution Date</div>
            </div>
          </div>
        </div>
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
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 400);
  };

  // --- BULK PRINT ENGINE (ALL OPEN/ACTIVE JHAs FOR TODAY) ---
  const handlePrintAllActiveJhas = async () => {
    if (jhas.length === 0) {
      alert("No active JHAs available to print.");
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];

    // Fetch acknowledgments for all open JHAs concurrently
    const jhaReportsData = await Promise.all(
      jhas.map(async (jha) => {
        const acks = await getJhaAcknowledgments(supabase, jha.id);
        const todayAcks = acks.filter((a) => {
          const aDate = a.signed_at ? new Date(a.signed_at).toISOString().split("T")[0] : "";
          return aDate === todayStr;
        });
        return { jha, acks: todayAcks };
      })
    );

    const printDocHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>IMC - Bulk Daily JHA Shift Report (${todayStr})</title>
        <style>
          @page { size: letter portrait; margin: 0.5in; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #111827; background: #fff; margin: 0; padding: 0; font-size: 8.5pt; line-height: 1.35; }
          .page-container { page-break-after: always; padding-bottom: 20px; }
          .page-container:last-child { page-break-after: avoid; }
          .header-table { width: 100%; border-bottom: 2.5px solid #0f172a; padding-bottom: 10px; margin-bottom: 12px; }
          .logo { height: 36px; width: auto; }
          .company-title { font-size: 14pt; font-weight: 900; text-transform: uppercase; margin: 0; color: #0f172a; }
          .report-subtitle { font-size: 9.5pt; font-weight: 700; text-transform: uppercase; color: #334155; margin: 2px 0 0 0; }
          .meta-box { font-family: monospace; font-size: 7.5pt; text-align: right; line-height: 1.4; }
          .meta-grid { width: 100%; border-collapse: collapse; margin-bottom: 14px; border: 1px solid #cbd5e1; font-size: 8pt; }
          .meta-grid td { padding: 5px 8px; border: 1px solid #cbd5e1; }
          .meta-label { font-weight: 800; text-transform: uppercase; background-color: #f8fafc; width: 18%; color: #334155; }
          .meta-value { font-weight: 600; width: 32%; }
          .pill { display: inline-block; padding: 1px 6px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 2px; font-size: 7pt; font-weight: 700; margin: 1px 3px 1px 0; text-transform: uppercase; }
          table.jha-table { width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; margin-bottom: 16px; font-size: 8pt; }
          table.jha-table th { background-color: #0f172a; color: #fff; border: 1px solid #0f172a; padding: 6px 8px; text-align: left; font-weight: 800; text-transform: uppercase; font-size: 7.5pt; }
          table.jha-table td { border: 1px solid #cbd5e1; padding: 6px 8px; vertical-align: top; }
          table.jha-table tr:nth-child(even) { background-color: #fafafa; }
          .roster-title { font-size: 8.5pt; font-weight: 900; text-transform: uppercase; margin: 16px 0 6px 0; padding-bottom: 3px; border-bottom: 1.5px solid #0f172a; display: flex; justify-content: space-between; }
          table.roster-table { width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; font-size: 8pt; }
          table.roster-table th { background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 5px 8px; text-align: left; font-weight: 800; text-transform: uppercase; font-size: 7.5pt; }
          table.roster-table td { border: 1px solid #cbd5e1; padding: 4px 8px; }
          .signoff-section { margin-top: 24px; padding-top: 12px; border-top: 1.5px solid #0f172a; page-break-inside: avoid; }
          .attestation { font-size: 7pt; font-family: monospace; color: #475569; text-transform: uppercase; margin-bottom: 16px; line-height: 1.35; }
          .sig-row { display: flex; justify-content: space-between; gap: 20px; }
          .sig-col { flex: 1; }
          .sig-line { border-bottom: 1.5px solid #0f172a; height: 26px; margin-bottom: 4px; }
          .sig-label { font-size: 7.5pt; font-weight: 800; text-transform: uppercase; }
        </style>
      </head>
      <body>
        ${jhaReportsData
          .map(
            ({ jha, acks }) => `
          <div class="page-container">
            <table class="header-table" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width: 140px; vertical-align: top;"><img src="/imclogo.svg" alt="IMC Logo" class="logo" /></td>
                <td style="vertical-align: top; padding-left: 12px;">
                  <h1 class="company-title">Interwest Mechanical Contractors</h1>
                  <div class="report-subtitle">Daily Pre-Task Plan & Shift Attendance</div>
                  <div style="font-size: 7.5pt; font-family: monospace; font-weight: 700; color: #475569; margin-top: 2px;">
                    OSHA 29 CFR 1926.21 & Site Environmental Health & Safety Standard
                  </div>
                </td>
                <td class="meta-box" style="vertical-align: top;">
                  <div><strong>SHIFT DATE:</strong> ${todayStr}</div>
                  <div><strong>WORKSITE:</strong> ${jha.location.toUpperCase()}</div>
                  <div><strong>STATUS:</strong> ${jha.status}</div>
                </td>
              </tr>
            </table>

            <table class="meta-grid">
              <tr>
                <td class="meta-label">Task / Job Scope:</td>
                <td class="meta-value" style="font-weight: 800; text-transform: uppercase;">${jha.title}</td>
                <td class="meta-label">Designated Supervisor:</td>
                <td class="meta-value">${jha.supervisor}</td>
              </tr>
              <tr>
                <td class="meta-label">Required Training:</td>
                <td class="meta-value">${jha.training_required.map((t: string) => `<span class="pill">${t}</span>`).join("") || "--"}</td>
                <td class="meta-label">Permits Required:</td>
                <td class="meta-value">${jha.permits_required.map((p: string) => `<span class="pill">${p}</span>`).join("") || "--"}</td>
              </tr>
              <tr>
                <td class="meta-label">Equipment Used:</td>
                <td class="meta-value">${jha.equipment_used.map((e: string) => `<span class="pill">${e}</span>`).join("") || "--"}</td>
                <td class="meta-label">Certifications:</td>
                <td class="meta-value">${jha.certifications_required.map((c: string) => `<span class="pill">${c}</span>`).join("") || "--"}</td>
              </tr>
            </table>

            <table class="jha-table">
              <thead>
                <tr>
                  <th style="width: 6%; text-align: center;">Seq</th>
                  <th style="width: 32%;">Work Step Sequence</th>
                  <th style="width: 31%;">Potential Hazards</th>
                  <th style="width: 31%;">Hazard Control Measures</th>
                </tr>
              </thead>
              <tbody>
                ${jha.steps
                  .map(
                    (s: any, idx: number) => `
                  <tr>
                    <td style="text-align: center; font-weight: 800; font-family: monospace;">${idx + 1}</td>
                    <td style="font-weight: 700;">${s.step}</td>
                    <td style="color: #991b1b;">${s.hazards}</td>
                    <td style="color: #065f46; font-weight: 600;">${s.controls}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>

            <div class="roster-title">
              <span>Today's Verified Crew Attendance Roster (${acks.length} Sign-Offs Logged)</span>
              <span>Shift Date: ${todayStr}</span>
            </div>
            <table class="roster-table">
              <thead>
                <tr>
                  <th style="width: 6%; text-align: center;">#</th>
                  <th style="width: 36%;">Employee Legal Name</th>
                  <th style="width: 24%;">Assigned Worksite</th>
                  <th style="width: 34%; text-align: right;">Verified Date & Time Stamp</th>
                </tr>
              </thead>
              <tbody>
                ${
                  acks.length > 0
                    ? acks
                        .map(
                          (a: any, idx: number) => `
                  <tr>
                    <td style="text-align: center; font-family: monospace;">${idx + 1}</td>
                    <td style="font-weight: 700; text-transform: uppercase;">${a.employee_name}</td>
                    <td style="font-family: monospace; font-size: 7.5pt; text-transform: uppercase;">${a.location}</td>
                    <td style="text-align: right; font-family: monospace; font-size: 8pt; font-weight: 700; color: #0f172a;">
                      ${formatDateTime(a.signed_at)}
                    </td>
                  </tr>
                `
                        )
                        .join("")
                    : `<tr><td colspan="4" style="text-align: center; font-family: monospace; padding: 10px;">[ NO CREW SIGN-OFFS RECORDED TODAY FOR THIS SCOPE ]</td></tr>`
                }
              </tbody>
            </table>

            <div class="signoff-section">
              <div class="attestation">
                Attestation Statement: All personnel listed above have reviewed and acknowledged the specific hazards, controls, and scope of work identified in this Job Hazard Analysis prior to starting work.
              </div>
              <div class="sig-row">
                <div class="sig-col" style="flex: 2;">
                  <div class="sig-line"></div>
                  <div class="sig-label">Supervisor / Lead Signature: ${jha.supervisor}</div>
                </div>
                <div class="sig-col">
                  <div class="sig-line"></div>
                  <div class="sig-label">Execution Date</div>
                </div>
              </div>
            </div>
          </div>
        `
          )
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
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 600);
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-mono text-slate-100 select-none pb-8">
      {/* HEADER CARD */}
      <div className="border p-4 sm:p-6 rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-none bg-[var(--color-brand-blue)] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand-blue)]">
              Task Pre-Planning & Risk Control
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black uppercase text-slate-100 mt-1">
            Job Hazard Analysis (JHA) Console
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-0.5">
            Site: <span className="text-white">{selectedLocation}</span> • Ongoing Pre-Task Plans & Master Ledgers
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartCreateNew}
          className="w-full md:w-auto min-h-[44px] px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-[var(--color-brand-blue)] text-white hover:bg-white hover:text-black rounded-sm transition-all cursor-pointer shadow-[0_0_15px_rgba(0,136,255,0.25)] active:scale-[0.98]"
        >
          + Create Daily JHA
        </button>
      </div>

      {/* ACTIVE JHAS LIST */}
      <div className="border rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] p-4 sm:p-6">
        <div className="flex justify-between items-center border-b border-[var(--color-brand-border)] pb-3 mb-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">
            Open Tasks & JHAs ({jhas.length})
          </h3>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrintAllActiveJhas}
              disabled={jhas.length === 0}
              className="text-[11px] font-black uppercase bg-[var(--color-brand-blue)] text-white hover:bg-white hover:text-black px-3 py-1.5 rounded-sm transition-all cursor-pointer disabled:opacity-40"
            >
              ⎙ Print All Today&apos;s JHAs
            </button>
            <button
              type="button"
              onClick={refreshJhas}
              className="text-[11px] font-bold uppercase text-[var(--color-brand-blue)] hover:text-white cursor-pointer"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
            Loading JHA records...
          </div>
        ) : jhas.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-[var(--color-brand-border)] rounded-sm text-slate-500 text-xs font-bold uppercase tracking-widest">
            [ No active JHAs created for this location ]
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {jhas.map((jha) => (
              <div
                key={jha.id}
                onClick={() => handleOpenReview(jha)}
                className="p-4 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] hover:border-[var(--color-brand-blue)] cursor-pointer transition-all space-y-3"
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-sm bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-[var(--color-brand-blue)]">
                    {jha.location}
                  </span>
                  <span className={`text-[10px] font-mono font-bold uppercase ${
                    jha.status === "ACTIVE" ? "text-emerald-400" : "text-slate-500"
                  }`}>
                    {jha.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-black uppercase text-white line-clamp-2">
                    {jha.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">
                    Supervisor: <strong className="text-slate-200">{jha.supervisor}</strong>
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--color-brand-border)] flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-bold">
                    {jha.steps.length} Steps Sequence
                  </span>
                  <span className="text-[var(--color-brand-blue)] font-bold uppercase">
                    Inspect & Print ↗
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. ARCHIVED & CLOSED JHA HISTORY SECTION */}
      <div className="border rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[var(--color-brand-border)] pb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2">
              <span>📁</span>
              <span>Archived & Closed JHA History ({filteredArchivedJhas.length})</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5 uppercase">
              Completed and archived safety task documents ordered by newest first.
            </p>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              value={archivedSearch}
              onChange={(e) => setArchivedSearch(e.target.value)}
              placeholder="Search past job name / lead..."
              className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] px-3 py-1.5 text-xs text-slate-100 uppercase rounded-sm outline-none"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
            Loading archived history...
          </div>
        ) : filteredArchivedJhas.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-[var(--color-brand-border)] rounded-sm text-slate-500 text-xs font-bold uppercase tracking-widest">
            [ {archivedSearch ? "No closed JHAs match your search query" : "No closed JHAs archived for this location yet"} ]
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredArchivedJhas.map((jha) => (
              <div
                key={jha.id}
                onClick={() => handleOpenReview(jha)}
                className="p-4 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] hover:border-slate-500 cursor-pointer transition-all space-y-3 opacity-90 hover:opacity-100"
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[10px] font-mono text-slate-400">
                    Initiated: {jha.date}
                  </span>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-sm bg-slate-800 text-slate-300 border border-slate-700">
                    CLOSED
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold uppercase text-slate-200 line-clamp-2">
                    {jha.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">
                    Supervisor: <strong className="text-slate-300">{jha.supervisor}</strong>
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--color-brand-border)]/60 flex justify-between items-center text-[10px] text-slate-400">
                  <span>{jha.steps.length} Steps</span>
                  <span className="text-[var(--color-brand-blue)] font-bold uppercase">
                    View Audit Report ↗
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PORTAL MODALS */}
      {mounted &&
        createPortal(
          <>
            {/* MODAL 1: JHA BUILDER / EDITOR */}
            <AnimatePresence>
              {isBuilderOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md font-mono text-slate-100 select-none">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="w-full max-w-5xl h-[94vh] max-h-[94vh] flex flex-col border shadow-2xl rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] overflow-hidden relative"
                  >
                    {/* Header */}
                    <div className="p-4 sm:p-5 border-b border-[var(--color-brand-border)] flex justify-between items-center bg-[var(--color-brand-bg)] shrink-0">
                      <h3 className="text-xs sm:text-sm font-black uppercase text-slate-100 flex items-center gap-2">
                        <span className="w-2 h-2 bg-[var(--color-brand-blue)] animate-pulse" />
                        {editingJhaId ? "Edit Job Hazard Analysis (JHA)" : "Assemble Daily Job Hazard Analysis (JHA)"}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsBuilderOpen(false)}
                        className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Scrollable Form Body */}
                    <form
                      onSubmit={handleSaveJha}
                      className="flex-1 flex flex-col min-h-0 overflow-hidden"
                    >
                      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar text-xs">
                        {/* Basic Metadata */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Job Scope / Description
                            </label>
                            <input
                              type="text"
                              required
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              placeholder="e.g., Line 4 Steam Header Replacement & Valve Install"
                              className="w-full min-h-[42px] px-3 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] text-slate-100 rounded-sm outline-none font-bold text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Designated Worksite
                            </label>
                            <select
                              value={jobLocation}
                              onChange={(e) => setJobLocation(e.target.value)}
                              className="w-full min-h-[42px] px-3 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] text-slate-100 rounded-sm outline-none cursor-pointer text-xs"
                            >
                              {locations.map((loc) => (
                                <option key={loc} value={loc} className="bg-[var(--color-brand-card)]">
                                  {loc}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Supervisor / Designated Lead
                          </label>
                          <input
                            type="text"
                            required
                            value={supervisor}
                            onChange={(e) => setSupervisor(e.target.value)}
                            placeholder="e.g., John Miller (Lead Pipefitter)"
                            className="w-full min-h-[42px] px-3 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] text-slate-100 rounded-sm outline-none text-xs"
                          />
                        </div>

                        {/* Tracked Certifications & Permits */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          {/* Tracked Certifications Only */}
                          <div className="space-y-2 p-3 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)]">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                                Certifications Required (Tracked On Site)
                              </span>
                              <span className="text-[9px] text-[var(--color-brand-blue)] font-bold">
                                {certificationsRequired.length} Selected
                              </span>
                            </div>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={customCert}
                                onChange={(e) => setCustomCert(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddManualItem(customCert, setCustomCert, certificationsRequired, setCertificationsRequired);
                                  }
                                }}
                                placeholder="Type manual certification..."
                                className="flex-1 min-h-[34px] px-2.5 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-slate-100 rounded-sm outline-none text-[11px]"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddManualItem(customCert, setCustomCert, certificationsRequired, setCertificationsRequired)}
                                className="px-3 min-h-[34px] bg-[var(--color-brand-blue)] text-white font-bold rounded-sm text-[10px] uppercase hover:bg-white hover:text-black cursor-pointer"
                              >
                                + Add
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {TRACKED_CERTS.map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => toggleArrayItem(certificationsRequired, setCertificationsRequired, c)}
                                  className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-sm border cursor-pointer ${
                                    certificationsRequired.includes(c)
                                      ? "bg-[var(--color-brand-blue)] border-[var(--color-brand-blue)] text-white"
                                      : "bg-[var(--color-brand-card)] border-[var(--color-brand-border)] text-slate-400"
                                  }`}
                                >
                                  {c}
                                </button>
                              ))}
                              {certificationsRequired
                                .filter((item) => !TRACKED_CERTS.includes(item))
                                .map((custom) => (
                                  <span
                                    key={custom}
                                    onClick={() => toggleArrayItem(certificationsRequired, setCertificationsRequired, custom)}
                                    className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm border bg-emerald-500/20 border-emerald-500/50 text-emerald-300 cursor-pointer"
                                  >
                                    {custom} ✕
                                  </span>
                                ))}
                            </div>
                          </div>

                          {/* Permits Required */}
                          <div className="space-y-2 p-3 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)]">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                              Permits Required ({permitsRequired.length})
                            </span>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={customPermit}
                                onChange={(e) => setCustomPermit(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddManualItem(customPermit, setCustomPermit, permitsRequired, setPermitsRequired);
                                  }
                                }}
                                placeholder="Type manual permit name..."
                                className="flex-1 min-h-[34px] px-2.5 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-slate-100 rounded-sm outline-none text-[11px]"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddManualItem(customPermit, setCustomPermit, permitsRequired, setPermitsRequired)}
                                className="px-3 min-h-[34px] bg-[var(--color-brand-blue)] text-white font-bold rounded-sm text-[10px] uppercase hover:bg-white hover:text-black cursor-pointer"
                              >
                                + Add
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {COMMON_PERMITS.map((p) => (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => toggleArrayItem(permitsRequired, setPermitsRequired, p)}
                                  className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm border cursor-pointer ${
                                    permitsRequired.includes(p)
                                      ? "bg-[var(--color-brand-blue)] border-[var(--color-brand-blue)] text-white"
                                      : "bg-[var(--color-brand-card)] border-[var(--color-brand-border)] text-slate-400"
                                  }`}
                                >
                                  {p}
                                </button>
                              ))}
                              {permitsRequired
                                .filter((item) => !COMMON_PERMITS.includes(item))
                                .map((custom) => (
                                  <span
                                    key={custom}
                                    onClick={() => toggleArrayItem(permitsRequired, setPermitsRequired, custom)}
                                    className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm border bg-emerald-500/20 border-emerald-500/50 text-emerald-300 cursor-pointer"
                                  >
                                    {custom} ✕
                                  </span>
                                ))}
                            </div>
                          </div>
                        </div>

                        {/* Training Required */}
                        <div className="space-y-2 p-3 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                            Training Required ({trainingRequired.length})
                          </span>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={customTraining}
                              onChange={(e) => setCustomTraining(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddManualItem(customTraining, setCustomTraining, trainingRequired, setTrainingRequired);
                                }
                              }}
                              placeholder="Type custom training or protocol..."
                              className="flex-1 min-h-[34px] px-2.5 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-slate-100 rounded-sm outline-none text-[11px]"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddManualItem(customTraining, setCustomTraining, trainingRequired, setTrainingRequired)}
                              className="px-3 min-h-[34px] bg-[var(--color-brand-blue)] text-white font-bold rounded-sm text-[10px] uppercase hover:bg-white hover:text-black cursor-pointer"
                            >
                              + Add
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {COMMON_TRAINING.map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => toggleArrayItem(trainingRequired, setTrainingRequired, t)}
                                className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-sm border cursor-pointer ${
                                  trainingRequired.includes(t)
                                    ? "bg-[var(--color-brand-blue)] border-[var(--color-brand-blue)] text-white"
                                    : "bg-[var(--color-brand-card)] border-[var(--color-brand-border)] text-slate-400"
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                            {trainingRequired
                              .filter((item) => !COMMON_TRAINING.includes(item))
                              .map((custom) => (
                                <span
                                  key={custom}
                                  onClick={() => toggleArrayItem(trainingRequired, setTrainingRequired, custom)}
                                  className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm border bg-emerald-500/20 border-emerald-500/50 text-emerald-300 cursor-pointer"
                                >
                                  {custom} ✕
                                </span>
                              ))}
                          </div>
                        </div>

                        {/* Equipment Categories */}
                        <div className="space-y-3 p-3.5 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)]">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 border-b border-[var(--color-brand-border)] pb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                              Equipment, Tools & Machinery Being Used ({equipmentUsed.length} Selected)
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Click tools to toggle on/off or type custom items below
                            </span>
                          </div>

                          {/* Manual Tool Input */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={customEquipment}
                              onChange={(e) => setCustomEquipment(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddManualItem(customEquipment, setCustomEquipment, equipmentUsed, setEquipmentUsed);
                                }
                              }}
                              placeholder="Type custom equipment or tool name..."
                              className="flex-1 min-h-[34px] px-2.5 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-slate-100 rounded-sm outline-none text-[11px]"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddManualItem(customEquipment, setCustomEquipment, equipmentUsed, setEquipmentUsed)}
                              className="px-3 min-h-[34px] bg-[var(--color-brand-blue)] text-white font-bold rounded-sm text-[10px] uppercase hover:bg-white hover:text-black cursor-pointer"
                            >
                              + Add Custom Tool
                            </button>
                          </div>

                          {/* Custom Added Badges */}
                          {equipmentUsed.filter((item) => !EQUIPMENT_CATEGORIES.some((c) => c.items.includes(item))).length > 0 && (
                            <div className="flex flex-wrap gap-1.5 p-2 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] rounded-sm">
                              <span className="text-[9px] uppercase font-bold text-slate-400 mr-1 self-center">
                                Custom Added:
                              </span>
                              {equipmentUsed
                                .filter((item) => !EQUIPMENT_CATEGORIES.some((c) => c.items.includes(item)))
                                .map((custom) => (
                                  <span
                                    key={custom}
                                    onClick={() => toggleArrayItem(equipmentUsed, setEquipmentUsed, custom)}
                                    className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm border bg-emerald-500/20 border-emerald-500/50 text-emerald-300 cursor-pointer"
                                  >
                                    {custom} ✕
                                  </span>
                                ))}
                            </div>
                          )}

                          {/* Categorized Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            {EQUIPMENT_CATEGORIES.map((cat) => (
                              <div
                                key={cat.category}
                                className="p-2.5 border rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] space-y-1.5"
                              >
                                <span className="text-[10px] font-black uppercase text-[var(--color-brand-blue)] tracking-wider block">
                                  {cat.category}
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {cat.items.map((tool) => (
                                    <button
                                      key={tool}
                                      type="button"
                                      onClick={() => toggleArrayItem(equipmentUsed, setEquipmentUsed, tool)}
                                      className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm border transition-all cursor-pointer ${
                                        equipmentUsed.includes(tool)
                                          ? "bg-[var(--color-brand-blue)] border-[var(--color-brand-blue)] text-white font-black"
                                          : "bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] text-slate-400 hover:text-white"
                                      }`}
                                    >
                                      {tool}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Work Steps Builder */}
                        <div className="pt-4 border-t border-[var(--color-brand-border)] space-y-3">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                                Work Steps, Potential Hazards & Controls ({steps.length})
                              </h4>
                              <p className="text-[10px] text-slate-400">
                                Reorder steps, duplicate rows, or browse catalog sequences.
                              </p>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <button
                                type="button"
                                onClick={() => {
                                  setSessionAddedCount(0);
                                  setIsCatalogPickerOpen(true);
                                }}
                                className="min-h-[38px] px-3.5 bg-[var(--color-brand-blue)] text-white text-xs font-black uppercase rounded-sm hover:bg-white hover:text-black cursor-pointer shadow-md transition-all flex items-center gap-1.5"
                              >
                                <span>📚</span>
                                <span>Browse Step Catalog ({templates.length})</span>
                              </button>

                              <button
                                type="button"
                                onClick={handleAddCustomStep}
                                className="min-h-[38px] px-3 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] hover:border-white text-white text-xs font-bold uppercase rounded-sm cursor-pointer whitespace-nowrap"
                              >
                                + Empty Step
                              </button>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {steps.length === 0 ? (
                              <div className="p-6 border border-dashed border-[var(--color-brand-border)] rounded-sm text-center text-slate-500 font-bold uppercase text-[11px]">
                                [ No Steps Added. Click &quot;Browse Step Catalog&quot; Above To Insert Pre-Built Industrial Tasks ]
                              </div>
                            ) : (
                              steps.map((st, idx) => (
                                <div
                                  key={st.id}
                                  className="p-3 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] space-y-2 relative"
                                >
                                  {/* Step Action Header with Reorder Arrows */}
                                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-white font-black">#{idx + 1}</span>
                                      <div className="flex items-center gap-0.5 ml-2 border border-[var(--color-brand-border)] rounded-sm bg-[var(--color-brand-card)]">
                                        <button
                                          type="button"
                                          disabled={idx === 0}
                                          onClick={() => handleMoveStepUp(idx)}
                                          className="px-2 py-0.5 hover:bg-white/10 text-slate-300 disabled:opacity-30 cursor-pointer"
                                          title="Move Step Up"
                                        >
                                          ▲
                                        </button>
                                        <span className="w-px h-3 bg-[var(--color-brand-border)]" />
                                        <button
                                          type="button"
                                          disabled={idx === steps.length - 1}
                                          onClick={() => handleMoveStepDown(idx)}
                                          className="px-2 py-0.5 hover:bg-white/10 text-slate-300 disabled:opacity-30 cursor-pointer"
                                          title="Move Step Down"
                                        >
                                          ▼
                                        </button>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <button
                                        type="button"
                                        onClick={() => handleDuplicateStep(idx)}
                                        className="text-cyan-400 hover:text-white cursor-pointer"
                                        title="Duplicate Step"
                                      >
                                        📋 Duplicate
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveStep(idx)}
                                        className="text-red-400 hover:text-white cursor-pointer"
                                      >
                                        Remove ✕
                                      </button>
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                                      Work Sequence / Description
                                    </label>
                                    <input
                                      type="text"
                                      required
                                      value={st.step}
                                      onChange={(e) => handleUpdateStep(idx, "step", e.target.value)}
                                      placeholder="e.g., Unbolt pipe flange using pneumatic impact and backup wrench"
                                      className="w-full p-2 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-slate-100 rounded-sm outline-none font-bold text-xs"
                                    />
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                      <label className="text-[9px] uppercase tracking-wider text-red-400 font-bold block">
                                        Potential Hazards
                                      </label>
                                      <textarea
                                        rows={2}
                                        required
                                        value={st.hazards}
                                        onChange={(e) => handleUpdateStep(idx, "hazards", e.target.value)}
                                        placeholder="e.g., Pinch points, sudden pressure release, hot steam residue..."
                                        className="w-full p-2 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-slate-200 rounded-sm outline-none resize-none text-[11px]"
                                      />
                                    </div>

                                    <div className="space-y-1">
                                      <label className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold block">
                                        Hazard Control Measures
                                      </label>
                                      <textarea
                                        rows={2}
                                        required
                                        value={st.controls}
                                        onChange={(e) => handleUpdateStep(idx, "controls", e.target.value)}
                                        placeholder="e.g., 100% LOTO verification, loosen far bolts first, leather gloves..."
                                        className="w-full p-2 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-slate-200 rounded-sm outline-none resize-none text-[11px]"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Always Visible Pinned Modal Action Footer */}
                      <div className="p-3.5 sm:p-4 border-t border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] flex justify-end gap-2.5 shrink-0 sticky bottom-0 z-20 shadow-2xl">
                        <button
                          type="button"
                          onClick={() => setIsBuilderOpen(false)}
                          className="min-h-[44px] px-6 border border-[var(--color-brand-border)] text-slate-400 hover:text-white rounded-sm font-bold uppercase text-xs cursor-pointer transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="min-h-[44px] px-8 bg-[var(--color-brand-blue)] text-white hover:bg-white hover:text-black rounded-sm font-black uppercase text-xs cursor-pointer transition-all disabled:opacity-50 shadow-lg active:scale-[0.98]"
                        >
                          {isSubmitting ? "Saving..." : editingJhaId ? "Save JHA Changes ↗" : "Publish Active JHA ↗"}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* MODAL 2: PERSISTENT MULTI-SELECT JHA STEP CATALOG BROWSER */}
            <AnimatePresence>
              {isCatalogPickerOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md font-mono text-slate-100 select-none">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    className="w-full max-w-4xl h-[88vh] max-h-[88vh] flex flex-col border shadow-2xl rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] overflow-hidden"
                  >
                    {/* Header */}
                    <div className="p-4 border-b border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] flex justify-between items-center shrink-0">
                      <div>
                        <span className="text-[10px] font-black uppercase text-[var(--color-brand-blue)] tracking-wider">
                          Standard Operating Tasks • Catalog Library
                        </span>
                        <h3 className="text-sm font-black uppercase text-white mt-0.5">
                          Multi-Select Tasks (Added This Session: {sessionAddedCount})
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCatalogPickerOpen(false)}
                        className="min-h-[38px] min-w-[38px] flex items-center justify-center text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Filter and Search Bar */}
                    <div className="p-3 border-b border-[var(--color-brand-border)] bg-[var(--color-brand-card)] shrink-0 space-y-2.5">
                      <input
                        type="text"
                        value={catalogSearch}
                        onChange={(e) => setCatalogSearch(e.target.value)}
                        placeholder="SEARCH TASKS (e.g., LOTO, FLANGE, WELD, HOIST, RIGGING)..."
                        className="w-full min-h-[40px] px-3 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] text-slate-100 uppercase rounded-sm text-xs font-bold outline-none"
                      />

                      {/* Category Pill Filters */}
                      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                        {availableCategories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setCatalogCategory(cat)}
                            className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-sm whitespace-nowrap border cursor-pointer ${
                              catalogCategory === cat
                                ? "bg-[var(--color-brand-blue)] border-[var(--color-brand-blue)] text-white font-black"
                                : "bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] text-slate-400 hover:text-white"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Rich Step Cards Grid (Stays open after clicking) */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar bg-[var(--color-brand-bg)]">
                      {filteredTemplates.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 font-bold uppercase text-xs border border-dashed border-[var(--color-brand-border)]">
                          [ No catalog tasks match your search filter ]
                        </div>
                      ) : (
                        filteredTemplates.map((tpl) => (
                          <div
                            key={tpl.id}
                            onClick={() => handleSelectTemplateCard(tpl)}
                            className="p-3.5 border rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] hover:border-[var(--color-brand-blue)] hover:bg-[var(--color-brand-card)]/90 cursor-pointer transition-all space-y-2 group"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-sm bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] text-[var(--color-brand-blue)]">
                                {tpl.category}
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-blue)] group-hover:underline">
                                + Inject Step (Stays Open) ↗
                              </span>
                            </div>

                            <p className="text-xs font-black uppercase text-white leading-snug">
                              {tpl.step_description}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                              <div className="p-2 bg-[var(--color-brand-bg)] rounded-sm border border-red-500/20">
                                <span className="text-[9px] font-bold uppercase text-red-400 block mb-0.5">
                                  Potential Hazards:
                                </span>
                                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                                  {tpl.potential_hazards}
                                </p>
                              </div>

                              <div className="p-2 bg-[var(--color-brand-bg)] rounded-sm border border-emerald-500/20">
                                <span className="text-[9px] font-bold uppercase text-emerald-400 block mb-0.5">
                                  Control Measures:
                                </span>
                                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                                  {tpl.control_measures}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Persistent Footer with Done Button */}
                    <div className="p-3 border-t border-[var(--color-brand-border)] bg-[var(--color-brand-card)] flex justify-between items-center shrink-0">
                      <span className="text-xs font-bold text-slate-400 uppercase">
                        {sessionAddedCount} task{sessionAddedCount === 1 ? "" : "s"} added to current JHA draft.
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsCatalogPickerOpen(false)}
                        className="px-6 py-2.5 text-xs font-black uppercase bg-[var(--color-brand-blue)] text-white hover:bg-white hover:text-black rounded-sm cursor-pointer shadow-md"
                      >
                        Done Adding Steps ✓
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* MODAL 3: FULL DIGITAL DOCUMENT REVIEW & DUAL PRINT ACTION */}
            <AnimatePresence>
              {selectedJhaForReview && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md font-mono text-slate-100 select-none">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="w-full max-w-5xl h-[94vh] max-h-[94vh] flex flex-col border shadow-2xl rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] overflow-hidden"
                  >
                    {/* Header Bar */}
                    <div className="p-4 sm:p-5 border-b border-[var(--color-brand-border)] flex justify-between items-start bg-[var(--color-brand-bg)] shrink-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 ${selectedJhaForReview.status === "ACTIVE" ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                          <span className="text-[10px] font-black uppercase text-[var(--color-brand-blue)] tracking-wider">
                            {selectedJhaForReview.location} • Job Hazard Analysis Document [{selectedJhaForReview.status}]
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-lg font-black uppercase text-white mt-1">
                          {selectedJhaForReview.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Assigned Lead / Supervisor: <strong className="text-slate-100">{selectedJhaForReview.supervisor}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {selectedJhaForReview.status === "ACTIVE" && (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(selectedJhaForReview)}
                            className="min-h-[36px] px-3.5 bg-[var(--color-brand-blue)] hover:bg-white hover:text-black text-white rounded-sm font-bold uppercase text-[11px] transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                          >
                            <span>✎</span>
                            <span>Edit JHA</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedJhaForReview(null)}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Scrollable Document Body */}
                    <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar text-xs">
                      {/* Document Overview Metadata Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] rounded-sm">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Required Training:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {selectedJhaForReview.training_required.length > 0 ? (
                              selectedJhaForReview.training_required.map((t, idx) => (
                                <span key={idx} className="px-2 py-0.5 text-[9px] font-bold uppercase bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-slate-200 rounded-sm">
                                  {t}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-slate-500 font-mono">-- Standard Craft Training --</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Permits Required:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {selectedJhaForReview.permits_required.length > 0 ? (
                              selectedJhaForReview.permits_required.map((p, idx) => (
                                <span key={idx} className="px-2 py-0.5 text-[9px] font-bold uppercase bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-amber-400 rounded-sm">
                                  {p}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-slate-500 font-mono">-- Standard Operations --</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Equipment & Machinery Assigned:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {selectedJhaForReview.equipment_used.length > 0 ? (
                              selectedJhaForReview.equipment_used.map((e, idx) => (
                                <span key={idx} className="px-2 py-0.5 text-[9px] font-bold uppercase bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-slate-300 rounded-sm">
                                  {e}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-slate-500 font-mono">-- Hand Tools --</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Certifications Tracked:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {selectedJhaForReview.certifications_required.length > 0 ? (
                              selectedJhaForReview.certifications_required.map((c, idx) => (
                                <span key={idx} className="px-2 py-0.5 text-[9px] font-bold uppercase bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-cyan-400 rounded-sm">
                                  {c}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-slate-500 font-mono">-- Standard Craft --</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Work Steps Sequence Table */}
                      <div className="space-y-2.5">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                          Work Step Sequence, Potential Hazards & Control Measures ({selectedJhaForReview.steps.length} Steps)
                        </h4>

                        <div className="space-y-2">
                          {selectedJhaForReview.steps.map((st, idx) => (
                            <div
                              key={st.id || idx}
                              className="p-3.5 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] space-y-2"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 flex items-center justify-center rounded-xs bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-[10px] font-black text-slate-300">
                                  {idx + 1}
                                </span>
                                <p className="font-bold text-white uppercase text-xs">
                                  {st.step}
                                </p>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                <div className="p-2 bg-[var(--color-brand-card)] rounded-sm border border-red-500/20">
                                  <span className="text-[9px] font-bold uppercase text-red-400 block mb-0.5">
                                    Potential Hazards:
                                  </span>
                                  <p className="text-slate-300 font-sans leading-relaxed">
                                    {st.hazards}
                                  </p>
                                </div>

                                <div className="p-2 bg-[var(--color-brand-card)] rounded-sm border border-emerald-500/20">
                                  <span className="text-[9px] font-bold uppercase text-emerald-400 block mb-0.5">
                                    Control Measures:
                                  </span>
                                  <p className="text-slate-300 font-sans leading-relaxed">
                                    {st.controls}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Live Multi-Day Crew Sign-off Ledger */}
                      <div className="pt-3 border-t border-[var(--color-brand-border)] space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <span>Complete Project Crew Attendance Ledger ({activeAcks.length} Verified Sign-Offs)</span>
                          <span className="text-[var(--color-brand-green,#00ff9d)]">✓ OSHA 1926.21 Compliant</span>
                        </div>

                        {activeAcks.length === 0 ? (
                          <div className="p-5 border border-dashed border-[var(--color-brand-border)] text-center text-slate-500 uppercase text-xs font-bold rounded-sm">
                            [ No workers have logged sign-offs for this JHA yet ]
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {activeAcks.map((ack) => (
                              <div
                                key={ack.id}
                                className="flex justify-between items-center p-2.5 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)]"
                              >
                                <div>
                                  <span className="font-bold uppercase text-white text-xs block">
                                    {ack.employee_name}
                                  </span>
                                  <span className="text-[9px] text-slate-500 uppercase">
                                    {ack.location}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="font-mono text-emerald-400 text-[10px] font-bold block">
                                    {formatDateTime(ack.signed_at)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions with Dual Print Triggers */}
                    <div className="p-3.5 sm:p-4 border-t border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] flex flex-col sm:flex-row justify-between items-center gap-2.5 shrink-0 sticky bottom-0 z-20">
                      <div>
                        {selectedJhaForReview.status === "ACTIVE" ? (
                          <button
                            type="button"
                            onClick={() => handleCloseOutJob(selectedJhaForReview.id)}
                            className="min-h-[40px] px-4 border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500 hover:text-black rounded-sm font-bold uppercase text-xs cursor-pointer transition-all"
                          >
                            ✓ Close Job Out (Archive)
                          </button>
                        ) : (
                          <span className="text-slate-500 font-mono text-xs uppercase font-bold">
                            [ Job Completed & Archived ]
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => handlePrintJha(selectedJhaForReview, activeAcks, "TODAY_ONLY")}
                          className="w-full sm:w-auto min-h-[44px] px-5 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] hover:border-white text-slate-200 rounded-sm font-bold uppercase text-xs cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                          <span>⎙</span>
                          <span>Print Today's Roster</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePrintJha(selectedJhaForReview, activeAcks, "MASTER_HISTORY")}
                          className="w-full sm:w-auto min-h-[44px] px-6 bg-[var(--color-brand-blue)] text-white hover:bg-white hover:text-black rounded-sm font-black uppercase text-xs cursor-pointer transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
                        >
                          <span>⎙</span>
                          <span>Print Master Job Report</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </>,
          document.body
        )}
    </div>
  );
}