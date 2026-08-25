"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import PartnerTicker from "@/components/logo-ticker";
import AtAGlance from "@/components/at-a-glance";
import CapabilitiesConsole from "@/components/capabilities-console";
import Footer from "@/components/footer";
import { 
  ShieldAlert, 
  CheckCircle2, 
  Settings2, 
  Factory, 
  MapPin,
  ChevronDown
} from "lucide-react";

export default function AboutPage() {
  return (
    <main className="w-full relative overflow-x-hidden bg-[#0b0f19] text-slate-100 font-sans selection:bg-red-500 selection:text-white">
      
      {/* ========================================= */}
      {/* 1. HERO SECTION (FULL-BLEED CENTERED STATEMENT) */}
      {/* ========================================= */}
      <section className="relative w-full pt-28 pb-16 lg:pt-36 lg:pb-24 flex items-center border-b border-slate-800/80 overflow-hidden">
        <div className="absolute inset-0 z-0 tactical-graph-paper opacity-30 pointer-events-none" />
        
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 w-full text-center">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-4xl mx-auto flex flex-col items-center"
          >

            <h1 className="text-[clamp(2.5rem,5.5vw,5.5rem)] font-black tracking-tighter uppercase leading-[0.95] text-white mb-8">
              Willing to do what <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ea1f27] from-[18%] via-[#a855f7] via-[50%] to-[#0088ff] to-[82%]">
                others won't.
              </span>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-slate-300 font-normal leading-relaxed max-w-3xl mx-auto mb-10">
              Established in 1995, Interwest Mechanical Contractors (IMC) was built on a simple premise: helping clients accomplish all goals, willing to do what others won't. We don't just build systems; we build the foundation of heavy industry.
            </p>

            {/* Direct Viewport Jump Action */}
            <Link 
              href="#capabilities" 
              className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.15em] text-slate-400 hover:text-white transition-colors duration-200"
            >
              <span>Explore Capabilities</span>
              <ChevronDown className="w-4 h-4 text-[#ea1f27] animate-bounce" />
            </Link>

          </motion.div>
        </div>
      </section>

      {/* ========================================= */}
      {/* 2. LEGACY & FOOTPRINT */}
      {/* ========================================= */}
      <section className="relative z-20 py-20 px-6 lg:px-12 bg-[#070a10] border-b border-slate-800/80">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h3 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mb-6">
              Built on Field Experience.
            </h3>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8">
              Owned and operated by the Beckstrom Family, IMC is led by personnel who came up through the trades. We understand the reality of the field because we have lived it. We treat our reputation as our most valuable asset, ensuring that leadership is directly involved in the success of every installation.
            </p>

            <div className="flex items-start gap-6 p-6 bg-[#030914] border border-slate-800 rounded-lg shadow-inner">
              <MapPin className="w-7 h-7 text-[#ea1f27] shrink-0 mt-1" />
              <div>
                <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                  Operational Reach
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Headquartered in <strong className="text-white font-semibold">Springville, UT</strong>. We actively service facilities across Utah and maintain embedded in long-term operations throughout several other states.
                </p>
              </div>
            </div>
          </motion.div>

          {/* CLEAN IMAGE HOLDER FOR HQ PHOTO */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="relative w-full h-[400px] lg:h-[450px] rounded-lg overflow-hidden border border-slate-800 bg-[#030914] flex items-center justify-center shadow-2xl group"
          >
            <div className="absolute inset-0 tactical-graph-paper opacity-20 pointer-events-none" />
            <Factory className="w-24 h-24 text-slate-800 group-hover:text-slate-700 transition-colors" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070a10]/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/5 pointer-events-none rounded-lg" />
          </motion.div>

        </div>
      </section>

      {/* ========================================= */}
      {/* 3. THE IMC DNA / CORE VALUES */}
      {/* ========================================= */}
      <section className="relative z-20 py-20 px-6 lg:px-12 bg-[#070a10] border-t border-b border-slate-800/80">
        <div className="max-w-[1400px] mx-auto">
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mb-14 max-w-2xl"
          >
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mb-4">
              The IMC DNA
            </h2>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
              The blueprints only get you so far. The success of a complex mechanical install comes down to the grit, experience, and integrity of the people executing it.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: Total Control (Red) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
              className="bg-[#030914] p-8 sm:p-10 border border-slate-800 rounded-lg shadow-inner group hover:border-[#ea1f27]/60 transition-all duration-300 relative flex flex-col justify-between"
            >
              <div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-md bg-[#070a10] border border-slate-800 shadow-inner">
                  <Settings2 className="w-6 h-6 text-[#ea1f27]" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-white mb-3">
                  Total Control
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed font-normal">
                  We take control of the entire fabrication process. By building critical components in our Springville shop, we eliminate third-party delays and strictly manage quality control.
                </p>
              </div>
            </motion.div>

            {/* Card 2: Unconventional Solutions (Purple) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
              className="bg-[#030914] p-8 sm:p-10 border border-slate-800 rounded-lg shadow-inner group hover:border-[#a855f7]/60 transition-all duration-300 relative flex flex-col justify-between"
            >
              <div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-md bg-[#070a10] border border-slate-800 shadow-inner">
                  <ShieldAlert className="w-6 h-6 text-[#a855f7]" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-white mb-3">
                  Unconventional Solutions
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed font-normal">
                  Industrial challenges rarely fit into a standard box. We pride ourselves on out of the box thinking & solutions to engineer mechanical systems that standard contractors walk away from.
                </p>
              </div>
            </motion.div>

            {/* Card 3: Decades of Execution (Blue) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.25 }}
              className="bg-[#030914] p-8 sm:p-10 border border-slate-800 rounded-lg shadow-inner group hover:border-[#0088ff]/60 transition-all duration-300 relative flex flex-col justify-between"
            >
              <div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-md bg-[#070a10] border border-slate-800 shadow-inner">
                  <CheckCircle2 className="w-6 h-6 text-[#0088ff]" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-white mb-3">
                  Decades of Execution
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed font-normal">
                  We bring many years of experience to the table. From high-pressure steam to pristine cleanrooms, our crews have successfully navigated the most stringent environments in manufacturing.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* 4. CORE CAPABILITIES (INTERACTIVE BLUEPRINT WORKSTATION) */}
      {/* ========================================= */}
      <section id="capabilities" className="relative z-20 py-24 px-6 lg:px-12 border-b border-slate-800/80 overflow-hidden">
        <div className="absolute inset-0 z-0 tactical-graph-paper opacity-30 pointer-events-none" />

        <div className="max-w-[1400px] mx-auto relative z-10 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-3xl text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-[1.02] mb-5">
              Built for Heavy <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ea1f27] from-[18%] via-[#a855f7] via-[50%] to-[#0088ff] to-[82%]">
                Industrial Demands.
              </span>
            </h2>
            <p className="text-slate-300 font-normal text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
              Check our mechanical scope, material capabilities, and union craftsmanship.
            </p>
          </motion.div>

          <CapabilitiesConsole />
        </div>
      </section>

      {/* ========================================= */}
      {/* 5. THE PROOF IS IN THE PARTNERSHIP */}
      {/* ========================================= */}
      <section className="relative w-full pt-28 pb-20 bg-[#02060d] overflow-hidden border-t border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_35%,_var(--tw-gradient-stops))] from-[#072456]/80 via-[#020b1a]/95 to-[#02060d] pointer-events-none" />
        <div 
          className="absolute inset-0 pointer-events-none opacity-20" 
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(0, 136, 255, 0.25) 1px, transparent 1px)',
            backgroundSize: '25% 100%',
            backgroundPosition: 'center'
          }}
        />

        <div className="relative z-10 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-4xl mx-auto px-6 lg:px-12 text-center mb-14"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-[1.05] mb-5">
              The Proof is in <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ea1f27] from-[18%] via-[#a855f7] via-[50%] to-[#0088ff] to-[82%]">
                The Partnership.
              </span>
            </h2>
            <p className="text-slate-400 font-normal text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
              Operating with a dedicated workforce across all locations, we have the manpower and operational scale to execute complex scopes safely and efficiently.
            </p>
          </motion.div>

          <div className="w-full mb-12">
            <AtAGlance />
          </div>

          <div className="w-full pt-6 border-t border-slate-800/40">
            <PartnerTicker />
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* 6. CTA BANNER */}
      {/* ========================================= */}
      <section className="relative z-20 py-20 px-6 lg:px-12 border-t border-slate-800/80 overflow-hidden">
        <div className="absolute inset-0 z-0 tactical-graph-paper opacity-30 pointer-events-none" />

        <div className="max-w-[1400px] mx-auto relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
          
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-3">
              Ready to break ground?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
              Get an overview of what we are capable of helping with. Submit your project specifications or blueprints, and our estimating team will get back to you with a comprehensive, transparent bid.
            </p>
          </div>

          <div className="flex-shrink-0 w-full sm:w-auto">
            <Link 
              href="/contact" 
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-[#ea1f27] hover:bg-[#d41920] text-white text-xs font-mono font-bold uppercase tracking-[0.15em] rounded-lg shadow-lg transition-all duration-200 active:scale-[0.98] text-center"
            >
              Request a Bid
            </Link>
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