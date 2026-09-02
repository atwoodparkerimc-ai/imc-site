"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence, Variants } from "framer-motion";
import UnreadRecognitionModal from "./dashboard/_components/UnreadRecognitionModal";

const SUPER_ADMIN_EMAIL = "atwoodparkerimc@gmail.com";

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

// Hardware-accelerated drawer variants with synchronized timeline
const drawerContainerVariants: Variants = {
  hidden: { 
    x: "-100%",
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  show: {
    x: "0%",
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.04,
      delayChildren: 0.05
    }
  },
  exit: {
    x: "-100%",
    transition: {
      duration: 0.22,
      ease: [0.4, 0, 1, 1]
    }
  }
};

const drawerItemVariants: Variants = {
  hidden: { opacity: 0, x: -14 },
  show: { 
    opacity: 1, 
    x: 0, 
    transition: { 
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1]
    } 
  },
  exit: { 
    opacity: 0, 
    transition: { duration: 0.1 } 
  }
};

const MotionLink = motion(Link);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  const [supabase] = useState(() => createClient());
  
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isManager, setIsManager] = useState<boolean>(false); 
  const [notification, setNotification] = useState<NotificationRecord | null>(null); 
  
  const [showMobileHeader, setShowMobileHeader] = useState<boolean>(true);
  const lastScrollYRef = useRef<number>(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    let ticking = false;
    const handleWindowScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const diff = currentY - lastScrollYRef.current;

          if (currentY < 10) {
            setShowMobileHeader(true);
          } else if (diff > 12) {
            setShowMobileHeader(false);
          } else if (diff < -12) {
            setShowMobileHeader(true);
          }

          lastScrollYRef.current = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeDashboard = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return;

        const isSuperAdmin = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.warn("Profile fetch notice:", profileError.message);
        }

        const role = profile?.role?.toLowerCase();
        const hasManagerPrivileges = isSuperAdmin || role === 'manager' || role === 'admin' || role === 'superadmin';

        if (hasManagerPrivileges && isMounted) {
          setIsManager(true);
        }

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
      } catch (err) {
        console.error("Dashboard layout initialization error:", err);
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
  }, [supabase]); 

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
    <div className="flex min-h-[100svh] w-full bg-brand-bg font-mono text-slate-100 selection:bg-[var(--color-brand-blue)] selection:text-white relative overscroll-none">
      
      {/* 1. MOBILE SIDEBAR */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 h-[100svh] z-50 md:hidden flex touch-none overscroll-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm" 
            />

            <motion.aside
              variants={drawerContainerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="relative w-64 h-[100svh] flex flex-col flex-shrink-0 bg-brand-card border-r border-[var(--color-brand-border)] shadow-2xl z-10 overflow-hidden will-change-transform"
            >
              <div className="sidebar-header-bar h-16 flex items-center px-4 sm:px-6 justify-between border-b border-[var(--color-brand-border)]">
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
                  className="text-slate-400 hover:text-white active:text-white min-w-[48px] min-h-[48px] flex items-center justify-center -mr-2 active:scale-90 touch-manipulation focus:outline-none"
                  aria-label="Close Navigation Drawer"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="flex flex-col flex-1 py-6 gap-2 px-3 overflow-y-auto overscroll-contain">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <MotionLink
                      key={item.name} 
                      href={item.path}
                      variants={drawerItemVariants}
                      onClick={() => setIsMobileOpen(false)}
                      className={`nav-item-link flex items-center gap-3.5 p-3 rounded-sm min-h-[48px] transition-all active:scale-[0.98] touch-manipulation ${
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
                    className={`nav-manager-btn flex items-center gap-3.5 p-3 mt-4 rounded-sm min-h-[48px] transition-all active:scale-[0.98] touch-manipulation ${
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

              <div className="nav-footer-bar p-3 border-t border-[var(--color-brand-border)] flex flex-col gap-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <MotionLink 
                  href="/profile"
                  variants={drawerItemVariants}
                  onClick={() => setIsMobileOpen(false)}
                  className={`nav-footer-btn w-full flex items-center gap-3 px-3 p-3 rounded-sm min-h-[48px] transition-all active:scale-[0.98] touch-manipulation ${
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
                  className="nav-logout-btn w-full flex items-center gap-3 px-3 p-3 rounded-sm text-left min-h-[48px] transition-all active:scale-[0.98] touch-manipulation"
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
          </div>
        )}
      </AnimatePresence>

      {/* 2. DESKTOP PERMANENT SIDEBAR */}
      <motion.nav 
        animate={{ width: isSidebarOpen ? 240 : 80 }}
        className="sidebar-nav-container hidden md:flex sticky top-0 h-[100svh] flex-col flex-shrink-0 z-40 border-r border-[var(--color-brand-border)]"
      >
        <div className="sidebar-header-bar h-16 flex items-center px-4 justify-between">
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 pl-2"
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
            className="text-slate-400 hover:text-white transition-colors ml-auto min-w-[40px] min-h-[40px] flex items-center justify-center rounded-sm hover:bg-white/5 active:scale-90 touch-manipulation focus:outline-none"
            aria-label={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="flex flex-col flex-1 py-6 gap-2 px-3 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.name} 
                href={item.path}
                className={`nav-item-link flex items-center gap-3.5 p-3 group relative rounded-sm transition-all active:scale-[0.98] ${
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
              className={`nav-manager-btn flex items-center gap-3.5 p-3 mt-4 rounded-sm group transition-all active:scale-[0.98] ${
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

        <div className="nav-footer-bar p-3 flex flex-col gap-2">
          <Link 
            href="/profile"
            className={`nav-footer-btn w-full flex items-center p-2.5 rounded-sm group transition-all active:scale-[0.98] ${
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
                  className="uppercase text-xs font-semibold tracking-wider whitespace-nowrap ml-3"
                >
                  Profile
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <button 
            onClick={handleLogout}
            className={`nav-logout-btn w-full flex items-center p-2.5 rounded-sm group cursor-pointer transition-all active:scale-[0.98] ${
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
                  className="uppercase text-xs font-semibold tracking-wider whitespace-nowrap ml-3"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.nav>

      {/* 3. MAIN DOCUMENT SCROLL VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 bg-brand-bg relative">
        
        {/* Mobile Fixed Top Header */}
        <div 
          className={`sidebar-header-bar md:hidden fixed top-0 left-0 right-0 z-30 h-16 bg-brand-card/95 backdrop-blur-md border-b border-[var(--color-brand-border)] flex items-center justify-between px-4 sm:px-6 transition-transform duration-300 ${
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
            className="text-slate-400 hover:text-white min-w-[48px] min-h-[48px] flex items-center justify-center -mr-2 active:scale-90 touch-manipulation focus:outline-none"
            aria-label="Open Navigation Menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Mobile Header Spacer */}
        <div className="h-16 md:hidden flex-shrink-0" />
        
        <UnreadRecognitionModal 
          notification={notification} 
          onDismiss={dismissNotification} 
        />

        <div className="absolute inset-0 pointer-events-none z-0 tactical-graph-paper" />

        {/* Main Content Area */}
        <main className="relative z-10 flex-1 w-full flex flex-col">
          {children}
        </main>

        {/* Portal Footer */}
        <footer className="relative z-10 border-t border-[var(--color-brand-border)] bg-[#030914]/95 backdrop-blur-md px-6 sm:px-8 py-6 font-mono text-slate-300 mt-auto">
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-5 lg:gap-6">
            <div className="w-full lg:w-auto lg:flex-1 flex items-center justify-center lg:justify-start">
              <p className="text-xs sm:text-sm text-slate-400 font-medium text-center lg:text-left">
                &copy; {currentYear} Interwest Mechanical Contractors. All Rights Reserved.
              </p>
            </div>

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

            <div className="w-full lg:w-auto lg:flex-1 flex flex-wrap items-center justify-center lg:justify-end gap-x-2 sm:gap-x-3 gap-y-1 text-xs sm:text-sm font-bold tracking-wider">
              <Link 
                href="/privacy-policy" 
                className="py-2 px-1 text-slate-300 hover:text-white transition-colors whitespace-nowrap touch-manipulation"
              >
                PRIVACY POLICY
              </Link>
              <span className="text-slate-700">|</span>
              <Link 
                href="/terms" 
                className="py-2 px-1 text-slate-300 hover:text-white transition-colors whitespace-nowrap touch-manipulation"
              >
                TERMS OF SERVICE
              </Link>
              <span className="text-slate-700">|</span>
              <Link 
                href="/employee-terms" 
                className="py-2 px-1 text-slate-300 hover:text-white transition-colors whitespace-nowrap touch-manipulation"
              >
                EMPLOYEE TERMS OF USE
              </Link>
              <span className="text-slate-700">|</span>
              <span className="inline-flex items-center gap-1.5 text-slate-300 whitespace-nowrap py-2 px-1">
                Design by{" "}
                <a 
                  href="https://identityflowcreative.com/index.php" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-baseline tracking-tight hover:opacity-80 transition-opacity ml-0.5 touch-manipulation"
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

      </div>
    </div>
  );
}