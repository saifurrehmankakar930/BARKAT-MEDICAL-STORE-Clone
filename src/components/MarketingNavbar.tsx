/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Pill, Shield, Wifi, WifiOff, Menu, X, Landmark } from "lucide-react";

interface NavbarProps {
  currentPath: string;
  setPath: (path: string) => void;
  isOffline: boolean;
  toggleOffline: () => void;
  isLoggedIn: boolean;
  logout: () => void;
}

export default function MarketingNavbar({
  currentPath,
  setPath,
  isOffline,
  toggleOffline,
  isLoggedIn,
  logout
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { label: "Home", path: "home" },
    { label: "Features", path: "features" },
    { label: "Offline POS", path: "offline-pos" },
    { label: "Pricing Tiers", path: "pricing" },
    { label: "FAQ Support", path: "faq" }
  ];

  const handleNav = (path: string) => {
    setPath(path);
    setMobileMenuOpen(false);
  };

  const whatsappDemoUrl = "https://wa.me/923337890123?text=Assalam-o-Alaikum%20Barakat%20Medical%20Store%2C%20I%20want%20to%20request%20a%20free%20demo%20of%20your%20Pharmacy%20Management%20Software.";

  return (
    <nav className="sticky top-0 z-50 glass-navbar shadow-xs transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Brand */}
          <div 
            onClick={() => handleNav("home")} 
            className="flex items-center space-x-2 cursor-pointer transition active:scale-95"
            id="brand-logo"
          >
            <div className="p-2 bg-teal-500 rounded-xl text-white shadow-sm shadow-teal-500/40">
              <Pill className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <span className="font-display font-bold text-xl tracking-tight text-slate-900 block leading-tight">
                BARAKAT
              </span>
              <span className="text-[10px] font-mono tracking-widest text-teal-600 font-bold uppercase block -mt-1">
                Medical Store
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                className={`font-sans text-sm font-medium transition-colors hover:text-teal-600 cursor-pointer ${
                  currentPath === link.path ? "text-teal-600 border-b-2 border-teal-600 pb-1" : "text-slate-600"
                }`}
                id={`nav-${link.path}`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Network & Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Live Network Simulator widget */}
            <button
              onClick={toggleOffline}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                isOffline
                  ? "bg-rose-50 border-rose-200 text-rose-700"
                  : "bg-teal-50 border-teal-200 text-teal-700"
              }`}
              title="Click to simulate Load-shedding / No Internet state"
              id="network-simulator-btn"
            >
              {isOffline ? (
                <>
                  <WifiOff className="h-4 w-4 text-rose-500 animate-bounce" />
                  <span>OFFLINE MODE</span>
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4 text-teal-500" />
                  <span>ONLINE SATELLITE</span>
                </>
              )}
            </button>

            {isLoggedIn ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleNav("dashboard")}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
                  id="nav-to-dash"
                >
                  Go to Panel
                </button>
                <button
                  onClick={logout}
                  className="text-rose-600 hover:text-rose-700 text-xs font-medium cursor-pointer"
                  id="nav-logout"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNav("login")}
                className="text-slate-700 hover:text-teal-600 font-sans text-sm font-medium transition cursor-pointer"
                id="nav-login-btn"
              >
                Sign In
              </button>
            )}

            <a
              href={whatsappDemoUrl}
              target="_blank"
              referrerPolicy="no-referrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl px-5 py-2.5 transition active:scale-95 shadow-md shadow-emerald-600/20 flex items-center space-x-1.5"
              id="get-demo-navbar"
            >
              <span>Get Free Demo</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleOffline}
              className={`p-1.5 rounded-lg text-xs font-mono border ${
                isOffline ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-teal-50 border-teal-200 text-teal-600"
              }`}
              id="mobile-wifi-toggle"
            >
              {isOffline ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 focus:outline-hidden"
              id="mobile-menu-trigger"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 pt-2 pb-6 space-y-3 shadow-lg" id="mobile-menu-drawer">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => handleNav(link.path)}
              className={`block w-full text-left py-2 px-3 rounded-lg text-base font-medium ${
                currentPath === link.path ? "bg-teal-50 text-teal-700 font-semibold" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-4 border-t border-slate-100 flex flex-col space-y-3">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => handleNav("dashboard")}
                  className="w-full bg-slate-900 text-white py-2.5 rounded-xl text-center font-medium"
                >
                  Manage POS Dashboard
                </button>
                <button
                  onClick={logout}
                  className="w-full text-center text-rose-600 font-medium py-1"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNav("login")}
                className="w-full bg-slate-100 text-slate-800 py-2.5 rounded-xl font-medium"
              >
                Sign In
              </button>
            )}
            <a
              href={whatsappDemoUrl}
              target="_blank"
              referrerPolicy="no-referrer"
              className="w-full bg-emerald-600 text-white text-center py-2.5 rounded-xl font-medium shadow-sm flex items-center justify-center space-x-1.5"
            >
              <span>Get Free Demo (WhatsApp)</span>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
