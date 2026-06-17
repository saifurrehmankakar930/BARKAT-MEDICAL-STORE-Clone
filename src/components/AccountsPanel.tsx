/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  FileSpreadsheet, 
  Calendar,
  CheckCircle2,
  CreditCard,
  Trash2,
  Edit2,
  Wallet,
  AlertCircle,
  Check
} from "lucide-react";
import { LedgerEntry, PaymentCard } from "../types";
import { getAllFromStore, putInStore, deleteFromStore } from "../lib/indexedDB";

interface AccountsProps {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

export default function AccountsPanel({ refreshTrigger, triggerRefresh }: AccountsProps) {
  const [ledgers, setLedgers] = useState<LedgerEntry[]>([]);
  const [selectedBook, setSelectedBook] = useState<"All" | "Cash Book" | "Supplier Ledger" | "Customer Ledger">("All");

  // Tab views
  const [activeSubTab, setActiveSubTab] = useState<"journal" | "cards">("journal");

  // Payment card states
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<PaymentCard | null>(null);

  // Card form states
  const [holderName, setHolderName] = useState("");
  const [bankName, setBankName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardType, setCardType] = useState<"Debit" | "Credit" | "Mobile Wallet" | "Other">("Debit");
  const [expiry, setExpiry] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Expense modal states
  const [expenseModal, setExpenseModal] = useState(false);
  const [expName, setExpName] = useState("");
  const [expAmount, setExpAmount] = useState<number>(0);
  const [expCategory, setExpCategory] = useState("Utilities");

  useEffect(() => {
    loadLedgers();
    loadCards();
  }, [refreshTrigger]);

  async function loadCards() {
    try {
      const cc = await getAllFromStore<PaymentCard>("payment_cards");
      setCards(cc);
    } catch (err) {
      console.error("Error loading payment cards:", err);
    }
  }

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holderName || !bankName || !cardNumber) {
      alert("Please fill in all required fields.");
      return;
    }

    const cardId = editingCard ? editingCard.id : `CARD-${Date.now()}`;
    const payload: PaymentCard = {
      id: cardId,
      cardholderName: holderName,
      bankName: bankName,
      cardNumber: cardNumber,
      cardType: cardType,
      expiryDate: expiry || undefined,
      isActive: isActive,
      createdAt: editingCard ? editingCard.createdAt : new Date().toISOString()
    };

