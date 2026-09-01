"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { 
  getFulfillmentOrders, 
  updateOrderStatus, 
  cancelAndRefundOrder,
  RedemptionRecord,
  UserProfile 
} from "@/lib/db/operations";

interface FulfillmentBoardProps {
  itemVariants: Variants;
  managers: UserProfile[];
}

const STATUS_OPTIONS = [
  { value: "pending_pickup", label: "PENDING", color: "text-[#eab308]", border: "border-[#eab308]/50" },
  { value: "in_progress", label: "IN PROGRESS", color: "text-[var(--color-brand-blue,#0088ff)]", border: "border-[var(--color-brand-blue,#0088ff)]" },
  { value: "ordered", label: "ORDERED / SHIPPING", color: "text-[#a855f7]", border: "border-[#a855f7]/50" },
  { value: "fulfilled", label: "FULFILLED", color: "text-[var(--color-brand-green,#00ff9d)]", border: "border-[var(--color-brand-green,#00ff9d)]" },
];

export default function FulfillmentBoard({ itemVariants, managers = [] }: FulfillmentBoardProps) {
  const [supabase] = useState(() => createClient());
  const [orders, setOrders] = useState<RedemptionRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cancellingOrder, setCancellingOrder] = useState<RedemptionRecord | null>(null);
  const [isProcessingCancel, setIsProcessingCancel] = useState<boolean>(false);

  const fetchOrders = async () => {
    const data = await getFulfillmentOrders(supabase);
    setOrders(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [supabase]);

  const handleStatusChange = async (order: RedemptionRecord, newStatus: string) => {
    const assignedMgrId = order.assigned_manager_id ?? null;
    await updateOrderStatus(supabase, order.id, newStatus, assignedMgrId);
    await fetchOrders();
  };

  const handleManagerChange = async (order: RedemptionRecord, newManagerId: string) => {
    const managerIdToSave = newManagerId === "" ? null : newManagerId;
    await updateOrderStatus(supabase, order.id, order.status, managerIdToSave);
    await fetchOrders();
  };

  const handleConfirmCancel = async () => {
    if (!cancellingOrder || isProcessingCancel) return;
    setIsProcessingCancel(true);

    const assignedMgrId = cancellingOrder.assigned_manager_id ?? null;
    const res = await cancelAndRefundOrder(supabase, cancellingOrder, assignedMgrId);

    if (res.success) {
      setCancellingOrder(null);
      await fetchOrders();
    } else {
      alert(`Failed to cancel order: ${res.error}`);
    }
    setIsProcessingCancel(false);
  };

  if (isLoading) {
    return (
      <div className="p-8 border border-dashed border-[var(--color-brand-border)] text-center text-xs font-mono text-slate-500 uppercase tracking-widest rounded-sm">
        <span className="animate-pulse">Loading Fulfillment Logs...</span>
      </div>
    );
  }

  const activeOrders = orders.filter(o => o.status !== 'fulfilled' && o.status !== 'cancelled');
  const completedOrders = orders.filter(o => o.status === 'fulfilled');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');

  return (
    <motion.div variants={itemVariants} className="space-y-6 font-mono text-slate-100 relative select-none">
      
      {/* CANCEL & REFUND CONFIRMATION MODAL POPUP */}
      <AnimatePresence>
        {cancellingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--color-brand-card,#070a10)] border border-[var(--color-brand-red,#ff3b5c)] p-6 sm:p-7 rounded-sm shadow-2xl max-w-lg w-full relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-red,#ff3b5c)]" />
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-sm bg-red-950/60 border border-[var(--color-brand-red,#ff3b5c)]/60 flex items-center justify-center shrink-0">
                  <span className="text-[var(--color-brand-red,#ff3b5c)] font-bold text-base">✕</span>
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-white tracking-tight">
                    Cancel & Refund Requisition?
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-widest">
                    Safety Reward Reversal Protocol
                  </p>
                </div>
              </div>

              <div className="bg-[var(--color-brand-bg,#030914)] border border-slate-800 p-4 rounded-sm space-y-2 text-xs font-sans text-slate-300 my-4 leading-relaxed">
                <p>
                  Are you sure you want to cancel the order for <strong className="text-white uppercase">{cancellingOrder.item?.item_name}</strong>?
                </p>
                <ul className="list-disc list-inside text-slate-400 space-y-1 text-xs font-mono mt-2">
                  <li><span className="text-[var(--color-brand-red,#ff3b5c)] font-bold">Status:</span> Marked as CANCELLED</li>
                  <li><span className="text-[var(--color-brand-green,#00ff9d)] font-bold">Refund:</span> +{cancellingOrder.points_spent} PTS returned to {cancellingOrder.employee?.nickname || cancellingOrder.employee?.first_name}</li>
                  <li><span className="text-[var(--color-brand-blue,#0088ff)] font-bold">Inventory:</span> +1 unit restored to stock</li>
                </ul>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setCancellingOrder(null)}
                  disabled={isProcessingCancel}
                  className="flex-1 min-h-[44px] py-2.5 px-4 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-black uppercase text-xs tracking-wider rounded-sm transition-all cursor-pointer active:scale-[0.98] touch-manipulation focus:outline-none"
                >
                  Nevermind
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={isProcessingCancel}
                  className="flex-1 min-h-[44px] py-2.5 px-4 bg-[var(--color-brand-red,#ff3b5c)] hover:bg-white active:bg-slate-200 text-white hover:text-black font-black uppercase text-xs tracking-wider rounded-sm transition-all cursor-pointer shadow-[0_0_15px_rgba(255,59,92,0.3)] active:scale-[0.98] touch-manipulation focus:outline-none"
                >
                  {isProcessingCancel ? "Refunding..." : "Confirm & Refund ↗"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ACTIVE ORDERS QUEUE */}
      <div className="border p-4 sm:p-6 shadow-2xl relative overflow-hidden rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)]">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-blue)]" />
        
        <div className="mb-6 border-b pb-4 border-[var(--color-brand-border)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-slate-100 font-black uppercase tracking-widest text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-[var(--color-brand-blue)] animate-pulse rounded-none" />
              Active Fulfillment Queue
            </h2>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Assign Order Lead & Track Requisition Status
            </p>
          </div>
          <span className="text-xs font-bold text-slate-300 bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] px-3 py-1 rounded-sm">
            {activeOrders.length} ACTIVE
          </span>
        </div>

        <div className="space-y-4">
          {activeOrders.length === 0 ? (
            <p className="text-center text-slate-500 text-xs uppercase font-bold py-8 border border-dashed border-[var(--color-brand-border)]">
              No pending orders in the queue.
            </p>
          ) : (
            activeOrders.map(order => {
              const empName = order.employee?.nickname || order.employee?.first_name || "Unknown User";
              const loc = order.employee?.location || "Unknown Site";
              const itemName = order.item?.item_name || "Unknown Item";
              const photo = order.item?.images?.[0] || order.item?.image_url;
              const statusConfig = STATUS_OPTIONS.find(s => s.value === order.status) || STATUS_OPTIONS[0];

              return (
                <div 
                  key={order.id} 
                  className={`p-4 border rounded-sm bg-[var(--color-brand-bg)] flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between transition-colors hover:border-slate-600 ${statusConfig.border}`}
                >
                  {/* Order Spec */}
                  <div className="flex items-center gap-4 min-w-0">
                    {photo ? (
                      <img src={photo} alt="" className="w-14 h-14 object-cover border border-[var(--color-brand-border)] bg-black rounded-xs shrink-0" />
                    ) : (
                      <div className="w-14 h-14 border border-[var(--color-brand-border)] bg-black/40 flex items-center justify-center text-[10px] text-slate-600 shrink-0">N/A</div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-black text-slate-100 uppercase truncate">{itemName}</h3>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-widest mt-0.5 truncate">
                        <span className="text-[var(--color-brand-green,#00ff9d)] font-bold">{order.points_spent} PTS</span> • {empName} • <span className="text-slate-300">{loc}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Placed: {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Controls: Manager Assignment, Status & Aligned Cancel Button */}
                  <div className="flex flex-wrap sm:flex-nowrap items-end gap-3 w-full lg:w-auto shrink-0">
                    {/* Manager Dropdown */}
                    <div className="flex-1 sm:w-44">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                        Assigned Lead:
                      </label>
                      <select
                        value={order.assigned_manager_id || ""}
                        onChange={(e) => handleManagerChange(order, e.target.value)}
                        className="w-full min-h-[44px] p-2.5 sm:p-3 text-xs font-bold uppercase outline-none cursor-pointer rounded-sm border bg-[var(--color-brand-card)] text-slate-200 border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] touch-manipulation"
                      >
                        <option value="">-- UNASSIGNED --</option>
                        {managers.map(mgr => (
                          <option key={mgr.id} value={mgr.id} className="bg-[var(--color-brand-card)] text-white">
                            {mgr.nickname || mgr.first_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status Dropdown */}
                    <div className="flex-1 sm:w-44">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                        Order Status:
                      </label>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order, e.target.value)}
                        className={`w-full min-h-[44px] p-2.5 sm:p-3 text-xs font-bold uppercase outline-none cursor-pointer rounded-sm border bg-[var(--color-brand-card)] transition-colors ${statusConfig.color} border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)] touch-manipulation`}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value} className="bg-[var(--color-brand-card)] text-slate-200">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Aligned Cancel & Refund Button */}
                    <div className="shrink-0 w-full sm:w-auto">
                      <span className="hidden sm:block text-[10px] font-bold text-transparent select-none uppercase tracking-widest mb-1">
                        Action
                      </span>
                      <button
                        type="button"
                        onClick={() => setCancellingOrder(order)}
                        title="Cancel order and refund points"
                        className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 border border-[var(--color-brand-red,#ff3b5c)]/60 bg-[var(--color-brand-red,#ff3b5c)]/10 hover:bg-[var(--color-brand-red,#ff3b5c)] hover:text-white text-[var(--color-brand-red,#ff3b5c)] rounded-sm text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap active:scale-[0.98] touch-manipulation focus:outline-none"
                      >
                        ✕ Cancel
                      </button>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ARCHIVE GRID (FULFILLED & CANCELLED) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* FULFILLED LOG */}
        <div className="border p-4 sm:p-6 shadow-xl relative overflow-hidden rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] opacity-90">
          <div className="mb-4 border-b pb-3 border-[var(--color-brand-border)] flex justify-between items-center">
            <h2 className="text-slate-300 font-bold uppercase tracking-widest text-xs">
              Fulfilled Orders
            </h2>
            <span className="text-[10px] sm:text-[11px] text-slate-500 uppercase font-bold">{completedOrders.length} Completed</span>
          </div>
          
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {completedOrders.length === 0 ? (
              <p className="text-slate-600 text-xs uppercase font-bold">No fulfilled orders yet.</p>
            ) : (
              completedOrders.map(order => {
                const managerName = order.manager ? (order.manager.nickname || order.manager.first_name) : null;
                return (
                  <div key={order.id} className="flex justify-between items-center py-2 border-b border-[var(--color-brand-border)]/50 last:border-0 text-[10px] sm:text-[11px] uppercase font-bold tracking-wider">
                    <span className="text-slate-400">
                      {order.employee?.nickname || order.employee?.first_name} • <span className="text-slate-200">{order.item?.item_name}</span>
                      {managerName && <span className="text-slate-500 font-normal"> ({managerName})</span>}
                    </span>
                    <span className="text-[var(--color-brand-green,#00ff9d)]">✓ FULFILLED</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CANCELLED & REFUNDED LOG */}
        <div className="border p-4 sm:p-6 shadow-xl relative overflow-hidden rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] opacity-90">
          <div className="mb-4 border-b pb-3 border-[var(--color-brand-border)] flex justify-between items-center">
            <h2 className="text-slate-300 font-bold uppercase tracking-widest text-xs">
              Cancelled / Refunded
            </h2>
            <span className="text-[10px] sm:text-[11px] text-slate-500 uppercase font-bold">{cancelledOrders.length} Voided</span>
          </div>
          
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {cancelledOrders.length === 0 ? (
              <p className="text-slate-600 text-xs uppercase font-bold">No cancelled orders.</p>
            ) : (
              cancelledOrders.map(order => (
                <div key={order.id} className="flex justify-between items-center py-2 border-b border-[var(--color-brand-border)]/50 last:border-0 text-[10px] sm:text-[11px] uppercase font-bold tracking-wider">
                  <span className="text-slate-500 line-through">
                    {order.employee?.nickname || order.employee?.first_name} • {order.item?.item_name}
                  </span>
                  <span className="text-[var(--color-brand-red,#ff3b5c)]">REFUNDED (+{order.points_spent} PTS)</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </motion.div>
  );
}