/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Smartphone, 
  Layers, 
  CheckCircle2, 
  Plus, 
  Edit2, 
  Trash2, 
  Pill, 
  Package, 
  AlertCircle,
  Check,
  Printer
} from "lucide-react";

interface OfflineProps {
  isOffline: boolean;
  toggleOffline: () => void;
}

interface MockMedicine {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

interface ReceiptItem {
  medicineId: string;
  name: string;
  price: number;
  qty: number;
}

export default function OfflineSection({ isOffline, toggleOffline }: OfflineProps) {
  // Pre-loaded offline medicine references (offline cache)
  const [medicines, setMedicines] = useState<MockMedicine[]>([
    { id: "M1", name: "Panadol 500mg Tablets", category: "Analgesic", price: 60.00, stock: 480 },
    { id: "M2", name: "Brufen 400mg Tablets", category: "Anti-inflammatory", price: 85.00, stock: 18 },
    { id: "M3", name: "Augmentin Suspension", category: "Antibiotic", price: 450.00, stock: 6 },
    { id: "M4", name: "Surbex Z Multivitamins", category: "Nutritional Support", price: 340.00, stock: 110 },
    { id: "M5", name: "Arinac Forte Tablets", category: "Decongestant", price: 110.00, stock: 14 }
  ]);

  // Simulated active cart receipt items
  const [cart, setCart] = useState<ReceiptItem[]>([
    { medicineId: "M1", name: "Panadol 500mg Tablets", price: 60.00, qty: 2 },
    { medicineId: "M2", name: "Brufen 400mg Tablets", price: 85.00, qty: 1 },
    { medicineId: "M3", name: "Augmentin Suspension", price: 450.00, qty: 1 }
  ]);

  // Modal setup for Add/Edit Medicine cards
  const [medicineModalOpen, setMedicineModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<MockMedicine | null>(null);

  // Form hooks
  const [medName, setMedName] = useState("");
  const [medCategory, setMedCategory] = useState("Analgesic");
  const [medPrice, setMedPrice] = useState("");
  const [medStock, setMedStock] = useState("");

  const [successPaidMessage, setSuccessPaidMessage] = useState(false);
  const [deleteConfirmMedId, setDeleteConfirmMedId] = useState<string | null>(null);
  const [isEnglish, setIsEnglish] = useState(false);
  const [printedLabelMed, setPrintedLabelMed] = useState<MockMedicine | null>(null);
  const [locationBranch, setLocationBranch] = useState<"meezan" | "jinnah">("meezan");
  const [isPrintingSimActive, setIsPrintingSimActive] = useState(false);
  const [printFeedAnimation, setPrintFeedAnimation] = useState(false);

  const playPrinterSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Browsers block autoplay audio until interaction
    }
  };

  const handlePrintTrigger = () => {
    setIsPrintingSimActive(true);
    setPrintFeedAnimation(true);
    playPrinterSound();
    
    try {
      window.print();
    } catch (err) {
      console.warn("Native print API failed:", err);
    }

    setTimeout(() => {
      setPrintFeedAnimation(false);
    }, 1500);
  };

