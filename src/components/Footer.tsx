/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Pill, Phone, MapPin, CheckCircle } from "lucide-react";

interface FooterProps {
  setPath: (path: string) => void;
}

export default function Footer({ setPath }: FooterProps) {
  
  const handleAnchorClick = (path: string) => {
    setPath(path);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-16 text-left" id="marketing-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Brand block Column 1 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-teal-600 rounded-xl text-white">
                <Pill className="h-5 w-5" />
              </div>
              <div>
                <span className="font-display font-bold text-lg text-white block leading-none">
                  BARAKAT
                </span>
                <span className="text-[9px] font-mono tracking-widest text-teal-400 font-bold uppercase block -mt-0.5">
                  Medical Store
                </span>
              </div>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Complete high-speed point-of-sale & double-entry accounting software built custom for Balochistan pharmacies. Runs continuously offline during electricity load-shedding cycles.
            </p>

            <span className="bg-teal-950 text-teal-400 border border-teal-800 text-[10px] font-mono font-bold px-3 py-1 rounded-md block w-max uppercase">
              DRAP Standard Compliant
            </span>
          </div>

          {/* Links Column 2 */}
          <div className="space-y-4 text-xs font-sans">
            <h4 className="font-mono font-bold text-slate-300 tracking-wider uppercase text-[11px]">
              Explore Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setPath("home")} className="hover:text-white transition cursor-pointer">
                  Landing Hub
                </button>
              </li>
              <li>
                <button onClick={() => setPath("features")} className="hover:text-white transition cursor-pointer">
                  Platform Features
                </button>
              </li>
              <li>
                <button onClick={() => setPath("offline-pos")} className="hover:text-white transition cursor-pointer">
                  Offline Cash Register
                </button>
              </li>
              <li>
                <button onClick={() => setPath("pricing")} className="hover:text-white transition cursor-pointer">
                  Pricing Tiers
                </button>
              </li>
              <li>
                <button onClick={() => setPath("faq")} className="hover:text-white transition cursor-pointer">
                  FAQ Desk
                </button>
              </li>
            </ul>
          </div>

          {/* Features Column 3 */}
          <div className="space-y-4 text-xs font-sans">
            <h4 className="font-mono font-bold text-slate-300 tracking-wider uppercase text-[11px]">
              Core Modules
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setPath("features")} className="hover:text-white transition cursor-pointer">
                  Fast Barcode POS
                </button>
              </li>
              <li>
                <button onClick={() => setPath("features")} className="hover:text-white transition cursor-pointer">
                  FIFO Batch Expiry
                </button>
              </li>
              <li>
                <button onClick={() => setPath("features")} className="hover:text-white transition cursor-pointer">
                  Supplier Credit Ledger
                </button>
              </li>
              <li>
                <button onClick={() => setPath("features")} className="hover:text-white transition cursor-pointer">
                  P&L Business Statements
                </button>
              </li>
              <li>
                <button onClick={() => setPath("features")} className="hover:text-white transition cursor-pointer">
                  Multi-Branch Inter-sync
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Column 4 */}
          <div className="space-y-4 text-xs font-sans">
            <h4 className="font-mono font-bold text-slate-300 tracking-wider uppercase text-[11px]">
              Contact & Address
            </h4>
            <ul className="space-y-3.5">
              <li className="flex items-start space-x-2 text-slate-400">
                <MapPin className="h-4.5 w-4.5 text-teal-500 shrink-0 mt-0.5" />
                <span>Opposite Civil Hospital, Jinnah Road, Quetta, Balochistan, Pakistan</span>
              </li>
              <li className="flex items-center space-x-2 text-slate-400">
                <Phone className="h-4 w-4 text-teal-400 shrink-0" />
                <span>Phone: 0333-7890123</span>
              </li>
              <li className="flex items-center space-x-1.5 text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-805">
                <CheckCircle className="h-4 w-4 text-teal-500 shrink-0" />
                <span className="text-[10px]">Quetta local helpline active 24/7.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Legal copyright check footer */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px]">
          <p>© 2026 Barakat Medical Store. All rights reserved. Technology made in Quetta.</p>
          <div className="flex space-x-6">
            <span className="hover:text-white transition cursor-help">Balochistan Drug Act Compliance</span>
            <span className="hover:text-white transition cursor-help">Privacy Security Policy</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
