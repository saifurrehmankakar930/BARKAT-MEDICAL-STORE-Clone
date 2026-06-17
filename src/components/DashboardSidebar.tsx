/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  BarChart, 
  ShoppingBag, 
  Layers, 
  BookOpen, 
  LineChart, 
  Home, 
  LogOut, 
  Pill, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  Award
} from "lucide-react";
import { User } from "../types";

interface SidebarProps {
  currentUser: User;
  activePanel: string;
  setActivePanel: (panel: string) => void;
  isOffline: boolean;
  offlineQueueCount: number;
  triggerSync: () => void;
  logout: () => void;
  returnToHome: () => void;
}

export default function DashboardSidebar({
  currentUser,
  activePanel,
  setActivePanel,
  isOffline,
  offlineQueueCount,
  triggerSync,
  logout,
  returnToHome
}: SidebarProps) {
  
  const menuItems = [
    { id: "overview", label: "Overview", icon: <BarChart className="h-5 w-5" />, roles: ["Admin", "Pharmacist", "Saleperson"] },
    { id: "pos", label: "POS Terminal", icon: <Pill className="h-5 w-5" />, roles: ["Admin", "Pharmacist", "Saleperson"] },
    { id: "inventory", label: "Inventory", icon: <Layers className="h-5 w-5" />, roles: ["Admin", "Pharmacist"] },
    { id: "purchases", label: "Purchases PO", icon: <ShoppingBag className="h-5 w-5" />, roles: ["Admin", "Pharmacist"] },
    { id: "accounts", label: "Accounts Ledg.", icon: <BookOpen className="h-5 w-5" />, roles: ["Admin"] },
    { id: "reports", label: "Reports Sheet", icon: <LineChart className="h-5 w-5" />, roles: ["Admin"] }
  ];

  // Filter based on role safety
  const visibleItems = menuItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <aside className="w-full lg:w-64 glass-sidebar lg:border-b-0 text-slate-800 flex flex-col justify-between shrink-0 font-sans" id="dashboard-sidebar">
      <div>
        
        {/* Sidebar Header Brand */}
        <div className="p-6 border-b border-white/40 flex items-center space-x-3">
          <div className="p-2 bg-teal-600 rounded-xl text-white shadow-xs">
            <Pill className="h-5 w-5" />
          </div>
          <div>
            <span className="font-display font-bold text-base text-slate-900 block uppercase tracking-wide leading-tight">
              BARAKAT ADMIN
            </span>
            <span className="text-[9px] font-mono tracking-widest text-teal-600 font-bold block uppercase -mt-0.5">
              Terminal Node
            </span>
          </div>
        </div>

        {/* Current Operator Badge */}
        <div className="p-5 bg-white/40 border-b border-white/40 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-teal-500/10 text-teal-700 font-mono text-sm font-bold flex items-center justify-center border border-teal-500/25 shrink-0 select-none">
            {currentUser.role.slice(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-sans font-semibold text-xs text-slate-800 truncate">
              {currentUser.name}
            </h4>
            <div className="flex items-center space-x-1 mt-0.5">
              <Award className="h-3 w-3 text-teal-600" />
              <span className="text-[10px] font-mono text-teal-700 uppercase font-bold tracking-wider">
                {currentUser.role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Sidebar Links */}
        <nav className="p-4 space-y-1">
          {visibleItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActivePanel(item.id)}
              className={`w-full text-left py-3 px-4 rounded-xl text-sm font-medium flex items-center space-x-3 transition cursor-pointer ${
                activePanel === item.id 
                  ? "bg-teal-600 text-white font-semibold shadow-xs" 
                  : "hover:bg-white/50 hover:text-slate-950 text-slate-600"
              }`}
              id={`side-nav-${item.id}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

      </div>

      {/* Sync Queue / Network status + Foot buttons */}
      <div className="p-4 border-t border-white/40 space-y-4">
        
        {/* Mini Network State indicator */}
        <div className="p-3 bg-white/40 rounded-xl border border-white/40 space-y-2">
          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="text-slate-500 font-bold">NODE STATUS</span>
            {isOffline ? (
              <span className="text-rose-600 font-bold flex items-center space-x-1 animate-pulse">
                <WifiOff className="h-3 w-3 inline" />
                <span>OFFLINE BUFFER</span>
              </span>
            ) : (
              <span className="text-teal-700 font-bold flex items-center space-x-1">
                <Wifi className="h-3 w-3 inline animate-pulse" />
                <span>ONLINE CLOUD</span>
              </span>
            )}
          </div>

          {/* Sync Trigger block */}
          {offlineQueueCount > 0 && (
            <button
              onClick={triggerSync}
              disabled={isOffline}
              className={`w-full py-2 rounded-lg font-mono text-[9px] font-bold uppercase tracking-wider transition ${
                isOffline 
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200" 
                  : "bg-teal-500 hover:bg-teal-400 text-slate-950 cursor-pointer flex items-center justify-center space-x-1.5 shadow-xs"
              }`}
              id="sync-trigger-sidebar"
            >
              <RefreshCw className={`h-3 w-3 shrink-0 ${!isOffline && "animate-spin"}`} />
              <span>SYNC QUEUE ({offlineQueueCount})</span>
            </button>
          )}
        </div>

        {/* Home & Sign out utility buttons */}
        <div className="grid grid-cols-2 gap-2 text-xs font-semibold font-sans">
          <button
            onClick={returnToHome}
            className="py-2.5 bg-white/60 hover:bg-white/80 rounded-xl text-center text-slate-700 hover:text-slate-950 transition cursor-pointer flex items-center justify-center space-x-1 border border-white/40 shadow-3xs"
            title="Return to Marketing Site"
            id="sidebar-home-btn"
          >
            <Home className="h-3.5 w-3.5 text-slate-600" />
            <span>Site</span>
          </button>
          <button
            onClick={logout}
            className="py-2.5 bg-rose-50/60 hover:bg-rose-100 rounded-xl text-center text-rose-700 hover:text-rose-800 transition cursor-pointer flex items-center justify-center space-x-1 border border-rose-100/50 shadow-3xs"
            id="sidebar-logout-btn"
          >
            <LogOut className="h-3.5 w-3.5 text-rose-600" />
            <span>Exit</span>
          </button>
        </div>

      </div>
    </aside>
  );
}
