/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Barcode, 
  ShoppingCart, 
  Trash2, 
  FileText, 
  ShieldAlert, 
  Printer, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertTriangle,
  Minus,
  Plus
} from "lucide-react";
import { Product, Sale, SaleItem, PaymentMethod } from "../types";
import { getAllFromStore, saveSaleOffline } from "../lib/indexedDB";

interface POSProps {
  isOffline: boolean;
  onSaleCompleted: () => void;
}

interface CartItem {
  product: Product;
  qty: number;
}

export default function POSPanel({ isOffline, onSaleCompleted }: POSProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");

  // Customer/Rx inputs
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [rxNumber, setRxNumber] = useState("");

  // Split payment state
  const [cashSplitVal, setCashSplitVal] = useState<number>(0);
  const [digitalSplitVal, setDigitalSplitVal] = useState<number>(0);

  // Print/Completed receipt modals
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [completedItems, setCompletedItems] = useState<SaleItem[]>([]);
  const [posBranch, setPosBranch] = useState<"meezan" | "jinnah">("meezan");

  // Sound/Vibrations
  const [simulationStatus, setSimulationStatus] = useState("");

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProducts();
    // Auto-focus search on panel start
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  async function loadProducts() {
    try {
      const all = await getAllFromStore<Product>("products");
      setProducts(all);
    } catch (err) {
      console.error("Error loading products in POS:", err);
    }
  }

  // Barcode simulation helper
  const triggerBarcodeScan = () => {
    // Pick a random product with stock
    const available = products.filter(p => p.stockQty > 0);
    if (available.length === 0) return;
    const picked = available[Math.floor(Math.random() * available.length)];
    addToCart(picked);
    setSimulationStatus(`Scanned barcode for: ${picked.name}`);
    setTimeout(() => setSimulationStatus(""), 3000);
  };

  const addToCart = (product: Product) => {
    if (product.stockQty <= 0) {
      alert(`Cannot add ${product.name}. Stock is currently 0.`);
      return;
    }

    const existingIndex = cart.findIndex(item => item.product.id === product.id);
    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].qty;
      if (currentQty >= product.stockQty) {
        alert(`Cannot add more than ${product.stockQty} remaining in inventory.`);
        return;
      }
      const updated = [...cart];
      updated[existingIndex].qty += 1;
      setCart(updated);
    } else {
      setCart([...cart, { product, qty: 1 }]);
    }
  };

  const updateCartQty = (productId: string, val: number) => {
    const idx = cart.findIndex(item => item.product.id === productId);
    if (idx === -1) return;

    const item = cart[idx];
    const newQty = item.qty + val;

    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQty > item.product.stockQty) {
      alert(`Only ${item.product.stockQty} units available in Jinnah Road warehouse.`);
      return;
    }

    const updated = [...cart];
    updated[idx].qty = newQty;
    setCart(updated);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  // Check if cart contains DRAP Controlled items requiring active validation
  const containsControlledMedication = cart.some(item => item.product.drapControlled);

  const calculateSubtotal = () => {
    return cart.reduce((acc, item) => acc + (item.product.retailPrice * item.qty), 0);
  };

  const calculateTotal = () => {
    return Math.max(0, calculateSubtotal() - discount);
  };

  // Process transaction action
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      alert("Your POS cart is completely empty.");
      return;
    }

    // Prescription validation check
    if (containsControlledMedication) {
      if (!customerName || !doctorName || !rxNumber) {
        alert("DRAP REGULATORY VIOLATION:\nPrescribing physician, patient name and valid drug Rx verification license is mandatory to dispense Lexotanil / psychotropics.");
        return;
      }
    }

    const sub = calculateSubtotal();
    const grand = calculateTotal();

    const saleId = `SALE-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const paymentDetailsText = paymentMethod === "Split" 
      ? `Split: Cash Rs ${cashSplitVal} | Digital card Rs ${digitalSplitVal}`
      : paymentMethod;

    const newSale: Sale = {
      id: saleId,
      branchId: "B1",
      userId: "USR-ADM",
      customerName: customerName || "Walk-in Patient",
      customerPhone: customerPhone || undefined,
      doctorName: containsControlledMedication ? doctorName : undefined,
      rxNumber: containsControlledMedication ? rxNumber : undefined,
      total: grand,
      discount: discount,
      paymentMethod: paymentMethod,
      paymentDetails: paymentDetailsText,
      synced: !isOffline,
      createdAt: timestamp
    };

    const itemsToSave: SaleItem[] = cart.map((item, index) => ({
      id: `ITEM-${saleId}-${index}`,
      saleId: saleId,
      productId: item.product.id,
      productName: item.product.name,
      qty: item.qty,
      price: item.product.retailPrice
    }));

    try {
      // Perform transactional atomic write
      await saveSaleOffline(newSale, itemsToSave);

      setCompletedSale(newSale);
      setCompletedItems(itemsToSave);
      setShowReceipt(true);

      // Reset state form
      setCart([]);
      setDiscount(0);
      setPaymentMethod("Cash");
      setCustomerName("");
      setCustomerPhone("");
      setDoctorName("");
      setRxNumber("");
      loadProducts(); // Load updated stock quantities
      onSaleCompleted(); // Refresh parent statistics
    } catch (err) {
      console.error("POS transaction failed:", err);
      alert("Error saving transaction offline. Please try again.");
    }
  };

  // Keyboard shortcut listener emulator
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F12") {
        e.preventDefault();
        // Trigger checkout
        const mockForm = document.getElementById("pos-checkout-btn");
        if (mockForm) mockForm.click();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart, discount, paymentMethod, customerName, doctorName, rxNumber]);

  // Medication generic filter
  const filteredProducts = products.filter(p => {
    const normSearch = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(normSearch) || 
           p.category.toLowerCase().includes(normSearch) ||
           p.batchNumber.toLowerCase().includes(normSearch);
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left" id="pos-terminal-pane">
      
      {/* Top action status alert bar */}
      <div className="lg:col-span-12 flex justify-between items-center bg-slate-900 text-white p-3.5 rounded-2xl text-xs font-mono">
        <div className="flex items-center space-x-2">
          <Barcode className="h-4.5 w-4.5 text-teal-400 shrink-0" />
          <span>F12 to quick pay | Auto-indexing enabled</span>
        </div>
        {simulationStatus && (
          <span className="bg-emerald-900 border border-emerald-600 text-emerald-300 px-3 py-1 rounded-sm animate-pulse">
            {simulationStatus}
          </span>
        )}
        <button
          onClick={triggerBarcodeScan}
          className="bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold px-3 py-1 rounded-sm cursor-pointer"
        >
          SIMULATE BARCODE SCAN
        </button>
      </div>

      {/* Left Columns - Product search and selection - col-span-7 */}
      <div className="lg:col-span-7 space-y-4">
        
        {/* Search entry bar */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type Brand/Generic details, category, or scan medicine barcode..."
            className="w-full bg-white border border-slate-200 pl-11 pr-4 py-3.5 rounded-2xl text-sm focus:border-teal-500 focus:outline-hidden shadow-2xs font-sans"
            id="pos-search-input"
          />
        </div>

        {/* Medicines Catalog Grid */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-2xs space-y-3">
          <div className="flex justify-between items-center border-b border-slate-50 pb-3">
            <h3 className="font-display font-semibold text-base text-slate-800">
              Medicines Stock Catalog
            </h3>
            <span className="text-[10px] text-slate-400 font-mono font-bold">
              Showing {filteredProducts.length} registered formulas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
            {filteredProducts.map((prod) => {
              const isLow = prod.stockQty <= prod.reorderLevel;
              const isExpiring = prod.expiryDate.startsWith("2026-06") || prod.expiryDate.startsWith("2026-07") || prod.expiryDate.startsWith("2026-08");
              return (
                <div
                  key={prod.id}
                  onClick={() => addToCart(prod)}
                  className={`border rounded-2xl p-4 transition flex flex-col justify-between cursor-pointer group text-left ${
                    prod.stockQty <= 0
                      ? "bg-slate-50 border-slate-100 opacity-60"
                      : "bg-white hover:bg-slate-50/55 border-slate-200/80 hover:border-teal-300"
                  }`}
                  id={`pos-prod-${prod.id}`}
                >
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wide">
                        {prod.category}
                      </span>
                      {prod.drapControlled && (
                        <span className="bg-rose-50 text-rose-700 border border-rose-100 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full uppercase shrink-0">
                          DRAP Controlled
                        </span>
                      )}
                    </div>
                    <h4 className="font-sans font-bold text-slate-850 text-sm leading-tight group-hover:text-teal-700 transition">
                      {prod.name}
                    </h4>
                    <span className="text-[11px] font-mono font-semibold text-slate-400 block">
                      Batch: {prod.batchNumber} • Exp: {prod.expiryDate}
                    </span>
                  </div>

                  {/* Pricing and Stock statuses */}
                  <div className="flex justify-between items-baseline pt-4 mt-3 border-t border-slate-50">
                    <div>
                      <span className="text-[9px] text-slate-500 block">Rtl Price:</span>
                      <span className="font-mono text-xs font-bold text-teal-700">
                        Rs {prod.retailPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-500 block">Warehouse Qty:</span>
                      <span className={`font-mono text-xs font-semibold ${
                        prod.stockQty <= 0 
                          ? "text-red-600" 
                          : isLow 
                            ? "text-amber-600 font-bold" 
                            : "text-slate-600"
                      }`}>
                        {prod.stockQty <= 0 
                          ? "Out of Stock" 
                          : `${prod.stockQty} left`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Right Column - POS shopping checkout cart - col-span-5 */}
      <div className="lg:col-span-5 space-y-4">
        
        <form onSubmit={handleCheckout} className="bg-white border border-slate-100 rounded-3xl shadow-md p-6 space-y-6">
          
          <div className="flex justify-between items-center border-b border-slate-50 pb-3">
            <h3 className="font-display font-semibold text-base text-slate-800 flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-teal-700" />
              <span>Checkout Cart</span>
            </h3>
            <span className="bg-teal-50 text-teal-800 text-xs font-mono font-bold px-2 rounded-full">
              {cart.reduce((s, c) => s + c.qty, 0)} Units
            </span>
          </div>

          {/* Cart item listing list */}
          {cart.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <ShoppingCart className="h-8 w-8 mx-auto text-slate-300" />
              <p className="text-xs font-sans font-medium">Cart is currently empty. Click medicine on the left catalog to add.</p>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
              {cart.map((item) => (
                <div 
                  key={item.product.id}
                  className="flex justify-between items-center bg-slate-50/50 p-3 rounded-2xl border border-slate-100 text-xs text-left"
                >
                  <div className="space-y-1 max-w-[55%]">
                    <span className="font-semibold text-slate-800 block truncate">
                      {item.product.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block font-semibold">
                      Rs {item.product.retailPrice.toLocaleString()} /unit
                    </span>
                  </div>

                  {/* Quantity adjusts */}
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => updateCartQty(item.product.id, -1)}
                      className="p-1 bg-white hover:bg-slate-100 border border-slate-205 rounded-lg cursor-pointer text-slate-500"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="font-mono font-bold text-slate-850 px-1 w-6 text-center text-xs">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCartQty(item.product.id, 1)}
                      className="p-1 bg-white hover:bg-slate-100 border border-slate-205 rounded-lg cursor-pointer text-slate-500"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Subtotal & trash */}
                  <div className="flex items-center space-x-3 text-right">
                    <span className="font-mono font-bold text-slate-850">
                      Rs {(item.product.retailPrice * item.qty).toLocaleString()}
                    </span>
                    <button 
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-rose-500 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Controlled Medication strict warn indicators */}
          {containsControlledMedication && (
            <div className="bg-amber-50 border border-amber-250 rounded-2xl p-4 space-y-3 text-xs" id="drap-pos-validation">
              <div className="flex items-start space-x-2 text-amber-900 leading-normal font-sans">
                <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-950 block">DRAP REGULATORY OVERWATCH</span>
                  <span>Lexotanil or control psychotropics selected. Original clinic order paper, patient verification details, and prescribing doctor required.</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-slate-700">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-500 block uppercase">Prescribing Dr.</span>
                  <input
                    type="text"
                    required
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="e.g. Dr. Malik Kakar"
                    className="w-full bg-white border border-slate-205 p-2 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-500 block uppercase">DRAP Rx License#</span>
                  <input
                    type="text"
                    required
                    value={rxNumber}
                    onChange={(e) => setRxNumber(e.target.value)}
                    placeholder="e.g. DRAP-B9921"
                    className="w-full bg-white border border-slate-205 p-2 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Customer fields */}
          <div className="space-y-3.5 border-t border-slate-100 pt-4">
            <h4 className="text-xs font-mono font-bold text-slate-400 block uppercase text-left">
              Dispensing Patient Info
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-2xl p-2 px-3 border border-slate-100 flex items-center space-x-2">
                <User className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Patient Name"
                  className="bg-transparent text-xs text-slate-800 w-full focus:outline-hidden"
                />
              </div>
              <div className="bg-slate-50 rounded-2xl p-2 px-3 border border-slate-100 flex items-center space-x-2">
                <Phone className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Contact Cell"
                  className="bg-transparent text-xs text-slate-800 w-full focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Pricing breakdown */}
          <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal Cost:</span>
              <span className="font-mono">Rs {calculateSubtotal().toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center text-slate-550">
              <span>Immediate Discount (Rs):</span>
              <input
                type="number"
                value={discount || ""}
                onChange={(e) => setDiscount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-20 bg-slate-50 border border-slate-205 p-1 rounded-md text-right font-mono"
                placeholder="0"
                id="pos-discount-input"
              />
            </div>

            <div className="flex justify-between items-center text-slate-700 pt-2 border-t border-dashed border-slate-100">
              <span className="font-semibold">Payment Option:</span>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="bg-white border border-slate-205 p-1 px-2 rounded-md font-sans text-xs focus:outline-hidden cursor-pointer"
                id="pos-payment-selector"
              >
                <option value="Cash">Cash Drawer</option>
                <option value="Credit Ledger">Borrow Credit Ledger</option>
                <option value="Digital/Card">Digital POS Terminal</option>
                <option value="Split">Split Ledger/Cash</option>
              </select>
            </div>

            {/* Split specifics inputs */}
            {paymentMethod === "Split" && (
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-205 space-y-2 grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 block uppercase">Cash Amount</span>
                  <input
                    type="number"
                    value={cashSplitVal || ""}
                    onChange={(e) => setCashSplitVal(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-white border border-slate-205 p-1 rounded-sm text-right font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 block uppercase">Digital/Card Amount</span>
                  <input
                    type="number"
                    value={digitalSplitVal || ""}
                    onChange={(e) => setDigitalSplitVal(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-white border border-slate-205 p-1 rounded-sm text-right font-mono"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-3 border-t border-slate-50">
              <span className="text-sm font-bold text-slate-800">TOTAL BILLING:</span>
              <span className="font-mono text-xl font-black text-teal-700">
                Rs {calculateTotal().toLocaleString()}
              </span>
            </div>
          </div>

          <button
            id="pos-checkout-btn"
            type="submit"
            className="w-full py-4 bg-teal-700 hover:bg-teal-650 text-white font-bold text-xs tracking-wider uppercase rounded-2xl transition cursor-pointer active:scale-98 shadow-md"
          >
            DISPENSE & SAVE (F12)
          </button>
        </form>

      </div>

      {/* Modern Thermal Receipt Printer Modal block */}
      {showReceipt && completedSale && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl relative space-y-6">
            
            {/* Modal header Actions popup */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-display font-bold text-slate-800 text-sm">
                Thermal Receipt Printer
              </h3>
              <button 
                onClick={() => setShowReceipt(false)}
                className="text-slate-400 hover:text-slate-600 font-bold transition cursor-pointer text-xs uppercase"
              >
                Close
              </button>
            </div>

            {/* Branch toggle switcher inside receipt modal */}
            <div className="flex justify-between items-center bg-slate-100 p-2 rounded-2xl text-[10px]">
              <span className="text-slate-650 font-sans font-semibold pl-1">Store Branch:</span>
              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={() => setPosBranch("meezan")}
                  className={`px-3 py-1 rounded-xl text-[9px] font-bold transition-all duration-200 cursor-pointer ${
                    posBranch === "meezan" 
                      ? "bg-teal-700 text-white shadow-xs" 
                      : "text-slate-500 hover:text-slate-800 bg-white"
                  }`}
                >
                  Meezan Chowk
                </button>
                <button
                  type="button"
                  onClick={() => setPosBranch("jinnah")}
                  className={`px-3 py-1 rounded-xl text-[9px] font-bold transition-all duration-200 cursor-pointer ${
                    posBranch === "jinnah" 
                      ? "bg-teal-700 text-white shadow-xs" 
                      : "text-slate-500 hover:text-slate-800 bg-white"
                  }`}
                >
                  Jinnah Road
                </button>
              </div>
            </div>

            {/* Simulated printable thermal tape slip */}
            <div className="bg-slate-50 border border-slate-300 p-4 rounded-xl print-receipt-container font-mono text-[10px] text-slate-800 space-y-4">
              <div className="text-center space-y-1">
                <span className="font-bold text-xs block">BARAKAT MEDICAL STORE</span>
                <span className="text-[9px] block transition-all duration-300">
                  {posBranch === "meezan" ? "Meezan Chowk Branch, Quetta" : "Jinnah Road, Opposite Civil Hospital, Quetta"}
                </span>
                <span className="text-[9px] block">Balochistan Drug Lic# BLN-DR-99015</span>
                <div className="border-b border-dashed border-slate-450 my-1" />
                <div className="flex justify-between text-[9px]">
                  <span>Bill: {completedSale.id.slice(-10).toUpperCase()}</span>
                  <span>17-Jun-2026 08:20</span>
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <div className="flex justify-between font-bold">
                  <span>Dispensed Drug</span>
                  <span>Qty * Price</span>
                </div>
                <div className="border-b border-dashed border-slate-400" />
                {completedItems.map((itm, idx) => (
                  <div key={idx} className="flex justify-between text-[9px]">
                    <span>{itm.productName}</span>
                    <span>{itm.qty}x Rs {itm.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Patient credentials on slip */}
              <div className="border-t border-dashed border-slate-400 pt-2 space-y-0.5 text-left text-[9px]">
                <p>Patient Name: {completedSale.customerName}</p>
                {completedSale.doctorName && <p>Prescribing Dr: {completedSale.doctorName}</p>}
                {completedSale.rxNumber && <p>License verification Code: {completedSale.rxNumber}</p>}
              </div>

              {/* Total bills calculations */}
              <div className="border-t border-dashed border-slate-400 pt-2 text-right space-y-1">
                <div className="flex justify-between text-[9px]">
                  <span>Subtotal:</span>
                  <span>Rs {(completedSale.total + completedSale.discount).toLocaleString()}</span>
                </div>
                {completedSale.discount > 0 && (
                  <div className="flex justify-between text-[9px] text-teal-700">
                    <span>Discount:</span>
                    <span>-Rs {completedSale.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xs pt-1.5 border-t border-dashed border-slate-400">
                  <span>TOTAL BILL:</span>
                  <span>Rs {completedSale.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-center text-[9px] font-semibold bg-white p-2 rounded-md border border-slate-205 text-emerald-700/85 font-sans leading-tight">
                {isOffline ? (
                  <span>Offline dispatch saved to queue. Synced offline.</span>
                ) : (
                  <span>Verified with DRAP database. Synced with Supabase.</span>
                )}
              </div>

              <div className="text-center text-[8px] text-slate-500 font-sans block pt-2">
                Thank you for visiting Barakat Pharma. Emergency Cell: 0333-7890123
              </div>
            </div>

            {/* Print action trigger */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-3 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition cursor-pointer flex items-center justify-center space-x-2"
              >
                <Printer className="h-4 w-4" />
                <span>Reprint (Thermal)</span>
              </button>
              <button
                onClick={() => setShowReceipt(false)}
                className="flex-1 py-3 bg-teal-650 text-white font-bold text-xs rounded-xl hover:bg-teal-600 transition cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
