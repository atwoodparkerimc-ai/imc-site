"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
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

const supabase = createClient();

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isManager, setIsManager] = useState<boolean>(false); 
  const [notification, setNotification] = useState<NotificationRecord | null>(null); 
  
  // Explicit type configuration for Realtime socket channel references
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

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

  return (
    <div className="flex h-screen bg-brand-bg font-mono overflow-hidden text-slate-100">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="mobile-overlay-backdrop md:hidden fixed inset-0 z-40" 
          />
        )}
      </AnimatePresence>

      {/* The Collapsible Sidebar */}
      <motion.nav 
        animate={{ width: isSidebarOpen ? 240 : 80 }}
        className={`sidebar-nav-container fixed md:relative inset-y-0 left-0 z-50 h-full flex flex-col flex-shrink-0 transition-transform duration-300 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="sidebar-header-bar h-16 flex items-center px-6 justify-between">
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-black text-slate-100 uppercase tracking-[0.25em] text-xs flex items-center gap-2"
              >
                <span className="sidebar-logo-accent w-2 h-2 rounded-none animate-pulse" />
                Portal
              </motion.span>
            )}
          </AnimatePresence>
          
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden md:block text-slate-400 hover:text-white transition-colors focus:outline-none ml-auto cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <button 
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-white transition-colors focus:outline-none ml-auto cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Navigation Menu Link List */}
        <div className="flex flex-col flex-1 py-6 gap-2 px-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path;
            return (
              <a 
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
              </a>
            );
          })}

          {/* Conditional Command Center Action Toggle Router */}
          {isManager && (
            <a 
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
                    Command Center
                  </motion.span>
                )}
              </AnimatePresence>
            </a>
          )}
        </div>

        {/* Footer Actions Matrix Block */}
        <div className="nav-footer-bar p-3 flex flex-col gap-2">
          <a 
            href="/profile"
            className={`nav-footer-btn w-full flex items-center p-2.5 rounded-sm group ${
              pathname === "/profile" ? "active" : ""
            } ${isSidebarOpen ? "gap-3 px-3" : "justify-center"}`}
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
                  className="uppercase text-[10px] font-semibold tracking-wider whitespace-nowrap"
                >
                  Profile
                </motion.span>
              )}
            </AnimatePresence>
          </a>

          <button 
            onClick={handleLogout}
            className={`nav-logout-btn w-full flex items-center p-2.5 rounded-sm group cursor-pointer ${
              isSidebarOpen ? "gap-3 px-3" : "justify-center"
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
                  className="uppercase text-[10px] font-semibold tracking-wider whitespace-nowrap"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.nav>

      {/* Main Content Area Wrapper */}
      <main className="flex-1 relative overflow-y-auto overflow-x-hidden flex flex-col bg-brand-bg">
        
        {/* Mobile Top Header */}
        <div className="sidebar-header-bar md:hidden flex-shrink-0 h-16 bg-brand-card flex items-center justify-between px-6 relative z-30">
          <span className="font-black text-slate-100 uppercase tracking-[0.2em] text-xs flex items-center gap-2">
            <span className="sidebar-logo-accent w-2 h-2 rounded-none animate-pulse" />
            Portal
          </span>
          <button 
            onClick={() => {
              setIsMobileOpen(true);
              setIsSidebarOpen(true);
            }}
            className="text-slate-400 hover:text-white transition-colors focus:outline-none cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
        
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

      </main>
    </div>
  );
}