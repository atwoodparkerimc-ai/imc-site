"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import Footer from "@/components/footer";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  ShieldAlert, 
  HardHat, 
  Activity, 
  FileText, 
  Cpu, 
  Wrench, 
  Truck, 
  CheckSquare,
  Microscope,
  Factory,
  Droplets,
  ShieldCheck,
  Crosshair,
  Monitor,
  Settings2
} from 'lucide-react';

// Bring back the heavy 3D CAD design for the hero visual
const AhuBlueprintAnimation = dynamic(
  () => import("../../components/ahu-blueprint-animation"),
  { 
    ssr: false, 
    loading: () => (
      <div className="h-full w-full animate-pulse flex items-center justify-center">
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Initializing CAD Engine...</span>
      </div>
    ) 
  }
);

const CERTIFICATIONS = [
  "ASME Certified",
  "ISNetworld Member",
  "OSHA VPP Star Site",
  "AWS D1.1 Compliant",
  "National Board \"R\" Stamp",
  "EPA Certified",
  "MSHA Compliant",
  "OSHA 511 Certified",
  "Class A Mechanical Contractor"
];

export default function Home() {
  // Obfuscated contact variables to prevent automated spam bot scraping
  const phoneDisplay = ["(801)", "360-5735"].join(" ");
  const phoneHref = ["tel:8013605735"].join("");

  return (
    <main className="w-full relative overflow-x-hidden bg-[#0b0f19] text-slate-100 font-sans selection:bg-[#0088ff] selection:text-white">

      {/* ========================================= */}
      {/* 1. HERO: FULL-BLEED 3D & RIGHT-ALIGNED TYPOGRAPHY */}
      {/* ========================================= */}
      <section className="relative w-full min-h-[calc(100vh-5rem)] flex items-center bg-[#0b0f19] border-b border-slate-800/80 overflow-hidden py-10 sm:py-16 lg:py-0">

        {/* Unified Background Grid */}
        <div className="absolute inset-0 z-0 tactical-graph-paper opacity-30"></div>

        {/* Telemetry overlay - Left aligned using company red (hidden on mobile) */}
        <div className="hidden lg:flex absolute bottom-8 left-8 items-center gap-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest z-30">
          <span className="w-1.5 h-1.5 bg-[#ea1f27] rounded-none animate-pulse" />
          Class A Mechanical Contractor
        </div>

        {/* DESKTOP ONLY 3D POSITIONING (Left 60% of screen) */}
        <div className="hidden lg:flex absolute inset-0 z-10 w-[60%] h-full items-center justify-center pointer-events-none">
          <div className="w-full h-full pointer-events-auto">
            <AhuBlueprintAnimation />
          </div>
        </div>

        {/* MOBILE ONLY 3D WATERMARK BACKDROP */}
        <div className="block lg:hidden absolute top-2 left-1/2 -translate-x-1/2 w-[125%] h-[80vh] min-h-[500px] max-h-[660px] z-10 pointer-events-none overflow-hidden opacity-45">
          <div className="w-full h-full relative">
            <AhuBlueprintAnimation />
            {/* Subtle radial shadow to protect typography contrast */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,#0b0f19_80%)]" />
          </div>
        </div>

        {/* CONTENT WRAPPER */}
        <div className="relative z-20 w-full h-full max-w-[1800px] mx-auto px-6 sm:px-12 lg:px-16 flex justify-end items-center pointer-events-none">

          <div className="w-full lg:w-[45%] xl:w-[35%] pointer-events-auto flex flex-col pt-4 sm:pt-10 lg:pt-0">
            
            {/* 1. TITLE & BADGE */}
            <div className="mb-6 sm:mb-10 lg:mb-6">
              <div className="hidden lg:inline-flex items-center gap-2 px-3 py-1 bg-[#ea1f27]/10 border border-[#ea1f27]/30 text-[#ea1f27] font-mono text-[10px] font-bold tracking-[0.2em] uppercase rounded-xs mb-6 lg:mb-8">
                Interwest Mechanical Contractors
              </div>

              <h1 className="text-[clamp(2.4rem,7.5vw,4.5rem)] font-black tracking-tighter uppercase leading-[0.95] text-white drop-shadow-md">
                The <span className="inline-block bg-gradient-to-r from-[#ea1f27] from-0% via-[#ea1f27] via-[28%] to-[#64748b]/80 to-[80%] bg-clip-text text-transparent">NERVOUS</span> <br />
                <span className="inline-block bg-gradient-to-r from-[#64748b]/80 from-[20%] to-[#0088ff] to-[72%] to-[#0088ff] to-100% bg-clip-text text-transparent">SYSTEM</span> <br />
                Of Heavy Industry.
              </h1>
            </div>

            {/* 2. PARAGRAPH TEXT */}
            <p className="text-sm sm:text-lg lg:text-xl text-slate-200 font-normal leading-relaxed mb-8 sm:mb-12 lg:mb-10 max-w-xl drop-shadow-sm">
             We build the infrastructure that keeps the world running. From massive commercial air handling systems and high-purity process piping to complete production line conveyers and fillers. our crews execute the complex mechanical scopes heavy manufacturing depends on.
            </p>

            {/* 3. SIDE-BY-SIDE BUTTONS (Desktop inline flow) */}
            <div className="hidden lg:flex flex-row items-center gap-4 w-full pt-1">
              <Link 
                href="/contact" 
                className="w-auto px-8 py-4 bg-[#0b0f19]/80 hover:bg-white hover:text-[#0b0f19] text-white backdrop-blur-md border border-slate-600 hover:border-white font-mono text-xs font-bold uppercase tracking-widest rounded-xs transition-all text-center whitespace-nowrap shadow-sm active:scale-[0.98]"
              >
                Initiate Bid
              </Link>
              <Link 
                href="/what-we-do" 
                className="w-auto px-8 py-4 bg-[#0b0f19]/80 hover:bg-[#ea1f27]/10 text-slate-200 hover:text-[#ea1f27] backdrop-blur-md border border-slate-700 hover:border-[#ea1f27] font-mono text-xs font-bold uppercase tracking-widest rounded-xs transition-all text-center whitespace-nowrap shadow-sm active:scale-[0.98]"
              >
                Capabilities
              </Link>
            </div>

          </div>
        </div>

        {/* MOBILE ONLY: Buttons Pinned to Section Bottom */}
        <div className="block lg:hidden absolute bottom-4 left-6 right-6 z-30 pointer-events-auto">
          <div className="flex flex-row items-center gap-3 w-full">
            <Link 
              href="/contact" 
              className="flex-1 px-4 py-3.5 bg-[#0b0f19]/80 hover:bg-white hover:text-[#0b0f19] text-white backdrop-blur-md border border-slate-600 hover:border-white font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-xs transition-all text-center whitespace-nowrap shadow-sm active:scale-[0.98]"
            >
              Initiate Bid
            </Link>
            <Link 
              href="/what-we-do" 
              className="flex-1 px-4 py-3.5 bg-[#0b0f19]/80 hover:bg-[#ea1f27]/10 text-slate-200 hover:text-[#ea1f27] backdrop-blur-md border border-slate-700 hover:border-[#ea1f27] font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-xs transition-all text-center whitespace-nowrap shadow-sm active:scale-[0.98]"
            >
              Capabilities
            </Link>
          </div>
        </div>

      </section>

      {/* ========================================= */}
      {/* 2. INDUSTRIAL CERTIFICATIONS TICKER (GAPLESS DUAL-TRACK) */}
      {/* ========================================= */}
      <div className="border-b border-slate-800/80 bg-[#030914] py-3.5 sm:py-4 relative z-20 overflow-hidden shadow-inner flex select-none">
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient id="shieldBrandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ea1f27" />
              <stop offset="50%" stopColor="#64748b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0088ff" />
            </linearGradient>
          </defs>
        </svg>

        {/* Left/Right Edge Fade Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-[#030914] via-[#030914]/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-[#030914] via-[#030914]/80 to-transparent z-10 pointer-events-none" />

        {/* Dual Synchronized Tracks */}
        <div className="flex w-max">
          <motion.div
            className="flex shrink-0 items-center gap-8 sm:gap-12 font-mono text-[9px] sm:text-[10px] font-bold text-slate-300 tracking-[0.2em] uppercase pr-8 sm:pr-12"
            animate={{ x: "-100%" }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 30,
            }}
          >
            {CERTIFICATIONS.map((cert, index) => (
              <span key={`track1-${index}`} className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                <ShieldCheck 
                  className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" 
                  strokeWidth={2}
                  style={{ stroke: "url(#shieldBrandGradient)" }} 
                />
                {cert}
              </span>
            ))}
          </motion.div>

          <motion.div
            className="flex shrink-0 items-center gap-8 sm:gap-12 font-mono text-[9px] sm:text-[10px] font-bold text-slate-300 tracking-[0.2em] uppercase pr-8 sm:pr-12"
            animate={{ x: "-100%" }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 30,
            }}
          >
            {CERTIFICATIONS.map((cert, index) => (
              <span key={`track2-${index}`} className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                <ShieldCheck 
                  className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" 
                  strokeWidth={2}
                  style={{ stroke: "url(#shieldBrandGradient)" }} 
                />
                {cert}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ========================================= */}
      {/* 3. THE MANIFESTO / STATS STRIP            */}
      {/* ========================================= */}
      <section className="bg-[#030914] py-12 sm:py-16 lg:py-20 border-b border-slate-800/80 relative z-20 shadow-inner">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-800/80">

            {/* Metric 01 */}
            <div className="pt-4 sm:pt-0 sm:px-8 flex flex-col justify-center items-center text-center lg:items-start lg:text-left group">
              <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter mb-1 font-mono">
                30<span className="text-[#ea1f27] font-bold">+</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono text-slate-300 font-bold uppercase tracking-widest">
                Years Active
              </span>
            </div>

            {/* Metric 02 */}
            <div className="pt-4 sm:pt-0 sm:px-8 flex flex-col justify-center items-center text-center lg:items-start lg:text-left group">
              <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter mb-1 font-mono">
                450<span className="text-[#a54a5a] font-bold">+</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono text-slate-300 font-bold uppercase tracking-widest">
                Jobs Sites
              </span>
            </div>

            {/* Metric 03 */}
            <div className="pt-4 sm:pt-0 sm:px-8 flex flex-col justify-center items-center text-center lg:items-start lg:text-left group">
              <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter mb-1 font-mono">
                14K<span className="text-[#64748b] font-bold">+</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono text-slate-300 font-bold uppercase tracking-widest">
                Sq Ft Fabrication Shop
              </span>
            </div>

            {/* Metric 04 */}
            <div className="pt-4 sm:pt-0 sm:px-8 flex flex-col justify-center items-center text-center lg:items-start lg:text-left group">
              <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter mb-1 font-mono">
                100<span className="text-[#0088ff] font-bold">%</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono text-slate-300 font-bold uppercase tracking-widest">
                In-House Execution
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* 4. MISSION CRITICAL ENVIRONMENTS (SECTORS)*/}
      {/* ========================================= */}
      <section className="relative z-20 py-12 sm:py-18 lg:py-24 px-6 lg:px-12 bg-[#070a10] border-b border-slate-800/80">
        <div className="max-w-[1400px] mx-auto relative z-10">
          
          <div className="mb-8 sm:mb-12 lg:mb-16 flex flex-col items-start text-left lg:items-end lg:text-right">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white mb-2 sm:mb-4">
              Mission-Critical <br className="hidden sm:block" />
              <span className="text-slate-500">Environments.</span>
            </h2>
            <p className="text-slate-200 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl font-normal">
              We specialize in industrial facilities and production plants where system reliability is essential, downtime is costly, and installations demand seasoned field execution.
            </p>
          </div>

          <div className="space-y-6 sm:space-y-8">
            
            {/* Sector 1: High-Purity & Process Piping */}
            <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 bg-[#030914] border border-slate-800 p-6 sm:p-8 rounded-lg shadow-inner text-left">
              <div className="w-full md:w-1/3 aspect-video bg-[#070a10] border border-slate-800 rounded-xs flex flex-col items-center justify-center gap-2 sm:gap-3">
                <Microscope className="w-8 h-8 sm:w-10 sm:h-10 text-[#ea1f27]" />
                <span className="font-mono text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest">[ VISUAL DATA PENDING ]</span>
              </div>
              <div className="w-full md:w-2/3">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white uppercase tracking-tight mb-2 sm:mb-3">High-Purity & Process Piping</h3>
                <p className="text-slate-200 text-sm sm:text-base lg:text-lg leading-relaxed mb-4 sm:mb-6 font-normal">
                  Sanitary stainless steel lines, process distribution, and validated utility piping. Fabricated with precision fit-up and strict purge controls to ensure clean, contamination-free delivery.
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  <span className="px-3 py-1 sm:px-3.5 sm:py-1.5 bg-[#070a10] border border-[#ea1f27]/30 text-[#ea1f27] font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-xs">Sanitary Stainless</span>
                  <span className="px-3 py-1 sm:px-3.5 sm:py-1.5 bg-[#070a10] border border-[#ea1f27]/30 text-[#ea1f27] font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-xs">Process Loops</span>
                  <span className="px-3 py-1 sm:px-3.5 sm:py-1.5 bg-[#070a10] border border-[#ea1f27]/30 text-[#ea1f27] font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-xs">Utility Manifolds</span>
                </div>
              </div>
            </div>

            {/* Sector 2: Food & Beverage Facilities */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-6 sm:gap-8 bg-[#030914] border border-slate-800 p-6 sm:p-8 rounded-lg shadow-inner text-left">
              <div className="w-full md:w-1/3 aspect-video bg-[#070a10] border border-slate-800 rounded-xs flex flex-col items-center justify-center gap-2 sm:gap-3">
                <Droplets className="w-8 h-8 sm:w-10 sm:h-10 text-[#64748b]" />
                <span className="font-mono text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest">[ VISUAL DATA PENDING ]</span>
              </div>
              <div className="w-full md:w-2/3">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white uppercase tracking-tight mb-2 sm:mb-3">Food & Beverage Facilities</h3>
                <p className="text-slate-200 text-sm sm:text-base lg:text-lg leading-relaxed mb-4 sm:mb-6 font-normal">
                  Plant upgrades, piping routing, and equipment replacements planned around live operations. We install utility headers, steam lines, and process lines built for heavy demands.
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  <span className="px-3 py-1 sm:px-3.5 sm:py-1.5 bg-[#070a10] border border-[#64748b]/40 text-slate-400 font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-xs">Process Piping</span>
                  <span className="px-3 py-1 sm:px-3.5 sm:py-1.5 bg-[#070a10] border border-[#64748b]/40 text-slate-400 font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-xs">Utility Drops</span>
                  <span className="px-3 py-1 sm:px-3.5 sm:py-1.5 bg-[#070a10] border border-[#64748b]/40 text-slate-400 font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-xs">Steam & Condensate</span>
                </div>
              </div>
            </div>

            {/* Sector 3: Heavy Industrial Infrastructure */}
            <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 bg-[#030914] border border-slate-800 p-6 sm:p-8 rounded-lg shadow-inner text-left">
              <div className="w-full md:w-1/3 aspect-video bg-[#070a10] border border-slate-800 rounded-xs flex flex-col items-center justify-center gap-2 sm:gap-3">
                <Factory className="w-8 h-8 sm:w-10 sm:h-10 text-[#0088ff]" />
                <span className="font-mono text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest">[ VISUAL DATA PENDING ]</span>
              </div>
              <div className="w-full md:w-2/3">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white uppercase tracking-tight mb-2 sm:mb-3">Heavy Industrial Infrastructure</h3>
                <p className="text-slate-200 text-sm sm:text-base lg:text-lg leading-relaxed mb-4 sm:mb-6 font-normal">
                  Carbon, and stainless steel fabrication, mechanical equipment rigging, and heavy HVAC duct routing. We build structural skids, support stands, and robust utility drops for heavy manufacturing plants.
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  <span className="px-3 py-1 sm:px-3.5 sm:py-1.5 bg-[#070a10] border border-[#0088ff]/30 text-[#0088ff] font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-xs">Carbon Steel</span>
                  <span className="px-3 py-1 sm:px-3.5 sm:py-1.5 bg-[#070a10] border border-[#0088ff]/30 text-[#0088ff] font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-xs">Equipment Rigging</span>
                  <span className="px-3 py-1 sm:px-3.5 sm:py-1.5 bg-[#070a10] border border-[#0088ff]/30 text-[#0088ff] font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-xs">Heavy Ductwork</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* 5. CLIENT REPUTATION / ENTERPRISE EXPERIENCE */}
      {/* ========================================= */}
      <section className="py-10 sm:py-14 bg-[#02060d] border-b border-slate-800/80">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <p className="font-mono text-xs sm:text-base uppercase tracking-[0.2em] text-slate-400 font-bold text-center mb-6 sm:mb-8">
            Proven Mechanical Execution For Industry Leaders
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 lg:gap-8">
            {["CONAGRA BRANDS", "STOUFFER'S", "BUILT BAR", "SUPRA NATURALS", "EBAY DATA CENTERS"].map((client, idx) => (
              <span 
                key={idx} 
                className="font-mono text-[11px] sm:text-sm font-black tracking-widest text-slate-300 border border-slate-800 bg-[#030914] px-4 py-2 sm:px-5 sm:py-2.5 rounded-xs"
              >
                {client}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* 6. INDUSTRIAL REFRIGERATION & AMMONIA     */}
      {/* ========================================= */}
      <section className="relative z-20 py-12 sm:py-18 lg:py-24 px-6 lg:px-12 bg-[#030914] border-b border-slate-800/80 text-left">
        <div className="max-w-[1400px] mx-auto">
          <div className="max-w-3xl mb-8 sm:mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ea1f27]/10 border border-[#ea1f27]/30 text-[#ea1f27] font-mono text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase rounded-xs mb-4 sm:mb-6">
              Thermal Control Systems
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white mb-2 sm:mb-4">
              Industrial Refrigeration <br />
              <span className="text-slate-500">& Ammonia Piping.</span>
            </h2>
            <p className="text-slate-200 text-sm sm:text-base lg:text-lg leading-relaxed font-normal">
              Heavy-duty thermal control for production plants and cold processing. From anhydrous ammonia distribution to contact plate freezer install and maintenance, we build welded piping networks engineered for zero leaks under extreme thermal cycles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            <div className="bg-[#070a10] border border-slate-800 p-6 sm:p-8 rounded-lg shadow-inner">
              <h4 className="text-white font-black text-lg sm:text-xl uppercase tracking-tight mb-2 sm:mb-3">Ammonia Lines & Headers</h4>
              <p className="text-slate-300 text-xs sm:text-sm lg:text-base leading-relaxed font-normal">Certified carbon steel and low-temp alloy piping fabricated and field-welded for high-pressure suction, liquid, and hot-gas defrost lines.</p>
            </div>
            <div className="bg-[#070a10] border border-slate-800 p-6 sm:p-8 rounded-lg shadow-inner">
              <h4 className="text-white font-black text-lg sm:text-xl uppercase tracking-tight mb-2 sm:mb-3">Plate Freezers & Chillers</h4>
              <p className="text-slate-300 text-xs sm:text-sm lg:text-base leading-relaxed font-normal">New unit installs, mechanical tie-ins, valve manifold packages, and custom hookups for horizontal/vertical plate freezers and secondary glycol circuits.</p>
            </div>
            <div className="bg-[#070a10] border border-slate-800 p-6 sm:p-8 rounded-lg shadow-inner">
              <h4 className="text-white font-black text-lg sm:text-xl uppercase tracking-tight mb-2 sm:mb-3">Compressor & Skid Piping</h4>
              <p className="text-slate-300 text-xs sm:text-sm lg:text-base leading-relaxed font-normal">Pre-piped equipment bases, oil separator integration, and receiver connections built in our Springville facility for rapid jobsite positioning.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* 7. PACKAGING LINES, FILLERS & CONVEYANCE  */}
      {/* ========================================= */}
      <section className="relative z-20 py-12 sm:py-18 lg:py-24 px-6 lg:px-12 bg-[#070a10] border-b border-slate-800/80">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col items-start text-left lg:items-end lg:text-right mb-8 sm:mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0088ff]/10 border border-[#0088ff]/30 text-[#0088ff] font-mono text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase rounded-xs mb-4 sm:mb-6">
              Plant Packaging & Logistics
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white mb-2 sm:mb-4">
              Packaging Lines, Fillers <br />
              <span className="text-slate-500">& Conveyance Setting.</span>
            </h2>
            <p className="text-slate-200 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl font-normal">
              We eliminate equipment setting bottlenecks during line re-tools and plant retrofits. Our teams handle mechanical placement, precision alignment, and utility drops for high-speed filling, packaging, and sorting lines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-left">
            <div className="bg-[#030914] border border-slate-800 p-6 sm:p-8 rounded-lg shadow-inner">
              <h4 className="text-white font-black text-lg sm:text-xl uppercase tracking-tight mb-2 sm:mb-3">Line Fillers & Cappers</h4>
              <p className="text-slate-300 text-xs sm:text-sm lg:text-base leading-relaxed font-normal">Rigging and mechanical mounting for liquid, powder, and automated packaging equipment.</p>
            </div>

            <div className="bg-[#030914] border border-slate-800 p-6 sm:p-8 rounded-lg shadow-inner">
              <h4 className="text-white font-black text-lg sm:text-xl uppercase tracking-tight mb-2 sm:mb-3">Conveyor Grids</h4>
              <p className="text-slate-300 text-xs sm:text-sm lg:text-base leading-relaxed font-normal">Installation and mechanical leveling of belt, roller, and sanitary food-grade conveyor layouts.</p>
            </div>

            <div className="bg-[#030914] border border-slate-800 p-8 rounded-lg shadow-inner">
              <h4 className="text-white font-black text-lg sm:text-xl uppercase tracking-tight mb-2 sm:mb-3">Air Handling & Duct</h4>
              <p className="text-slate-300 text-xs sm:text-sm lg:text-base leading-relaxed font-normal">Custom AHU duct routing, makeup air units, and dust extraction drops for production lines.</p>
            </div>

            <div className="bg-[#030914] border border-slate-800 p-8 rounded-lg shadow-inner">
              <h4 className="text-white font-black text-lg sm:text-xl uppercase tracking-tight mb-2 sm:mb-3">Utility Drops</h4>
              <p className="text-slate-300 text-xs sm:text-sm lg:text-base leading-relaxed font-normal">Compressed air, steam, chilled water, and CIP manifolds routed directly to machine hookups.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* 8. HIGH-INTENT CONVERSION ANCHOR         */}
      {/* ========================================= */}
      <section className="relative z-20 bg-[#030914] py-14 sm:py-20 lg:py-32 px-6 lg:px-12 border-b border-slate-800/80 shadow-inner">
        <div className="max-w-[1000px] mx-auto text-center flex flex-col items-center">
          <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-[#0088ff] mb-4 sm:mb-6" strokeWidth={1.5} />
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white mb-4 sm:mb-6">
            Initiate Project <span className="inline-block bg-gradient-to-r from-[#ea1f27] from-0% via-[#64748b]/80 via-50% to-[#0088ff] to-100% bg-clip-text text-transparent">Review.</span>
          </h2>
          <p className="text-slate-200 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mb-8 sm:mb-10 font-normal">
            Submit prints, project specifications, and scope requirements directly to our team. We guarantee transparent bids with hard execution timelines.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <Link 
              href="/contact" 
              className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 bg-[#ea1f27] hover:bg-[#d41920] text-white font-mono text-xs font-bold uppercase tracking-[0.15em] rounded-xs shadow-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-3"
            >
              Contact Us <ArrowRight className="w-4 h-4" />
            </Link>
            <span className="font-mono text-xs text-slate-400 font-bold uppercase tracking-widest mt-2 sm:mt-0">
              OR CALL: <a href={phoneHref} className="text-white hover:text-[#0088ff] transition-colors">{phoneDisplay}</a>
            </span>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* 9. SITE FOOTER                            */}
      {/* ========================================= */}
      <Footer />

    </main>
  );
}

