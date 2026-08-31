"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion, Variants } from "framer-motion";
import Image from "next/image";

// --- CENTRAL SERVICE IMPORT ---
import { 
  getInventoryItems, 
  getUserPointsBalance, 
  redeemStoreItem, 
  InventoryItem 
} from "@/lib/db/operations";

// --- COMPONENT IMPORTS ---
import CatalogGrid from "./_components/CatalogGrid";
import RedemptionModal from "./_components/RedemptionModal";

// --- ANIMATION CONFIGURATIONS ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 15 } },
};

export default function CatalogPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [points, setPoints] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Modal States
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    async function initCatalog() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }
        
        setUserId(user.id);

        const [userPoints, catalogData] = await Promise.all([
          getUserPointsBalance(supabase, user.id),
          getInventoryItems(supabase)
        ]);
          
        setPoints(userPoints);
        setInventoryItems(catalogData);
      } catch (err) {
        console.error("Initialization pipeline runtime exception:", err);
        setErrorMessage("Critical failure initializing connection terminal.");
      } finally {
        setIsLoading(false);
      }
    }
    initCatalog();
  }, [supabase, router]);

  const handleRedeem = async () => {
    if (!selectedItem || !userId) return;
    
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await redeemStoreItem(
        supabase, 
        userId, 
        selectedItem.id, 
        selectedItem.cost_in_points
      );

      if (!result.success) {
        setErrorMessage(`Transaction Denied: ${result.error}`);
        setIsProcessing(false);
        return;
      }

      setIsProcessing(false);
      setIsSuccess(true);
      
      setPoints(prev => prev - selectedItem.cost_in_points);

      const updatedCatalog = await getInventoryItems(supabase);
      setInventoryItems(updatedCatalog);

      setTimeout(() => {
        setIsSuccess(false);
        setSelectedItem(null);
      }, 2500);

    } catch (err) {
      console.error("Purchase handler routing exception:", err);
      setErrorMessage("System error processing order pipeline transaction.");
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[100dvh] font-mono">
        <div 
          className="w-4 h-4 animate-ping rounded-none" 
          style={{ backgroundColor: "var(--color-brand-blue)" }}
        />
      </div>
    );
  }

  return (
    <div className="w-full relative min-h-[100dvh] flex flex-col pt-4 sm:pt-8 pb-28 sm:pb-24 px-3 sm:px-8 font-mono text-slate-100">
      
      {/* Structural Framework Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:32px_32px] z-0" />

      <div className="max-w-7xl mx-auto w-full relative z-10 flex-1 flex flex-col">
        
        {/* Unified Tactical Header Banner */}
        <motion.header 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-8 border tactical-card p-4 sm:p-6 rounded-sm relative overflow-hidden shadow-lg shrink-0"
          style={{
            backgroundColor: "var(--color-brand-card)",
            borderColor: "var(--color-brand-border)"
          }}
        >
          <div 
            className="absolute top-0 left-0 w-full h-[2px]" 
            style={{ backgroundColor: "var(--color-brand-blue)" }}
          />
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
            
            {/* Logo + Side-by-Side Large Title */}
            <div className="flex items-center gap-3.5 sm:gap-6">
              <Image
                src="/imclogo.svg"
                alt="IMC Logo"
                width={160}
                height={45}
                className="h-8 sm:h-12 w-auto object-contain flex-shrink-0"
                priority
              />
              <div className="h-8 sm:h-10 w-[2px] bg-[var(--color-brand-border)] hidden sm:block" />
              <div>
                <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-none animate-pulse bg-[var(--color-brand-blue)] hidden sm:inline-block" />
                  Point Store
                </h1>
              </div>
            </div>

            {/* Available Funds Card */}
            <div 
              className="border p-2.5 sm:p-4 flex items-center justify-between sm:justify-start gap-4 sm:gap-6 shadow-xl rounded-sm w-full sm:w-auto"
              style={{
                backgroundColor: "var(--color-brand-bg)",
                borderColor: "var(--color-brand-border)"
              }}
            >
              <div>
                <p className="text-slate-400 text-[9px] sm:text-[10px] uppercase font-bold tracking-widest mb-0.5">Available Funds</p>
                <p 
                  className="text-2xl sm:text-3xl font-black tabular-nums tracking-tighter"
                  style={{ color: "var(--color-brand-blue)" }}
                >
                  {points} PTS
                </p>
              </div>
              <div 
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border flex items-center justify-center ml-auto"
                style={{
                  borderColor: "color-mix(in srgb, var(--color-brand-blue) 40%, transparent)",
                  backgroundColor: "color-mix(in srgb, var(--color-brand-blue) 10%, transparent)"
                }}
              >
                <div 
                  className="w-2 h-2 rounded-full animate-pulse" 
                  style={{ backgroundColor: "var(--color-brand-blue)" }}
                />
              </div>
            </div>
          </div>
        </motion.header>

        {/* Runtime Error State Alert */}
        {errorMessage && (
          <div 
            className="mb-4 sm:mb-6 p-3 sm:p-4 border text-[10px] sm:text-xs uppercase tracking-wider rounded-sm font-bold"
            style={{
              backgroundColor: "color-mix(in srgb, var(--color-brand-red, #f87171) 10%, transparent)",
              borderColor: "color-mix(in srgb, var(--color-brand-red, #f87171) 40%, transparent)",
              color: "var(--color-brand-red, #f87171)"
            }}
          >
            [TERMINAL ERROR] {errorMessage}
          </div>
        )}

        {/* Live Catalog Display */}
        {inventoryItems.length > 0 ? (
          <CatalogGrid 
            items={inventoryItems}
            points={points}
            onSelectItem={(item) => setSelectedItem(item)}
            containerVariants={containerVariants}
            itemVariants={itemVariants}
          />
        ) : (
          <div 
            className="flex-1 flex flex-col items-center justify-center border border-dashed p-8 sm:p-12 text-center rounded-sm"
            style={{
              backgroundColor: "color-mix(in srgb, var(--color-brand-card) 50%, transparent)",
              borderColor: "var(--color-brand-border)"
            }}
          >
            <p className="text-slate-300 text-xs uppercase font-bold tracking-widest">Requisition Catalog Empty</p>
            <p className="text-slate-500 text-xs font-mono mt-1">No operational inventory items currently indexed.</p>
          </div>
        )}
      </div>

      {/* Requisition Confirmation Modal */}
      <RedemptionModal 
        selectedItem={selectedItem}
        points={points}
        isProcessing={isProcessing}
        isSuccess={isSuccess}
        onClose={() => setSelectedItem(null)}
        onConfirm={handleRedeem}
      />
    </div>
  );
}