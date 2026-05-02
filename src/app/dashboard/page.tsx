import React, { Suspense } from "react";
import { createClient } from "@/lib/supabase-server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Plus, 
  MousePointerClick, 
  Package, 
  TrendingUp,
  ExternalLink,
  Sparkles,
  Zap,
  ArrowRight,
  Settings,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CopyLinkButton } from "@/components/dashboard/CopyLinkButton";
import Image from "next/image";
import { 
  DashboardEntrance, 
  ScrollReveal, 
  StaggerReveal, 
} from "@/components/dashboard/DashboardClientWrapper";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (!user || userError) {
    redirect("/login");
  }

  // Check if database is initialized
  const { error: probeError } = await supabase
    .from("products")
    .select("id")
    .limit(1);

  let configError = false;
  let productsTableExists = true;

  if (probeError && probeError.code === "PGRST205") {
    productsTableExists = false;
  } else if (probeError && probeError.message.includes("Invalid API key")) {
    configError = true;
  }

  let profile = null;
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  profile = existingProfile;

  // Auto-initialize profile
  if (!profile && !configError && productsTableExists) {
    const { data: newProfile, error: initError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        username: (user.email?.split("@")[0].toLowerCase() || "user") + "_" + user.id.slice(0, 5),
        store_name: (user.email?.split("@")[0] || "My") + "'s Store",
      })
      .select()
      .single();
    
    if (!initError) profile = newProfile;
  }

  // Fetch stats and recent products in parallel
  const [productsRes, clicksRes, recentRes] = await Promise.all([
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("clicks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)
  ]);

  if (productsRes.error || clicksRes.error) {
     if (productsRes.error?.message.includes("key") || clicksRes.error?.message.includes("key")) {
       configError = true;
     }
  }

  const stats = {
    totalProducts: productsRes.count || 0,
    totalClicks: clicksRes.count || 0,
  };
  const recentProducts = recentRes.data || [];

  return (
    <div className="space-y-6 pb-20 relative min-h-screen">
      <div className="fixed inset-0 pointer-events-none -z-20 bg-black/60" />
      
      <DashboardEntrance />

      <div className="max-w-[1400px] mx-auto space-y-8 relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {configError && (
            <ScrollReveal delay={0.1}>
              <div className="p-6 rounded-2xl border border-warning/30 bg-warning/5 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-warning/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-warning/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center text-warning shadow-sm border border-warning/20">
                     <Settings size={22} className="animate-spin-slow" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Configuration Required</h3>
                    <p className="text-muted/80 text-sm max-w-md font-medium mt-0.5">Your database connection is disconnected. Re-establish connection via environment variable mapping.</p>
                  </div>
                </div>
                <Link href="https://supabase.com/dashboard/project/lnckyrvxehzcjvyultkd/settings/api" target="_blank" className="w-full md:w-auto relative z-10">
                   <Button className="w-full md:w-auto h-11 px-6 gap-2 bg-warning hover:bg-warning-dark text-black font-bold uppercase tracking-wider rounded-xl">
                     <ExternalLink size={16} />
                     Access API Console
                   </Button>
                </Link>
              </div>
            </ScrollReveal>
          )}

          {!configError && !productsTableExists && (
            <ScrollReveal delay={0.1}>
              <div className="p-6 rounded-2xl border border-danger/30 bg-danger/5 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-danger/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-danger/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-danger/20 flex items-center justify-center text-danger shadow-sm border border-danger/20">
                    <Zap size={22} fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">System Offline</h3>
                    <p className="text-muted/80 text-sm max-w-md font-medium mt-0.5">Your merchant grid database has not been initialized. Execute the SQL protocol to begin.</p>
                  </div>
                </div>
                <Link href="/dashboard/setup" className="w-full md:w-auto relative z-10">
                   <Button variant="danger" className="w-full md:w-auto h-11 px-6 gap-2 bg-danger font-bold uppercase tracking-wider rounded-xl transition-all">
                     <ArrowRight size={16} />
                     Run Setup Script
                   </Button>
                </Link>
              </div>
            </ScrollReveal>
          )}

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 animate-fade-in group/header">
            <div className="space-y-3 relative">
              <div className="absolute -left-4 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary/50 to-transparent opacity-0 group-hover/header:opacity-100 transition-opacity" />
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-tight">
                Welcome back, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-secondary block mt-2 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                   {profile?.store_name || "Merchant"}
                </span>
              </h1>
              <p className="text-base text-white/40 font-bold uppercase tracking-[0.2em]">
                System Status: <span className="text-emerald-500">Operational</span> // Performance Overview
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto mt-4 lg:mt-0">
              <div className="flex-1 sm:flex-none">
                <CopyLinkButton username={profile?.username || ""} />
              </div>
              <Link href={`/store/${profile?.username?.toLowerCase()}`} target="_blank" className="flex-1 sm:flex-none">
                <Button variant="secondary" className="w-full bg-white/[0.03] border-white/5 h-12 px-6 text-[11px] font-black uppercase tracking-widest hover:bg-white/[0.08] transition-all">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Live Store
                </Button>
              </Link>
              <Link href="/dashboard/add-product" className="w-full sm:w-auto flex-1 sm:flex-none">
                <Button className="w-full h-12 px-8 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <Card variant="glass" className="relative overflow-hidden group hover:border-primary/30 transition-all duration-500 h-full border-white/[0.05] p-6 lg:p-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-0 pt-0">
              <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30">
                Inventory
              </CardTitle>
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary group-hover:scale-110 transition-transform">
                <Package size={18} />
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0 pt-4 relative z-10">
              <div className="text-4xl lg:text-5xl font-black text-white tracking-tighter">
                {stats.totalProducts}
              </div>
              <div className="flex items-center gap-2 mt-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Active Units</span>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="relative overflow-hidden group hover:border-secondary/30 transition-all duration-500 h-full border-white/[0.05] p-6 lg:p-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-secondary/10 transition-colors" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-0 pt-0">
              <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30">
                Engagement
              </CardTitle>
              <div className="p-2 rounded-lg bg-secondary/10 border border-secondary/20 text-secondary group-hover:scale-110 transition-transform">
                <MousePointerClick size={18} />
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0 pt-4 relative z-10">
              <div className="text-4xl lg:text-5xl font-black text-white tracking-tighter">
                {stats.totalClicks}
              </div>
              <div className="flex items-center gap-2 mt-2">
                 <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total Hits</span>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="relative overflow-hidden group hover:border-accent/30 transition-all duration-500 h-full border-white/[0.05] p-6 lg:p-8 sm:col-span-2 lg:col-span-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-accent/10 transition-colors" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-0 pt-0">
              <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30">
                Revenue
              </CardTitle>
              <div className="p-2 rounded-lg bg-accent/10 border border-accent/20 text-accent group-hover:scale-110 transition-transform">
                <TrendingUp size={18} />
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0 pt-4 relative z-10">
              <div className="text-4xl lg:text-5xl font-black text-white tracking-tighter">
                $0.00
              </div>
              <div className="flex items-center gap-2 mt-2">
                 <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Est. Payout</span>
              </div>
            </CardContent>
          </Card>
        </StaggerReveal>

        <Card variant="premium" className="relative group transition-all duration-500 overflow-hidden border-white/[0.05] p-1">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
          
          <div className="bg-black/40 backdrop-blur-xl rounded-[2.8rem] p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-16 h-16 rounded-2xl bg-black border border-primary/20 flex items-center justify-center text-primary shadow-2xl relative overflow-hidden group-hover:rotate-3 transition-transform duration-500">
                   <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                   <Globe size={28} className="relative z-10 animate-pulse-slow" />
                </div>
              </div>
              <div className="space-y-1.5 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <h3 className="text-2xl font-black text-white tracking-tighter italic">Live Store</h3>
                    <div className="flex justify-center md:justify-start">
                       <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-[0.2em] animate-pulse">Broadcast Active</span>
                    </div>
                </div>
                <p className="text-[11px] text-white/40 font-bold uppercase tracking-widest leading-relaxed max-w-sm">
                   Your decentralized storefront is synced. Deploy traffic to track global conversions.
                </p>
              </div>
            </div>
            
            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full lg:min-w-[240px] py-3.5 px-5 rounded-2xl bg-black/60 border border-white/5 font-mono text-xs text-primary flex items-center justify-between gap-6 group/URL">
                 <span className="opacity-30 select-none">/store/</span>
                 <span className="font-black group-hover:text-white transition-colors">{profile?.username || "..."}</span>
              </div>
              <Link href={`/store/${profile?.username}`} target="_blank" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-12 rounded-2xl px-8 text-[11px] uppercase tracking-[0.2em] font-black group-hover:glow-primary transition-all">
                   Deploy Portal
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card variant="glass" className="lg:col-span-3 hover:border-white/10 transition-all duration-500 overflow-hidden group h-full border-white/[0.05] p-0">
            <CardHeader className="border-b border-white/[0.03] flex flex-row items-center justify-between py-6 px-8 bg-white/[0.01]">
              <div className="flex items-center gap-3">
                 <Package className="w-4 h-4 text-primary" />
                 <CardTitle className="text-[14px] font-black tracking-[0.1em] uppercase text-white/80">Inventory Log</CardTitle>
              </div>
              <Link href="/dashboard/products">
                <Button variant="ghost" size="sm" className="text-[10px] text-primary-light hover:text-primary font-black uppercase tracking-widest border border-white/5 bg-white/[0.02] rounded-xl px-4 h-9 py-0">Archive</Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {recentProducts.length === 0 ? (
                <div className="text-xs text-muted text-center py-16 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.02] flex items-center justify-center opacity-50 border border-white/5 animate-pulse">
                    <Package className="w-8 h-8 text-white/20" />
                  </div>
                  <p className="max-w-[200px] font-bold text-white/30 text-[12px] uppercase tracking-widest leading-relaxed">No active protocols detected. Initialize your first product.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.03]">
                  {recentProducts.map((product) => (
                    <div key={product.id} className="px-8 py-5 flex items-center justify-between group/item hover:bg-white/[0.02] transition-all cursor-pointer relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-primary scale-y-0 group-hover/item:scale-y-100 transition-transform origin-top duration-500" />
                      <div className="flex items-center gap-5 relative z-10 overflow-hidden">
                        <div className="w-12 h-12 rounded-xl bg-white overflow-hidden flex-shrink-0 relative border border-white/10 group-hover/item:scale-110 group-hover/item:rotate-2 transition-all duration-500 shadow-xl p-1.5">
                          {product.image_url ? (
                            <Image src={product.image_url} alt="" fill className="object-contain p-1" sizes="48px" />
                          ) : (
                            <Package className="w-full h-full p-2 text-muted/20" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[15px] font-black text-white truncate transition-colors tracking-tight group-hover/item:text-primary leading-tight">{product.title}</span>
                          <div className="flex items-center gap-2 mt-1.5">
                             <div className="px-1.5 py-0.5 rounded-[4px] bg-white/[0.03] border border-white/5 text-[8px] font-black text-white/40 uppercase tracking-widest">{product.platform}</div>
                             <span className="text-[8px] text-white/20 uppercase font-black tracking-widest">ID: {product.id.slice(0, 8)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right relative z-10 pl-4 flex-shrink-0">
                        <div className="text-[16px] font-black text-secondary tracking-tighter italic leading-none">{product.price || "FREE"}</div>
                        <div className="text-[9px] text-white/20 font-black uppercase tracking-widest mt-2">{new Date(product.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card variant="glass" className="lg:col-span-2 hover:border-white/10 transition-all duration-500 h-full group border-white/[0.05] p-0">
            <CardHeader className="border-b border-white/[0.03] py-6 px-8 bg-white/[0.01]">
              <div className="flex items-center gap-3">
                 <Sparkles className="w-4 h-4 text-secondary" />
                 <CardTitle className="text-[14px] font-black tracking-[0.1em] uppercase text-white/80">Strategy Board</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-8">
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-4 hover:border-primary/20 transition-all group/tip cursor-default hover:bg-primary/[0.02] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/tip:opacity-100 transition-opacity" />
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary group-hover/tip:scale-110 transition-transform border border-primary/20 shadow-lg">
                  <Plus className="w-6 h-6" />
                </div>
                <div className="relative z-10">
                  <h4 className="font-black text-[14px] text-white mb-1 italic">Growth Protocol</h4>
                  <p className="text-[11px] text-white/40 leading-relaxed font-bold uppercase tracking-wider">
                    Stores exceeding <span className="text-primary font-black">12+ assets</span> demonstrate 400% higher conversions.
                  </p>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-4 hover:border-secondary/20 transition-all group/tip cursor-default hover:bg-secondary/[0.02] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover/tip:opacity-100 transition-opacity" />
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0 text-secondary group-hover/tip:scale-110 transition-transform border border-secondary/20 shadow-lg">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="relative z-10">
                  <h4 className="font-black text-[14px] text-white mb-1 italic">Semantic Sync</h4>
                  <p className="text-[11px] text-white/40 leading-relaxed font-bold uppercase tracking-wider">
                    Utilize <span className="text-secondary font-black">AI synthesis</span> to optimize titles for neural search.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
