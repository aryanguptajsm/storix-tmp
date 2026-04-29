"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Settings,
  DollarSign,
  ExternalLink,
  LogOut,
  Sparkles,
  Menu,
  X,
  CreditCard,
  LayoutGrid,
  Layers,
  ChevronRight,
} from "lucide-react";
import { signOut } from "@/lib/auth";
import { toast } from "sonner";
import { ThemeToggle } from "./ui/ThemeToggle";

const navSections = [
  {
    title: "General",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Storefront", href: "/dashboard/store", icon: LayoutGrid },
      { label: "Products", href: "/dashboard/products", icon: Package },
    ]
  },
  {
    title: "Financials",
    items: [
      { label: "Earnings", href: "/dashboard/earnings", icon: DollarSign },
      { label: "Global Bulk", href: "/dashboard/bulk", icon: Layers, tier: "business" },
      { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
    ]
  },
  {
    title: "Configuration",
    items: [
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [user, setUser] = React.useState<any>(null); // Keeping any for user to avoid complex import for now if it's already there, but fixing profile
  const [profile, setProfile] = React.useState<import("@/lib/auth").UserProfile | null>(null);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  React.useEffect(() => {
    import("@/lib/auth").then(({ getUser, getProfile }) => {
      getUser().then((u) => {
        setUser(u);
        if (u) {
          getProfile(u.id).then(setProfile);
        }
      });
    });
  }, []);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      toast.success("Signed out successfully");
      window.location.href = "/login";
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
      setIsLoggingOut(false);
    }
  };

  const nav = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Brand Header */}
      <div className="p-8 pb-6 flex items-center gap-4">
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-primary to-secondary rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
          <div className="relative w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center shadow-xl shadow-primary/20 border border-white/20">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-black tracking-tighter leading-none bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Storix
          </span>
          <span className="text-[10px] text-primary/60 font-black uppercase tracking-[0.3em] mt-1">Admin Node</span>
        </div>
      </div>

      {/* Nav Sections */}
      <div className="flex-1 px-4 space-y-8 overflow-y-auto no-scrollbar py-4">
        {navSections.map((section) => (
          <div key={section.title}>
            <h4 className="px-4 text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-4">
              {section.title}
            </h4>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const isLocked = item.tier === "business" && profile?.plan !== "business";
                const isPro = profile?.plan && profile?.plan !== "free";

                if (item.tier === "business" && !isPro) return null;

                return (
                  <Link
                    key={item.href}
                    href={isLocked ? "/dashboard/billing" : item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`relative flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-500 group ${
                      isActive
                        ? "text-white"
                        : "text-white/40 hover:text-white hover:bg-white/[0.03]"
                    }`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="active-pill"
                        className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-2xl z-0"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    
                    <div className="relative z-10 flex items-center gap-3">
                      <div className={`transition-all duration-500 ${isActive ? "text-primary scale-110 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "group-hover:text-white"}`}>
                        <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                      <span className="tracking-tight">{item.label}</span>
                    </div>

                    {isLocked ? (
                      <div className="relative z-10 p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <X size={12} />
                      </div>
                    ) : (
                      isActive && <ChevronRight size={14} className="relative z-10 text-primary/40" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer Widget */}
      <div className="p-4 mt-auto">
        <div className="glass-premium rounded-[2rem] p-4 border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          
          {user && (
            <div className="flex items-center gap-3 mb-4 p-2">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-xl gradient-accent p-[1px]">
                  <div className="w-full h-full rounded-[11px] bg-black flex items-center justify-center text-sm font-black text-white">
                    {profile?.store_name?.[0].toUpperCase() || user.email?.[0].toUpperCase()}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-black rounded-full shadow-lg" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-black text-white truncate">{profile?.store_name || user.email}</span>
                <span className="text-[9px] text-primary font-black uppercase tracking-widest">{profile?.plan || 'Free'} Tier</span>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <ThemeToggle />
            {profile?.username && (
              <Link
                href={`/store/${profile.username}`}
                target="_blank"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all group/link"
              >
                <ExternalLink size={14} className="group-hover/link:rotate-12 transition-transform" />
                Live Node
              </Link>
            )}
            <button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-red-400/60 hover:text-red-400 hover:bg-red-400/10 w-full transition-all group/out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogOut size={14} className="group-hover/out:-translate-x-1 transition-transform" />
              )}
              {isLoggingOut ? "Terminating..." : "Terminate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header Architecture */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-24 z-[100] px-6 flex items-center justify-between border-b border-white/[0.03] overflow-hidden">
        {/* Superior Glass Layer */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl z-[-1]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent z-[-1]" />
        <div className="absolute -top-[50%] -left-[10%] w-[40%] h-[100%] bg-primary/10 blur-[80px] z-[-1] animate-pulse" />
        
        <div className="flex items-center gap-4">
           <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-30 group-hover:opacity-60 transition-opacity" />
              <div className="relative w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg border border-white/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
           </div>
           <div className="flex flex-col">
              <span className="font-black text-2xl tracking-tighter text-white leading-none">Storix</span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60 mt-1">Admin Node</span>
           </div>
        </div>
        <button
          className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white active:scale-90 transition-all cursor-pointer relative group overflow-hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
          {mobileOpen ? <X size={24} className="relative z-10" /> : <Menu size={24} className="relative z-10" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/90 backdrop-blur-md z-[110]"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Architecture */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-[120] h-full lg:h-screen w-[300px] lg:w-[320px] transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-full lg:m-4 lg:my-6 lg:rounded-[3rem] bg-[#0A0A0E] border-r lg:border border-white/5 shadow-2xl relative overflow-hidden">
           <div className="absolute inset-0 mesh-primary opacity-20" />
           <div className="relative h-full">
              {nav}
           </div>
        </div>
      </aside>
    </>
  );
}

