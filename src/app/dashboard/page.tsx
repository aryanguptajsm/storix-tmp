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
import { DashboardEntrance } from "@/components/dashboard/DashboardEntrance";

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
        store_name: (user.email?.split("@")[0] || "My") + "&apos;s Store",
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

      <div className="space-y-6 relative z-10">
        {configError && (
        <div className="p-6 rounded-3xl border border-warning/30 bg-warning/5 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse-glow shadow-2xl shadow-warning/10">
          <div className="flex items-center gap-4 text-center md:text-left">
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
      )}

      {!configError && !productsTableExists && (
        <div className="p-6 rounded-3xl border border-danger/30 bg-danger/5 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse-glow shadow-2xl shadow-danger/10">
          <div className="flex items-center gap-4 text-center md:text-left">
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
      )}

      <div className="space-y-1 animate-stagger-fade stagger-1">
        <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight leading-tight">
              Welcome back, {profile?.store_name || "Store Owner"}!
            </h1>
          <div className="p-1 rounded-md bg-primary/10 text-primary animate-bounce-subtle hidden sm:block">
            <Sparkles size={16} />
          </div>
        </div>
        <p className="text-sm md:text-base text-muted font-medium">
          Your affiliate empire is growing. Here&apos;s the latest intel.
        </p>
      </div>
      
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto animate-stagger-fade stagger-2">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-stagger-fade stagger-3">
        {/* Total Products Card */}
        <div className="perspective-1000 group">
          <Card className="glass relative overflow-hidden group hover-tilt preserve-3d transition-all duration-500 border-white/5 bg-white/[0.02]">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Package size={80} />
            </div>
            {/* Icon Glow */}
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
              <div className="text-4xl font-black text-foreground tracking-tighter">{stats.totalProducts}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/10 uppercase tracking-widest">Active Units</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Total Clicks Card */}
        <div className="perspective-1000 group">
          <Card className="glass relative overflow-hidden group hover-tilt preserve-3d transition-all duration-500 border-white/5 bg-white/[0.02]">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <MousePointerClick size={80} />
            </div>
            {/* Icon Glow */}
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
              <div className="text-4xl font-black text-foreground tracking-tighter">{stats.totalClicks}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-black text-secondary bg-secondary/10 px-2 py-0.5 rounded-full border border-secondary/10 uppercase tracking-widest">Inbound Links</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Card */}
        <div className="perspective-1000 group">
          <Card className="glass relative overflow-hidden group hover-tilt preserve-3d transition-all duration-500 border-white/5 bg-white/[0.02]">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp size={80} />
            </div>
            {/* Icon Glow */}
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
              <div className="text-4xl font-black text-foreground tracking-tighter">$0.00</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-black text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/10 uppercase tracking-widest">Pending Payout</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── NEW: Deployment Status Monitor ─── */}
      <div className="animate-stagger-fade stagger-4">
        <Card className="glass overflow-hidden border-primary/20 bg-primary/[0.02] shadow-2xl shadow-primary/5">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 animate-float-slow">
                  <Globe size={32} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success border-4 border-[#09090F] animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                   <h3 className="text-xl font-black text-white">Live Deployment Status</h3>
                   <span className="px-2 py-0.5 rounded-md bg-success/20 text-success text-[10px] font-black uppercase tracking-widest">Online</span>
                </div>
                <p className="text-sm text-muted/60 font-medium max-w-md">
                   Your storefront is currently active at your coordinates. All systems functional.
                </p>
              </div>
            </div>
            
            <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-auto p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-sm text-primary-light flex items-center justify-between gap-4">
                 <span className="opacity-40">/store/</span>
                 <span className="font-black tracking-tight">{profile?.username || "loading..."}</span>
              </div>
              <Link href={`/store/${profile?.username}`} target="_blank" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-12 rounded-xl bg-primary px-8 font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover-shine">
                   View Live Station
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-stagger-fade stagger-5">
        <Card className="glass hover:border-white/10 transition-colors">
          <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Recent Hangar Activity</CardTitle>
            <Link href="/dashboard/products">
              <Button variant="ghost" size="sm" className="text-xs text-primary-light hover:text-primary">View All</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentProducts.length === 0 ? (
              <div className="text-sm text-muted text-center py-20 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-surface-light flex items-center justify-center opacity-50">
                  <Zap className="w-6 h-6" />
                </div>
                <p className="max-w-[200px]">No recent data detected. Scale your activity to see results.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentProducts.map((product) => (
                  <div key={product.id} className="p-4 flex items-center justify-between group hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-white overflow-hidden flex-shrink-0 relative">
                        {product.image_url ? (
                          <Image src={product.image_url} alt="" fill className="object-contain p-1" sizes="40px" />
                        ) : (
                          <Package className="w-full h-full p-2 text-muted/20" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{product.title}</span>
                        <span className="text-[10px] text-muted uppercase font-black tracking-widest">{product.platform}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-secondary-light">{product.price || "N/A"}</div>
                      <div className="text-[10px] text-muted">{new Date(product.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass hover:border-white/10 transition-colors">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-lg font-bold">Strategic Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-4 hover:border-primary/20 transition-colors group cursor-default">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Expand Inventory</h4>
                <p className="text-sm text-muted mt-1 leading-relaxed">
                  Stores with <span className="text-primary-light font-bold">10+ products</span> see 3x more engagement. Add your favorite finds today.
                </p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-4 hover:border-secondary/20 transition-colors group cursor-default">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0 text-secondary group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Optimize for Search</h4>
                <p className="text-sm text-muted mt-1 leading-relaxed">
                  Refine your <span className="text-secondary-light font-bold">AI-generated titles</span> with high-performance keywords to boost discovery.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
