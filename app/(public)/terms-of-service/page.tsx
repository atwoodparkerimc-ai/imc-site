"use client";

import Link from "next/link";
import { ShieldCheck, Scale, FileText, ArrowLeft, Mail, Phone, MapPin, AlertTriangle } from "lucide-react";
import Footer from "@/components/footer";

export default function TermsOfServicePage() {
  const currentYear = new Date().getFullYear();

  return (
    <main className="w-full relative overflow-x-hidden bg-[#0b0f19] text-slate-100 font-sans selection:bg-[#0088ff] selection:text-white">
      
      {/* Background Grid Overlay */}
      <div className="absolute inset-0 z-0 tactical-graph-paper opacity-20 pointer-events-none" />

      {/* Header Section */}
      <section className="relative z-10 pt-24 pb-16 px-6 lg:px-12 border-b border-slate-800/80 bg-[#070a10]">
        <div className="max-w-[1000px] mx-auto">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 font-mono text-xs text-slate-400 hover:text-white mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Return to Main Console
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ea1f27]/10 border border-[#ea1f27]/30 text-[#ea1f27] font-mono text-[10px] font-bold tracking-[0.2em] uppercase rounded-xs mb-6">
            <Scale className="w-3.5 h-3.5" /> Contractual Framework & Agreements
          </div>

          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white mb-6">
            Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ea1f27] via-[#a855f7] to-[#0088ff]">Service.</span>
          </h1>

          <p className="font-mono text-xs text-slate-400 uppercase tracking-widest">
            Last Revised: August 2026 // Interwest Mechanical Contractors (IMC)
          </p>
        </div>
      </section>

      {/* Terms Content Body */}
      <section className="relative z-10 py-16 px-6 lg:px-12">
        <div className="max-w-[1000px] mx-auto space-y-12 text-slate-300 text-sm leading-relaxed">
          
          {/* Agreement to Terms */}
          <div className="bg-[#070a10] border border-slate-800 p-8 rounded-lg shadow-xl">
            <h2 className="text-white font-black text-xl uppercase tracking-tight mb-4 flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#0088ff]" /> 1. Acceptance of Terms
            </h2>
            <p className="mb-4">
              These Terms of Service ("Terms") constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("Client," "you"), and Interwest Mechanical Contractors ("Company," "we," "us"), concerning your access to and use of our website (<span className="text-white font-mono">interwestmechanical.com</span>) and our project bid submission portals.
            </p>
            <p>
              By accessing or using the Website, you agree that you have read, understood, and accept to be bound by all of these Terms. If you do not agree with all of these terms, you are expressly prohibited from using the site and must discontinue use immediately.
            </p>
          </div>

          {/* Intellectual Property Rights */}
          <div className="bg-[#070a10] border border-slate-800 p-8 rounded-lg shadow-xl">
            <h2 className="text-white font-black text-xl uppercase tracking-tight mb-4 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#a855f7]" /> 2. Intellectual Property Rights
            </h2>
            <p className="mb-4">
              Unless otherwise indicated, the Website and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Website (collectively, the "Content") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
            </p>
            <p>
              No Content may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever without our express prior written permission.
            </p>
          </div>

          {/* Project Bids & Specifications */}
          <div className="bg-[#070a10] border border-slate-800 p-8 rounded-lg shadow-xl">
            <h2 className="text-white font-black text-xl uppercase tracking-tight mb-4">
              3. Project Submissions & Bid Gateways
            </h2>
            <p className="mb-4">
              When you submit blueprints, architectural drawings, BIM files, or technical specifications through our digital portals or direct communication channels:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li>You warrant that you hold full authorization or ownership rights to transmit such structural data for estimating purposes.</li>
              <li>Estimates, proposals, and schedules generated by our team are subject to final engineering verification, site inspection, and execution of a formal master subcontract agreement.</li>
              <li>Digital transmissions are processed securely, but clients remain responsible for retaining master copies of all proprietary design assets.</li>
            </ul>
          </div>

          {/* Limitation of Liability */}
          <div className="bg-[#070a10] border border-slate-800 p-8 rounded-lg shadow-xl">
            <h2 className="text-white font-black text-xl uppercase tracking-tight mb-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-[#ea1f27]" /> 4. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by applicable law, in no event shall Interwest Mechanical Contractors, its directors, employees, or partners be liable for any indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the website or preliminary estimations, even if advised of the possibility of such damages.
            </p>
          </div>

          {/* Governing Law */}
          <div className="bg-[#070a10] border border-slate-800 p-8 rounded-lg shadow-xl">
            <h2 className="text-white font-black text-xl uppercase tracking-tight mb-4">
              5. Governing Law & Jurisdiction
            </h2>
            <p>
              These Terms shall be governed by and defined following the laws of the State of Utah. Interwest Mechanical Contractors and yourself irrevocably consent that the courts of Utah shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-[#030914] border border-slate-700 p-8 rounded-lg shadow-2xl">
            <h2 className="text-white font-black text-xl uppercase tracking-tight mb-4">
              6. Contact Information
            </h2>
            <p className="text-slate-400 text-xs mb-6">
              For questions, notices, or formal correspondence regarding these Terms of Service, contact our command center:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#0088ff] shrink-0 mt-1" />
                <div>
                  <strong className="text-white block uppercase mb-1">HQ Address</strong>
                  <span className="text-slate-400">221 W. 900 N. Unit 5<br />Springville, UT 84663</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#ea1f27] shrink-0 mt-1" />
                <div>
                  <strong className="text-white block uppercase mb-1">Direct Line</strong>
                  <a href="tel:8013605735" className="text-slate-300 hover:text-white transition-colors">(801) 360-5735</a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#0088ff] shrink-0 mt-1" />
                <div>
                  <strong className="text-white block uppercase mb-1">Email Dispatch</strong>
                  <a href="mailto:estimating@interwestmechanical.com" className="text-slate-300 hover:text-white transition-colors break-all">estimating@interwestmechanical.com</a>
                </div>
              </div>
            </div>
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