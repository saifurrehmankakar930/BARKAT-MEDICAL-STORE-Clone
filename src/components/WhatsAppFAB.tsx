/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { MessageSquare, PhoneCall } from "lucide-react";

interface FABProps {
  currentPath: string;
}

export default function WhatsAppFAB({ currentPath }: FABProps) {
  
  const getDynamicMessage = () => {
    switch (currentPath) {
      case "features":
        return "Assalam-o-Alaikum, I am inquiring about the specific Pharmacy POS and FIFO Batch Expiry features of Barakat Pharma Software.";
      case "offline-pos":
        return "Assalam-o-Alaikum, I want to learn more about how your Offline POS registration caches sales during power outages in Quetta.";
      case "pricing":
        return "Assalam-o-Alaikum, I want to request a pricing quotation and remote setup assistance for my medical store.";
      case "faq":
        return "Assalam-o-Alaikum, I have some questions regarding custom Excel drug list migrations to Barakat Pharmacy system.";
      case "dashboard":
      case "dashboard/pos":
        return "Assalam-o-Alaikum, I am testing the live Barakat Pharmacy terminal database and would like to register a real shop license.";
      default:
        return "Assalam-o-Alaikum Barakat Medical Store, I want to request a free remote demo of your Pharmacy Management System.";
    }
  };

  const phoneNum = "923337890123";
  const whatsappUrl = `https://wa.me/${phoneNum}?text=${encodeURIComponent(getDynamicMessage())}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 group font-sans">
      {/* Glow rings */}
      <div className="absolute inset-0 bg-emerald-500 rounded-full blur-md opacity-40 group-hover:opacity-75 group-hover:scale-110 transition duration-300 animate-ping" />
      
      <a
        href={whatsappUrl}
        target="_blank"
        referrerPolicy="no-referrer"
        className="relative bg-emerald-600 hover:bg-emerald-500 text-white rounded-full p-4 shadow-xl hover:shadow-emerald-600/30 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center space-x-2 border border-emerald-500/20"
        id="floating-whatsapp-fab"
        title="Chat on WhatsApp"
      >
        <MessageSquare className="h-6 w-6 animate-pulse" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-550 ease-in-out text-xs font-bold uppercase tracking-wider block whitespace-nowrap leading-none pl-0 group-hover:pl-1">
          Chat With Quetta Support
        </span>
      </a>
    </div>
  );
}
