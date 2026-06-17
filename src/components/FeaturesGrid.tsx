/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Zap, 
  Layers, 
  ShoppingBag, 
  BookOpen, 
  GitMerge, 
  BarChart3, 
  ShieldAlert, 
  Bell, 
  Printer,
  ChevronRight
} from "lucide-react";

export default function FeaturesGrid() {
  const features = [
    {
      id: "feat-pos",
      icon: <Zap className="h-6 w-6 text-teal-600" />,
      title: "Lightning Fast POS",
      subtitle: "Sale in Under 10 Seconds",
      badge: "Fastest in Quetta",
      desc: "Barcode scanning integrated, rapid search-by-generic or trade-name, and easy keyboard shortcuts (F12 to pay). Seamlessly accept Cash, Credit Ledger, or Digital/Split transactions."
    },
    {
      id: "feat-inventory",
      icon: <Layers className="h-6 w-6 text-emerald-600" />,
      title: "Smart Inventory Engine",
      subtitle: "Batch + Expiry Tracking",
      badge: "DRAP Standard",
      desc: "Track medicine expirations at the batch level with automatic FIFO (First-In, First-Out) dispatching, instantly prompting cashiers if a medicine is nearing expiry or critically low on stock."
    },
    {
      id: "feat-purchases",
      icon: <ShoppingBag className="h-6 w-6 text-amber-500" />,
      title: "Purchase Management",
      subtitle: "GRNs & Purchase Orders",
      badge: "Cost Accuracy",
      desc: "Automate purchase orders and Goods Received Notes (GRN). Benefit from advanced cost discrepancy detection, flagging vendors immediately if current invoice prices exceed last cost prices."
    },
    {
      id: "feat-accounts",
      icon: <BookOpen className="h-6 w-6 text-teal-700" />,
      title: "Double-Entry Accounting",
      subtitle: "Automated Credit Ledgers",
      badge: "Fully Compliant",
      desc: "Automatic recording of double-entry ledger book transactions. Maintain strict Cash Book histories, vendor payables accounts, borrower patient accounts, and current Profit & Loss (P&L) indices."
    },
    {
      id: "feat-multibranch",
      icon: <GitMerge className="h-6 w-6 text-sky-600" />,
      title: "Multi-Branch Sync",
      subtitle: "Quetta & Balochistan Network",
      badge: "Cloud Master-Grid",
      desc: "Consolidate and monitor inventories across multiple Quetta pharmacy branches. Initiate secure inter-branch stock requests, warehouse transfers, and view centralized performance statistics."
    },
    {
      id: "feat-reports",
      icon: <BarChart3 className="h-6 w-6 text-indigo-600" />,
      title: "Powerful Reports Engine",
      subtitle: "Export Excel & Print PDF",
      badge: "Deep Insights",
      desc: "Compile granular reports for drug sales, fast-moving items, and purchase variations. Easily export formatted Excel workbooks or print clean, professional PDF balance summaries."
    },
    {
      id: "feat-rx",
      icon: <ShieldAlert className="h-6 w-6 text-rose-600" />,
      title: "Rx & Controlled tracking",
      subtitle: "DRAP Regulatory Compliance",
      badge: "Mandatory Register",
      desc: "Enforce registration logs of doctor references, license IDs, and patient contact numbers for controlled substances and psychotropics (like Bromazepam/Lexotanil). Keeps your pharmacy fully compliant."
    },
    {
      id: "feat-alerts",
      icon: <Bell className="h-6 w-6 text-orange-600" />,
      title: "Smart Proactive Alerts",
      subtitle: "SMS/In-App Warnings",
      badge: "Instant Sync",
      desc: "Receive real-time mobile notifications and visual warning banners regarding expiring items, critical short-stocks, cash variance, or large bulk customer returns."
    },
    {
      id: "feat-printing",
      icon: <Printer className="h-6 w-6 text-slate-700" />,
      title: "Thermal & Custom Receipts",
      subtitle: "58mm, 80mm & Invoice Formats",
      badge: "Hardware-Agnostic",
      desc: "Send prints cleanly to any serial, USB, or networking Esc/POS thermal receipts printer. Formats optimized for 58mm / 80mm wide rolls as well as official A4 ledger bills."
    }
  ];

  return (
    <section className="bg-white py-16 sm:py-24 border-y border-slate-100" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title details */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono font-bold tracking-widest text-teal-700 uppercase bg-teal-50 px-3 py-1 rounded-full">
            Complete Pharmacy Suite
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            One Software, Complete Pharmacy Control
          </h2>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
            Engineered specifically to solve local hurdles in Balochistan: sudden power outages, multi-lane cash counters, supplier payment loops, and strict compliance with national medicine regulators.
          </p>
        </div>

        {/* Feature cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat) => (
            <div 
              key={feat.id}
              className="group bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-900/[0.02] p-6 sm:p-8 rounded-3xl transition duration-300 relative flex flex-col justify-between"
              id={feat.id}
            >
              <div className="space-y-4">
                {/* Icon Circle */}
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-white rounded-2xl shadow-xs group-hover:scale-110 transition duration-305">
                    {feat.icon}
                  </div>
                  <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-full uppercase">
                    {feat.badge}
                  </span>
                </div>

                {/* Typography hierarchy */}
                <div className="space-y-1">
                  <h3 className="font-display font-semibold text-xl text-slate-800">
                    {feat.title}
                  </h3>
                  <span className="text-xs font-semibold text-teal-700 block tracking-wide">
                    {feat.subtitle}
                  </span>
                </div>

                <p className="font-sans text-sm text-slate-600 leading-relaxed pt-2">
                  {feat.desc}
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-100/60 flex items-center justify-between text-teal-600 font-mono text-xs font-bold uppercase tracking-wider">
                <span>DRAP COMPLIANT</span>
                <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
