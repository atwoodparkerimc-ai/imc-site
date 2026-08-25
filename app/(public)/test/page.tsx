"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
// Using the absolute alias (@/) so these paths never break again
import AtAGlance from "@/components/at-a-glance";
import LogoTicker from "@/components/logo-ticker"; 
import OperationalMap from "@/components/operational-map";
import SkidBlueprintAnimation from "@/components/skid-blueprint-animation";

// Dynamically import the 3D canvas pipelines
const BlueprintAnimation = dynamic(
  () => import("@/components/blueprint-animation").then((mod) => mod.BlueprintAnimation),
  { 
    ssr: false, 
    loading: () => (
      <div className="h-full w-full animate-pulse flex items-center justify-center">
        <span className="font-mono text-xs uppercase tracking-widest text-slate-500">Initializing CAD Models...</span>
      </div>
    ) 
  }
);

const AhuBlueprintAnimation = dynamic(
  () => import("@/components/ahu-blueprint-animation"),
  { 
    ssr: false, 
    loading: () => (
      <div className="h-full w-full animate-pulse flex items-center justify-center">
        <span className="font-mono text-xs uppercase tracking-widest text-slate-500">Loading AHU System CAD...</span>
      </div>
    ) 
  }
);

export default function Home() {
  return (
    <main className="w-full relative overflow-x-hidden bg-[#0e1117] text-slate-100 font-sans selection:bg-[var(--color-brand-accent)] selection:text-white">
      
      {/* -------------------------------------------------------------------------- */}
      {/* 1. HERO OPERATIONAL NODE SEGMENT                                           */}
      {/* -------------------------------------------------------------------------- */}
      <div className="min-h-[calc(100vh-5rem)] w-full relative overflow-hidden pt-4 lg:pt-6 pb-16 flex flex-col justify-center border-b border-slate-800/80">
        
        {/* Technical Blueprint Grid Background */}
        <div 
          className="absolute inset-0 z-0 opacity-15 pointer-events-none" 
          style={{ 
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
            `, 
            backgroundSize: '48px 48px' 
          }}
        />

        <div className="max-w-[1700px] mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12 z-10 relative">
          
          {/* MOBILE-ONLY HEADER */}
          <div className="block lg:hidden w-full space-y-2 text-center mb-2">
            <span className="inline-block px-2.5 py-1 bg-red-500/10 border border-red-500/30 text-red-500 font-mono text-[10px] font-bold tracking-[0.25em] uppercase rounded-xs">
              Interwest Mechanical Contractors
            </span>
            <h1 className="text-[clamp(2.2rem,8vw,3.5rem)] font-black text-white leading-[1.05] tracking-tight uppercase">
              Precision <br />
              Infrastructures
            </h1>
          </div>

          {/* Master 12-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-2 lg:gap-8">
            
            {/* Left Spatial 3D Blueprint Canvas */}
            <div className="lg:col-span-8 w-full h-[45vh] lg:h-[85vh] relative z-10 flex items-center justify-center lg:justify-start overflow-visible translate-x-0 lg:-translate-x-32 xl:-translate-x-48">
              <BlueprintAnimation />
            </div>

            {/* Right Telemetry Data & Actions Segment */}
            <div className="lg:col-span-4 w-full min-w-0 space-y-5 lg:space-y-6 text-center lg:text-left z-20">
              
              {/* DESKTOP-ONLY PLATFORM HEADER */}
              <div className="hidden lg:block space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-500 font-mono text-xs font-bold tracking-[0.2em] uppercase rounded-xs">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-none" />
                  Interwest Mechanical Contractors
                </div>

                <h1 className="text-[clamp(2.2rem,3vw,4.2rem)] font-black text-white leading-[1.02] tracking-tight uppercase">
                  Precision <br />
                  Infrastructures
                </h1>
              </div>

              <p className="text-slate-400 text-xs sm:text-sm lg:text-base leading-relaxed max-w-md mx-auto lg:mx-0 font-normal">
                At IMC, we specialize in constructing high-tolerance cleanrooms, advanced industrial HVAC systems, and state-of-the-art manufacturing facilities. We bridge the gap between architectural vision and operational reality.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-3 justify-center lg:justify-start pt-2">
                <Link 
                  href="/what-we-do" 
                  className="w-full sm:w-auto xl:w-auto px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold uppercase tracking-widest rounded-xs shadow-lg shadow-red-950/40 transition-all text-center whitespace-nowrap cursor-pointer border border-red-500"
                >
                  Explore Our Capabilities ↗
                </Link>
                <Link 
                  href="/contact" 
                  className="w-full sm:w-auto xl:w-auto px-6 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white font-mono text-xs font-bold uppercase tracking-widest rounded-xs border border-slate-700 hover:border-slate-500 transition-all text-center whitespace-nowrap cursor-pointer"
                >
                  Contact Engineering
                </Link>
              </div>

              {/* Status Indicator */}
              <div className="pt-2 flex items-center justify-center lg:justify-start gap-4 text-[9px] lg:text-[10px] font-mono text-slate-500 uppercase tracking-widest border-t border-slate-800/80 mt-2 lg:mt-0">
                <span>EST. UTAH, USA</span>
                <span>•</span>
                <span>CLASS A CONTRACTOR</span>
              </div>

            </div>
          </div> 
        </div> 
      </div> 

      {/* -------------------------------------------------------------------------- */}
      {/* 2. OPERATIONAL TELEMETRY PANELS SECTION                                    */}
      {/* -------------------------------------------------------------------------- */}
      <div className="bg-[#0b0e14]">
        <AtAGlance /> 
        <OperationalMap />
        <LogoTicker />
      </div>

      {/* -------------------------------------------------------------------------- */}
      {/* 3. HARDWARE SPECIFICATION DISPLAY (SKID SYSTEM MODULE)                     */}
      {/* -------------------------------------------------------------------------- */}
      <section className="w-full border-t border-slate-800/80 bg-[#0c0f16] py-16 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Description */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2 font-mono text-[10px] text-red-500 uppercase tracking-widest font-bold">
              <span className="inline-block w-2 h-2 bg-red-500 rounded-none animate-pulse" />
              Active Deployments
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-none">
              Mobile Surveillance <br />
              <span className="text-slate-500">Solar Skids</span>
            </h2>
            <p className="text-xs font-mono text-slate-400 leading-relaxed">
              Engineered for absolute off-grid operational independence. Our structural skids feature automated three-stage telescoping masts, dual adjustable 400W monocrystalline solar panels, and a NEMA-rated secure electrical control matrix. 
            </p>
            <div className="pt-2">
              <span className="inline-block border border-slate-800 bg-slate-900/80 px-3 py-1.5 font-mono text-[9px] text-slate-300 uppercase tracking-wider rounded-xs">
                [ Wind Rating: 90 MPH Safe Threshold ]
              </span>
            </div>
          </div>

          {/* Right Canvas Display */}
          <div className="lg:col-span-8 w-full border border-slate-800 bg-slate-950 shadow-2xl relative rounded-xs overflow-hidden">
            <SkidBlueprintAnimation />
          </div>

        </div>
      </section>

      {/* -------------------------------------------------------------------------- */}
      {/* 4. CRITICAL PROCESS AIR (AHU) HYGIENIC SYSTEM MODULE - FULL VIEWPORT       */}
      {/* -------------------------------------------------------------------------- */}
      <div className="min-h-[calc(100vh-5rem)] w-full relative overflow-hidden pt-4 lg:pt-6 pb-16 flex flex-col justify-center border-t border-b border-slate-800/80">
        
        {/* Technical Blueprint Grid Background */}
        <div 
          className="absolute inset-0 z-0 opacity-15 pointer-events-none" 
          style={{ 
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
            `, 
            backgroundSize: '48px 48px' 
          }}
        />

        <div className="max-w-[1700px] mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12 z-10 relative">
          
          {/* MOBILE-ONLY HEADER */}
          <div className="block lg:hidden w-full space-y-2 text-center mb-2">
            <span className="inline-block px-2.5 py-1 bg-sky-500/10 border border-sky-500/30 text-sky-400 font-mono text-[10px] font-bold tracking-[0.25em] uppercase rounded-xs">
              Custom HVAC Engineering
            </span>
            <h2 className="text-[clamp(2.2rem,8vw,3.5rem)] font-black text-white leading-[1.05] tracking-tight uppercase">
              Hygienic Critical <br />
              Air Handlers
            </h2>
          </div>

          {/* Master 12-Column Grid (Identical to Hero Section) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-2 lg:gap-8">
            
            {/* Left Spatial 3D Blueprint Canvas */}
            <div className="lg:col-span-8 w-full h-[45vh] lg:h-[85vh] relative z-10 flex items-center justify-center lg:justify-start overflow-visible translate-x-0 lg:-translate-x-32 xl:-translate-x-48">
              <AhuBlueprintAnimation />
            </div>

            {/* Right Telemetry Data Segment */}
            <div className="lg:col-span-4 w-full min-w-0 space-y-5 lg:space-y-6 text-center lg:text-left z-20">
              
              {/* DESKTOP-ONLY HEADER */}
              <div className="hidden lg:block space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-500/30 text-sky-400 font-mono text-xs font-bold tracking-[0.2em] uppercase rounded-xs">
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-none animate-pulse" />
                  Custom HVAC Engineering
                </div>

                <h2 className="text-[clamp(2.2rem,3vw,4.2rem)] font-black text-white leading-[1.02] tracking-tight uppercase">
                  Hygienic Critical <br />
                  Air Handling Units
                </h2>
              </div>

              <p className="text-slate-400 text-xs sm:text-sm lg:text-base leading-relaxed max-w-md mx-auto lg:mx-0 font-normal">
                Multi-stage modular air handler featuring direct-drive plenum blowers, V-bank filtration racks, and serpentine cooling coils. Engineered for food processing cleanrooms and critical atmospheric regulation.
              </p>

              {/* Status Badge */}
              <div className="pt-2">
                <span className="inline-block border border-slate-800 bg-slate-900/80 px-4 py-2 font-mono text-[10px] text-sky-400 uppercase tracking-wider rounded-xs">
                  [ Dynamic Flow Rate: 1,000 - 150,000 CFM ]
                </span>
              </div>

            </div>
          </div> 
        </div> 
      </div>

    </main>
  );
}