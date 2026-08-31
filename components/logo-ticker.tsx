"use client";

import { motion } from "framer-motion";

const PARTNERS = [
  { name: "Aligned", logo: "/logos/Aligned.webp" },
  { name: "Strap Tank Brewery", logo: "/logos/Strap Tank Brewery.png" },
  { name: "Nestle Food", logo: "/logos/Nestle Food.png" },
  { name: "Stouffer's", logo: "/logos/stouffers .png" },
  { name: "Tyson", logo: "/logos/Tyson.png" },
  { name: "Thrive Life", logo: "/logos/Thrive_Life_LLC_idJdOF1PYM_0.png" },
  { name: "Harpak Ulma", logo: "/logos/Harpak Ulma.png" },
  { name: "Brown Packing", logo: "/logos/Brown Packing.png" },
  { name: "Conagra Brands", logo: "/logos/Conagra Brands.png" },
  { name: "Excel Heating and Air", logo: "/logos/Excel Heating and Air.png" },
  { name: "Supra Naturals", logo: "/logos/Supra Naturals.png" },
  { name: "Boston Conveyor", logo: "/logos/Boston Conveyor.png" },
  { name: "Unilever", logo: "/logos/Unilever_idKa-ZG1zZ_1.png" },
  { name: "Spire Ranges", logo: "/logos/Spire Ranges.png" },
  { name: "Ebay", logo: "/logos/Ebay.png" },
  { name: "Built Bar", logo: "/logos/Built Bar.png" },
  { name: "Innovative", logo: "/logos/Innovative.webp" },
  { name: "Bar-W", logo: "/logos/Bar-W.avif" }
];

export default function PartnerTicker() {
  return (
    <div className="w-full relative flex overflow-hidden py-6 bg-[#02060d] select-none">
      {/* Edge gradient masks for seamless fade */}
      <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-44 bg-gradient-to-r from-[#02060d] via-[#02060d]/90 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-44 bg-gradient-to-l from-[#02060d] via-[#02060d]/90 to-transparent z-10 pointer-events-none" />

      {/* Dual Synchronized Tracks */}
      <div className="flex w-max">
        {/* Track 1 */}
        <motion.div
          className="flex shrink-0 items-center gap-4 sm:gap-6 pr-4 sm:pr-6"
          animate={{ x: ["0%", "-100%"] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 40,
          }}
        >
          {PARTNERS.map((partner, index) => (
            <div 
              key={`track1-${index}`} 
              className="flex items-center justify-center h-14 sm:h-16 px-5 py-2.5 rounded-lg bg-slate-300/40 hover:bg-slate-300/55 border border-slate-200/30 backdrop-blur-md shadow-sm transition-all duration-200 shrink-0"
            >
              <img 
                src={partner.logo} 
                alt={`${partner.name} logo`} 
                className="max-h-full w-auto max-w-[110px] sm:max-w-[130px] object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
                loading="lazy"
              />
            </div>
          ))}
        </motion.div>

        {/* Track 2 */}
        <motion.div
          className="flex shrink-0 items-center gap-4 sm:gap-6 pr-4 sm:pr-6"
          animate={{ x: ["0%", "-100%"] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 40,
          }}
        >
          {PARTNERS.map((partner, index) => (
            <div 
              key={`track2-${index}`} 
              className="flex items-center justify-center h-14 sm:h-16 px-5 py-2.5 rounded-lg bg-slate-300/40 hover:bg-slate-300/55 border border-slate-200/30 backdrop-blur-md shadow-sm transition-all duration-200 shrink-0"
            >
              <img 
                src={partner.logo} 
                alt={`${partner.name} logo`} 
                className="max-h-full w-auto max-w-[110px] sm:max-w-[130px] object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
                loading="lazy"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}