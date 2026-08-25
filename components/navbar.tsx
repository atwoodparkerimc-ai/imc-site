"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Updated link structure
  const links = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="bg-[#141923] border-b border-slate-700/80 border-t-2 border-t-red-600 sticky top-0 z-50 shadow-2xl">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          
          {/* Main Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link 
              href="/" 
              className="block focus:outline-none group" 
              aria-label="IMC Home"
            >
              <Image 
                src="/imclogo.svg" 
                alt="Interwest Mechanical Contractors Logo" 
                width={180} 
                height={50} 
                priority
                className="h-10 md:h-12 w-auto object-contain transition-all duration-200 group-hover:scale-[1.03] group-active:scale-[0.98]"
              />
            </Link>
          </div>

          {/* Desktop Links with Larger Font & Active Route State */}
          <div className="hidden md:flex items-center space-x-10">
            {links.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-base font-bold tracking-wide transition-all duration-200 relative py-1 ${
                    isActive 
                      ? "text-white after:w-full" 
                      : "text-slate-300 hover:text-white after:w-0 hover:after:w-full"
                  } after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-[#ea1f27] after:transition-all after:duration-200 active:text-red-400`}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* Employee Login CTA - High Contrast Solid Container */}
            <Link
              href="/login"
              className={`px-6 py-2.5 rounded-xs border text-sm font-mono font-bold uppercase tracking-wider transition-all duration-200 shadow-md active:translate-y-0.5 ${
                pathname === "/login"
                  ? "bg-[#ea1f27] border-[#ea1f27] text-white shadow-[0_0_15px_rgba(234,31,39,0.4)]"
                  : "bg-slate-800 hover:bg-slate-700 border-slate-600 hover:border-[#ea1f27] text-white hover:shadow-[0_0_15px_rgba(234,31,39,0.3)] active:bg-slate-900"
              }`}
            >
              Employee Login
            </Link>
          </div>

          {/* Mobile Toggle Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-xs text-slate-200 hover:text-white hover:bg-slate-800 active:scale-95 transition-all focus:outline-none"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-[#10141d] border-b border-slate-700 shadow-2xl">
          
          <div className="px-4 pt-3 pb-6 space-y-2">
            {links.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3.5 rounded-xs text-base font-bold transition-all border-l-2 ${
                    isActive
                      ? "text-white bg-slate-800/90 border-[#ea1f27]"
                      : "text-slate-300 hover:text-white border-transparent hover:border-[#ea1f27] hover:bg-slate-800/60"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className={`block w-full text-center mt-4 px-4 py-3.5 border text-sm font-mono font-bold uppercase tracking-wider rounded-xs transition-all ${
                pathname === "/login"
                  ? "bg-[#ea1f27] border-[#ea1f27] text-white"
                  : "bg-slate-800 border-slate-600 hover:border-[#ea1f27] text-white active:bg-slate-900"
              }`}
            >
              Employee Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}