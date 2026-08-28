"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion, Variants } from "framer-motion";

// --- CENTRAL DATA SERVICE IMPORT ---
import { 
  addInventoryItem, 
  updateInventoryItem,
  deleteInventoryItemById, 
  InventoryItem 
} from "@/lib/db/operations";

interface PrizeInventoryProps {
  inventory: InventoryItem[];
  fetchInventory: () => Promise<void>;
  itemVariants: Variants;
}

const CATEGORIES = ["Outdoor", "Apparel", "Tools", "Family", "Electronics"];

export default function PrizeInventory({ inventory = [], fetchInventory, itemVariants }: PrizeInventoryProps) {
  const [supabase] = useState(() => createClient());

  // Editing vs Adding Mode State
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [itemName, setItemName] = useState<string>("");
  const [itemCost, setItemCost] = useState<string>("");
  const [itemStock, setItemStock] = useState<string>("");
  const [itemCategory, setItemCategory] = useState<string>("Apparel");
  const [itemDescription, setItemDescription] = useState<string>("");
  const [itemImages, setItemImages] = useState<string[]>([""]);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load item into form for editing
  const startEditing = (item: InventoryItem) => {
    setEditingId(item.id);
    setItemName(item.item_name || "");
    setItemCost(String(item.cost_in_points || 0));
    setItemStock(String(item.quantity_in_stock || 0));
    setItemCategory(item.category || "General");
    setItemDescription(item.description || "");
    setIsFeatured(Boolean(item.is_featured));
    
    if (item.images && item.images.length > 0) {
      setItemImages(item.images);
    } else if (item.image_url) {
      setItemImages([item.image_url]);
    } else {
      setItemImages([""]);
    }
    setFormError(null);
  };

  // Reset form back to "Add" mode
  const cancelEditing = () => {
    setEditingId(null);
    setItemName("");
    setItemCost("");
    setItemStock("");
    setItemCategory("Apparel");
    setItemDescription("");
    setItemImages([""]);
    setIsFeatured(false);
    setFormError(null);
  };

  // Dynamic Image URL Handler
  const handleImageChange = (index: number, value: string) => {
    const updated = [...itemImages];
    updated[index] = value;
    setItemImages(updated);
  };

  const addImageField = () => {
    setItemImages([...itemImages, ""]);
  };

  const removeImageField = (index: number) => {
    if (itemImages.length === 1) {
      setItemImages([""]);
      return;
    }
    setItemImages(itemImages.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    const cleanImages = itemImages.map(img => img.trim()).filter(img => img.length > 0);

    const payload = {
      itemName,
      costInPoints: parseInt(itemCost, 10),
      quantityInStock: parseInt(itemStock, 10),
      category: itemCategory,
      description: itemDescription,
      images: cleanImages,
      isFeatured
    };

    if (editingId) {
      // UPDATE EXISTING ITEM
      const result = await updateInventoryItem(supabase, editingId, payload);
      if (result.success) {
        await fetchInventory();
        cancelEditing();
      } else {
        console.error("Failed to update inventory record:", result.error);
        setFormError(`Update Refused: ${result.error || "Unable to modify catalog item."}`);
      }
    } else {
      // ADD NEW ITEM
      const result = await addInventoryItem(supabase, payload);
      if (result.success) { 
        await fetchInventory(); 
        cancelEditing();
      } else {
        console.error("Failed to commit inventory record:", result.error);
        setFormError(`Transaction Refused: ${result.error || "Unable to index catalog item."}`);
      }
    }
    setIsSubmitting(false);
  };
  
  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this catalog item?")) return;
    
    const result = await deleteInventoryItemById(supabase, id);
    if (result.success) {
      if (editingId === id) cancelEditing();
      await fetchInventory();
    } else {
      console.error("Failed to delete inventory item:", result.error);
      alert(`Delete Failed: ${result.error}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-slate-100">
      {/* Form: Add or Edit Store Item */}
      <motion.div 
        variants={itemVariants} 
        className="border p-4 sm:p-6 shadow-2xl relative overflow-hidden group rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)]"
      >
        {/* Top Accent Line (Amber when editing, Blue when creating) */}
        <div 
          className={`absolute top-0 left-0 w-full h-[2px] transition-colors duration-300 ${
            editingId ? "bg-amber-400" : "bg-[var(--color-brand-blue)]"
          }`} 
        />
        
        <div className="mb-6 border-b pb-4 border-[var(--color-brand-border)] flex justify-between items-start">
          <div>
            <h2 className="text-slate-100 font-black uppercase tracking-widest text-sm sm:text-base flex items-center gap-2">
              <span className={`w-2 h-2 rounded-none animate-pulse ${editingId ? "bg-amber-400" : "bg-[var(--color-brand-blue)]"}`} />
              {editingId ? "Edit Catalog Item" : "Provision Store Item"}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              {editingId ? "Update Valuation, Inventory Stock & Media Assets" : "Add Rich Product Details, Gallery Photos & Specs"}
            </p>
          </div>
          {editingId && (
            <button 
              type="button"
              onClick={cancelEditing}
              className="text-[10px] font-bold uppercase text-slate-400 hover:text-white px-2 py-1 border border-slate-700 bg-slate-900 rounded-sm cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
        
        {formError && (
          <div className="mb-4 p-3 border text-xs font-bold uppercase tracking-wider rounded-sm bg-amber-500/10 border-amber-500/50 text-[var(--color-metric-observation)]">
            {formError}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-300 tracking-widest block mb-1">Item Title</label>
            <input 
              type="text" 
              value={itemName} 
              onChange={(e) => setItemName(e.target.value)} 
              required 
              placeholder="e.g. Carhartt Heavyweight Hoodie" 
              className="w-full p-3 text-slate-100 text-xs font-bold uppercase outline-none transition-colors rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)]" 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-300 tracking-widest block mb-1">Point Valuation</label>
              <input 
                type="number" 
                value={itemCost} 
                onChange={(e) => setItemCost(e.target.value)} 
                required 
                placeholder="Points" 
                className="w-full p-3 text-slate-100 text-xs font-bold uppercase outline-none transition-colors rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)]" 
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-300 tracking-widest block mb-1">Stock Quantity</label>
              <input 
                type="number" 
                value={itemStock} 
                onChange={(e) => setItemStock(e.target.value)} 
                required 
                placeholder="In Stock QTY" 
                className="w-full p-3 text-slate-100 text-xs font-bold uppercase outline-none transition-colors rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)]" 
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-300 tracking-widest block mb-1">Category Classification</label>
            <select
              value={itemCategory}
              onChange={(e) => setItemCategory(e.target.value)}
              className="w-full p-3 text-slate-100 text-xs font-bold uppercase outline-none cursor-pointer rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)]"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat} style={{ backgroundColor: "var(--color-brand-card)" }}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-300 tracking-widest block mb-1">
              Product Description & Specs
            </label>
            <textarea 
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              placeholder="Detail sizing, material quality, warranty, or pickup instructions..."
              className="w-full p-3 text-slate-100 text-xs font-sans h-24 outline-none resize-none transition-colors rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)]"
            />
          </div>

          {/* Photo Gallery Link Array */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold uppercase text-slate-300 tracking-widest block">
                Photo Gallery URLs
              </label>
              <button
                type="button"
                onClick={addImageField}
                className="text-[9px] font-bold uppercase text-[var(--color-brand-blue)] hover:underline cursor-pointer"
              >
                + Add Photo URL
              </button>
            </div>

            <div className="space-y-2">
              {itemImages.map((imgUrl, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input 
                    type="url" 
                    value={imgUrl} 
                    onChange={(e) => handleImageChange(index, e.target.value)} 
                    placeholder={index === 0 ? "Primary Image URL (HTTPS)" : `Gallery Photo #${index + 1} URL`} 
                    className="flex-1 p-2.5 text-slate-100 text-xs font-mono outline-none transition-colors rounded-sm border bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] focus:border-[var(--color-brand-blue)]" 
                  />
                  {itemImages.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="px-2.5 py-2 text-xs font-bold text-[var(--color-brand-red)] border border-[var(--color-brand-border)] hover:bg-red-950/40 rounded-sm cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Featured Spotlight Toggle */}
          <div className="flex items-center gap-3 pt-2">
            <input 
              type="checkbox"
              id="isFeatured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 cursor-pointer accent-[var(--color-brand-blue)]"
            />
            <label htmlFor="isFeatured" className="text-xs font-bold uppercase tracking-wider text-slate-200 cursor-pointer">
              Feature Item in Store Banner
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            {editingId && (
              <button
                type="button"
                onClick={cancelEditing}
                className="flex-1 py-3.5 border border-slate-700 text-slate-300 font-bold uppercase tracking-wider text-xs hover:bg-slate-800 transition-colors rounded-sm cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`flex-1 py-3.5 font-bold uppercase tracking-wider text-xs transition-all duration-200 cursor-pointer rounded-sm ${
                editingId 
                  ? "bg-amber-400 hover:bg-white text-black shadow-[0_0_15px_rgba(251,191,36,0.25)]" 
                  : "bg-[var(--color-brand-blue)] hover:bg-white hover:text-black text-white shadow-[0_0_15px_rgba(0,136,255,0.25)]"
              }`}
            >
              {isSubmitting 
                ? "Saving..." 
                : editingId 
                ? "✓ Save Catalog Changes ↗" 
                : "+ Commit Item To Catalog ↗"}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Current Stock Table */}
      <motion.div 
        variants={itemVariants} 
        className="lg:col-span-2 border p-4 sm:p-6 shadow-2xl relative overflow-hidden group rounded-sm bg-[var(--color-brand-card)] border-[var(--color-brand-border)] flex flex-col justify-between"
      >
        <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-brand-border)] group-hover:bg-[var(--color-brand-blue)] transition-colors duration-300" />

        <div>
          <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 mb-6 border-b pb-4 border-[var(--color-brand-border)]">
            <div>
              <h2 className="text-slate-100 font-black uppercase tracking-widest text-sm sm:text-base flex items-center gap-2">
                <span className="w-2 h-2 bg-[var(--color-brand-blue)] rounded-none animate-pulse" />
                Active Store Catalog
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Manage Details, Photo Assets & Available Stock
              </p>
            </div>
            <span className="text-xs text-slate-300 font-bold uppercase">
              {(inventory || []).length} Items Indexed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[500px]">
              <thead>
                <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b bg-[var(--color-brand-bg)] border-[var(--color-brand-border)]">
                  <th className="py-3 px-3">Item Details</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Point Cost</th>
                  <th className="py-3 px-3">Stock Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-brand-border)]">
                {(inventory || []).length > 0 ? (
                  inventory.map(item => {
                    const photosCount = (item.images?.length || (item.image_url ? 1 : 0));
                    const primaryThumb = item.images?.[0] || item.image_url;
                    const isCurrentlyEditing = editingId === item.id;

                    return (
                      <tr 
                        key={item.id} 
                        className={`transition-colors ${
                          isCurrentlyEditing 
                            ? "bg-amber-400/10 border-l-2 border-amber-400" 
                            : "hover:bg-[var(--color-brand-bg)]/50"
                        }`}
                      >
                        <td className="py-3.5 px-3 text-slate-100 font-bold uppercase text-xs">
                          <div className="flex items-center gap-3">
                            {primaryThumb ? (
                              <img 
                                src={primaryThumb} 
                                alt={item.item_name}
                                className="w-10 h-10 object-cover border border-[var(--color-brand-border)] rounded-xs bg-black flex-shrink-0" 
                              />
                            ) : (
                              <div className="w-10 h-10 border border-[var(--color-brand-border)] bg-black/40 flex items-center justify-center text-[9px] text-slate-500 flex-shrink-0">
                                NO PHOTO
                              </div>
                            )}
                            <div>
                              <p className="flex items-center gap-1.5">
                                <span>{item.item_name}</span>
                                {item.is_featured && (
                                  <span className="text-[8px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-1 py-0.2 rounded-xs">
                                    ★ FEATURED
                                  </span>
                                )}
                              </p>
                              <p className="text-[9px] text-slate-400 font-normal lowercase tracking-normal mt-0.5 max-w-xs line-clamp-1">
                                {item.description || "No description provided."}
                              </p>
                              {photosCount > 0 && (
                                <p className="text-[8px] text-[var(--color-brand-blue)] font-bold mt-0.5">
                                  📷 {photosCount} {photosCount === 1 ? 'Asset' : 'Assets'}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-slate-400 font-bold uppercase text-[10px] whitespace-nowrap">
                          {item.category || "General"}
                        </td>
                        <td className="py-3.5 px-3 font-bold tabular-nums text-xs whitespace-nowrap text-[var(--color-metric-safe-acts)]">
                          {item.cost_in_points} PTS
                        </td>
                        <td className={`py-3.5 px-3 font-bold tabular-nums text-xs whitespace-nowrap ${item.quantity_in_stock > 0 ? 'text-[var(--color-metric-safe-acts)]' : 'text-[var(--color-metric-assistance)]'}`}>
                          {item.quantity_in_stock > 0 ? `${item.quantity_in_stock} UNITS` : 'OUT OF STOCK'}
                        </td>
                        <td className="py-3.5 px-3 text-right whitespace-nowrap space-x-2">
                          <button 
                            type="button"
                            onClick={() => startEditing(item)} 
                            className="text-xs font-bold uppercase hover:underline cursor-pointer text-[var(--color-brand-blue)] hover:text-white"
                          >
                            [ Edit ]
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleDeleteItem(item.id)} 
                            className="text-xs font-bold uppercase hover:underline cursor-pointer text-[var(--color-brand-red)] hover:text-red-400"
                          >
                            [ Delete ]
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                      [ NO ITEMS CURRENTLY INDEXED IN INVENTORY ]
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pt-4 mt-6 border-t border-[var(--color-brand-border)] flex justify-between text-[10px] text-slate-500 uppercase">
          <span>SUPABASE INVENTORY CLUSTER</span>
          <span>ONLINE CATALOG SYSTEM</span>
        </div>
      </motion.div>
    </div>
  );
}

