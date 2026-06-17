/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  AlertTriangle, 
  PlusCircle, 
  ArrowRight,
  Archive,
  Info
} from "lucide-react";
import { Product } from "../types";
import { getAllFromStore, putInStore } from "../lib/indexedDB";

interface InventoryProps {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

export default function InventoryPanel({ refreshTrigger, triggerRefresh }: InventoryProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [alertFilter, setAlertFilter] = useState<"All" | "Low" | "Expiring">("All");

  // Add/Edit Modal controls
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Analgesic");
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [retailPrice, setRetailPrice] = useState<number>(0);
  const [reorderLevel, setReorderLevel] = useState<number>(50);
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [stockQty, setStockQty] = useState<number>(100);
  const [drapControlled, setDrapControlled] = useState(false);
  const [description, setDescription] = useState("");

  useEffect(() => {
    loadProducts();
  }, [refreshTrigger]);

  async function loadProducts() {
    try {
      const all = await getAllFromStore<Product>("products");
      setProducts(all);
    } catch (err) {
      console.error("Error loading product inventory:", err);
    }
  }

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName("");
    setCategory("Analgesic");
    setUnitPrice(0);
    setRetailPrice(0);
    setReorderLevel(20);
    setBatchNumber(`BMS-${Math.floor(100 + Math.random() * 900)}`);
    setExpiryDate("2027-12-31");
    setStockQty(100);
    setDrapControlled(false);
    setDescription("");
    setModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategory(prod.category);
    setUnitPrice(prod.unitPrice);
    setRetailPrice(prod.retailPrice);
    setReorderLevel(prod.reorderLevel);
    setBatchNumber(prod.batchNumber);
    setExpiryDate(prod.expiryDate);
    setStockQty(prod.stockQty);
    setDrapControlled(prod.drapControlled);
    setDescription(prod.description || "");
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !batchNumber || !expiryDate) {
      alert("Please fill in all mandatory fields.");
      return;
    }

    const payload: Product = {
      id: editingProduct ? editingProduct.id : `P-${Date.now()}`,
      name,
      category,
      unitPrice: Number(unitPrice),
      retailPrice: Number(retailPrice),
      reorderLevel: Number(reorderLevel),
      batchNumber,
      expiryDate,
      stockQty: Number(stockQty),
      drapControlled,
      description
    };

