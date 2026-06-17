/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Pill, Shield, KeyRound, AlertCircle, Info, Keyboard } from "lucide-react";
import { User, UserRole } from "../types";

interface LoginProps {
  login: (user: User) => void;
  setPath: (path: string) => void;
}

export default function LoginPage({ login, setPath }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const normUser = username.trim().toLowerCase();
    const normPass = password.trim();

    if (!normUser || !normPass) {
      setErrorMsg("Please enter both username and password.");
      return;
    }

    let role: UserRole | null = null;
    let name = "";

    if (normUser === "admin") {
      role = "Admin";
      name = "Saifullah Kakar (Administrator)";
    } else if (normUser === "pharmacist") {
      role = "Pharmacist";
      name = "Kamran Achakzai (Reg. RPh)";
    } else if (normUser === "salesperson" || normUser === "sale") {
      role = "Saleperson";
      name = "Babar Kakar (Sales Counter 1)";
    }

    if (role) {
      const authenticatedUser: User = {
        id: `USR-${role.slice(0, 3).toUpperCase()}`,
        name: name,
        role: role,
        branchId: "B1" // Default Branch
      };
      login(authenticatedUser);
      setPath("dashboard");
    } else {
      setErrorMsg("Incorrect username or password. Please use one of the quick demo roles below.");
    }
  };

  const autofillDemo = (user: string) => {
    setUsername(user);
    setPassword(user);
    setErrorMsg("");
  };

  return (
    <div className="bg-slate-50 py-16 sm:py-24" id="login-container">
      <div className="max-w-md mx-auto px-4">
        
        {/* Main login card container */}
        <div className="bg-white border border-slate-250/60 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-900/[0.03] space-y-6">
          
          {/* Logo brand */}
          <div className="text-center space-y-2">
            <div className="p-3 bg-teal-500 rounded-2xl text-white inline-block shadow-md">
              <Pill className="h-7 w-7 animate-pulse" />
            </div>
            <div>
              <h2 className="font-display font-bold text-2xl text-slate-900 tracking-tight leading-tight">
                BARAKAT MEDICAL STORE
              </h2>
              <span className="text-[10px] font-mono tracking-widest text-teal-600 font-bold uppercase block">
                Pharmacy Terminal Login
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {/* Error messaging bar */}
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-250 text-rose-800 p-3 rounded-xl flex items-start space-x-2 text-xs font-medium">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-slate-500 block uppercase" htmlFor="username-input">
                Operator Username
              </label>
              <input
                id="username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white text-sm px-4 py-3 rounded-xl focus:outline-hidden transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-slate-500 block uppercase" htmlFor="password-input">
                Secure Password
              </label>
              <input
                id="password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white text-sm px-4 py-3 rounded-xl focus:outline-hidden transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-teal-700 hover:bg-teal-650 text-white font-semibold text-sm rounded-xl transition cursor-pointer active:scale-98 shadow-md shadow-teal-700/10 flex items-center justify-center space-x-2"
              id="submit-login-btn"
            >
              <KeyRound className="h-4 w-4" />
              <span>Unlock Pharmacy Dashboard</span>
            </button>
          </form>

          {/* Demo operators helper buttons */}
          <div className="border-t border-slate-100 pt-6 space-y-3">
            <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-wide flex items-center">
              <Keyboard className="h-3.5 w-3.5 mr-1" />
              <span>Quick Click Demo Roles</span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => autofillDemo("admin")}
                className="bg-teal-50 hover:bg-teal-100/75 border border-teal-200/50 text-teal-800 text-[11px] font-bold py-2 px-2.5 rounded-lg text-center cursor-pointer transition active:scale-95"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => autofillDemo("pharmacist")}
                className="bg-emerald-50 hover:bg-emerald-100/75 border border-emerald-200/50 text-emerald-800 text-[11px] font-bold py-2 px-2.5 rounded-lg text-center cursor-pointer transition active:scale-95"
              >
                Pharmacist
              </button>
              <button
                type="button"
                onClick={() => autofillDemo("salesperson")}
                className="bg-indigo-50 hover:bg-indigo-100/75 border border-indigo-200/50 text-indigo-800 text-[11px] font-bold py-2 px-2.5 rounded-lg text-center cursor-pointer transition active:scale-95"
              >
                Cashier
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-[10px] text-slate-500 leading-normal flex items-start space-x-1.5 font-sans">
            <Info className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
            <span>Pre-seeded roles have realistic permissions configured. Admin has full reports whereas Cashier has lightning-first POS locks.</span>
          </div>

        </div>
      </div>
    </div>
  );
}
