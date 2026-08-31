"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence, Variants } from "framer-motion";
import UnreadRecognitionModal from "./dashboard/_components/UnreadRecognitionModal";

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

interface NotificationRecord {
  id: string;
  user_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface RealtimePayload {
  new: NotificationRecord;
}

const NAV_ITEMS: NavItem[] = [
  { 
    name: "Dashboard", 
    path: "/dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    )
  },
  { 
    name: "Safety", 
    path: "/safety",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    )
  },
  { 
    name: "Reporting", 
    path: "/reporting",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22V3"></path>
        <path d="M4 4h14l-3 5 3 5H4"></path>
      </svg>
    )
  },
  { 
    name: "Rewards", 
    path: "/catalog",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
        <line x1="7" y1="7" x2="7.01" y2="7"></line>
      </svg>
    )
  },
];

// Motion Variants for Staggered Drawer Items
const drawerContainerVariants: Variants = {
  hidden: { x: "-100%" },
  show: {
    x: "0%",
    transition: {
      type: "spring",
      stiffness: 320,
      damping: 32,
      staggerChildren: 0.06,
      delayChildren: 0.1
    }
  },
  exit: {
    x: "-100%",
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 35,
      staggerChildren: 0.03,
      staggerDirection: -1
    }
  }
};

const drawerItemVariants: Variants = {
  hidden: { opacity: 0, x: -24 },
  show: { 
    opacity: 1, 
    x: 0, 
    transition: { 
      type: "spring", 
      stiffness: 260, 
      damping: 24 
    } 
  },
  exit: { 
    opacity: 0, 
    x: -16, 
    transition: { duration: 0.15 } 
  }
};

const MotionLink = motion(Link);

