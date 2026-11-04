// app/(dashboard)/safety/_components/DailyToolCheckModule.tsx
"use client";

import { useState, useMemo } from "react";
import {
  EmployeeToolboxItem,
  addToolToToolbox,
  removeToolFromToolbox,
  toggleToolFavorite,
  verifyMonthlyToolboxTape,
  recordDailyToolInspection,
} from "@/lib/db/operations";
import {
  MASTER_TOOL_LIST,
  getCurrentMonthTapeColor,
  getFourthWorkingDayDeadline,
  isToolPowered,
} from "@/lib/data/toolCatalog";

interface DailyToolCheckModuleProps {
  supabase: any;
  userId: string;
  employeeName: string;
  userLocation: string;
  toolbox: EmployeeToolboxItem[];
  onToolboxUpdated: () => Promise<void>;
  onComplete: (selectedToolNames: string[], tapeColor: string) => void;
  onBack: () => void;
}

type TabType = "SELECTED_TODAY" | "MY_TOOLBOX" | "CATALOG_ADD";
type CategoryType = "ALL" | "Hand Tools" | "Power Tools" | "Rigging & Access" | "Shop Tools";

export default function DailyToolCheckModule({
  supabase,
  userId,
  employeeName,
  userLocation,
  toolbox,
  onToolboxUpdated,
  onComplete,
  onBack,
}: DailyToolCheckModuleProps) {
  const [activeTab, setActiveTab] = useState<TabType>("SELECTED_TODAY");
  const [categoryFilter, setCategoryFilter] = useState<CategoryType>("ALL");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [customToolName, setCustomToolName] = useState("");
  const [customCategory, setCustomCategory] = useState<"Hand Tools" | "Power Tools" | "Rigging & Access" | "Shop Tools">("Hand Tools");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complianceCertified, setComplianceCertified] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentMonthInfo = useMemo(() => getCurrentMonthTapeColor(), []);
  const fourthWorkingDayDeadline = useMemo(() => getFourthWorkingDayDeadline(), []);
  const now = new Date();
  const isPastGracePeriod = now > fourthWorkingDayDeadline;

  const poweredToolsInBox = useMemo(() => {
    return toolbox.filter((t) => isToolPowered(t.tool_name, t.category));
  }, [toolbox]);

  const needsTapeRecertification = useMemo(() => {
    if (poweredToolsInBox.length === 0) return false;
    return poweredToolsInBox.some((t) => t.last_tape_verified_month !== currentMonthInfo.monthKey);
  }, [poweredToolsInBox, currentMonthInfo.monthKey]);

  const hasPoweredToolsSelected = useMemo(() => {
    return selectedTools.some((toolName) => {
      const inBox = toolbox.find((t) => t.tool_name.toLowerCase() === toolName.toLowerCase());
      if (inBox) return isToolPowered(toolName, inBox.category);
      const inCatalog = MASTER_TOOL_LIST.find((m) => m.name.toLowerCase() === toolName.toLowerCase());
      return isToolPowered(toolName, inCatalog?.category);
    });
  }, [selectedTools, toolbox]);

  const isLockedOut = needsTapeRecertification && isPastGracePeriod && hasPoweredToolsSelected;

  const favoriteTools = useMemo(() => toolbox.filter((t) => t.is_favorite), [toolbox]);

  const shiftSelectedItems = useMemo(() => {
    return selectedTools
      .map((name) => {
        const inBox = toolbox.find((t) => t.tool_name.toLowerCase() === name.toLowerCase());
        if (inBox) return inBox;
        const inCatalog = MASTER_TOOL_LIST.find((m) => m.name.toLowerCase() === name.toLowerCase());
        return {
          id: `temp-${name}`,
          user_id: userId,
          tool_name: name,
          category: (inCatalog?.category || "Hand Tools") as any,
          is_custom: false,
          is_favorite: false,
          last_tape_verified_month: null,
          created_at: new Date().toISOString(),
        } as EmployeeToolboxItem;
      })
      .filter((t) => {
        const matchesCat = categoryFilter === "ALL" || t.category === categoryFilter;
        const matchesSearch = !catalogSearch || t.tool_name.toLowerCase().includes(catalogSearch.toLowerCase());
        return matchesCat && matchesSearch;
      });
  }, [selectedTools, toolbox, categoryFilter, catalogSearch, userId]);

  const filteredMyToolbox = useMemo(() => {
    return toolbox.filter((t) => {
      const matchesCat = categoryFilter === "ALL" || t.category === categoryFilter;
      const matchesSearch = !catalogSearch || t.tool_name.toLowerCase().includes(catalogSearch.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [toolbox, categoryFilter, catalogSearch]);

  const existingToolNames = useMemo(() => new Set(toolbox.map((t) => t.tool_name.toLowerCase())), [toolbox]);

  const availableMasterCatalog = useMemo(() => {
    return MASTER_TOOL_LIST.filter((t) => {
      const notInToolbox = !existingToolNames.has(t.name.toLowerCase());
      const matchesCat = categoryFilter === "ALL" || t.category === categoryFilter;
      const matchesSearch = !catalogSearch || t.name.toLowerCase().includes(catalogSearch.toLowerCase());
      return notInToolbox && matchesCat && matchesSearch;
    });
  }, [existingToolNames, categoryFilter, catalogSearch]);

  const toggleSelectTool = (name: string) => {
    setSelectedTools((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleConfirmAllFavorites = () => {
    if (favoriteTools.length === 0) {
      setErrorMessage("You have no tools marked as favorites. Star (★) items in 'All My Tools' first.");
      return;
    }
    const favNames = favoriteTools.map((t) => t.tool_name);
    setSelectedTools((prev) => Array.from(new Set([...prev, ...favNames])));
    setComplianceCertified(true);
    setErrorMessage(null);
  };

  const handleSelectAllInToolbox = () => {
    setSelectedTools(toolbox.map((t) => t.tool_name));
  };

  const handleClearAllSelections = () => {
    setSelectedTools([]);
  };

  const handleToggleFavorite = async (item: EmployeeToolboxItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.id.startsWith("temp-")) return;
    await toggleToolFavorite(supabase, item.id, !item.is_favorite);
    await onToolboxUpdated();
  };

  const handleRemoveTool = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Remove ${name} from your digital toolbox?`)) return;
    await removeToolFromToolbox(supabase, id);
    setSelectedTools((prev) => prev.filter((n) => n !== name));
    await onToolboxUpdated();
  };

  const handleAddFromCatalog = async (name: string, category: "Hand Tools" | "Power Tools" | "Rigging & Access" | "Shop Tools") => {
    await addToolToToolbox(supabase, userId, name, category, false);
    setSelectedTools((prev) => (prev.includes(name) ? prev : [...prev, name]));
    await onToolboxUpdated();
  };

  const handleAddCustomTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customToolName.trim()) return;
    const trimmed = customToolName.trim();
    await addToolToToolbox(supabase, userId, trimmed, customCategory, true);
    setSelectedTools((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    setCustomToolName("");
    await onToolboxUpdated();
  };

  const handleVerifyTapeColorsNow = async () => {
    if (
      !confirm(
        `Certify that all active Power Tools and powered Shop Tools in your possession have been inspected and taped with the designated ${currentMonthInfo.monthName} tape (${currentMonthInfo.color})? Non-powered tools do not require tape.`
      )
    )
      return;

    await verifyMonthlyToolboxTape(supabase, userId, currentMonthInfo.monthKey);
    await onToolboxUpdated();
    setErrorMessage(null);
  };

  const handleConfirmDailyInspection = async () => {
    if (isLockedOut) {
      setErrorMessage(
        `MONTHLY AUDIT LOCKOUT: The 4-day grace window has passed. You must certify your powered tools bear ${currentMonthInfo.color} tape before logging them.`
      );
      return;
    }

    if (selectedTools.length === 0) {
      setErrorMessage("Please select at least one tool you are using today, or click 'Confirm All Favorites'.");
      return;
    }

    if (!complianceCertified) {
      setErrorMessage("Please check the Nestlé 5959-SHE-INS-0022 compliance verification box.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await recordDailyToolInspection(supabase, {
      userId,
      employeeName,
      location: userLocation,
      tapeColorVerified: currentMonthInfo.color,
      toolsInspected: selectedTools,
    });

    setIsSubmitting(false);

    if (res.success) {
      onComplete(selectedTools, currentMonthInfo.color);
    } else {
      setErrorMessage(`Failed to save tool inspection: ${res.error}`);
    }
  };

  return (
    <div className="border p-4 sm:p-6 rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] space-y-5 font-mono shadow-2xl">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-[var(--color-brand-border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[var(--color-brand-blue,#0088ff)] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-brand-blue,#0088ff)]">
              Nestlé Standard 5959-SHE-INS-0022 Compliance
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black uppercase text-white mt-0.5">
            Step 3 of 4 • Daily Tool Check &amp; Toolbox Audit
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Select tools in use for today&apos;s shift. Hand tools check for defects; powered tools require monthly tape.
          </p>
        </div>

        {/* ACTIVE MONTH TAPE COLOR BADGE */}
        <div className="flex items-center gap-2.5 p-2 sm:px-3 sm:py-2 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)]">
          <div className="text-right">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">
              {currentMonthInfo.monthName} Powered Tape
            </span>
            <span className="text-xs sm:text-sm font-black uppercase text-amber-300">
              {currentMonthInfo.color}
            </span>
          </div>
          <span className="w-4 h-4 rounded-full border-2 border-amber-300/80 bg-amber-400/20" />
        </div>
      </div>

      {/* MONTHLY POWERED TOOL RETAPING BANNER */}
      {needsTapeRecertification && (
        <div
          className={`p-3.5 sm:p-4 rounded-sm border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
            isPastGracePeriod
              ? "bg-red-500/10 border-red-500/50 text-red-300"
              : "bg-amber-500/10 border-amber-500/40 text-amber-200"
          }`}
        >
          <div>
            <span className="text-xs font-black uppercase tracking-wider block">
              {isPastGracePeriod 
                ? "⛔ POWERED TOOL TAPE RECERTIFICATION OVERDUE (LOCKOUT ACTIVE)" 
                : "⚠ MONTHLY POWERED TOOL RETAPING WINDOW (DAYS 1–4 ACTIVE)"}
            </span>
            <p className="text-[11px] font-sans mt-0.5 leading-relaxed">
              Verify all power tools (corded, battery, pneumatic) and powered shop equipment bear the <strong className="font-mono text-white">{currentMonthInfo.color}</strong> tape. Non-powered tools are exempt.
              {!isPastGracePeriod && ` Grace window closes after the 4th working day (${fourthWorkingDayDeadline.toLocaleDateString()}).`}
            </p>
          </div>

          <button
            type="button"
            onClick={handleVerifyTapeColorsNow}
            className={`min-h-[40px] px-4 rounded-sm text-xs font-black uppercase tracking-wider cursor-pointer transition-all whitespace-nowrap shadow-md ${
              isPastGracePeriod
                ? "bg-red-500 hover:bg-white text-white hover:text-black"
                : "bg-amber-400 hover:bg-white text-black"
            }`}
          >
            ✓ Certify Powered Tools Taped
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-500/10 border border-red-500/40 text-red-300 text-xs font-bold uppercase rounded-sm">
          [ACTION_REQUIRED] {errorMessage}
        </div>
      )}

      {/* TAB NAVIGATION & ACTION BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[var(--color-brand-border)] pb-2.5">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("SELECTED_TODAY")}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "SELECTED_TODAY"
                ? "border-[var(--color-brand-blue,#0088ff)] text-[var(--color-brand-blue,#0088ff)] font-black"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>📋 Today&apos;s Selection</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-xs font-mono font-bold ${
              selectedTools.length > 0 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-slate-800 text-slate-400"
            }`}>
              {selectedTools.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("MY_TOOLBOX")}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === "MY_TOOLBOX"
                ? "border-[var(--color-brand-blue,#0088ff)] text-[var(--color-brand-blue,#0088ff)] font-black"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            🧰 All My Tools ({toolbox.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("CATALOG_ADD")}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === "CATALOG_ADD"
                ? "border-emerald-400 text-emerald-400 font-black"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            + Add Tools To Box
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleConfirmAllFavorites}
            className="flex-1 sm:flex-initial min-h-[38px] px-3.5 text-xs font-black uppercase bg-amber-400 hover:bg-white text-black rounded-sm cursor-pointer shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
            title="Adds all your starred tools to today's active shift"
          >
            <span>⭐</span>
            <span>Confirm All Favorites ({favoriteTools.length})</span>
          </button>

          {activeTab === "MY_TOOLBOX" && (
            <button
              type="button"
              onClick={handleSelectAllInToolbox}
              className="px-3 min-h-[38px] text-[11px] font-bold uppercase border border-[var(--color-brand-border)] hover:border-white text-slate-300 rounded-sm cursor-pointer"
            >
              Select All
            </button>
          )}

          {selectedTools.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllSelections}
              className="px-2.5 min-h-[38px] text-[11px] font-bold uppercase border border-red-500/30 hover:border-red-400 text-red-400 rounded-sm cursor-pointer"
              title="Uncheck all tools"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* FILTER SEARCH & CATEGORY BAR */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="text"
          value={catalogSearch}
          onChange={(e) => setCatalogSearch(e.target.value)}
          placeholder="SEARCH TOOLS..."
          className="flex-1 min-h-[38px] px-3 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] text-slate-100 text-xs font-bold uppercase rounded-sm outline-none focus:border-[var(--color-brand-blue,#0088ff)]"
        />

        <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
          {(["ALL", "Hand Tools", "Power Tools", "Rigging & Access", "Shop Tools"] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-sm whitespace-nowrap border cursor-pointer ${
                categoryFilter === cat
                  ? "bg-[var(--color-brand-blue,#0088ff)] border-[var(--color-brand-blue,#0088ff)] text-white font-black"
                  : "bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] text-slate-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: TODAY'S ACTIVE SELECTION */}
      {activeTab === "SELECTED_TODAY" && (
        <div className="space-y-3">
          {selectedTools.length === 0 ? (
            <div className="p-8 border border-dashed border-[var(--color-brand-border)] rounded-sm text-center space-y-2">
              <p className="text-xs font-bold uppercase text-slate-400">
                [ No Tools Checked For Today&apos;s Shift ]
              </p>
              <p className="text-[11px] text-slate-500 font-sans max-w-md mx-auto">
                Click <strong className="text-amber-300 uppercase">Confirm All Favorites</strong> above to load your daily kit, or browse <strong className="text-white uppercase">&quot;All My Tools&quot;</strong> to check individual tools.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {shiftSelectedItems.map((t) => {
                const requiresTape = isToolPowered(t.tool_name, t.category);

                return (
                  <div
                    key={t.id}
                    onClick={() => toggleSelectTool(t.tool_name)}
                    className="p-3 border rounded-sm cursor-pointer transition-all flex items-center justify-between gap-2 bg-[var(--color-brand-blue,#0088ff)]/15 border-[var(--color-brand-blue,#0088ff)]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-4 h-4 rounded-xs border flex items-center justify-center flex-shrink-0 bg-[var(--color-brand-blue,#0088ff)] border-[var(--color-brand-blue,#0088ff)] text-white">
                        <span className="text-[10px] font-black">✓</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold uppercase text-white truncate block">
                          {t.tool_name}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] uppercase text-slate-400 font-mono">
                            {t.category}
                          </span>
                          {requiresTape && (
                            <span className="text-[8px] font-bold uppercase px-1 py-0.2 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-none">
                              Tape Req
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleToggleFavorite(t, e)}
                        className={`text-base px-1 min-h-[32px] min-w-[32px] flex items-center justify-center ${
                          t.is_favorite 
                            ? "text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]" 
                            : "text-slate-600 hover:text-amber-300"
                        }`}
                        title={t.is_favorite ? "Starred Daily Favorite" : "One-off tool (click to star as permanent favorite)"}
                      >
                        {t.is_favorite ? "★" : "☆"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FULL DIGITAL TOOLBOX VIEW */}
      {activeTab === "MY_TOOLBOX" && (
        <div className="space-y-3">
          {filteredMyToolbox.length === 0 ? (
            <div className="p-8 border border-dashed border-[var(--color-brand-border)] rounded-sm text-center space-y-2">
              <p className="text-xs font-bold uppercase text-slate-400">
                [ Your Digital Toolbox Is Empty ]
              </p>
              <p className="text-[11px] text-slate-500 font-sans max-w-sm mx-auto">
                Click &quot;+ Add Tools To Box&quot; above to select tools from the master catalog of trade tools[cite: 4273].
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {filteredMyToolbox.map((t) => {
                const isSelected = selectedTools.includes(t.tool_name);
                const requiresTape = isToolPowered(t.tool_name, t.category);

                return (
                  <div
                    key={t.id}
                    onClick={() => toggleSelectTool(t.tool_name)}
                    className={`p-3 border rounded-sm cursor-pointer transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? "bg-[var(--color-brand-blue,#0088ff)]/15 border-[var(--color-brand-blue,#0088ff)]"
                        : "bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] hover:border-slate-500"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-4 h-4 rounded-xs border flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? "bg-[var(--color-brand-blue,#0088ff)] border-[var(--color-brand-blue,#0088ff)] text-white"
                            : "border-slate-500 bg-transparent"
                        }`}
                      >
                        {isSelected && <span className="text-[10px] font-black">✓</span>}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold uppercase text-white truncate block">
                          {t.tool_name}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] uppercase text-slate-400 font-mono">
                            {t.category}
                          </span>
                          {requiresTape && (
                            <span className="text-[8px] font-bold uppercase px-1 py-0.2 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-none">
                              Tape Req
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleToggleFavorite(t, e)}
                        className={`text-base px-1 min-h-[32px] min-w-[32px] flex items-center justify-center ${
                          t.is_favorite ? "text-amber-400" : "text-slate-600 hover:text-amber-400"
                        }`}
                        title="Star / Unstar Favorite"
                      >
                        {t.is_favorite ? "★" : "☆"}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveTool(t.id, t.tool_name, e)}
                        className="text-slate-600 hover:text-red-400 text-xs px-1 min-h-[32px] min-w-[28px] flex items-center justify-center"
                        title="Remove from toolbox"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MASTER CATALOG BROWSER & CUSTOM ENTRY ADDER */}
      {activeTab === "CATALOG_ADD" && (
        <div className="space-y-4">
          <form
            onSubmit={handleAddCustomTool}
            className="p-3 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              value={customToolName}
              onChange={(e) => setCustomToolName(e.target.value)}
              placeholder="ENTER CUSTOM TOOL NAME NOT IN CATALOG..."
              className="flex-1 px-3 py-2 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-slate-100 text-xs uppercase rounded-sm outline-none"
            />
            <select
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value as any)}
              className="px-3 py-2 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-slate-100 text-xs uppercase rounded-sm outline-none cursor-pointer"
            >
              <option value="Hand Tools">Hand Tools</option>
              <option value="Power Tools">Power Tools</option>
              <option value="Rigging & Access">Rigging & Access</option>
              <option value="Shop Tools">Shop Tools</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--color-brand-blue,#0088ff)] text-white hover:bg-white hover:text-black font-black uppercase text-xs rounded-sm cursor-pointer whitespace-nowrap"
            >
              + Add &amp; Select
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[380px] overflow-y-auto custom-scrollbar p-1">
            {availableMasterCatalog.length === 0 ? (
              <div className="col-span-full p-8 text-center text-slate-500 uppercase text-xs font-bold">
                [ No more catalog items match your search ]
              </div>
            ) : (
              availableMasterCatalog.map((tool) => (
                <div
                  key={tool.name}
                  onClick={() => handleAddFromCatalog(tool.name, tool.category)}
                  className="p-2.5 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] hover:border-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer flex justify-between items-center group"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-bold uppercase text-white truncate block group-hover:text-emerald-300">
                      {tool.name}
                    </span>
                    <span className="text-[9px] uppercase text-slate-500 font-mono block">
                      {tool.category} {isToolPowered(tool.name, tool.category) ? "• Tape Req" : ""}
                    </span>
                  </div>
                  <span className="text-emerald-400 text-xs font-black uppercase shrink-0">
                    + Add
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* NESTLÉ COMPLIANCE ATTESTATION CARD */}
      <div className="p-3.5 sm:p-4 rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] space-y-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase text-[var(--color-brand-blue,#0088ff)]">
            Compliance Inspection Verification (5959-SHE-INS-0022)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] text-slate-300 font-sans">
          <div className="p-2 rounded-sm bg-[var(--color-brand-card)] border border-[var(--color-brand-border)]">
            <strong className="text-amber-300 font-mono uppercase block mb-0.5">Powered Tools (Tape Required):</strong>
            Bearing {currentMonthInfo.color} tape; cord/airline undamaged; double insulated/ground prong intact; shields/guards in place.
          </div>
          <div className="p-2 rounded-sm bg-[var(--color-brand-card)] border border-[var(--color-brand-border)]">
            <strong className="text-slate-300 font-mono uppercase block mb-0.5">Non-Powered Tools &amp; Rigging (No Tape Required):</strong>
            No cracks in jaws/handles; handles tight/secure; striking tools have no mushroomed heads; blades sharp.
          </div>
        </div>

        <label className="flex items-center gap-3 pt-1 cursor-pointer">
          <input
            type="checkbox"
            checked={complianceCertified}
            onChange={(e) => setComplianceCertified(e.target.checked)}
            className="w-4 h-4 rounded-xs border-2 border-[var(--color-brand-blue,#0088ff)] bg-[var(--color-brand-card)] cursor-pointer"
          />
          <span className="text-xs font-bold uppercase text-white font-mono">
            I certify all {selectedTools.length} selected tools are inspected and compliant with Nestlé Standard 5959-SHE-INS-0022.
          </span>
        </label>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-[var(--color-brand-border)]">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto min-h-[44px] px-5 border border-[var(--color-brand-border)] text-slate-400 hover:text-white rounded-sm font-bold uppercase text-xs cursor-pointer"
        >
          ← Back To JHAs
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-mono text-slate-400 font-bold hidden sm:inline">
            {selectedTools.length} Tool{selectedTools.length === 1 ? "" : "s"} Verified
          </span>

          <button
            type="button"
            disabled={isSubmitting || selectedTools.length === 0 || !complianceCertified || isLockedOut}
            onClick={handleConfirmDailyInspection}
            className="w-full sm:w-auto min-h-[46px] px-8 bg-[var(--color-brand-blue,#0088ff)] text-white hover:bg-white hover:text-black rounded-sm font-black uppercase text-xs cursor-pointer transition-all shadow-[0_0_15px_rgba(0,136,255,0.35)] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isSubmitting ? "Logging Tool Check..." : "Confirm Tool Check & Final Checkoff ➔"}
          </button>
        </div>
      </div>
    </div>
  );
}