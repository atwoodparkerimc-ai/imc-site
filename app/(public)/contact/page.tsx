"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import OperationalMap from "@/components/operational-map";
import Footer from "@/components/footer";
import { 
  Phone, 
  MapPin, 
  HardHat, 
  FileText, 
  Droplets, 
  ArrowRight, 
  CheckCircle2, 
  Send,
  Mail,
  Loader2
} from 'lucide-react';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Obfuscated contact variables to prevent automated spam bot scraping
  const phoneDisplay = ["(801)", "360-5735"].join(" ");
  const phoneHref = ["tel:8013605735"].join("");
  
  const domain = "interwestmechanical.com";
  const estimatingEmail = `estimating@${domain}`;
  const careersEmail = `careers@${domain}`;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to submit inquiry. Please call our direct line.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="w-full relative overflow-x-hidden bg-[#0b0f19] text-slate-100 font-sans selection:bg-red-500 selection:text-white">
      
      {/* ========================================= */}
      {/* 1. HERO SECTION                           */}
      {/* ========================================= */}
      <section className="relative w-full pt-16 pb-10 lg:pt-20 lg:pb-12 flex items-center border-b border-slate-800/80 overflow-hidden">
        <div className="absolute inset-0 z-0 tactical-graph-paper opacity-30 pointer-events-none" />
        
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 w-full text-center">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-4xl mx-auto flex flex-col items-center"
          >
            <h1 className="text-[clamp(2.5rem,5.5vw,5.5rem)] font-black tracking-tighter uppercase leading-[0.95] text-white mb-5">
              Initiate a <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ea1f27] from-[18%] via-[#a855f7] via-[50%] to-[#0088ff] to-[82%]">
                Project Bid.
              </span>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-slate-200 font-normal leading-relaxed max-w-3xl mx-auto">
              Whether you need a custom fabrication quote, specialized process piping, or a complete design-build mechanical system, our teams are ready. Reach out to the specific department below or submit a detailed project inquiry.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========================================= */}
      {/* 2. MAIN CONTACT & INQUIRY GRID            */}
      {/* ========================================= */}
      <section className="relative z-20 py-16 px-6 lg:px-12 bg-[#070a10] border-b border-slate-800/80">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* LEFT COLUMN: DIRECT LINES & OPERATIONS (5 Cols) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-5 flex flex-col justify-between gap-6"
          >
            
            {/* DIRECT LINES */}
            <div className="bg-[#0b1324] p-7 sm:p-8 border border-slate-700/80 rounded-lg shadow-xl">
              <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2.5 uppercase tracking-tight">
                <Phone className="h-5 w-5 text-[#ea1f27]" /> Direct Lines
              </h3>
              
              <div className="space-y-6">
                {/* Estimating */}
                <div className="pb-5 border-b border-slate-700/80">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block mb-1 flex items-center gap-2">
                    <HardHat className="h-4 w-4 text-[#0088ff]" /> Estimating & Bids
                  </span>
                  <a 
                    href={phoneHref} 
                    className="font-mono text-xl font-black text-white hover:text-[#0088ff] transition-colors block mb-2"
                  >
                    {phoneDisplay}
                  </a>
                  <a 
                    href={`mailto:${estimatingEmail}`} 
                    className="inline-flex items-center gap-2.5 bg-[#070d19] border border-slate-600 hover:border-[#0088ff] px-3.5 py-2 rounded-md font-mono text-sm font-bold text-white hover:text-[#0088ff] transition-all no-underline break-all"
                  >
                    <Mail className="w-4 h-4 text-[#0088ff] shrink-0" />
                    {estimatingEmail}
                  </a>
                </div>

                {/* HR & Recruiting */}
                <div>
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block mb-1 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#0088ff]" /> HR & Recruiting
                  </span>
                  <a 
                    href={phoneHref} 
                    className="font-mono text-xl font-black text-white hover:text-[#0088ff] transition-colors block mb-2"
                  >
                    {phoneDisplay}
                  </a>
                  <a 
                    href={`mailto:${careersEmail}`} 
                    className="inline-flex items-center gap-2.5 bg-[#070d19] border border-slate-600 hover:border-[#0088ff] px-3.5 py-2 rounded-md font-mono text-sm font-bold text-white hover:text-[#0088ff] transition-all no-underline break-all"
                  >
                    <Mail className="w-4 h-4 text-[#0088ff] shrink-0" />
                    {careersEmail}
                  </a>
                </div>
              </div>
            </div>

            {/* OPERATIONS & ENVIRONMENTS */}
            <div className="bg-[#0b1324] p-7 sm:p-8 border border-slate-700/80 rounded-lg shadow-xl flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2.5 uppercase tracking-tight">
                  <MapPin className="h-5 w-5 text-[#0088ff]" /> Operations
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {/* Utah HQ */}
                  <div className="bg-[#070d19] p-4 border border-slate-700 rounded-md">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-2 h-2 bg-[#ea1f27] rounded-none animate-pulse" />
                      <span className="text-xs font-mono font-bold text-[#ea1f27] uppercase tracking-wider">Headquarters</span>
                    </div>
                    <address className="not-italic text-white text-sm font-mono leading-relaxed">
                      Springville, UT <br />
                      221 W. 900 N. Unit 5<br />
                      Springville, UT 84663
                    </address>
                  </div>

                  {/* South Carolina */}
                  <div className="bg-[#070d19] p-4 border border-slate-700 rounded-md">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-2 h-2 bg-slate-300 rounded-none" />
                      <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">SC OPERATIONS</span>
                    </div>
                    <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-normal">
                      Embedded facility contracts & specialized site operations.
                    </p>
                  </div>
                </div>
              </div>

              {/* Specialized Environments Tags */}
              <div className="pt-4 border-t border-slate-700/80">
                <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Droplets className="w-4 h-4 text-[#0088ff]" /> Specialized Disciplines
                </span>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-[#070d19] border border-slate-700 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-md">Food & Beverage</span>
                  <span className="px-3 py-1.5 bg-[#070d19] border border-slate-700 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-md">High Purity</span>
                  <span className="px-3 py-1.5 bg-[#070d19] border border-slate-700 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-md">Industrial Mfg</span>
                </div>
              </div>
            </div>

          </motion.div>

          {/* RIGHT COLUMN: HIGH-CONTRAST PROJECT INQUIRY FORM (7 Cols) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="lg:col-span-7 bg-[#0b1324] p-7 sm:p-9 border border-slate-700/80 rounded-lg shadow-2xl relative flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 pointer-events-none hidden sm:block">
              <div className="px-3.5 py-1 bg-[#ea1f27]/20 border border-[#ea1f27]/50 text-[#ea1f27] font-mono text-xs font-bold uppercase tracking-wider rounded-xs">
                Secure Bid Gateway
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-1">
                  Project Inquiry
                </h2>
                <p className="text-slate-200 text-sm sm:text-base font-normal">
                  Submit details below for direct estimator review. Transparent bids with hard timelines.
                </p>
              </div>
              <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-md bg-[#070d19] border border-slate-700">
                <ArrowRight className="w-5 h-5 text-slate-200" />
              </div>
            </div>

            {submitted ? (
              <div className="p-8 bg-[#070d19] border border-slate-700 rounded-md text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white uppercase font-mono tracking-wider">
                  Inquiry Transmitted Successfully
                </h3>
                <p className="text-slate-300 text-sm max-w-md mx-auto">
                  Your project details have been routed directly to our estimating department. A representative will be in touch shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Invisible Honeypot to catch automated spam bots */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="website_lead_verify">Do not fill this out if human</label>
                  <input 
                    type="text" 
                    id="website_lead_verify" 
                    name="website_lead_verify" 
                    tabIndex={-1} 
                    autoComplete="off" 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="first-name" className="block text-xs font-mono font-bold uppercase tracking-wider text-white mb-2">
                      First Name <span className="text-[#ea1f27]">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="first-name" 
                      name="firstName"
                      required
                      placeholder="John" 
                      className="w-full bg-[#070d19] border border-slate-600 focus:border-[#0088ff] rounded-md px-4 py-3 text-base text-white placeholder:text-slate-400 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="last-name" className="block text-xs font-mono font-bold uppercase tracking-wider text-white mb-2">
                      Last Name <span className="text-[#ea1f27]">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="last-name" 
                      name="lastName"
                      required
                      placeholder="Doe" 
                      className="w-full bg-[#070d19] border border-slate-600 focus:border-[#0088ff] rounded-md px-4 py-3 text-base text-white placeholder:text-slate-400 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="company" className="block text-xs font-mono font-bold uppercase tracking-wider text-white mb-2">
                      Company Name
                    </label>
                    <input 
                      type="text" 
                      id="company" 
                      name="company"
                      placeholder="Acme Industrial Corp" 
                      className="w-full bg-[#070d19] border border-slate-600 focus:border-[#0088ff] rounded-md px-4 py-3 text-base text-white placeholder:text-slate-400 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-xs font-mono font-bold uppercase tracking-wider text-white mb-2">
                      Phone Number <span className="text-[#ea1f27]">*</span>
                    </label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone"
                      required
                      placeholder="(555) 000-0000" 
                      className="w-full bg-[#070d19] border border-slate-600 focus:border-[#0088ff] rounded-md px-4 py-3 text-base text-white placeholder:text-slate-400 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-mono font-bold uppercase tracking-wider text-white mb-2">
                    Email Address <span className="text-[#ea1f27]">*</span>
                  </label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email"
                    required
                    placeholder="john.doe@company.com" 
                    className="w-full bg-[#070d19] border border-slate-600 focus:border-[#0088ff] rounded-md px-4 py-3 text-base text-white placeholder:text-slate-400 focus:outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="project-type" className="block text-xs font-mono font-bold uppercase tracking-wider text-white mb-2">
                      Project Type
                    </label>
                    <select 
                      id="project-type" 
                      name="projectType"
                      className="w-full bg-[#070d19] border border-slate-600 focus:border-[#0088ff] rounded-md px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                    >
                      <option value="Sanitary & Process Piping">Sanitary & Process Piping</option>
                      <option value="Heavy Commercial HVAC">Heavy Commercial HVAC</option>
                      <option value="Off-Site Custom Fabrication">Off-Site Custom Fabrication</option>
                      <option value="Facility Maintenance Contract">Facility Maintenance Contract</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="timeline" className="block text-xs font-mono font-bold uppercase tracking-wider text-white mb-2">
                      Estimated Timeline
                    </label>
                    <select 
                      id="timeline" 
                      name="timeline"
                      className="w-full bg-[#070d19] border border-slate-600 focus:border-[#0088ff] rounded-md px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                    >
                      <option value="Immediate / Expedited">Immediate / Expedited</option>
                      <option value="1 - 3 Months">1 - 3 Months</option>
                      <option value="3 - 6 Months">3 - 6 Months</option>
                      <option value="6+ Months / Planning Phase">6+ Months / Planning Phase</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-mono font-bold uppercase tracking-wider text-white mb-2">
                    Project Description & Specs
                  </label>
                  <textarea 
                    id="message"
                    name="message"
                    rows={3}
                    placeholder="Scope, facility type, and material requirements (e.g., 316L Stainless, Copper, Carbon Steel)."
                    className="w-full bg-[#070d19] border border-slate-600 focus:border-[#0088ff] rounded-md px-4 py-3 text-base text-white placeholder:text-slate-400 focus:outline-none transition-colors resize-none"
                  />
                </div>

                <div>
                  <label htmlFor="file-upload" className="block text-xs font-mono font-bold uppercase tracking-wider text-white mb-2">
                    Attach Blueprints or Specs (Optional)
                  </label>
                  <div className="border border-dashed border-slate-500 bg-[#070d19] rounded-md p-4 text-center hover:border-[#0088ff] transition-colors cursor-pointer group">
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-200 font-medium">
                      <FileText className="w-5 h-5 text-slate-300 group-hover:text-[#0088ff] transition-colors" />
                      <span><strong className="text-[#0088ff]">Upload file</strong> or drag and drop (PDF, DWG up to 50MB)</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                    </div>
                  </div>
                </div>

                {errorMessage && (
                  <p className="text-xs font-mono text-[#ea1f27] font-bold">
                    {errorMessage}
                  </p>
                )}

                <div className="pt-4 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-slate-200 text-xs font-mono">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    Secure SSL Encrypted Transmission
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full sm:w-auto rounded-md bg-[#ea1f27] hover:bg-[#d41920] disabled:bg-slate-700 px-8 py-3.5 text-xs font-mono font-bold uppercase tracking-[0.15em] text-white shadow-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Transmitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Inquiry
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}
          </motion.div>

        </div>
      </section>

      {/* ========================================= */}
      {/* 3. MAP ONLY (NO HEADER)                   */}
      {/* ========================================= */}
      <section className="relative z-20 py-16 bg-[#02060d] border-b border-slate-800/80 overflow-hidden">
        <div className="absolute inset-0 z-0 tactical-graph-paper opacity-30 pointer-events-none" />

        <div className="w-full px-6 lg:px-12 relative z-10">
          <OperationalMap />
        </div>
      </section>

      {/* ========================================= */}
      {/*  SITE FOOTER                              */}
      {/* ========================================= */}
      <Footer />

    </main>
  );
}