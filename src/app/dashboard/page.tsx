"use client";

import React, { useEffect, useState } from "react";
import { getUser, getProfile, UserProfile } from "@/lib/auth";
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
  Zap
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalClicks: 0,
  });
  const [loading, setLoading] = useState(true);
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

        const profile = await getProfile(user.id);
        setProfile(profile);

        // Fetch stats
        const [productsRes, clicksRes] = await Promise.all([
          supabase
            .from("products")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id),
          supabase
            .from("clicks")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id),
        ]);

        setStats({
          totalProducts: productsRes.count || 0,
          totalClicks: clicksRes.count || 0,
        });
      } catch (err) {
        console.error("Error loading dashboard:", err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse-glow" />
          <div className="relative animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full shadow-lg shadow-primary/20" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              Welcome back, {profile?.store_name || "Store Owner"}!
            </h1>
            <div className="p-1 rounded-md bg-primary/10 text-primary animate-bounce-subtle">
              <Sparkles size={16} />
            </div>
          </div>
          <p className="text-muted font-medium">
            Your affiliate empire is growing. Here's the latest intel.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/store/${profile?.username}`} target="_blank">
            <Button variant="secondary" className="gap-2 bg-white/5 border-white/5 hover:bg-white/10 group">
              <ExternalLink className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              View Live Store
            </Button>
          </Link>
          <Link href="/dashboard/add-product">
            <Button className="gap-2 shadow-lg shadow-primary/25 group">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              Add Product
            </Button>
          </Link>
        </div>
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
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-lg font-bold">Recent Intelligence</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-sm text-muted text-center py-20 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-surface-light flex items-center justify-center opacity-50">
                <Zap className="w-6 h-6" />
              </div>
              <p className="max-w-[200px]">No recent data detected. Scale your activity to see results.</p>
            </div>
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
