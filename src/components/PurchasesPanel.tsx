/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Plus, 
  AlertTriangle, 
  User, 
  Layers, 
  ChevronRight, 
  CheckCircle2, 
  ArrowUpRight,
  TrendingUp,
  Coins
} from "lucide-react";
import { Product, Purchase, PurchaseItem, Supplier } from "../types";
import { getAllFromStore, putInStore, savePurchaseOffline } from "../lib/indexedDB";

interface PurchasesProps {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

export default function PurchasesPanel({ refreshTrigger, triggerRefresh }: PurchasesProps) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [grnItems, setGrnItems] = useState<Partial<PurchaseItem>[]>([]);

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  async function loadData() {
    try {
      const purList = await getAllFromStore<Purchase>("purchases");
      const prodList = await getAllFromStore<Product>("products");
      const supList = await getAllFromStore<Supplier>("suppliers");

      setPurchases(purList);
      setProducts(prodList);
      setSuppliers(supList);

      if (supList.length > 0) {
        setSelectedSupplierId(supList[0].id);
      }
    } catch (err) {
      console.error("Error loading procurement data:", err);
    }
  }

  const handleOpenGRN = () => {
    setGrnItems([{
      productId: products[0]?.id || "",
      qty: 50,
      costPrice: products[0]?.unitPrice || 10,
      retailPrice: products[0]?.retailPrice || 15,
      batchNumber: `BAT-${Date.now().toString().slice(-4)}`,
      expiryDate: "2027-12-31"
    }]);
    setModalOpen(true);
  };

  const addGrnItemRow = () => {
    setGrnItems([...grnItems, {
      productId: products[0]?.id || "",
      qty: 50,
      costPrice: products[0]?.unitPrice || 10,
      retailPrice: products[0]?.retailPrice || 15,
      batchNumber: `BAT-${Date.now().toString().slice(-4)}`,
      expiryDate: "2027-12-31"
    }]);
  };

  const removeGrnItemRow = (idx: number) => {
    setGrnItems(grnItems.filter((_, i) => i !== idx));
  };

  const handleItemFieldChange = (idx: number, field: keyof PurchaseItem, val: any) => {
    const updated = [...grnItems];
    
    if (field === "productId") {
      const pickedProd = products.find(p => p.id === val);
      if (pickedProd) {
        updated[idx].productId = val;
        updated[idx].costPrice = pickedProd.unitPrice;
        updated[idx].retailPrice = pickedProd.retailPrice;
      }
    } else {
      updated[idx][field] = val as any;
    }

    setGrnItems(updated);
  };

  // Variance detection: compares selected cost price with current catalog cost price to warn of inflation!
  const detectPriceVariance = (item: Partial<PurchaseItem>) => {
    const orig = products.find(p => p.id === item.productId);
    if (!orig) return false;
    return Number(item.costPrice) > orig.unitPrice;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (grnItems.length === 0) {
      alert("Please add at least 1 medicine to the procurement list.");
      return;
    }

    const supplierObj = suppliers.find(s => s.id === selectedSupplierId);
    if (!supplierObj) return;

    let varianceDetected = false;
    const finalItems: PurchaseItem[] = grnItems.map((itm, i) => {
      const prod = products.find(p => p.id === itm.productId);
      const isVariance = detectPriceVariance(itm);
      if (isVariance) varianceDetected = true;

      return {
        id: `PUR-ITEM-${Date.now()}-${i}`,
        purchaseId: `PUR-${Date.now()}`,
        productId: itm.productId!,
        productName: prod?.name || "Unknown Formula",
        qty: Number(itm.qty) || 0,
        costPrice: Number(itm.costPrice) || 0,
        retailPrice: Number(itm.retailPrice) || 0,
        batchNumber: itm.batchNumber || "UNMARKED-B",
        expiryDate: itm.expiryDate || "2028-12-31"
      };
    });

    const totalBill = finalItems.reduce((acc, itm) => acc + (itm.costPrice * itm.qty), 0);

    const payload: Purchase = {
      id: `PUR-${Date.now()}`,
      supplierId: selectedSupplierId,
      supplierName: supplierObj.name,
      branchId: "B1",
      status: "Received", // Goods Received Note status is instantly received
      total: totalBill,
      varianceDetected,
      createdAt: new Date().toISOString(),
      items: finalItems
    };

    try {
      await savePurchaseOffline(payload);
      setModalOpen(false);
      triggerRefresh(); // Refresh general charts
      loadData();
    } catch (err) {
      console.error("Procurement fail:", err);
      alert("Error logging Goods Received Note in local storage.");
    }
  };

