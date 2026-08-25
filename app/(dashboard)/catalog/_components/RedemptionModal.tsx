"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InventoryItem } from "@/lib/db/operations";

interface RedemptionModalProps {
  selectedItem: InventoryItem | null;
  points: number;
  isProcessing: boolean;
  isSuccess: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function RedemptionModal({
  selectedItem,
  points,
  isProcessing,
  isSuccess,
  onClose,
  onConfirm
}: RedemptionModalProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);

  if (!selectedItem) return null;

  const canAfford = points >= selectedItem.cost_in_points;
  const pointsNeeded = selectedItem.cost_in_points - points;
  const progress = canAfford ? 100 : Math.min(100, Math.round((points / selectedItem.cost_in_points) * 100));

  // Resolve photo assets array
  const photoAssets = selectedItem.images && selectedItem.images.length > 0 
    ? selectedItem.images 
    : [selectedItem.image_url || "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800"];

  const mainPhoto = photoAssets[selectedPhotoIndex] || photoAssets[0];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={() => !isProcessing && onClose()}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-mono cursor-pointer overflow-y-auto"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }} 
          animate={{ scale: 1, y: 0 }} 
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="border w-full max-w-xl shadow-2xl relative overflow-hidden rounded-sm cursor-default my-8 bg-[var(--color-brand-card)] border-[var(--color-brand-border)]"
        >
          {/* Top Accent Bar */}
          <div 
            className="absolute top-0 left-0 w-full h-[2px] z-20" 
            style={{ backgroundColor: canAfford ? "var(--color-brand-green)" : "var(--color-brand-blue)" }}
          />

          {isSuccess ? (
            /* Success State */
            <div className="p-10 text-center flex flex-col items-center relative z-10">
              <div 
                className="w-20 h-20 rounded-full border-4 flex items-center justify-center mb-6 shadow-2xl"
                style={{
                  borderColor: "var(--color-brand-green)",
                  backgroundColor: "color-mix(in srgb, var(--color-brand-green) 15%, transparent)",
                  boxShadow: "0 0 35px color-mix(in srgb, var(--color-brand-green) 30%, transparent)"
                }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h2 
                className="text-2xl font-black uppercase tracking-tighter text-[var(--color-brand-green)]"
              >
                Clearance Granted
              </h2>
              <p className="text-slate-300 mt-3 text-xs font-semibold uppercase tracking-widest">
                Requisition Log Confirmed & Sent to Management
              </p>
            </div>
          ) : (
            /* Product Details & Checkout View */
            <div className="p-6 sm:p-8 relative z-10">
              
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4 border-b border-[var(--color-brand-border)] pb-3">
                <span 
                  className="font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-2"
                  style={{ color: canAfford ? "var(--color-brand-green)" : "var(--color-brand-blue)" }}
                >
                  <span className="w-2 h-2 rounded-none animate-pulse bg-current" />
                  Product Requisition Specification
                </span>

                <button 
                  onClick={onClose}
                  className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  [ Close ✕ ]
                </button>
              </div>

              {/* Main Product Image View */}
              <div className="w-full h-56 sm:h-64 border border-[var(--color-brand-border)] bg-black rounded-sm overflow-hidden mb-3 relative">
                <img 
                  src={mainPhoto} 
                  alt={selectedItem.item_name}
                  className="w-full h-full object-cover" 
                />
                <span className="absolute bottom-2 left-2 text-[9px] font-bold uppercase tracking-widest bg-black/80 text-slate-300 px-2 py-0.5 rounded-xs border border-slate-700">
                  {selectedItem.category || "General"}
                </span>
              </div>

              {/* Thumbnail Gallery Strip */}
              {photoAssets.length > 1 && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                  {photoAssets.map((photo, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPhotoIndex(idx)}
                      className={`w-14 h-14 rounded-sm border overflow-hidden flex-shrink-0 cursor-pointer transition-all ${
                        idx === selectedPhotoIndex 
                          ? 'border-[var(--color-brand-blue)] ring-1 ring-[var(--color-brand-blue)]' 
                          : 'border-[var(--color-brand-border)] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Product Info */}
              <h3 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight leading-snug mb-2">
                {selectedItem.item_name}
              </h3>

              {/* Description Section */}
              <div className="p-3.5 border border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] rounded-sm mb-6">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  Product Details & Instructions:
                </p>
                <p className="text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-line">
                  {selectedItem.description || "No detailed specifications provided for this reward item."}
                </p>
              </div>

              {/* Financial Deductions or Locked Progress Box */}
              {canAfford ? (
                <div className="p-4 border font-mono text-xs shadow-inner rounded-sm space-y-2 mb-6 bg-[var(--color-brand-bg)] border-[var(--color-brand-border)]">
                  <div className="flex justify-between text-slate-400">
                    <span className="uppercase tracking-wider font-semibold">Current Funds:</span>
                    <span className="text-slate-100 font-bold tabular-nums">{points} PTS</span>
                  </div>
                  <div className="flex justify-between text-slate-400 pb-2 border-b border-[var(--color-brand-border)]">
                    <span className="uppercase tracking-wider font-semibold">Item Valuation:</span>
                    <span className="font-bold tabular-nums text-[var(--color-brand-green)]">
                      -{selectedItem.cost_in_points} PTS
                    </span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-300 uppercase font-bold tracking-wider">Balance After Requisition:</span>
                    <span className="text-slate-100 font-black tabular-nums">{points - selectedItem.cost_in_points} PTS</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 border font-mono text-xs shadow-inner rounded-sm space-y-3 mb-6 bg-[var(--color-brand-bg)] border-amber-500/30">
                  <div className="flex items-center justify-between text-amber-400 font-bold uppercase tracking-wider">
                    <span>🔒 Insufficient Points</span>
                    <span className="tabular-nums">Need +{pointsNeeded} PTS More</span>
                  </div>
                  <div className="w-full h-2 border rounded-full overflow-hidden bg-black/60 border-amber-500/30">
                    <div 
                      className="h-full bg-amber-500 transition-all duration-500" 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Current: {points} PTS</span>
                    <span>Required: {selectedItem.cost_in_points} PTS</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button 
                  onClick={onClose}
                  disabled={isProcessing}
                  className="flex-1 py-3.5 border font-bold uppercase tracking-widest text-[10px] transition-colors disabled:opacity-30 rounded-sm cursor-pointer text-slate-400 bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] hover:border-[var(--color-brand-blue)] hover:text-white"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    if (canAfford && !isProcessing) {
                      onConfirm();
                    }
                  }}
                  disabled={isProcessing || !canAfford}
                  className={`flex-1 py-3.5 font-bold uppercase tracking-widest text-[10px] transition-all duration-200 flex justify-center items-center rounded-sm border shadow-md ${
                    canAfford
                      ? 'bg-[var(--color-brand-green)] border-[var(--color-brand-green)] text-slate-950 hover:bg-white hover:border-white cursor-pointer'
                      : 'bg-slate-800/80 border-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                  }`}
                >
                  {isProcessing 
                    ? "Authorizing..." 
                    : canAfford 
                    ? "Confirm Requisition ↗" 
                    : "Insufficient Points 🔒"}
                </button>
              </div>

            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}