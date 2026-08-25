"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion, Variants } from "framer-motion";

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
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
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
      <div className="w-full h-full flex items-center justify-center min-h-[calc(100vh-4rem)] font-mono">
        <div 
          className="w-4 h-4 animate-ping rounded-none" 
          style={{ backgroundColor: "var(--color-brand-blue)" }}
        />
      </div>
    );
  }

  return (
    <div className="w-full relative min-h-full flex flex-col pt-8 pb-24 px-4 sm:px-8 font-mono text-slate-100">
      
      {/* Structural Visual Framework Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:32px_32px] z-0" />

      <div className="max-w-7xl mx-auto w-full relative z-10 flex-1 flex flex-col">
        
        {/* Unified Tactical Header Banner Block */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 border tactical-card p-6 rounded-sm relative overflow-hidden shadow-lg shrink-0"
          style={{
            backgroundColor: "var(--color-brand-card)",
            borderColor: "var(--color-brand-border)"
          }}
        >
          <div 
            className="absolute top-0 left-0 w-full h-[2px]" 
            style={{ backgroundColor: "var(--color-brand-blue)" }}
          />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-100 uppercase tracking-tighter flex items-center gap-2.5">
                <span 
                  className="w-2 h-2 animate-pulse rounded-none" 
                  style={{ backgroundColor: "var(--color-brand-blue)" }}
                />
                Quartermaster
              </h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.25em] mt-1">
                Authorized Requisition Terminal
              </p>
            </div>

            <div 
              className="border p-4 flex items-center gap-6 shadow-xl rounded-sm min-w-[220px]"
              style={{
                backgroundColor: "var(--color-brand-bg)",
                borderColor: "var(--color-brand-border)"
              }}
            >
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Available Funds</p>
                <p 
                  className="text-3xl font-black tabular-nums tracking-tighter"
                  style={{ color: "var(--color-brand-blue)" }}
                >
                  {points} PTS
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-full border flex items-center justify-center ml-auto"
                style={{
                  borderColor: "color-mix(in srgb, var(--color-brand-blue) 40%, transparent)",
                  backgroundColor: "color-mix(in srgb, var(--color-brand-blue) 10%, transparent)"
                }}
              >
                <div 
                  className="w-2.5 h-2.5 rounded-full animate-pulse" 
                  style={{ backgroundColor: "var(--color-brand-blue)" }}
                />
              </div>
            </div>
          </div>
        </motion.header>

        {/* Runtime Error State Alert Header Bar */}
        {errorMessage && (
          <div 
            className="mb-6 p-4 border text-xs uppercase tracking-wider rounded-sm font-bold"
            style={{
              backgroundColor: "color-mix(in srgb, var(--color-brand-red, #f87171) 10%, transparent)",
              borderColor: "color-mix(in srgb, var(--color-brand-red, #f87171) 40%, transparent)",
              color: "var(--color-brand-red, #f87171)"
            }}
          >
            [TERMINAL ERROR] {errorMessage}
          </div>
        )}

        {/* Live Catalog Display Block Module */}
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
            className="flex-1 flex flex-col items-center justify-center border border-dashed p-12 text-center rounded-sm"
            style={{
              backgroundColor: "color-mix(in srgb, var(--color-brand-card) 50%, transparent)",
              borderColor: "var(--color-brand-border)"
            }}
          >
            <p className="text-slate-300 text-xs uppercase font-bold tracking-widest">Requisition Catalog Empty</p>
            <p className="text-slate-500 text-xs font-mono mt-1">No operational inventory items currently indexed by management.</p>
          </div>
        )}
      </div>

      {/* Requisition Confirmation Modal Layer */}
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