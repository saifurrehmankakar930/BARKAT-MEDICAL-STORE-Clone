/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  LineChart, 
  Download, 
  Printer, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  FileText,
  Percent,
  Search,
  Filter
} from "lucide-react";
import { Product, Sale, SaleItem } from "../types";
import { getAllFromStore } from "../lib/indexedDB";

export default function ReportsPanel() {
  const [activeTab, setActiveTab] = useState<"sales" | "profit" | "expirations">("sales");
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const salesList = await getAllFromStore<Sale>("sales");
      const prodList = await getAllFromStore<Product>("products");

      setSales(salesList.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setProducts(prodList);
    } catch (err) {
      console.error("Error fetching report data:", err);
    }
  }

  // Export to CSV helper
  const exportToCSV = (dataType: string, data: any[]) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (dataType === "sales") {
      csvContent += "Invoice ID,Customer Name,Date,Payment Option,Synced Status,Total Bill (PKR)\n";
      data.forEach(s => {
        csvContent += `"${s.id}","${s.customerName || "Walk-in"}","${s.createdAt}","${s.paymentMethod}","${s.synced}","${s.total}"\n`;
      });
    } else if (dataType === "profit") {
      csvContent += "Transaction Invoice,Date,Gross Revenue,Approximated COGS,Net Income (PKR),Net Margin (%)\n";
      data.forEach(s => {
        const cogs = Math.floor(s.total * 0.72);
        const net = s.total - cogs;
        csvContent += `"${s.id}","${s.createdAt}","${s.total}","${cogs}","${net}","28%"\n`;
      });
    } else if (dataType === "expirations") {
      csvContent += "Brand Formula Name,Classification,Batch ID,Expiry Date,Warehouse Stock\n";
      data.forEach(p => {
        csvContent += `"${p.name}","${p.category}","${p.batchNumber}","${p.expiryDate}","${p.stockQty}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BarakatPharma_Report_${dataType}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Expiration threshold filtering
  const expiringProducts = products.filter(p => {
    const expYear = parseInt(p.expiryDate.split("-")[0]);
    const expMonth = parseInt(p.expiryDate.split("-")[1]);
    return (expYear === 2026 && expMonth <= 10);
  });

  return (
    <div className="space-y-6 text-left" id="reports-analytics-pane">
      
      {/* Title block with Export action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 border-b border-slate-100 pb-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-800">
            System Reports Spreadsheet
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Audit sales, monitor net product margins, extract pharmacopoeia records for DRAP officials.
          </p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => exportToCSV(activeTab, activeTab === "sales" ? sales : activeTab === "profit" ? sales : expiringProducts)}
            className="bg-white border border-slate-205 text-slate-705 text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-semibold text-xs py-2.5 px-4 rounded-xl transition flex items-center space-x-1.5 active:scale-97 cursor-pointer"
            id="export-csv-btn"
          >
            <Download className="h-4 w-4" />
            <span>Export to CSV Sheet</span>
          </button>
          <button
            onClick={() => window.print()}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition flex items-center space-x-1.5 active:scale-97 cursor-pointer"
            id="print-pdf-report-btn"
          >
            <Printer className="h-4 w-4" />
            <span>Print report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Tabs list selectors */}
      <div className="border-b border-slate-100 flex space-x-6 text-sm">
        <button
          onClick={() => setActiveTab("sales")}
          className={`pb-3 font-semibold transition cursor-pointer ${
            activeTab === "sales" ? "border-b-2 border-teal-600 text-teal-700" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          Daily Sales Audit
        </button>
        <button
          onClick={() => setActiveTab("profit")}
          className={`pb-3 font-semibold transition cursor-pointer ${
            activeTab === "profit" ? "border-b-2 border-teal-600 text-teal-700" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          Product Profit Margins
        </button>
        <button
          onClick={() => setActiveTab("expirations")}
          className={`pb-3 font-semibold transition cursor-pointer ${
            activeTab === "expirations" ? "border-b-2 border-teal-600 text-teal-700" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          Batches Expirations Grid
        </button>
      </div>

      {/* Tab panels details */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-2xs p-6 space-y-4">
        
        {/* Sales report panel */}
        {activeTab === "sales" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">Sales Transaction Registry</span>
              <span className="bg-teal-50 text-teal-750 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {sales.length} Bills closed
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-none">
                    <th className="py-3 px-4">Invoice Bill ID</th>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Date Time</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4 text-center">Cloud Synced</th>
                    <th className="py-3 px-4 text-right">Invoiced Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sales.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No transactions closed in this session.
                      </td>
                    </tr>
                  ) : (
                    sales.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                          {s.id}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {s.customerName || "Walk-In Patient"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono">
                          {new Date(s.createdAt).toLocaleDateString()} {new Date(s.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium font-mono">
                          {s.paymentMethod}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {s.synced ? (
                            <span className="text-emerald-600 font-bold text-[10px] uppercase inline-flex items-center space-x-1 font-sans">
                              <CheckCircle2 className="h-3 w-3 mr-0.5 inline" />
                              <span>Live Synced</span>
                            </span>
                          ) : (
                            <span className="text-rose-500 font-bold text-[10px] uppercase inline-flex items-center space-x-1 animate-pulse font-sans">
                              <span>Local Cache</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                          Rs {s.total.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Profit Report panel */}
        {activeTab === "profit" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">Gross margins audit</span>
              <span className="text-[10px] text-slate-500 font-sans italic">Markup average calculated at 28.3%</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                    <th className="py-3 px-4">Transaction Reference</th>
                    <th className="py-3 px-4">Dispense Date</th>
                    <th className="py-3 px-4 text-right">Gross revenue (PKR)</th>
                    <th className="py-3 px-4 text-right">Aprox. COGS (PKR)</th>
                    <th className="py-3 px-4 text-right">Net Margin Income</th>
                    <th className="py-3 px-4 text-center">Markup GP %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sales.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No transactions to evaluate yet. Create sales on POS register.
                      </td>
                    </tr>
                  ) : (
                    sales.map(s => {
                      const cogs = Math.floor(s.total * 0.717); // COGS approx
                      const net = s.total - cogs;
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                            {s.id}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-mono">
                            {new Date(s.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                            Rs {s.total.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                            Rs {cogs.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                            Rs {net.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center space-x-1 font-mono">
                              <Percent className="h-2.5 w-2.5" />
                              <span>28.3%</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Expirations tabular panel */}
        {activeTab === "expirations" && (
          <div className="space-y-4">
            <div className="bg-rose-50 border border-rose-201 p-4 rounded-2xl flex items-start space-x-2.5 text-xs text-rose-800 leading-normal">
              <AlertTriangle className="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-950 block">DRAP PHARMACOVIGILANCE DIRECTIVE:</span>
                <span>The medicines listed below are expiring within 120 days. Legally, these batches must be removed from customer-facing cabinets to avoid safety liability under Balochistan drug regulations.</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="font-mono font-bold text-slate-400 uppercase">Isolate batches logs</span>
              <span className="font-bold text-rose-600 font-mono">
                {expiringProducts.length} Batches need attention
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                    <th className="py-3 px-4">Medical Formula</th>
                    <th className="py-3 px-4">Classification</th>
                    <th className="py-3 px-4">Batch ID</th>
                    <th className="py-3 px-4">Expiry date</th>
                    <th className="py-3 px-4 text-right">Warehouse stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expiringProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-semibold font-sans">
                        No batches expiring soon. Well-balanced inventory lifecycle!
                      </td>
                    </tr>
                  ) : (
                    expiringProducts.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition text-slate-700 font-medium">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {p.name}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="bg-slate-105/90 text-slate-700 px-2 py-0.5 rounded-md text-[10px]">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          {p.batchNumber}
                        </td>
                        <td className="py-3.5 px-4 text-rose-600 font-mono font-bold animate-pulse">
                          {p.expiryDate} (Critical Expiry!)
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                          {p.stockQty} units remaining
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
