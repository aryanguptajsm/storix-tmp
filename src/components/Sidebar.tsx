"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { signOut } from "@/lib/auth";
import { toast } from "sonner";
import { ThemeToggle } from "./ui/ThemeToggle";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Manage Store", href: "/dashboard/store", icon: LayoutGrid },
  { label: "Products", href: "/dashboard/products", icon: Package },
  { label: "Earnings", href: "/dashboard/earnings", icon: DollarSign },
  { label: "Billing & Plans", href: "/dashboard/billing", icon: CreditCard },
  { label: "Account Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const [user, setUser] = React.useState<any>(null); // Still using any for Supabase User for now but will refine if possible
  const [profile, setProfile] = React.useState<any>(null);

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
    await signOut();
    toast.success("Signed out successfully");
    window.location.href = "/login";
  };

  const nav = (
    <div className="flex flex-col h-full">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black bg-gradient-to-r from-primary-light to-secondary bg-clip-text text-transparent tracking-tighter leading-none">
            Storix
          </span>
          <span className="text-[10px] text-muted/50 font-bold uppercase tracking-widest mt-0.5">Fleet Command</span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1.5 mt-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group ${
                isActive
                  ? "bg-primary/10 text-primary-light border border-primary/20 shadow-sm"
                  : "text-muted hover:text-foreground hover:bg-surface-light border border-transparent"
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-primary-light" : "text-muted group-hover:text-primary-light"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4 border-t border-border/50 bg-white/[0.02]">
        {user && (
          <div className="flex items-center gap-3 p-3 mb-4 rounded-xl bg-surface-light/50 border border-white/5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center text-xs font-bold text-primary-light border border-primary/10">
              {profile?.store_name?.[0].toUpperCase() || user.email?.[0].toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-foreground truncate">{profile?.store_name || user.email}</span>
              <span className="text-[10px] text-muted truncate">Commander</span>
            </div>
          </div>
        )}

        <div className="space-y-1">
          <ThemeToggle />
          {profile?.username && (
            <Link
              href={`/store/${profile.username}`}
              target="_blank"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted hover:text-foreground hover:bg-white/5 transition-all group"
            >
              <ExternalLink className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              View Live Store
            </Link>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-danger/70 hover:text-danger hover:bg-danger/10 w-full transition-all cursor-pointer group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Abandon Station
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-16 glass z-40 border-b border-white/5 flex items-center px-4">
        <button
          className="p-2 rounded-xl bg-surface-light border border-border text-foreground cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <span className="ml-4 font-black tracking-tighter text-lg bg-gradient-to-r from-primary-light to-secondary bg-clip-text text-transparent">Storix</span>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - Enhanced Responsive Transitions */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 lg:w-64 bg-surface border-r border-border transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
          mobileOpen ? "translate-x-0 shadow-2xl shadow-primary/20" : "-translate-x-full lg:translate-x-0 shadow-none"
        }`}
      >
        {nav}
      </aside>
    </>
  );
}
