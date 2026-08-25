"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import Footer from "@/components/footer";
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

export default function Home() {
  // Obfuscated contact variables to prevent automated spam bot scraping
  const phoneDisplay = ["(801)", "360-5735"].join(" ");
  const phoneHref = ["tel:8013605735"].join("");

  return (
    <main className="w-full relative overflow-x-hidden bg-[#0b0f19] text-slate-100 font-sans selection:bg-[#0088ff] selection:text-white">

      {/* ========================================= */}
      {/* 1. HERO: FULL-BLEED 3D & RIGHT-ALIGNED TYPOGRAPHY */}
      {/* ========================================= */}
      <section className="relative w-full min-h-[calc(100vh-5rem)] flex items-center bg-[#0b0f19] border-b border-slate-800/80 overflow-hidden">

        {/* Unified Background Grid */}
        <div className="absolute inset-0 z-0 tactical-graph-paper opacity-30"></div>

        {/* Telemetry overlay - Left aligned using company red */}
        <div className="absolute bottom-8 left-8 flex items-center gap-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest z-30">
          <span className="w-1.5 h-1.5 bg-[#ea1f27] rounded-none animate-pulse" />
          Class A Mechanical Contractor
        </div>

        {/* Simplified wrapper - Strictly occupies the left 60% of the screen at 100% height */}
        <div className="absolute inset-0 z-10 w-full lg:w-[60%] h-full flex items-center justify-center">
          <div className="w-full h-full">
            <AhuBlueprintAnimation />
          </div>
        </div>

        {/* RIGHT PANEL: Typography Content - Pushed Far Right */}
        <div className="relative z-20 w-full h-full max-w-[1800px] mx-auto px-6 sm:px-12 lg:px-16 flex justify-end items-center pointer-events-none pt-48 lg:pt-0">

          <div className="w-full lg:w-[45%] xl:w-[35%] pointer-events-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ea1f27]/10 border border-[#ea1f27]/30 text-[#ea1f27] font-mono text-[10px] font-bold tracking-[0.2em] uppercase rounded-xs mb-8">
              Interwest Mechanical Contractors
            </div>

            <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-black tracking-tighter uppercase leading-[0.95] text-white mb-6">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ea1f27] from-[18%] via-[#a855f7] via-[50%] to-[#0088ff] to-[82%]">Nervous System</span> <br />
              Of Heavy Industry.
            </h1>

            <p className="text-sm sm:text-base text-slate-400 font-light leading-relaxed mb-10">
              [FILLER TEXT] We build the infrastructure that keeps the world running. From massive commercial air handling systems to high-purity process piping, our crews execute the most complex mechanical scopes on time and under budget.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href="/contact" className="w-full sm:w-auto px-8 py-4 bg-white text-[#0b0f19] hover:bg-slate-200 font-mono text-xs font-bold uppercase tracking-widest rounded-xs transition-colors text-center whitespace-nowrap">
                Initiate Project Bid
              </Link>
              <Link href="/what-we-do" className="w-full sm:w-auto px-8 py-4 bg-transparent border border-slate-700 text-slate-300 hover:border-[#ea1f27] hover:text-[#ea1f27] font-mono text-xs font-bold uppercase tracking-widest rounded-xs transition-colors text-center whitespace-nowrap">
                View Capabilities
              </Link>
            </div>
          </div>
        </div>

      </section>

      {/* ========================================= */}
      {/* 2. INDUSTRIAL CERTIFICATIONS TICKER       */}
      {/* ========================================= */}
      <div className="border-b border-slate-800/80 bg-[#030914] py-4 relative z-20 flex overflow-hidden whitespace-nowrap shadow-inner">
        <div className="flex gap-12 font-mono text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase items-center px-6">
          <span className="flex items-center gap-2"><ShieldCheck className="w-3 h-3 text-[#ea1f27]" /> ASME Certified</span>
          <span className="flex items-center gap-2"><ShieldCheck className="w-3 h-3 text-[#ea1f27]" /> ISNetworld Member</span>
          <span className="flex items-center gap-2"><ShieldCheck className="w-3 h-3 text-[#ea1f27]" /> OSHA VPP Star Site</span>
          <span className="flex items-center gap-2"><ShieldCheck className="w-3 h-3 text-[#ea1f27]" /> AWS D1.1 Compliant</span>
          <span className="flex items-center gap-2"><ShieldCheck className="w-3 h-3 text-[#ea1f27]" /> National Board "R" Stamp</span>
          <span className="hidden md:flex items-center gap-2"><ShieldCheck className="w-3 h-3 text-[#ea1f27]" /> EPA Certified</span>
          <span className="hidden lg:flex items-center gap-2"><ShieldCheck className="w-3 h-3 text-[#ea1f27]" /> MSHA Compliant</span>
        </div>
      </div>

      {/* ========================================= */}
      {/* 3. THE MANIFESTO / STATS STRIP            */}
      {/* ========================================= */}
      <section className="bg-[#030914] py-16 sm:py-20 border-b border-slate-800/80 relative z-20 shadow-inner">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 divide-x-0 md:divide-x divide-slate-800">

            <div className="pl-0 md:px-8 flex flex-col justify-center items-center text-center md:items-start md:text-left">
              <span className="text-5xl lg:text-6xl font-black text-white tracking-tighter mb-2">30<span className="text-[#ea1f27]">+</span></span>
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">Years Active</span>
            </div>

            <div className="pl-0 md:px-8 flex flex-col justify-center items-center text-center md:items-start md:text-left">
              <span className="text-5xl lg:text-6xl font-black text-white tracking-tighter mb-2">450<span className="text-[#a855f7]">+</span></span>
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">Deployments</span>
            </div>

            <div className="pl-0 md:px-8 flex flex-col justify-center items-center text-center md:items-start md:text-left">
              <span className="text-5xl lg:text-6xl font-black text-white tracking-tighter mb-2">40<span className="text-[#0088ff]">k</span></span>
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">Sq Ft Shop Space</span>
            </div>

            <div className="pl-0 md:px-8 flex flex-col justify-center items-center text-center md:items-start md:text-left">
              <span className="text-5xl lg:text-6xl font-black text-white tracking-tighter mb-2">100<span className="text-emerald-500">%</span></span>
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">In-House Execution</span>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* 4. EXECUTION ARCHITECTURE (THE PROCESS)   */}
      {/* ========================================= */}
      <section className="relative z-20 py-24 px-6 lg:px-12 bg-[#070a10] border-b border-slate-800/80">
        <div className="max-w-[1400px] mx-auto">
          
          <div className="mb-20 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0088ff]/10 border border-[#0088ff]/30 text-[#0088ff] font-mono text-[10px] font-bold tracking-widest uppercase rounded-xs mb-6">
              <span className="w-1.5 h-1.5 bg-[#0088ff] rounded-none animate-pulse" />
              Deployment Methodology
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white mb-6">
              Execution <span className="text-slate-500">Architecture.</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Hope is not a strategy. We engineer predictability into every build by controlling the entire lifecycle—from virtual clash detection to off-site fabrication and precision field deployment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 relative">
            
            {/* Desktop connecting line */}
            <div className="hidden xl:block absolute top-12 left-[12%] right-[12%] h-[1px] bg-gradient-to-r from-transparent via-[#0088ff]/30 to-transparent z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 bg-[#030914] border border-slate-800 p-8 rounded-lg shadow-inner hover:border-[#0088ff]/50 transition-colors group">
              <div className="w-16 h-16 bg-[#070a10] border border-slate-800 rounded-xs flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cpu className="w-7 h-7 text-[#0088ff]" strokeWidth={1.5} />
              </div>
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-2">Phase 01</span>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3">VDC & BIM Coordination</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Virtual Design and Construction (VDC) eliminates site clashes before materials are even ordered. We model routing, hangers, and equipment footprints to a fraction of an inch.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 bg-[#030914] border border-slate-800 p-8 rounded-lg shadow-inner hover:border-[#a855f7]/50 transition-colors group">
              <div className="w-16 h-16 bg-[#070a10] border border-slate-800 rounded-xs flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Wrench className="w-7 h-7 text-[#a855f7]" strokeWidth={1.5} />
              </div>
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-2">Phase 02</span>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3">Controlled Prefabrication</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Spools, skids, and duct assemblies are built in our 40,000 sq ft Springville facility. Orbital welding in a controlled environment ensures x-ray quality and removes hours from the field.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 bg-[#030914] border border-slate-800 p-8 rounded-lg shadow-inner hover:border-[#ea1f27]/50 transition-colors group">
              <div className="w-16 h-16 bg-[#070a10] border border-slate-800 rounded-xs flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Truck className="w-7 h-7 text-[#ea1f27]" strokeWidth={1.5} />
              </div>
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-2">Phase 03</span>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3">Tactical Field Deployment</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Assemblies arrive on-site sequenced for immediate lift and installation. Our OSHA-certified crews integrate components rapidly, significantly reducing site congestion and safety risks.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative z-10 bg-[#030914] border border-slate-800 p-8 rounded-lg shadow-inner hover:border-[#00ff9d]/50 transition-colors group">
              <div className="w-16 h-16 bg-[#070a10] border border-slate-800 rounded-xs flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CheckSquare className="w-7 h-7 text-[#00ff9d]" strokeWidth={1.5} />
              </div>
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-2">Phase 04</span>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3">Zero-Defect Handover</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Systems undergo rigorous pressure testing, flushing, and commissioning. We deliver clean O&M manuals and fully operational systems ready for the demands of heavy industry.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* 5. TECHNOLOGICAL INFRASTRUCTURE           */}
      {/* ========================================= */}
      <section className="relative z-20 py-24 px-6 lg:px-12 bg-[#02060d] border-b border-slate-800/80 overflow-hidden">
        <div className="absolute inset-0 z-0 tactical-graph-paper opacity-30 pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0088ff]/10 border border-[#0088ff]/30 text-[#0088ff] font-mono text-[10px] font-bold tracking-[0.2em] uppercase rounded-xs mb-6">
                <Monitor className="w-3 h-3" /> System Capabilities
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white mb-4">
                Technological <span className="text-slate-500">Integration.</span>
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                We don't rely on tape measures and guesswork. IMC integrates enterprise-grade hardware and software to seamlessly bridge the gap between high-fidelity engineering designs and physical technical implementation.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tech Card 1 */}
            <div className="bg-[#030914] border border-slate-800 p-8 rounded-lg shadow-inner hover:border-[#0088ff]/50 transition-colors">
              <Crosshair className="w-8 h-8 text-[#0088ff] mb-6" strokeWidth={1.5} />
              <h4 className="text-white font-black text-xl uppercase tracking-tight mb-3">Robotic Total Stations</h4>
              <p className="text-slate-400 text-sm leading-relaxed">Trimble RTS units map hanger locations, pipe routing, and equipment pads with absolute millimeter precision directly from the BIM model to the concrete.</p>
            </div>
             {/* Tech Card 2 */}
            <div className="bg-[#030914] border border-slate-800 p-8 rounded-lg shadow-inner hover:border-[#a855f7]/50 transition-colors">
              <Monitor className="w-8 h-8 text-[#a855f7] mb-6" strokeWidth={1.5} />
              <h4 className="text-white font-black text-xl uppercase tracking-tight mb-3">LOD 400 BIM Modeling</h4>
              <p className="text-slate-400 text-sm leading-relaxed">Full 3D clash detection across all MEP and structural trades. We build the facility entirely in virtual space before a single piece of pipe is ever cut.</p>
            </div>
             {/* Tech Card 3 */}
            <div className="bg-[#030914] border border-slate-800 p-8 rounded-lg shadow-inner hover:border-[#ea1f27]/50 transition-colors">
              <Settings2 className="w-8 h-8 text-[#ea1f27] mb-6" strokeWidth={1.5} />
              <h4 className="text-white font-black text-xl uppercase tracking-tight mb-3">Automated Spooling</h4>
              <p className="text-slate-400 text-sm leading-relaxed">Proprietary fabrication software instantly converts complex 3D models into exact cut-sheets, weld logs, and routing data for the fabrication floor.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* 6. MISSION CRITICAL ENVIRONMENTS (SECTORS)*/}
      {/* ========================================= */}
      <section className="relative z-20 py-24 px-6 lg:px-12 bg-[#070a10] border-b border-slate-800/80">
        <div className="max-w-[1400px] mx-auto relative z-10">
          
          <div className="mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white mb-4">
              Mission-Critical <br className="hidden sm:block" />
              <span className="text-slate-500">Environments.</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              We don't build generic commercial space. IMC specializes in environments where tolerance is measured in thousandths of an inch and system failure is catastrophic. 
            </p>
          </div>

          <div className="space-y-6">
            
            {/* Sector 1: High Purity */}
            <div className="group flex flex-col md:flex-row items-center gap-8 bg-[#030914] border border-slate-800 p-6 md:p-8 rounded-lg shadow-inner hover:border-[#a855f7]/50 transition-colors">
              <div className="w-full md:w-1/3 aspect-video bg-[#070a10] border border-slate-800 rounded-xs flex flex-col items-center justify-center gap-3">
                <Microscope className="w-10 h-10 text-slate-600 group-hover:text-[#a855f7] transition-colors" />
                <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">[ VISUAL DATA PENDING ]</span>
              </div>
              <div className="w-full md:w-2/3">
                <span className="inline-flex items-center gap-2 font-mono text-[10px] text-[#a855f7] uppercase tracking-widest font-bold mb-3">
                  Sector 01 // Biopharma & Cleanrooms
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-4">High-Purity Systems</h3>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
                  Class 10 to Class 100,000 cleanroom environments. We execute orbital welded sanitary stainless piping, RO/DI water systems, and high-efficiency HEPA filtration systems that meet exacting FDA and cGMP validation standards.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-[#070a10] border border-slate-800 text-slate-300 font-mono text-[10px] uppercase tracking-wider rounded-xs">Orbital Welding</span>
                  <span className="px-3 py-1.5 bg-[#070a10] border border-slate-800 text-slate-300 font-mono text-[10px] uppercase tracking-wider rounded-xs">Sanitary Stainless</span>
                  <span className="px-3 py-1.5 bg-[#070a10] border border-slate-800 text-slate-300 font-mono text-[10px] uppercase tracking-wider rounded-xs">Medical Gases</span>
                </div>
              </div>
            </div>

            {/* Sector 2: Food & Beverage */}
            <div className="group flex flex-col md:flex-row-reverse items-center gap-8 bg-[#030914] border border-slate-800 p-6 md:p-8 rounded-lg shadow-inner hover:border-[#0088ff]/50 transition-colors">
              <div className="w-full md:w-1/3 aspect-video bg-[#070a10] border border-slate-800 rounded-xs flex flex-col items-center justify-center gap-3">
                <Droplets className="w-10 h-10 text-slate-600 group-hover:text-[#0088ff] transition-colors" />
                <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">[ VISUAL DATA PENDING ]</span>
              </div>
              <div className="w-full md:w-2/3">
                <span className="inline-flex items-center gap-2 font-mono text-[10px] text-[#0088ff] uppercase tracking-widest font-bold mb-3">
                  Sector 02 // Production & Processing
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-4">Food & Beverage Facilities</h3>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
                  Rapid shutdown integrations and plant expansions without breaking production flow. From massive glycol chiller plants to steam delivery and CIP (Clean-In-Place) piping grids designed for absolute hygiene.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-[#070a10] border border-slate-800 text-slate-300 font-mono text-[10px] uppercase tracking-wider rounded-xs">CIP Systems</span>
                  <span className="px-3 py-1.5 bg-[#070a10] border border-slate-800 text-slate-300 font-mono text-[10px] uppercase tracking-wider rounded-xs">Process Chillers</span>
                  <span className="px-3 py-1.5 bg-[#070a10] border border-slate-800 text-slate-300 font-mono text-[10px] uppercase tracking-wider rounded-xs">Steam Lines</span>
                </div>
              </div>
            </div>

            {/* Sector 3: Heavy Industrial */}
            <div className="group flex flex-col md:flex-row items-center gap-8 bg-[#030914] border border-slate-800 p-6 md:p-8 rounded-lg shadow-inner hover:border-[#ea1f27]/50 transition-colors">
              <div className="w-full md:w-1/3 aspect-video bg-[#070a10] border border-slate-800 rounded-xs flex flex-col items-center justify-center gap-3">
                <Factory className="w-10 h-10 text-slate-600 group-hover:text-[#ea1f27] transition-colors" />
                <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">[ VISUAL DATA PENDING ]</span>
              </div>
              <div className="w-full md:w-2/3">
                <span className="inline-flex items-center gap-2 font-mono text-[10px] text-[#ea1f27] uppercase tracking-widest font-bold mb-3">
                  Sector 03 // Manufacturing & Power
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-4">Heavy Industrial Infrastructure</h3>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
                  Thick-wall carbon steel, massive equipment rigging, and heavy HVAC configurations. We build the structural supports, utility drops, and exhaust systems required for aerospace, mining, and high-output manufacturing plants.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-[#070a10] border border-slate-800 text-slate-300 font-mono text-[10px] uppercase tracking-wider rounded-xs">Carbon Steel</span>
                  <span className="px-3 py-1.5 bg-[#070a10] border border-slate-800 text-slate-300 font-mono text-[10px] uppercase tracking-wider rounded-xs">Heavy Rigging</span>
                  <span className="px-3 py-1.5 bg-[#070a10] border border-slate-800 text-slate-300 font-mono text-[10px] uppercase tracking-wider rounded-xs">Industrial Exhaust</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* 7. SAFETY PROTOCOL & COMPLIANCE           */}
      {/* ========================================= */}
      <section className="relative z-20 py-24 px-6 lg:px-12 bg-[#02060d] border-b border-slate-800/80 overflow-hidden">
        <div className="absolute inset-0 z-0 tactical-graph-paper opacity-30 pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ea1f27]/10 border border-[#ea1f27]/30 text-[#ea1f27] font-mono text-[10px] font-bold tracking-[0.2em] uppercase rounded-xs mb-6">
                <ShieldAlert className="w-3 h-3" /> Zero Compromise
              </div>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mb-6">
                Engineered <br />
                <span className="text-slate-500">For Safety.</span>
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
                In heavy industry, safety isn't a checklist; it's a culture. We deploy full-time Safety Managers to active sites, conduct rigorous daily JHA (Job Hazard Analysis) protocols, and maintain safety metrics that routinely beat national averages.
              </p>
              
              <div className="flex items-center gap-6">
                <div>
                  <span className="block text-3xl font-black text-white">0.78</span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Current EMR</span>
                </div>
                <div className="w-px h-12 bg-slate-800"></div>
                <div>
                  <span className="block text-3xl font-black text-white">100%</span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">OSHA 30 Certified</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#030914] border border-slate-800 p-8 rounded-lg shadow-inner">
                <HardHat className="w-8 h-8 text-[#ea1f27] mb-5" strokeWidth={1.5} />
                <h4 className="text-white font-black uppercase tracking-tight mb-3">Dedicated Safety Officers</h4>
                <p className="text-slate-400 text-sm leading-relaxed">Full-time onsite personnel ensuring strict compliance with site-specific safety mandates and complex OSHA regulations.</p>
              </div>
              <div className="bg-[#030914] border border-slate-800 p-8 rounded-lg shadow-inner">
                <Activity className="w-8 h-8 text-[#ea1f27] mb-5" strokeWidth={1.5} />
                <h4 className="text-white font-black uppercase tracking-tight mb-3">Daily JHA Briefings</h4>
                <p className="text-slate-400 text-sm leading-relaxed">Every operational shift begins with a comprehensive Job Hazard Analysis, identifying and mitigating risks before tools are picked up.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* 8. HIGH-INTENT CONVERSION ANCHOR          */}
      {/* ========================================= */}
      <section className="relative z-20 bg-[#030914] py-24 lg:py-32 px-6 lg:px-12 border-b border-slate-800/80 shadow-inner">
        <div className="max-w-[1000px] mx-auto text-center flex flex-col items-center">
          <FileText className="w-12 h-12 text-[#0088ff] mb-6" strokeWidth={1.5} />
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white mb-6">
            Initiate Project <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ea1f27] via-[#a855f7] to-[#0088ff]">Review.</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mb-10">
            Submit blueprints, BIM models, and project specifications directly to our estimating team. We guarantee transparent bids with hard execution timelines.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <Link 
              href="/contact" 
              className="w-full sm:w-auto px-10 py-4 bg-[#ea1f27] hover:bg-[#d41920] text-white font-mono text-xs font-bold uppercase tracking-[0.15em] rounded-xs shadow-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-3"
            >
              Access Bid Gateway <ArrowRight className="w-4 h-4" />
            </Link>
            <span className="font-mono text-xs text-slate-500 font-bold uppercase tracking-widest mt-4 sm:mt-0">
              OR CALL: <a href={phoneHref} className="text-white hover:text-[#0088ff] transition-colors">{phoneDisplay}</a>
            </span>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/*  SITE FOOTER                            */}
      {/* ========================================= */}
      <Footer />

    </main>
  );
}