/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ChevronDown, HelpCircle, MessagesSquare } from "lucide-react";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Kya yeh software internet ke bina kaam karta hai?",
      a: "Haan ji! Yeh is software ki sab se khas baat hai. Agar Quetta mein light ya internet chali jaye, tab bhi aapka cashier non-stop sales kar sakta hai aur customer receipts print kar sakta hai. System saari entries local browser cache memory (IndexedDB) mein save rakhta hai. Internet wapis aate hi, saara data khud cloud pe backup sync ho jata hai."
    },
    {
      q: "Kya barcode scanner support karta hai?",
      a: "Bilkul! Barakat System tamam standard USB aur wireless barcode scanners ko automatic support karta hai. Jab aap dawai ka barcode scan karte hain, system khud-ba-khud dawa ko cart mein add kar deta hai jisse sales counter speed bohot tez ho jati hai."
    },
    {
      q: "Kya purani data (medicines list) Excel se import ho sakti hai?",
      a: "Haan, bilkul ho sakti hai! Agar aap pehle se kisi aur software ya Excel sheet pe apna record rakh rahe the, to hamari support team aapki poori medicines list aur stock data ko 1 ghante mein Barakat Software mein transfer kar degi."
    },
    {
      q: "Kya thermal receipt printer support hota hai?",
      a: "Haan ji, market mein milne wale tamam standard thermal receipt printers (58mm aur 80mm wide rolls) iske sath perfectly connect ho jate hain. Iske ilawa, agar aap custom flat invoices print karna chahein to computer printer se standard A4 bills bhi nikale ja sakte hain."
    },
    {
      q: "Setup lagwane mein kitna waqt lagta hai?",
      a: "Aapka account sirf 10 minutes mein live ho jata hai! Agar aap Quetta city mein hain, to hamara representative khud aapke shop pe aakar barcode machine aur printer configure kar dega aur aapke cashiers ko simple training bhi dega."
    },
    {
      q: "Kya multiple branches ko aapas mein connect kiya ja sakta hai?",
      a: "Haan bilkul! Agar aapke Quetta ya Balochistan ke mukhtalif ilaqon (e.g., Jinnah Road, Double Road, Satellite Town, ya Chaman/Loralai) mein multiple stores hain, to aap ek hi admin admin account se saari branches ki stock, cash book and profit reports monitor kar sakte hain."
    }
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const whatsappInquiryUrl = "https://wa.me/923337890123?text=Assalam-o-Alaikum%20Barakat%20Medical%20Store%2C%20I%20have%20some%2520questions%20regarding%2520your%2520Pharmacy%2520Software%2520setup.";

  return (
    <section className="bg-slate-50 py-16 sm:py-24" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <span className="text-xs font-mono font-bold tracking-widest text-teal-700 bg-teal-100/60 px-3 py-1 rounded-full uppercase">
            Local Help Desk
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Frequently Asked Questions (FAQ)
          </h2>
          <p className="text-slate-500 text-sm sm:text-base">
            Apki zabaan mein sawaal o jawaab. Agar mazeed maloomat chahiye to humse WhatsApp pe rabta karein.
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx}
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all duration-300 shadow-2xs"
                id={`faq-item-${idx}`}
              >
                {/* Header/Question click strip */}
                <button
                  onClick={() => handleToggle(idx)}
                  className="w-full text-left p-6 flex justify-between items-center space-x-4 cursor-pointer focus:outline-hidden hover:bg-slate-50/50"
                >
                  <div className="flex items-center space-x-3 text-left">
                    <HelpCircle className="h-5 w-5 text-teal-650 shrink-0" />
                    <span className="font-sans font-bold text-slate-800 text-sm sm:text-base">
                      {faq.q}
                    </span>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-slate-400 shrink-0 transform transition-transform duration-300 ${
                    isOpen ? "rotate-180 text-teal-600" : ""
                  }`} />
                </button>

                {/* Answer body */}
                {isOpen && (
                  <div className="p-6 pt-0 border-t border-slate-50 antialiased" id={`faq-ans-${idx}`}>
                    <p className="text-sm text-slate-650 leading-relaxed font-sans">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact more action block */}
        <div className="mt-12 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xs">
          <div className="p-3 bg-teal-50 text-teal-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
            <MessagesSquare className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-sans font-bold text-slate-850">
              Koi aur sawaal pochna hai?
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Hamari Balochi-Pashto and Urdu speaking support team har waqt available hai. WhatsApp ya call karein.
            </p>
          </div>
          <div>
            <a
              href={whatsappInquiryUrl}
              target="_blank"
              referrerPolicy="no-referrer"
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-3 px-6 rounded-xl transition cursor-pointer shadow-md shadow-emerald-600/10"
              id="faq-help-whatsapp"
            >
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
