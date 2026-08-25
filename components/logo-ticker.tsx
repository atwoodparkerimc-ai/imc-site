"use client";

import { motion } from "framer-motion";

const COMPANIES = [
  "Strap Tank Brewery", "Nestle Food", "Tyson", "Thrive Life", 
  "Dugway Proving Ground", "Harpak Ulma", "Brown Packing", 
  "Conagra Brands", "Excel Heating and Air Conditioning Inc", 
  "Supra Naturals", "Boston Conveyor & Automation", "Unilever", "Spire Ranges",
  "Ebay", "Built Bar", "Innovative", "Aligned", "Bar-W"
];

export default function PartnerTicker() {
  return (
    <div className="w-full relative flex overflow-hidden py-3">
      {/* Seamless Edge Gradient Fades */}
      <div className="absolute left-0 top-0 bottom-0 w-32 md:w-64 bg-gradient-to-r from-[#02060d] via-[#020b1a]/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 md:w-64 bg-gradient-to-l from-[#02060d] via-[#020b1a]/80 to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex gap-12 sm:gap-16 items-center justify-center whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 65, ease: "linear", repeat: Infinity }}
      >
        {[...COMPANIES, ...COMPANIES].map((name, index) => (
          <div key={index} className="flex items-center gap-12 sm:gap-16 group">
            <span className="text-slate-400 font-sans text-xs sm:text-sm font-black uppercase tracking-[0.2em] group-hover:text-white group-hover:drop-shadow-[0_0_12px_rgba(0,136,255,0.4)] transition-all duration-300 cursor-default select-none">
              {name}
            </span>
            <span className="text-[#0088ff]/30 font-mono text-sm font-black select-none">
              //
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}