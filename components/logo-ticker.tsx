"use client";

import { motion } from "framer-motion";

const PARTNERS = [
  // Faint/White Logos
  { name: "Aligned", logo: "/logos/Aligned.webp", filter: "brightness-200 grayscale", scale: "scale-110" },
  { name: "Nestle Food", logo: "/logos/Nestle Food.png", filter: "brightness-200 grayscale", scale: "scale-110" },
  { name: "Brown Packing", logo: "/logos/Brown Packing.png", filter: "brightness-200 grayscale", scale: "scale-100" },
  { name: "Supra Naturals", logo: "/logos/Supra Naturals.png", filter: "brightness-200 grayscale", scale: "scale-100" },
  { name: "Bar-W", logo: "/logos/Bar-W.avif", filter: "brightness-200 grayscale contrast-125", scale: "scale-125" },

  // Solid Black/Dark Text
  { name: "Thrive Life", logo: "/logos/Thrive_Life_LLC_idJdOF1PYM_0.png", filter: "brightness-0 invert", scale: "scale-95" },
  { name: "Spire Ranges", logo: "/logos/Spire Ranges.png", filter: "brightness-0 invert", scale: "scale-100" },
  { name: "Conagra Brands", logo: "/logos/Conagra Brands.png", filter: "brightness-0 invert", scale: "scale-110" },

  // Dark/Multi-tone Logos 
  { name: "Strap Tank Brewery", logo: "/logos/Strap Tank Brewery.png", filter: "grayscale invert brightness-150", scale: "scale-125" },
  { name: "Excel Heating and Air", logo: "/logos/Excel Heating and Air.png", filter: "grayscale invert brightness-125", scale: "scale-100" },
  { name: "Harpak Ulma", logo: "/logos/Harpak Ulma.png", filter: "grayscale invert brightness-150", scale: "scale-95" },
  { name: "Boston Conveyor", logo: "/logos/Boston Conveyor.png", filter: "grayscale invert brightness-150", scale: "scale-100" },
  { name: "Unilever", logo: "/logos/Unilever_idKa-ZG1zZ_1.png", filter: "grayscale invert brightness-150", scale: "scale-125" },
  { name: "Innovative", logo: "/logos/Innovative.webp", filter: "grayscale invert brightness-150", scale: "scale-100" },

  // Badges / Full Color
  { name: "Ebay", logo: "/logos/Ebay.png", filter: "grayscale brightness-150 contrast-125", scale: "scale-110" },
  { name: "Stouffer's", logo: "/logos/stouffers .png", filter: "grayscale brightness-150 contrast-125", scale: "scale-100" },
  { name: "Tyson", logo: "/logos/Tyson.png", filter: "grayscale brightness-150 contrast-125", scale: "scale-125" },
  { name: "Built Bar", logo: "/logos/Built Bar.png", filter: "grayscale brightness-150 contrast-125", scale: "scale-110" }
];

export default function PartnerTicker() {
  return (
    <div className="w-full relative flex flex-col items-center justify-center py-6 bg-[#02060d] select-none border-y border-white/[0.04] overflow-hidden">
      {/* Edge gradient masks */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#02060d] via-[#02060d]/90 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#02060d] via-[#02060d]/90 to-transparent z-10 pointer-events-none" />

      {/* Synchronized Tracks - Rendered 3 times to guarantee continuous loop coverage */}
      <div className="flex w-max items-center">
        {[1, 2, 3].map((trackIndex) => (
          <motion.div
            key={`track-${trackIndex}`}
            className="flex shrink-0 items-center gap-14 sm:gap-20 pr-14 sm:pr-20"
            animate={{ x: ["0%", "-100%"] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 45,
            }}
          >
            {PARTNERS.map((partner, index) => (
              <div 
                key={`logo-${trackIndex}-${index}`} 
                className="flex items-center justify-center h-12 sm:h-14 shrink-0 group"
              >
                <img 
                  src={partner.logo} 
                  alt={`${partner.name} logo`} 
                  className={`max-h-7 sm:max-h-9 w-auto max-w-[120px] sm:max-w-[150px] object-contain opacity-75 group-hover:opacity-100 transition-all duration-300 ${partner.filter} ${partner.scale || "scale-100"}`}
                />
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}