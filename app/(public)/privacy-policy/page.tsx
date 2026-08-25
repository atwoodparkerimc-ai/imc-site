"use client";

import Link from "next/link";
import { ShieldCheck, Lock, FileText, ArrowLeft, Mail, Phone, MapPin } from "lucide-react";
import Footer from "@/components/footer";

export default function PrivacyPolicyPage() {
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

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0088ff]/10 border border-[#0088ff]/30 text-[#0088ff] font-mono text-[10px] font-bold tracking-[0.2em] uppercase rounded-xs mb-6">
            <ShieldCheck className="w-3.5 h-3.5" /> Legal Framework & Compliance
          </div>

          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white mb-6">
            Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ea1f27] via-[#a855f7] to-[#0088ff]">Policy.</span>
          </h1>

          <p className="font-mono text-xs text-slate-400 uppercase tracking-widest">
            Last Revised: August 2026 // Interwest Mechanical Contractors (IMC)
          </p>
        </div>
      </section>

      {/* Policy Content Body */}
      <section className="relative z-10 py-16 px-6 lg:px-12">
        <div className="max-w-[1000px] mx-auto space-y-12 text-slate-300 text-sm leading-relaxed">
          
          {/* Introduction */}
          <div className="bg-[#070a10] border border-slate-800 p-8 rounded-lg shadow-xl">
            <h2 className="text-white font-black text-xl uppercase tracking-tight mb-4 flex items-center gap-3">
              <Lock className="w-5 h-5 text-[#0088ff]" /> 1. General Overview & Scope
            </h2>
            <p className="mb-4">
              Interwest Mechanical Contractors ("Company," "we," "us," and "our") respects your privacy and is committed to protecting it through our compliance with this Privacy Policy. This Policy describes the types of information we may collect from you or that you may provide when you visit our website at <span className="text-white font-mono">interwestmechanical.com</span> (our "Website") and our practices for collecting, using, maintaining, protecting, and disclosing that information.
            </p>
            <p>
              Please read this Policy carefully to understand our policies and practices regarding your information. If you do not agree with our policies and practices, do not use our Website. By accessing or using our Website, you accept this Privacy Policy.
            </p>
          </div>

          {/* Information We Collect */}
          <div className="bg-[#070a10] border border-slate-800 p-8 rounded-lg shadow-xl">
            <h2 className="text-white font-black text-xl uppercase tracking-tight mb-4 flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#a855f7]" /> 2. Information We Collect
            </h2>
            <p className="mb-4">
              We collect several types of information from and about users of our Website, including information:
            </p>
            <ul className="list-disc pl-5 space-y-2 font-mono text-xs text-slate-400">
              <li><strong className="text-white">Personal Identifiers:</strong> By which you may be personally identified, such as name, corporate email address, postal address, and telephone number provided via project bid submissions or contact forms.</li>
              <li><strong className="text-white">Technical Data & Project Assets:</strong> Information about your internet connection, the equipment you use to access our Website, usage details, blueprints, specifications, and CAD/BIM attachments uploaded through our secure bid gateway.</li>
              <li><strong className="text-white">Usage Details:</strong> Automatic data collection technologies to capture traffic data, logs, and communication data when interacting with our digital interfaces.</li>
            </ul>
          </div>

          {/* How We Use Your Information */}
          <div className="bg-[#070a10] border border-slate-800 p-8 rounded-lg shadow-xl">
            <h2 className="text-white font-black text-xl uppercase tracking-tight mb-4">
              3. How We Use Your Information
            </h2>
            <p className="mb-4">
              We use information that we collect about you or that you provide to us, including any personal information:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li>To present our Website and its contents directly to you.</li>
              <li>To process industrial project inquiries, compute transparent bids, and coordinate estimation timelines through our Utah command center.</li>
              <li>To notify you about changes to our Website or any products or services we offer.</li>
              <li>To fulfill any other purpose for which you provide it or with your explicit consent.</li>
            </ul>
          </div>

          {/* Security & Safeguards */}
          <div className="bg-[#070a10] border border-slate-800 p-8 rounded-lg shadow-xl">
            <h2 className="text-white font-black text-xl uppercase tracking-tight mb-4">
              4. Safeguarding Information & Data Security
            </h2>
            <p>
              We implement reasonable technical, administrative, and physical safeguards designed to protect your Personal Information and proprietary project blueprints against accidental loss and unauthorized access, use, alteration, or disclosure. However, no electronic transmission over the internet or storage technology can be guaranteed 100% secure. Transmission of personal data is at your own risk.
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-[#030914] border border-slate-700 p-8 rounded-lg shadow-2xl">
            <h2 className="text-white font-black text-xl uppercase tracking-tight mb-4">
              5. How to Contact Us
            </h2>
            <p className="text-slate-400 text-xs mb-6">
              To ask questions or comment about this Privacy Policy and our privacy practices, contact us directly through our headquarters:
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
      {/* 9. SITE FOOTER                            */}
      {/* ========================================= */}
      <Footer />

    </main>
  );
}