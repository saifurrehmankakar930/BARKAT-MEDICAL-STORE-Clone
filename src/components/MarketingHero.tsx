/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, TrendingUp, AlertTriangle, FileText, CheckCircle, Smartphone, ArrowRight, CornerDownRight } from "lucide-react";

interface HeroProps {
  setPath: (path: string) => void;
}

export default function MarketingHero({ setPath }: HeroProps) {
  // We can add minor interactive play to the hero: user can click 'Add Demo Sale' to see stats tick up
  const [salesVal, setSalesVal] = useState(45200);
  const [profitVal, setProfitVal] = useState(12800);
  const [progress, setProgress] = useState(72);
  const [clickCount, setClickCount] = useState(0);

  const simulateDemoSale = () => {
    setSalesVal(prev => prev + 1250);
    setProfitVal(prev => prev + 340);
    setProgress(prev => Math.min(100, prev + 1));
    setClickCount(prev => prev + 1);
  };

  const whatsappDemoUrl = "https://wa.me/923337890123?text=Assalam-o-Alaikum%20Barakat%20Medical%20Store%2C%20I%20want%20to%20request%20a%20free%20demo%20of%20your%20Pharmacy%20Management%20System.";

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-teal-50/40 via-white to-slate-50/50 py-16 sm:py-24" id="hero-section">
      {/* Decorative colored ambient blobs */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content block */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center space-x-2 bg-teal-100/60 border border-teal-200 text-teal-800 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium shadow-2xs">
              <Sparkles className="h-4 w-4 text-teal-600 animate-spin" />
              <span>Quetta, Balochistan's Trusted Pharmacy Software</span>
            </div>

            {/* Headline */}
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-tight">
              Run Your Pharmacy <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-emerald-600 drop-shadow-xs">
                Smarter & Faster
              </span>
            </h1>

            {/* Subheading */}
            <p className="font-sans text-lg text-slate-600 max-w-2xl leading-relaxed">
              Complete POS, automated inventory, purchases ledger, double-entry accounts & multi-branch reporting in one high-speed system. 
              <strong className="text-teal-700"> Works even when your internet doesn't.</strong>
            </p>

            {/* CTA action buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <a
                href={whatsappDemoUrl}
                target="_blank"
                referrerPolicy="no-referrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-center px-8 py-4 rounded-2xl shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2"
                id="hero-demo-whatsapp-cta"
              >
                <span>Get Free Demo</span>
                <ArrowRight className="h-5 w-5" />
              </a>
              <button
                onClick={() => setPath("features")}
                className="bg-white border border-slate-200 text-slate-700 hover:text-teal-700 hover:border-teal-350 font-semibold px-8 py-4 rounded-2xl shadow-xs transition hover:bg-slate-50 text-center cursor-pointer"
                id="hero-features-cta"
              >
                See Features
              </button>
            </div>

            {/* Local Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-10 border-t border-slate-200/85">
              <div id="stat1">
                <span className="block font-display font-extrabold text-2xl sm:text-3xl text-slate-800">
                  10,000+
                </span>
                <span className="block text-xs font-mono text-slate-500 uppercase tracking-widest mt-1">
                  Daily Sales Met
                </span>
              </div>
              <div id="stat2">
                <span className="block font-display font-extrabold text-2xl sm:text-3xl text-slate-800">
                  99.9%
                </span>
                <span className="block text-xs font-mono text-slate-500 uppercase tracking-widest mt-1">
                  Uptime Guarantee
                </span>
              </div>
              <div className="col-span-2 md:col-span-1" id="stat3">
                <span className="block font-display font-extrabold text-2xl sm:text-3xl text-teal-700">
                  Rs 0
                </span>
                <span className="block text-xs font-mono text-slate-500 uppercase tracking-widest mt-1">
                  Setup Charges!
                </span>
              </div>
            </div>
          </div>

          {/* Right Floating Preview Card block */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            {/* Background design accents */}
            <div className="absolute inset-0 bg-teal-500/10 rounded-3xl transform rotate-3 scale-95" />
            
            {/* The main preview card */}
            <div className="relative glass-panel rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 text-slate-800" id="hero-dashboard-preview">
              {/* Header */}
              <div className="flex justify-between items-center border-b border-white/40 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3.5 h-3.5 bg-rose-500 rounded-full" />
                  <div className="w-3.5 h-3.5 bg-amber-500 rounded-full" />
                  <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full" />
                  <span className="text-[11px] font-mono text-slate-500 tracking-wider uppercase ml-1">
                    Live Demo Terminal
                  </span>
                </div>
                <span className="bg-teal-100/80 text-teal-800 font-mono text-[10px] px-2 py-0.5 rounded-full border border-teal-200/50">
                  Active Server Sync
                </span>
              </div>

              {/* Stats Grid inside the card */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl p-4 shadow-3xs">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">
                    Today's Sales
                  </span>
                  <span className="font-mono text-xl sm:text-2xl font-extrabold text-teal-800 block mt-1">
                    Rs {salesVal.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-teal-600 flex items-center space-x-1 mt-1">
                    <TrendingUp className="h-3 w-3 inline" />
                    <span>Live (+12% vs yesterday)</span>
                  </span>
                </div>
                <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl p-4 shadow-3xs">
                  <span className="text-[10px] font-mono text-slate-505 block uppercase">
                    Today's Net Profit
                  </span>
                  <span className="font-mono text-xl sm:text-2xl font-extrabold text-emerald-850 block mt-1">
                    Rs {profitVal.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-1">
                    Margin: ~28.3%
                  </span>
                </div>
              </div>

              {/* Progress target */}
              <div className="space-y-1 bg-white/60 backdrop-blur-md p-3 rounded-xl border border-white/50 shadow-3xs">
                <div className="flex justify-between text-xs font-mono text-slate-600">
                  <span>Daily Sales Target Achieved</span>
                  <span className="text-teal-700 font-semibold">{progress}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full transition-all duration-550" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>

              {/* Stock status badges */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-slate-500 block uppercase">
                  Alerts & Medication Status
                </span>
                <div className="flex flex-wrap gap-2 text-slate-800">
                  <span className="bg-emerald-50/80 backdrop-blur-xs text-emerald-800 border border-emerald-100 text-[10px] sm:text-xs font-mono px-2.5 py-1 rounded-lg">
                    Panadol 500mg (In Stock)
                  </span>
                  <span className="bg-rose-50/80 backdrop-blur-xs text-rose-800 border border-rose-100 text-[10px] sm:text-xs font-mono px-2.5 py-1 rounded-lg flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                    <span>Augmentin 625mg (Low Stock)</span>
                  </span>
                  <span className="bg-amber-50/80 backdrop-blur-xs text-amber-800 border border-amber-100 text-[10px] sm:text-xs font-mono px-2.5 py-1 rounded-lg">
                    Brufen 400mg (18 left)
                  </span>
                </div>
              </div>

              {/* Floating mini-cards */}
              <div className="flex justify-between items-center text-xs border-t border-white/40 pt-4 text-slate-500 font-mono">
                <div className="flex items-center space-x-1.5 text-amber-600" id="expiry-alert">
                  <AlertTriangle className="h-4 w-4" />
                  <span>12 Batches Expiring Soon</span>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-600" id="grn-alert">
                  <FileText className="h-4 w-4 text-teal-600" />
                  <span>3 Goods Receipts Today</span>
                </div>
              </div>

              {/* Action Simulation Trigger */}
              <button
                onClick={simulateDemoSale}
                className="w-full py-3 bg-teal-600 hover:bg-teal-500 active:scale-98 text-white text-xs font-mono font-bold tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center space-x-2 shadow-md shadow-teal-600/20"
                id="hero-interactive-sale-btn"
              >
                <span>[CLICK TO TEST] SIMULATE REAL POS SALE (+Rs 1,250)</span>
                {clickCount > 0 && (
                  <span className="bg-slate-900 text-teal-400 text-[9px] px-2 py-0.5 rounded-full font-bold">
                    {clickCount} Made
                  </span>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
