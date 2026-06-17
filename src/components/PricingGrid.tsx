/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Check, Info } from "lucide-react";

export default function PricingGrid() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");

  const plans = [
    {
      name: "Starter",
      monthlyPrice: 2000,
      users: "1 user",
      terminals: "1 POS terminal",
      limit: "Up to 1,500 sales/mo",
      features: [
        "Lightning Fast POS & Offline Mode",
        "Expiry Alerts & Stock Control",
        "Standard Receipt Print (58mm)",
        "Daily Automated Local Backups",
        "Self Setup Instruction Guide"
      ]
    },
    {
      name: "Bronze",
      monthlyPrice: 2500,
      users: "2 users",
      terminals: "1 POS terminal",
      limit: "Up to 3,000 sales/mo",
      features: [
        "All Starter features",
        "Expiry & Batch FIFO dispatch",
        "Thermal Receipt Format (80mm)",
        "6-Days Chat Support (WhatsApp)",
        "Cloud Server Synchronization"
      ]
    },
    {
      name: "Silver",
      monthlyPrice: 3000,
      isPopular: true,
      users: "3 users",
      terminals: "2 terminals",
      limit: "Up to 4,500 sales/mo",
      features: [
        "All Bronze features",
        "Full Double-Entry Accounting",
        "Supplier Ledger & Dr Bills Book",
        "Export Reports (Excel/PDF)",
        "Inter-branch medicine requests",
        "Priority 24/7 Phone Support"
      ]
    },
    {
      name: "Gold",
      monthlyPrice: 3500,
      users: "4 users",
      terminals: "2 terminals",
      limit: "Up to 6,000 sales/mo",
      features: [
        "All Silver features",
        "Direct DRAP controlled drug register",
        "Prescription Upload & Log verification",
        "Custom Patient SMS Alerts (Low cost)",
        "Multi-Branch Stock Audits",
        "Dedicated Customer Manager"
      ]
    },
    {
      name: "Diamond",
      monthlyPrice: 4000,
      users: "5 users",
      terminals: "3 terminals",
      limit: "Up to 8,000 sales/mo",
      features: [
        "All Gold features",
        "Unlimited transaction records",
        "Multi-User Role Restrictions (Cahsier/Manager)",
        "Advanced Gross-Profit margins analytics",
        "Quarterly health-check optimization",
        "Hardware integration assistance"
      ]
    },
    {
      name: "Enterprise",
      monthlyPrice: "Custom",
      users: "8+ users",
      terminals: "4+ terminals",
      limit: "Unlimited branches & sales",
      features: [
        "All Diamond features",
        "Unlimited branches in Balochistan",
        "Custom consolidated headquarters ledger",
        "Private database instance",
        "On-site deployment team in Quetta",
        "Lifetime license option available"
      ]
    }
  ];

  const getPriceText = (price: number | string) => {
    if (typeof price === "string") return price;
    
    // Apply 20% discount if annually
    const finalPrice = billingCycle === "annually" ? Math.floor(price * 0.8) : price;
    return `Rs ${finalPrice.toLocaleString()}`;
  };

  const getWhatsAppLink = (planName: string, price: number | string) => {
    const cycleText = billingCycle === "annually" ? "Annual (20% Off)" : "Monthly";
    const priceText = typeof price === "number" 
      ? `Rs ${price.toLocaleString()}/month` 
      : "Enterprise quote";
    
    const message = `Assalam-o-Alaikum Barakat Medical Store, I am writing to query about the ${planName} Plan listed on your website. (Billing Cycle: ${cycleText}, Price: ${priceText}). Please guide me regarding the setup process.`;
    return `https://wa.me/923337890123?text=${encodeURIComponent(message)}`;
  };

  return (
    <section className="bg-slate-50 py-16 sm:py-24" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header content */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono font-bold tracking-widest text-teal-700 bg-teal-100/60 px-3 py-1 rounded-full uppercase">
            Fair & Transparent Pricing
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Start Small, Scale Big
          </h2>
          <p className="text-sm sm:text-base text-slate-500">
            Choose the perfect tier that matches your daily ticket volume. Switch plans anytime with zero data loss or penalty.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-6 flex justify-center items-center">
            <div className="bg-white border border-slate-200 p-1 rounded-2xl inline-flex space-x-1 shadow-2xs">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`py-2 px-4 rounded-xl text-xs font-semibold cursor-pointer transition ${
                  billingCycle === "monthly" 
                    ? "bg-teal-600 text-white shadow-xs" 
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Monthly Plan
              </button>
              <button
                onClick={() => setBillingCycle("annually")}
                className={`py-2 px-4 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center space-x-1.5 ${
                  billingCycle === "annually" 
                    ? "bg-teal-600 text-white shadow-xs" 
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Annually Payment</span>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  SAVE 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((pl) => (
            <div
              key={pl.name}
              className={`bg-white border rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition relative ${
                pl.isPopular
                  ? "border-teal-500 shadow-xl shadow-teal-900/[0.04] scale-103 z-10"
                  : "border-slate-100 hover:border-slate-255 shadow-xs hover:shadow-md"
              }`}
            >
              {/* Most Popular Badge on the Card header */}
              {pl.isPopular && (
                <div className="absolute top-0 right-1/2 transform translate-x-1/2 -translate-y-1/2">
                  <span className="bg-teal-600 text-white font-mono text-[9px] font-bold tracking-widest px-4 py-1.5 rounded-full shadow-md uppercase">
                    MOST POPULAR TIER
                  </span>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-medium text-lg text-slate-800">
                    {pl.name}
                  </h3>
                  <div className="flex items-baseline mt-2 text-slate-900">
                    <span className="font-display font-bold text-3xl tracking-tight">
                      {getPriceText(pl.monthlyPrice)}
                    </span>
                    {typeof pl.monthlyPrice === "number" && (
                      <span className="text-xs font-medium text-slate-500 ml-1">
                        /month
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-slate-500 font-mono space-y-0.5">
                    <p className="font-semibold text-teal-800">{pl.limit}</p>
                    <p className="text-[10px]">{pl.users} • {pl.terminals}</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <ul className="space-y-3">
                    {pl.features.map((feat) => (
                      <li key={feat} className="flex items-start text-xs text-slate-600">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mr-2 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <a
                  href={getWhatsAppLink(pl.name, pl.monthlyPrice)}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className={`block w-full py-4 rounded-xl text-center font-bold text-xs tracking-wider uppercase transition cursor-pointer ${
                    pl.isPopular
                      ? "bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-600/25"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                  }`}
                >
                  Book Demo via WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Help footer */}
        <div className="text-center mt-12 text-xs text-slate-500 font-sans flex items-center justify-center space-x-1.5">
          <Info className="h-4 w-4 text-teal-600 shrink-0" />
          <span>All packages include initial remote installation assist, secure data security assurance and continuous legal DRAP updates.</span>
        </div>

      </div>
    </section>
  );
}
