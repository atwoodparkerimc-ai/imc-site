"use client";

import { useState, useMemo, useEffect } from "react";
import {
  EmployeeToolboxItem,
  getEmployeeToolbox,
  addToolToToolbox,
  removeToolFromToolbox,
  toggleToolFavorite,
  verifyMonthlyToolboxTape,
} from "@/lib/db/operations";
import {
  MASTER_TOOL_LIST,
  getCurrentMonthTapeColor,
  isToolPowered,
} from "@/lib/data/toolCatalog";

interface ProfileToolboxManagerProps {
  supabase: any;
  userId: string;
}

type TabType = "MY_BOX" | "FAVORITES" | "CATALOG";
type CategoryType = "ALL" | "Hand Tools" | "Power Tools" | "Rigging & Access" | "Shop Tools";

export default function ProfileToolboxManager({
  supabase,
  userId,
}: ProfileToolboxManagerProps) {
  const [toolbox, setToolbox] = useState<EmployeeToolboxItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("MY_BOX");
  const [categoryFilter, setCategoryFilter] = useState<CategoryType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState<"Hand Tools" | "Power Tools" | "Rigging & Access" | "Shop Tools">("Hand Tools");
  const [feedback, setFeedback] = useState<string | null>(null);

  const currentMonth = useMemo(() => getCurrentMonthTapeColor(), []);

  const loadToolbox = async () => {
    if (!userId) return;
    setIsLoading(true);
    const items = await getEmployeeToolbox(supabase, userId);
    setToolbox(items);
    setIsLoading(false);
  };

  useEffect(() => {
    loadToolbox();
  }, [userId, supabase]);

  const favorites = useMemo(() => toolbox.filter((t) => t.is_favorite), [toolbox]);

  const filteredMyTools = useMemo(() => {
    return toolbox.filter((t) => {
      const matchesCat = categoryFilter === "ALL" || t.category === categoryFilter;
      const matchesSearch = !searchQuery || t.tool_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [toolbox, categoryFilter, searchQuery]);

  const existingNames = useMemo(
    () => new Set(toolbox.map((t) => t.tool_name.toLowerCase())),
    [toolbox]
  );

  const availableCatalog = useMemo(() => {
    return MASTER_TOOL_LIST.filter((t) => {
      const notOwned = !existingNames.has(t.name.toLowerCase());
      const matchesCat = categoryFilter === "ALL" || t.category === categoryFilter;
      const matchesSearch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase());
      return notOwned && matchesCat && matchesSearch;
    });
  }, [existingNames, categoryFilter, searchQuery]);

  const handleToggleFavorite = async (item: EmployeeToolboxItem) => {
    await toggleToolFavorite(supabase, item.id, !item.is_favorite);
    await loadToolbox();
  };

  const handleRemove = async (item: EmployeeToolboxItem) => {
    if (!confirm(`Remove ${item.tool_name} from your toolbox?`)) return;
    await removeToolFromToolbox(supabase, item.id);
    await loadToolbox();
  };

  const handleAddFromCatalog = async (name: string, category: "Hand Tools" | "Power Tools" | "Rigging & Access" | "Shop Tools") => {
    const res = await addToolToToolbox(supabase, userId, name, category, false);
    if (res.success) {
      setFeedback(`Added "${name}" to your toolbox`);
      setTimeout(() => setFeedback(null), 2500);
      await loadToolbox();
    }
  };

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const res = await addToolToToolbox(supabase, userId, customName.trim(), customCategory, true);
    if (res.success) {
      setCustomName("");
      setFeedback(`Added custom "${customName.trim()}"`);
      setTimeout(() => setFeedback(null), 2500);
      await loadToolbox();
    }
  };

  const handleVerifyTapeAll = async () => {
    if (
      !confirm(
        `Certify that all active Power Tools and powered Shop Tools in your possession bear the active ${currentMonth.monthName} tape (${currentMonth.color})? Non-powered tools and rigging do not require tape.`
      )
    )
      return;

    await verifyMonthlyToolboxTape(supabase, userId, currentMonth.monthKey);
    await loadToolbox();
    setFeedback(`Certified all powered tools for ${currentMonth.monthName} (${currentMonth.color}).`);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="border rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] p-4 sm:p-6 space-y-5 font-mono shadow-xl">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[var(--color-brand-border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[var(--color-brand-blue)] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand-blue)]">
              Equipment Profile Configuration
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black uppercase text-white mt-0.5">
            Personal Digital Toolbox & Favorites
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure your gear inventory once. Star your daily favorites (★) for fast 1-click morning check-ins.
          </p>
        </div>

        {/* POWERED EQUIPMENT TAPE STATUS */}
        <div className="flex items-center gap-2.5 p-2 sm:px-3 sm:py-2 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)]">
          <div className="text-right">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">
              {currentMonth.monthName} Powered Tape
            </span>
            <span className="text-xs font-black uppercase text-amber-300">
              {currentMonth.color}
            </span>
          </div>
          <button
            type="button"
            onClick={handleVerifyTapeAll}
            className="text-[10px] font-bold uppercase px-2.5 py-1.5 bg-amber-400/10 border border-amber-400/40 text-amber-300 hover:bg-amber-400 hover:text-black rounded-sm cursor-pointer transition-colors"
          >
            ✓ Certify Powered Tape
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase rounded-sm">
          ✓ {feedback}
        </div>
      )}

      {/* TABS */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--color-brand-border)] pb-2.5">
        <button
          type="button"
          onClick={() => setActiveTab("MY_BOX")}
          className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
            activeTab === "MY_BOX"
              ? "border-[var(--color-brand-blue)] text-[var(--color-brand-blue)] font-black"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          🧰 My Toolbox ({toolbox.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("FAVORITES")}
          className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
            activeTab === "FAVORITES"
              ? "border-amber-400 text-amber-300 font-black"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          ⭐ Daily Favorites ({favorites.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("CATALOG")}
          className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
            activeTab === "CATALOG"
              ? "border-emerald-400 text-emerald-300 font-black"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          + Add From Master Catalog
        </button>
      </div>

      {/* SEARCH & CATEGORY CHIPS */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="SEARCH TOOLS..."
          className="flex-1 px-3 py-2 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] text-xs text-white uppercase rounded-sm outline-none focus:border-[var(--color-brand-blue)]"
        />

        <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
          {(["ALL", "Hand Tools", "Power Tools", "Rigging & Access", "Shop Tools"] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-sm whitespace-nowrap border cursor-pointer ${
                categoryFilter === cat
                  ? "bg-[var(--color-brand-blue)] border-[var(--color-brand-blue)] text-white font-black"
                  : "bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] text-slate-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: MY FULL TOOLBOX */}
      {activeTab === "MY_BOX" && (
        <div className="space-y-3">
          {isLoading ? (
            <div className="p-8 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
              Loading toolbox inventory...
            </div>
          ) : filteredMyTools.length === 0 ? (
            <div className="p-8 border border-dashed border-[var(--color-brand-border)] rounded-sm text-center space-y-1">
              <p className="text-xs font-bold uppercase text-slate-400">
                [ No tools found in this category ]
              </p>
              <p className="text-[11px] text-slate-500">
                Click &quot;+ Add From Master Catalog&quot; to populate your personal gang box.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[460px] overflow-y-auto custom-scrollbar p-1">
              {filteredMyTools.map((tool) => {
                const requiresTape = isToolPowered(tool.tool_name, tool.category);

                return (
                  <div
                    key={tool.id}
                    className="p-3 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] hover:border-slate-500 flex justify-between items-center gap-2 transition-all"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-bold uppercase text-white truncate block">
                        {tool.tool_name}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] uppercase text-slate-400 font-mono">
                          {tool.category} {tool.is_custom ? "• Custom" : ""}
                        </span>
                        {requiresTape && (
                          <span className="text-[8px] font-bold uppercase px-1 py-0.2 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-none">
                            Tape Req
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleFavorite(tool)}
                        className={`text-base px-1 cursor-pointer transition-transform active:scale-125 ${
                          tool.is_favorite ? "text-amber-400" : "text-slate-600 hover:text-amber-400"
                        }`}
                        title={tool.is_favorite ? "Unstar Favorite" : "Star as Daily Favorite"}
                      >
                        {tool.is_favorite ? "★" : "☆"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(tool)}
                        className="text-slate-600 hover:text-red-400 text-xs px-1 cursor-pointer"
                        title="Remove tool"
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

      {/* TAB 2: DAILY FAVORITES */}
      {activeTab === "FAVORITES" && (
        <div className="space-y-3">
          {favorites.length === 0 ? (
            <div className="p-8 border border-dashed border-[var(--color-brand-border)] rounded-sm text-center space-y-1">
              <p className="text-xs font-bold uppercase text-slate-400">
                [ No Daily Favorites Starred ]
              </p>
              <p className="text-[11px] text-slate-500">
                In &quot;My Toolbox&quot;, click the star (★) on tools you pull every single day to enable 1-click morning check-ins.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[460px] overflow-y-auto custom-scrollbar p-1">
              {favorites.map((tool) => {
                const requiresTape = isToolPowered(tool.tool_name, tool.category);

                return (
                  <div
                    key={tool.id}
                    className="p-3 border rounded-sm bg-amber-400/5 border-amber-400/30 flex justify-between items-center gap-2"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-bold uppercase text-white truncate block">
                        {tool.tool_name}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] uppercase text-slate-400 font-mono">
                          {tool.category}
                        </span>
                        {requiresTape && (
                          <span className="text-[8px] font-bold uppercase px-1 py-0.2 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-none">
                            Tape Req
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(tool)}
                      className="text-amber-400 text-base px-1 cursor-pointer hover:text-white"
                      title="Remove from favorites"
                    >
                      ★
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ADD FROM MASTER CATALOG + CUSTOM ADD */}
      {activeTab === "CATALOG" && (
        <div className="space-y-4">
          {/* Custom Tool Form */}
          <form
            onSubmit={handleAddCustom}
            className="p-3 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="ENTER CUSTOM TOOL NAME..."
              className="flex-1 px-3 py-2 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-xs text-white uppercase rounded-sm outline-none"
            />
            <select
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value as any)}
              className="px-3 py-2 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-xs text-white uppercase rounded-sm outline-none cursor-pointer"
            >
              <option value="Hand Tools">Hand Tools</option>
              <option value="Power Tools">Power Tools</option>
              <option value="Rigging & Access">Rigging & Access</option>
              <option value="Shop Tools">Shop Tools</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--color-brand-blue)] text-white hover:bg-white hover:text-black font-black uppercase text-xs rounded-sm cursor-pointer whitespace-nowrap"
            >
              + Add Custom
            </button>
          </form>

          {/* Catalog Tool Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[380px] overflow-y-auto custom-scrollbar p-1">
            {availableCatalog.length === 0 ? (
              <div className="col-span-full p-8 text-center text-slate-500 uppercase text-xs font-bold">
                [ All matching tools are already in your toolbox ]
              </div>
            ) : (
              availableCatalog.map((tool) => {
                const requiresTape = isToolPowered(tool.name, tool.category);

                return (
                  <div
                    key={tool.name}
                    onClick={() => handleAddFromCatalog(tool.name, tool.category)}
                    className="p-2.5 border rounded-sm bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] hover:border-emerald-400 hover:bg-emerald-500/10 cursor-pointer transition-all flex justify-between items-center group"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-bold uppercase text-white truncate block group-hover:text-emerald-300">
                        {tool.name}
                      </span>
                      <span className="text-[9px] uppercase text-slate-500 font-mono block">
                        {tool.category} {requiresTape ? "• Tape Req" : ""}
                      </span>
                    </div>
                    <span className="text-emerald-400 text-xs font-black uppercase shrink-0">
                      + Add
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}