const supabase = createClient();

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isManager, setIsManager] = useState<boolean>(false); 
  const [notification, setNotification] = useState<NotificationRecord | null>(null); 
  
  // Smart Scroll-Up Header State
  const [showMobileHeader, setShowMobileHeader] = useState<boolean>(true);
  const lastScrollYRef = useRef<number>(0);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    const diff = currentScrollY - lastScrollYRef.current;

    if (currentScrollY < 10) {
      setShowMobileHeader(true);
    } else if (diff > 8) {
      setShowMobileHeader(false);
    } else if (diff < -8) {
      setShowMobileHeader(true);
    }

    lastScrollYRef.current = currentScrollY;
  };

  useEffect(() => {
    let isMounted = true;

    const initializeDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
          
      if (profile?.role === 'manager' && isMounted) setIsManager(true);

      const { data: alertFeed } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(1);

      if (alertFeed && alertFeed.length > 0 && isMounted) {
        setNotification(alertFeed[0] as NotificationRecord);
      }

      if (!channelRef.current) {
        channelRef.current = supabase
          .channel(`alerts-${user.id}`)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
            (payload) => {
              const typedPayload = payload as unknown as RealtimePayload;
              if (typedPayload.new && !typedPayload.new.is_read) {
                setNotification(typedPayload.new);
              }
            }
          )
          .subscribe();
      }
    };

    initializeDashboard();

    return () => {
      isMounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []); 

  const dismissNotification = async () => {
    if (!notification) return;
    
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notification.id);
      
    setNotification(null); 
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen bg-brand-bg font-mono overflow-hidden text-slate-100">
      
      {/* 1. MOBILE SIDEBAR & BACKDROP WITH STAGGERED ITEM SLIDE-IN */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileOpen(false)}
              className="mobile-overlay-backdrop md:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" 
            />

            {/* Slide-In Mobile Drawer Container */}
            <motion.aside
              variants={drawerContainerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="sidebar-nav-container md:hidden fixed inset-y-0 left-0 z-50 w-64 h-full flex flex-col flex-shrink-0 bg-brand-card border-r border-[var(--color-brand-border)] shadow-2xl"
            >
              <div className="sidebar-header-bar h-16 flex items-center px-6 justify-between border-b border-[var(--color-brand-border)]">
                <Image 
                  src="/imclogo.svg" 
                  alt="IMC Logo" 
                  width={110} 
                  height={30} 
                  className="h-7 w-auto object-contain"
                  priority
                />
                <button 
                  onClick={() => setIsMobileOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors focus:outline-none cursor-pointer p-1"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {/* Mobile Staggered Navigation Link List */}
              <div className="flex flex-col flex-1 py-6 gap-2 px-3 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <MotionLink
                      key={item.name} 
                      href={item.path}
                      variants={drawerItemVariants}
                      onClick={() => setIsMobileOpen(false)}
                      className={`nav-item-link flex items-center gap-3.5 p-3 rounded-sm group relative min-h-[44px] transition-colors ${
                        isActive 
                          ? "active text-[var(--color-brand-blue)] bg-[var(--color-brand-blue)]/10 border border-[var(--color-brand-blue)]/30" 
                          : "text-slate-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="w-5 flex justify-center items-center flex-shrink-0">
                        {item.icon}
                      </div>
                      <span className="uppercase text-xs font-semibold tracking-wider whitespace-nowrap">
                        {item.name}
                      </span>
                    </MotionLink>
                  );
                })}

                {isManager && (
                  <MotionLink 
                    href="/manager"
                    variants={drawerItemVariants}
                    onClick={() => setIsMobileOpen(false)}
                    className={`nav-manager-btn flex items-center gap-3.5 p-3 mt-4 rounded-sm group min-h-[44px] transition-colors ${
                      pathname === "/manager" ? "active" : ""
                    }`}
                  >
                    <div className="w-5 flex justify-center items-center flex-shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                        <line x1="8" y1="21" x2="16" y2="21"></line>
                        <line x1="12" y1="17" x2="12" y2="21"></line>
                      </svg>
                    </div>
                    <span className="uppercase text-xs font-bold tracking-wider whitespace-nowrap">
                      Admin Portal
                    </span>
                  </MotionLink>
                )}
              </div>

              {/* Mobile Staggered Footer Actions */}
              <div className="nav-footer-bar p-3 border-t border-[var(--color-brand-border)] flex flex-col gap-2">
                <MotionLink 
                  href="/profile"
                  variants={drawerItemVariants}
                  onClick={() => setIsMobileOpen(false)}
                  className={`nav-footer-btn w-full flex items-center gap-3 px-3 p-3 rounded-sm group min-h-[44px] transition-colors ${
                    pathname === "/profile" ? "active" : ""
                  }`}
                >
                  <div className="w-5 flex justify-center items-center flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <span className="uppercase text-xs font-semibold tracking-wider whitespace-nowrap">
                    Profile
                  </span>
                </MotionLink>

                <motion.button 
                  variants={drawerItemVariants}
                  onClick={handleLogout}
                  className="nav-logout-btn w-full flex items-center gap-3 px-3 p-3 rounded-sm group cursor-pointer text-left min-h-[44px] transition-colors"
                >
                  <div className="w-5 flex justify-center items-center flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                  </div>
                  <span className="uppercase text-xs font-semibold tracking-wider whitespace-nowrap">
                    Logout
                  </span>
                </motion.button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 2. DESKTOP PERMANENT SIDEBAR (100% UNTOUCHED) */}
      <motion.nav 
        animate={{ width: isSidebarOpen ? 240 : 80 }}
        className="sidebar-nav-container hidden md:flex relative inset-y-0 left-0 z-50 h-full flex-col flex-shrink-0"
      >
        <div className="sidebar-header-bar h-16 flex items-center px-6 justify-between">
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Image 
                  src="/imclogo.svg" 
                  alt="IMC Logo" 
                  width={110} 
                  height={30} 
                  className="h-7 w-auto object-contain"
                  priority
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-slate-400 hover:text-white transition-colors focus:outline-none ml-auto cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Navigation Menu Link List */}
        <div className="flex flex-col flex-1 py-6 gap-2 px-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.name} 
                href={item.path}
                className={`nav-item-link flex items-center gap-3.5 p-3 group relative ${
                  isActive ? "active" : ""
                }`}
              >
                <div className="w-5 flex justify-center items-center flex-shrink-0 transition-transform group-hover:scale-105">
                  {item.icon}
                </div>
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="uppercase text-xs font-semibold tracking-wider whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}

          {isManager && (
            <Link 
              href="/manager"
              className={`nav-manager-btn flex items-center gap-3.5 p-3 mt-4 rounded-sm group ${
                pathname === "/manager" ? "active" : ""
              }`}
            >
              <div className="w-5 flex justify-center items-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="uppercase text-xs font-bold tracking-wider whitespace-nowrap"
                  >
                    Admin Portal
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )}
        </div>

        {/* Footer Actions Matrix Block */}
        <div className="nav-footer-bar p-3 flex flex-col gap-2">
          <Link 
            href="/profile"
            className={`nav-footer-btn w-full flex items-center p-2.5 rounded-sm group ${
              pathname === "/profile" ? "active" : ""
            }`}
          >
            <div className="w-5 flex justify-center items-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="uppercase text-[10px] font-semibold tracking-wider whitespace-nowrap ml-3"
                >
                  Profile
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <button 
            onClick={handleLogout}
            className={`nav-logout-btn w-full flex items-center p-2.5 rounded-sm group cursor-pointer ${
              isSidebarOpen ? "px-3" : "justify-center"
            }`}
          >
            <div className="w-5 flex justify-center items-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </div>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="uppercase text-[10px] font-semibold tracking-wider whitespace-nowrap ml-3"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.nav>

      {/* Main Content Area Wrapper */}
      <main 
        onScroll={handleScroll}
        className="flex-1 relative overflow-y-auto overflow-x-hidden flex flex-col justify-between bg-brand-bg touch-pan-y"
      >
        
        {/* Mobile Top Header: Smart Auto-Reveal on Scroll Up */}
        <div 
          className={`sidebar-header-bar md:hidden fixed top-0 left-0 right-0 z-30 h-16 bg-brand-card/95 backdrop-blur-md border-b border-[var(--color-brand-border)] flex items-center justify-between px-6 transition-transform duration-300 ${
            showMobileHeader ? "translate-y-0 shadow-lg" : "-translate-y-full pointer-events-none"
          }`}
        >
          <div className="flex items-center gap-2">
            <Image 
              src="/imclogo.svg" 
              alt="IMC Logo" 
              width={100} 
              height={28} 
              className="h-6 w-auto object-contain"
              priority
            />
          </div>
          <button 
            onClick={() => {
              setIsMobileOpen(true);
              setIsSidebarOpen(true);
            }}
            className="text-slate-400 hover:text-white transition-colors focus:outline-none cursor-pointer p-2 -mr-2"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Top spacer on mobile */}
        <div className="h-16 md:hidden flex-shrink-0" />
        
        {/* UNREAD RECOGNITION POPUP MODAL */}
        <UnreadRecognitionModal 
          notification={notification} 
          onDismiss={dismissNotification} 
        />

        {/* Tactical Blueprint Grid Background Overlay */}
        <div className="absolute inset-0 pointer-events-none z-0 tactical-graph-paper" />

        {/* Dynamic Inner Page Node Rendering */}
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>

        {/* RESPONSIVE PORTAL FOOTER */}
        <footer className="relative z-10 border-t border-[var(--color-brand-border)] bg-[#030914]/95 backdrop-blur-md px-6 sm:px-8 py-6 font-mono text-slate-300">
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-5 lg:gap-6">
            
            {/* Left: Copyright */}
            <div className="w-full lg:w-auto lg:flex-1 flex items-center justify-center lg:justify-start">
              <p className="text-xs sm:text-sm text-slate-400 font-medium text-center lg:text-left">
                &copy; {currentYear} Interwest Mechanical Contractors. All Rights Reserved.
              </p>
            </div>

            {/* Center: Scaled-Up Builders of Industry Lockup */}
            <div className="flex-shrink-0 flex items-center justify-center my-1 lg:my-0">
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

            {/* Right: Legal Links, Employee Terms, & ID. Attribution */}
            <div className="w-full lg:w-auto lg:flex-1 flex flex-wrap items-center justify-center lg:justify-end gap-x-3 sm:gap-x-4 gap-y-2 text-xs sm:text-sm font-bold tracking-wider">
              <Link href="/privacy-policy" className="hover:text-white text-slate-300 transition-colors whitespace-nowrap">
                PRIVACY POLICY
              </Link>
              <span className="text-slate-700">|</span>
              <Link href="/terms-of-service" className="hover:text-white text-slate-300 transition-colors whitespace-nowrap">
                TERMS OF SERVICE
              </Link>
              <span className="text-slate-700">|</span>
              <Link href="/employee-terms" className="hover:text-white text-slate-300 transition-colors whitespace-nowrap">
                EMPLOYEE TERMS OF USE
              </Link>
              <span className="text-slate-700">|</span>
              <span className="inline-flex items-center gap-1.5 text-slate-300 whitespace-nowrap">
                Design by{" "}
                <a 
                  href="https://identityflowcreative.com/index.php" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-baseline tracking-tight hover:opacity-80 transition-opacity ml-0.5"
                >
                  <span 
                    className="font-black text-white text-[16px] leading-none" 
                    style={{ fontFamily: 'Playfair Display, "Times New Roman", Georgia, serif' }}
                  >
                    ID
                  </span>
                  <span className="w-[5px] h-[5px] rounded-full bg-[#c4f000] inline-block ml-[2px] align-baseline shadow-[0_0_6px_rgba(196,240,0,0.6)]" />
                </a>
              </span>
            </div>

          </div>
        </footer>

      </main>
    </div>
  );
}