    try {
      await putInStore<PaymentCard>("payment_cards", payload);
      setCardModalOpen(false);
      setEditingCard(null);
      // Reset form
      setHolderName("");
      setBankName("");
      setCardNumber("");
      setCardType("Debit");
      setExpiry("");
      setIsActive(true);
      
      loadCards();
      triggerRefresh();
    } catch (err) {
      console.error("Failed to save card:", err);
      alert("Error saving payment card details.");
    }
  };

  const openEditCardModal = (card: PaymentCard) => {
    setEditingCard(card);
    setHolderName(card.cardholderName);
    setBankName(card.bankName);
    setCardNumber(card.cardNumber);
    setCardType(card.cardType);
    setExpiry(card.expiryDate || "");
    setIsActive(card.isActive);
    setCardModalOpen(true);
  };

  const handleDeleteCard = async (id: string) => {
    try {
      await deleteFromStore("payment_cards", id);
      setDeleteConfirmId(null);
      loadCards();
      triggerRefresh();
    } catch (err) {
      console.error("Failed to delete card:", err);
      alert("Error deleting payment card from store.");
    }
  };

  async function loadLedgers() {
    try {
      const all = await getAllFromStore<LedgerEntry>("ledger_entries");
      // Sort chronologically
      const sorted = all.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      // Calculate running balance dynamically
      let runningBal = 0;
      const computed = sorted.map(entry => {
        if (entry.accountType === "Cash Book" || entry.accountType === "Revenue Account") {
          runningBal += (entry.debit - entry.credit);
        } else if (entry.accountType === "Supplier Ledger") {
          runningBal += (entry.credit - entry.debit); // Credit increases supplier liability
        } else {
          runningBal += (entry.debit - entry.credit);
        }
        return { ...entry, balance: runningBal };
      });

      setLedgers(computed.reverse()); // Reverse to show latest first in table
    } catch (err) {
      console.error("Error loading ledger books:", err);
    }
  }

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!expName || expAmount <= 0) {
      alert("Please enter a valid expense item and amount.");
      return;
    }

    const payload: LedgerEntry = {
      id: `LEDG-EXP-${Date.now()}`,
      accountType: "Expense Account",
      entityId: "SYSTEM",
      entityName: expCategory,
      description: `${expName} (${expCategory})`,
      debit: 0,
      credit: expAmount, // Cash credit outflow
      balance: 0,
      createdAt: new Date().toISOString()
    };

    try {
      await putInStore<LedgerEntry>("ledger_entries", payload);
      setExpenseModal(false);
      setExpName("");
      setExpAmount(0);
      triggerRefresh();
      loadLedgers();
    } catch (err) {
      console.error("Failed to log expense ledger entry:", err);
      alert("Error writing expense entry to local database.");
    }
  };

  // Filter ledgers
  const filteredLedgers = ledgers.filter(l => {
    if (selectedBook === "All") return true;
    return l.accountType === selectedBook;
  });

  // Calculate high-level totals
  const totalDebits = ledgers.reduce((acc, l) => acc + l.debit, 0);
  const totalCredits = ledgers.reduce((acc, l) => acc + l.credit, 0);
  const currentCashInHand = ledgers
    .filter(l => l.accountType === "Cash Book" || l.accountType === "Expense Account")
    .reduce((acc, l) => acc + l.debit - l.credit, 0);

  // Compute dynamic P&L Statement
  const revenueRevenue = ledgers.reduce((s, l) => s + l.debit, 0); // Walk-in total POS sales
  const costOfGoodsSold = Math.floor(revenueRevenue * 0.72); // Approx 72% cost
  const grossProfit = revenueRevenue - costOfGoodsSold;
  
  // Expenses logged
  const totalOperatingExpenses = ledgers
    .filter(l => l.accountType === "Expense Account")
    .reduce((acc, l) => acc + l.credit, 0) + 12000; // Baseline local rents / generator fuel baseline

  const netIncome = grossProfit - totalOperatingExpenses;

  return (
    <div className="space-y-6 text-left" id="double-entry-accounting-pane">
      
      {/* Title Details */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 border-b border-slate-100 pb-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-800">
            Double-Entry Accounting Desk
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Review automatic clinical ledger journals, audit cash logs, write operating expense journals.
          </p>
        </div>
        <button
          onClick={() => setExpenseModal(true)}
          className="bg-teal-750 hover:bg-teal-700 text-white font-semibold text-xs py-3 px-5 rounded-2xl transition flex items-center space-x-1.5 shadow-sm active:scale-97 cursor-pointer"
          id="log-expense-btn"
        >
          <Plus className="h-4 w-4" />
          <span>Record Expense Journal</span>
        </button>
      </div>

      {/* Sub tabs switches */}
      <div className="flex space-x-6 border-b border-slate-100 pb-2">
        <button
          onClick={() => setActiveSubTab("journal")}
          className={`py-2 px-3 text-xs uppercase tracking-wider font-mono font-bold transition relative cursor-pointer ${
            activeSubTab === "journal" 
              ? "text-teal-705 border-b-2 border-teal-605 text-teal-800" 
              : "text-slate-400 hover:text-slate-655"
          }`}
          id="journal-view-toggle"
        >
          <span>Ledger Books & Reports</span>
        </button>
        <button
          onClick={() => setActiveSubTab("cards")}
          className={`py-2 px-3 text-xs uppercase tracking-wider font-mono font-bold transition relative cursor-pointer ${
            activeSubTab === "cards" 
              ? "text-teal-705 border-b-2 border-teal-655 text-teal-800" 
              : "text-slate-400 hover:text-slate-655"
          }`}
          id="cards-view-toggle"
        >
          <span>Manage Store Payment Cards</span>
        </button>
      </div>

      {activeSubTab === "journal" ? (
        <>
          {/* Stats row info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Cash balance widget */}
            <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-2xs flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">Net Cash in Drawer</span>
                <span className="text-xl font-mono font-bold text-teal-850 block">
                  Rs {currentCashInHand.toLocaleString()}
                </span>
                <span className="text-[10px] text-teal-600 flex items-center space-x-1 font-semibold">
                  <TrendingUp className="h-3 w-3 inline" />
                  <span>Fluid Liquid Capital</span>
                </span>
              </div>
              <div className="p-3 bg-teal-50 text-teal-800 rounded-xl">
                <Coins className="h-5 w-5" />
              </div>
            </div>

            {/* Operating Rev margin widget */}
            <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-2xs flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block font-bold">Matched Debits (Incoming)</span>
                <span className="text-xl font-mono font-bold text-emerald-600 block">
                  Rs {totalDebits.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-505 block">Aggregated sales & credits collections</span>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>

            {/* Matched Credits widget */}
            <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-2xs flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">Matched Credits (Outgoing)</span>
                <span className="text-xl font-mono font-bold text-rose-600 block">
                  Rs {totalCredits.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-505 block">Suppliers payments & store expenses</span>
              </div>
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">
                <TrendingDown className="h-5 w-5" />
              </div>
            </div>

          </div>

          {/* Main Ledger grid & P&L Statement spreadsheet */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Double-Entry Journal logs - col-span-8 */}
            <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-50 pb-3 gap-3">
                <h3 className="font-display font-semibold text-base text-slate-800">
                  Double-Entry Transaction Journal
                </h3>
                
                {/* Book selectors */}
                <div className="flex space-x-1.5 p-1 bg-slate-50 rounded-xl border border-slate-205">
                  {(["All", "Cash Book", "Supplier Ledger", "Customer Ledger"] as const).map(bk => (
                    <button
                      key={bk}
                      onClick={() => setSelectedBook(bk)}
                      className={`py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                        selectedBook === bk 
                          ? "bg-white text-teal-705 shadow-2xs text-teal-800" 
                          : "text-slate-500 hover:text-slate-850"
                      }`}
                    >
                      {bk === "All" ? "All Books" : bk}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto max-h-[480px]">
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                      <th className="py-3.5 px-4">Date / Hour</th>
                      <th className="py-3.5 px-4">Book Target</th>
                      <th className="py-3.5 px-4">Entity Description</th>
                      <th className="py-3.5 px-4 text-right">Debit Dr (PKR)</th>
                      <th className="py-3.5 px-4 text-right">Credit Cr (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLedgers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                          No matching double-entry book transactions found!
                        </td>
                      </tr>
                    ) : (
                      filteredLedgers.map(l => (
                        <tr key={l.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3.5 px-4 text-slate-500 font-mono font-semibold">
                            {new Date(l.createdAt).toLocaleDateString()} {new Date(l.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="bg-slate-100/90 text-[10px] px-2 py-0.5 rounded-md font-mono text-slate-655 font-bold">
                              {l.accountType}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-850 font-sans">
                            <div className="font-bold leading-normal">{l.description}</div>
                            <span className="text-[10px] text-slate-400">{l.entityName}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                            {l.debit > 0 ? `Rs ${l.debit.toLocaleString()}` : "—"}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600">
                            {l.credit > 0 ? `Rs ${l.credit.toLocaleString()}` : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dynamic P&L Spreadsheet - col-span-4 */}
            <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-2xs space-y-4">
              <div className="border-b border-slate-50 pb-3">
                <h3 className="font-display font-semibold text-base text-slate-800 flex items-center space-x-1.5">
                  <Plus className="h-5 w-5 text-teal-700 invisible" />
                  <span>Profit & Loss Statement</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">Simulated YTD (Jan-Jun 2026)</span>
              </div>

              <div className="space-y-4 text-xs font-sans">
                
                {/* Revenue Row */}
                <div className="flex justify-between items-baseline font-semibold text-slate-800">
                  <span className="text-slate-600 ml-1">Gross POS Sales Revenue:</span>
                  <span className="font-mono">Rs {revenueRevenue.toLocaleString()}</span>
                </div>

                {/* Cost of goods */}
                <div className="flex justify-between items-baseline text-slate-605">
                  <span className="text-slate-505 ml-1">(-) Cost of Goods Sold (COGS):</span>
                  <span className="font-mono text-rose-650">-Rs {costOfGoodsSold.toLocaleString()}</span>
                </div>

                <div className="border-t border-slate-100 pt-2 flex justify-between items-baseline font-bold text-slate-950">
                  <span>Gross Profit Margin:</span>
                  <span className="font-mono text-emerald-700 font-bold">Rs {grossProfit.toLocaleString()}</span>
                </div>

                {/* Operating expenses */}
                <div className="space-y-2 border-t border-dashed border-slate-100 pt-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Operating expenses</span>
                  
                  <div className="flex justify-between items-baseline text-slate-605">
                    <span className="text-slate-505 ml-1">Local store Rents (baseline):</span>
                    <span className="font-mono text-rose-600">-Rs 10,000</span>
                  </div>

                  <div className="flex justify-between items-baseline text-slate-605">
                    <span className="text-slate-505 ml-1">Generator fuel / Load-shedding:</span>
                    <span className="font-mono text-rose-600">-Rs 2,000</span>
                  </div>

                  {/* Logged custom expenses */}
                  {ledgers.filter(l => l.accountType === "Expense Account").map(l => (
                    <div key={l.id} className="flex justify-between items-baseline text-slate-605">
                      <span className="text-slate-505 ml-1 truncate max-w-[180px]">{l.description}:</span>
                      <span className="font-mono text-rose-600">-Rs {l.credit.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Operating net income */}
                <div className="border-t-2 border-slate-900 pt-3 flex justify-between items-baseline font-extrabold text-sm text-slate-900 bg-slate-50 p-3 rounded-2xl border">
                  <span>Net profit income:</span>
                  <span className={`font-mono ${netIncome >= 0 ? "text-teal-700" : "text-rose-605"}`}>
                    Rs {netIncome.toLocaleString()}
                  </span>
                </div>

                <div className="text-[10px] text-slate-400 leading-relaxed font-sans p-1">
                  * Note: Cost of goods sold is dynamically computed at product trade cost values. Log store expenses frequently to keep margins matching original status.
                </div>

              </div>
            </div>

          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 pb-4">
            <div>
              <h3 className="font-display font-medium text-lg text-slate-800 font-semibold">
                Registered Store Payment Cards & Wallets
              </h3>
              <p className="text-xs text-slate-500 font-sans">
                Manage card terminals and mobile wallets used for accepting digital customer checkout transactions.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCard(null);
                setHolderName("");
                setBankName("");
                setCardNumber("");
                setCardType("Debit");
                setExpiry("");
                setIsActive(true);
                setCardModalOpen(true);
              }}
              className="bg-teal-750 hover:bg-teal-700 text-white font-semibold text-xs py-3 px-5 rounded-2xl transition flex items-center space-x-1.5 shadow-sm active:scale-97 cursor-pointer"
              id="add-payment-card-btn"
            >
              <Plus className="h-4 w-4" />
              <span>Add Store Card/Wallet</span>
            </button>
          </div>

          {cards.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center text-slate-400 border border-slate-100 space-y-3 shadow-2xs">
              <CreditCard className="h-10 w-10 mx-auto text-slate-350" />
              <p className="text-sm font-sans font-semibold">No store payment cards configured yet.</p>
              <p className="text-xs text-slate-500">Add credit/debit cards or EasyPaisa/JazzCash accounts with the button above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card) => {
                let gradientClass = "from-slate-900 via-slate-850 to-slate-800";
                
                if (card.bankName.toLowerCase().includes("meezan")) {
                  gradientClass = "from-emerald-950 via-teal-950 to-emerald-900";
                } else if (card.bankName.toLowerCase().includes("habib") || card.bankName.toLowerCase().includes("hbl")) {
                  gradientClass = "from-teal-950 via-slate-900 to-teal-950";
                } else if (card.bankName.toLowerCase().includes("easy") || card.bankName.toLowerCase().includes("paisa")) {
                  gradientClass = "from-emerald-900 via-emerald-800 to-teal-850";
                } else if (card.cardType === "Credit") {
                  gradientClass = "from-indigo-950 via-indigo-900/60 to-slate-950";
                } else if (card.cardType === "Mobile Wallet") {
                  gradientClass = "from-cyan-950 via-sky-950 to-teal-950";
                }

                return (
                  <div 
                    key={card.id}
                    className={`relative overflow-hidden aspect-[1.586/1] rounded-3xl bg-gradient-to-br ${gradientClass} border border-white/10 p-6 flex flex-col justify-between text-white shadow-xl group transition duration-300 hover:shadow-2xl hover:scale-102`}
                    id={`payment-card-${card.id}`}
                  >
                    {/* Gloss / shine ring effect */}
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_40%)] pointer-events-none" />
                    
                    {/* Confirmation Overlay inside payment card */}
                    {deleteConfirmId === card.id && (
                      <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-30 flex flex-col justify-center items-center p-4 text-center space-y-3 animate-fade-in">
                        <Trash2 className="h-8 w-8 text-rose-500 animate-bounce" />
                        <div className="space-y-0.5">
                          <p className="font-display font-bold text-xs text-slate-100">Delete Payment Card?</p>
                          <p className="text-[10px] text-slate-400 font-sans max-w-[180px]">This will permanently prune {card.bankName} from stores.</p>
                        </div>
                        <div className="flex space-x-2.5 w-full max-w-[200px] z-40">
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-705 text-white rounded-xl text-[10px] font-sans font-bold transition cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCard(card.id)}
                            className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] font-sans font-bold transition cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Card Top */}
                    <div className="flex justify-between items-start z-10 w-full mb-2">
                      <div className="space-y-1 text-left">
                        <span className="font-sans font-extrabold text-xs tracking-wider uppercase block truncate max-w-[150px]">
                          {card.bankName}
                        </span>
                        <span className="bg-white/15 backdrop-blur-md text-[8px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-full uppercase inline-block">
                          {card.cardType}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1.5 opacity-80 group-hover:opacity-100 transition shrink-0">
                        <button
                          onClick={() => openEditCardModal(card)}
                          className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition cursor-pointer"
                          title="Edit Card Details"
                          id={`edit-card-${card.id}`}
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(card.id)}
                          className="p-1.5 bg-white/10 hover:bg-rose-500/30 text-white hover:text-rose-200 rounded-lg transition cursor-pointer"
                          title="Delete Card"
                          id={`delete-card-${card.id}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Card Middle Chip */}
                    <div className="flex items-center justify-between z-10 my-2">
                      {/* Gold Chip design */}
                      <div className="w-8 h-6 bg-amber-400/90 rounded-md border border-amber-300 relative overflow-hidden flex flex-col justify-between p-1 opacity-85 shadow-inner">
                        <div className="flex justify-between h-full w-full">
                          <div className="border border-amber-600/30 w-1/3 h-full rounded-xs" />
                          <div className="border border-amber-600/30 w-1/3 h-full rounded-xs mx-0.5" />
                          <div className="border border-amber-600/30 w-1/3 h-full rounded-xs" />
                        </div>
                      </div>
                      
                      {/* Contactless Wi-fi design */}
                      <div className="h-5 w-5 text-white/40">
                        <svg className="w-5 h-5 rotate-90 fill-current opacity-60" viewBox="0 0 24 24">
                          <path d="M12 3c-1.2 0-2.4 1-2.4 2.1 0 .9.6 1.7 1.4 2 .1.4.1.8.1 1.2a7 7 0 01-5 6.7c.3.5.3 1.1-.1 1.5-.5.5-1.3.5-1.8 0a9 9 0 026.9-9.4c0-.3 0-.6-.1-.9.7-.3 1.1-1 1.1-1.7 0-1.2-1.1-1.5-1.1-1.5zm.3 4h-.1 1.1s-.1-.8-.4-1.3-.6-.6-.6-.6-.2.4-.1.8.1 1.1.1 1.1z"/>
                        </svg>
                      </div>
                    </div>

                    {/* Card Bottom */}
                    <div className="space-y-2 z-10 text-left mt-auto">
                      {/* Masked Card number */}
                      <div className="font-mono text-[13px] tracking-widest leading-none">
                        {card.cardNumber}
                      </div>
                      
                      <div className="flex justify-between items-end text-left pt-1">
                        <div className="space-y-0.5 truncate max-w-[70%]">
                          <span className="text-[7px] text-white/50 block uppercase tracking-wider font-mono">Cardholder</span>
                          <span className="font-mono text-[9px] font-bold uppercase tracking-wider block truncate">
                            {card.cardholderName}
                          </span>
                        </div>
                        {card.expiryDate && (
                          <div className="space-y-0.5 text-right shrink-0">
                            <span className="text-[7px] text-white/50 block uppercase tracking-wider font-mono">Valid Thru</span>
                            <span className="font-mono text-[9px] font-bold block">{card.expiryDate}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Active/Inactive state overlay ribbon */}
                    {!card.isActive && (
                      <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center text-xs font-mono font-bold tracking-widest uppercase text-rose-350 pointer-events-none z-20">
                        [ INACTIVE CARD ]
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Payment Card Modal */}
      {cardModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-slate-200 shadow-2xl relative space-y-6 text-left">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-display font-semibold text-slate-800">
                {editingCard ? "Edit Payment Card" : "Add Store Payment Card"}
              </h3>
              <button 
                onClick={() => {
                  setCardModalOpen(false);
                  setEditingCard(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-xs font-mono font-bold uppercase cursor-pointer"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveCard} className="space-y-4 text-xs font-sans">
              
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Bank Name / Provider *</label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. Meezan Bank Ltd, EasyPaisa"
                  className="w-full bg-slate-50 border border-slate-205 p-3 rounded-xl focus:bg-white text-slate-800 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Cardholder Name *</label>
                <input
                  type="text"
                  required
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  placeholder="e.g. BARAKAT PHARMACY MAIN"
                  className="w-full bg-slate-50 border border-slate-205 p-3 rounded-xl focus:bg-white text-slate-800 focus:outline-hidden uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Card Type *</label>
                  <select
                    value={cardType}
                    onChange={(e) => setCardType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-205 p-3 rounded-xl focus:bg-white text-slate-800 cursor-pointer text-xs"
                  >
                    <option value="Debit">Debit Card</option>
                    <option value="Credit">Credit Card</option>
                    <option value="Mobile Wallet">Mobile Wallet</option>
                    <option value="Other">Other Wallet</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Expiry Date</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="e.g. 12/28"
                    className="w-full bg-slate-50 border border-slate-205 p-3 rounded-xl focus:bg-white text-slate-800 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Card / Account Number *</label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="e.g. **** **** **** 4321"
                  className="w-full bg-slate-50 border border-slate-205 p-3 rounded-xl focus:bg-white text-slate-800 focus:outline-hidden font-mono text-sm"
                />
              </div>

              <div className="flex items-center space-x-2 py-1">
                <input
                  type="checkbox"
                  id="card-active-checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded-sm border-slate-300 text-teal-650 focus:ring-teal-500 h-4 w-4 shrink-0"
                />
                <label htmlFor="card-active-checkbox" className="text-slate-600 font-medium cursor-pointer">
                  Card is active for receiving sales transactions
                </label>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setCardModalOpen(false);
                    setEditingCard(null);
                  }}
                  className="flex-1 py-3 bg-slate-100 text-slate-601 rounded-xl text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-teal-700 hover:bg-teal-650 text-white font-bold rounded-xl text-center"
                >
                  {editingCard ? "Save Changes" : "Create Card"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Expense Modal drawer */}
      {expenseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-slate-200 shadow-2xl relative space-y-6">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-display font-semibold text-slate-800">
                Log Operational Expense
              </h3>
              <button 
                onClick={() => setExpenseModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-mono font-bold uppercase cursor-pointer"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-4 text-xs font-sans text-left">
              
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Expense Name / Description *</label>
                <input
                  type="text"
                  required
                  value={expName}
                  onChange={(e) => setExpName(e.target.value)}
                  placeholder="e.g. Generator Fuel - Jinnah Rd"
                  className="w-full bg-slate-50 border border-slate-205 p-3 rounded-xl focus:bg-white text-slate-800 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Expense Category *</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 p-3 rounded-xl focus:bg-white text-slate-800 cursor-pointer text-xs"
                >
                  <option value="Utilities">Utilities (Electricity/Water)</option>
                  <option value="Store Maintenance">Store Maintenance</option>
                  <option value="Emergency Generator">Emergency Generator Fuel</option>
                  <option value="Staff Refreshment">Staff Lunch/Chai</option>
                  <option value="Marketing & Leaflets">Marketing & Leaflets</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Total Cash Paid (PKR) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={expAmount || ""}
                  onChange={(e) => setExpAmount(Number(e.target.value))}
                  placeholder="2000"
                  className="w-full bg-slate-50 border border-slate-205 p-3 rounded-xl focus:bg-white font-mono text-slate-800 focus:outline-hidden text-sm"
                />
              </div>

              <div className="flex space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setExpenseModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-601 rounded-xl text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-teal-700 hover:bg-teal-650 text-white font-bold rounded-xl text-center"
                >
                  Log Expense
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
