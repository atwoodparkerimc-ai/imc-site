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
  Loader2,
  Paperclip,
  X
} from 'lucide-react';

const PROJECT_TYPES = [
  "Sanitary & Process Piping",
  "Commercial HVAC",
  "Custom Fabrication",
  "Facility Maintenance",
  "Other"
];

const TIMELINES = [
  "Immediate / Expedited",
  "1 - 3 Months",
  "3 - 6 Months",
  "6+ Months"
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Tactical pill state
  const [selectedProjectType, setSelectedProjectType] = useState(PROJECT_TYPES[0]);
  const [selectedTimeline, setSelectedTimeline] = useState(TIMELINES[0]);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);

  // Decoupled contact variables to prevent automated spam bot scraping
  const phoneDisplay = ["(801)", "360-5735"].join(" ");
  const phoneHref = ["tel:8013605735"].join("");
  
  const domain = "interwestmechanical.com";
  const estimatingEmail = `estimating@${domain}`;
  const careersEmail = `careers@${domain}`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    formData.set("projectType", selectedProjectType);
    formData.set("timeline", selectedTimeline);

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
    <main className="w-full relative overflow-x-hidden bg-[#0b0f19] text-slate-100 font-sans selection:bg-[#0088ff] selection:text-white">
      
      {/* ========================================= */}
      {/* 1. HERO SECTION                           */}
      {/* ========================================= */}
      <section className="relative w-full pt-14 pb-8 sm:pt-20 sm:pb-12 flex items-center border-b border-slate-800/80 overflow-hidden">
        <div className="absolute inset-0 z-0 tactical-graph-paper opacity-30 pointer-events-none" />
        
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 w-full text-center">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-4xl mx-auto flex flex-col items-center"
          >
            <h1 className="text-[clamp(2.4rem,5.5vw,5.5rem)] font-black tracking-tighter uppercase leading-[0.95] text-white mb-4 sm:mb-5">
              Initiate a <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ea1f27] from-0% via-[#64748b]/80 via-50% to-[#0088ff] to-100%">
                Project Bid.
              </span>
            </h1>
            
            <p className="text-sm sm:text-base lg:text-xl text-slate-200 font-normal leading-relaxed max-w-3xl mx-auto">
              Whether you need a custom fabrication quote, specialized process piping, or a complete design-build mechanical system, our teams are ready. Reach out to the specific department below or submit a detailed project inquiry.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========================================= */}
      {/* 2. MAIN CONTACT & INQUIRY GRID            */}
      {/* ========================================= */}
      <section className="relative z-20 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 bg-[#070a10] border-b border-slate-800/80">
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
            <div className="bg-[#030914] p-6 sm:p-8 border border-slate-800 rounded-lg shadow-inner">
              <h3 className="text-lg sm:text-xl font-black text-white mb-5 flex items-center gap-2.5 uppercase tracking-tight">
                <Phone className="h-5 w-5 text-[#ea1f27]" /> Direct Lines
              </h3>
              
              <div className="space-y-5">
                {/* Estimating */}
                <div className="pb-4 border-b border-slate-800">
                  <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-2">
                    <HardHat className="h-4 w-4 text-[#ea1f27]" /> Estimating & Bids
                  </span>
                  <a 
                    href={phoneHref} 
                    className="font-mono text-lg sm:text-xl font-black text-white hover:text-[#ea1f27] transition-colors block mb-1.5"
                  >
                    {phoneDisplay}
                  </a>
                  <a 
                    href={`mailto:${estimatingEmail}`} 
                    className="inline-flex items-center gap-2.5 bg-[#070a10] border border-slate-800 hover:border-[#ea1f27]/50 px-3 py-1.5 rounded-xs font-mono text-xs sm:text-sm font-bold text-slate-300 hover:text-white transition-all no-underline break-all"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#ea1f27] shrink-0" />
                    {estimatingEmail}
                  </a>
                </div>

                {/* HR & Recruiting */}
                <div>
                  <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#0088ff]" /> HR & Recruiting
                  </span>
                  <a 
                    href={phoneHref} 
                    className="font-mono text-lg sm:text-xl font-black text-white hover:text-[#0088ff] transition-colors block mb-1.5"
                  >
                    {phoneDisplay}
                  </a>
                  <a 
                    href={`mailto:${careersEmail}`} 
                    className="inline-flex items-center gap-2.5 bg-[#070a10] border border-slate-800 hover:border-[#0088ff]/50 px-3 py-1.5 rounded-xs font-mono text-xs sm:text-sm font-bold text-slate-300 hover:text-white transition-all no-underline break-all"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#0088ff] shrink-0" />
                    {careersEmail}
                  </a>
                </div>
              </div>
            </div>

            {/* OPERATIONS & ENVIRONMENTS */}
            <div className="bg-[#030914] p-6 sm:p-8 border border-slate-800 rounded-lg shadow-inner flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white mb-5 flex items-center gap-2.5 uppercase tracking-tight">
                  <MapPin className="h-5 w-5 text-[#64748b]" /> Operations
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5">
                  {/* Utah HQ */}
                  <div className="bg-[#070a10] p-3.5 sm:p-4 border border-slate-800 rounded-xs group hover:border-[#64748b]/50 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 bg-[#ea1f27] rounded-none animate-pulse" />
                      <span className="text-[11px] font-mono font-bold text-[#ea1f27] uppercase tracking-wider">Headquarters</span>
                    </div>
                    <address className="not-italic text-slate-200 text-xs sm:text-sm font-mono leading-relaxed">
                      Springville, UT <br />
                      221 W. 900 N. Unit 5<br />
                      Springville, UT 84663
                    </address>
                  </div>

                  {/* South Carolina */}
                  <div className="bg-[#070a10] p-3.5 sm:p-4 border border-slate-800 rounded-xs group hover:border-[#64748b]/50 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 bg-slate-500 rounded-none" />
                      <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">SC OPERATIONS</span>
                    </div>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
                      Embedded facility contracts & specialized site operations.
                    </p>
                  </div>
                </div>
              </div>

              {/* Specialized Environments Tags */}
              <div className="pt-4 border-t border-slate-800">
                <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2.5">
                  <Droplets className="w-4 h-4 text-[#64748b]" /> Specialized Disciplines
                </span>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-[#070a10] border border-slate-800 text-slate-200 text-[11px] font-mono font-bold uppercase tracking-wider rounded-xs hover:border-[#ea1f27]/40 transition-colors">Food & Beverage</span>
                  <span className="px-2.5 py-1 bg-[#070a10] border border-slate-800 text-slate-200 text-[11px] font-mono font-bold uppercase tracking-wider rounded-xs hover:border-[#64748b]/40 transition-colors">High Purity</span>
                  <span className="px-2.5 py-1 bg-[#070a10] border border-slate-800 text-slate-200 text-[11px] font-mono font-bold uppercase tracking-wider rounded-xs hover:border-[#0088ff]/40 transition-colors">Industrial Mfg</span>
                </div>
              </div>
            </div>

          </motion.div>

          {/* RIGHT COLUMN: HIGH-PERFORMANCE STREAMLINED INQUIRY FORM (7 Cols) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="lg:col-span-7 bg-[#030914] p-5 sm:p-8 lg:p-9 border border-slate-800 rounded-lg shadow-inner relative flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tight text-white mb-0.5">
                  Project Inquiry
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm font-normal">
                  Fast-track submission for commercial bids & engineering scopes.
                </p>
              </div>
              <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xs bg-[#070a10] border border-slate-800">
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {submitted ? (
              <div className="p-8 bg-[#070a10] border border-slate-800 rounded-xs text-center space-y-3 shadow-inner my-auto">
                <CheckCircle2 className="w-10 h-10 text-[#0088ff] mx-auto" />
                <h3 className="text-lg font-bold text-white uppercase font-mono tracking-wider">
                  Message Sent Successfully
                </h3>
                <p className="text-slate-300 text-sm max-w-md mx-auto">
                  Your project details have been sent to our estimating department. A representative will be in touch shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Honeypot anti-bot trap */}
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

                {/* 2-Across Compact Contact Inputs on ALL devices */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label htmlFor="fullName" className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Full Name <span className="text-[#ea1f27]">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="fullName" 
                      name="fullName"
                      required
                      placeholder="John Doe" 
                      className="w-full bg-[#070a10] border border-slate-800 focus:border-[#0088ff] rounded-xs px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Company Name
                    </label>
                    <input 
                      type="text" 
                      id="company" 
                      name="company"
                      placeholder="Acme Industrial Corp" 
                      className="w-full bg-[#070a10] border border-slate-800 focus:border-[#0088ff] rounded-xs px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label htmlFor="phone" className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Phone Number <span className="text-[#ea1f27]">*</span>
                    </label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone"
                      required
                      placeholder="(555) 000-0000" 
                      className="w-full bg-[#070a10] border border-slate-800 focus:border-[#0088ff] rounded-xs px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Email Address <span className="text-[#ea1f27]">*</span>
                    </label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email"
                      required
                      placeholder="john@company.com" 
                      className="w-full bg-[#070a10] border border-slate-800 focus:border-[#0088ff] rounded-xs px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* 1-Tap Pill Chips: Project Type */}
                <div>
                  <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Project Discipline <span className="text-[#ea1f27]">*</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PROJECT_TYPES.map((type) => {
                      const isSelected = selectedProjectType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSelectedProjectType(type)}
                          className={`px-3 py-1.5 rounded-xs text-xs font-mono font-bold transition-all ${
                            isSelected
                              ? "bg-[#0088ff] text-white shadow-[0_0_12px_rgba(0,136,255,0.4)] border border-[#0088ff]"
                              : "bg-[#070a10] text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 1-Tap Pill Chips: Estimated Timeline */}
                <div>
                  <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Target Timeline
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {TIMELINES.map((time) => {
                      const isSelected = selectedTimeline === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTimeline(time)}
                          className={`px-3 py-1.5 rounded-xs text-xs font-mono font-bold transition-all ${
                            isSelected
                              ? "bg-slate-700 text-white border border-slate-500"
                              : "bg-[#070a10] text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Scope Description */}
                <div>
                  <label htmlFor="message" className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Scope Description & Specs
                  </label>
                  <textarea 
                    id="message"
                    name="message"
                    rows={2}
                    placeholder="Facility type, pipe class, or custom fabrication scope..."
                    className="w-full bg-[#070a10] border border-slate-800 focus:border-[#0088ff] rounded-xs px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Compact 1-Line File Attachment Button */}
                <div>
                  <div className="flex items-center gap-3">
                    <label 
                      htmlFor="file-upload" 
                      className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#070a10] hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold rounded-xs cursor-pointer transition-colors"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-[#0088ff]" />
                      <span>{attachedFileName ? "Change File" : "Attach Blueprints / Specs"}</span>
                      <input 
                        id="file-upload" 
                        name="file-upload" 
                        type="file" 
                        className="sr-only" 
                        onChange={handleFileChange}
                      />
                    </label>

                    {attachedFileName ? (
                      <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-[#070a10] px-2.5 py-1.5 rounded-xs border border-emerald-500/30">
                        <span className="truncate max-w-[150px]">{attachedFileName}</span>
                        <button 
                          type="button" 
                          onClick={() => setAttachedFileName(null)}
                          className="text-slate-400 hover:text-white ml-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                        PDF, DWG up to 50MB
                      </span>
                    )}
                  </div>
                </div>

                {errorMessage && (
                  <p className="text-xs font-mono text-[#ea1f27] font-bold">
                    {errorMessage}
                  </p>
                )}

                {/* Submit Row */}
                <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0088ff]" />
                    Encrypted Transmission
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full sm:w-auto rounded-xs bg-[#ea1f27] hover:bg-[#d41920] disabled:bg-slate-700 px-7 py-3 text-xs font-mono font-bold uppercase tracking-[0.15em] text-white shadow-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Transmitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Submit Bid Request
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
      {/* 3. MAP SECTION                            */}
      {/* ========================================= */}
      <section className="relative z-20 py-12 sm:py-16 bg-[#02060d] border-b border-slate-800/80 overflow-hidden">
        <div className="absolute inset-0 z-0 tactical-graph-paper opacity-30 pointer-events-none" />

        <div className="w-full px-4 sm:px-6 lg:px-12 relative z-10">
          <OperationalMap />
        </div>
      </section>

      {/* ========================================= */}
      {/* 4. SITE FOOTER                            */}
      {/* ========================================= */}
      <Footer />

    </main>
  );
}