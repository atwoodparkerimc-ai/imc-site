"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X, Menu, ChevronRight } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Industrial snap entrance curves
  const drawerVariants: Variants = {
    closed: {
      x: "-100%",
      transition: {
        duration: 0.3,
        ease: [0.32, 0, 0.67, 0],
      },
    },
    open: {
      x: "0%",
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.07,
        delayChildren: 0.12,
      },
    },
  };

  const itemVariants: Variants = {
    closed: { 
      opacity: 0, 
      x: -24 
    },
    open: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1]
      }
    },
  };

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

          {/* Desktop Links */}
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

            {/* Employee Login CTA */}
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
              onClick={() => setIsOpen(true)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-xs text-slate-200 hover:text-white hover:bg-slate-800 active:scale-95 transition-all focus:outline-none"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="h-7 w-7" />
            </button>
          </div>
        </div>
      </div>

      {/* INDUSTRIAL SLIDE-OVER DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            
            {/* Dark Tactical Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "linear" }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-[#02050b]/85 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Slide-out Panel */}
            <motion.div 
              variants={drawerVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="relative w-[85%] max-w-sm h-full bg-[#070b13] border-r border-slate-800 shadow-[20px_0_50px_rgba(0,0,0,0.8)] flex flex-col justify-between p-6 z-10 overflow-hidden"
            >
              {/* Tactical Background Grid in Drawer */}
              <div className="absolute inset-0 z-0 tactical-graph-paper opacity-25 pointer-events-none" />

              {/* Glowing Red Brand Accent Rail */}
              <div className="absolute top-0 right-0 bottom-0 w-[2px] bg-gradient-to-b from-[#ea1f27] via-[#0088ff]/40 to-transparent pointer-events-none" />

              <div className="relative z-10">
                {/* Header: Logo & Close Button */}
                <div className="flex items-center justify-between pb-5 border-b border-slate-800/80 mb-8">
                  <Link href="/" onClick={() => setIsOpen(false)} className="flex flex-col">
                    <Image 
                      src="/imclogo.svg" 
                      alt="IMC Logo" 
                      width={140} 
                      height={40} 
                      className="h-8 w-auto object-contain"
                    />
                  </Link>
                  
                  <button
                    onClick={() => setIsOpen(false)}
                    type="button"
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xs transition-all active:scale-95 focus:outline-none"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-3">
                  {links.map((link) => {
                    const isActive = pathname === link.href;

                    return (
                      <motion.div key={link.href} variants={itemVariants}>
                        <Link
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className={`group flex items-center justify-between px-5 py-4 rounded-xs text-base font-bold transition-all relative overflow-hidden border ${
                            isActive
                              ? "bg-[#ea1f27]/10 border-[#ea1f27]/70 text-white shadow-[inset_0_0_15px_rgba(234,31,39,0.18)]"
                              : "bg-[#0c121e]/80 border-slate-800/80 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-[#111927]"
                          }`}
                        >
                          <div className="flex items-center gap-3 z-10">
                            <span 
                              className={`w-1.5 h-1.5 transition-all duration-200 ${
                                isActive ? "bg-[#ea1f27] scale-125" : "bg-slate-600 group-hover:bg-[#ea1f27]"
                              }`} 
                            />
                            <span className="tracking-wide">
                              {link.name}
                            </span>
                          </div>

                          <ChevronRight 
                            className={`w-4 h-4 transition-transform duration-200 z-10 ${
                              isActive ? "text-[#ea1f27] translate-x-1" : "text-slate-600 group-hover:text-white group-hover:translate-x-1"
                            }`} 
                          />

                          {/* Active corner indicator */}
                          {isActive && (
                            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-[#ea1f27]" />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom Employee Portal Block */}
              <motion.div variants={itemVariants} className="relative z-10 pt-6 border-t border-slate-800/80">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-center gap-2 w-full text-center px-4 py-3.5 border font-mono text-xs font-bold uppercase tracking-widest rounded-xs transition-all shadow-lg active:scale-[0.98] ${
                    pathname === "/login"
                      ? "bg-[#ea1f27] border-[#ea1f27] text-white shadow-[0_0_20px_rgba(234,31,39,0.35)]"
                      : "bg-[#0f172a] hover:bg-slate-800 border-slate-700 hover:border-[#ea1f27] text-white"
                  }`}
                >
                  <span>Employee login</span>
                  <span className="text-slate-500">↗</span>
                </Link>
              </motion.div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
}

