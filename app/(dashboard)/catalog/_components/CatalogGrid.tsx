"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { InventoryItem } from "@/lib/db/operations";

interface CatalogGridProps {
  items: InventoryItem[];
  points: number;
  onSelectItem: (item: InventoryItem) => void;
  containerVariants: Variants;
  itemVariants: Variants;
}

export default function CatalogGrid({ 
  items, 
  points, 
  onSelectItem, 
  containerVariants, 
  itemVariants 
}: CatalogGridProps) {
  // Active photo index per card ID for multi-image galleries
  const [activeImageIndexMap, setActiveImageIndexMap] = useState<Record<string, number>>({});

  const handleSelectImageIndex = (itemId: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndexMap((prev) => ({ ...prev, [itemId]: index }));
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12 font-mono"
    >
      {items.map((item) => {
        const canAfford = points >= item.cost_in_points;
        const hasStock = item.quantity_in_stock > 0;
        const progress = canAfford ? 100 : Math.min(100, Math.round((points / item.cost_in_points) * 100));
        
        // Image gallery resolution
        const imageGallery = item.images && item.images.length > 0 
          ? item.images 
          : [item.image_url || "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800"];
        
        const activePhotoIndex = activeImageIndexMap[item.id] || 0;
        const currentDisplayImage = imageGallery[activePhotoIndex] || imageGallery[0];

        // Core fallbacks
        const displayCategory = item.category || "Inventory";
        const activeThemeColor = canAfford ? "var(--color-brand-green)" : "var(--color-brand-blue)";

        return (
          <motion.div 
            key={item.id}
            variants={itemVariants}
            onClick={() => onSelectItem(item)}
            className="group relative w-full flex flex-col border transition-all duration-300 shadow-xl rounded-sm min-h-[420px] overflow-hidden cursor-pointer hover:-translate-y-1"
            style={{
              backgroundColor: "var(--color-brand-card)",
              borderColor: canAfford ? "color-mix(in srgb, var(--color-brand-green) 40%, transparent)" : "var(--color-brand-border)"
            }}
          >
            {/* Top Surface Edge Highlight */}
            <div 
              className="absolute top-0 left-0 w-full h-[2px] z-20 pointer-events-none transition-colors"
              style={{ backgroundColor: activeThemeColor }}
            />

            {/* Featured Badge Spotlight */}
            {item.is_featured && (
              <div className="absolute top-0 right-0 z-20 bg-amber-500 text-black font-black text-[8px] uppercase tracking-widest px-3 py-0.5 rounded-bl-sm shadow-md">
                ★ FEATURED REWARD
              </div>
            )}

            {/* Tactical Image Background & Gallery Swiper Container */}
            <div 
              className="relative w-full h-48 overflow-hidden z-0 bg-[var(--color-brand-bg)]"
            >
              <img 
                src={currentDisplayImage} 
                alt={item.item_name} 
                className={`w-full h-full object-cover transition-all duration-500 ${
                  canAfford ? 'opacity-80 group-hover:opacity-95' : 'opacity-60 grayscale-[0.2] group-hover:opacity-80'
                }`}
              />

              {/* Multiple Image Gallery Dot Selectors */}
              {imageGallery.length > 1 && (
                <div className="absolute bottom-2 left-0 right-0 z-20 flex justify-center gap-1.5 px-2">
                  {imageGallery.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => handleSelectImageIndex(item.id, idx, e)}
                      className={`w-2 h-2 rounded-full border transition-all cursor-pointer ${
                        idx === activePhotoIndex 
                          ? 'bg-[var(--color-brand-blue)] border-[var(--color-brand-blue)] scale-125' 
                          : 'bg-black/60 border-slate-400 hover:bg-white'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Gradient Fade Into Card Body */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(to top, var(--color-brand-card) 5%, transparent 70%)`
                }}
              />
            </div>

            {/* Card Content Details Section */}
            <div className="relative z-10 p-5 flex flex-col flex-1 justify-between">
              
              <div>
                {/* Category & Availability Badges */}
                <div className="flex justify-between items-center mb-3">
                  <span 
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 px-2.5 py-0.5 border backdrop-blur-md rounded-sm"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--color-brand-bg) 80%, transparent)",
                      borderColor: "var(--color-brand-border)"
                    }}
                  >
                    {displayCategory}
                  </span>
                  
                  {!hasStock ? (
                    <span 
                      className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 border rounded-sm"
                      style={{
                        color: "#eab308",
                        borderColor: "color-mix(in srgb, #eab308 40%, transparent)",
                        backgroundColor: "color-mix(in srgb, #eab308 10%, transparent)"
                      }}
                    >
                      Out of Stock
                    </span>
                  ) : canAfford ? (
                    <span 
                      className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 px-2.5 py-0.5 border rounded-sm"
                      style={{
                        color: "var(--color-brand-green)",
                        borderColor: "color-mix(in srgb, var(--color-brand-green) 50%, transparent)",
                        backgroundColor: "color-mix(in srgb, var(--color-brand-green) 15%, transparent)"
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-[var(--color-brand-green)]" />
                      Authorized
                    </span>
                  ) : (
                    <span 
                      className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 px-2.5 py-0.5 border rounded-sm text-slate-400 border-[var(--color-brand-border)] bg-[var(--color-brand-bg)]"
                    >
                      <span className="w-1.5 h-1.5 rounded-none bg-slate-500" />
                      Locked ({progress}%)
                    </span>
                  )}
                </div>

                {/* Title & Description Breakdown */}
                <h3 className="font-black text-slate-100 uppercase tracking-tight text-lg sm:text-xl leading-snug mb-2">
                  {item.item_name}
                </h3>

                <p className="text-slate-400 text-xs font-sans leading-relaxed line-clamp-2 mb-4">
                  {item.description || "No specific detailed description provided for this catalog item."}
                </p>
              </div>

              {/* Price & Requisition Action Trigger */}
              <div>
                <div className="flex items-end justify-between border-t border-[var(--color-brand-border)] pt-4 mb-4">
                  <div className="flex items-end gap-1.5">
                    <span 
                      className={`font-black text-3xl tabular-nums tracking-tighter ${canAfford ? '' : 'text-slate-300'}`}
                      style={{ color: canAfford ? activeThemeColor : undefined }}
                    >
                      {item.cost_in_points}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-1">
                      PTS
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {item.quantity_in_stock} Units Left
                  </span>
                </div>

                {/* Progress Bar for Unaffordable Items */}
                {!canAfford && hasStock && (
                  <div className="w-full mb-3">
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                      <span>Points Goal</span>
                      <span className="tabular-nums">{points} / {item.cost_in_points} PTS ({progress}%)</span>
                    </div>
                    <div className="w-full h-1.5 border rounded-full overflow-hidden bg-[var(--color-brand-bg)] border-[var(--color-brand-border)]">
                      <div 
                        className="h-full transition-all duration-700 bg-[var(--color-brand-blue)]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Always-Clickable View Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectItem(item);
                  }}
                  className={`w-full font-bold uppercase tracking-[0.2em] text-[10px] py-3.5 transition-all duration-200 rounded-sm cursor-pointer border outline-none shadow-md ${
                    canAfford 
                      ? 'bg-[var(--color-brand-green)] border-[var(--color-brand-green)] text-slate-950 hover:bg-white hover:border-white' 
                      : 'bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] text-slate-200 hover:border-[var(--color-brand-blue)] hover:text-white'
                  }`}
                >
                  {canAfford ? "View Details & Requisition ↗" : "View Details & Specs 🔒"}
                </button>
              </div>

            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}