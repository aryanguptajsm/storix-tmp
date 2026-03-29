"use client";

import React, { useEffect, useState } from "react";
import { getUser, getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { 
  Plus, 
  MousePointerClick, 
  Package, 
  TrendingUp,
  ExternalLink,
  Sparkles,
  Zap,
  ArrowRight,
  LayoutGrid,
  Activity,
  Copy,
  Check,
  Settings
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/Skeleton";
import { DashboardSkeleton } from "@/components/ui/DashboardSkeleton";

import { UserProfile, Product } from "@/lib/types";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [configError, setConfigError] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ productsTable: boolean }>({ productsTable: true });
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalClicks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  const router = useRouter();

  useEffect(() => {
    async function loadDashboard() {
      const supabase = createClient();
      try {
        const user = await getUser();
        if (!user) {
          router.push("/login");
          return;
        }
        setUser(user);

        // Check if database is initialized
        const { error: probeError } = await supabase
          .from("products")
          .select("id")
          .limit(1);
        
        if (probeError && probeError.code === "PGRST205") {
          setDbStatus({ productsTable: false });
          console.error("DATABASE_OFFLINE: 'products' table not found in public schema.");
        } else {
          setDbStatus({ productsTable: true });
        }

        let profile = await getProfile(user.id);
        
        // Auto-initialize profile if trigger didn't run or user existed before trigger
        if (!profile) {
          console.log("Profile missing, initializing...");
          const { data: newProfile, error: initError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              username: user.email?.split("@")[0].toLowerCase() + Math.floor(1000 + Math.random() * 9000).toString(),
              store_name: (user.email?.split("@")[0] || "My") + "'s Store",
            })
            .select()
            .single();
          
          if (!initError) profile = newProfile;
        }
        
        // Set profile
        setProfile(profile);

        // Fetch stats and recent products
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
           console.error("Supabase Query Error (likely invalid key):", productsRes.error || clicksRes.error);
           setConfigError(true);
        }

        setStats({
          totalProducts: productsRes.count || 0,
          totalClicks: clicksRes.count || 0,
        });
        setRecentProducts((recentRes.data as Product[]) || []);
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setConfigError(true);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }

    }

    loadDashboard();
  }, [router]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
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

      {!configError && !dbStatus.productsTable && (

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

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight leading-tight">
              Welcome back, {profile?.store_name || "Store Owner"}!
            </h1>
            <div className="p-1 rounded-md bg-primary/10 text-primary animate-bounce-subtle hidden sm:block">
              <Sparkles size={16} />
            </div>
          </div>
          <p className="text-sm md:text-base text-muted font-medium">
            Your affiliate empire is growing. Here's the latest intel.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Button 
            variant="secondary" 
            className="flex-1 md:flex-initial gap-2 bg-white/5 border-white/5 hover:bg-white/10 group h-11 px-4 text-xs md:text-sm font-bold"
            onClick={() => {
              const url = `${window.location.origin}/store/${profile?.username}`;
              navigator.clipboard.writeText(url);
              toast.success("Store link copied to clipboard!");
            }}
          >
            <Copy size={16} />
            <span className="hidden sm:inline">Copy Link</span>
          </Button>
          <Link href={`/store/${profile?.username?.toLowerCase()}`} target="_blank" className="flex-1 md:flex-initial">
            <Button variant="secondary" className="w-full gap-2 bg-white/5 border-white/5 hover:bg-white/10 group h-11 px-4 text-xs md:text-sm font-bold">
              <ExternalLink className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">Live Store</span>
              <span className="sm:hidden">View</span>
            </Button>
          </Link>
          <Link href="/dashboard/add-product" className="w-full sm:w-auto flex-1 md:flex-initial">
            <Button className="w-full gap-2 shadow-lg shadow-primary/25 group h-11 px-6 text-xs md:text-sm font-black uppercase tracking-wider">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              Add Product
            </Button>
          </Link>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="glass relative overflow-hidden group hover:border-primary/20 transition-all duration-500">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Package size={80} />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted/80">
              Total Products
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Package className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-black text-foreground">{stats.totalProducts}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">+12%</span>
              <span className="text-[10px] text-muted font-medium uppercase tracking-tighter">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass relative overflow-hidden group hover:border-secondary/20 transition-all duration-500">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <MousePointerClick size={80} />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted/80">
              Total Clicks
            </CardTitle>
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-black text-foreground">{stats.totalClicks}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">+5.2%</span>
              <span className="text-[10px] text-muted font-medium uppercase tracking-tighter">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass relative overflow-hidden group hover:border-accent/20 transition-all duration-500">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp size={80} />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted/80">
              Est. Earnings
            </CardTitle>
            <div className="p-2 rounded-lg bg-accent/10 text-accent">
              <TrendingUp className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-black text-foreground">$0.00</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-bold text-muted bg-surface-light px-2 py-0.5 rounded-full">Pending</span>
              <span className="text-[10px] text-muted font-medium uppercase tracking-tighter whitespace-nowrap">Verification in progress</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                          <img src={product.image_url} alt="" className="object-contain w-full h-full p-1" />
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

      <style jsx global>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