  return (
    <div className="space-y-6 text-left" id="purchases-procurement-pane">
      
      {/* Title Details */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 border-b border-slate-100 pb-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-800">
            Stock Procurement Ledger (GRN)
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Manage your medical distributors, write Purchase Invoices, keep track of supplier balances.
          </p>
        </div>
        <button
          onClick={handleOpenGRN}
          className="bg-teal-700 hover:bg-teal-650 text-white font-semibold text-xs py-3 px-5 rounded-2xl transition flex items-center space-x-1.5 shadow-sm active:scale-97 cursor-pointer"
          id="log-grn-btn"
        >
          <Plus className="h-4 w-4" />
          <span>Write Purchase Invoice (GRN)</span>
        </button>
      </div>

      {/* Overview stats of suppliers and payables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Suppliers count */}
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-2xs flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">Matched Distributors</span>
            <span className="text-xl font-bold text-slate-800 block">{suppliers.length} Registered</span>
            <span className="text-[10px] text-slate-500 block">Quetta pharmaceutical market wholesalers</span>
          </div>
          <div className="p-3 bg-teal-50 text-teal-750 rounded-xl">
            <User className="h-5 w-5" />
          </div>
        </div>

        {/* Total payables estimation block */}
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-2xs flex justify-between items-start col-span-2">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">Total Vendor Payables (Accounts Payables)</span>
            <span className="text-xl font-mono font-bold text-teal-850 block">
              Rs {suppliers.reduce((acc, s) => acc + Math.max(0, s.ledgerBalance), 0).toLocaleString()}
            </span>
            <div className="flex space-x-4 pt-1 text-[10px] text-slate-500 font-sans">
              <span>{suppliers.filter(s => s.ledgerBalance > 0).length} Suppliers with balances</span>
              <span>{suppliers.filter(s => s.ledgerBalance < 0).length} Prepaid deposits accounts</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <Coins className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* Supplier balances list directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Purchases invoices history table - col-span-8 */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-5 shadow-2xs space-y-4">
          <h3 className="font-display font-semibold text-base text-slate-800 border-b border-slate-50 pb-3">
            Invoiced Shipments History
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-mono text-slate-400 uppercase tracking-widest text-left">
                  <th className="py-3 px-4">Invoice / GRN ID</th>
                  <th className="py-3 px-4">Distributor Distributor</th>
                  <th className="py-3 px-4">Cost Variance</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Invoiced Bill</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400 font-medium">
                      No purchase invoices logged yet. Click top button to log.
                    </td>
                  </tr>
                ) : (
                  purchases.map(pur => (
                    <tr key={pur.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {pur.id.slice(0, 11)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {pur.supplierName}
                      </td>
                      <td className="py-3.5 px-4">
                        {pur.varianceDetected ? (
                          <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase flex items-center w-max">
                            <AlertTriangle className="h-3 w-3 text-amber-600 mr-1 shrink-0 animate-pulse" />
                            <span>Inflation detected</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-[10px]">No change</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="bg-teal-50 text-teal-800 border border-teal-150 text-[10px] px-2.5 py-0.5 rounded-full font-semibold">
                          {pur.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        Rs {pur.total.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Supplier directory cards - col-span-4 */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-5 shadow-2xs space-y-4">
          <h3 className="font-display font-semibold text-base text-slate-800 border-b border-slate-50 pb-3">
            Distributor Directory
          </h3>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {suppliers.map(sup => (
              <div 
                key={sup.id}
                className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl space-y-3 text-left"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-sans font-bold text-slate-800 text-sm">{sup.name}</h4>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">{sup.id} • Cell: {sup.phone}</span>
                  </div>
                  <span className={`font-mono text-xs font-bold ${
                    sup.ledgerBalance > 0 ? "text-amber-750" : "text-emerald-700"
                  }`}>
                    {sup.ledgerBalance > 0 
                      ? `We owe Rs ${sup.ledgerBalance.toLocaleString()}` 
                      : `Advance Rs ${Math.abs(sup.ledgerBalance).toLocaleString()}`}
                  </span>
                </div>
                
                <p className="text-[10px] text-slate-500 font-sans leading-tight">
                  Address details: {sup.address || "Quetta city market distributor block."}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Log GRN Drawer modal block */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 shadow-2xl relative space-y-6">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-display font-semibold text-slate-800">
                Place Goods Received Note (GRN)
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-mono font-bold uppercase cursor-pointer"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6 text-left">
              
              {/* Supplier selector */}
              <div className="space-y-1 text-xs">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Select Supplier Wholesaler *</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 p-3 rounded-xl focus:bg-white text-slate-800 cursor-pointer text-xs"
                >
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.id}>{sup.name} (Balance Payables: Rs {sup.ledgerBalance.toLocaleString()})</option>
                  ))}
                </select>
              </div>

              {/* Items list entry */}
              <div className="space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Dispensed Batches list</span>
                  <button
                    type="button"
                    onClick={addGrnItemRow}
                    className="p-1 px-3 border border-teal-600 text-teal-700 hover:bg-teal-50 text-[10px] font-semibold rounded-lg cursor-pointer flex items-center space-x-1 uppercase"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Medicine Row</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {grnItems.map((itm, index) => {
                    const isVariance = detectPriceVariance(itm);
                    return (
                      <div 
                        key={index}
                        className="bg-slate-50 p-4 rounded-2xl border border-slate-205 grid grid-cols-6 gap-3.5 text-xs relative items-end"
                      >
                        <div className="col-span-2 space-y-1">
                          <span className="text-[9px] text-slate-500 font-bold block uppercase leading-none mb-1">Select Medicine</span>
                          <select
                            value={itm.productId}
                            onChange={(e) => handleItemFieldChange(index, "productId", e.target.value)}
                            className="bg-white border border-slate-205 p-1.5 rounded-lg w-full text-xs"
                          >
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-500 font-bold block uppercase leading-none mb-1">Qty</span>
                          <input
                            type="number"
                            required
                            min="1"
                            value={itm.qty || ""}
                            onChange={(e) => handleItemFieldChange(index, "qty", parseInt(e.target.value) || 0)}
                            className="bg-white border border-slate-205 p-1.5 rounded-lg w-full text-center font-mono"
                          />
                        </div>

                        <div className="space-y-1 relative">
                          <span className="text-[9px] text-slate-500 font-bold block uppercase leading-none mb-1">New Cost</span>
                          <input
                            type="number"
                            required
                            min="0.01"
                            step="0.01"
                            value={itm.costPrice || ""}
                            onChange={(e) => handleItemFieldChange(index, "costPrice", Number(e.target.value) || 0)}
                            className={`bg-white border rounded-lg p-1.5 w-full text-right font-mono ${
                              isVariance ? "border-amber-450 text-amber-800 font-semibold" : "border-slate-205"
                            }`}
                          />
                          {isVariance && (
                            <span 
                              className="absolute top-1 right-0 text-[7px] text-amber-600 bg-amber-50 px-1 border border-amber-250 font-bold uppercase leading-none rounded-sm transform translate-y-[-12px]"
                              title="Invoice price is higher than last saved price"
                            >
                              Inflate
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-500 font-bold block uppercase leading-none mb-1">New Retail</span>
                          <input
                            type="number"
                            required
                            min="0.01"
                            step="0.01"
                            value={itm.retailPrice || ""}
                            onChange={(e) => handleItemFieldChange(index, "retailPrice", Number(e.target.value) || 0)}
                            className="bg-white border border-slate-205 p-1.5 rounded-lg w-full text-right font-mono"
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="space-y-1 flex-1">
                            <span className="text-[9px] text-slate-500 font-bold block leading-none mb-1">Batch ID</span>
                            <input
                              type="text"
                              required
                              value={itm.batchNumber || ""}
                              onChange={(e) => handleItemFieldChange(index, "batchNumber", e.target.value)}
                              className="bg-white border border-slate-205 p-1.5 rounded-lg w-full text-center font-mono"
                            />
                          </div>

                          {grnItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeGrnItemRow(index)}
                              className="text-rose-500 hover:text-rose-600 p-1 mb-1"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total calculations */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-baseline text-xs font-mono font-bold">
                <span>TOTAL INVOICED BILL:</span>
                <span className="text-sm font-black text-slate-800">
                  Rs {grnItems.reduce((acc, itm) => acc + ((itm.costPrice || 0) * (itm.qty || 0)), 0).toLocaleString()}
                </span>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-slate-100">
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
                  id="submit-grn-form-btn"
                >
                  Confirm Goods Received Note
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
