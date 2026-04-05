import React from "react";
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
import { DashboardEntrance, AnimatedSection } from "@/components/dashboard/DashboardEntrance";

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
    <div className="space-y-8 pb-12 relative overflow-hidden min-h-screen">
      {/* Background Decoration */}
      <div className="absolute inset-0 grid-bg-subtle opacity-30 pointer-events-none -z-10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10 animate-float-slow" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] pointer-events-none -z-10 animate-float-delayed" />
      
      <DashboardEntrance />

      <div className="space-y-12 relative z-10">
        <div className="space-y-6">
          {configError && (
            <AnimatedSection delay={0.1}>
              <div className="p-6 rounded-3xl border border-warning/30 bg-warning/5 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse-glow shadow-2xl shadow-warning/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-warning/20 flex items-center justify-center text-warning flex-shrink-0">
                    <Settings size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Configuration Required</h3>
                    <p className="text-sm text-muted/80 max-w-md">Your Supabase environment variables are missing or invalid. Check your .env.local file to reconnect.</p>
                  </div>
                </div>
                <Link href="https://supabase.com/dashboard/project/lnckyrvxehzcjvyultkd/settings/api" target="_blank" className="w-full md:w-auto">
                   <Button className="w-full md:w-auto gap-2 bg-warning hover:bg-warning-dark shadow-lg shadow-warning/20 text-black">
                     <ExternalLink size={16} />
                     Get API Keys
                   </Button>
                </Link>
              </div>
            </AnimatedSection>
          )}

          {!configError && !productsTableExists && (
            <AnimatedSection delay={0.1}>
              <div className="p-6 rounded-3xl border border-danger/30 bg-danger/5 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse-glow shadow-2xl shadow-danger/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-danger/20 flex items-center justify-center text-danger flex-shrink-0">
                    <Zap size={24} fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Database Offline</h3>
                    <p className="text-sm text-muted/80 max-w-md">Your database infrastructure is not yet established. Run the SQL setup script to launch your store.</p>
                  </div>
                </div>
                <Link href="/dashboard/setup" className="w-full md:w-auto">
                   <Button variant="danger" className="w-full md:w-auto gap-2 bg-danger hover:bg-danger-dark shadow-lg shadow-danger/20">
                     <ArrowRight size={16} />
                     View Setup Script
                   </Button>
                </Link>
              </div>
            </AnimatedSection>
          )}

          <AnimatedSection delay={0.2}>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight leading-tight italic">
                    Welcome back, {profile?.store_name || "Store Owner"}!
                  </h1>
                <div className="p-2 rounded-xl bg-primary/10 text-primary animate-bounce-subtle hidden sm:block border border-primary/20">
                  <Sparkles size={24} />
                </div>
              </div>
              <p className="text-sm md:text-lg text-muted font-medium">
                Your affiliate empire is growing. Here's the latest intel.
              </p>
            </div>
          </AnimatedSection>
          
          <AnimatedSection delay={0.3}>
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              <CopyLinkButton username={profile?.username || ""} />
              <Link href={`/store/${profile?.username?.toLowerCase()}`} target="_blank" className="flex-1 md:flex-initial">
                <Button variant="secondary" className="w-full gap-2 bg-white/5 border-white/5 hover:bg-white/10 group h-12 px-6 text-xs md:text-sm font-bold rounded-2xl hover:glow-primary transition-all">
                  <ExternalLink className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  <span className="hidden sm:inline">Live Storefront</span>
                  <span className="sm:hidden">View</span>
                </Button>
              </Link>
              <Link href="/dashboard/add-product" className="w-full sm:w-auto flex-1 md:flex-initial">
                <Button className="w-full gap-2 shadow-xl shadow-primary/20 group h-12 px-8 text-xs md:text-sm font-black uppercase tracking-widest rounded-2xl hover-lift">
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                  Launch Unit
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatedSection delay={0.4}>
            <div className="perspective-1000 group h-full">
              <Card className="glass relative overflow-hidden group hover:glow-primary transition-all duration-500 border-white/5 bg-white/[0.02] h-full">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Package size={80} />
                </div>
                <div className="absolute top-[-20px] right-[-20px] w-40 h-40 icon-glow-primary rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/60">
                    Fleet Capacity
                  </CardTitle>
                  <div className="p-2 rounded-xl bg-primary/10 text-primary shadow-lg shadow-primary/20 border border-primary/20">
                    <Package className="w-4 h-4" />
                  </div>
                </CardHeader>
                <CardContent className="pt-6 relative z-10">
                  <div className="text-5xl font-black text-foreground tracking-tighter">{stats.totalProducts}</div>
                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/10 uppercase tracking-widest">Active Units</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.5}>
            <div className="perspective-1000 group h-full">
              <Card className="glass relative overflow-hidden group hover:glow-secondary transition-all duration-500 border-white/5 bg-white/[0.02] h-full">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <MousePointerClick size={80} />
                </div>
                <div className="absolute top-[-20px] right-[-20px] w-40 h-40 icon-glow-secondary rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/60">
                    Engagement Intel
                  </CardTitle>
                  <div className="p-2 rounded-xl bg-secondary/10 text-secondary shadow-lg shadow-secondary/20 border border-secondary/20">
                    <MousePointerClick className="w-4 h-4" />
                  </div>
                </CardHeader>
                <CardContent className="pt-6 relative z-10">
                  <div className="text-5xl font-black text-foreground tracking-tighter">{stats.totalClicks}</div>
                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-[10px] font-black text-secondary bg-secondary/10 px-2 py-0.5 rounded-full border border-secondary/10 uppercase tracking-widest">Inbound Links</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.6}>
            <div className="perspective-1000 group h-full">
              <Card className="glass relative overflow-hidden group hover:glow-accent transition-all duration-500 border-white/5 bg-white/[0.02] h-full">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <TrendingUp size={80} />
                </div>
                <div className="absolute top-[-20px] right-[-20px] w-40 h-40 icon-glow-accent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/60">
                    Revenue Stream
                  </CardTitle>
                  <div className="p-2 rounded-xl bg-accent/10 text-accent shadow-lg shadow-accent/20 border border-accent/20">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </CardHeader>
                <CardContent className="pt-6 relative z-10">
                  <div className="text-5xl font-black text-foreground tracking-tighter">$0.00</div>
                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-[10px] font-black text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/10 uppercase tracking-widest">Pending Payout</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AnimatedSection>
        </div>

        <AnimatedSection delay={0.7}>
          <Card className="glass overflow-hidden border-primary/20 bg-primary/[0.02] shadow-2xl shadow-primary/5 relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 animate-float-slow transition-transform group-hover:scale-110 duration-500">
                    <Globe size={40} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success border-4 border-[#09090F] animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                     <h3 className="text-2xl font-black text-white italic">Live Station Status</h3>
                     <span className="px-3 py-1 rounded-lg bg-success/20 text-success text-[10px] font-black uppercase tracking-[0.2em]">Online</span>
                  </div>
                  <p className="text-sm md:text-base text-muted/60 font-medium max-w-md">
                     Your storefront is currently active at your coordinates. All systems functional.
                  </p>
                </div>
              </div>
              
              <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-auto p-4 px-6 rounded-2xl bg-black/40 border border-white/5 font-mono text-base text-primary-light flex items-center justify-between gap-6 shadow-inner">
                   <span className="opacity-40">/store/</span>
                   <span className="font-black tracking-tight">{profile?.username || "loading..."}</span>
                </div>
                <Link href={`/store/${profile?.username}`} target="_blank" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto h-14 rounded-2xl bg-primary px-10 font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:bg-primary-light hover:scale-[1.02] active:scale-95 group">
                     <span>Enter Station</span>
                     <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatedSection delay={0.8}>
            <Card className="glass hover:border-white/10 transition-all duration-500 overflow-hidden group h-full">
              <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between p-6">
                <CardTitle className="text-xl font-black italic">Recent Hangar Activity</CardTitle>
                <Link href="/dashboard/products">
                  <Button variant="ghost" size="sm" className="text-xs text-primary-light hover:text-primary font-black uppercase tracking-widest">View Archives</Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {recentProducts.length === 0 ? (
                  <div className="text-sm text-muted text-center py-24 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-3xl bg-surface-light flex items-center justify-center opacity-50 border border-white/5 animate-pulse">
                      <Zap className="w-8 h-8" />
                    </div>
                    <p className="max-w-[240px] font-medium">No tactical data detected. Scale your operations to see results.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {recentProducts.map((product) => (
                      <div key={product.id} className="p-5 flex items-center justify-between group/item hover:bg-white/[0.03] transition-all cursor-pointer">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-xl bg-white overflow-hidden flex-shrink-0 relative border border-white/10 group-hover/item:scale-110 transition-transform">
                            {product.image_url ? (
                              <Image src={product.image_url} alt="" fill className="object-contain p-2" sizes="48px" />
                            ) : (
                              <Package className="w-full h-full p-3 text-muted/20" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-base font-black text-foreground line-clamp-1 group-hover/item:text-primary transition-colors">{product.title}</span>
                            <span className="text-[10px] text-muted uppercase font-black tracking-widest flex items-center gap-2">
                               <Globe size={10} /> {product.platform}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-black text-secondary-light tracking-tighter">{product.price || "N/A"}</div>
                          <div className="text-[10px] text-muted font-bold">{new Date(product.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection delay={0.9}>
            <Card className="glass hover:border-white/10 transition-all duration-500 h-full group">
              <CardHeader className="border-b border-white/5 p-6">
                <CardTitle className="text-xl font-black italic">Strategic Intelligence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-8 p-6">
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-start gap-5 hover:border-primary/20 transition-all group/tip cursor-default hover:bg-primary/[0.02]">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary group-hover/tip:scale-110 transition-transform border border-primary/20 shadow-lg shadow-primary/10">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-lg text-foreground mb-1">Expand Inventory</h4>
                    <p className="text-sm text-muted leading-relaxed font-medium">
                      Stations with <span className="text-primary-light font-bold">12+ units</span> see 300% more engagement. Add your new finds to scale.
                    </p>
                  </div>
                </div>
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-start gap-5 hover:border-secondary/20 transition-all group/tip cursor-default hover:bg-secondary/[0.02]">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center flex-shrink-0 text-secondary group-hover/tip:scale-110 transition-transform border border-secondary/20 shadow-lg shadow-secondary/10">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-lg text-foreground mb-1">Optimize Search</h4>
                    <p className="text-sm text-muted leading-relaxed font-medium">
                      Refine your <span className="text-secondary-light font-bold">AI-generated signals</span> with strategic keywords to boost intercept rates.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
