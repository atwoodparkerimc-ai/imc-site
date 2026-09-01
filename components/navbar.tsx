"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";

interface MainNavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_LINKS: MainNavItem[] = [
  { 
    name: "Home", 
    href: "/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    )
  },
  { 
    name: "About", 
    href: "/about",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    )
  },
  { 
    name: "Contact", 
    href: "/contact",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
      </svg>
    )
  },
];

// Motion Variants for Staggered Drawer Items
const drawerPanelVariants: Variants = {
  hidden: { x: "-100%" },
  show: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.08,
      delayChildren: 0.12
    }
  },
  exit: {
    x: "-100%",
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 35,
      staggerChildren: 0.04,
      staggerDirection: -1
    }
  }
};

const drawerItemVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  show: { 
    opacity: 1, 
    x: 0, 
    transition: { 
      type: "spring", 
      stiffness: 260, 
      damping: 22 
    } 
  },
  exit: { 
    opacity: 0, 
    x: -20, 
    transition: { duration: 0.15 } 
  }
};

const MotionLink = motion(Link);

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

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

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <nav className="bg-[#141923] border-b border-slate-700/80 border-t-2 border-t-red-600 sticky top-0 z-50 shadow-2xl font-mono">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          
          {/* Main Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link 
              href="/" 
              className="block focus:outline-none group touch-manipulation" 
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
            {NAV_LINKS.map((link) => {
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
              className={`px-6 py-2.5 rounded-xs border text-sm font-mono font-bold uppercase tracking-wider transition-all duration-200 shadow-md active:translate-y-0.5 active:scale-[0.98] ${
                pathname === "/login"
                  ? "bg-[#ea1f27] border-[#ea1f27] text-white shadow-[0_0_15px_rgba(234,31,39,0.4)]"
                  : "bg-slate-800 hover:bg-slate-700 border-slate-600 hover:border-[#ea1f27] text-white hover:shadow-[0_0_15px_rgba(234,31,39,0.3)] active:bg-slate-900"
              }`}
            >
              Employee Login
            </Link>
          </div>

          {/* Mobile Toggle Button (Expanded 48x48px Touch Area & Feedback) */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(true)}
              type="button"
              className="inline-flex items-center justify-center p-3 min-w-[48px] min-h-[48px] rounded-xs text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-700 active:scale-95 transition-all focus:outline-none cursor-pointer touch-manipulation select-none"
              aria-expanded={isOpen}
              aria-label="Open main menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* INDUSTRIAL SLIDE-OVER DRAWER WITH TRUE STAGGER ANIMATION */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm" 
            />

            {/* Slide-in Drawer Container */}
            <motion.aside
              variants={drawerPanelVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="relative w-64 h-full bg-[#070b13] border-r border-slate-800/80 shadow-2xl flex flex-col justify-between p-0 z-10 overflow-hidden"
            >
              {/* Header Bar */}
              <div>
                <div className="h-16 flex items-center px-4 justify-between border-b border-slate-800/80">
                  <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center touch-manipulation">
                    <Image 
                      src="/imclogo.svg" 
                      alt="IMC Logo" 
                      width={110} 
                      height={30} 
                      className="h-7 w-auto object-contain"
                      priority
                    />
                  </Link>
                  {/* Expanded Close Hit Target (48x48px standard) */}
                  <button 
                    onClick={() => setIsOpen(false)}
                    aria-label="Close menu"
                    className="text-slate-400 hover:text-white active:text-white p-3 min-w-[48px] min-h-[48px] flex items-center justify-center transition-all active:scale-90 focus:outline-none cursor-pointer touch-manipulation select-none"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>

                {/* Staggered Navigation Link Items (48px Hit Targets) */}
                <div className="flex flex-col py-6 gap-2 px-3 overflow-y-auto">
                  {NAV_LINKS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <MotionLink
                        key={item.name} 
                        href={item.href}
                        variants={drawerItemVariants}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3.5 px-3 min-h-[48px] rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition-all active:scale-[0.98] touch-manipulation ${
                          isActive 
                            ? "text-[#ea1f27] bg-[#ea1f27]/10 border border-[#ea1f27]/30 shadow-[inset_0_0_12px_rgba(234,31,39,0.15)]" 
                            : "text-slate-300 hover:text-white active:text-white hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <div className="w-5 flex justify-center items-center flex-shrink-0">
                          {item.icon}
                        </div>
                        <span>{item.name}</span>
                      </MotionLink>
                    );
                  })}
                </div>
              </div>

              {/* Staggered Bottom CTA Dock */}
              <div className="p-3 border-t border-slate-800/80 flex flex-col gap-2">
                <MotionLink 
                  href="/login"
                  variants={drawerItemVariants}
                  onClick={() => setIsOpen(false)}
                  className={`w-full flex items-center gap-3 px-3 min-h-[48px] rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition-all active:scale-[0.98] touch-manipulation ${
                    pathname === "/login" 
                      ? "bg-[#ea1f27]/15 border border-[#ea1f27] text-white shadow-[0_0_15px_rgba(234,31,39,0.25)]" 
                      : "bg-slate-900/60 hover:bg-slate-800 active:bg-slate-700 border border-slate-700/80 hover:border-[#ea1f27] text-white"
                  }`}
                >
                  <div className="w-5 flex justify-center items-center flex-shrink-0 text-slate-300 group-hover:text-white">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                      <polyline points="10 17 15 12 10 7"></polyline>
                      <line x1="15" y1="12" x2="3" y2="12"></line>
                    </svg>
                  </div>
                  <span>Employee Login</span>
                </MotionLink>
              </div>

            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
}