/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw, AlertTriangle, X, Check, Landmark, Pill, Star, Quote } from "lucide-react";

// Marketing subcomponents
import MarketingNavbar from "./components/MarketingNavbar";
import MarketingHero from "./components/MarketingHero";
import FeaturesGrid from "./components/FeaturesGrid";
import OfflineSection from "./components/OfflineSection";
import PricingGrid from "./components/PricingGrid";
import TestimonialsSection from "./components/TestimonialsSection";
import FaqSection from "./components/FaqSection";
import LoginPage from "./components/LoginPage";
import Footer from "./components/Footer";
import WhatsAppFAB from "./components/WhatsAppFAB";

// Dashboard subpanels
import DashboardSidebar from "./components/DashboardSidebar";
import DashboardOverview from "./components/DashboardOverview";
import POSPanel from "./components/POSPanel";
import InventoryPanel from "./components/InventoryPanel";
import PurchasesPanel from "./components/PurchasesPanel";
import AccountsPanel from "./components/AccountsPanel";
import ReportsPanel from "./components/ReportsPanel";

import { User, Sale } from "./types";
import { initDB, getAllFromStore, syncOfflineSalesToServer } from "./lib/indexedDB";

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>("home");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Simulated connection parameters
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(0);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string>("");

  // Dashboard active panel selector
  const [dashboardPanel, setDashboardPanel] = useState<string>("overview");

  // Initialize offline database and count pending transactions
  useEffect(() => {
    async function setupAndCheck() {
      try {
        await initDB();
        await updateQueueCount();
      } catch (err) {
        console.error("Failed to initialize system IndexedDB database:", err);
      }
    }
    setupAndCheck();
  }, [refreshTrigger]);

  async function updateQueueCount() {
    try {
      const sales = await getAllFromStore<Sale>("sales");
      const unsyncedCount = sales.filter(s => !s.synced).length;
      setOfflineQueueCount(unsyncedCount);
    } catch (e) {
      console.error("Queue counter fault:", e);
    }
  }

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const toggleOffline = () => {
    const nextState = !isOffline;
    setIsOffline(nextState);

    // If we reconnect automatically evaluate syncer
    if (!nextState && offlineQueueCount > 0) {
      handleSyncAction();
    }
  };

  const handleSyncAction = async () => {
    if (isOffline) {
      alert("Cannot synchronize with network client in offline state.");
      return;
    }
    setSyncStatusMsg("Uploading catalog logs to server...");
    try {
      const syncedCount = await syncOfflineSalesToServer();
      setSyncStatusMsg(`Successfully uploaded ${syncedCount} offline sales to master server.`);
      setTimeout(() => setSyncStatusMsg(""), 4000);
      triggerRefresh();
    } catch (err) {
      console.error("Cloud syncing error:", err);
      setSyncStatusMsg("Sync connection timed out. Retrying in background...");
      setTimeout(() => setSyncStatusMsg(""), 4000);
    }
  };

  const loginUser = (user: User) => {
    setCurrentUser(user);
    // Standard default panels per role authorization
    if (user.role === "Saleperson") {
      setDashboardPanel("pos");
    } else {
      setDashboardPanel("overview");
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setCurrentPath("home");
  };

  const returnToHome = () => {
    setCurrentPath("home");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7fa] font-sans text-slate-800 antialiased selection:bg-teal-500 selection:text-white relative overflow-hidden">
      
      {/* Background Mesh Orbs */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-emerald-100 rounded-full blur-[100px] opacity-60 pointer-events-none z-0"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-blue-100 rounded-full blur-[120px] opacity-60 pointer-events-none z-0"></div>
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[600px] h-[400px] bg-indigo-50 rounded-full blur-[150px] opacity-40 pointer-events-none z-0"></div>

      {/* Dynamic Sync state alert ribbon */}
      {syncStatusMsg && (
        <div className="bg-teal-600 text-white p-3 text-xs font-mono font-bold uppercase tracking-wider text-center flex items-center justify-center space-x-2 animate-bounce z-50">
          <RefreshCw className="h-4 w-4 animate-spin shrink-0" />
          <span>{syncStatusMsg}</span>
        </div>
      )}

      {/* RENDER ACTIVE SCREEN SECTION OR DASHBOARD WORKSPACE */}
      {currentUser && currentPath.startsWith("dashboard") ? (
        
        /* THE FULLY SEGREGATED INTERACTIVE BUSINESS DASHBOARD */
        <div className="flex-1 flex flex-col lg:flex-row" id="app-workspace-container">
          
          <DashboardSidebar
            currentUser={currentUser}
            activePanel={dashboardPanel}
            setActivePanel={setDashboardPanel}
            isOffline={isOffline}
            offlineQueueCount={offlineQueueCount}
            triggerSync={handleSyncAction}
            logout={logoutUser}
            returnToHome={returnToHome}
          />

          {/* Core Panel Content body */}
          <main className="flex-1 p-6 sm:p-10 bg-transparent relative overflow-y-auto min-h-screen z-10">
            
            {/* Simulated Load-Shedding alert warning state banner */}
            {isOffline && (
              <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs font-mono flex items-start space-x-3 text-left">
                <AlertTriangle className="h-5 w-5 text-rose-500 animate-ping mt-0.5 shrink-0" />
                <div className="flex-1">
                  <span className="font-extrabold block text-rose-950 uppercase">OFFLINE REGISTRATION LOCK ENABLED</span>
                  <span>Jinnah Road node disconnected from fiber server. Receipts will print normally, inventory deducts are stored in offline memory slots. Click Satellite tracker in side panel to sync once power resumes.</span>
                </div>
              </div>
            )}

            {dashboardPanel === "overview" && (
              <DashboardOverview 
                setActivePanel={setDashboardPanel} 
                refreshTrigger={refreshTrigger} 
              />
            )}

            {dashboardPanel === "pos" && (
              <POSPanel 
                isOffline={isOffline} 
                onSaleCompleted={triggerRefresh} 
              />
            )}

            {dashboardPanel === "inventory" && (
              <InventoryPanel 
                refreshTrigger={refreshTrigger} 
                triggerRefresh={triggerRefresh} 
              />
            )}

            {dashboardPanel === "purchases" && (
              <PurchasesPanel 
                refreshTrigger={refreshTrigger} 
                triggerRefresh={triggerRefresh} 
              />
            )}

            {dashboardPanel === "accounts" && (
              <AccountsPanel 
                refreshTrigger={refreshTrigger} 
                triggerRefresh={triggerRefresh} 
              />
            )}

            {dashboardPanel === "reports" && (
              <ReportsPanel />
            )}

          </main>
        </div>

      ) : (
        
        /* STANDARD MARKETING + AUTH LANDING WEBSITE */
        <div className="flex-1 flex flex-col justify-between">
          
          <MarketingNavbar
            currentPath={currentPath}
            setPath={setCurrentPath}
            isOffline={isOffline}
            toggleOffline={toggleOffline}
            isLoggedIn={currentUser !== null}
            logout={logoutUser}
          />

          {/* Subpage router wrappers */}
          <main className="flex-grow">
            {currentPath === "home" && (
              <>
                <MarketingHero setPath={setCurrentPath} />
                
                {/* Trust strip */}
                <div className="bg-slate-50 border-y border-slate-100 py-10" id="trust-strip-sector">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block font-bold">
                      Trusted by pharmacies across Quetta and Balochistan
                    </span>
                    <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-12 md:gap-16 text-slate-600 font-display font-medium text-xs sm:text-sm">
                      <div className="flex items-center space-x-1.5 opacity-70">
                        <span className="font-extrabold text-teal-700 tracking-tight">●</span>
                        <span>Hospital Private Pharmacies</span>
                      </div>
                      <div className="flex items-center space-x-1.5 opacity-70">
                        <span className="font-extrabold text-teal-700 tracking-tight">●</span>
                        <span>Retail Medical Stores</span>
                      </div>
                      <div className="flex items-center space-x-1.5 opacity-70">
                        <span className="font-extrabold text-teal-700 tracking-tight">●</span>
                        <span>Cosmetic & Pharmacy Stores</span>
                      </div>
                      <div className="flex items-center space-x-1.5 opacity-70">
                        <span className="font-extrabold text-teal-700 tracking-tight">●</span>
                        <span>Multi-Branch Pharmacy Chains</span>
                      </div>
                    </div>
                  </div>
                </div>

                <FeaturesGrid />
                <OfflineSection isOffline={isOffline} toggleOffline={toggleOffline} />
                <PricingGrid />
                <TestimonialsSection />
                <FaqSection />
              </>
            )}

            {currentPath === "features" && <FeaturesGrid />}
            {currentPath === "offline-pos" && <OfflineSection isOffline={isOffline} toggleOffline={toggleOffline} />}
            {currentPath === "pricing" && <PricingGrid />}
            {currentPath === "faq" && <FaqSection />}

            {currentPath === "login" && (
              <LoginPage login={loginUser} setPath={setCurrentPath} />
            )}
          </main>

          {/* Marketing Footer */}
          {currentPath !== "login" && <Footer setPath={setCurrentPath} />}
        </div>
      )}

      {/* Floating Action WhatsApp support widgets */}
      <WhatsAppFAB currentPath={currentPath} />

    </div>
  );
}