    try {
      await putInStore<Product>("products", payload);
      setModalOpen(false);
      triggerRefresh(); // Increment trigger to sync other UI parts
      loadProducts();
    } catch (err) {
      console.error("Failed to write product to IndexedDB:", err);
      alert("Error saving item to local storage database.");
    }
  };

  // Filter medications
  const categoriesList = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  const processedProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.batchNumber.toLowerCase().includes(search.toLowerCase()) || 
                          p.category.toLowerCase().includes(search.toLowerCase());
                          
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;

    let matchesAlert = true;
    if (alertFilter === "Low") {
      matchesAlert = p.stockQty <= p.reorderLevel;
    } else if (alertFilter === "Expiring") {
      // Expiring in months check
      const expYear = parseInt(p.expiryDate.split("-")[0]);
      const expMonth = parseInt(p.expiryDate.split("-")[1]);
      matchesAlert = (expYear === 2026 && expMonth <= 10);
    }

    return matchesSearch && matchesCategory && matchesAlert;
  });

  return (
    <div className="space-y-6 text-left" id="inventory-management-module">
      
      {/* Block title and buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 border-b border-slate-100 pb-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-800">
            Medicine Warehouse Stock
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Add or audit pharmacist batches, track DRAP classifications, monitor expirations.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-teal-700 hover:bg-teal-650 text-white font-semibold text-xs py-3 px-5 rounded-2xl transition flex items-center space-x-1.5 shadow-sm active:scale-97 cursor-pointer"
          id="add-medicine-btn"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Formula</span>
        </button>
      </div>

      {/* Filter and search parameters */}
      <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-2xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by brand name, generic term, batch ID..."
            className="w-full bg-slate-50 border border-slate-205 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:border-teal-500 focus:outline-hidden focus:bg-white transition"
          />
        </div>

        {/* Categories selector filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center space-x-1 bg-slate-50 rounded-xl p-1 border border-slate-205">
            {categoriesList.slice(0, 5).map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`py-1.5 px-3 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  categoryFilter === cat 
                    ? "bg-white text-teal-700 shadow-2xs" 
                    : "text-slate-500 hover:text-slate-800 font-normal"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Quick Alert Tags */}
          <div className="flex items-center space-x-1 bg-slate-50 rounded-xl p-1 border border-slate-205">
            <button
              onClick={() => setAlertFilter("All")}
              className={`py-1.5 px-3 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                alertFilter === "All" ? "bg-white text-slate-800 shadow-2xs" : "text-slate-500"
              }`}
            >
              All Stock
            </button>
            <button
              onClick={() => setAlertFilter("Low")}
              className={`py-1.5 px-3 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                alertFilter === "Low" ? "bg-amber-100/60 text-amber-800 font-extrabold" : "text-slate-500"
              }`}
            >
              Low Stock Alert
            </button>
            <button
              onClick={() => setAlertFilter("Expiring")}
              className={`py-1.5 px-3 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                alertFilter === "Expiring" ? "bg-rose-100/60 text-rose-800 font-extrabold" : "text-slate-500"
              }`}
            >
              Nearing Expiry
            </button>
          </div>
        </div>
      </div>

      {/* Main Table view of Products */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                <th className="py-4 px-6 font-semibold">Brand / Generic Formula</th>
                <th className="py-4 px-6 font-semibold">Classification</th>
                <th className="py-4 px-6 font-semibold">Batch Number</th>
                <th className="py-4 px-6 font-semibold">Expiry Date</th>
                <th className="py-4 px-6 font-semibold text-right">Cost (PKR)</th>
                <th className="py-4 px-6 font-semibold text-right">Retail (PKR)</th>
                <th className="py-4 px-6 font-semibold text-right">Current Stock</th>
                <th className="py-4 px-6 font-semibold text-center">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 text-xs">
              {processedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-sans space-y-2">
                    <Archive className="h-8 w-8 mx-auto text-slate-300" />
                    <p>No medical formulas found matching this search or filter.</p>
                  </td>
                </tr>
              ) : (
                processedProducts.map((prod) => {
                  const isLow = prod.stockQty <= prod.reorderLevel;
                  
                  // Expiry calculations
                  const expYear = parseInt(prod.expiryDate.split("-")[0]);
                  const expMonth = parseInt(prod.expiryDate.split("-")[1]);
                  const isSoonExp = (expYear === 2026 && expMonth <= 10);

                  return (
                    <tr 
                      key={prod.id} 
                      className={`hover:bg-slate-50/50 transition ${
                        prod.stockQty <= 0 ? "bg-rose-50/15" : ""
                      }`}
                      id={`row-prod-${prod.id}`}
                    >
                      <td className="py-4.5 px-6 font-sans">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-850 block">{prod.name}</span>
                          <span className="text-[10px] text-slate-400 block truncate max-w-xs italic leading-none">
                            {prod.description || "No generic description entered."}
                          </span>
                        </div>
                      </td>
                      <td className="py-4.5 px-6">
                        <div className="flex items-center space-x-1.5">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-medium font-sans">
                            {prod.category}
                          </span>
                          {prod.drapControlled && (
                            <span className="bg-rose-100 text-rose-800 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                              Controlled Rx
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4.5 px-6 font-mono text-slate-500 font-bold">
                        {prod.batchNumber}
                      </td>
                      <td className={`py-4.5 px-6 font-mono font-bold ${
                        isSoonExp ? "text-rose-600 font-black animate-pulse" : "text-slate-500"
                      }`}>
                        {prod.expiryDate} {isSoonExp && "[EXPIRING]"}
                      </td>
                      <td className="py-4.5 px-6 text-right font-mono text-slate-600">
                        Rs {prod.unitPrice.toLocaleString()}
                      </td>
                      <td className="py-4.5 px-6 text-right font-mono font-bold text-teal-850">
                        Rs {prod.retailPrice.toLocaleString()}
                      </td>
                      <td className="py-4.5 px-6 text-right font-mono">
                        <span className={`px-2 py-1 rounded-md font-bold text-xs ${
                          prod.stockQty <= 0 
                            ? "bg-rose-150 text-rose-800" 
                            : isLow 
                              ? "bg-amber-100 text-amber-800" 
                              : "text-slate-700"
                        }`}>
                          {prod.stockQty.toLocaleString()} units
                        </span>
                        {isLow && (
                          <span className="block text-[9px] text-amber-600 italic font-sans font-bold mt-1 uppercase leading-none">
                            Low Stock Limit
                          </span>
                        )}
                      </td>
                      <td className="py-4.5 px-6 text-center">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-205 text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer flex items-center space-x-1 text-[11px] mx-auto active:scale-95"
                          id={`edit-prod-trigger-${prod.id}`}
                        >
                          <Edit2 className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clean slide in Add/Edit Product drawer modal block */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl relative space-y-6">
            
            {/* Modal Drawer Header */}
            <div className="flex justify-between items-center border-b border-slate-55 pb-3">
              <h3 className="font-display font-bold text-slate-800 text-base">
                {editingProduct ? "Modify Registered Drug" : "Register New Medical Formula"}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-mono font-bold uppercase cursor-pointer"
              >
                Close (Esc)
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleFormSubmit} className="grid grid-cols-2 gap-4 text-xs font-sans">
              
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-550 uppercase">Brand/Generic Drug Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Panadol Forte 500mg"
                  className="w-full bg-slate-50 border border-slate-205 p-2.5 rounded-xl text-xs focus:bg-white text-slate-800 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-550 uppercase">Drug Classification *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 p-2.5 rounded-xl focus:bg-white text-slate-800 cursor-pointer text-xs"
                >
                  <option value="Analgesic">Analgesic (Pain Relief)</option>
                  <option value="Antibiotic">Antibiotic (Inf. Combat)</option>
                  <option value="Anti-inflammatory">Anti-inflammatory</option>
                  <option value="Nutritional Support">Nutritional Multivitamin</option>
                  <option value="Decongestant">Decongestant (Cold/Flue)</option>
                  <option value="Gastrointestinal">Gastrointestinal</option>
                  <option value="Sedative / Psychotropic">Sedative / Controlled Rx</option>
                </select>
              </div>

              <div className="space-y-1 flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-205">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-550 uppercase block">DRAP Controlled?</span>
                  <span className="text-[9px] text-slate-400 block leading-tight">Requires Rx verify Log</span>
                </div>
                <input
                  type="checkbox"
                  checked={drapControlled}
                  onChange={(e) => setDrapControlled(e.target.checked)}
                  className="h-4.5 w-4.5 text-teal-650 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-550 uppercase">Purchase Unit Cost (PKR) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={unitPrice || ""}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                  placeholder="Purchase Cost Price"
                  className="w-full bg-slate-50 border border-slate-205 p-2.5 rounded-xl text-xs focus:bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-550 uppercase">Retail Selling Price (PKR) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={retailPrice || ""}
                  onChange={(e) => setRetailPrice(Number(e.target.value))}
                  placeholder="Sales Retail Price"
                  className="w-full bg-slate-50 border border-slate-205 p-2.5 rounded-xl text-xs focus:bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-550 uppercase">Manufacturing Batch ID *</label>
                <input
                  type="text"
                  required
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="e.g. BATCH-X91"
                  className="w-full bg-slate-50 border border-slate-205 p-2.5 rounded-xl text-xs focus:bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-550 uppercase">Expiration Date *</label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 p-2.5 rounded-xl text-xs focus:bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-550 uppercase">Initial Stock Units *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stockQty}
                  onChange={(e) => setStockQty(Number(e.target.value))}
                  placeholder="Stock count"
                  className="w-full bg-slate-50 border border-slate-205 p-2.5 rounded-xl text-xs focus:bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-550 uppercase">Reorder Safe Threshold *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={reorderLevel}
                  onChange={(e) => setReorderLevel(Number(e.target.value))}
                  placeholder="Warning limit"
                  className="w-full bg-slate-50 border border-slate-205 p-2.5 rounded-xl text-xs focus:bg-white font-mono"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-550 uppercase">Medicine Description & Generic Composition</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter medical formula instructions, paracetamol, ibuprofen content, etc."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-205 p-2.5 rounded-xl text-xs focus:bg-white text-slate-800 focus:outline-hidden"
                />
              </div>

              {/* Action buttons */}
              <div className="col-span-2 flex space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 font-semibold cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-teal-700 hover:bg-teal-650 text-white font-semibold rounded-xl cursor-pointer shadow-md text-center"
                  id="submit-product-form-btn"
                >
                  {editingProduct ? "Update Formula" : "Register Formula"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
