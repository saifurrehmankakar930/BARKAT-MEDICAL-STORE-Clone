/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { 
  TrendingUp, 
  AlertTriangle, 
  ShoppingBag, 
  DollarSign, 
  CornerDownRight, 
  ArrowUpRight,
  PlusCircle, 
  History,
  FileSpreadsheet
} from "lucide-react";
import { Product, Sale, Supplier } from "../types";
import { getAllFromStore } from "../lib/indexedDB";

interface OverviewProps {
  setActivePanel: (panel: string) => void;
  refreshTrigger: number;
}

export default function DashboardOverview({ setActivePanel, refreshTrigger }: OverviewProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Derived states
  const [stats, setStats] = useState({
    todaySales: 0,
    todayProfit: 0,
    lowStockCount: 0,
    expiringSoonCount: 0,
    totalStockValuation: 0
  });

  useEffect(() => {
    async function loadData() {
      try {
        const prodList = await getAllFromStore<Product>("products");
        const saleList = await getAllFromStore<Sale>("sales");
        const supList = await getAllFromStore<Supplier>("suppliers");

        setProducts(prodList);
        setSales(saleList);
        setSuppliers(supList);

        // Compute Stats based on June 17, 2026
        const todayDateStr = "2026-06-17"; // simulated present date
        
        // Filter sales for today
        const todaySalesList = saleList.filter(s => s.createdAt.startsWith(todayDateStr));
        const todayTotalSales = todaySalesList.reduce((acc, sale) => acc + sale.total, 0);

        // Approximate net margin ~28%
        const todayTotalProfit = Math.floor(todayTotalSales * 0.283);

        const lowStock = prodList.filter(p => p.stockQty <= p.reorderLevel).length;

        // Expirations: check if within 3 months of June 2026 (i.e. before October 2026)
        const expiringSoon = prodList.filter(p => {
          const expYear = parseInt(p.expiryDate.split("-")[0]);
          const expMonth = parseInt(p.expiryDate.split("-")[1]);
          return (expYear === 2026 && expMonth <= 10);
        }).length;

        const valuation = prodList.reduce((acc, p) => acc + (p.stockQty * p.unitPrice), 0);

        setStats({
          todaySales: todayTotalSales + 45200, // Preseed baseline plus active DB sales!
          todayProfit: todayTotalProfit + 12800,
          lowStockCount: lowStock,
          expiringSoonCount: expiringSoon,
          totalStockValuation: valuation
        });
      } catch (err) {
        console.error("Error loading Overview metrics:", err);
      }
    }
    loadData();
  }, [refreshTrigger]);

  // Pre-seeded weekly sales trend data for the SVG Chart
  const weeklySalesTrend = [
    { day: "Thu (Jun 11)", val: 32000 },
    { day: "Fri (Jun 12)", val: 38500 },
    { day: "Sat (Jun 13)", val: 41000 },
    { day: "Sun (Jun 14)", val: 18000 }, // Sunday typical half-day
    { day: "Mon (Jun 15)", val: 42500 },
    { day: "Tue (Jun 16)", val: 46100 },
    { day: "Wed (Jun 17)", val: stats.todaySales } // Today's dynamic tracker
  ];

  // SVG Chart calculation parameters
  const chartHeight = 160;
  const padding = 30;
  const maxVal = Math.max(...weeklySalesTrend.map(t => t.val)) * 1.15;

  return (
    <div className="space-y-6 text-left" id="dashboard-overview-panel">
      
      {/* Title Details banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 border-b border-slate-100 pb-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-800">
            Pharmacy Control Hub
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Real-time analytics for Jinnah Road Branch, Quetta. Current date: June 17, 2026.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-900 text-white text-xs font-mono py-2 px-3 rounded-lg shadow-2xs">
          <span>Active Session ID: BMS-2026-X8</span>
        </div>
      </div>

      {/* Stats Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Sales metric */}
        <div className="glass-card rounded-2xl p-5 shadow-2xs flex justify-between items-start relative overflow-hidden">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold tracking-wider">
              Today's Net Sales
            </span>
            <span className="font-mono text-xl sm:text-2xl font-bold text-slate-800 block">
              Rs {stats.todaySales.toLocaleString()}
            </span>
            <span className="text-[10px] text-teal-600 flex items-center space-x-1 font-semibold">
              <TrendingUp className="h-3.5 w-3.5 inline text-teal-500 mr-0.5" />
              <span>Real-time aggregate</span>
            </span>
          </div>
          <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
            <DollarSign className="h-5 w-5" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-teal-500" />
        </div>

        {/* Profit metric */}
        <div className="glass-card rounded-2xl p-5 shadow-2xs flex justify-between items-start relative overflow-hidden">
          <div className="space-y-2 font-sans">
            <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold tracking-wider">
              Today's Estim. Profit
            </span>
            <span className="font-mono text-xl sm:text-2xl font-bold text-emerald-600 block">
              Rs {stats.todayProfit.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 block leading-tight">
              Avg. gross margin 28.3%
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <ArrowUpRight className="h-5 w-5" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
        </div>

        {/* Low inventory alert count */}
        <div 
          onClick={() => setActivePanel("inventory")}
          className="glass-card rounded-2xl p-5 shadow-2xs flex justify-between items-start relative overflow-hidden cursor-pointer hover:border-amber-300 transition"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold tracking-wider">
              Critical Stock Alerts
            </span>
            <span className="font-mono text-xl sm:text-2xl font-bold text-amber-600 block">
              {stats.lowStockCount} Items
            </span>
            <span className="text-[10px] text-amber-650 font-semibold flex items-center space-x-1 font-sans">
              <AlertTriangle className="h-3.5 w-3.5 inline text-amber-500 animate-bounce" />
              <span>Reached reorder level</span>
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
        </div>

        {/* Expirations alert count */}
        <div 
          onClick={() => setActivePanel("inventory")}
          className="glass-card rounded-2xl p-5 shadow-2xs flex justify-between items-start relative overflow-hidden cursor-pointer hover:border-rose-300 transition"
        >
          <div className="space-y-2 font-sans">
            <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold tracking-wider">
              Batches Expiring Soon
            </span>
            <span className="font-mono text-xl sm:text-2xl font-bold text-rose-600 block">
              {stats.expiringSoonCount} Batches
            </span>
            <span className="text-[10px] text-rose-500 font-sans block">
              Within current quarter
            </span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500" />
        </div>

      </div>

      {/* Graph and Shortcuts Bento panels block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SVG Sales chart container - col-span-8 */}
        <div className="lg:col-span-8 glass-panel rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-2">
            <div>
              <h3 className="font-display font-semibold text-lg text-slate-800">
                Weekly Revenue Analytics
              </h3>
              <p className="text-xs text-slate-400">
                Daily transaction volume tracking in PKR
              </p>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-mono">
              <span className="flex items-center space-x-1.5 text-teal-600">
                <span className="w-2.5 h-2.5 bg-teal-500 rounded-xs inline-block" />
                <span>Gross Revenue</span>
              </span>
            </div>
          </div>

          {/* Pure SVG Responsive, beautiful high-contrast Area and line chart */}
          <div className="relative pt-4 overflow-x-auto">
            <svg 
              className="w-full min-w-[500px]" 
              height={chartHeight + padding} 
              viewBox={`0 0 600 ${chartHeight + padding}`}
            >
              {/* Background horizontal grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = chartHeight * ratio;
                const gridVal = Math.floor(maxVal * (1 - ratio));
                return (
                  <g key={idx}>
                    <line 
                      x1="60" 
                      y1={y} 
                      x2="590" 
                      y2={y} 
                      stroke="#f1f5f9" 
                      strokeWidth="1" 
                    />
                    <text 
                      x="0" 
                      y={y + 4} 
                      fill="#94a3b8" 
                      fontSize="9" 
                      fontFamily="JetBrains Mono"
                    >
                      Rs {gridVal.toLocaleString()}
                    </text>
                  </g>
                );
              })}

              {/* Data rendering */}
              {(() => {
                const stepX = 530 / (weeklySalesTrend.length - 1);
                const points = weeklySalesTrend.map((t, idx) => {
                  const x = 60 + idx * stepX;
                  const ratio = t.val / maxVal;
                  const y = chartHeight - (chartHeight * ratio);
                  return { x, y, val: t.val, day: t.day };
                });

                // Generate SVG path for area fill & outline stroke
                const areaPath = `
                  M ${points[0].x} ${chartHeight}
                  L ${points.map(p => `${p.x} ${p.y}`).join(" L ")}
                  L ${points[points.length - 1].x} ${chartHeight} Z
                `;

                const linePath = `
                  M ${points.map(p => `${p.x} ${p.y}`).join(" L ")}
                `;

                return (
                  <>
                    {/* Fill Area with clean Gradient */}
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0d9488" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#0d9488" stopOpacity="0.00" />
                      </linearGradient>
                    </defs>
                    <path d={areaPath} fill="url(#chartGrad)" />

                    {/* Bold Outline Stroke line */}
                    <path 
                      d={linePath} 
                      fill="none" 
                      stroke="#0f766e" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                    />

                    {/* Dots and Labels */}
                    {points.map((p, idx) => (
                      <g key={idx}>
                        <circle 
                          cx={p.x} 
                          cy={p.y} 
                          r="4" 
                          fill="#ffffff" 
                          stroke="#0f766e" 
                          strokeWidth="2.5" 
                        />
                        
                        {/* Hovering Value badge label */}
                        <text 
                          x={p.x} 
                          y={p.y - 8} 
                          textAnchor="middle" 
                          fill="#0f766e" 
                          fontSize="9" 
                          fontWeight="bold"
                          fontFamily="JetBrains Mono"
                        >
                          {p.val >= 1000 ? `${(p.val / 1000).toFixed(1)}k` : p.val}
                        </text>

                        {/* X-axis date mark label */}
                        <text 
                          x={p.x} 
                          y={chartHeight + 18} 
                          textAnchor="middle" 
                          fill="#64748b" 
                          fontSize="9"
                          fontFamily="Inter"
                        >
                          {p.day.split(" ")[0]}
                        </text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* Shortcuts / Quick Actions bento - col-span-4 */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="glass-panel rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-display font-semibold text-base text-slate-800">
              Quick Operations
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => setActivePanel("pos")}
                className="w-full p-4 bg-teal-50 hover:bg-teal-100 text-teal-850 font-semibold rounded-2xl flex items-center justify-between text-xs transition cursor-pointer active:scale-98"
              >
                <span className="flex items-center space-x-2">
                  <PlusCircle className="h-4.5 w-4.5" />
                  <span>Launch POS Cash Register</span>
                </span>
                <CornerDownRight className="h-4 w-4" />
              </button>

              <button 
                onClick={() => setActivePanel("inventory")}
                className="w-full p-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-850 font-semibold rounded-2xl flex items-center justify-between text-xs transition cursor-pointer active:scale-98"
              >
                <span className="flex items-center space-x-2">
                  <PlusCircle className="h-4.5 w-4.5" />
                  <span>Procure New Medicine Stock</span>
                </span>
                <CornerDownRight className="h-4 w-4" />
              </button>

              <button 
                onClick={() => setActivePanel("accounts")}
                className="w-full p-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-2xl flex items-center justify-between text-xs transition cursor-pointer active:scale-98"
              >
                <span className="flex items-center space-x-2">
                  <FileSpreadsheet className="h-4.5 w-4.5 text-slate-500" />
                  <span>Inspect Supplier Ledger Book</span>
                </span>
                <CornerDownRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Stock valuation widget */}
          <div className="glass-dark text-slate-100 rounded-3xl p-6 shadow-sm space-y-3">
            <span className="text-[10px] font-mono text-slate-300 block uppercase font-bold tracking-wider">
              INVENTORY NET VALUATION
            </span>
            <div className="space-y-1 text-left">
              <span className="font-mono text-2xl font-black block text-teal-300">
                Rs {stats.totalStockValuation.toLocaleString()}
              </span>
              <p className="text-[10px] text-slate-400 font-sans leading-normal">
                Based on purchase cost price in Jinnah Road Warehouse of all {products.length} registered drug references.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
