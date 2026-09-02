"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Send, MapPin, CheckCircle2, Loader2 } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Obfuscated contact variables to prevent automated spam bot scraping
  const phoneDisplay = ["(801)", "360-5735"].join(" ");
  const phoneHref = ["tel:8013605735"].join("");
  const emailUser = "estimating";
  const emailDomain = "interwestmechanical.com";
  const emailAddress = `${emailUser}@${emailDomain}`;

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
        throw new Error("Failed to send message. Please call our direct line.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while sending.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="relative w-full bg-[#030914] border-t border-slate-800/80 overflow-hidden text-slate-300 font-sans selection:bg-[#ea1f27] selection:text-white">
      {/* Background Tactical Grid */}
      <div className="absolute inset-0 z-0 tactical-graph-paper opacity-20 pointer-events-none" />

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 pt-16 lg:pt-20 pb-16 lg:pb-12">
        {/* Main 3-Column Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pb-12 items-stretch">
          
          {/* COLUMN 1: Brand, Address, Direct Comm (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              {/* Top Row: Logo & Address Side-by-Side on Mobile */}
              <div className="flex flex-row items-center justify-between gap-4 mb-6 lg:mb-0 lg:block">
                {/* Scaled Official IMC Logo */}
                <Link href="/" className="inline-block lg:mb-10 shrink-0 active:scale-95 transition-transform touch-manipulation">
                  <Image
                    src="/imclogo.svg"
                    alt="Interwest Mechanical Contractors Logo"
                    width={280}
                    height={80}
                    className="h-12 sm:h-16 lg:h-20 w-auto object-contain"
                    priority
                  />
                </Link>

                {/* Physical Shop Location */}
                <div className="lg:mb-8 text-right lg:text-left">
                  <span className="text-xs sm:text-base font-mono font-bold uppercase tracking-[0.2em] text-white block mb-1 lg:mb-2 flex items-center justify-end lg:justify-start gap-1.5 lg:gap-2">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#0088ff] shrink-0" /> National HQ 
                  </span>
                  <address className="not-italic font-mono text-xs sm:text-sm text-slate-200 leading-relaxed">
                    221 W. 900 N. Unit 5<br />
                    Springville, UT 84663
                  </address>
                </div>
              </div>

              {/* Direct Communication Channels */}
              <div className="space-y-4 pt-2 lg:pt-0">
                <div>
                  <span className="text-[12px] sm:text-[13px] font-mono font-bold uppercase tracking-[0.2em] text-[#ea1f27] block mb-1">
                    Phone
                  </span>
                  <a 
                    href={phoneHref} 
                    className="inline-block py-1 font-mono text-base font-black tracking-wide text-white hover:text-[#0088ff] active:text-[#0088ff] active:scale-95 transition-all touch-manipulation"
                  >
                    {phoneDisplay}
                  </a>
                </div>

                <div>
                  <span className="text-[12px] sm:text-[13px] font-mono font-bold uppercase tracking-[0.2em] text-[#0088ff] block mb-1">
                    Email
                  </span>
                  <a 
                    href={`mailto:${emailAddress}`} 
                    className="inline-block py-1 font-mono text-sm text-slate-200 hover:text-white active:text-[#0088ff] underline decoration-slate-600 hover:decoration-white underline-offset-4 transition-colors break-all touch-manipulation"
                  >
                    {emailAddress}
                  </a>
                </div>
              </div>
            </div>

            {/* Desktop Only: Copyright */}
            <div className="hidden lg:block pt-6 border-t border-slate-800/60 font-mono text-[11px] text-slate-400 whitespace-nowrap mt-8">
              <p className="text-slate-300">
                &copy; {currentYear} Interwest Mechanical Contractors. All Rights Reserved.
              </p>
            </div>
          </div>

          {/* COLUMN 2: Tactical Matrix & Legal Links (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between items-center lg:items-start">
            <div className="w-full max-w-xs sm:max-w-sm lg:max-w-md">
              
              {/* Header Lockup: Centered on Mobile, Left-Aligned on Desktop */}
              <div className="mb-8 lg:mb-10 flex items-center justify-center lg:justify-start w-full">
                <div className="inline-flex items-center gap-2.5 sm:gap-3.5 font-black uppercase text-lg sm:text-2xl leading-none">
                  <span className="text-slate-500 tracking-[0.2em] sm:tracking-[0.24em]">BUILDERS</span>
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-slate-300 text-white text-[10px] sm:text-xs font-sans font-black flex items-center justify-center shrink-0 shadow-sm">
                    OF
                  </span>
                  <span className="text-[#ea1f27] tracking-[0.2em] sm:tracking-[0.24em] -mr-[0.2em] sm:-mr-[0.24em]">
                    INDUSTRY
                  </span>
                </div>
              </div>

              {/* Matrix Grid: Left-aligned text columns centered as a block in the viewport */}
              <div className="grid grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-6 sm:gap-y-8 font-mono text-xs w-full text-left">
                
                {/* Row 1 */}
                <div>
                  <span className="text-[11px] sm:text-[12px] font-bold uppercase tracking-widest text-slate-500 block mb-2 sm:mb-2.5">
                    Structural
                  </span>
                  <ul className="space-y-0.5 text-slate-300">
                    <li><Link href="/what-we-do" className="inline-block py-1.5 hover:text-white active:text-[#0088ff] transition-colors touch-manipulation">Custom Skids</Link></li>
                    <li><Link href="/what-we-do" className="inline-block py-1.5 hover:text-white active:text-[#0088ff] transition-colors touch-manipulation">Pipe Spool Fab</Link></li>
                    <li><Link href="/what-we-do" className="inline-block py-1.5 hover:text-white active:text-[#0088ff] transition-colors touch-manipulation">Heavy Ductwork</Link></li>
                  </ul>
                </div>

                <div>
                  <span className="text-[11px] sm:text-[12px] font-bold uppercase tracking-widest text-slate-500 block mb-2 sm:mb-2.5">
                    Sectors
                  </span>
                  <ul className="space-y-0.5 text-slate-300">
                    <li><Link href="/what-we-do" className="inline-block py-1.5 hover:text-white active:text-[#0088ff] transition-colors touch-manipulation">Biopharma</Link></li>
                    <li><Link href="/what-we-do" className="inline-block py-1.5 hover:text-white active:text-[#0088ff] transition-colors touch-manipulation">Food & Beverage</Link></li>
                    <li><Link href="/what-we-do" className="inline-block py-1.5 hover:text-white active:text-[#0088ff] transition-colors touch-manipulation">Industrial Mfg</Link></li>
                  </ul>
                </div>

                {/* Row 2 */}
                <div>
                  <span className="text-[11px] sm:text-[12px] font-bold uppercase tracking-widest text-slate-500 block mb-2 sm:mb-2.5">
                    Atmospheric
                  </span>
                  <ul className="space-y-0.5 text-slate-300">
                    <li><Link href="/what-we-do" className="inline-block py-1.5 hover:text-white active:text-[#0088ff] transition-colors touch-manipulation">Cleanroom HVAC</Link></li>
                    <li><Link href="/what-we-do" className="inline-block py-1.5 hover:text-white active:text-[#0088ff] transition-colors touch-manipulation">Central Plants</Link></li>
                    <li><Link href="/what-we-do" className="inline-block py-1.5 hover:text-white active:text-[#0088ff] transition-colors touch-manipulation">Industrial Exhaust</Link></li>
                  </ul>
                </div>

                <div>
                  <span className="text-[11px] sm:text-[12px] font-bold uppercase tracking-widest text-slate-500 block mb-2 sm:mb-2.5">
                    Organization
                  </span>
                  <ul className="space-y-0.5 text-slate-300">
                    <li><Link href="/about" className="inline-block py-1.5 hover:text-white active:text-[#0088ff] transition-colors touch-manipulation">About IMC</Link></li>
                    <li><Link href="/" className="inline-block py-1.5 hover:text-white active:text-[#0088ff] transition-colors touch-manipulation">Operations Map</Link></li>
                    <li><Link href="/login" className="inline-block py-1.5 text-slate-300 hover:text-[#ea1f27] active:text-[#ea1f27] transition-colors touch-manipulation">Staff Portal ↗</Link></li>
                  </ul>
                </div>

                {/* Row 3 */}
                <div>
                  <span className="text-[11px] sm:text-[12px] font-bold uppercase tracking-widest text-slate-500 block mb-2 sm:mb-2.5">
                    Piping
                  </span>
                  <ul className="space-y-0.5 text-slate-300">
                    <li><Link href="/what-we-do" className="inline-block py-1.5 hover:text-white active:text-[#0088ff] transition-colors touch-manipulation">Sanitary Stainless</Link></li>
                    <li><Link href="/what-we-do" className="inline-block py-1.5 hover:text-white active:text-[#0088ff] transition-colors touch-manipulation">Orbital Welding</Link></li>
                    <li><Link href="/what-we-do" className="inline-block py-1.5 hover:text-white active:text-[#0088ff] transition-colors touch-manipulation">Utility Distribution</Link></li>
                  </ul>
                </div>

                <div>
                  <span className="text-[11px] sm:text-[12px] font-bold uppercase tracking-widest text-slate-500 block mb-2 sm:mb-2.5">
                    Safety
                  </span>
                  <ul className="space-y-0.5 text-slate-300">
                    <li><Link href="/what-we-do" className="inline-block py-1.5 hover:text-white active:text-[#0088ff] transition-colors touch-manipulation"><span className="text-slate-300">0.78 EMR Rating</span></Link></li>
                    <li><Link href="/what-we-do" className="inline-block py-1.5 hover:text-white active:text-[#0088ff] transition-colors touch-manipulation">OSHA 30 Certified</Link></li>
                    <li><Link href="/what-we-do" className="inline-block py-1.5 hover:text-white active:text-[#0088ff] transition-colors touch-manipulation">ASME / AWS Compliant</Link></li>
                  </ul>
                </div>

              </div>
            </div>

            {/* Desktop Only: Legal Links & Attribution */}
            <div className="hidden lg:block pt-6 border-t border-slate-800/60 font-mono text-[11px] w-full max-w-md whitespace-nowrap mt-8">
              <div className="flex items-center gap-x-3.5 font-bold tracking-wider">
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  PRIVACY POLICY
                </Link>
                <span className="text-slate-600">|</span>
                <Link href="/terms-of-service" className="hover:text-white transition-colors">
                  TERMS OF SERVICE
                </Link>
                <span className="text-slate-600">|</span>
                <span className="inline-flex items-center gap-1.5 text-slate-300">
                  Design by{" "}
                  <a 
                    href="https://identityflowcreative.com/index.php" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-baseline tracking-tight hover:opacity-80 transition-opacity ml-0.5"
                  >
                    <span 
                      className="font-black text-white text-[15px] leading-none" 
                      style={{ fontFamily: 'Playfair Display, "Times New Roman", Georgia, serif' }}
                    >
                      ID
                    </span>
                    <span className="w-[5px] h-[5px] rounded-full bg-[#c4f000] inline-block ml-[1.5px] align-baseline shadow-[0_0_6px_rgba(196,240,0,0.6)]" />
                  </a>
                </span>
              </div>
            </div>
          </div>

          {/* COLUMN 3: Rapid Project Inquiry Terminal (4 Cols) */}
          <div className="lg:col-span-4 bg-[#070a10] border border-slate-800 p-6 sm:p-7 rounded-lg shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black uppercase tracking-tight text-white">
                  Contact Us Today
                </h3>
              </div>
              
              <p className="text-slate-400 text-xs leading-relaxed mb-6 font-normal">
                Request More Information.
              </p>

              {submitted ? (
                <div className="p-6 bg-[#030914] border border-slate-700/80 rounded-xs text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                    Message Sent
                  </h4>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Your inquiry has been routed to our team. We will be in touch shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  
                  {/* Invisible Honeypot to catch automated spam bots */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="website_verify_lead">Do not fill this out if human</label>
                    <input 
                      type="text" 
                      id="website_verify_lead" 
                      name="website_verify_lead" 
                      tabIndex={-1} 
                      autoComplete="off" 
                    />
                  </div>

                  <div>
                    <label htmlFor="footer-name" className="sr-only">Full Name</label>
                    <input 
                      type="text" 
                      id="footer-name" 
                      name="fullName"
                      required
                      placeholder="Full Name" 
                      className="w-full bg-[#030914] border border-slate-700/80 focus:border-[#0088ff] rounded-xs px-3.5 py-2.5 text-[16px] sm:text-xs text-white placeholder:text-slate-400 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="footer-phone" className="sr-only">Phone Number</label>
                    <input 
                      type="tel" 
                      id="footer-phone" 
                      name="phone"
                      required
                      placeholder="Phone Number" 
                      className="w-full bg-[#030914] border border-slate-700/80 focus:border-[#0088ff] rounded-xs px-3.5 py-2.5 text-[16px] sm:text-xs text-white placeholder:text-slate-400 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="footer-email" className="sr-only">Work Email</label>
                    <input 
                      type="email" 
                      id="footer-email" 
                      name="email"
                      required
                      placeholder="Email" 
                      className="w-full bg-[#030914] border border-slate-700/80 focus:border-[#0088ff] rounded-xs px-3.5 py-2.5 text-[16px] sm:text-xs text-white placeholder:text-slate-400 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="footer-message" className="sr-only">Project Scope</label>
                    <textarea 
                      id="footer-message" 
                      name="message"
                      rows={3}
                      placeholder="Scope, specs, or facility location..." 
                      className="w-full bg-[#030914] border border-slate-700/80 focus:border-[#0088ff] rounded-xs px-3.5 py-2.5 text-[16px] sm:text-xs text-white placeholder:text-slate-400 focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  {errorMessage && (
                    <p className="text-[11px] font-mono text-[#ea1f27] font-bold">
                      {errorMessage}
                    </p>
                  )}

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-[#ea1f27] hover:bg-[#d41920] active:bg-[#b5181e] disabled:bg-slate-700 text-white font-mono text-xs font-bold uppercase tracking-[0.15em] py-3 rounded-xs shadow-lg transition-all duration-200 active:scale-[0.97] touch-manipulation select-none flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> send
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            <p className="text-[10px] font-mono text-slate-500 text-center mt-4">
              Message sent directly to IMC.
            </p>
          </div>

        </div>

        {/* MOBILE ONLY: Bottom Docked Legal & Attribution Section */}
        <div className="block lg:hidden pt-8 pb-4 border-t border-slate-800/80 font-mono text-xs space-y-4">
          <p className="text-slate-400 text-center text-[11px]">
            &copy; {currentYear} Interwest Mechanical Contractors. All Rights Reserved.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[10px] font-bold tracking-wider text-slate-400">
            <Link href="/privacy-policy" className="hover:text-white py-1 transition-colors touch-manipulation">
              PRIVACY POLICY
            </Link>
            <span className="text-slate-700">|</span>
            <Link href="/terms-of-service" className="hover:text-white py-1 transition-colors touch-manipulation">
              TERMS OF SERVICE
            </Link>
            <span className="text-slate-700">|</span>
            <span className="inline-flex items-center gap-1.5 text-slate-300 py-1">
              Design by{" "}
              <a 
                href="https://identityflowcreative.com/index.php" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-baseline tracking-tight hover:opacity-80 transition-opacity ml-0.5 touch-manipulation"
              >
                <span 
                  className="font-black text-white text-[14px] leading-none" 
                  style={{ fontFamily: 'Playfair Display, "Times New Roman", Georgia, serif' }}
                >
                  ID
                </span>
                <span className="w-[4.5px] h-[4.5px] rounded-full bg-[#c4f000] inline-block ml-[1.5px] align-baseline shadow-[0_0_6px_rgba(196,240,0,0.6)]" />
              </a>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}