  const handleDownloadTxtInvoice = () => {
    // Standard dotted separator of 40 chars
    const sep = "------------------------------------------\n";
    const bar = "==========================================\n";
    let content = "";
    content += "          BARAKAT MEDICAL STORE\n";
    content += locationBranch === "meezan" 
      ? "        Meezan Chowk Branch, Quetta\n" 
      : " Jinnah Road, Opposite Civil Hospital, Quetta\n";
    content += "             Ph: 0333-7890123\n";
    content += bar;
    content += "Bill# : POS-2026-9912\n";
    content += "Date  : 17-Jun-2026 08:20\n";
    content += "Type  : Offline Local Sync Queue Record\n";
    content += bar;
    content += "Item Description           Qty     Amount\n";
    content += sep;
    cart.forEach(item => {
      const sub = (item.price * item.qty).toFixed(2);
      const rates = `@ Rs ${item.price.toFixed(2)}`;
      content += `${item.name.padEnd(25)} ${item.qty.toString().padStart(3)}  Rs ${sub.padStart(8)}\n`;
      content += `  ${rates}\n`;
    });
    content += sep;
    content += `Subtotal:                  Rs ${subtotal.toFixed(2).padStart(10)}\n`;
    content += `Sales Tax (0%):            Rs ${"0.00".padStart(10)}\n`;
    content += bar;
    content += `TOTAL PAYABLE:             Rs ${subtotal.toFixed(2).padStart(10)}\n`;
    content += bar;
    content += "   Securely Synced with Browser super-cache\n";
    content += "      Thank you! Please visit us again.\n";

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Barakat_Receipt_9912.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Cart operations
  const handleAddToReceipt = (med: MockMedicine) => {
    setCart(prev => {
      const existing = prev.find(item => item.medicineId === med.id);
      if (existing) {
        return prev.map(item => item.medicineId === med.id ? { ...item, qty: item.qty + 1 } : item);
      } else {
        return [...prev, { medicineId: med.id, name: med.name, price: med.price, qty: 1 }];
      }
    });
  };

  const updateCartQty = (medicineId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.medicineId === medicineId) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean) as ReceiptItem[]);
  };

  const removeCartItem = (medicineId: string) => {
    setCart(prev => prev.filter(item => item.medicineId !== medicineId));
  };

  // Medicine card actions
  const openAddModal = () => {
    setEditingMedicine(null);
    setMedName("");
    setMedCategory("Analgesic");
    setMedPrice("120");
    setMedStock("100");
    setMedicineModalOpen(true);
  };

  const openEditModal = (med: MockMedicine) => {
    setEditingMedicine(med);
    setMedName(med.name);
    setMedCategory(med.category);
    setMedPrice(med.price.toString());
    setMedStock(med.stock.toString());
    setMedicineModalOpen(true);
  };

  const handleDeleteMedicine = (id: string) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
    // Also prune from cart
    setCart(prev => prev.filter(item => item.medicineId !== id));
    setDeleteConfirmMedId(null);
  };

  const handleSaveMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName || !medPrice) {
      alert("Please enter Name and Price.");
      return;
    }

    const priceNum = parseFloat(medPrice);
    const stockNum = parseInt(medStock) || 0;

    if (editingMedicine) {
      // Edit mode
      setMedicines(prev => prev.map(m => m.id === editingMedicine.id ? {
        ...m,
        name: medName,
        category: medCategory,
        price: priceNum,
        stock: stockNum
      } : m));

      // Synchronize changes into active cart items if they exist there
      setCart(prev => prev.map(item => item.medicineId === editingMedicine.id ? {
        ...item,
        name: medName,
        price: priceNum
      } : item));
    } else {
      // Create mode
      const newMed: MockMedicine = {
        id: `MED-${Date.now()}`,
        name: medName,
        category: medCategory,
        price: priceNum,
        stock: stockNum
      };
      setMedicines(prev => [...prev, newMed]);
    }

    setMedicineModalOpen(false);
    setEditingMedicine(null);
  };

  const handlePay = () => {
    if (cart.length === 0) {
      alert("Add at least one medicine item to check out!");
      return;
    }
    setSuccessPaidMessage(true);
    setTimeout(() => {
      setSuccessPaidMessage(false);
    }, 4500);
  };

  const subtotal = cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);

  return (
    <section className="bg-slate-900 text-white py-16 sm:py-24 overflow-hidden relative" id="offline-pos">
      {/* Absolute decorative gradient ring */}
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Headline & Steps */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center space-x-2 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full px-4 py-1 text-xs font-mono font-medium">
              <WifiOff className="h-4 w-4 animate-bounce text-rose-400" />
              <span>{isEnglish ? "OFFLINE ROBUSTNESS" : "SIGNATURE FEATURE"}</span>
            </div>

            <div className="space-y-4">
              <span className="text-teal-400 font-mono text-sm tracking-widest block uppercase font-bold">
                {isEnglish ? "Works Without Internet" : "No-Internet Technology / انٹرنیٹ کے بغیر"}
              </span>
              <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight transition-all duration-300">
                {isEnglish ? (
                  <>
                    Power goes out or internet fails — <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                      your sales won't stop!
                    </span>
                  </>
                ) : (
                  <>
                    Bijli jaye ya internet — <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                      aapki sale band nahi hogi!
                    </span>
                  </>
                )}
              </h2>
              <p className="text-slate-400 font-sans text-sm sm:text-base leading-relaxed transition-all duration-300">
                {isEnglish ? (
                  "In Quetta, electricity load-shedding and fiber internet breakdowns shouldn't disrupt your store. Barakat Pharmacy Software caches everything locally in the browser's super secure database (IndexedDB) so you keep typing, barcodes beep, and receipts print non-stop."
                ) : (
                  "Quetta mein load-shedding aur fiber internet connectivity breakdowns aapke business ko mutasir nahi karengay. Barakat Pharmacy Software sab kuch locally browser ke super secure IndexedDB database mein save kar leta hai ke aapki bar-code billing aur receipts bina rukaawat jaari rahein."
                )}
              </p>
            </div>

            {/* 3 Steps Explainer */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-teal-500/10 border border-teal-500/30 text-teal-400 w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold shrink-0 text-sm animate-pulse">
                  01
                </div>
                <div>
                  <h4 className="font-display font-semibold text-base text-slate-100 transition-all duration-300">
                    {isEnglish ? "Open POS in the Morning" : "Subah POS Khola / صبح پی او ایس کھلنا"}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5 transition-all duration-300">
                    {isEnglish 
                      ? "Products, custom price books, and supplier accounts cache automatically when your network is active."
                      : "Subah jab internet wapas active ho, tamam products, prices aur khata accounts browser cache memory mein auto-save ho jate hain."
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-teal-500/10 border border-teal-500/30 text-teal-400 w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold shrink-0 text-sm">
                  02
                </div>
                <div>
                  <h4 className="font-display font-semibold text-base text-slate-100 transition-all duration-300">
                    {isEnglish ? "Net Disconnects? Keep Transacting!" : "Net Disconnect? Sales Chalu! / بغیر نیٹ کے کام جاری"}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5 transition-all duration-300">
                    {isEnglish
                      ? "Your sales, customer ledgers, and inventory deducts are stored instantly in the offline browser database. Official thermal receipts generate without any issues."
                      : "Net jane ke bawajood sales database tabdeel nahi hota. Customers ke udhaar accounts, stock deducts aur official cash bills usi waqt locally secure ho jate hain."
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-teal-500/10 border border-teal-500/30 text-teal-400 w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold shrink-0 text-sm">
                  03
                </div>
                <div>
                  <h4 className="font-display font-semibold text-base text-teal-400 transition-all duration-300">
                    {isEnglish ? "Auto-Sync on Internet Restore" : "Internet Restore Hote hi Auto-Sync / خودکار مطابقت پذیری"}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5 transition-all duration-300">
                    {isEnglish
                      ? "As soon as cellular data or Wi-Fi reconnects, all pending local sales automatically upload to the central database, recalculating profit & loss instantly."
                      : "Jaise hi mobile internet ya Wi-Fi reconnect ho, pending local sales centralized server par automatically sync ho kar total nfa/nuqsan ka hisaab update kar deti hain."
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Language Switcher at the Left Bottom */}
            <div className="pt-6 border-t border-slate-800/60 flex flex-wrap items-center gap-3">
              <span className="text-[10px] text-teal-400 font-mono tracking-wider uppercase block">
                Translation / ترجمہ کریں:
              </span>
              <div className="bg-slate-950/80 p-1 rounded-xl border border-slate-800 inline-flex items-center shadow-md">
                <button
                  type="button"
                  onClick={() => setIsEnglish(false)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold select-none transition-all duration-200 cursor-pointer ${
                    !isEnglish 
                      ? "bg-teal-500 text-slate-950 shadow-md font-bold" 
                      : "text-slate-400 hover:text-white"
                  }`}
                  id="lang-btn-urdu"
                >
                  Urdu / اردو
                </button>
                <button
                  type="button"
                  onClick={() => setIsEnglish(true)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold select-none transition-all duration-200 cursor-pointer ${
                    isEnglish 
                      ? "bg-teal-500 text-slate-950 shadow-md font-bold" 
                      : "text-slate-400 hover:text-white"
                  }`}
                  id="lang-btn-english"
                >
                  English / انگریزی
                </button>
              </div>
            </div>

            {/* Location Switcher at the Left Bottom */}
            <div className="pt-4 border-t border-slate-800/45 flex flex-wrap items-center gap-3">
              <span className="text-[10px] text-teal-400 font-mono tracking-wider uppercase block">
                {isEnglish ? "Store Location:" : "مقام تبدیل کریں / Store Location:"}
              </span>
              <div className="bg-slate-950/80 p-1 rounded-xl border border-slate-800 inline-flex items-center shadow-md">
                <button
                  type="button"
                  onClick={() => setLocationBranch("meezan")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold select-none transition-all duration-200 cursor-pointer ${
                    locationBranch === "meezan" 
                      ? "bg-teal-500 text-slate-950 shadow-md font-bold" 
                      : "text-slate-400 hover:text-white"
                  }`}
                  id="loc-btn-meezan"
                >
                  Meezan Chowk
                </button>
                <button
                  type="button"
                  onClick={() => setLocationBranch("jinnah")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold select-none transition-all duration-200 cursor-pointer ${
                    locationBranch === "jinnah" 
                      ? "bg-teal-500 text-slate-950 shadow-md font-bold" 
                      : "text-slate-400 hover:text-white"
                  }`}
                  id="loc-btn-jinnah"
                >
                  Jinnah Road
                </button>
              </div>
            </div>
          </div>

          {/* Right: Static receipt explanation area */}
          <div className="lg:col-span-5 text-left border border-slate-800 bg-slate-950/40 p-6 rounded-3xl space-y-4">
            <div className="p-3 bg-teal-500/10 rounded-2xl border border-teal-500/20 flex items-start space-x-3">
              <Pill className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-display font-bold text-sm text-slate-100">Interactive Offline Demo</h4>
                <p className="text-xs text-slate-400 font-sans leading-normal">
                  Toggle connection state, add custom medicine cards, or complete transactions offline below to see the local browser engine in action.
                </p>
              </div>
            </div>
            
            <div className="space-y-2 text-xs font-sans">
              <div className="flex justify-between border-b border-slate-800 pb-1 text-slate-300">
                <span>IndexedDB Table</span>
                <span className="font-mono font-bold text-teal-400">offline_medicines</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1 text-slate-300">
                <span>Cache Synchronization</span>
                <span className="text-emerald-400 font-bold">Auto-Sync Queue ready</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1 text-slate-300">
                <span>Quetta Center Link</span>
                <span className="text-slate-400">Active when online</span>
              </div>
            </div>
          </div>

        </div>

        {/* Interactive POS Sandbox Playground for Medicine Cards */}
        <div className="mt-16 pt-12 border-t border-slate-850 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-left">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1.5 bg-teal-500/10 text-teal-300 border border-teal-500/20 rounded-full px-3 py-1 text-xs font-mono font-medium">
                <Package className="h-3.5 w-3.5 text-teal-400" />
                <span>OFFLINE CACHE DEMO ENGINE</span>
              </div>
              <h3 className="font-display font-bold text-2xl text-slate-100" id="sandbox-heading">
                Interactive Medicine Cards Playground
              </h3>
              <p className="text-xs sm:text-sm text-slate-450 font-sans max-w-3xl">
                Simulate your inventory memory in Quetta during connectivity loss. Add new medicines, modify prices on medicine cards, delete old card indices, and add them to the printing thermal receipt.
              </p>
            </div>

            <button
              onClick={openAddModal}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold font-sans text-xs py-3 px-5 rounded-2xl transition flex items-center space-x-1.5 self-start md:self-auto cursor-pointer shadow-sm active:scale-97 shrink-0"
              id="add-medicine-card-btn"
            >
              <Plus className="h-4 w-4" />
              <span>Add Medicine Card</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Hand: Medicine Cards Grid */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {medicines.map((med) => (
                  <div
                    key={med.id}
                    className="bg-slate-950 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-4 hover:border-teal-500/40 hover:bg-slate-950/80 transition duration-300 group shadow-xs relative overflow-hidden"
                    id={`medicine-card-${med.id}`}
                  >
                    {/* Confirmation Overlay inside card */}
                    {deleteConfirmMedId === med.id && (
                      <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-30 flex flex-col justify-center items-center p-4 text-center space-y-3 rounded-3xl animate-fade-in">
                        <Trash2 className="h-7 w-7 text-rose-500 animate-pulse" />
                        <div className="space-y-0.5">
                          <p className="font-display font-semibold text-xs text-slate-100">Delete Medicine Card?</p>
                          <p className="text-[10px] text-slate-400 font-sans max-w-[200px]">This will clear {med.name} from cache.</p>
                        </div>
                        <div className="flex space-x-2 w-full max-w-[180px] z-40">
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmMedId(null)}
                            className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-sans font-medium transition cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMedicine(med.id)}
                            className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-sans font-medium transition cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="absolute top-4 right-4 flex space-x-1 shrink-0 opacity-40 group-hover:opacity-100 transition duration-300">
                      <button
                        onClick={() => openEditModal(med)}
                        className="p-2 bg-slate-900 hover:bg-teal-500/20 text-slate-400 hover:text-teal-300 rounded-xl transition cursor-pointer"
                        title="Edit Medicine Details"
                        id={`edit-med-btn-${med.id}`}
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmMedId(med.id)}
                        className="p-2 bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 rounded-xl transition cursor-pointer"
                        title="Delete Medicine"
                        id={`delete-med-btn-${med.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <span className="bg-slate-900 text-[9px] text-slate-400 font-mono font-bold tracking-wider px-2.5 py-1 rounded-md uppercase inline-block">
                        {med.category}
                      </span>
                      <h4 className="font-display font-semibold text-sm text-slate-100 group-hover:text-teal-400 transition duration-200">
                        {med.name}
                      </h4>
                    </div>

                    <div className="flex justify-between items-end border-t border-slate-900 pt-3.5">
                      <div className="space-y-2 text-left">
                        <div className="space-y-0.5">
                          <span className="text-[8px] text-slate-500 block uppercase font-mono tracking-wider">Unit Price</span>
                          <span className="font-mono text-sm font-bold text-slate-200">Rs {med.price.toFixed(2)}</span>
                        </div>
                        
                        {/* Print Label Button at Card Left Bottom */}
                        <button
                          type="button"
                          onClick={() => setPrintedLabelMed(med)}
                          className="py-1 px-2.5 bg-slate-900 text-teal-400 hover:text-teal-300 border border-slate-850 hover:border-teal-500/30 rounded-lg text-[9px] font-sans font-medium flex items-center space-x-1.5 transition cursor-pointer active:scale-95 shadow-xs"
                          id={`print-lbl-btn-${med.id}`}
                          title="Print Medicine card details & barcode tag"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span>Print Card</span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-2.5">
                        <span className="text-[10px] text-slate-400 font-mono">
                          Stock: <strong className={med.stock <= 10 ? 'text-rose-400 font-bold' : 'text-slate-350'}>{med.stock}</strong>
                        </span>
                        
                        <button
                          onClick={() => handleAddToReceipt(med)}
                          className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold p-2 rounded-xl transition shadow-xs active:scale-95 flex items-center justify-center cursor-pointer"
                          title="Add to active receipt bill"
                          id={`quick-sell-${med.id}`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Hand: Thermal POS Receipt */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white text-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-250 relative max-w-sm mx-auto font-mono text-xs">
                
                {/* Connection Status Ribbon in Receipt block */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <button
                    onClick={toggleOffline}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase border shadow-md transition active:scale-95 cursor-pointer flex items-center space-x-1 ${
                      isOffline 
                        ? "bg-rose-100 text-rose-700 border-rose-250" 
                        : "bg-emerald-100 text-emerald-705 border-emerald-250"
                    }`}
                    title="Simulation test offline vs online mode"
                    id="receipt-conn-toggle"
                  >
                    {isOffline ? (
                      <>
                        <WifiOff className="h-3 w-3 text-rose-600 animate-pulse" />
                        <span>OFFLINE MODE active</span>
                      </>
                    ) : (
                      <>
                        <Wifi className="h-3 w-3 text-emerald-600" />
                        <span>ONLINE CONNECTED</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Thermal Receipt Header */}
                <div className="text-center space-y-1 mb-6 mt-4">
                  <span className="font-bold text-sm block">BARAKAT MEDICAL STORE</span>
                  <span className="text-[10px] text-slate-500 block transition-all duration-350">
                    {locationBranch === "meezan" ? "Meezan Chowk, Quetta" : "Jinnah Road, Opposite Civil Hospital, Quetta"}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-sans">Ph: 0333-7890123</span>
                  <div className="border-b border-dashed border-slate-350 my-2" />
                  <div className="flex justify-between text-[10px] text-slate-500 font-sans">
                    <span>Bill# POS-2026-9912</span>
                    <span>17-Jun-2026 08:20</span>
                  </div>
                </div>

                {/* Item lists */}
                <div className="space-y-3.5 mb-5 pb-2">
                  <div className="flex justify-between font-bold text-[10px] text-slate-400 uppercase tracking-wider text-left">
                    <span>Item Name</span>
                    <span className="text-right">Qty/Price</span>
                  </div>
                  <div className="border-b border-dashed border-slate-205" />
                  
                  {cart.length === 0 ? (
                    <div className="py-10 text-center text-slate-400 font-sans text-xs leading-normal">
                      No materials in sale queue.<br />
                      <strong className="text-teal-650 cursor-pointer hover:underline" onClick={openAddModal}>Add custom medicine</strong>, or click (+) on any card to inject to bill.
                    </div>
                  ) : (
                    <div className="divide-y divide-dashed divide-slate-150 space-y-3">
                      {cart.map((item) => (
                        <div key={item.medicineId} className="flex justify-between items-start pt-2 text-left">
                          <div className="max-w-[70%]">
                            <span className="block font-sans font-bold text-slate-900 leading-tight">
                              {item.name}
                            </span>
                            <div className="flex items-center space-x-1.5 mt-1.5 font-mono text-[10px] text-slate-450">
                              <button
                                onClick={() => updateCartQty(item.medicineId, -1)}
                                className="h-4 w-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center justify-center cursor-pointer font-bold transition select-none"
                              >
                                -
                              </button>
                              <span className="text-slate-800 font-bold px-1">{item.qty}</span>
                              <button
                                onClick={() => updateCartQty(item.medicineId, 1)}
                                className="h-4 w-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center justify-center cursor-pointer font-bold transition select-none"
                              >
                                +
                              </button>
                              <span className="text-slate-500">@ Rs {item.price.toFixed(2)}</span>
                            </div>
                          </div>
                          
                          <div className="text-right shrink-0 font-mono font-bold flex flex-col items-end">
                            <span className="text-slate-950 text-xs">Rs {(item.price * item.qty).toFixed(2)}</span>
                            <button
                              onClick={() => removeCartItem(item.medicineId)}
                              className="text-[9px] text-rose-500 hover:text-rose-700 font-sans hover:underline mt-1.5 transition cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Total calculations */}
                <div className="border-t border-dashed border-slate-350 pt-3 space-y-1.5 mb-5 text-right font-mono">
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>Subtotal:</span>
                    <span>Rs {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>Sales Tax (0%):</span>
                    <span>Rs 0.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-slate-900 border-t border-dashed border-slate-250 pt-2.5">
                    <span>TOTAL BILL:</span>
                    <span className="text-teal-950">Rs {subtotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Synced Info / Sync controls */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center mb-4 space-y-1">
                  {isOffline ? (
                    <p className="text-[10px] text-rose-600 font-semibold flex items-center justify-center space-x-1 leading-normal font-sans">
                      <span>* Stored Offline in Browser Cache. Sales will auto-sync on internet detection.</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-emerald-600 font-bold flex items-center justify-center space-x-1 font-sans">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 inline shrink-0" />
                      <span>Securely Synced with Cloud Server</span>
                    </p>
                  )}
                </div>

                {/* Success simulation layout */}
                {successPaidMessage && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] p-3 rounded-xl text-left mb-4 font-sans leading-relaxed transition-all animate-fade-in">
                    <div className="font-bold flex items-center text-emerald-700 gap-1 mb-0.5 text-xs">
                      <Check className="h-4 w-4 text-emerald-600 font-extrabold" />
                      <span>Invoice Recorded Offline!</span>
                    </div>
                    <span>Simulated write to IndexedDB super-cache successful. Total: Rs {subtotal.toFixed(2)}. Queue will auto-push once online sequence initializes.</span>
                  </div>
                )}

                {/* Pay & Print Command Buttons */}
                <div className="flex gap-2 w-full">
                  <button
                    type="button"
                    onClick={handlePrintTrigger}
                    className="px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition cursor-pointer active:scale-95 font-sans flex items-center justify-center space-x-1 border border-slate-350"
                    id="receipt-print-btn"
                    title="Print Receipt"
                  >
                    <Printer className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-bold font-sans">Print</span>
                  </button>
                  <button 
                    onClick={handlePay}
                    className="flex-1 text-center bg-teal-600 hover:bg-teal-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-xs transition active:scale-95 text-xs tracking-wider cursor-pointer font-sans block"
                    id="receipt-pay-btn"
                  >
                    PAY Rs {subtotal.toFixed(2)} (F12)
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Medicine Modal drawer (Add / Edit) */}
      {medicineModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-slate-800 shadow-2xl relative space-y-6 text-left">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-display font-semibold text-slate-100">
                {editingMedicine ? "Edit Medicine Card" : "Add Medicine Card"}
              </h3>
              <button 
                onClick={() => {
                  setMedicineModalOpen(false);
                  setEditingMedicine(null);
                }}
                className="text-slate-400 hover:text-slate-200 text-xs font-mono cursor-pointer"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveMedicine} className="space-y-4 text-xs font-sans">
              
              <div className="space-y-1">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Medicine Name *</label>
                <input
                  type="text"
                  required
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder="e.g. Panadol Forte 650mg"
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:border-teal-500 text-slate-100 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-2">
                  <label className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Category</label>
                  <select
                    value={medCategory}
                    onChange={(e) => setMedCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:border-teal-500 text-slate-150 cursor-pointer text-xs"
                  >
                    <option value="Analgesic">Analgesic</option>
                    <option value="Anti-inflammatory">Anti-inflammatory</option>
                    <option value="Antibiotic">Antibiotic</option>
                    <option value="Nutritional Support">Nutritional Support</option>
                    <option value="Decongestant">Decongestant</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Unit Price (Rs) *</label>
                  <input
                    type="number"
                    required
                    min="0.1"
                    step="any"
                    value={medPrice}
                    onChange={(e) => setMedPrice(e.target.value)}
                    placeholder="e.g. 120"
                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:border-teal-500 text-slate-100 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Offline Cache Stock *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={medStock}
                  onChange={(e) => setMedStock(e.target.value)}
                  placeholder="e.g. 200"
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:border-teal-500 text-slate-100 focus:outline-hidden font-mono"
                />
              </div>

              <div className="space-y-2 text-[10px] text-slate-400 border-t border-slate-800/80 pt-3 leading-normal flex items-start space-x-1.5">
                <AlertCircle className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Creating or editing here simulates writing directly into client-side browser database schemas. These cache definitions will load inside the offline POS terminal.</span>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setMedicineModalOpen(false);
                    setEditingMedicine(null);
                  }}
                  className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl text-center active:scale-95 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-center active:scale-95 transition cursor-pointer font-sans"
                >
                  {editingMedicine ? "Save Card" : "Create Card"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Medicine Label Print Drawer / Modal */}
      {printedLabelMed && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative space-y-6 text-left">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Printer className="h-5 w-5 text-teal-400" />
                <h3 className="font-display font-semibold text-slate-100">
                  Thermal Label Printer
                </h3>
              </div>
              <button 
                onClick={() => setPrintedLabelMed(null)}
                className="text-slate-400 hover:text-slate-200 text-xs font-mono cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Generating offline barcode label sticker preview for pharmacy shelves & medicine boxes.
              </p>

              {/* Thermal Sticker Mock layout */}
              <div className="bg-white text-zinc-950 p-5 rounded-2xl border border-slate-300 shadow-inner font-mono text-center space-y-4 relative overflow-hidden select-none">
                <div className="border-b border-dashed border-zinc-400 pb-2.5">
                  <span className="text-[10px] font-bold tracking-wider uppercase block text-zinc-900">BARAKAT PHARMACY</span>
                  <span className="text-[8px] italic text-zinc-500 block">Quetta, Pakistan • Shelf Label</span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold tracking-tight uppercase leading-none text-zinc-900">
                    {printedLabelMed.name}
                  </h4>
                  <p className="text-[9px] text-zinc-650">
                    Category: {printedLabelMed.category} | Stock: {printedLabelMed.stock}
                  </p>
                </div>

                <div className="py-2 inline-block">
                  <div className="text-sm tracking-wider font-bold mb-1.5 text-zinc-900">
                    Rs {printedLabelMed.price.toFixed(2)}
                  </div>
                  {/* Decorative Barcode simulation bars */}
                  <div className="flex justify-center items-stretch h-9 space-x-[1.5px] px-4 opacity-90 mx-auto w-fit">
                    <div className="w-[1.5px] bg-zinc-900"></div>
                    <div className="w-[3px] bg-zinc-900"></div>
                    <div className="w-[1px] bg-zinc-900"></div>
                    <div className="w-[2px] bg-zinc-900"></div>
                    <div className="w-[1px] bg-zinc-900"></div>
                    <div className="w-[4px] bg-zinc-900"></div>
                    <div className="w-[2px] bg-zinc-900"></div>
                    <div className="w-[1px] bg-zinc-900"></div>
                    <div className="w-[3px] bg-zinc-900"></div>
                    <div className="w-[1.5px] bg-zinc-900"></div>
                    <div className="w-[1px] bg-zinc-900"></div>
                    <div className="w-[4px] bg-zinc-900"></div>
                    <div className="w-[1.5px] bg-zinc-900"></div>
                    <div className="w-[2px] bg-zinc-900"></div>
                    <div className="w-[3px] bg-zinc-900"></div>
                  </div>
                  <span className="text-[8px] text-zinc-500 font-mono tracking-widest block mt-1.5">
                    *BKT-{printedLabelMed.id}-OFFLINE*
                  </span>
                </div>

                <div className="border-t border-dashed border-zinc-400 pt-2 text-[8px] text-zinc-500 flex justify-between">
                  <span>EXP: 12/2028</span>
                  <span>POS STICKER</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setPrintedLabelMed(null)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-center text-xs font-medium transition cursor-pointer active:scale-95"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-center text-xs transition cursor-pointer active:scale-95 font-sans flex items-center justify-center space-x-1.5"
              >
                <Printer className="h-4 w-4 shrink-0" />
                <span>System Print</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Virtual POS Thermal Printer Modal Overlay */}
      {isPrintingSimActive && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6 text-left">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-display font-semibold text-slate-100 flex items-center gap-1.5 text-sm sm:text-base">
                  <Printer className="h-5 w-5 text-teal-400" />
                  <span>Virtual Thermal Printer / ورچوئل پرنٹر</span>
                </h3>
              </div>
              <button 
                onClick={() => setIsPrintingSimActive(false)}
                className="text-slate-400 hover:text-rose-400 text-xs font-mono transition cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Educational Alert */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-2">
              <span className="text-[9px] font-mono tracking-widest text-teal-400 uppercase block font-semibold">ℹ️ SYSTEM COMPATIBILITY RULES</span>
              <p className="text-[11px] text-slate-350 leading-relaxed font-sans">
                <strong>Sandbox Notice:</strong> If browser security restricts direct automatic hardware printing, please use our standalone physical download tools or hit <strong>System Print</strong> to prompt manually.
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans text-right" style={{ direction: 'rtl' }}>
                سیکیورٹی کی وجہ سے پرنٹ باکس محدود ہو سکتا ہے۔ رسید پرنٹ کرنے کے لیے نیچے موجود <strong>ڈاؤنلوڈ</strong> بٹن دبائیں۔
              </p>
            </div>

            {/* Thermal Print Reel Animation Area */}
            <div className="bg-slate-950 p-4 sm:p-6 rounded-2xl border border-slate-800 overflow-hidden relative group max-h-[300px] overflow-y-auto">
              <div className="absolute top-1 right-2 z-10">
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[8px] font-mono font-bold tracking-wider">
                  {printFeedAnimation ? "FEEDING TAPE..." : "ROLL SEAM SECURE"}
                </span>
              </div>

              {/* Rolling paper tape wrapper */}
              <div className={`bg-white text-slate-800 p-5 rounded-lg border-x-4 border-slate-200 shadow-md font-mono text-[10px] space-y-4 max-w-xs mx-auto text-left select-text relative transition-transform duration-1000 ${
                printFeedAnimation ? "translate-y-4 scale-98 opacity-90" : "translate-y-0 opacity-100"
              }`}>
                {/* Jagated tear top effect */}
                <div className="absolute -top-1 left-0 right-0 h-2 bg-[radial-gradient(circle_at_center,transparent_31%,#000_32%)_top_left/6px_3px_repeat-x] rotate-180 opacity-20 pointer-events-none" />

                <div className="text-center space-y-1">
                  <span className="font-bold text-xs block text-slate-950">BARAKAT MEDICAL STORE</span>
                  <span className="text-[8px] text-slate-500 block">
                    {locationBranch === "meezan" ? "Meezan Chowk, Quetta" : "Jinnah Road, Opposite Civil Hospital, Quetta"}
                  </span>
                  <span className="text-[8px] text-slate-500 block">Ph: 0333-7890123</span>
                  <div className="border-b border-dashed border-zinc-300 my-2" />
                  <div className="flex justify-between text-[8px] text-slate-500">
                    <span>Bill# POS-2026-9912</span>
                    <span>17-Jun-2026 08:20</span>
                  </div>
                </div>

                {/* Items loop */}
                <div className="space-y-2 border-t border-b border-dashed border-zinc-200 py-2">
                  {cart.map((item) => (
                    <div key={item.medicineId} className="flex justify-between text-[9px] text-slate-900 leading-tight">
                      <div>
                        <span className="font-semibold block">{item.name}</span>
                        <span className="text-[8px] text-zinc-500">{item.qty} x Rs {item.price.toFixed(2)}</span>
                      </div>
                      <span className="font-bold">Rs {(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                  {cart.length === 0 && (
                    <div className="text-center text-[9px] text-zinc-400 py-3">Receipt is currently empty</div>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-1 text-right text-[9px] font-semibold text-slate-900">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>Rs {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-dashed border-zinc-200 pt-1 text-slate-950 text-xs">
                    <span>TOTAL:</span>
                    <span>Rs {subtotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-[8px] text-emerald-700 font-bold border border-emerald-300 bg-emerald-50 p-1.5 rounded text-center leading-normal">
                  Securely Synced with Chrome DB
                </div>

                {/* Jagated tear bottom effect */}
                <div className="absolute -bottom-1 left-0 right-0 h-2 bg-[radial-gradient(circle_at_center,transparent_31%,#000_32%)_top_left/6px_3px_repeat-x] opacity-20 pointer-events-none" />
              </div>
            </div>

            {/* Print Action Choices */}
            <div className="grid grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={handleDownloadTxtInvoice}
                className="py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-sans font-bold rounded-xl text-center text-xs transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 shadow-md hover:brightness-110"
              >
                <Printer className="h-4 w-4" />
                <span>Download Sticker (.txt)</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  try {
                    window.print();
                  } catch (e) {
                     alert("Direct printing blocked in sandbox frame. Please download as .txt instead!");
                  }
                }}
                className="py-3 bg-slate-800 hover:bg-slate-750 text-white font-sans font-medium rounded-xl text-center text-xs transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <Printer className="h-4 w-4" />
                <span>Prompt Print Dial</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsPrintingSimActive(false)}
              className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 text-slate-400 rounded-xl text-center text-xs font-medium border border-slate-800/60 transition cursor-pointer"
            >
              Close Print Viewer
            </button>
          </div>
        </div>
      )}

    </section>
  );
}
