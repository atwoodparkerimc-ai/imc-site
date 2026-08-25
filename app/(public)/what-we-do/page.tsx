"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  Mail, 
  Phone,
  Factory,
  Flame,
  Wind
} from "lucide-react";
import Footer from "@/components/footer";

const capabilitySectors = [
  {
    title: "Process & Piping",
    code: "pipefitting",
    icon: Flame,
    accentBorder: "border-t-[#ea1f27]",
    accentBadge: "text-[#ea1f27] border-[#ea1f27]/40 bg-[#ea1f27]/10",
    description: "High-purity sanitary process lines, orbital welding protocols, and high-pressure utility distribution.",
    specs: [
      { name: "Sanitary Stainless", detail: "Ultra-clean BPE process lines for biopharma & food" },
      { name: "Orbital Welding", detail: "Automated closed-chamber zero-tolerance joints" },
      { name: "Utility Distribution", detail: "High-pressure steam, natural gas, & chilled fluid" }
    ]
  },
  {
    title: "Atmospheric Systems",
    code: "HVAC",
    icon: Wind,
    accentBorder: "border-t-[#a855f7]",
    accentBadge: "text-[#a855f7] border-[#a855f7]/40 bg-[#a855f7]/10",
    description: "Controlled cleanroom environments, central physical plant infrastructure, and hazardous exhaust.",
    specs: [
      { name: "Cleanroom HVAC", detail: "ISO-classified positive/negative pressure environments" },
      { name: "Central Plants", detail: "Commercial chillers, boilers, & cooling towers" },
      { name: "Industrial Exhaust", detail: "Scrubbed fume extraction & thermal dust collection" }
    ]
  },
  {
    title: "Structural Fabrication",
    code: "FABRICATION",
    icon: Factory,
    accentBorder: "border-t-[#0088ff]",
    accentBadge: "text-[#0088ff] border-[#0088ff]/40 bg-[#0088ff]/10",
    description: "Heavy industrial framework, pre-fabricated piping assemblies, and custom equipment skids.",
    specs: [
      { name: "Custom Skids", detail: "Engineered modular baseframes & transport skids" },
      { name: "Pipe Spool Fab", detail: "Precision pre-fab spooling for rapid field assembly" },
      { name: "Heavy Ductwork", detail: "Heavy-gauge industrial duct & high-pressure exhaust" }
    ]
  }
];

export default function CapabilitiesLandingPage() {
  return (
    <div className="min-h-screen bg-[#030914] flex flex-col justify-between relative font-sans text-slate-100 selection:bg-[#ea1f27] selection:text-white overflow-hidden">
      
      {/* Tactical Blueprint Grid Background */}
      <div className="absolute inset-0 z-0 tactical-graph-paper opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#030914_100%)] pointer-events-none" />

      {/* Main Console Interface */}
      <main className="flex-1 relative z-10 max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 pt-24 pb-20 w-full">
        
        {/* Command Header */}
        <div className="max-w-4xl mb-16 space-y-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-none">
            WHAT WE{" "}
            <span className="text-[#ea1f27]">BU</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ea1f27] via-[#a855f7] to-[#0088ff]">
              IL
            </span>
            <span className="text-[#0088ff]">D.</span>
          </h1>

          <p className="font-mono text-sm sm:text-base text-slate-300 uppercase tracking-wider max-w-3xl leading-relaxed pt-2">
            Precision trade craftsmanship and large-scale industrial mechanical execution on jobsites nationwide.
          </p>
        </div>

        {/* Temporary Spec Index Notice Card */}
        <div className="mb-14 p-8 sm:p-10 bg-[#070a10] border border-slate-800 rounded-sm relative shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#ea1f27] via-[#a855f7] to-[#0088ff]" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 text-white font-mono text-sm sm:text-base font-bold uppercase tracking-wider">
                <span className="w-2.5 h-2.5 bg-[#ea1f27] animate-pulse rounded-none shrink-0" />
                Detailed Spec Sheets In Production
              </div>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
                Expanded capability sheets and build records are currently being compiled. If you have an active project or RFP ready for pricing, send blueprints directly to our estimating team.
              </p>
            </div>

            <a 
              href="mailto:estimating@interwestmechanical.com" 
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#ea1f27] hover:bg-[#d41920] text-white font-mono font-bold text-xs sm:text-sm uppercase tracking-[0.15em] transition-all rounded-xs shrink-0 shadow-lg active:scale-[0.98]"
            >
              Contact Us Today <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* 3-Column Systems Matrix (Red -> Purple -> Blue Order) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {capabilitySectors.map((sector, idx) => {
            const IconComponent = sector.icon;
            return (
              <div 
                key={idx} 
                className={`bg-[#070a10] border border-slate-800 p-8 sm:p-10 flex flex-col justify-between rounded-sm relative shadow-xl ${sector.accentBorder} border-t-2`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className={`font-mono text-xs sm:text-sm font-bold uppercase tracking-widest border px-3 py-1.5 rounded-xs ${sector.accentBadge}`}>
                      {sector.code}
                    </span>
                    <IconComponent className="w-6 h-6 text-slate-400" />
                  </div>

                  <h2 className="text-white font-black text-2xl sm:text-3xl uppercase tracking-tight mb-3">
                    {sector.title}
                  </h2>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
                    {sector.description}
                  </p>

                  <div className="space-y-4">
                    {sector.specs.map((item, itemIdx) => (
                      <div key={itemIdx} className="bg-[#030914] border border-slate-800/80 p-4 rounded-xs space-y-1.5">
                        <span className="font-mono text-sm font-bold text-white uppercase tracking-wider block">
                          {item.name}
                        </span>
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {item.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tactical Communications Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 sm:p-10 bg-[#070a10] border border-slate-800 rounded-sm">
          <div className="flex items-start gap-5">
            <div className="p-3.5 bg-[#ea1f27]/10 border border-[#ea1f27]/30 text-[#ea1f27] rounded-xs shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-mono text-[#ea1f27] uppercase font-bold tracking-[0.2em] block mb-1">
                Phone
              </span>
              <a href="tel:8013605735" className="font-mono text-xl sm:text-2xl font-black text-white hover:text-[#ea1f27] transition-colors">
                (801) 360-5735
              </a>
              <p className="text-slate-300 text-sm mt-1">Connect directly with project managers and field operations leads.</p>
            </div>
          </div>

          <div className="flex items-start gap-5">
            <div className="p-3.5 bg-[#0088ff]/10 border border-[#0088ff]/30 text-[#0088ff] rounded-xs shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-mono text-[#0088ff] uppercase font-bold tracking-[0.2em] block mb-1">
                E-Mail
              </span>
              <a href="mailto:estimating@interwestmechanical.com" className="font-mono text-base sm:text-lg font-bold text-white hover:text-[#0088ff] transition-colors break-all">
                estimating@interwestmechanical.com
              </a>
              <p className="text-slate-300 text-sm mt-1">Reach out to get your project started</p>
            </div>
          </div>
        </div>

      </main>

      {/* Official Site Footer */}
      <Footer />
    </div>
  );
}