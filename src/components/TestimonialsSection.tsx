/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Star, Quote, HeartHandshake } from "lucide-react";

export default function TestimonialsSection() {
  const reviews = [
    {
      name: "Saifullah Kakar",
      role: "Managing Owner",
      store: "Barakat Medical Store, Jinnah Road, Quetta",
      initials: "SK",
      rating: 5,
      comment: "Pehle hum register pe saara stock likhte the jismein ghanton lagte the. Jab se Barakat Software chalaya hai, sales control bohot asaan ho gaya hai. Ab ek click pe pata chalta hai ke aaj kitna munafa (profit) hua hai aur kaunsi dawa khatam hone wali hai. Best software in Balochistan!"
    },
    {
      name: "Dr. Abdul Malik Khan",
      role: "Medical Director",
      store: "Malik Clinic & Pharmacy, Double Road, Quetta",
      initials: "AM",
      rating: 5,
      comment: "Load-shedding hamara sab se bara masla hai Quetta mein. Lekin is software ka Offline POS kamaal hai. Jab light aur internet chali jaye, hum phir bhi counter pe sales print karte hain. Jab wifi wapis aata hai, to saari sales khud ba khud central cloud pe sync ho jati hain. Highly recommended!"
    },
    {
      name: "Kamran Achakzai",
      role: "Head Pharmacist",
      store: "Galaxy Medicine Plaza, Satellite Town, Quetta",
      initials: "KA",
      rating: 5,
      comment: "Batch expiry alerts ne hamare hazaron rupiye bacha liye hain. Pehle hume pta nahi chalta tha ke kaunsi batch expire ho gayi hai, par ab system pehle hi red warning alerts de deta hai. DRAP controlled medicines ka patient doctor record rkhna ab bohot easy hai."
    }
  ];

  return (
    <section className="bg-white py-16 sm:py-24" id="testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono font-bold tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full uppercase inline-block">
            Voice Of Our Partners
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Trusted by Real Pharmacies in Quetta
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Leading retail stores, medical centers, and bulk distributors across Balochistan trust our software to run their daily pharmacy operations seamlessly.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {reviews.map((rev) => (
            <div 
              key={rev.name}
              className="bg-slate-50/60 border border-slate-100 hover:border-teal-100 p-8 rounded-3xl relative flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:shadow-teal-900/[0.01]"
              id={`rev-${rev.initials}`}
            >
              <div className="space-y-4">
                {/* Stars and quote decorator */}
                <div className="flex justify-between items-center text-amber-500">
                  <div className="flex space-x-0.5">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-500" />
                    ))}
                  </div>
                  <Quote className="h-7 w-7 text-teal-500/20" />
                </div>

                <p className="font-sans text-sm italic text-slate-700 leading-relaxed font-medium">
                  "{rev.comment}"
                </p>
              </div>

              {/* Patient Owner Meta block */}
              <div className="mt-8 pt-6 border-t border-slate-200/50 flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-full bg-teal-650/10 text-teal-700 font-mono font-bold flex items-center justify-center border border-teal-600/20 shrink-0 select-none">
                  {rev.initials}
                </div>
                <div>
                  <h4 className="font-sans font-bold text-sm text-slate-900">
                    {rev.name}
                  </h4>
                  <p className="text-[11px] font-mono font-semibold text-teal-700">
                    {rev.role}
                  </p>
                  <p className="text-[10px] text-slate-500 font-sans mt-0.5 leading-none">
                    {rev.store}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Balochistan Pride Banner */}
        <div className="mt-16 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100/50 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4 text-left">
            <div className="p-3 bg-white rounded-2xl text-teal-650 shadow-xs shrink-0">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-sans font-bold text-slate-800 text-sm sm:text-base">
                Local On-Site Support Team in Balochistan
              </h4>
              <p className="text-[12px] text-slate-500 leading-normal max-w-xl">
                Unlike overseas software developers, our setup team resides right in Quetta. We'll personally visit your medical store, set up barcode scanners phase-wise, and train your staff in Urdu or Pashto/Balochi.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold tracking-widest text-teal-700 bg-white border border-teal-100 px-4 py-2 rounded-xl block shrink-0">
            QUETTA OUTREACH RADAR
          </span>
        </div>

      </div>
    </section>
  );
}
